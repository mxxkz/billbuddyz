import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAbbKJck6YjxKhKxBG-e-8pJOQ92ZvEiRo",
  authDomain: "billbuddyz.firebaseapp.com",
  projectId: "billbuddyz",
  storageBucket: "billbuddyz.appspot.com",
  messagingSenderId: "137760953263",
  appId: "1:137760953263:web:95e4da1c9ba6b0e852555a",
  measurementId: "G-PYLGPL2KNB"
}

const app = initializeApp(firebaseConfig)
export const storage = getStorage(app)
