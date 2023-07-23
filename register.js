import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider ,signInWithPopup } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const firebaseConfig = {
 apiKey: "AIzaSyCqcaX7OppQVZd_0ttwvd2XfRfWDKcQ5TQ",
 authDomain: "found-it-first.firebaseapp.com",
 databaseURL: "https://found-it-first-default-rtdb.firebaseio.com",
 projectId: "found-it-first",
 storageBucket: "found-it-first.appspot.com",
 messagingSenderId: "514337900685",
 appId: "1:514337900685:web:e95a46804a18aedff0bac4"
};


const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = getAuth(app)
auth.useDeviceLanguage()

//grab
const register = document.getElementById("register");
register.addEventListener("click", function (event) {
 event.preventDefault()

 const email = document.getElementById("email").value;
 const password = document.getElementById("password").value;

 createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
   const user = userCredential.user;
   window.location.href = "login.html";
  })
  .catch((error) => {
   const errorCode = error.code;
   const errorMessage = error.message;
   function showCustomAlert(message) {
    // Show the custom alert modal using Bootstrap's modal function
    const customAlertModal = new bootstrap.Modal(document.getElementById('customAlertModal'));
    document.getElementById('customAlertMessage').textContent = error.message;
    customAlertModal.show();
   }

   showCustomAlert()

  });

})



//spinner
document.addEventListener("DOMContentLoaded", () => {
 const registerButton = document.getElementById("register");
 const spinnerDiv = document.getElementById("spinnerDiv");

 registerButton.addEventListener("click", (event) => {
  event.preventDefault();

  // Get the email and password from the form inputs
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Show the spinner while the registration process is ongoing
  spinnerDiv.style.display = "block";

  // Perform your registration process here using Firebase Auth or any other method
  // For demonstration purposes, we'll use a setTimeout to simulate a registration delay
  setTimeout(() => {
   // Hide the spinner after the registration process is finished
   spinnerDiv.style.display = "none";
  }, 2000); // Simulating a 2-second registration process delay
 });
});

const google = document.getElementById("google");
google.addEventListener("click",
 function registerWithGoogle() {
  signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    window.location.href = "dashboard.html";




  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    
    //error 
    function showCustomAlert(message) {
     // Show the custom alert modal using Bootstrap's modal function
     const customAlertModal = new bootstrap.Modal(document.getElementById('customAlertModal'));
     document.getElementById('customAlertMessage').textContent = error.message;
     customAlertModal.show();
    }
 
    showCustomAlert()


  });



 }
)
