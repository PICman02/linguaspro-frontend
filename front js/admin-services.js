import { db } from './firebase.js';
import { collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

const table = document.getElementById('serviceTable');

// Função para carregar pedidos
export async function loadServiceRequests() {
  table.innerHTML = ''; // limpa tabela
  const querySnapshot = await getDocs(collection(db, "serviceRequests"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const row = document.createElement('tr');

    row.innerHTML = `
      <td class="border px-4 py-2">${data.name}</td>
      <td class="border px-4 py-2">${data.email}</td>
      <td class="border px-4 py-2">${data.serviceType}</td>
      <td class="border px-4 py-2">
        <select onchange="updateStatus('${docSnap.id}', this.value)">
          <option value="pendente" ${data.status==='pendente'?'selected':''}>Pendente</option>
          <option value="aprovado" ${data.status==='aprovado'?'selected':''}>Aprovado</option>
          <option value="concluido" ${data.status==='concluido'?'selected':''}>Concluído</option>
        </select>
      </td>
      <td class="border px-4 py-2">
        <button onclick="deleteRequest('${docSnap.id}')" class="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Excluir</button>
      </td>
    `;
    table.appendChild(row);
  });
}

// Atualiza status do pedido
window.updateStatus = async function(id, newStatus) {
  await updateDoc(doc(db, "serviceRequests", id), { status: newStatus });
  alert("Status atualizado para: " + newStatus);
}

// Deleta pedido
window.deleteRequest = async function(id) {
  if(confirm("Tem certeza que deseja excluir este pedido?")){
    await deleteDoc(doc(db, "serviceRequests", id));
    alert("Pedido excluído com sucesso!");
    loadServiceRequests(); // Recarrega a tabela
  }
}

// Carregar pedidos ao abrir a página
window.onload = () => {
  loadServiceRequests();
}
