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


const subjects = {
  year10: ['Matemática A', 'Português', 'Inglês', 'Educação Física', 'Filosofia', 'Economia A', 'Geografia A'],
  year11: ['Matemática A', 'Português', 'Inglês', 'Educação Física', 'Filosofia', 'Economia A', 'Geografia A'],
  year12: ['Aplicações Informáticas B', 'Economia C', 'Português', 'Matemática A', 'Educação Física']
};

// Update the subjectDomains object
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

function createYearInputs() {
  // Create inputs for 10th year
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

  // Create inputs for 11th year
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

function calculateSubjectFinalGrade(subject, year) {
  if (year === 12) {
    // Ensure window.testData exists
    if (!window.testData) window.testData = [];
    
    const tests = window.testData.filter(test => test.subject === subject);
      
    if (tests.length === 0) return null;
    
    if (subjectDomains[subject]) {
      const domainSums = new Array(subjectDomains[subject].length).fill(0);
      const domainCounts = new Array(subjectDomains[subject].length).fill(0);
      
      tests.forEach(test => {
        // Add null checks
        if (!test || !test.grade || !test.domain) return;
        
        const grade = parseFloat(test.grade);
        const domainText = test.domain;
        const domainIndex = subjectDomains[subject].findIndex(d => 
          domainText.startsWith(d.name));
        
        if (!isNaN(grade) && domainIndex !== -1) {
          domainSums[domainIndex] += grade;
          domainCounts[domainIndex]++;
        }
      });

      const domainAverages = domainSums.map((sum, index) => 
        domainCounts[index] > 0 ? sum / domainCounts[index] : 0
      );

      // Add null check for subjectDomains[subject]
      if (!domainAverages.length) return null;

      return domainAverages.reduce((acc, avg, index) => {
        if (!subjectDomains[subject][index]) return acc;
        return acc + avg * subjectDomains[subject][index].weight;
      }, 0);
    } else {
      // Default calculation for subjects without custom domains
      let totalSum = 0;
      let count = 0;
      tests.forEach(test => {
        if (!test || !test.grade) return;
        const grade = parseFloat(test.grade);
        if (!isNaN(grade)) {
          totalSum += grade;
          count++;
        }
      });
      return count > 0 ? totalSum / count : null;
    }
  } else {
    const grade = document.querySelector(`.year${year}-grade[data-subject="${subject}"]`);
    if (!grade) return null;
    const value = parseFloat(grade.value);
    return !isNaN(value) ? value : null;
  }
}

function addTest(subject) {
  const container = document.getElementById(`${subject.replace(/\s+/g, '')}-tests`);
  const newTest = document.createElement('div');
  newTest.className = 'test-container';
  
  let domainOptions = '';
  if (subjectDomains[subject]) {
    domainOptions = subjectDomains[subject]
      .map((domain, index) => 
        `<option value="${index}">${domain.name} (${(domain.weight * 100)}%)</option>`
      ).join('');
  } else {
    domainOptions = `
      <option value="1">Domínio 1</option>
      <option value="2">Domínio 2</option>
    `;
  }

  newTest.innerHTML = `
    <input type="text" placeholder="Nome do Teste" class="test-name">
    <input type="number" min="0" max="20" step="0.1" class="grade-input" placeholder="0-20">
    <select class="domain-select">
      ${domainOptions}
    </select>
    <button onclick="this.parentElement.remove()">Remover</button>
  `;
  container.appendChild(newTest);
}

// New function to populate subject select
function populateSubjectSelect() {
    const select = document.getElementById('select12Subject');
    select.innerHTML = '<option value="">Selecione a Disciplina</option>';
    subjects.year12.forEach(subject => {
        select.innerHTML += `<option value="${subject}">${subject}</option>`;
    });
}

// New function to update domain select based on subject
function updateDomainSelect(subject) {
    const domainSelect = document.getElementById('testDomain');
    const infoIcon = document.getElementById('domainInfoIcon');
    domainSelect.innerHTML = '';
    
    if (infoIcon) {
        infoIcon.remove();
    }

    if (subjectDomains[subject]) {
        subjectDomains[subject].forEach((domain, index) => {
            domainSelect.innerHTML += `
                <option value="${index}">${domain.name} (${domain.weight * 100}%)</option>
            `;
        });

        // Add info icon for Physical Education
        if (subject === 'Educação Física') {
            const icon = document.createElement('span');
            icon.id = 'domainInfoIcon';
            icon.className = 'domain-info-icon';
            icon.innerHTML = '❔';
            icon.onclick = showPopup;
            icon.title = 'Ver perfil de desempenho';
            domainSelect.parentNode.insertBefore(icon, domainSelect.nextSibling);
        }
    }
}

// New function to add test in 12th year
function addTest12thYear() {
    const subject = document.getElementById('select12Subject').value;
    const testName = document.getElementById('testName').value || 'Teste'; // Default to 'Teste' if empty
    const grade = document.getElementById('testGrade').value;
    const domain = document.getElementById('testDomain').value;
    
    if (!subject || !grade) {
        alert('Por favor preencha a disciplina e a nota');
        return;
    }
    
    // Store test data in memory instead of displaying in summary table
    if (!window.testData) window.testData = [];
    window.testData.push({
        subject,
        testName,
        grade: parseFloat(grade),
        domain: document.getElementById('testDomain').options[domain].text
    });
    
    // Clear inputs
    document.getElementById('testName').value = '';
    document.getElementById('testGrade').value = '';
    
    updateFinalGrades12();
}

// Update updateFinalGrades12 to use stored test data instead of table rows
function updateFinalGrades12() {
    if (!window.testData) window.testData = [];
    const container = document.querySelector('.year12-finals');
    container.innerHTML = '';
    
    const orderedSubjects = [
        'Matemática A',
        'Economia C',
        'Aplicações Informáticas B',
        'Educação Física',
        'Português' // Will be handled last
    ];
    
    orderedSubjects.forEach(subject => {
        const tests = window.testData.filter(test => test.subject === subject);
        
        if (tests.length > 0) {
            const tableContainer = document.createElement('div');
            tableContainer.className = `subject-table${subject === 'Português' ? ' full-width' : ''}`;
            
            const subjectHeader = document.createElement('h4');
            subjectHeader.textContent = subject;
            tableContainer.appendChild(subjectHeader);

            const domainGrades = calculateDomainGrades(tests, subject);
            const finalGrade = calculateFinalGrade(domainGrades, subject);

            const gradesLayout = document.createElement('div');
            gradesLayout.className = 'domain-grades-layout';

            // Create domain grade items
            Object.entries(domainGrades).forEach(([domain, data]) => {
                const domainItem = document.createElement('div');
                domainItem.className = 'domain-grade-item';
                
                // Get tests for this domain and pad array to multiple of 3
                const domainTests = tests
                    .filter(test => test.domain.startsWith(domain))
                    .map(test => ({
                        grade: test.grade,
                        name: test.testName
                    }));

                // Calculate how many empty cells needed to make grid complete
                const emptyNeeded = 3 - (domainTests.length % 3);
                for(let i = 0; i < emptyNeeded && emptyNeeded < 3; i++) {
                    domainTests.push(null);
                }

                domainItem.innerHTML = `
                    <span class="domain-name">${domain} (${(data.weight * 100)}%)</span>
                    <div class="domain-tests">
                        ${domainTests.map(test => 
                            test ? `<div class="test-grade" title="${test.name}">${test.grade.toFixed(1)}</div>`
                                 : `<div class="test-grade empty"></div>`
                        ).join('')}
                    </div>
                    <span class="domain-value">${data.average.toFixed(1)}</span>
                `;
                gradesLayout.appendChild(domainItem);
            });

            // Update final grade display with two decimal places
            const finalGradeItem = document.createElement('div');
            finalGradeItem.className = 'domain-grade-item';
            finalGradeItem.innerHTML = `
                <span class="domain-name">Nota Final</span>
                <span class="domain-value">
                    ${Math.round(finalGrade)} (${finalGrade.toFixed(2)})
                </span>
            `;
            gradesLayout.appendChild(finalGradeItem);

            tableContainer.appendChild(gradesLayout);
            container.appendChild(tableContainer);
        }
    });
}

function calculateDomainGrades(tests, subject) {
    const domains = subjectDomains[subject] || [];
    const domainGrades = {};
    
    domains.forEach(domain => {
        const domainTests = tests.filter(test => 
            test.domain.startsWith(domain.name)
        );
        
        if (domainTests.length > 0) {
            const sum = domainTests.reduce((acc, test) => 
                acc + parseFloat(test.grade), 0
            );
            domainGrades[domain.name] = {
                average: sum / domainTests.length,
                weight: domain.weight
            };
        }
    });
    
    return domainGrades;
}

function calculateFinalGrade(domainGrades, subject) {
    if (!subjectDomains[subject]) return 0;
    
    return Object.entries(domainGrades).reduce((total, [domain, data]) => {
        return total + (data.average * data.weight);
    }, 0);
}

function formatDomainGrades(domainGrades) {
    return Object.entries(domainGrades)
        .map(([domain, data]) => 
            `${domain}: ${data.average.toFixed(1)} (${(data.weight * 100)}%)`
        )
        .join('<br>');
}

// Update the calculateSubjectFinalGrade function with better error handling
function calculateSubjectFinalGrade(subject, year) {
  if (year === 12) {
    // Ensure window.testData exists
    if (!window.testData) window.testData = [];
    
    const tests = window.testData.filter(test => test.subject === subject);
      
    if (tests.length === 0) return null;
    
    if (subjectDomains[subject]) {
      const domainSums = new Array(subjectDomains[subject].length).fill(0);
      const domainCounts = new Array(subjectDomains[subject].length).fill(0);
      
      tests.forEach(test => {
        // Add null checks
        if (!test || !test.grade || !test.domain) return;
        
        const grade = parseFloat(test.grade);
        const domainText = test.domain;
        const domainIndex = subjectDomains[subject].findIndex(d => 
          domainText.startsWith(d.name));
        
        if (!isNaN(grade) && domainIndex !== -1) {
          domainSums[domainIndex] += grade;
          domainCounts[domainIndex]++;
        }
      });

      const domainAverages = domainSums.map((sum, index) => 
        domainCounts[index] > 0 ? sum / domainCounts[index] : 0
      );

      // Add null check for subjectDomains[subject]
      if (!domainAverages.length) return null;

      return domainAverages.reduce((acc, avg, index) => {
        if (!subjectDomains[subject][index]) return acc;
        return acc + avg * subjectDomains[subject][index].weight;
      }, 0);
    } else {
      // Default calculation for subjects without custom domains
      let totalSum = 0;
      let count = 0;
      tests.forEach(test => {
        if (!test || !test.grade) return;
        const grade = parseFloat(test.grade);
        if (!isNaN(grade)) {
          totalSum += grade;
          count++;
        }
      });
      return count > 0 ? totalSum / count : null;
    }
  } else {
    const grade = document.querySelector(`.year${year}-grade[data-subject="${subject}"]`);
    if (!grade) return null;
    const value = parseFloat(grade.value);
    return !isNaN(value) ? value : null;
  }
}

function calculateYearAverages(grades) {
  const yearAverages = {10: 0, 11: 0, 12: 0};
  const yearCounts = {10: 0, 11: 0, 12: 0};

  // Calculate year averages
  for (const subject in grades) {
    [10, 11, 12].forEach(year => {
      if (grades[subject][year] !== null) {
        yearAverages[year] += grades[subject][year];
        yearCounts[year]++;
      }
    });
  }

  [10, 11, 12].forEach(year => {
    yearAverages[year] = yearCounts[year] > 0 ? 
      (yearAverages[year] / yearCounts[year]).toFixed(1) : '-';
    document.getElementById(`year${year}-average`).textContent = yearAverages[year];
  });

  // Calculate total average (12th year subjects + non-repeated 11th year subjects)
  const year12Subjects = new Set(subjects.year12);
  let totalSum = 0;
  let totalCount = 0;

  // Add 12th year grades
  for (const subject of subjects.year12) {
    if (grades[subject][12] !== null) {
      totalSum += grades[subject][12];
      totalCount++;
    }
  }

  // Add non-repeated 11th year grades
  for (const subject of subjects.year11) {
    if (!year12Subjects.has(subject) && grades[subject][11] !== null) {
      totalSum += grades[subject][11];
      totalCount++;
    }
  }

  const totalAverageNoExams = totalCount > 0 ? (totalSum / totalCount).toFixed(1) : '-';
  document.getElementById('total-average-no-exams').textContent = totalAverageNoExams;
}

function calculateFinalGrades() {
  const summaryBody = document.getElementById('summary-body');
  summaryBody.innerHTML = '';

  const allSubjects = new Set([...subjects.year10, ...subjects.year11, ...subjects.year12]);
  const grades = {};
  const examGrades = calculateExamGrades();
  
  let totalCIF = 0;
  let cifCount = 0;

  allSubjects.forEach(subject => {
    const row = document.createElement('tr');
    
    grades[subject] = {
      10: subjects.year10.includes(subject) ? calculateSubjectFinalGrade(subject, 10) : null,
      11: subjects.year11.includes(subject) ? calculateSubjectFinalGrade(subject, 11) : null,
      12: subjects.year12.includes(subject) ? calculateSubjectFinalGrade(subject, 12) : null
    };

    const validGrades = Object.values(grades[subject]).filter(grade => grade !== null);
    const avgWithoutExams = validGrades.length > 0 
      ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length)
      : null;

    // Calculate CIF
    let cif = avgWithoutExams;
    if (examGrades[subject] && avgWithoutExams !== null) {
      cif = Math.round(avgWithoutExams * 0.7 + examGrades[subject].grade * 0.3);
      totalCIF += cif;
      cifCount++;
    } else if (avgWithoutExams !== null) {
      cif = Math.round(avgWithoutExams);
      totalCIF += cif;
      cifCount++;
    }

    row.innerHTML = `
      <td>${subject}</td>
      <td>${grades[subject][10] !== null ? Math.round(grades[subject][10]) : '-'}</td>
      <td>${grades[subject][11] !== null ? Math.round(grades[subject][11]) : '-'}</td>
      <td>${grades[subject][12] !== null ? Math.round(grades[subject][12]) : '-'}</td>
      <td>${examGrades[subject] ? examGrades[subject].grade.toFixed(1) : '-'}</td>
      <td>${cif !== null ? Math.round(cif) : '-'}</td>
    `;

    summaryBody.appendChild(row);
  });

  const cifAverage = cifCount > 0 ? (totalCIF / cifCount).toFixed(3) : '-';
  document.getElementById('total-average-no-exams').textContent = cifAverage;

  // Calculate exam average with weights
  if (examGrades.average !== null) {
    const examEntries = document.querySelectorAll('.exam-entry');
    let totalWeight = 0;
    
    examEntries.forEach(entry => {
      const weight = parseFloat(entry.querySelector('.exam-weight').value);
      if (!isNaN(weight)) {
        totalWeight = weight;
      }
    });

    const cifValue = parseFloat(cifAverage);
    if (!isNaN(cifValue) && !isNaN(totalWeight)) {
      const examComponent = examGrades.average * (totalWeight * 0.01);
      const cifComponent = cifValue * ((100 - totalWeight) * 0.01);
      const finalAvgWithExams = examComponent + cifComponent;
      
      document.getElementById('total-average-with-exams').textContent = 
          finalAvgWithExams ? finalAvgWithExams.toFixed(3) : '-';
    } else {
      document.getElementById('total-average-with-exams').textContent = '-';
    }
  } else {
    document.getElementById('total-average-with-exams').textContent = '-';
  }

  calculateYearAverages(grades);
}

// Function to add exam input
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
        <button onclick="this.parentElement.remove()">Remover</button>
    `;
    examContainer.appendChild(examDiv);
}

// Helper function to get all unique subjects
function getAllSubjects() {
    return [...new Set([...subjects.year10, ...subjects.year11, ...subjects.year12])];
}

// Function to calculate exam grades
function calculateExamGrades() {
    const examEntries = document.querySelectorAll('.exam-entry');
    const examGrades = {};
    let examTotal = 0;
    let examCount = 0;

    examEntries.forEach(entry => {
        const subject = entry.querySelector('.exam-subject').value;
        const grade = parseFloat(entry.querySelector('.exam-grade').value);
        const weight = 0.5; // Fixed weight of 50%

        if (!isNaN(grade)) {
            examGrades[subject] = {
                grade: grade / 10, // Convert 200-point scale to 20-point scale with decimals
                weight: weight
            };
            examTotal += examGrades[subject].grade;
            examCount++;
        }
    });

    examGrades.average = examCount > 0 ? (examTotal / examCount) : null;
    return examGrades;
}

// Add event listeners to all inputs
document.addEventListener('input', function(e) {
  if (e.target.classList.contains('grade-input') || 
      e.target.classList.contains('exam-grade') ||
      e.target.classList.contains('exam-weight') ||
      e.target.classList.contains('domain-select')) {
    calculateFinalGrades();
  }
});

// Add these to your initialization code
document.getElementById('select12Subject').addEventListener('change', (e) => {
    updateDomainSelect(e.target.value);
});

// Initialize the new structure
populateSubjectSelect();
createYearInputs();

// Add JavaScript functions to handle the popup
function showPopup() {
    document.getElementById('domainInfoPopup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('domainInfoPopup').style.display = 'none';
}

// Add click handler to close popup when clicking outside
document.addEventListener('click', function(event) {
    const popup = document.getElementById('domainInfoPopup');
    if (event.target === popup) {
        closePopup();
    }
});