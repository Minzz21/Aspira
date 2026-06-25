// Karena file dijalankan langsung dari komputer (file:///), 
// kita menggunakan Firebase Compat SDK agar tidak terblokir oleh aturan keamanan Browser (CORS).

const firebaseConfig = {
  apiKey: "AIzaSyBHK74psilDmhIrgyyU5jF8iZ_J6WjUk5I",
  authDomain: "aspira-8e3be.firebaseapp.com",
  projectId: "aspira-8e3be",
  storageBucket: "aspira-8e3be.firebasestorage.app",
  messagingSenderId: "139686612389",
  appId: "1:139686612389:web:f9aa37e8acb2b7f10cec4c",
  measurementId: "G-MDLYM09SC7"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
