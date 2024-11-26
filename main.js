// Update these functions to be exposed to window scope, before the Firebase initialization code
function showLogin() {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
}

function showRegister() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
}

function showMainContent() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
}

function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabId}-tab`).classList.add('active');
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Expose functions to window scope
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showMainContent = showMainContent;
window.showTab = showTab;

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1hg5b-lRtilVWYxeEU6sAwSHfCi7uAG8",
    authDomain: "notas-a3feb.firebaseapp.com",
    databaseURL: "https://notas-a3feb-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "notas-a3feb",
    storageBucket: "notas-a3feb.firebasestorage.app",
    messagingSenderId: "657388702531",
    appId: "1:657388702531:web:2e25bf0481273453e7bdf6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Make auth and database available globally
window.auth = auth;
window.database = database;
window.dbRef = ref;
window.dbSet = set;
window.dbGet = get;

// Update login handler
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        loadUserData(userCredential.user.uid);
      })
      .catch((error) => {
        alert('Erro de login: ' + error.message);
      });
});

// Update registration handler
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        initializeUserData(userCredential.user.uid);
      })
      .catch((error) => {
        alert('Erro de registo: ' + error.message);
      });
});

// Update logout function
window.logout = function() {
    signOut(auth)
      .then(() => {
        window.testData = [];
        showLogin();
      })
      .catch((error) => {
        alert('Erro de logout: ' + error.message);
      });
};

// Update saveUserData function
window.saveUserData = function(userId) {
    const data = {
      testData: window.testData || [],
      yearGrades: {
        year10: getYearGrades(10),
        year11: getYearGrades(11)
      },
      examGrades: getExamGrades()
    };
    
    return dbSet(ref(database, 'users/' + userId), data);
};

// Update loadUserData function
window.loadUserData = function(userId) {
    get(ref(database, 'users/' + userId))
      .then((snapshot) => {
        const data = snapshot.val();
        if (data) {
          window.testData = data.testData || [];
          setYearGrades(data.yearGrades);
          setExamGrades(data.examGrades);
          updateFinalGrades12();
          calculateFinalGrades();
        }
        showMainContent();
      });
};

// Update initializeUserData function
window.initializeUserData = function(userId) {
    const emptyData = {
      testData: [],
      yearGrades: {
        year10: {},
        year11: {}
      },
      examGrades: {}
    };
    
    dbSet(ref(database, 'users/' + userId), emptyData)
      .then(() => {
        window.testData = [];
        showMainContent();
      });
};

// Update auth state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
      loadUserData(user.uid);
      setupAutoSave();
    } else {
      showLogin();
    }
});