import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Resto do código...

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUserData(user.uid);
    setupAutoSave();
  } else {
    showLogin();
  }
});
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
