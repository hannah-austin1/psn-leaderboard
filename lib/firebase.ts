import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let db: FirebaseFirestore.Firestore;

if (!getApps().length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
  );
  initializeApp({
    credential: cert(serviceAccount),
  });
  db = getFirestore();
} else {
  db = getFirestore();
}

export { db };
