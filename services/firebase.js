// services/firebase.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let db = null;

try {
  const serviceAccountPath = path.join(__dirname, '..', 'firebase-credentials.json');
  
  if (process.env.FIREBASE_CREDENTIALS) {
    // 1. Check for Environment Variable first (For Render.com / Cloud Deployments)
    const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized using FIREBASE_CREDENTIALS environment variable.");
    db = admin.firestore();
  } else if (fs.existsSync(serviceAccountPath)) {
    // 2. Check for local file (For Local Development)
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized using firebase-credentials.json");
    db = admin.firestore();
  } else {
    console.warn("⚠️ Firebase Admin skipped: Neither FIREBASE_CREDENTIALS env var nor 'firebase-credentials.json' found.");
  }
} catch (error) {
  console.error("Firebase Admin initialization failed:", error.message);
}

module.exports = { admin, db };
