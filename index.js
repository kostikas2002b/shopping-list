import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js'
import { getDatabase, ref, push, get, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js'

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
window.auth = auth;

const signInPageViewEl = document.getElementById('sign-in-page-view');
const listPageViewEl = document.getElementById('list-page-view');

const emailInputFieldEl = document.getElementById('email-input-field');
const passwordInputFieldEl = document.getElementById('password-input-field');
const signInButtonEl = document.getElementById('sign-in-button');

const signOutButtonEl = document.getElementById('sign-out-button');

const inputFieldEl = document.getElementById('input-field');
const addButtonEl = document.getElementById('add-button');
const shoppingListEl = document.getElementById('shopping-list');

let mousedownedLi = null;


const database = getDatabase(app);
let usersShoppingListInDB;
let usersShoppingListInDBValue;
let shoppingListInDB;

onAuthStateChanged(auth, (user) => {
    if (user) {
        
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        console.log('signed in');
        
        const email = user.email;
        document.getElementById('username').textContent = email;
        
        const uid = user.uid;
        
        usersShoppingListInDB = ref(database, 'users/' + uid + '/list');
        console.log(get(usersShoppingListInDB));

        onValue(usersShoppingListInDB, function (snapshot) {

            if (snapshot.exists()) {

                console.log(snapshot);
                usersShoppingListInDBValue = snapshot._node.value_;
                console.log(usersShoppingListInDBValue);
                shoppingListInDB = ref(database, 'shoppingLists/' + usersShoppingListInDBValue);

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

            }

        });

        signInPageViewEl.style.display = 'none';
        listPageViewEl.style.display = 'flex';
    } else {
        // User is signed out
        console.log('signed out');
        signInPageViewEl.style.display = 'flex';
        listPageViewEl.style.display = 'none';
    }
});

signInButtonEl.addEventListener('click', function(event) {
    console.log('clicked sign-in btn');
    event.preventDefault();
    const inputEmail = emailInputFieldEl.value;
    const inputPassword = passwordInputFieldEl.value;
    console.log(inputEmail, inputPassword);
    if ( (inputEmail) && (inputPassword) ) {
        (signInWithEmailAndPassword(auth, inputEmail, inputPassword)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                emailInputFieldEl.value = '';
                passwordInputFieldEl.value = '';
                console.log('successful sign-in!');
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log('sign-in UNsuccessful...');
            })
        );
    }
});

signOutButtonEl.addEventListener('click', function(event) {
    console.log('clicked sign-out btn');
    event.preventDefault();
    (signOut(auth)
        .then(() => {
            // Sign-out successful.
            console.log('Sign-out successful.');
            clearShoppingListEl();
        }).catch((error) => {
            // An error happened.
            console.log('An error happened during Sign-out');
        })
    );
});


addButtonEl.addEventListener('click', function (event) {
    event.preventDefault();
    
    let inputValue = inputFieldEl.value;

    push(shoppingListInDB, inputValue);

    clearInputFieldEl();
});

document.addEventListener('mouseup', potentiallyRemoveListItem);
document.addEventListener('touchend', potentiallyRemoveListItem);

function potentiallyRemoveListItem(event) {
    setTimeout(function () {
        if (event.target === mousedownedLi) {
            // console.dir(event.target.parentNode);
            if (event.target.parentNode.className.indexOf('swiper-slide-active') < 0) {
                // console.log(event.target.parentNode.className);
                // console.log('removed');
                event.target.parentNode.style.transition = 'opacity 0.4s';
                event.target.parentNode.style.opacity = 0;
                // console.log(event.target.parentNode.style.transition);
                // console.log(event.target.parentNode.style.opacity);
                // console.log(event.target.parentNode.style);
                
                setTimeout(function () {
                    event.target.parentNode.parentNode.parentNode.parentNode.remove();
                    let itemID = event.target.parentNode.getAttribute('data-item-id');
                    // console.log(itemID);
                    let exactLocationOfItemInDB = ref(database, `shoppingLists/${usersShoppingListInDBValue}/${itemID}`);
                    // console.log(exactLocationOfItemInDB);
                    remove(exactLocationOfItemInDB);
                }, 400);

            }
        }
        mousedownedLi = null;
    }, 0);
}

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
    
    // newEl.addEventListener('click', function () {
        //     let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`);
        //     remove(exactLocationOfItemInDB);
        // });
        

    let containerEl = document.createElement('div');
    
    containerEl.innerHTML = `<!-- Swiper -->
    <div class="swiper mySwiper swiper-container-horizontal">
        <div class="swiper-wrapper">
            <div class="swiper-slide"></div>
            <div class="swiper-slide li-container" data-item-id=${itemID}></div>
            <div class="swiper-slide"></div>
        </div>
    </div>`;

    containerEl.getElementsByClassName('li-container')[0].append(newEl);

    shoppingListEl.append(containerEl);

    const swiper = new Swiper(containerEl.getElementsByClassName('mySwiper')[0], {loop: true, initialSlide: 1 });

    containerEl.getElementsByTagName('li')[0].addEventListener('mousedown', populateMousedownedLi);
    containerEl.getElementsByTagName('li')[0].addEventListener('touchstart', populateMousedownedLi);
}

function populateMousedownedLi(event) {
    mousedownedLi = event.target;
    // console.log('mousedowned li');
}
