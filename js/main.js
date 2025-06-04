import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

import * as funcs from 'js/functions.js';

// Make core functions globally available
window.showLogin = funcs.showLogin;
window.showRegister = funcs.showRegister;
window.showMainContent = funcs.showMainContent;
window.showTab = funcs.showTab;
window.closePopup = funcs.closePopup;

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

// Global data storage
window.testData = [];

// Add global functions for direct access in HTML
window.addTest12thYear = function() {
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

  // Add new test
  window.testData.push({
    subject: subject,
    name: testName,
    grade: grade,
    domain: domain
  });

  // Clear inputs
  document.getElementById('testName').value = '';
  document.getElementById('testGrade').value = '';
  document.getElementById('testDomain').value = '';

  // Update display
  funcs.updateFinalGrades12();
  calculateFinalGrades();

  // Save to database if user is logged in
  if (auth.currentUser) {
    saveUserData(auth.currentUser.uid);
  }
};

window.removeTest = function(testIndex, subject, domain) {
  if (confirm('Tem certeza que deseja remover este teste?')) {
    window.testData = window.testData.filter((test, index) => index !== testIndex);
    funcs.updateFinalGrades12();
    calculateFinalGrades();
    
    // Save to database if user is logged in
    if (auth.currentUser) {
      saveUserData(auth.currentUser.uid);
    }
  }
};

window.addExamGrade = function(input) {
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
};

window.removeExamGrade = function(button) {
  const row = button.closest('tr');
  row.remove();
  
  // Save to database
  if (auth.currentUser) {
    saveUserData(auth.currentUser.uid);
  }

  // Update calculations
  calculateFinalGrades();
};

window.updateWeights = function(examWeight) {
  const gradesWeight = 100 - examWeight;
  document.getElementById('gradesWeight').textContent = gradesWeight + '%';
  calculateFinalGrades();
};

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
      document.getElementById('exam-summary-body').innerHTML = '';
      // Clear year 12 finals
      document.querySelector('.year12-finals').innerHTML = '';
      // Reset all calculations
      calculateFinalGrades();
      // Show login screen
      funcs.showLogin();
    })
    .catch((error) => {
      alert('Erro de logout: ' + error.message);
    });
};

// Database helper functions
function saveUserData(userId) {
  return funcs.saveUserData(userId, auth, database, ref, set, update);
}

function loadUserData(userId) {
  return funcs.loadUserData(userId, database, ref, get).then(data => {
    funcs.showMainContent();
    return data;
  });
}

function initializeUserData(userId) {
  return funcs.initializeUserData(userId, database, ref, set).then(() => {
    funcs.showMainContent();
  });
}

// Main calculation function
window.calculateFinalGrades = function() {
  // Calculate year averages
  const year10Average = funcs.calculateYearAverage(10);
  const year11Average = funcs.calculateYearAverage(11);
  const year12Average = funcs.calculateYear12Average();
  const examGrades = funcs.calculateExamGrades();

  // Update summary table
  funcs.updateSummaryTable(year10Average, year11Average, year12Average, examGrades);
};

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Setup initial UI
  funcs.populateSubjectSelect();
  createYearInputs();
  funcs.showTab('year10');
  
  // Initialize exam weights
  const examWeight = document.getElementById('examWeight').value;
  window.updateWeights(examWeight);
  
  // Populate exam subject dropdown
  const examSubjectSelect = document.querySelector('.exam-subject');
  if (examSubjectSelect) {
    examSubjectSelect.innerHTML = '<option value="">Selecione a Disciplina</option>';
    funcs.getAllSubjects().forEach(subject => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      examSubjectSelect.appendChild(option);
    });
  }

  // Setup domain select listener
  document.getElementById('select12Subject').addEventListener('change', function() {
    funcs.updateDomainSelect(this.value);
  });

  // Add event listener for exam weight change
  document.getElementById('examWeight').addEventListener('change', function() {
    updateWeights(this.value);
  });

  // Add click handler to close popup when clicking outside
  document.addEventListener('click', function(event) {
    const popup = document.getElementById('domainInfoPopup');
    if (event.target === popup) {
      funcs.closePopup();
    }
  });

  // Add login form handler
  document.getElementById('loginForm').addEventListener('submit', function(e) {
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

  // Add registration form handler
  document.getElementById('registerForm').addEventListener('submit', function(e) {
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
});

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUserData(user.uid);
    setupAutoSave();
  } else {
    funcs.showLogin();
  }
});

// Create inputs for year 10 and 11
function createYearInputs() {
  // Only create inputs if they don't already exist
  const year10Div = document.getElementById('year10');
  const year11Div = document.getElementById('year11');
  
  // Clear existing content first
  year10Div.innerHTML = '';
  year11Div.innerHTML = '';
  
  // Create inputs for 10th year
  funcs.subjects.year10.forEach(subject => {
    year10Div.innerHTML += `
      <div class="subject">
        <label>${subject}:</label>
        <input type="number" min="0" max="20" step="1" class="grade-input year10-grade" 
               data-subject="${subject}" placeholder="0-20">
      </div>
    `;
  });

  // Create inputs for 11th year
  funcs.subjects.year11.forEach(subject => {
    year11Div.innerHTML += `
      <div class="subject">
        <label>${subject}:</label>
        <input type="number" min="0" max="20" step="1" class="grade-input year11-grade" 
               data-subject="${subject}" placeholder="0-20">
      </div>
    `;
  });

  // Setup listeners after creating inputs
  setupGradeInputListeners();
}

function setupGradeInputListeners() {
  document.querySelectorAll('.year10-grade, .year11-grade').forEach(input => {
    input.addEventListener('change', function() {
      if (auth.currentUser) {
        saveUserData(auth.currentUser.uid);
      }
      calculateFinalGrades(); // Update calculations immediately
    });

    // Also add input event for real-time updates
    input.addEventListener('input', function() {
      calculateFinalGrades();
    });
  });
}

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

// Add global function for PDF generation
window.generatePDF = function() {
  // Import the jsPDF module
  const { jsPDF } = window.jspdf;
  
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set initial coordinates for content
  let y = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  
  // Function to check if we need a new page
  function checkPageBreak(heightNeeded) {
    if (y + heightNeeded > pageHeight - margin) {
      doc.addPage();
      y = 20; // Reset y position for new page
      return true;
    }
    return false;
  }
  
  // Add title
  doc.setFontSize(18);
  doc.setTextColor(255, 105, 180); // Hot pink
  doc.text("Calculadora de Notas do Ensino Secundário", 105, y, { align: "center" });
  y += 15;
  
  // Add 10th and 11th year grades
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  
  // 10th year section
  checkPageBreak(10);
  doc.text("10º Ano", 20, y);
  y += 10;
  doc.setFontSize(10);
  
  const year10Inputs = document.querySelectorAll('.year10-grade');
  year10Inputs.forEach(input => {
    checkPageBreak(7);
    const subject = input.getAttribute('data-subject');
    const grade = input.value ? input.value : "-";
    doc.text(`${subject}: ${grade}`, 25, y);
    y += 7;
  });
  
  // 11th year section
  checkPageBreak(15);
  y += 5;
  doc.setFontSize(14);
  doc.text("11º Ano", 20, y);
  y += 10;
  doc.setFontSize(10);
  
  const year11Inputs = document.querySelectorAll('.year11-grade');
  year11Inputs.forEach(input => {
    checkPageBreak(7);
    const subject = input.getAttribute('data-subject');
    const grade = input.value ? input.value : "-";
    doc.text(`${subject}: ${grade}`, 25, y);
    y += 7;
  });
  
  // 12th year section with domains
  checkPageBreak(15);
  y += 5;
  doc.setFontSize(14);
  doc.text("12º Ano", 20, y);
  y += 10;
  doc.setFontSize(10);
  
  // Group tests by subject and domain
  const subjectDomainTests = {};
  
  if (window.testData && window.testData.length > 0) {
    window.testData.forEach(test => {
      if (!subjectDomainTests[test.subject]) {
        subjectDomainTests[test.subject] = {};
      }
      if (!subjectDomainTests[test.subject][test.domain]) {
        subjectDomainTests[test.subject][test.domain] = [];
      }
      subjectDomainTests[test.subject][test.domain].push(test);
    });
    
    // Print 12th year grades by subject and domain
    Object.entries(subjectDomainTests).forEach(([subject, domains]) => {
      checkPageBreak(7);
      doc.text(`${subject}:`, 25, y);
      y += 7;
      
      Object.entries(domains).forEach(([domain, tests]) => {
        checkPageBreak(7);
        doc.text(`   ${domain}:`, 30, y);
        y += 7;
        
        tests.forEach(test => {
          checkPageBreak(7);
          doc.text(`      ${test.name}: ${test.grade.toFixed(1)}`, 35, y);
          y += 7;
        });
        
        // Add domain average
        checkPageBreak(7);
        const domainAvg = tests.reduce((sum, t) => sum + t.grade, 0) / tests.length;
        doc.text(`      Média: ${domainAvg.toFixed(1)}`, 35, y);
        y += 7;
      });
      
      // Add subject final grade
      checkPageBreak(10);
      const subjectGrade = funcs.getSubjectGrade12(subject);
      if (subjectGrade !== null) {
        doc.text(`   Nota Final: ${subjectGrade}`, 30, y);
        y += 10;
      } else {
        y += 3;
      }
    });
  }
  
  // Add exam grades section
  checkPageBreak(20);
  doc.setFontSize(14);
  doc.text("Exames Nacionais", 20, y);
  y += 10;
  doc.setFontSize(10);
  
  const examRows = document.querySelectorAll('#exam-summary-body tr');
  examRows.forEach(row => {
    checkPageBreak(7);
    const subject = row.getAttribute('data-subject');
    const grade = row.querySelector('.exam-grade-display')?.textContent || "-";
    doc.text(`${subject}: ${grade}`, 25, y);
    y += 7;
  });
  
  // Final results table
  checkPageBreak(30);
  y += 10;
  doc.setFontSize(14);
  doc.text("Resumo dos Resultados", 20, y);
  y += 10;
  
  // Create data for the summary table
  const tableData = [];
  const tableRows = document.querySelectorAll('#summary-body tr');
  
  tableRows.forEach(row => {
    const cells = Array.from(row.children).slice(0, 7); // First 7 cells (exclude approval and entrance exam)
    const rowData = cells.map(cell => cell.textContent);
    tableData.push(rowData);
  });
  
  // Add summary table - the autoTable plugin handles page breaks internally
  doc.autoTable({
    startY: y,
    head: [['Disciplina', '10º Ano', '11º Ano', '12º Ano', 'Nota Exame', 'CIF', 'Nota na Pauta']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [255, 105, 180] }
  });
  
  // Add averages
  y = doc.lastAutoTable.finalY + 10;
  checkPageBreak(20);
  
  // Get average values
  const totalAverageNoExams = document.getElementById('total-average-no-exams').textContent;
  const totalAverageWithExams = document.getElementById('total-average-with-exams').textContent;
  
  doc.setFontSize(12);
  doc.text(`Média do Ensino Secundário: ${totalAverageNoExams}`, 20, y);
  y += 10;
  
  checkPageBreak(10);
  const examWeight = document.getElementById('examWeight').value;
  doc.text(`Média de acesso ao ensino superior (Exames ${examWeight}%): ${totalAverageWithExams}`, 20, y);
  
  // Save the PDF
  doc.save('NotasEnsinoSecundario.pdf');
};
