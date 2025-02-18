import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push } from "firebase/database";

const firebaseConfig = {

  apiKey: "AIzaSyA7xdcHY8yKEayYf1erqr33UK9wfZep6LE",
  authDomain: "car-location-app-e916d.firebaseapp.com",
  databaseURL: "https://car-location-app-e916d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "car-location-app-e916d",
  storageBucket: "car-location-app-e916d.firebasestorage.app",
  messagingSenderId: "807482328707",
  appId: "1:807482328707:web:26659438cb52f3a0cafdb6",
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