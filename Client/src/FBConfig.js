// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue,child, set,get,onChildAdded, onChildChanged  } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyCnXRRuwIxGjdrn0EHtJ_2feGXfgdJNRwc",
  authDomain: "fooddo-orders.firebaseapp.com",
  databaseURL: "https://fooddo-orders-default-rtdb.firebaseio.com",
  projectId: "fooddo-orders",
  storageBucket: "fooddo-orders.appspot.com",
  messagingSenderId: "366394407396",
  appId: "1:366394407396:web:498b3ac2211b1b30eb6ff1",
  measurementId: "G-VVP5HH60HB"
};
const app = initializeApp(firebaseConfig);
var db = getDatabase(app);
export default  {db,ref,onValue,set,child,get,onChildAdded,onChildChanged};