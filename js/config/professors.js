import { protectAction, getUser } from "./guards.js";

// ============================
// Professores Dinâmicos
// ============================
const professors = [
  {
    id: 1,
    nome: "Maria Silva",
    idiomas: "inglês e Português",
    rating: 4.9,
    experiencia: ["TOEFL", "IELTS", "Business English"],
    disponibilidade: "manha,tarde",
    bio: "Professora com 10 anos de experiência no ensino de inglês e Português. Especializada em preparação para exames internacionais (TOEFL, IELTS) e inglês para negócios.",
    foto: "https://ui-avatars.com/api/?name=Maria+Silva&background=4A90E2&color=fff",
  },
  {
    id: 2,
    nome: "Carlos Mendes",
    idiomas: "francês e Espanhol",
    rating: 4.7,
    experiencia: ["DELF", "DALF", "Conversa??o"],
    disponibilidade: "tarde,noite",
    bio: "Professor nativo de francês com 8 anos de experiência. Ensino dinâmico e culturalmente rico.",
    foto: "https://ui-avatars.com/api/?name=Carlos+Mendes&background=50E3C2&color=fff",
  },
  {
    id: 3,
    nome: "Ana Costa",
    idiomas: "inglês para Crianças",
    rating: 5.0,
    experiencia: ["Infantil", "Jogos Educativos", "Storytelling"],
    disponibilidade: "manha",
    bio: "Especialista em ensino infantil com metodologia lúdica e interativa. 6 anos de experiência.",
    foto: "https://ui-avatars.com/api/?name=Ana+Costa&background=FF6B6B&color=fff",
  }
];

const container = document.getElementById("professorsContainer");

// ============================
// Criar cards dinâmicos
// ============================
professors.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("col-lg-4", "col-md-6", "professor-card");
    card.setAttribute("data-lang", p.idiomas.toLowerCase());
    card.setAttribute("data-rating", p.rating);
    card.setAttribute("data-availability", p.disponibilidade);

    const starsFull = "?".repeat(Math.floor(p.rating));
    const starsHalf = p.rating % 1 >= 0.5 "?" : "";
    const starsEmpty = "?".repeat(5 - Math.ceil(p.rating));

    card.innerHTML = `
        <div class="card h-100 border-0 shadow-sm">
            <div class="card-body p-4">
                <div class="d-flex align-items-start mb-3">
                    <img src="${p.foto}" alt="${p.nome}" class="rounded-circle me-3" width="70">
                    <div>
                        <h4 class="h5 mb-1">${p.nome}</h4>
                        <p class="text-muted small mb-2">${p.idiomas}</p>
                        <div class="rating mb-2">${starsFull}${starsHalf}${starsEmpty} <span class="ms-2">${p.rating}/5.0</span></div>
                    </div>
                </div>
                <p class="text-muted mb-3">${p.bio}</p>
                <div class="mb-3">
                    <h6 class="fw-bold">Experiência:</h6>
                    ${p.experiencia.map(exp => `<span class="badge bg-primary bg-opacity-10 text-primary me-2">${exp}</span>`).join('')}
                </div>
                <div class="mb-3">
                    <h6 class="fw-bold">Disponibilidade:</h6>
                    <p class="mb-0 small">${p.disponibilidade.replace(",", " | ")}</p>
                </div>
                <button class="btn btn-outline-primary w-100 mt-2" data-bs-toggle="modal" data-bs-target="#professorModal${p.id}">
                    Ver Perfil Completo
                </button>
            </div>
        </div>
    `;
    container.appendChild(card);
});

// ============================
// Modais Dinâmicos
// ============================
const modalsContainer = document.createElement("div");
modalsContainer.id = "professorsModals";
document.body.appendChild(modalsContainer);

professors.forEach(p => {
    const starsFull = "?".repeat(Math.floor(p.rating));
    const starsHalf = p.rating % 1 >= 0.5 "?" : "";
    const starsEmpty = "?".repeat(5 - Math.ceil(p.rating));

    const modal = document.createElement("div");
    modal.classList.add("modal", "fade");
    modal.id = `professorModal${p.id}`;
    modal.tabIndex = -1;
    modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${p.nome}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-4 text-center">
                            <img src="${p.foto}&size=150" alt="${p.nome}" class="rounded-circle mb-3">
                            <h4>${p.nome}</h4>
                            <div class="rating mb-3">${starsFull}${starsHalf}${starsEmpty} <span>${p.rating}/5.0</span></div>
                        </div>
                        <div class="col-md-8">
                            <h5>Sobre</h5>
                            <p>${p.bio}</p>
                            <h5 class="mt-4">Especialidades</h5>
                            ${p.experiencia.map(exp => `<span class="badge bg-primary me-2">${exp}</span>`).join('')}
                            <h5 class="mt-4">Disponibilidade</h5>
                            <p>${p.disponibilidade.replace(",", " | ")}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="contactProfessor('${p.nome}')">
                        <i class="bi bi-envelope me-2"></i>Enviar Mensagem
                    </button>
                </div>
            </div>
        </div>
    `;
    modalsContainer.appendChild(modal);
});

// ============================
// Candidatura a Professor
// ============================
function handleApplyTeacher() {
    protectAction(async () => {
        const nome = prompt("Digite seu nome completo:");
        const email = prompt("Digite seu email:");
        const telefone = prompt("Digite seu telefone:");
        const formacao = prompt("Qual sua forma??o?");
        const experiencia = prompt("Descreva sua experiência de ensino:");

        if (!nome || !email || !formacao || !experiencia) {
            return alert("Todos os campos obrigatórios devem ser preenchidos!");
        }

        alert(`Candidatura enviada com sucesso!\nNome: ${nome}\nEmail: ${email}\nFormação: ${formacao}`);
    })();
}

const applyButton = document.querySelector(".become-teacher .btn");
applyButton.addEventListener("click", handleApplyTeacher);

// ============================
// Contato Professor (protegido)
// ============================
function contactProfessor(professorName) {
    protectAction(() => {
        const email = 'escoladelinguasdemaputo@gmail.com';
        const subject = `Contato Professor: ${professorName}`;
        const body = `Ol?, gostaria de entrar em contato com o professor ${professorName}.\n\nMeu nome:\nTelefone:\nInteresse:\n`;
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    })();
}

window.contactProfessor = contactProfessor;
