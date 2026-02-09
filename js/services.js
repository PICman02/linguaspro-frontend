(function () {
  const API_BASE = window.__API_URL__ || window.API_URL || "http://localhost:5001/api";
  let selectedService = "";

  function getStoredUser() {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function ensureModal() {
    let modalEl = document.getElementById("serviceRequestModal");
    if (modalEl) return modalEl;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="modal fade" id="serviceRequestModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Solicitar Servico</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              <div id="serviceRequestFeedback" class="alert d-none" role="alert"></div>
              <form id="serviceRequestForm">
                <div class="mb-3">
                  <label class="form-label">Servico</label>
                  <input type="text" class="form-control" id="serviceRequestService" readonly>
                </div>
                <div class="mb-3">
                  <label class="form-label">Nome</label>
                  <input type="text" class="form-control" id="serviceRequestName" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" id="serviceRequestEmail" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Telefone</label>
                  <input type="text" class="form-control" id="serviceRequestPhone">
                </div>
                <div class="mb-3">
                  <label class="form-label">Detalhes</label>
                  <textarea class="form-control" id="serviceRequestDetails" rows="4" placeholder="Descreva o que precisa..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-100" id="serviceRequestSubmitBtn">Enviar Solicitacao</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper.firstElementChild);
    modalEl = document.getElementById("serviceRequestModal");

    const form = document.getElementById("serviceRequestForm");
    form.addEventListener("submit", submitRequest);
    return modalEl;
  }

  function showFeedback(type, message) {
    const feedback = document.getElementById("serviceRequestFeedback");
    if (!feedback) return;
    feedback.className = `alert alert-${type}`;
    feedback.textContent = message;
    feedback.classList.remove("d-none");
  }

  function clearFeedback() {
    const feedback = document.getElementById("serviceRequestFeedback");
    if (!feedback) return;
    feedback.className = "alert d-none";
    feedback.textContent = "";
  }

  function fillForm(serviceName) {
    selectedService = serviceName || "";
    const user = getStoredUser();

    document.getElementById("serviceRequestService").value = selectedService;
    document.getElementById("serviceRequestName").value = user?.name || "";
    document.getElementById("serviceRequestEmail").value = user?.email || "";
    document.getElementById("serviceRequestPhone").value = user?.phone || "";
    document.getElementById("serviceRequestDetails").value = "";
    clearFeedback();
  }

  async function submitRequest(event) {
    event.preventDefault();

    const name = (document.getElementById("serviceRequestName").value || "").trim();
    const email = (document.getElementById("serviceRequestEmail").value || "").trim();
    const phone = (document.getElementById("serviceRequestPhone").value || "").trim();
    const details = (document.getElementById("serviceRequestDetails").value || "").trim();
    const submitBtn = document.getElementById("serviceRequestSubmitBtn");

    if (!name || !email || !selectedService || !details) {
      showFeedback("warning", "Preencha todos os campos obrigatorios.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    try {
      const response = await fetch(`${API_BASE}/services/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          service: selectedService,
          details,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Falha ao enviar solicitacao");
      }

      showFeedback("success", "Solicitacao enviada. O admin ira analisar e confirmar.");
      setTimeout(() => {
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("serviceRequestModal"));
        modal.hide();
      }, 1000);
    } catch (error) {
      showFeedback("danger", error.message || "Erro ao enviar solicitacao");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar Solicitacao";
    }
  }

  window.solicitarOrcamento = function solicitarOrcamento(servico) {
    const modalEl = ensureModal();
    fillForm(servico);
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  };

  document.addEventListener("DOMContentLoaded", () => {
    const ctaBtn = document.getElementById("openServiceRequestBtn");
    if (!ctaBtn) return;
    ctaBtn.addEventListener("click", (event) => {
      event.preventDefault();
      window.solicitarOrcamento("Atendimento Geral");
    });
  });
})();
