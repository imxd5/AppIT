const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// Priority: use GOOGLE_APPLICATION_CREDENTIALS env var (recommended),
// otherwise try to load config/serviceAccountKey.json if present.
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp();
    console.log('Firebase Admin initialized using GOOGLE_APPLICATION_CREDENTIALS');
  } else {
    // try local service account file
    const keyPath = path.join(__dirname, 'serviceAccountKey.json');
    try {
      const serviceAccount = require(keyPath);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log('Firebase Admin initialized using config/serviceAccountKey.json');
    } catch (e) {
      // fallback to default (will work on GCP environments with ADC)
      admin.initializeApp();
      console.log('Firebase Admin initialized with default credentials');
    }
  }
} catch (err) {
  console.error('Firebase Admin init error:', err.message);
  throw err;
}

module.exports = admin;
