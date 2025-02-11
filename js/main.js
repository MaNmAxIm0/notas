// Inicializa variáveis globais
window.testData = [];
window.yearGrades = { year10: {}, year11: {} };
window.examData = {};
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
    if (!select) return; // Add safety check
    
    // Clear existing options
    select.innerHTML = '<option value="">Selecione a Disciplina</option>';
    
    // Add 12th year subjects
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
    
    // Remove existing info icon if present
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
        
        // Add info icon only for Physical Education
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

// Update these functions to be exposed to window scope, before the Firebase initialization code
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showMainContent = showMainContent;
window.showTab = showTab;
window.addExam = addExam;
window.addTest12thYear = addTest12thYear; // Add this line
window.logout = function() {
    signOut(auth)
      .then(() => {
        // Clear stored data
        window.testData = [];
        // Clear all inputs
        document.querySelectorAll('input').forEach(input => {
          input.value = '';
        });
        // Clear exam entries
        document.getElementById('exam-entries').innerHTML = '';
        // Clear year 12 finals
        document.querySelector('.year12-finals').innerHTML = '';
        // Reset all calculations
        calculateFinalGrades();
        // Show login screen
        showLogin();
      })
      .catch((error) => {
        alert('Erro de logout: ' + error.message);
      });
};

// Add improved error handling to the registration form
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
    const yearGrades = {
        year10: {},
        year11: {}
    };

    // Save year grades
    ['10', '11'].forEach(year => {
        const inputs = document.querySelectorAll(`.year${year}-grade`);
        inputs.forEach(input => {
            const subject = input.getAttribute('data-subject');
            const value = parseFloat(input.value);
            if (subject && !isNaN(value)) {
                yearGrades[`year${year}`][subject] = Math.round(value);
            }
        });
    });

    // Save exam grades
    const examRows = document.querySelectorAll('#exam-summary-body tr');
    const examData = {};

    examRows.forEach(row => {
        const subject = row.getAttribute('data-subject');
        if (subject) {
            const gradeElement = row.querySelector('.exam-grade-display');
            if (gradeElement) {
                const grade = parseFloat(gradeElement.textContent);
                if (!isNaN(grade)) {
                    const safeKey = subject.replace(/[.#$\/\[\]]/g, '_');
                    examData[safeKey] = {
                        subject: subject,
                        grade: Math.round(grade / 10 * 10) / 10,
                        weight: 0.3
                    };
                }
            }
        }
    });

    const data = {
        testData: window.testData || [],
        yearGrades: yearGrades,
        examData: examData
    };

    return dbSet(ref(database, 'users/' + userId), data);
};
window.loadUserData = function(userId) {
    get(ref(database, 'users/' + userId))
        .then((snapshot) => {
            const data = snapshot.val();

            // Inicializa dados padrão se não houver dados salvos
            if (!data) {
                window.testData = [];
                window.yearGrades = { year10: {}, year11: {} };
                window.examData = {};
                showMainContent();
                return;
            }

            // Carrega dados existentes
            window.testData = data.testData || [];
            window.yearGrades = data.yearGrades || { year10: {}, year11: {} };
            window.examData = data.examData || {};

            // Atualiza a interface
            updateFinalGrades12();
            calculateFinalGrades();
            showMainContent();
        })
        .catch((error) => {
            console.error("Erro técnico ao carregar dados:", error);
            // Não exibe alerta para o usuário
        });
};
// Function to set year grades
function setYearGrades(yearGrades) {
    if (!yearGrades) return;
    
    ['year10', 'year11'].forEach(year => {
        const yearNum = year.replace('year', '');
        if (yearGrades[year]) {
            Object.entries(yearGrades[year]).forEach(([subject, grade]) => {
                const input = document.querySelector(`.year${yearNum}-grade[data-subject="${subject}"]`);
                if (input && grade !== null) {
                    input.value = Number(grade).toFixed(1);
                }
            });
        }
    });
}

// Function to set exam grades
function setExamGrades(examData) {
    if (!examData) return;
    
    const tbody = document.getElementById('exam-summary-body');
    tbody.innerHTML = '';
    
    Object.entries(examData).forEach(([subject, data]) => {
        if (subject !== 'average') {
            const tr = document.createElement('tr');
            tr.setAttribute('data-subject', subject);
            tr.innerHTML = `
                <td>${subject}</td>
                <td class="exam-grade-display">${(data.grade * 10).toFixed(1)}</td>
                <td>
                    <button onclick="removeExamGrade(this)" class="remove-exam">Remover</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    });
}

// Function to get year grades
function getYearGrades(year) {
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
}

// Initialize user data when creating new account
window.initializeUserData = function(userId) {
    const emptyData = {
      testData: [],
      yearGrades: {
        year10: {},
        year11: {}
      },
      examData: {}
    };
    
    dbSet(ref(database, 'users/' + userId), emptyData)
      .then(() => {
        window.testData = [];
        showMainContent();
      });
};

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

// Update auth state observer to load user data
onAuthStateChanged(auth, (user) => {
    if (user) {
      loadUserData(user.uid);
      showMainContent();
    } else {
      showLogin();
    }
});

// Update registration handler to initialize user data
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

// Função para fazer login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Impede o envio do formulário

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Verifica se os campos estão preenchidos
    if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Faz o login com Firebase Auth
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('Usuário autenticado:', userCredential.user.uid);

            // Carrega os dados do usuário após o login
            loadUserData(userCredential.user.uid);

            // Exibe o conteúdo principal
            showMainContent();
        })
        .catch((error) => {
            console.error('Erro de login:', error.code, error.message);

            // Exibe mensagens de erro amigáveis
            switch (error.code) {
                case 'auth/invalid-email':
                    alert('Email inválido. Por favor, insira um email válido.');
                    break;
                case 'auth/user-disabled':
                    alert('Esta conta foi desativada. Entre em contato com o suporte.');
                    break;
                case 'auth/user-not-found':
                    alert('Usuário não encontrado. Verifique o email ou crie uma nova conta.');
                    break;
                case 'auth/wrong-password':
                    alert('Senha incorreta. Tente novamente.');
                    break;
                default:
                    alert('Erro ao fazer login: ' + error.message);
            }
        });
});

// Existing JavaScript functions
function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabId}-tab`).style.display = 'block';
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Call showTab('year10') when page loads to ensure correct initial state
document.addEventListener('DOMContentLoaded', function() {
    populateSubjectSelect();
    createYearInputs();
    showTab('year10'); // Add this line
});

function createYearInputs() {
  // Only create inputs if they don't already exist
  const year10Div = document.getElementById('year10');
  const year11Div = document.getElementById('year11');
  
  // Clear existing content first
  year10Div.innerHTML = '';
  year11Div.innerHTML = '';
  
  // Create inputs for 10th year
  subjects.year10.forEach(subject => {
    year10Div.innerHTML += `
      <div class="subject">
        <label>${subject}:</label>
        <input type="number" min="0" max="20" step="1" class="grade-input year10-grade" 
               data-subject="${subject}" placeholder="0-20">
      </div>
    `;
  });

  // Create inputs for 11th year
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

// New function to add exam input
function addExam() {
    const examContainer = document.getElementById('exam-entries');
    const examDiv = document.createElement('div');
    examDiv.className = 'exam-entry';
    examDiv.innerHTML = `
        <select class="exam-subject">
            ${getAllSubjects().map(subject => 
                `<option value="${subject}">${subject}</option>`
            ).join('')}
        </select>
        <input type="number" min="0" max="200" step="1" class="exam-grade" placeholder="0-200">
        <input type="number" min="0" max="100" step="1" class="exam-weight" placeholder="Peso %">
        <button onclick="this.parentElement.remove(); if(auth.currentUser) saveUserData(auth.currentUser.uid);">Remover</button>
    `;
    examContainer.appendChild(examDiv);

    // Add change event listeners to save data when inputs change
    examDiv.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('change', () => {
            if (auth.currentUser) {
                saveUserData(auth.currentUser.uid);
            }
        });
    });
}

// Helper function to get all unique subjects
function getAllSubjects() {
    return [...new Set([...subjects.year10, ...subjects.year11, ...subjects.year12])];
}

// Function to calculate exam grades
function calculateExamGrades() {
    const examRows = document.querySelectorAll('#exam-summary-body tr');
    const examGrades = {};

    examRows.forEach(row => {
        const subject = row.getAttribute('data-subject');
        const grade = parseFloat(row.querySelector('.exam-grade-display').textContent);

        if (subject && !isNaN(grade)) {
            examGrades[subject] = {
                grade: grade / 10, // Converte de 200 para 20
                weight: 0.3 // Peso fixo de 30%
            };
        }
    });

    // Calcula a média dos exames, se houver notas
    const grades = Object.values(examGrades).map(g => g.grade);
    if (grades.length > 0) {
        examGrades.average = grades.reduce((a, b) => a + b, 0) / grades.length;
    }

    return examGrades;
}

function calculateFinalGrades() {
    // Calcula as médias dos anos
    const year10Average = calculateYearAverage(10);
    const year11Average = calculateYearAverage(11);
    const year12Average = calculateYear12Average();

    // Calcula as notas dos exames
    const examGrades = calculateExamGrades(); // Adicione esta linha

    // Atualiza os elementos da interface
    const year10AvgElem = document.getElementById('year10-average');
    const year11AvgElem = document.getElementById('year11-average');
    const year12AvgElem = document.getElementById('year12-average');
    if (year10AvgElem && year11AvgElem && year12AvgElem) {
        year10AvgElem.textContent = year10Average ? year10Average.toFixed(1) : '-';
        year11AvgElem.textContent = year11Average ? year11Average.toFixed(1) : '-';
        year12AvgElem.textContent = year12Average ? year12Average.toFixed(1) : '-';
    }

    // Calcula e atualiza as médias finais
    const cifAverage = calculateSecondaryEducationAverage(); // Obtém o valor na escala de 0-200
    const finalAverage = calculateFinalAverage(cifAverage / 10, examGrades); // Converte para a escala de 0-20

    // Atualiza a exibição das médias finais
    document.getElementById('total-average-no-exams').textContent = cifAverage ? cifAverage.toFixed(1) : '-';
    document.getElementById('total-average-with-exams').textContent = finalAverage ? (finalAverage * 10).toFixed(1) : '-';

    // Atualiza a tabela de resumo
    updateSummaryTable(year10Average, year11Average, year12Average, examGrades);
}
function calculateYearAverage(year) {
    const grades = document.querySelectorAll(`.year${year}-grade`);
    let total = 0;
    let count = 0;

    grades.forEach(input => {
        const value = parseFloat(input.value);
        if (!isNaN(value)) {
            total += Math.round(value);
            count++;
        }
    });

    return count > 0 ? Math.round((total / count) * 10) / 10 : null;
}

function calculateYear12Average() {
    if (!window.testData || window.testData.length === 0) return null;

    // Group tests by subject
    const subjectTests = {};
    window.testData.forEach(test => {
        if (!subjectTests[test.subject]) {
            subjectTests[test.subject] = [];
        }
        subjectTests[test.subject].push(test);
    });

    // Calculate average for each subject
    let totalGrade = 0;
    let subjectCount = 0;

    Object.entries(subjectTests).forEach(([subject, tests]) => {
        const subjectGrade = calculateSubjectAverage(tests, subject);
        if (subjectGrade !== null) {
            totalGrade += subjectGrade;
            subjectCount++;
        }
    });

    return subjectCount > 0 ? Math.round((totalGrade / subjectCount) * 10) / 10 : null;
}

function calculateSubjectAverage(tests, subject) {
    if (!tests || tests.length === 0) return null;

    // Group tests by domain
    const domainTests = {};
    tests.forEach(test => {
        if (!domainTests[test.domain]) {
            domainTests[test.domain] = [];
        }
        domainTests[test.domain].push(test);
    });

    let weightedTotal = 0;
    let totalWeight = 0;

    // Calculate weighted average for each domain
    Object.entries(domainTests).forEach(([domain, domainTests]) => {
        const domainWeight = getDomainWeight(subject, domain);
        const domainAverage = domainTests.reduce((sum, test) => sum + test.grade, 0) / domainTests.length;
        weightedTotal += domainAverage * domainWeight;
        totalWeight += domainWeight;
    });

    return totalWeight > 0 ? Math.round(weightedTotal) : null;
}

function getDomainWeight(subject, domainName) {
    if (subjectDomains[subject]) {
        const domain = subjectDomains[subject].find(d => d.name === domainName);
        return domain ? domain.weight : 0;
    }
    return 0;
}

function calculateCIFAverage(year10Avg, year11Avg, year12Avg) {
    const validGrades = [year10Avg, year11Avg, year12Avg].filter(grade => grade !== null);
    if (validGrades.length === 0) return null;

    // Apply weights: 10th year - 30%, 11th year - 30%, 12th year - 40%
    let weightedSum = 0;
    let totalWeight = 0;

    if (year10Avg !== null) {
        weightedSum += year10Avg * 0.3;
        totalWeight += 0.3;
    }
    if (year11Avg !== null) {
        weightedSum += year11Avg * 0.3;
        totalWeight += 0.3;
    }
    if (year12Avg !== null) {
        weightedSum += year12Avg * 0.4;
        totalWeight += 0.4;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : null;
}

function calculateFinalAverage() {
    const examWeight = parseFloat(document.getElementById('examWeight').value) / 100;
    const gradesWeight = 1 - examWeight;

    let totalGrades = 0;
    let subjectCount = 0;

    // Percorre todas as notas na pauta
    document.querySelectorAll('#summary-body tr').forEach(row => {
        const gradeCell = row.children[6]; // Coluna "Nota na Pauta"
        if (gradeCell) {
            const grade = parseFloat(gradeCell.textContent);
            if (!isNaN(grade)) {
                totalGrades += grade;
                subjectCount++;
            }
        }
    });

    // Calcular média das notas na pauta (em escala 0-20)
    const averageGrades = subjectCount > 0 ? totalGrades / subjectCount : null;

    // Obter média dos exames (já está na escala de 0-20)
    const examGrades = calculateExamGrades();
    const examAverage = examGrades?.average || null;

    // Calcular a média final de acesso ao ensino superior
    if (averageGrades !== null && examAverage !== null) {
        return ((averageGrades * gradesWeight) + (examAverage * examWeight)) * 10; // Converter para 0-200
    }

    return null;
}


function updateSummaryTable(year10Avg, year11Avg, year12Avg, examGrades) {
    const tbody = document.getElementById('summary-body');
    tbody.innerHTML = '';

    const allSubjects = getAllSubjects();

    // Function to format number with minimum decimal places
    const formatNumber = (num) => {
        if (num === null || isNaN(num)) return '-';
        return Number(num.toFixed(3)).toString();
    };

    // Function to format CIF with 2 decimal places only if needed
    const formatCIF = (num) => {
        if (num === null || isNaN(num)) return '-';
        return Math.round(num * 100) / 100 === Math.round(num) ? 
            Math.round(num).toString() : 
            (Math.round(num * 100) / 100).toString();
    };

    allSubjects.forEach(subject => {
        const row = document.createElement('tr');
        const year10Grade = getGrade(subject, 10);
        const year11Grade = getGrade(subject, 11);
        const year12Grade = getSubjectGrade12(subject);
        const examGrade = examGrades[subject] ? examGrades[subject].grade : null;
        
        let finalCIF;
        
        if (subject === 'Matemática A' || subject === 'Português' || subject === 'Educação Física') {
            const grades = [year10Grade, year11Grade, year12Grade].filter(g => g !== null);
            if (grades.length > 0) {
                finalCIF = Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length * 100) / 100;
            }
        } else {
            const yearGrades = [
                { grade: year10Grade, weight: 0.3 },
                { grade: year11Grade, weight: 0.3 },
                { grade: year12Grade, weight: 0.4 }
            ].filter(g => g.grade !== null);
            
            if (yearGrades.length > 0) {
                const weightedSum = yearGrades.reduce((sum, g) => sum + g.grade * g.weight, 0);
                const totalWeight = yearGrades.reduce((sum, g) => sum + g.weight, 0);
                finalCIF = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : null;
            }
        }
        
        let finalGrade = finalCIF;
        if (examGrade !== null && finalCIF !== null) {
            finalCIF = Math.round((finalCIF * 0.5 + examGrade * 0.5) * 100) / 100;
            finalGrade = Math.round(finalCIF);
        }

        row.innerHTML = `
            <td>${subject}</td>
            <td>${year10Grade !== null ? Math.round(year10Grade) : '-'}</td>
            <td>${year11Grade !== null ? Math.round(year11Grade) : '-'}</td>
            <td>${year12Grade !== null ? formatNumber(year12Grade) : '-'}</td>
            <td>${examGrade !== null ? (Math.round(examGrade * 10) / 10).toFixed(1) : '-'}</td>
            <td>${formatCIF(finalCIF)}</td>
            <td>${finalGrade !== null ? Math.round(finalGrade) : '-'}</td>
        `;
        tbody.appendChild(row);
    });

    // Format averages with appropriate decimal places
    const formatAverage = (num) => {
        if (num === null || isNaN(num)) return '-';
        // Round to 3 decimal places and remove unnecessary trailing zeros
        const rounded = Math.round(num * 1000) / 1000;
        return rounded.toString();
    };

    // Update year averages display
    document.getElementById('year10-average').textContent = 
        year10Avg ? formatAverage(year10Avg) : '-';
    document.getElementById('year11-average').textContent = 
        year11Avg ? formatAverage(year11Avg) : '-';
    document.getElementById('year12-average').textContent = 
        year12Avg ? formatAverage(year12Avg) : '-';

    // Update final averages
    const cifAverage = calculateSecondaryEducationAverage();
    const examAverage = examGrades?.average ? examGrades.average * 10 : null;
    
const finalAverage = calculateFinalAverage();
document.getElementById('total-average-with-exams').textContent = 
    finalAverage ? finalAverage.toFixed(1) : '-';
    
    let finalAccessAverage = null;
    if (cifAverage !== null && examAverage !== null) {
        finalAccessAverage = Math.round((cifAverage * 0.5 + examAverage * 0.5) * 1000) / 1000;
    }
    
    const averageWithExamsElement = document.getElementById('total-average-with-exams');
    averageWithExamsElement.innerHTML = `
        ${finalAccessAverage ? formatAverage(finalAccessAverage) : '-'}
        ${finalAccessAverage ? '<div style="font-size: 12px; color: #666; margin-top: 5px;">50% CIF + 50% Exames</div>' : ''}
    `;
}

// Function to get grade
function getGrade(subject, year) {
    const input = document.querySelector(`.year${year}-grade[data-subject="${subject}"]`);
    const value = input ? parseFloat(input.value) : null;
    return value !== null && !isNaN(value) ? Math.round(value) : null;
}

// Function to get subject grade for 12th year
function getSubjectGrade12(subject) {
    if (!window.testData) return null;
    const tests = window.testData.filter(test => test.subject === subject);
    if (tests.length === 0) return null;

    const domains = subjectDomains[subject] || [];
    let subjectFinalGrade = 0;
    let totalWeight = 0;

    domains.forEach(domain => {
        const domainTests = tests.filter(t => t.domain === domain.name);
        if (domainTests.length > 0) {
            // Calculate raw average for the domain
            const rawAvg = domainTests.reduce((sum, t) => sum + t.grade, 0) / domainTests.length;
            // Apply domain weight (percentage * 0.01)
            const weightedAvg = rawAvg * domain.weight;
            subjectFinalGrade += weightedAvg;
            totalWeight += domain.weight;
        }
    });

    // Round the final grade to the nearest integer before returning
    return totalWeight > 0 ? Math.round(subjectFinalGrade) : null;
}

// Function to calculate subject CIF
function calculateSubjectCIF(year10Grade, year11Grade, year12Grade) {
    const grades = [
        { grade: year10Grade, weight: 0.3 },
        { grade: year11Grade, weight: 0.3 },
        { grade: year12Grade, weight: 0.4 }
    ].filter(g => g.grade !== null);

    if (grades.length === 0) return null;

    const weightedSum = grades.reduce((sum, g) => sum + g.grade * g.weight, 0);
    const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
    
    let regularCIF = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
    
    // Get exam grades
    const examGrades = calculateExamGrades();
    
    // If subject has an exam, calculate weighted average with exam grade
    if (examGrades && examGrades[subject] && regularCIF !== null) {
        const roundedCIF = Math.round(regularCIF);
        return Math.round(((roundedCIF * 0.7) + (examGrades[subject].grade * 0.3)));
    }
    
    return regularCIF;
}

// Function to calculate secondary education average
function calculateSecondaryEducationAverage() {
    const subjects = getAllSubjects();
    let totalGrade = 0;
    let subjectCount = 0;

    subjects.forEach(subject => {
        const year10Grade = getGrade(subject, 10);
        const year11Grade = getGrade(subject, 11);
        const year12Grade = getSubjectGrade12(subject);
        
        let subjectCIF;
        
        if (subject === 'Matemática A' || subject === 'Português' || subject === 'Educação Física') {
            const grades = [year10Grade, year11Grade, year12Grade].filter(g => g !== null);
            if (grades.length > 0) {
                subjectCIF = Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length * 100) / 100;
            }
        } else {
            const yearGrades = [
                { grade: year10Grade, weight: 0.3 },
                { grade: year11Grade, weight: 0.3 },
                { grade: year12Grade, weight: 0.4 }
            ].filter(g => g.grade !== null);
            
            if (yearGrades.length > 0) {
                const weightedSum = yearGrades.reduce((sum, g) => sum + g.grade * g.weight, 0);
                const totalWeight = yearGrades.reduce((sum, g) => sum + g.weight, 0);
                subjectCIF = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : null;
            }
        }
        
        const examGrades = calculateExamGrades();
        if (examGrades && examGrades[subject] && subjectCIF !== null) {
            subjectCIF = Math.round((subjectCIF * 0.7 + examGrades[subject].grade * 0.3) * 100) / 100;
        }
        
        if (subjectCIF !== null) {
            totalGrade += subjectCIF;
            subjectCount++;
        }
    });

    return subjectCount > 0 ? Math.round((totalGrade / subjectCount) * 1000) / 1000 : null;
}

// Function to add exam grade
function addExamGrade(input) {
    const examRow = input.closest('.exam-input-row');
    const subject = examRow.querySelector('.exam-subject').value;
    const grade = parseFloat(input.value);

    if (!subject || isNaN(grade)) {
        alert('Por favor selecione uma disciplina e insira uma nota válida');
        return;
    }
    if (grade < 0 || grade > 200) {
        alert('A nota deve estar entre 0 e 200');
        input.value = '';
        return;
    }

    // Check if an exam for this subject already exists
    const existingExam = document.querySelector(`#exam-summary-body tr[data-subject="${subject}"]`);
    if (existingExam) {
        existingExam.querySelector('.exam-grade-display').textContent = grade.toFixed(1);
    } else {
        const tr = document.createElement('tr');
        tr.setAttribute('data-subject', subject);
        tr.innerHTML = `
            <td>${subject}</td>
            <td class="exam-grade-display">${grade.toFixed(1)}</td>
            <td>
                <button onclick="removeExamGrade(this)" class="remove-exam">Remover</button>
            </td>
        `;
        document.getElementById('exam-summary-body').appendChild(tr);
    }

    // Reset input fields
    examRow.querySelector('.exam-subject').value = '';
    input.value = '';

    // Save to database
    if (auth.currentUser) {
        saveUserData(auth.currentUser.uid);
    }

    // Update calculations
    calculateFinalGrades();
}

// Function to remove exam grade
function removeExamGrade(button) {
    const row = button.closest('tr');
    row.remove();
    
    // Save to database
    if (auth.currentUser) {
        saveUserData(auth.currentUser.uid);
    }

    // Update calculations
    calculateFinalGrades();
}

// Make functions globally available
window.addExamGrade = addExamGrade;
window.removeExamGrade = removeExamGrade;

document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to all year grade inputs
    document.querySelectorAll('.year10-grade, .year11-grade').forEach(input => {
        input.addEventListener('change', () => {
            if (auth.currentUser) {
                saveUserData(auth.currentUser.uid);
            }
        });
    });
});

// New function to add test for 12th year
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

    // Inicializa o array testData se não existir
    if (!window.testData) {
        window.testData = [];
    }

    // Adiciona o novo teste
    window.testData.push({
        subject: subject,
        name: testName,
        grade: grade,
        domain: domain
    });

    // Limpa os campos de entrada
    document.getElementById('testName').value = '';
    document.getElementById('testGrade').value = '';
    document.getElementById('testDomain').value = '';

    // Atualiza a interface
    updateFinalGrades12();
    calculateFinalGrades(); // Chama a função para recalcular as médias

    // Salva no banco de dados se o usuário estiver logado
    if (auth.currentUser) {
        saveUserData(auth.currentUser.uid);
    }
}

// Add event listener to update domains when subject changes 
document.getElementById('select12Subject').addEventListener('change', function() {
    updateDomainSelect(this.value);
});

// Add click handler to close popup when clicking outside
document.addEventListener('click', function(event) {
    const popup = document.getElementById('domainInfoPopup');
    if (event.target === popup) {
        closePopup();
    }
});

// Add JavaScript functions to handle the popup
function showPopup() {
    document.getElementById('domainInfoPopup').style.display = 'flex';
}

window.closePopup = function() {
    document.getElementById('domainInfoPopup').style.display = 'none';
}

// New function to get exam grades
function getExamGrades() {
    const examRows = document.querySelectorAll('#exam-summary-body tr');
    const examGrades = {};

    examRows.forEach(row => {
        const subject = row.getAttribute('data-subject');
        const grade = parseFloat(row.querySelector('.exam-grade-display').textContent);
        
        if (subject && !isNaN(grade)) {
            examGrades[subject] = {
                grade: grade / 10, // Convert from 200-point to 20-point scale
                weight: 0.3 // Fixed weight of 30%
            };
        }
    });

    // Calculate average if there are any grades
    const grades = Object.values(examGrades).map(g => g.grade);
    if (grades.length > 0) {
        examGrades.average = grades.reduce((a, b) => a + b, 0) / grades.length;
    }

    return examGrades;
}
function updateFinalGrades12() {
    if (!window.testData) return;

    const summaryContainer = document.querySelector('.year12-finals');
    if (!summaryContainer) {
        console.error('Container .year12-finals não encontrado');
        return;
    }

    // Limpa o conteúdo existente
    summaryContainer.innerHTML = '';

    // Cria e insere a exibição da média
    const averageDisplay = document.createElement('div');
    averageDisplay.className = 'year12-quick-average';
    averageDisplay.style.cssText = `
        background: #ffe6ea;
        display: inline-block;
        padding: 8px 15px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        text-align: center;
        margin-left: 15px;
        vertical-align: middle;
    `;

    // Calcula a média geral
    const subjectTests = {};
    let totalGrade = 0;
    let subjectCount = 0;

    window.testData.forEach(test => {
        if (!subjectTests[test.subject]) {
            subjectTests[test.subject] = [];
        }
        subjectTests[test.subject].push(test);
    });

    // Processa disciplinas não-Português primeiro
    Object.entries(subjectTests)
        .filter(([subject]) => subject !== 'Português')
        .forEach(([subject, tests]) => {
            const subjectGrade = processSubject(subject, tests, summaryContainer);
            if (subjectGrade !== null) {
                totalGrade += subjectGrade;
                subjectCount++;
            }
        });

    // Processa Português por último
    if (subjectTests['Português']) {
        const portugueseGrade = processSubject('Português', subjectTests['Português'], summaryContainer);
        if (portugueseGrade !== null) {
            totalGrade += portugueseGrade;
            subjectCount++;
        }
    }

    // Atualiza a exibição da média
    const yearAverage = subjectCount > 0 ? totalGrade / subjectCount : 0;
    averageDisplay.innerHTML = `
        <strong>Média 12º Ano:</strong>
        <span style="font-size: 1.2em; margin-left: 5px">${yearAverage.toFixed(1)}</span>
    `;

    // Insere a exibição da média ao lado do título
    const title = document.querySelector('#year12-tab h2');
    title.appendChild(averageDisplay);
}
function calculateSubjectFinalGrade(subject) {
    if (!window.testData || window.testData.length === 0) return null; // Verifica se há dados de testes

    // Filtra os testes para a disciplina específica
    const tests = window.testData.filter(test => test.subject === subject);
    if (tests.length === 0) return null; // Se não houver testes, retorna null

    const domains = subjectDomains[subject] || []; // Obtém os domínios da disciplina
    let subjectFinalGrade = 0;
    let totalWeight = 0;

    // Calcula a nota final ponderada
    domains.forEach(domain => {
        const domainTests = tests.filter(t => t.domain === domain.name);
        if (domainTests.length > 0) {
            const rawAvg = domainTests.reduce((sum, t) => sum + t.grade, 0) / domainTests.length; // Média bruta
            const weightedAvg = rawAvg * domain.weight; // Aplica o peso do domínio
            subjectFinalGrade += weightedAvg;
            totalWeight += domain.weight;
        }
    });

    // Retorna a nota final se houver peso total
    return totalWeight > 0 ? Math.round(subjectFinalGrade * 10) / 10 : null; // Arredonda para uma casa decimal
}
function processSubject(subject, tests, container) {
    const domains = subjectDomains[subject] || [];
    const finalGrade = calculateSubjectFinalGrade(subject);
    
    // Criar container
    const grid = document.createElement('div');
    grid.className = 'domain-grid';
    
    // Adicionar domínios
    domains.forEach((domain, index) => {
        const domainCell = document.createElement('div');
        const isMobile = window.innerWidth <= 768;
        
        // Mobile: Último domínio ímpar ocupa 2 colunas
        if (isMobile && domains.length % 2 !== 0 && index === domains.length - 1) {
            domainCell.className = 'domain-cell single';
        } else {
            domainCell.className = 'domain-cell';
        }
        
        // Conteúdo do domínio
        domainCell.innerHTML = `
            <div class="domain-header">
                ${domain.name} (${domain.weight * 100}%)
            </div>
            <div class="domain-tests">
                ${tests.filter(t => t.domain === domain.name).map(test => `
                    <div class="test-grade">
                        <span>${test.name}</span>
                        <strong>${test.grade.toFixed(1)}</strong>
                        <button onclick="removeTest(${window.testData.indexOf(test)})">×</button>
                    </div>
                `).join('')}
            </div>
        `;
        
        grid.appendChild(domainCell);
    });
    
    // Adicionar média final
    const footer = document.createElement('div');
    footer.className = 'final-average-footer';
    footer.textContent = `Média Final: ${finalGrade.toFixed(1)}`;
    grid.appendChild(footer);
    
    // Adicionar ao container principal
    const subjectDiv = document.createElement('div');
    subjectDiv.innerHTML = `<h4>${subject}</h4>`;
    subjectDiv.appendChild(grid);
    container.appendChild(subjectDiv);
}

function removeTest(testIndex, subject, domain) {
    if (confirm('Tem certeza que deseja remover este teste?')) {
        window.testData = window.testData.filter((test, index) => index !== testIndex);
        updateFinalGrades12();
        calculateFinalGrades();
        
        // Save to database if user is logged in
        if (auth.currentUser) {
            saveUserData(auth.currentUser.uid);
        }
    }
}

// Make it available globally
window.removeTest = removeTest;

// Add the updateWeights function to the global scope
window.updateWeights = function(examWeight) {
    const gradesWeight = 100 - examWeight;
    document.getElementById('gradesWeight').textContent = gradesWeight + '%';
    calculateFinalGrades();
};
document.addEventListener('DOMContentLoaded', function() {
    // Garante que o DOM esteja carregado antes de acessar elementos
    const examSummaryBody = document.getElementById('exam-summary-body');
    if (examSummaryBody) {
        examSummaryBody.innerHTML = ''; // Limpa o conteúdo do elemento
    } else {
        console.error('Elemento #exam-summary-body não encontrado');
    }

    // Define a função calculateSubjectFinalGrade
    function calculateSubjectFinalGrade(subject) {
        if (!window.testData || window.testData.length === 0) return null;

        const tests = window.testData.filter(test => test.subject === subject);
        if (tests.length === 0) return null;

        const domains = subjectDomains[subject] || [];
        let subjectFinalGrade = 0;
        let totalWeight = 0;

        domains.forEach(domain => {
            const domainTests = tests.filter(t => t.domain === domain.name);
            if (domainTests.length > 0) {
                const rawAvg = domainTests.reduce((sum, t) => sum + t.grade, 0) / domainTests.length;
                const weightedAvg = rawAvg * domain.weight;
                subjectFinalGrade += weightedAvg;
                totalWeight += domain.weight;
            }
        });

        return totalWeight > 0 ? Math.round(subjectFinalGrade * 10) / 10 : null;
    }

    // Função para atualizar as notas finais do 12º ano
    function updateFinalGrades12() {
        if (!window.testData) return;

        const summaryContainer = document.querySelector('.year12-finals');
        if (!summaryContainer) {
            console.error('Container .year12-finals não encontrado');
            return;
        }

        // Limpa o conteúdo existente
        summaryContainer.innerHTML = '';

        // Cria e insere a exibição da média
        const averageDisplay = document.createElement('div');
        averageDisplay.className = 'year12-quick-average';
        averageDisplay.style.cssText = `
            background: #ffe6ea;
            display: inline-block;
            padding: 8px 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
            margin-left: 15px;
            vertical-align: middle;
        `;

        // Calcula a média geral
        const subjectTests = {};
        let totalGrade = 0;
        let subjectCount = 0;

        window.testData.forEach(test => {
            if (!subjectTests[test.subject]) {
                subjectTests[test.subject] = [];
            }
            subjectTests[test.subject].push(test);
        });

        // Processa disciplinas não-Português primeiro
        Object.entries(subjectTests)
            .filter(([subject]) => subject !== 'Português')
            .forEach(([subject, tests]) => {
                const subjectGrade = processSubject(subject, tests, summaryContainer);
                if (subjectGrade !== null) {
                    totalGrade += subjectGrade;
                    subjectCount++;
                }
            });

        // Processa Português por último
        if (subjectTests['Português']) {
            const portugueseGrade = processSubject('Português', subjectTests['Português'], summaryContainer);
            if (portugueseGrade !== null) {
                totalGrade += portugueseGrade;
                subjectCount++;
            }
        }

        // Atualiza a exibição da média
        const yearAverage = subjectCount > 0 ? totalGrade / subjectCount : 0;
        averageDisplay.innerHTML = `
            <strong>Média 12º Ano:</strong>
            <span style="font-size: 1.2em; margin-left: 5px">${yearAverage.toFixed(1)}</span>
        `;

        // Insere a exibição da média ao lado do título
        const title = document.querySelector('#year12-tab h2');
        title.appendChild(averageDisplay);
    }

    // Função para processar uma disciplina e exibir os resultados
    function processSubject(subject, tests, container) {
        const domains = subjectDomains[subject] || [];
        const finalGrade = calculateSubjectFinalGrade(subject);

        // Cria o container
        const grid = document.createElement('div');
        grid.className = 'domain-grid';

        // Adiciona os domínios
        domains.forEach((domain, index) => {
            const domainCell = document.createElement('div');
            const isMobile = window.innerWidth <= 768;

            // Mobile: Último domínio ímpar ocupa 2 colunas
            if (isMobile && domains.length % 2 !== 0 && index === domains.length - 1) {
                domainCell.className = 'domain-cell single';
            } else {
                domainCell.className = 'domain-cell';
            }

            // Conteúdo do domínio
            domainCell.innerHTML = `
                <div class="domain-header">
                    ${domain.name} (${domain.weight * 100}%)
                </div>
                <div class="domain-tests">
                    ${tests.filter(t => t.domain === domain.name).map(test => `
                        <div class="test-grade">
                            <span>${test.name}</span>
                            <strong>${test.grade.toFixed(1)}</strong>
                            <button onclick="removeTest(${window.testData.indexOf(test)})">×</button>
                        </div>
                    `).join('')}
                </div>
            `;

            grid.appendChild(domainCell);
        });

        // Adiciona a média final
        const footer = document.createElement('div');
        footer.className = 'final-average-footer';
        footer.textContent = `Média Final: ${finalGrade.toFixed(1)}`;
        grid.appendChild(footer);

        // Adiciona ao container principal
        const subjectDiv = document.createElement('div');
        subjectDiv.innerHTML = `<h4>${subject}</h4>`;
        subjectDiv.appendChild(grid);
        container.appendChild(subjectDiv);

        return finalGrade;
    }

    // Função para remover um teste
    window.removeTest = function(testIndex) {
        if (confirm('Tem certeza que deseja remover este teste?')) {
            window.testData = window.testData.filter((test, index) => index !== testIndex);
            updateFinalGrades12();
            calculateFinalGrades();

            // Salva no banco de dados se o usuário estiver logado
            if (auth.currentUser) {
                saveUserData(auth.currentUser.uid);
            }
        }
    };

    // Inicializa os pesos dos exames
    const examWeightInput = document.getElementById('examWeight');
    if (examWeightInput) {
        window.updateWeights(examWeightInput.value);
    } else {
        console.error('Elemento examWeight não encontrado');
    }

    // Popula o dropdown de disciplinas dos exames
    const examSubjectSelect = document.querySelector('.exam-subject');
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
document.addEventListener('DOMContentLoaded', function() {
    const examSummaryBody = document.getElementById('exam-summary-body');
    if (examSummaryBody) {
        examSummaryBody.innerHTML = ''; // Limpa o conteúdo do elemento
    } else {
        console.error('Elemento #exam-summary-body não encontrado');
    }
});
