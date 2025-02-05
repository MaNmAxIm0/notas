import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// Defina a função setupAutoSave
function setupAutoSave() {
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      if (auth.currentUser) {
        saveUserData(auth.currentUser.uid);
      }
    });
  });
}

// Defina a função saveUserData
function saveUserData(userId) {
  const database = getDatabase();
  const userRef = ref(database, 'users/' + userId);
  const data = {
    testData: window.testData || [],
    yearGrades: {
      year10: getYearGrades(10),
      year11: getYearGrades(11),
      year12: getYearGrades(12) // Adicione year12 se necessário
    },
    examGrades: getExamGrades() || {}
  };

  // Adicionando log para verificar os dados antes de salvar
  console.log("Dados sendo salvos: ", data);

  set(userRef, data).then(() => {
    console.log("Dados do usuário salvos com sucesso.");
  }).catch((error) => {
    console.error("Erro ao salvar os dados do usuário: ", error);
  });
}

// Funções auxiliares para obter dados
function getYearGrades(year) {
  // Implemente a lógica para obter as notas do ano especificado
  return {};
}

function getExamGrades() {
  // Implemente a lógica para obter as notas dos exames
  return {};
}

// Defina a função loadUserData
function loadUserData(userId) {
  const database = getDatabase();
  const userRef = ref(database, 'users/' + userId);
  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Log dos dados carregados
      console.log("Dados carregados: ", data);

      window.testData = data.testData || [];
      setYearGrades(data.yearGrades);
      setExamGrades(data.examGrades);
      updateFinalGrades12();  // Se esta função existir
      calculateFinalGrades(); // Se esta função existir
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error("Erro ao carregar os dados do usuário: ", error);
  });
}

// Defina a função initializeUserData
function initializeUserData(userId) {
  const database = getDatabase();
  const userRef = ref(database, 'users/' + userId);
  const initialData = {
    // Dados iniciais do usuário
    testData: [],
    yearGrades: {
      year10: {},
      year11: {}
    },
    examGrades: {}
  };

  set(userRef, initialData).then(() => {
    console.log("Dados iniciais do usuário definidos.");
  }).catch((error) => {
    console.error("Erro ao definir os dados iniciais do usuário: ", error);
  });
}

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

document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  if (password.length < 6) {
    alert('A senha deve ter pelo menos 6 caracteres');
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert('Conta criada com sucesso!');
      initializeUserData(userCredential.user.uid);
    })
    .catch((error) => {
      switch (error.code) {
        case 'auth/email-already-in-use':
          alert('Este email já está registrado');
          break;
        case 'auth/invalid-email':
          alert('Email inválido');
          break;
        case 'auth/operation-not-allowed':
          alert('Registro de conta desativado');
          break;
        case 'auth/weak-password':
          alert('Senha muito fraca');
          break;
        default:
          alert('Erro de registo: ' + error.message);
      }
    });
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUserData(user.uid);
    setupAutoSave();
  } else {
    showLogin();
  }
});

function calculateYear12Average() {
  if (!window.testData || window.testData.length === 0) return null;

  const subjectTests = {};
  window.testData.forEach(test => {
    if (!subjectTests[test.subject]) {
      subjectTests[test.subject] = [];
    }
    subjectTests[test.subject].push(test);
  });

  let totalGrade = 0;
  let subjectCount = 0;

  Object.entries(subjectTests).forEach(([subject, tests]) => {
    const subjectGrade = calculateSubjectAverage(tests, subject);
    if (subjectGrade !== null) {
      totalGrade += subjectGrade;
      subjectCount++;
    }
  });

  return subjectCount > 0 ? totalGrade / subjectCount : null;
}

function calculateSubjectAverage(tests, subject) {
  if (!tests || tests.length === 0) return null;

  const domainTests = {};
  tests.forEach(test => {
    if (!domainTests[test.domain]) {
      domainTests[test.domain] = [];
    }
    domainTests[test.domain].push(test);
  });

  let weightedTotal = 0;
  let totalWeight = 0;

  Object.entries(domainTests).forEach(([domain, domainTests]) => {
    const domainWeight = getDomainWeight(subject, domain);
    const domainAverage = domainTests.reduce((sum, test) => sum + test.grade, 0) / domainTests.length;
    weightedTotal += domainAverage * domainWeight;
    totalWeight += domainWeight;
  });

  return totalWeight > 0 ? weightedTotal / totalWeight : null;
}

function getDomainWeight(subject, domainName) {
  if (subjectDomains[subject]) {
    const domain = subjectDomains[subject].find(d => d.name === domainName);
    return domain ? domain.weight : 0;
  }
  return 0;
}
