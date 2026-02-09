// professors.js

// Referência ao container
const professorsContainer = document.getElementById('professorsContainer');

// Função para carregar professores do Firebase
async function loadProfessors() {
    try {
        const snapshot = await firebase.firestore().collection('professores').get();
        professorsContainer.innerHTML = ''; // limpa antes de preencher
        snapshot.forEach(doc => {
            const data = doc.data();
            const card = document.createElement('div');
            card.classList.add('professor-card');
            card.dataset.category = data.especialidade || 'outros';
            
            card.innerHTML = `
                <img src="${data.fotoURL || 'assets/images/prof-placeholder.jpg'}" alt="${data.nome}">
                <h3>${data.nome}</h3>
                <p>Especialidade: ${data.especialidade}</p>
                <p>Cursos que ensina: ${data.cursos.join(', ')}</p>
                <p>Avaliação: ${'⭐'.repeat(data.avaliacao)} (${data.numAvaliacoes || 0} avaliações)</p>
                <button class="btn-secondary" onclick="contatarProfessor('${data.nome}')">Enviar Mensagem</button>
            `;
            
            professorsContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar professores:", error);
        professorsContainer.innerHTML = "<p>Não foi possível carregar os professores. Tente novamente mais tarde.</p>";
    }
}

// Chamar a função ao carregar a página
window.addEventListener('DOMContentLoaded', loadProfessors);

// Função mock para contatar professor
function contatarProfessor(nome) {
    alert(`Para enviar mensagem, faça login ou cadastro primeiro. Professor: ${nome}`);
}
