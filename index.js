import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js'
import { getDatabase, ref, push, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js'

const appSettings = {
    
    apiKey: "AIzaSyByzI2Gv_m5PSXwbjuKLUPA749QgyI9Uo4",
    
    // authDomain: "PROJECT_ID.firebaseapp.com",
    
    // The value of `databaseURL` depends on the location of the database
    databaseURL: 'https://shopping-list-sofeiri-default-rtdb.europe-west1.firebasedatabase.app/',
    
    // projectId: "PROJECT_ID",
    
    // appId: "APP_ID",
    
    // // For Firebase JavaScript SDK v7.20.0 and later, `measurementId` is an optional field
    // measurementId: "G-MEASUREMENT_ID",
};

const app = initializeApp(appSettings);
window.app = app;

const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    console.log('signed in');
    const uid = user.uid;
    // ...
  } else {
    // User is signed out
    // ...
    console.log('signed out');
  }
});

// const testEmail = 'YOUR_EMAIL_HERE';
// const testPassword = 'YOUR_PASSWORD_HERE';
// signInWithEmailAndPassword(auth, testEmail, testPassword)
//   .then((userCredential) => {
//     // Signed in 
//     const user = userCredential.user;
//     console.log('successful sign-in!');
//     // ...
//   })
//   .catch((error) => {
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     console.log('UNsuccessful...');
//   });

// signOut(auth).then(() => {
//     // Sign-out successful.
//     console.log('Sign-out successful.');
//   }).catch((error) => {
//     // An error happened.
//     console.log('An error happened during Sign-out');
//   });

const database = getDatabase(app);
const shoppingListInDB = ref(database, 'shoppingList');

const inputFieldEl = document.getElementById('input-field');
const addButtonEl = document.getElementById('add-button');
const shoppingListEl = document.getElementById('shopping-list');

addButtonEl.addEventListener('click', function (event) {
    event.preventDefault();
    
    let inputValue = inputFieldEl.value;

    push(shoppingListInDB, inputValue);

    clearInputFieldEl();
});

onValue(shoppingListInDB, function (snapshot) {

    clearShoppingListEl();
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val());

        let itemsArrayLength = itemsArray.length;
        for (let i = 0; i < itemsArrayLength; i++) {
            let currentItem = itemsArray[i];
            let currentItemID = currentItem[0];
            let currentItemValue = currentItem[1];

            appendItemToShoppingListEl(currentItem);
        }
    }
});

function clearInputFieldEl() {
    inputFieldEl.value = '';
}

function clearShoppingListEl() {
    shoppingListEl.innerHTML = '';
}

function appendItemToShoppingListEl(item) {
    let itemID = item[0];
    let itemValue = item[1];

    let newEl = document.createElement('li');

    newEl.textContent = itemValue;

    newEl.addEventListener('click', function () {
        let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`);
        remove(exactLocationOfItemInDB);
    });

    shoppingListEl.append(newEl);
}