// Core utility functions 

// Authentication and Navigation functions
export function showLogin() { 
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('registerScreen').style.display = 'none';
  document.getElementById('mainContent').style.display = 'none';
}

export function showRegister() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('registerScreen').style.display = 'block';
  document.getElementById('mainContent').style.display = 'none';
}

export function showMainContent() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('registerScreen').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
}

export function showTab(tabId) {
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

// Popup functions
export function showPopup() {
  document.getElementById('domainInfoPopup').style.display = 'flex';
}

export function closePopup() {
  document.getElementById('domainInfoPopup').style.display = 'none';
}

// Database functions
export function saveUserData(userId, auth, database, dbRef, dbSet, dbUpdate) {
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

  return dbSet(dbRef(database, 'users/' + userId), data);
}

export function loadUserData(userId, database, dbRef, dbGet) {
  return dbGet(dbRef(database, 'users/' + userId))
    .then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        window.testData = data.testData || [];
        
        // Clear and repopulate year grades
        if (data.yearGrades) {
          // Load 10th year grades
          if (data.yearGrades.year10) {
            Object.entries(data.yearGrades.year10).forEach(([subject, grade]) => {
              const input = document.querySelector(`.year10-grade[data-subject="${subject}"]`);
              if (input) {
                input.value = Math.round(grade);
              }
            });
          }
          
          // Load 11th year grades
          if (data.yearGrades.year11) {
            Object.entries(data.yearGrades.year11).forEach(([subject, grade]) => {
              const input = document.querySelector(`.year11-grade[data-subject="${subject}"]`);
              if (input) {
                input.value = Math.round(grade);
              }
            });
          }
        }
        
        // Clear existing exam entries
        document.getElementById('exam-summary-body').innerHTML = '';
        
        // Load exam data
        if (data.examData) {
          Object.entries(data.examData).forEach(([safeKey, examInfo]) => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-subject', examInfo.subject);
            tr.innerHTML = `
              <td>${examInfo.subject}</td>
              <td class="exam-grade-display">${(examInfo.grade * 10).toFixed(1)}</td>
              <td>
                <button onclick="removeExamGrade(this)" class="remove-exam">Remover</button>
              </td>
            `;
            document.getElementById('exam-summary-body').appendChild(tr);
          });
        }
        
        updateFinalGrades12();
        calculateFinalGrades(); // Make sure to calculate final grades after loading data
      }
      return data;
    });
}

export function initializeUserData(userId, database, dbRef, dbSet) {
  const emptyData = {
    testData: [],
    yearGrades: {
      year10: {},
      year11: {}
    },
    examData: {}
  };
  
  return dbSet(dbRef(database, 'users/' + userId), emptyData)
    .then(() => {
      window.testData = [];
    });
}

// Subject data and domain functions
export const subjects = {
  year10: ['Matemática A', 'Português', 'Inglês', 'Educação Física', 'Filosofia', 'Economia A', 'Geografia A'],
  year11: ['Matemática A', 'Português', 'Inglês', 'Educação Física', 'Filosofia', 'Economia A', 'Geografia A'],
  year12: ['Matemática A', 'Economia C', 'Aplicações Informáticas B', 'Educação Física', 'Português']
};

export const subjectDomains = {
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

export function populateSubjectSelect() {
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

export function updateDomainSelect(selectedSubject) {
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

// Subject and grade calculation functions
export function getAllSubjects() {
  return [...new Set([...subjects.year10, ...subjects.year11, ...subjects.year12])];
}

export function getGrade(subject, year) {
  const input = document.querySelector(`.year${year}-grade[data-subject="${subject}"]`);
  const value = input ? parseFloat(input.value) : null;
  return value !== null && !isNaN(value) ? Math.round(value) : null;
}

export function getSubjectGrade12(subject) {
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

export function getDomainWeight(subject, domainName) {
  if (subjectDomains[subject]) {
    const domain = subjectDomains[subject].find(d => d.name === domainName);
    return domain ? domain.weight : 0;
  }
  return 0;
}

// These functions should be defined globally in the main.js file
export function calculateYearAverage(year) {
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

export function calculateSubjectAverage(tests, subject) {
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
    const domainAverage = domainTests.reduce((sum, t) => sum + t.grade, 0) / domainTests.length;
    weightedTotal += domainAverage * domainWeight;
    totalWeight += domainWeight;
  });

  return totalWeight > 0 ? Math.round(weightedTotal) : null;
}

export function calculateYear12Average() {
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

export function calculateExamGrades() {
  const examRows = document.querySelectorAll('#exam-summary-body tr');
  const examGrades = {};

  examRows.forEach(row => {
    const subject = row.getAttribute('data-subject');
    const grade = parseFloat(row.querySelector('.exam-grade-display').textContent);
    
    // Always store the exam grade, regardless of entrance exam checkbox
    if (subject && !isNaN(grade)) {
      examGrades[subject] = {
        grade: grade, // Full 0-200 scale grade
        isEntranceExam: false // Default flag
      };

      // Check if the entrance exam checkbox is checked
      const entranceExamCheckbox = document.querySelector(`.entrance-exam-checkbox[data-subject="${subject}"]`);
      if (entranceExamCheckbox && entranceExamCheckbox.checked) {
        examGrades[subject].isEntranceExam = true;
      }
    }
  });

  // Calculate average of exams with original 0-200 scale, only for entrance exams
  const entranceExamGrades = Object.values(examGrades)
    .filter(exam => exam.isEntranceExam)
    .map(exam => exam.grade);
  
  if (entranceExamGrades.length > 0) {
    examGrades.average = entranceExamGrades.reduce((a, b) => a + b, 0) / entranceExamGrades.length;
  } else {
    // If no entrance exams are selected, set average to null
    examGrades.average = null;
  }

  return examGrades;
}

export function calculateSecondaryEducationAverage() {
  let totalGrade = 0;
  let subjectCount = 0;

  // Iterate through the summary table rows
  document.querySelectorAll('#summary-body tr').forEach(row => {
    // Get the grade from the "Nota na Pauta" column (7th column, index 6)
    const gradeCell = row.children[6];
    
    if (gradeCell) {
      const grade = parseFloat(gradeCell.textContent);
      
      if (!isNaN(grade)) {
        totalGrade += grade;
        subjectCount++;
      }
    }
  });

  // Calculate average and convert to 0-200 scale with one decimal place
  return subjectCount > 0 ? Math.round((totalGrade / subjectCount) * 10 * 10) / 10 : null;
}

export function calculateFinalAverage() {
  const examWeight = parseFloat(document.getElementById('examWeight').value) / 100;
  const gradesWeight = 1 - examWeight;

  let totalGrades = 0;
  let subjectCount = 0;

  // Iterate through all rows in the summary table
  document.querySelectorAll('#summary-body tr').forEach(row => {
    const gradeCell = row.children[6]; // "Nota na Pauta" column
    if (gradeCell) {
      const grade = parseFloat(gradeCell.textContent);
      if (!isNaN(grade)) {
        totalGrades += grade;
        subjectCount++;
      }
    }
  });

  // Calculate average of grades
  const averageGrades = subjectCount > 0 ? totalGrades / subjectCount : null;

  // Get exam average
  const examGrades = calculateExamGrades();
  const examAverage = examGrades?.average || null;

  // Calculate final average BEFORE converting to 0-200 scale
  if (averageGrades !== null) {
    // If no exam average (no entrance exams selected), just use the average of grades
    if (examAverage === null) {
      // Convert the grades average directly to 0-200 scale
      return Math.round(averageGrades * 10) / 10;
    }
    
    // If exam average exists, calculate weighted average
    const examAverageConverted = examAverage / 10; // Convert from 0-200 to 0-20
    
    const finalAverage = (averageGrades * gradesWeight) + (examAverageConverted * examWeight);
    
    // Convert to 0-200 scale with one decimal place as the final step
    return Math.round(finalAverage * 100) / 10;
  }

  return null;
}

// UI update functions
export function updateFinalGrades12() {
  if (!window.testData) return;

  // Clear existing summary and average display
  const summaryContainer = document.querySelector('.year12-finals');
  summaryContainer.innerHTML = '';
  
  // Remove existing average display if present
  const existingAverage = document.querySelector('.year12-quick-average');
  if (existingAverage) {
    existingAverage.remove();
  }

  // Create and insert average display next to the title
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

  // Initialize variables for average calculation
  const subjectTests = {};
  let totalGrade = 0;
  let subjectCount = 0;

  // Group tests by subject
  window.testData.forEach(test => {
    if (!subjectTests[test.subject]) {
      subjectTests[test.subject] = [];
    }
    subjectTests[test.subject].push(test);
  });

  // Create a wrapper for the grid layout
  const gridWrapper = document.createElement('div');
  gridWrapper.style.cssText = `
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    width: 100%;
  `;
  summaryContainer.appendChild(gridWrapper);

  // Process subjects in the desired order and layout
  const firstRow = ['Matemática A', 'Economia C'];
  const secondRow = ['Aplicações Informáticas B', 'Educação Física'];
  const lastRow = ['Português'];

  // Process first row
  firstRow.forEach(subject => {
    if (subjectTests[subject]) {
      const grade = processSubject(subject, subjectTests[subject], gridWrapper);
      if (grade !== null) {
        totalGrade += grade;
        subjectCount++;
      }
    }
  });

  // Process second row
  secondRow.forEach(subject => {
    if (subjectTests[subject]) {
      const grade = processSubject(subject, subjectTests[subject], gridWrapper);
      if (grade !== null) {
        totalGrade += grade;
        subjectCount++;
      }
    }
  });

  // Process last row (Português) - spans full width
  lastRow.forEach(subject => {
    if (subjectTests[subject]) {
      const container = document.createElement('div');
      container.style.gridColumn = '1 / -1'; // Span full width
      gridWrapper.appendChild(container);
      const grade = processSubject(subject, subjectTests[subject], container);
      if (grade !== null) {
        totalGrade += grade;
        subjectCount++;
      }
    }
  });

  // Update average display
  const yearAverage = subjectCount > 0 ? totalGrade / subjectCount : 0;
  averageDisplay.innerHTML = `
    <strong>Média 12º Ano:</strong>
    <span style="font-size: 1.2em; margin-left: 5px">${yearAverage.toFixed(1)}</span>
  `;

  // Insert average display next to the title
  const title = document.querySelector('#year12-tab h2');
  title.appendChild(averageDisplay);
}

export function processSubject(subject, tests, container) {
  const domains = subjectDomains[subject] || [];
  const domainAverages = {};
  let subjectFinalGrade = 0;
  let totalWeight = 0;

  domains.forEach(domain => {
    const domainTests = tests.filter(t => t.domain === domain.name);
    if (domainTests.length > 0) {
      // Calculate raw average for the domain
      const rawAvg = domainTests.reduce((sum, t) => sum + t.grade, 0) / domainTests.length;
      // Apply domain weight (percentage * 0.01)
      const weightedAvg = rawAvg * domain.weight;
      domainAverages[domain.name] = {
        rawAverage: rawAvg,
        weightedAverage: weightedAvg,
        weight: domain.weight * 100 // Keep as percentage for display
      };
      subjectFinalGrade += weightedAvg;
      totalWeight += domain.weight;
    }
  });

  // Function to format number with minimum decimal places
  const formatNumber = (num) => {
    if (num === null || isNaN(num)) return '-';
    return Number(num.toFixed(3)).toString();
  };

  const subjectContainer = document.createElement('div');
  subjectContainer.className = 'subject-container';
  
  const titleElement = document.createElement('div');
  titleElement.className = 'subject-title';
  titleElement.textContent = subject;
  subjectContainer.appendChild(titleElement);
  
  const domainGrid = document.createElement('div');
  domainGrid.className = 'domain-grid';

  domains.forEach((domain, index) => {
    const domainBlock = document.createElement('div');
    domainBlock.className = `domain-block ${index === domains.length - 1 && domains.length % 2 !== 0 ? 'last-domain' : ''}`;
    
    const domainTests = tests.filter(t => t.domain === domain.name);
    const domainAvg = domainAverages[domain.name];
    
    domainBlock.innerHTML = `
        <div class="domain-name">${domain.name} (${domain.weight * 100}%)</div>
        <div class="domain-content">
          <div class="test-list">
            ${domainTests.map(test => `
              <div class="test-grade">
                <span class="test-name">${test.name}</span>
                <span class="grade-value">${test.grade.toFixed(1)}</span>
                <span class="remove-test" onclick="removeTest(${window.testData.indexOf(test)}, '${subject}', '${domain.name}')">&times;</span>
              </div>
            `).join('')}
          </div>
          <div class="domain-average">
            Média: ${domainAvg ? `${domainAvg.rawAverage.toFixed(1)} × ${domain.weight * 100}% = ${formatNumber(domainAvg.weightedAverage)}` : '-'}
          </div>
        </div>
    `;
    
    domainGrid.appendChild(domainBlock);
  });

  subjectContainer.appendChild(domainGrid);

  const finalGrade = document.createElement('div');
  finalGrade.className = 'final-grade';
  finalGrade.textContent = `Média Final: ${totalWeight > 0 ? formatNumber(subjectFinalGrade) : '-'}`;
  subjectContainer.appendChild(finalGrade);

  container.appendChild(subjectContainer);
  return totalWeight > 0 ? subjectFinalGrade : null;
}

export function updateSummaryTable(year10Avg, year11Avg, year12Avg, Grades) {
  const tbody = document.getElementById('summary-body');
  tbody.innerHTML = '';

  const allSubjects = getAllSubjects();

  allSubjects.forEach(subject => {
    const row = document.createElement('tr');
    const year10Grade = getGrade(subject, 10);
    const year11Grade = getGrade(subject, 11);
    const year12Grade = getSubjectGrade12(subject);
    
    // Get exam data
    const examData = Grades[subject];
    const examRawGrade = examData ? examData.grade : null;
    const examGrade = examRawGrade !== null ? Math.round(examRawGrade / 10) : null;
    
    // Get checkbox status from localStorage
    const isApproved = localStorage.getItem(`${subject}-approval-checkbox`) === 'true';
    const isEntranceExam = examData ? examData.isEntranceExam : false;
    
    let finalCIF;
    
    // New CIF calculation logic
    const yearGrades = [
      { grade: year10Grade, weight: 0.3 },
      { grade: year11Grade, weight: 0.3 },
      { grade: year12Grade, weight: 0.4 }
    ].filter(g => g.grade !== null);
    
    if (yearGrades.length > 0) {
      const weightedSum = yearGrades.reduce((sum, g) => sum + g.grade * g.weight, 0);
      const totalWeight = yearGrades.reduce((sum, g) => sum + g.weight, 0);
      
      // Calculate average of year grades, with 2 decimal places
      let yearAverage = (weightedSum / totalWeight);
      
      if (isApproved) {
        yearAverage = Math.round(yearAverage);
      }
      
      if (isApproved && examGrade != null) {
        const yearAverageWithWeight = yearAverage * 0.7;
        const examWithWeighted = Math.round(examRawGrade / 10) * 0.3;
        finalCIF = (yearAverageWithWeight + examWithWeighted).toFixed(2);
      } else {
        finalCIF = yearAverage.toFixed(2);
      }
    }

    row.innerHTML = `
        <td>${subject}</td>
        <td>${year10Grade !== null && !isNaN(year10Grade) ? Math.round(year10Grade) : '-'}</td>
        <td>${year11Grade !== null && !isNaN(year11Grade) ? Math.round(year11Grade) : '-'}</td>
        <td>${year12Grade !== null && !isNaN(year12Grade) ? Math.round(year12Grade) : '-'}</td>
        <td>${examRawGrade !== null && !isNaN(examRawGrade) ? (examRawGrade / 10).toFixed(1) : '-'}</td>
        <td>${finalCIF !== null && !isNaN(parseFloat(finalCIF)) ? finalCIF : '-'}</td>
        <td>${finalCIF !== null && !isNaN(parseFloat(finalCIF)) ? Math.round(parseFloat(finalCIF)) : '-'}</td>
        <td>
          <input type="checkbox" class="approval-checkbox" data-subject="${subject}"
                 ${localStorage.getItem(`${subject}-approval-checkbox`) === 'true' ? 'checked' : ''}>
        </td>
        <td>
          <input type="checkbox" class="entrance-exam-checkbox" data-subject="${subject}"
                 ${localStorage.getItem(`${subject}-entrance-exam-checkbox`) === 'true' ? 'checked' : ''}>
        </td>
    `;
    tbody.appendChild(row);

    // Add event listeners for checkboxes
    const approvalCheckbox = row.querySelector('.approval-checkbox');
    const entranceExamCheckbox = row.querySelector('.entrance-exam-checkbox');

    approvalCheckbox.addEventListener('change', function() {
      localStorage.setItem(`${subject}-approval-checkbox`, this.checked);
      calculateFinalGrades();
    });

    entranceExamCheckbox.addEventListener('change', function() {
      localStorage.setItem(`${subject}-entrance-exam-checkbox`, this.checked);
      calculateFinalGrades();
    });
  });

  // Update year averages
  const averageRow = document.querySelector('.year-average');
  if (averageRow) {
    const averageCells = averageRow.querySelectorAll('td');
    
    // Update year averages
    if (averageCells[1]) averageCells[1].textContent = year10Avg !== null ? year10Avg.toFixed(1) : '-';
    if (averageCells[2]) averageCells[2].textContent = year11Avg !== null ? year11Avg.toFixed(1) : '-';
    if (averageCells[3]) averageCells[3].textContent = year12Avg !== null ? year12Avg.toFixed(1) : '-';

    // Calculate and update exam average
    const examValues = Array.from(document.querySelectorAll('#summary-body tr'))
      .filter(row => {
        // Only include exams that have the entrance exam checkbox checked
        const entranceExamCheckbox = row.querySelector('.entrance-exam-checkbox');
        return entranceExamCheckbox && entranceExamCheckbox.checked;
      })
      .map(row => {
        const examCell = row.children[4];
        return examCell && examCell.textContent !== '-' ? Math.round(parseFloat(examCell.textContent)) : null;
      })
      .filter(val => val !== null && !isNaN(val));
    
    const examAvg = examValues.length > 0 ? examValues.reduce((a, b) => a + b, 0) / examValues.length : null;
    document.getElementById('exams-average').textContent = examAvg !== null ? examAvg.toFixed(1) : '-';
    
    // Calculate and update CIF average
    const cifValues = Array.from(document.querySelectorAll('#summary-body tr')).map(row => {
      const cifCell = row.children[5];
      return cifCell ? parseFloat(cifCell.textContent) : null;
    }).filter(val => val !== null && !isNaN(val));
    
    const cifAvg = cifValues.length > 0 ? cifValues.reduce((a, b) => a + b, 0) / cifValues.length : null;
    document.getElementById('cif-average').textContent = cifAvg !== null ? cifAvg.toFixed(1) : '-';
    
    // Calculate and update final average
    const finalValues = Array.from(document.querySelectorAll('#summary-body tr')).map(row => {
      const finalCell = row.children[6];
      return finalCell ? parseFloat(finalCell.textContent) : null;
    }).filter(val => val !== null && !isNaN(val));
    
    const finalAvg = finalValues.length > 0 ? finalValues.reduce((a, b) => a + b, 0) / finalValues.length : null;
    document.getElementById('final-average').textContent = finalAvg !== null ? finalAvg.toFixed(1) : '-';

    // Additional averages calculation and display
    const totalAverageNoExams = calculateSecondaryEducationAverage();
    const finalAverage = calculateFinalAverage();

    document.getElementById('total-average-no-exams').textContent = 
      totalAverageNoExams !== null ? totalAverageNoExams.toFixed(1) : '-';
    
    document.getElementById('total-average-with-exams').textContent = 
      finalAverage !== null ? finalAverage.toFixed(1) : '-';
  }
}
