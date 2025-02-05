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

// Function to save user data
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

// Function to load user data
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

// Function to handle login
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

// Function to handle registration
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

// Update auth state observer to load user data
onAuthStateChanged(auth, (user) => {
    if (user) {
      loadUserData(user.uid);
      setupAutoSave();
    } else {
      showLogin();
    }
});

// Add auto-save functionality
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

// Function to show login screen
function showLogin() {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
}

// Function to show main content
function showMainContent() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
}

// Function to initialize user data when creating new account
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

// Function to get year grades
function getYearGrades(year) {
    const grades = {};
    document.querySelectorAll(`.year${year}-grade`).forEach(input => {
        const subject = input.dataset.subject;
        grades[subject] = input.value ? parseFloat(input.value) : null;
    });
    return grades;
}

// Function to set year grades
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

// Function to set exam grades
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

// Function to get exam grades
function getExamGrades() {
    const examEntries = document.querySelectorAll('.exam-entry');
    const examGrades = {};

    examEntries.forEach(entry => {
        const subject = entry.querySelector('.exam-subject').value;
        const gradeInput = entry.querySelector('.exam-grade');
        const weightInput = entry.querySelector('.exam-weight');
        
        if (gradeInput.value && weightInput.value) {
            const grade = parseFloat(gradeInput.value) / 10; // Convert from 200-point to 20-point scale
            const weight = parseFloat(weightInput.value) / 100; // Convert percentage to decimal
            
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

// Function to add exam input
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

    document.getElementById('salvarButton').addEventListener('click', salvarNotas);
});

function salvarNotas() {
    const notas = {
        nota1: document.getElementById('nota1').value,
        nota2: document.getElementById('nota2').value,
        // Adicione mais notas conforme necessário
    };

    fetch('/api/salvarNotas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(notas),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Notas salvas com sucesso!');
        } else {
            alert('Erro ao salvar as notas.');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar as notas.');
    });
}
