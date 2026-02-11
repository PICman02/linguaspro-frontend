(function () {
  const API_BASE = window.__API_URL__ || window.API_URL || "http://localhost:5001/api";

  const state = {
    materials: [],
    user: null,
  };

  const el = {
    container: document.getElementById("libraryContainer"),
    materialCount: document.getElementById("materialCount"),
    statTotal: document.getElementById("materialsStatTotal"),
    statVideo: document.getElementById("materialsStatVideo"),
    statQuiz: document.getElementById("materialsStatQuiz"),
    search: document.getElementById("searchInput"),
    filterType: document.getElementById("filterType"),
    filterLanguage: document.getElementById("filterLanguage"),
    filterLevel: document.getElementById("filterLevel"),
    sendBtn: document.getElementById("btnEnviarMaterial"),
    sendForm: document.getElementById("formEnviarMaterial"),
    fileInput: document.getElementById("materialArquivo"),
    sendTitle: document.getElementById("materialTitulo"),
    sendType: document.getElementById("materialTipo"),
    sendVisibility: document.getElementById("materialVisibility"),
    detailType: byId("detailTipo"),
    detailTitle: byId("detailTitulo"),
    detailDescription: byId("detailDescricao", "detailDescrição", "detailDescriÃ§Ã£o"),
    detailLanguage: byId("detailIdioma"),
    detailLevel: byId("detailNivel"),
    detailProfessor: byId("detailProfessor"),
    detailDuration: byId("detailDuracao", "detailDuração", "detailDuraÃ§Ã£o"),
    detailVisibility: byId("detailVisibility"),
    detailDownload: byId("downloadButton"),
    detailQuiz: byId("quizButton"),
    detailModalEl: byId("materialDetailModal"),
    sendModalEl: byId("enviarMaterialModal"),
  };

  const sendModal = el.sendModalEl ? bootstrap.Modal.getOrCreateInstance(el.sendModalEl) : null;
  const detailModal = el.detailModalEl ? bootstrap.Modal.getOrCreateInstance(el.detailModalEl) : null;

  function byId(...ids) {
    for (const id of ids) {
      const node = document.getElementById(id);
      if (node) return node;
    }
    return null;
  }

  function getToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  }

  function getUser() {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function flash(message, type = "success") {
    const host = document.querySelector(".library-content .container");
    if (!host) return;
    const box = document.createElement("div");
    box.className = `alert alert-${type}`;
    box.textContent = message;
    box.style.marginBottom = "1rem";
    host.prepend(box);
    setTimeout(() => box.remove(), 3000);
  }

  async function request(path, options = {}) {
    const token = getToken();
    const headers = {
      ...(options.headers || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const ctl = new AbortController();
    const timeout = setTimeout(() => ctl.abort(), 15000);
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        signal: ctl.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      return data;
    } catch (err) {
      if (err?.name === "AbortError") {
        throw new Error("A requisicao demorou demasiado. Verifique a ligacao.");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  function inferLanguage(courseTitle) {
    const txt = String(courseTitle || "").toLowerCase();
    if (txt.includes("ingles")) return "ingles";
    if (txt.includes("portugues")) return "portugues";
    if (txt.includes("frances")) return "frances";
    if (txt.includes("espanhol")) return "espanhol";
    if (txt.includes("alemao")) return "alemao";
    if (txt.includes("mandarim")) return "mandarim";
    return "ingles";
  }

  function typeIcon(type) {
    switch (String(type || "").toLowerCase()) {
      case "video":
        return "bi-play-circle-fill";
      case "audio":
        return "bi-volume-up-fill";
      case "slide":
      case "slides":
        return "bi-file-earmark-slides-fill";
      case "exercise":
        return "bi-journal-check";
      default:
        return "bi-file-earmark-text";
    }
  }

  function normalizeMaterial(item) {
    return {
      id: item.id,
      type: item.type || "pdf",
      title: item.title || "Material",
      description: item.course_title ? `Material do curso ${item.course_title}` : "Material geral",
      language: inferLanguage(item.course_title),
      level: "intermediario",
      professorName: item.professor_name || "Professor",
      professorId: item.professor_id || "",
      createdAt: (item.created_at || "").slice(0, 10),
      fileName: item.file_name || "",
      courseTitle: item.course_title || "Geral",
      visibility: item.visibility || "public",
    };
  }

  function canDeleteMaterial(material) {
    const user = state.user;
    if (!user) return false;
    if (user.role === "Admin") return true;
    if (user.role === "professor" && String(material.professorId) === String(user.id)) return true;
    return false;
  }

  function updateCounters() {
    if (el.statTotal) el.statTotal.textContent = String(state.materials.length);
    if (el.statVideo) {
      el.statVideo.textContent = String(
        state.materials.filter((item) => String(item.type).toLowerCase() === "video").length
      );
    }
    if (el.statQuiz) {
      el.statQuiz.textContent = String(
        state.materials.filter((item) => String(item.type).toLowerCase() === "quiz").length
      );
    }
  }

  function updateVisibleCount() {
    if (!el.container || !el.materialCount) return;
    const count = Array.from(el.container.children).filter((card) => card.style.display !== "none").length;
    el.materialCount.textContent = `${count} materiais`;
  }

  function renderCards() {
    if (!el.container) return;
    el.container.innerHTML = "";

    if (state.materials.length === 0) {
      el.container.innerHTML =
        '<div class="col-12"><div class="alert alert-info text-center">Nenhum material disponivel no momento.</div></div>';
      if (el.materialCount) el.materialCount.textContent = "0 materiais";
      updateCounters();
      return;
    }

    const cards = state.materials.map((material) => {
      const canDelete = canDeleteMaterial(material);
      return `
        <div class="col-lg-4 col-md-6 material-card" data-type="${material.type}" data-language="${material.language}" data-level="${material.level}">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-img-top bg-primary bg-opacity-10 p-4 text-center">
              <i class="bi ${typeIcon(material.type)} text-primary fs-1"></i>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge bg-danger text-uppercase">${material.type}</span>
                <span class="text-muted small">${material.createdAt || ""}</span>
              </div>
              <h5 class="card-title mb-2">${escapeHtml(material.title)}</h5>
              <p class="card-text text-muted small mb-3">${escapeHtml(material.description)}</p>
              <div class="mb-3">
                <span class="badge bg-light text-dark me-1">${material.language}</span>
                <span class="badge bg-light text-dark">${material.level}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">${escapeHtml(material.professorName)}</small>
                <div class="d-flex gap-1">
                  <button class="btn btn-sm btn-outline-primary" data-action="details" data-id="${material.id}">Ver Detalhes</button>
                  <button class="btn btn-sm btn-success" data-action="download" data-id="${material.id}"><i class="bi bi-download"></i></button>
                  ${
                    canDelete
                      ? `<button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${material.id}" title="Apagar material"><i class="bi bi-trash"></i></button>`
                      : ""
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    el.container.innerHTML = cards.join("");
    updateVisibleCount();
    updateCounters();
  }

  function applyFilters() {
    if (!el.container) return;
    const text = String(el.search?.value || "").toLowerCase();
    const type = String(el.filterType?.value || "all");
    const language = String(el.filterLanguage?.value || "all");
    const level = String(el.filterLevel?.value || "all");

    Array.from(el.container.children).forEach((card) => {
      const title = String(card.querySelector(".card-title")?.textContent || "").toLowerCase();
      const description = String(card.querySelector(".card-text")?.textContent || "").toLowerCase();
      const okText = !text || title.includes(text) || description.includes(text);
      const okType = type === "all" || card.dataset.type === type;
      const okLanguage = language === "all" || card.dataset.language === language;
      const okLevel = level === "all" || card.dataset.level === level;
      card.style.display = okText && okType && okLanguage && okLevel ? "block" : "none";
    });
    updateVisibleCount();
  }

  function openDetails(id) {
    const material = state.materials.find((item) => String(item.id) === String(id));
    if (!material || !detailModal) return;

    if (el.detailType) el.detailType.textContent = material.type;
    if (el.detailTitle) el.detailTitle.textContent = material.title;
    if (el.detailDescription) el.detailDescription.textContent = material.description;
    if (el.detailLanguage) el.detailLanguage.textContent = material.language;
    if (el.detailLevel) el.detailLevel.textContent = material.level;
    if (el.detailProfessor) el.detailProfessor.textContent = material.professorName;
    if (el.detailDuration) el.detailDuration.textContent = material.createdAt;
    if (el.detailVisibility) {
      el.detailVisibility.textContent = material.visibility === "enrolled" ? "Somente inscritos" : "Todos";
    }

    if (el.detailDownload) el.detailDownload.onclick = () => downloadMaterial(id);
    if (el.detailQuiz) el.detailQuiz.style.display = "none";

    ensureDetailDeleteButton(material);
    detailModal.show();
  }

  function ensureDetailDeleteButton(material) {
    const footer = el.detailModalEl?.querySelector(".modal-footer");
    if (!footer) return;
    let deleteBtn = footer.querySelector('[data-role="delete-material"]');
    if (canDeleteMaterial(material)) {
      if (!deleteBtn) {
        deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "btn btn-outline-danger";
        deleteBtn.setAttribute("data-role", "delete-material");
        deleteBtn.innerHTML = '<i class="bi bi-trash me-1"></i>Apagar';
        footer.prepend(deleteBtn);
      }
      deleteBtn.onclick = async () => {
        await deleteMaterial(material.id);
        detailModal.hide();
      };
    } else if (deleteBtn) {
      deleteBtn.remove();
    }
  }

  function downloadMaterial(id) {
    const material = state.materials.find((item) => String(item.id) === String(id));
    if (!material) return;
    flash(`Download solicitado para: ${material.fileName || "arquivo"}`, "info");
  }

  async function deleteMaterial(id) {
    const material = state.materials.find((item) => String(item.id) === String(id));
    if (!material) return;
    if (!canDeleteMaterial(material)) {
      flash("Voce nao tem permissao para apagar este material.", "danger");
      return;
    }

    const ok = window.confirm(`Deseja apagar o material "${material.title}"?`);
    if (!ok) return;

    try {
      if (state.user?.role === "Admin") {
        await request(`/admin/materials/${id}`, { method: "DELETE" });
      } else {
        await request(`/professor/materials/${id}`, { method: "DELETE" });
      }
      flash("Material apagado com sucesso.");
      await loadLibrary();
    } catch (error) {
      flash(error.message || "Erro ao apagar material.", "danger");
    }
  }

  async function loadLibrary() {
    try {
      const data = await request("/library/materials");
      state.materials = Array.isArray(data.materials) ? data.materials.map(normalizeMaterial) : [];
      renderCards();
    } catch (error) {
      if (el.container) {
        el.container.innerHTML = `<div class="col-12"><div class="alert alert-danger text-center">${escapeHtml(
          error.message || "Falha ao carregar biblioteca"
        )}</div></div>`;
      }
      if (el.materialCount) el.materialCount.textContent = "0 materiais";
      state.materials = [];
      updateCounters();
    }
  }

  async function submitMaterial(event) {
    event.preventDefault();
    const token = getToken();
    if (!token || !state.user || state.user.role !== "professor") {
      flash("Sessao invalida para envio de material.", "danger");
      return;
    }

    const title = String(el.sendTitle?.value || "").trim();
    const type = String(el.sendType?.value || "").trim();
    const visibility = String(el.sendVisibility?.value || "public").trim();
    const fileName = el.fileInput?.files?.length ? el.fileInput.files[0].name : "";

    if (!title || !type) {
      flash("Titulo e tipo sao obrigatorios.", "warning");
      return;
    }

    try {
      await request("/professor/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          file_name: fileName,
          visibility: visibility || "public",
        }),
      });

      if (sendModal) sendModal.hide();
      if (el.sendForm) el.sendForm.reset();
      flash("Material enviado com sucesso.");
      await loadLibrary();
    } catch (error) {
      flash(error.message || "Erro ao enviar material.", "danger");
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function bind() {
    el.container?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action][data-id]");
      if (!button) return;
      const action = button.getAttribute("data-action");
      const id = button.getAttribute("data-id");
      if (action === "details") openDetails(id);
      if (action === "download") downloadMaterial(id);
      if (action === "delete") deleteMaterial(id);
    });

    el.search?.addEventListener("input", applyFilters);
    el.filterType?.addEventListener("change", applyFilters);
    el.filterLanguage?.addEventListener("change", applyFilters);
    el.filterLevel?.addEventListener("change", applyFilters);

    el.sendBtn?.addEventListener("click", () => {
      if (!state.user || state.user.role !== "professor") {
        flash("Somente professores autenticados podem enviar material.", "warning");
        window.location.href = "login.html";
        return;
      }
      if (sendModal) sendModal.show();
    });

    el.sendForm?.addEventListener("submit", submitMaterial);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    state.user = getUser();
    bind();
    await loadLibrary();
  });
})();
