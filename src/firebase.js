import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push } from "firebase/database";

const firebaseConfig = {

  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: "G-HW4KPRMSFK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export async function saveLocation(locationData) {
  try {
    const locationsRef = ref(db, 'locations'); // Path to 'locations' node
    const newLocationRef = push(locationsRef); // Create a unique key under 'locations'
    await set(newLocationRef, locationData) // Write locationData under the unique key
      .then(() => console.log("Location data written successfully to /locations!"))
      .catch((error) => console.error("Error INSIDE set():", error));

    console.log("saveLocation function completed");

  } catch (error) {
    console.error("Error saving location (outer catch):", error);
    throw error;
  }
}