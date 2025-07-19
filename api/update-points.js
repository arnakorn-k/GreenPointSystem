import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";

const firebaseConfig = {
  // ...ใส่ config Firebase ของคุณ...
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getDatabase();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }
  try {
    const { userId, points, note } = req.body;
    if (!userId || typeof points !== "number" || !note) {
      res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
      return;
    }
    // อ่านแต้มเดิม
    const pointsRef = ref(db, "users/" + userId + "/points");
    const snap = await get(pointsRef);
    const oldPoints = snap.exists() ? snap.val() : 0;
    // อัปเดตแต้ม
    await set(pointsRef, oldPoints + points);
    // เพิ่มประวัติ
    const historyRef = ref(db, "users/" + userId + "/points_history/" + Date.now());
    await set(historyRef, {
      change: points,
      note,
      timestamp: Date.now()
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}