const bcrypt = require('bcrypt');
const crypto = require('crypto');
const admin = require('../config/firestore');

const db = admin.firestore();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function findUserByEmail(email) {
  const q = db.collection('users').where('email', '==', email).limit(1);
  const snap = await q.get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function findUserByUsername(username) {
  const q = db.collection('users').where('username', '==', username).limit(1);
  const snap = await q.get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบ: username, email, password' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' });
    }

    const existingByEmail = await findUserByEmail(email);
    if (existingByEmail) return res.status(400).json({ success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' });

    const existingByUsername = await findUserByUsername(username);
    if (existingByUsername) return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });

    const hashed = await bcrypt.hash(password, 10);

    const userRef = await db.collection('users').add({
      email,
      username,
      password: hashed,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(201).json({ success: true, message: 'สมัครสมาชิกสำเร็จ', data: { id: userRef.id, email, username } });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'กรุณาระบุ email และ password' });

    // Try by email first
    let user = await findUserByEmail(email);
    if (!user) user = await findUserByUsername(email);
    if (!user) return res.status(400).json({ success: false, message: 'ไม่พบผู้ใช้งาน' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });

    const token = crypto.randomBytes(24).toString('hex');
    return res.status(200).json({ success: true, message: 'เข้าสู่ระบบสำเร็จ', data: { id: user.id, email: user.email, username: user.username, token } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
}

module.exports = { register, login };
