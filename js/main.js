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
  // Função de exemplo para calcular a média do 12º ano
  // Adicione a lógica correta para calcular a média do 12º ano
  return 0;
}
