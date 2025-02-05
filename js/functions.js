const subjects = {
  year10: ['Matemática A', 'Português', 'Inglês', 'Educação Física', 'Filosofia', 'Economia A', 'Geografia A'],
  year11: ['Matemática A', 'Português', 'Inglês', 'Educação Física', 'Filosofia', 'Economia A', 'Geografia A'],
  year12: ['Aplicações Informáticas B', 'Economia C', 'Português', 'Matemática A', 'Educação Física']
};


const subjectDomains = {
  'Português': [
    { name: 'Oralidade', weight: 0.20 },
    { name: 'Leitura', weight: 0.15 },
    { name: 'Educação Literária', weight: 0.30 },
    { name: 'Escrita', weight: 0.25 },
    { name: 'Gramática', weight: 0.10 }
  ],
  'Economia C': [
    { name: 'Domínio 1', weight: 0.75 },
    { name: 'Domínio 2', weight: 0.25 }
  ],
  'Aplicações Informáticas B': [
    { name: 'Domínio 1', weight: 0.70 },
    { name: 'Domínio 2', weight: 0.30 }
  ],
  'Matemática A': [
    { name: 'Domínio 1', weight: 0.70 },
    { name: 'Domínio 2', weight: 0.30 }
  ],
  'Educação Física': [
    { name: 'Aptidão Física', weight: 0.15 },
    { name: 'Atividades Físicas', weight: 0.70 },
    { name: 'Conhecimentos', weight: 0.15 }
  ]
};

function populateSubjectSelect() {
  const select = document.getElementById('select12Subject');
  if (!select) return;
  
  select.innerHTML = '<option value="">Selecione a Disciplina</option>';
  
  subjects.year12.forEach(subject => {
    const option = document.createElement('option');
    option.value = subject;
    option.textContent = subject;
    select.appendChild(option);
  });
}

function updateDomainSelect(selectedSubject) {
  const domainSelect = document.getElementById('testDomain');
  const domainContainer = domainSelect.parentElement;
  domainSelect.innerHTML = '<option value="">Selecione o Domínio</option>';
  
  const existingIcon = domainContainer.querySelector('.domain-info-icon');
  if (existingIcon) {
    existingIcon.remove();
  }
  
  if (selectedSubject && subjectDomains[selectedSubject]) {
    subjectDomains[selectedSubject].forEach(domain => {
      const option = document.createElement('option');
      option.value = domain.name;
      option.textContent = `${domain.name} (${domain.weight * 100}%)`;
      domainSelect.appendChild(option);
    });
    
    if (selectedSubject === 'Educação Física') {
      const infoIcon = document.createElement('span');
      infoIcon.className = 'domain-info-icon';
      infoIcon.innerHTML = '❓';
      infoIcon.title = 'Click for domain information';
      infoIcon.onclick = showPopup;
      domainContainer.appendChild(infoIcon);
    }
  }
}

function showLoginScreen() {
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

// Verifique se o input possui o ID correto
function addTest12thYear() {
  // Implementação da função addTest12thYear
  console.log("Função addTest12thYear chamada");

  // Exemplo de input no HTML
  const inputHTML = '<input type="text" id="yourInputElement" placeholder="Digite algo...">';
  document.getElementById('mainContent').innerHTML += inputHTML;
}

window.showLogin = showLoginScreen;
window.showRegister = showRegister;
window.showMainContent = showMainContent;
window.showTab = showTab;
window.addExam = addExam;
window.addTest12thYear = addTest12thYear;
window.logout = function() {
  signOut(auth)
    .then(() => {
      window.testData = [];
      document.querySelectorAll('input').forEach(input => {
        input.value = '';
      });
      document.getElementById('exam-entries').innerHTML = '';
      document.querySelector('.year12-finals').innerHTML = '';
      calculateFinalGrades();
      showLoginScreen();
    })
    .catch((error) => {
      alert('Erro de logout: ' + error.message);
    });
};

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

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1hg5b-lRtilVWYxeEU6sAwSHfCi7uAG8",
  authDomain: "notas-a3feb.firebaseapp.com",
  databaseURL: "https://notas-a3feb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "notas-a3feb",
  storageBucket: "notas-a3feb.firebasestorage.app",
  messagingSenderId: "657388702531",
  appId: "1:657388702531:web:2e25bf0481273453e7bdf6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

window.auth = auth;
window.database = database;
window.dbRef = ref;
window.dbSet = set;
window.dbGet = get;

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

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUserData(user.uid);
    setupAutoSave();
  } else {
    showLoginScreen();
  }
});

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

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });

  document.getElementById(`${tabId}-tab`).classList.add('active');
  document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

window.calculateYearAverage = function(year) {
  const grades = document.querySelectorAll(`.year${year}-grade`);
  let total = 0;
  let count = 0;

  grades.forEach(input => {
    const value = parseFloat(input.value);
    if (!isNaN(value)) {
      total += value;
      count++;
    }
  });

  return count > 0 ? total / count : null;
};

function createYearInputs() {
  const year10Div = document.getElementById('year10');
  subjects.year10.forEach(subject => {
    year10Div.innerHTML += `
      <div class="subject">
        <label>${subject}:</label>
        <input type="number" min="0" max="20" step="1" class="grade-input year10-grade" 
               data-subject="${subject}" placeholder="0-20">
      </div>
    `;
  });

  const year11Div = document.getElementById('year11');
  subjects.year11.forEach(subject => {
    year11Div.innerHTML += `
      <div class="subject">
        <label>${subject}:</label>
        <input type="number" min="0" max="20" step="1" class="grade-input year11-grade" 
               data-subject="${subject}" placeholder="0-20">
      </div>
    `;
  });
}

function setYearGrades(yearGrades) {
  if (!yearGrades) return;
  
  ['year10', 'year11'].forEach(year => {
    const yearNum = year.replace('year', '');
    if (yearGrades[year]) {
      Object.entries(yearGrades[year]).forEach(([subject, grade]) => {
        const input = document.querySelector(`.year${yearNum}-grade[data-subject="${subject}"]`);
        if (input && grade !== null) {
          input.value = grade;
        }
      });
    }
  });
}

function setExamGrades(examGrades) {
  if (!examGrades) return;
  
  const examContainer = document.getElementById('exam-entries');
  examContainer.innerHTML = '';
  
  const container = document.createElement('div');
  container.className = 'table-container';
  
  const examTable = document.createElement('table');
  examTable.id = 'exam-summary-table';
  examTable.style.marginTop = '20px';
  examTable.innerHTML = `
    <thead>
      <tr>
        <th>Disciplina</th>
        <th>Nota</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  
  container.appendChild(examTable);
  examContainer.appendChild(container);
  
  const tbody = examTable.querySelector('tbody');
  
  Object.entries(examGrades).forEach(([subject, data]) => {
    if (subject !== 'average' && data) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${subject}</td>
        <td>${data.grade * 10}</td>
      `;
      tbody.appendChild(row);
    }
  });
}

function getExamGrades() {
  const examEntries = document.querySelectorAll('.exam-entry');
  const examGrades = {};

  examEntries.forEach(entry => {
    const subject = entry.querySelector('.exam-subject').value;
    const gradeInput = entry.querySelector('.exam-grade');
    const weightInput = entry.querySelector('.exam-weight');
    
    if (gradeInput.value && weightInput.value) {
      const grade = parseFloat(gradeInput.value) / 10;
      const weight = parseFloat(weightInput.value) / 100;
      
      examGrades[subject] = {
        grade: grade,
        weight: weight
      };
    }
  });

  const grades = Object.values(examGrades).map(g => g.grade);
  if (grades.length > 0) {
    examGrades.average = grades.reduce((a, b) => a + b, 0) / grades.length;
  }

  return examGrades;
}

function addExam() {
  const subject = document.getElementById('exam-subject').value;
  const grade = document.getElementById('exam-grade-input').value;
  
  if (!subject || !grade) {
    alert('Por favor preencha todos os campos');
    return;
  }

  const gradeNum = parseFloat(grade);
  if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 200) {
    alert('A nota deve estar entre 0 e 200');
    return;
  }

  let examContainer = document.getElementById('exam-entries');
  
  let container = examContainer.querySelector('.table-container');
  let examTable = examContainer.querySelector('#exam-summary-table');

  if (!container) {
    container = document.createElement('div');
    container.className = 'table-container';
    examContainer.appendChild(container);
  }
  
  if (!examTable) {
    examTable = document.createElement('table');
    examTable.id = 'exam-summary-table';
    examTable.style.marginTop = '20px';
    examTable.innerHTML = `
      <thead>
        <tr>
          <th>Disciplina</th>
          <th>Nota</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    container.appendChild(examTable);
  }

  const tbody = examTable.querySelector('tbody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${subject}</td>
    <td>${grade}</td>
  `;
  tbody.appendChild(row);

  document.getElementById('exam-subject').value = '';
  document.getElementById('exam-grade-input').value = '';

  calculateFinalGrades();

  if (auth.currentUser) {
    saveUserData(auth.currentUser.uid);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  populateSubjectSelect();
  createYearInputs();

  const examSubjectSelect = document.getElementById('exam-subject');
  if (examSubjectSelect) {
    examSubjectSelect.innerHTML = '<option value="">Selecione a Disciplina</option>';
    getAllSubjects().forEach(subject => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      examSubjectSelect.appendChild(option);
    });
  }
});

function getYearGrades(year) {
  const grades = {};
  document.querySelectorAll(`.year${year}-grade`).forEach(input => {
    const subject = input.dataset.subject;
    grades[subject] = input.value ? parseFloat(input.value) : null;
  });
  return grades;
}

function saveUserData(userId) {
  const data = {
    testData: window.testData || [],
    yearGrades: {
      year10: getYearGrades(10),
      year11: getYearGrades(11)
    },
    examGrades: getExamGrades()
  };
  
  return dbSet(ref(database, 'users/' + userId), data);
}
