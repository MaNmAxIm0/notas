import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC1hg5b-lRtilVWYxeEU6sAwSHfCi7uAG8",
  authDomain: "notas-a3feb.firebaseapp.com",
  databaseURL: "https://notas-a3feb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "notas-a3feb",
  storageBucket: "notas-a3feb.firebasestorage.app",
  messagingSenderId: "657388702531",
  appId: "1:657388702531:web:2e25bf0481273453e7bdf6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Função para salvar dados do usuário
function saveUserData(userId) {
  const userRef = ref(database, 'users/' + userId);
  const data = {
    testData: window.testData || [],
    yearGrades: {
      year10: getYearGrades(10),
      year11: getYearGrades(11),
      year12: getYearGrades(12)
    },
    examGrades: getExamGrades() || {}
  };

  set(userRef, data).then(() => {
    console.log("Dados do usuário salvos com sucesso.");
  }).catch((error) => {
    console.error("Erro ao salvar os dados do usuário: ", error);
  });
}

// Funções auxiliares para obter dados (implemente de acordo com sua lógica)
function getYearGrades(year) {
  return {};
}

function getExamGrades() {
  return {};
}

// Função para carregar dados do usuário
function loadUserData(userId) {
  const userRef = ref(database, 'users/' + userId);
  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log("Dados carregados: ", data);

      window.testData = data.testData || [];
      setYearGrades(data.yearGrades);
      setExamGrades(data.examGrades);
      updateFinalGrades12();
      calculateFinalGrades();
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error("Erro ao carregar os dados do usuário: ", error);
  });
}

// Funções para definir dados carregados (implemente de acordo com sua lógica)
function setYearGrades(yearGrades) {
  if (yearGrades) {
    ['year10', 'year11', 'year12'].forEach(year => {
      const yearNum = year.replace('year', '');
      Object.entries(yearGrades[year] || {}).forEach(([subject, grade]) => {
        const input = document.querySelector(`.year${yearNum}-grade[data-subject="${subject}"]`);
        if (input) {
          input.value = grade;
        }
      });
    });
  }
}

function setExamGrades(examGrades) {
  if (examGrades) {
    const examContainer = document.getElementById('exam-entries');
    examContainer.innerHTML = '';

    Object.entries(examGrades).forEach(([subject, data]) => {
      if (subject !== 'average' && data) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${subject}</td>
          <td>${data.grade * 10}</td>
        `;
        examContainer.appendChild(row);
      }
    });
  }
}

function updateFinalGrades12() {
  const subjects = document.querySelectorAll('.year12-grade');
  let total = 0;
  let count = 0;

  subjects.forEach(subject => {
    const grade = parseFloat(subject.value);
    if (!isNaN(grade)) {
      total += grade;
      count++;
    }
  });

  const average = count > 0 ? total / count : 0;
  const finalGradeElement = document.getElementById('year12-final-grade');
  if (finalGradeElement) {
    finalGradeElement.innerText = average.toFixed(2);
  } else {
    console.error("Elemento com ID 'year12-final-grade' não encontrado.");
  }
}

function calculateFinalGrades() {
    // Seleciona os inputs de notas dos diferentes anos
    const year10Grades = document.querySelectorAll('.year10-grade');
    const year11Grades = document.querySelectorAll('.year11-grade');
    const year12Grades = document.querySelectorAll('.year12-grade');

    // Função para calcular a média das notas
    const calculateAverage = (grades) => {
        let total = 0;
        let count = 0;
        grades.forEach(grade => {
            const value = parseFloat(grade.value);
            if (!isNaN(value)) {
                total += value;
                count++;
            }
        });
        return count > 0 ? (total / count) : 0;
    };

    // Calcula a média das notas para cada ano
    const averageYear10 = calculateAverage(year10Grades);
    const averageYear11 = calculateAverage(year11Grades);
    const averageYear12 = calculateAverage(year12Grades);

    // Seleciona os inputs de notas dos exames
    const examGrades = document.querySelectorAll('#exam-entries tr');

    // Função para calcular a média ponderada dos exames
    const calculateExamAverage = (exams) => {
        let total = 0;
        let weightTotal = 0;
        exams.forEach(exam => {
            const gradeCell = exam.querySelector('td:nth-child(2)');
            const weightCell = exam.querySelector('td:nth-child(3)');
            const grade = parseFloat(gradeCell.textContent);
            const weight = parseFloat(weightCell.textContent);
            if (!isNaN(grade) && !isNaN(weight)) {
                total += (grade * (weight / 100));
                weightTotal += (weight / 100);
            }
        });
        return weightTotal > 0 ? (total / weightTotal) : 0;
    };

    // Calcula a média ponderada dos exames
    const averageExams = calculateExamAverage(examGrades);

    // Obtém o peso dos exames do input
    const examWeightInput = document.getElementById('exam-weight-input');
    const examWeight = parseFloat(examWeightInput.value) / 100;

    // Calcula as médias finais
    const totalAverageNoExams = (averageYear10 + averageYear11 + averageYear12) / 3;
    const totalAverageWithExams = ((1 - examWeight) * totalAverageNoExams) + (examWeight * averageExams);

    // Atualiza os elementos do DOM com as médias finais
    document.getElementById('total-average-no-exams').textContent = totalAverageNoExams.toFixed(2);
    document.getElementById('total-average-with-exams').textContent = totalAverageWithExams.toFixed(2);

    console.log("Média do Ensino Secundário (sem exames):", totalAverageNoExams);
    console.log("Média de acesso ao ensino superior (com exames):", totalAverageWithExams);
}

// Lógica de autenticação
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('main-content').style.display = 'block';
      loadUserData(userCredential.user.uid);
    })
    .catch((error) => {
      console.error('Erro de login: ', error);
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
      console.error('Erro de registro: ', error);
      alert('Erro de registro: ' + error.message);
    });
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    const loginScreen = document.getElementById('loginScreen');
    const mainContent = document.getElementById('mainContent');
    
    if (loginScreen && mainContent) {
      loginScreen.style.display = 'none';
      mainContent.style.display = 'block';
    } else {
      console.error('Elementos loginScreen ou mainContent não encontrados.');
    }
    
    loadUserData(user.uid);
    setupAutoSave();
  } else {
    const loginScreen = document.getElementById('loginScreen');
    const mainContent = document.getElementById('mainContent');
    
    if (loginScreen && mainContent) {
      loginScreen.style.display = 'block';
      mainContent.style.display = 'none';
    } else {
      console.error('Elementos loginScreen ou mainContent não encontrados.');
    }
  }
});

function initializeUserData(userId) {
  const userRef = ref(database, 'users/' + userId);
  const initialData = {
    testData: [],
    yearGrades: {
      year10: {},
      year11: {},
      year12: {}
    },
    examGrades: {}
  };

  set(userRef, initialData).then(() => {
    console.log("Dados iniciais do usuário definidos.");
  }).catch((error) => {
    console.error("Erro ao definir os dados iniciais do usuário: ", error);
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
