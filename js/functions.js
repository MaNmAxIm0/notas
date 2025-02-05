// ============================
// CONFIGURAÇÃO DE DISCIPLINAS E DOMÍNIOS
// ============================

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

// ============================
// FUNÇÕES AUXILIARES GLOBAIS
// ============================

// Alterna as abas do site
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  const targetTab = document.getElementById(`${tabId}-tab`);
  if (targetTab) targetTab.classList.add('active');
  const targetButton = document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`);
  if (targetButton) targetButton.classList.add('active');
}
window.showTab = showTab;

// ============================
// FUNÇÕES DE POPULAÇÃO DE SELECTS E ATUALIZAÇÃO DE DOMÍNIO
// ============================

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
  if (existingIcon) existingIcon.remove();
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

// ============================
// FUNÇÕES DE TESTES (12º ANO)
// ============================

function addTest12thYear() {
  const subject = document.getElementById('select12Subject').value;
  const testName = document.getElementById('testName').value;
  const grade = parseFloat(document.getElementById('testGrade').value);
  const domain = document.getElementById('testDomain').value;
  if (!subject || !testName || isNaN(grade) || !domain) {
    alert('Por favor preencha todos os campos');
    return;
  }
  if (grade < 0 || grade > 20) {
    alert('A nota deve estar entre 0 e 20');
    return;
  }
  if (!window.testData) window.testData = [];
  window.testData.push({ subject, name: testName, grade, domain });
  document.getElementById('testName').value = '';
  document.getElementById('testGrade').value = '';
  document.getElementById('testDomain').value = '';
  updateFinalGrades12();
  calculateFinalGrades();
  if (auth.currentUser) saveUserData(auth.currentUser.uid);
}

// ============================
// FUNÇÃO processSubject: CRIA RESUMO DOS TESTES (12º ANO)
// ============================

function processSubject(subject, tests, container) {
  const domains = subjectDomains[subject] || [];
  const domainAverages = {};
  let subjectFinalGrade = 0;
  let totalWeight = 0;
  domains.forEach(domain => {
    const domainTests = tests.filter(t => t.domain === domain.name);
    if (domainTests.length > 0) {
      const rawAvg = domainTests.reduce((sum, t) => sum + t.grade, 0) / domainTests.length;
      const weightedAvg = rawAvg * domain.weight;
      domainAverages[domain.name] = {
        rawAverage: rawAvg,
        weightedAverage: weightedAvg,
        weight: domain.weight * 100
      };
      subjectFinalGrade += weightedAvg;
      totalWeight += domain.weight;
    }
  });
  
  const maxColumns = 3;
  const numDomains = domains.length;
  let desktopRows = "";
  for (let i = 0; i < numDomains; i += maxColumns) {
    const rowDomains = domains.slice(i, i + maxColumns);
    const rowHTML = rowDomains.map(domain => {
      return `<td>
                <div class="domain-grade-item">
                  <span class="domain-name">${domain.name} (${domain.weight * 100}%)</span>
                  <div class="domain-tests">
                    ${tests.filter(t => t.domain === domain.name).map(test => `
                      <div class="test-grade">
                        <span class="test-name">${test.name}</span>
                        <span>${Math.round(test.grade * 10) / 10}</span>
                        <span class="remove-test" onclick="removeTest(${window.testData.indexOf(test)}, '${subject}', '${domain.name}')">&times;</span>
                      </div>
                    `).join('')}
                  </div>
                  <span class="domain-value">
                    Média: ${Math.round((domainAverages[domain.name]?.rawAverage || 0) * 10) / 10} × ${domain.weight * 100}% = 
                    ${Math.round((domainAverages[domain.name]?.weightedAverage || 0) * 10) / 10}
                  </span>
                </div>
              </td>`;
    }).join('');
    desktopRows += `<tr>${rowHTML}</tr>`;
  }
  const finalRow = `<tr><td colspan="${maxColumns}"><strong>Média Final: ${Math.round(subjectFinalGrade * 10) / 10}</strong></td></tr>`;
  
  const desktopHTML = `
      <table class="finals-summary-table desktop-table">
        <thead>
          <tr>
            <th colspan="${maxColumns}">${subject}</th>
          </tr>
        </thead>
        <tbody>
          ${desktopRows}
          ${finalRow}
        </tbody>
      </table>
  `;
  
  const mobileHTML = `
      <div class="finals-summary-flex mobile-flex">
        <h3>${subject}</h3>
        <div class="flex-items">
          ${domains.map(domain => `
            <div class="domain-flex-item">
              <div class="domain-grade-item">
                <span class="domain-name">${domain.name} (${domain.weight * 100}%)</span>
                <div class="domain-tests">
                  ${tests.filter(t => t.domain === domain.name).map(test => `
                    <div class="test-grade">
                      <span class="test-name">${test.name}</span>
                      <span>${Math.round(test.grade * 10) / 10}</span>
                      <span class="remove-test" onclick="removeTest(${window.testData.indexOf(test)}, '${subject}', '${domain.name}')">&times;</span>
                    </div>
                  `).join('')}
                </div>
                <span class="domain-value">
                  Média: ${Math.round((domainAverages[domain.name]?.rawAverage || 0) * 10) / 10} × ${domain.weight * 100}% = 
                  ${Math.round((domainAverages[domain.name]?.weightedAverage || 0) * 10) / 10}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="flex-footer">
          <strong>Média Final: ${Math.round(subjectFinalGrade * 10) / 10}</strong>
        </div>
      </div>
  `;
  
  const subjectContainer = document.createElement('div');
  subjectContainer.className = 'subject-summary-container';
  subjectContainer.innerHTML = desktopHTML + mobileHTML;
  container.appendChild(subjectContainer);
  
  return totalWeight > 0 ? subjectFinalGrade : null;
}

// ============================
// FUNÇÃO PARA REMOVER TESTE
// ============================

function removeTest(testIndex, subject, domain) {
  if (confirm('Tem certeza que deseja remover este teste?')) {
    window.testData = window.testData.filter((test, index) => index !== testIndex);
    updateFinalGrades12();
    calculateFinalGrades();
    if (auth.currentUser) saveUserData(auth.currentUser.uid);
  }
}
window.removeTest = removeTest;

// ============================
// FUNÇÕES DE EXAMES
// ============================

function setExamGrades(examGrades) {
  if (!examGrades) return;
  let examTable = document.getElementById('exam-summary-table');
  if (!examTable) {
    examTable = document.createElement('table');
    examTable.id = 'exam-summary-table';
    examTable.style.width = '100%';
    examTable.style.marginTop = '20px';
    examTable.innerHTML = `
      <thead>
        <tr>
          <th>Disciplina</th>
          <th>Nota</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    document.getElementById('exam-entries').appendChild(examTable);
  }
  const tbody = examTable.querySelector('tbody');
  tbody.innerHTML = "";
  Object.entries(examGrades).forEach(([subject, data]) => {
    if (subject !== 'average' && data) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${subject}</td>
        <td>${data.grade * 10}</td>
        <td>
          <button onclick="this.closest('tr').remove(); calculateFinalGrades();" style="background-color: #f44336; padding: 5px 10px;">
            Remover
          </button>
        </td>
      `;
      tbody.appendChild(row);
    }
  });
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
  let examTable = document.getElementById('exam-summary-table');
  if (!examTable) {
    examTable = document.createElement('table');
    examTable.id = 'exam-summary-table';
    examTable.style.width = '100%';
    examTable.style.marginTop = '20px';
    examTable.innerHTML = `
      <thead>
        <tr>
          <th>Disciplina</th>
          <th>Nota</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    document.getElementById('exam-entries').appendChild(examTable);
  }
  const tbody = examTable.querySelector('tbody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${subject}</td>
    <td>${grade}</td>
    <td>
      <button onclick="this.closest('tr').remove(); calculateFinalGrades();" style="background-color: #f44336; padding: 5px 10px;">
        Remover
      </button>
    </td>
  `;
  tbody.appendChild(row);
  document.getElementById('exam-subject').value = '';
  document.getElementById('exam-grade-input').value = '';
  calculateFinalGrades();
  if (auth.currentUser) saveUserData(auth.currentUser.uid);
}

// ============================
// FUNÇÕES DE CÁLCULO E RESUMO FINAL
// ============================

function getAllSubjects() {
  return [...new Set([...subjects.year10, ...subjects.year11, ...subjects.year12])];
}

function calculateYearAverage(year) {
  const grades = document.querySelectorAll(`.year${year}-grade`);
  let total = 0, count = 0;
  grades.forEach(input => {
    const value = parseFloat(input.value);
    if (!isNaN(value)) { total += value; count++; }
  });
  return count > 0 ? total / count : null;
}

function calculateYear12Average() {
  if (!window.testData || window.testData.length === 0) return null;
  const subjectTests = {};
  window.testData.forEach(test => {
    if (!subjectTests[test.subject]) { subjectTests[test.subject] = []; }
    subjectTests[test.subject].push(test);
  });
  let totalGrade = 0, subjectCount = 0;
  Object.entries(subjectTests).forEach(([subject, tests]) => {
    const subjectGrade = calculateSubjectAverage(tests, subject);
    if (subjectGrade !== null) { totalGrade += subjectGrade; subjectCount++; }
  });
  return subjectCount > 0 ? totalGrade / subjectCount : null;
}

function calculateSecondaryEducationAverage() {
  const subjectsList = getAllSubjects();
  let totalGrade = 0, subjectCount = 0;
  subjectsList.forEach(subject => {
    const year10Grade = getGrade(subject, 10);
    const year11Grade = getGrade(subject, 11);
    const year12Grade = getSubjectGrade12(subject);
    let finalGrade;
    if (subject === 'Matemática A' || subject === 'Português' || subject === 'Educação Física') {
      const grades = [year10Grade, year11Grade, year12Grade].filter(g => g !== null);
      if (grades.length > 0) { finalGrade = Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length); }
    } else {
      const yearGrades = [
        { grade: year10Grade, weight: 0.3 },
        { grade: year11Grade, weight: 0.3 },
        { grade: year12Grade, weight: 0.4 }
      ].filter(g => g.grade !== null);
      if (yearGrades.length > 0) {
        const weightedSum = yearGrades.reduce((sum, g) => sum + g.grade * g.weight, 0);
        const totalWeight = yearGrades.reduce((sum, g) => sum + g.weight, 0);
        finalGrade = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
      }
    }
    const examGrades = calculateExamGrades();
    if (examGrades && examGrades[subject] && finalGrade !== null) {
      finalGrade = Math.round((finalGrade * 0.7) + (examGrades[subject].grade * 0.3));
    }
    if (finalGrade !== null) { totalGrade += finalGrade; subjectCount++; }
  });
  return subjectCount > 0 ? (totalGrade / subjectCount) * 10 : null;
}

function calculateExamGrades() {
  const examTable = document.getElementById('exam-summary-table');
  const examGrades = {};
  if (examTable) {
    const rows = examTable.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const subject = row.cells[0].textContent;
      const grade = parseFloat(row.cells[1].textContent) / 10;
      if (!isNaN(grade)) { examGrades[subject] = { grade, weight: 1 }; }
    });
    const grades = Object.values(examGrades).map(g => g.grade);
    if (grades.length > 0) { examGrades.average = grades.reduce((a, b) => a + b, 0) / grades.length; }
  }
  return examGrades;
}

function updateSummaryTable(year10Avg, year11Avg, year12Avg, examGrades) {
  const tbody = document.getElementById('summary-body');
  tbody.innerHTML = "";
  const allSubjects = getAllSubjects();
  allSubjects.forEach(subject => {
    const row = document.createElement('tr');
    const year10Grade = getGrade(subject, 10);
    const year11Grade = getGrade(subject, 11);
    const year12Grade = getSubjectGrade12(subject);
    const examGrade = examGrades[subject] ? examGrades[subject].grade : null;
    let finalCIF;
    if (subject === 'Matemática A' || subject === 'Português' || subject === 'Educação Física') {
      const grades = [year10Grade, year11Grade, year12Grade].filter(g => g !== null);
      if (grades.length > 0) { finalCIF = grades.reduce((sum, grade) => sum + grade, 0) / grades.length; }
    } else {
      const yearGrades = [
        { grade: year10Grade, weight: 0.3 },
        { grade: year11Grade, weight: 0.3 },
        { grade: year12Grade, weight: 0.4 }
      ].filter(g => g.grade !== null);
      if (yearGrades.length > 0) {
        const weightedSum = yearGrades.reduce((sum, g) => sum + g.grade * g.weight, 0);
        const totalWeight = yearGrades.reduce((sum, g) => sum + g.weight, 0);
        finalCIF = totalWeight > 0 ? weightedSum / totalWeight : null;
      }
    }
    if (examGrade !== null && finalCIF !== null) {
      const roundedYearAvg = Math.round(finalCIF);
      finalCIF = (roundedYearAvg * 0.7) + (examGrade * 0.3);
    }
    row.innerHTML = `
      <td>${subject}</td>
      <td>${year10Grade ? Math.round(year10Grade) : '-'}</td>
      <td>${year11Grade ? Math.round(year11Grade) : '-'}</td>
      <td>${year12Grade ? Math.round(year12Grade) : '-'}</td>
      <td>${examGrade ? Math.round(examGrade * 10) / 10 : '-'}</td>
      <td>${finalCIF ? Math.round(finalCIF * 100) / 100 : '-'}</td>
      <td>${finalCIF ? Math.round(finalCIF) : '-'}</td>
    `;
    tbody.appendChild(row);
  });
}

function getGrade(subject, year) {
  const input = document.querySelector(`.year${year}-grade[data-subject="${subject}"]`);
  return input ? parseFloat(input.value) : null;
}

function getSubjectGrade12(subject) {
  if (!window.testData) return null;
  const tests = window.testData.filter(test => test.subject === subject);
  if (tests.length === 0) return null;
  const domains = subjectDomains[subject] || [];
  let subjectFinalGrade = 0, totalWeight = 0;
  domains.forEach(domain => {
    const domainTests = tests.filter(t => t.domain === domain.name);
    if (domainTests.length > 0) {
      const rawAvg = domainTests.reduce((sum, t) => sum + t.grade, 0) / domainTests.length;
      const weightedAvg = rawAvg * domain.weight;
      subjectFinalGrade += weightedAvg;
      totalWeight += domain.weight;
    }
  });
  return totalWeight > 0 ? Math.round(subjectFinalGrade) : null;
}

function calculateSubjectCIF(year10Grade, year11Grade, year12Grade) {
  const grades = [
    { grade: year10Grade, weight: 0.3 },
    { grade: year11Grade, weight: 0.3 },
    { grade: year12Grade, weight: 0.4 }
  ].filter(g => g.grade !== null);
  if (grades.length === 0) return null;
  const weightedSum = grades.reduce((sum, g) => sum + g.grade * g.weight, 0);
  const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
  let regularCIF = totalWeight > 0 ? weightedSum / totalWeight : null;
  regularCIF = regularCIF !== null ? Math.round(regularCIF) : null;
  const examGrades = calculateExamGrades();
  if (examGrades && examGrades[subject] && regularCIF !== null) {
    return (regularCIF * 0.7) + (examGrades[subject].grade * 0.3);
  }
  return regularCIF;
}

// ============================
// EVENTOS
// ============================

document.addEventListener('input', function(e) {
  if (
    e.target.classList.contains('grade-input') || 
    e.target.classList.contains('exam-grade') ||
    e.target.classList.contains('exam-weight') ||
    e.target.classList.contains('domain-select')
  ) {
    calculateFinalGrades();
  }
});

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

// ============================
// LISTENERS PARA OS FORMULÁRIOS DE LOGIN E REGISTRO
// ============================

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Login submit capturado');
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('Login bem-sucedido', userCredential.user);
      loadUserData(userCredential.user.uid);
    })
    .catch((error) => {
      console.error('Erro de login:', error);
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

// ============================
// CONFIGURAÇÃO DO FIREBASE
// ============================

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
// Função de login atualizada
async function login(event) {
    event.preventDefault(); // Impede o comportamento padrão de reload da página

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log("Login bem-sucedido", user);

        // Carrega notas e redireciona para a página de dashboard
        await loadYear12Grades(user.uid);
        window.location.href = "dashboard.html"; // Substitua pelo nome correto da página
    } catch (error) {
        console.error("Erro ao fazer login", error);
        alert("Erro ao fazer login: " + error.message);
    }
}

// Função para carregar as notas do 12º ano
async function loadYear12Grades(userId) {
    const gradesRef = firebase.database().ref(`users/${userId}/year12Grades`);

    try {
        const snapshot = await gradesRef.once('value');
        const grades = snapshot.val();

        if (grades) {
            console.log("Notas carregadas:", grades);
            populateGradesTable(grades);
        } else {
            console.log("Nenhuma nota encontrada.");
        }
    } catch (error) {
        console.error("Erro ao carregar notas", error);
    }
}

// Função para preencher a tabela com as notas
function populateGradesTable(grades) {
    const tableBody = document.getElementById('gradesTableBody');
    tableBody.innerHTML = '';

    Object.entries(grades).forEach(([key, grade]) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${grade.disciplina}</td>
            <td>${grade.nota}</td>
            <td>${grade.peso}%</td>
        `;

        tableBody.appendChild(row);
    });
}

// Função para salvar as notas (correção do erro de referência)
function setYearGrades(userId, grades) {
    const gradesRef = firebase.database().ref(`users/${userId}/year12Grades`);

    gradesRef.set(grades).then(() => {
        console.log("Notas salvas com sucesso.");
    }).catch((error) => {
        console.error("Erro ao salvar notas", error);
    });
}

// Configurar o evento de submissão do formulário de login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', login);
}
// Função para atualizar as notas finais do 12º ano
function updateFinalGrades12(userId, finalGrades) {
    const finalGradesRef = firebase.database().ref(`users/${userId}/finalGrades12`);

    finalGradesRef.set(finalGrades)
        .then(() => {
            console.log("Notas finais do 12º ano atualizadas com sucesso.");
        })
        .catch((error) => {
            console.error("Erro ao atualizar notas finais do 12º ano:", error);
        });
}

// ============================
// FUNÇÃO AUXILIAR PARA CRIAR INPUTS DE 10º E 11º ANOS
// ============================

function createYearInputs() {
  const year10Div = document.getElementById('year10');
  subjects.year10.forEach(subject => {
    year10Div.innerHTML += `
      <div class="subject">
        <label>${subject}:</label>
        <input type="number" min="0" max="20" step="1" class="grade-input year10-grade" data-subject="${subject}" placeholder="0-20">
      </div>
    `;
  });
  const year11Div = document.getElementById('year11');
  subjects.year11.forEach(subject => {
    year11Div.innerHTML += `
      <div class="subject">
        <label>${subject}:</label>
        <input type="number" min="0" max="20" step="1" class="grade-input year11-grade" data-subject="${subject}" placeholder="0-20">
      </div>
    `;
  });
}

// ============================
// EXPOSIÇÃO DAS FUNÇÕES GLOBAIS
// ============================

window.calculateYear12Average = calculateYear12Average;
window.calculateFinalGrades = calculateFinalGrades;
window.calculateExamGrades = calculateExamGrades;
window.calculateSecondaryEducationAverage = calculateSecondaryEducationAverage;
window.updateSummaryTable = updateSummaryTable;
window.getGrade = getGrade;
window.getSubjectGrade12 = getSubjectGrade12;
window.calculateSubjectCIF = calculateSubjectCIF;
window.getDomainWeight = function(subject, domainName) {
  if (subjectDomains[subject]) {
    const domain = subjectDomains[subject].find(d => d.name === domainName);
    return domain ? domain.weight : 0;
  }
  return 0;
};
window.processSubject = processSubject;
window.updateFinalGrades12 = updateFinalGrades12;
