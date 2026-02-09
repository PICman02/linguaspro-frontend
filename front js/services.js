import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

let currentService = '';
let currentPrice = 0;

const form = document.getElementById('formService');
const formMessage = document.getElementById('formMessage');

window.orderService = function(serviceType, price) {
  currentService = serviceType;
  currentPrice = price;
  document.getElementById('serviceForm').classList.remove('hidden');
  window.scrollTo({ top: document.getElementById('serviceForm').offsetTop - 20, behavior: 'smooth' });
}

window.cancelForm = function() {
  document.getElementById('serviceForm').classList.add('hidden');
  form.reset();
  formMessage.textContent = '';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const details = document.getElementById('details').value.trim();

  if(!name || !email || !phone || !details) {
    formMessage.textContent = "Por favor, preencha todos os campos!";
    formMessage.classList.remove('text-green-600');
    formMessage.classList.add('text-red-600');
    return;
  }

  try {
    // 1️⃣ Criar sessão de pagamento via Firebase Function
    const response = await fetch('/createStripeSession', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: currentService, price: currentPrice, email })
    });
    const session = await response.json();

    // 2️⃣ Redireciona para checkout Stripe
    const stripe = Stripe('SUA_CHAVE_PUBLICA_STRIPE'); // substituir pela sua chave
    await stripe.redirectToCheckout({ sessionId: session.id });

    // Nota: após pagamento, Firebase Function registra no Firestore automaticamente
  } catch (error) {
    formMessage.textContent = "Erro ao processar pagamento: " + error.message;
    formMessage.classList.remove('text-green-600');
    formMessage.classList.add('text-red-600');
  }
});
import { protectAction, getUser } from "./guards.js";

// Função real que será executada se o usuário estiver logado
function enviarOrcamento(servico) {
    const user = getUser();
    alert(`Orçamento solicitado para: ${servico}\nUsuário: ${user.email}`);
    // Aqui futuramente você fará fetch() para backend
}

// Torna a função global para onclick do HTML
window.solicitarOrcamento = protectAction(enviarOrcamento);
