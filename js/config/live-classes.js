const API_BASE = window.__API_URL__ || window.API_URL || "http://localhost:5001/api";

let allClasses = [];
let currentClass = null;
let coursesCatalog = [];

const loginModal = document.getElementById("loginModal");
const openLoginModalBtn = document.getElementById("openLoginModal");
const closeLoginModalBtn = document.getElementById("closeLoginModal");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const userAvatarHeader = document.getElementById("userAvatarHeader");
const userAvatarInitial = document.getElementById("userAvatarInitial");
const scheduleClassBtn = document.getElementById("scheduleClassBtn");

const filterCourse = document.getElementById("filterCourse");
const filterProfessor = document.getElementById("filterProfessor");
const filterLevel = document.getElementById("filterLevel");
const filterDate = document.getElementById("filterDate");
const filterStatus = document.getElementById("filterStatus");
const filterDuration = document.getElementById("filterDuration");
const applyFiltersBtn = document.getElementById("applyFilters");
const resetFiltersBtn = document.getElementById("resetFilters");
const liveClassesContainer = document.getElementById("liveClassesContainer");
const emptyState = document.getElementById("emptyState");

const classModal = document.getElementById("classModal");
const closeClassModal = document.getElementById("closeClassModal");
const joinClassBtn = document.getElementById("joinClassBtn");

const liveNowCount = document.getElementById("liveNow");
const upcomingCount = document.getElementById("upcoming");
const teachersCount = document.getElementById("teachers");
const studentsCount = document.getElementById("students");

const scheduleModal = document.getElementById("scheduleModal");
const closeScheduleModalBtn = document.getElementById("closeScheduleModal");
const scheduleForm = document.getElementById("scheduleForm");

function notify(message, type = "info") {
  if (window.Toastify) {
    const background =
      type === "success"
        ? "#198754"
        : type === "error"
        ? "#dc3545"
        : "#0d6efd";
    window.Toastify({
      text: message,
      duration: 3000,
      gravity: "bottom",
      position: "right",
      backgroundColor: background,
    }).showToast();
    return;
  }

  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.right = "16px";
  toast.style.bottom = "16px";
  toast.style.zIndex = "2000";
  toast.style.padding = "10px 12px";
  toast.style.borderRadius = "8px";
  toast.style.color = "#fff";
  toast.style.background =
    type === "success" ? "#198754" : type === "error" ? "#dc3545" : "#0d6efd";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
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

function normalizeStatus(status) {
  if (status === "scheduled") return "upcoming";
  return status || "upcoming";
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getCourseLabelFromTitle(title) {
  const t = String(title || "").toLowerCase();
  if (t.includes("ingles")) return "Inglês";
  if (t.includes("portugues")) return "Português";
  if (t.includes("frances")) return "Francês";
  if (t.includes("espanhol")) return "Espanhol";
  if (t.includes("alemao")) return "Alemão";
  if (t.includes("italiano")) return "Italiano";
  if (t.includes("japones")) return "Japonês";
  return "Geral";
}

function parseDateInput(input) {
  const value = String(input || "").trim();
  if (!value) return "";

  const parts = value.includes("/") ? value.split("/") : value.split("-");
  if (parts.length !== 3) return "";

  let day = parts[0];
  let month = parts[1];
  let year = parts[2];

  if (year.length === 2) year = "20" + year;

  const iso = year.padStart(4, "0") + "-" + month.padStart(2, "0") + "-" + day.padStart(2, "0");
  return iso;
}

function parseList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  const raw = String(value).trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((v) => String(v)).filter(Boolean);
  } catch {
    return raw.split("\n").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function toUiClass(item) {
  const courseLabel = item.course_title || getCourseLabelFromTitle(item.title);
  const courseKey = item.course_id ? String(item.course_id) : slugify(courseLabel || item.title);
  const dateObj = item.scheduled_at ? new Date(item.scheduled_at) : new Date(item.created_at || Date.now());
  const isoDate = Number.isNaN(dateObj.getTime()) ? "" : dateObj.toISOString().slice(0, 10);

  return {
    id: item.id,
    title: item.title || "Aula ao vivo",
    description:
      item.description ||
      (item.course_title ? "Aula do curso " + item.course_title + "." : "Aula ao vivo da plataforma."),
    courseKey,
    courseLabel,
    level: item.level || "intermediario",
    status: normalizeStatus(item.status),
    date: dateObj.toLocaleDateString("pt-PT"),
    dateIso: isoDate,
    startTime: item.scheduled_at
      ? new Date(item.scheduled_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
      : "--:--",
    duration: Number(item.duration_minutes || item.duration || 60),
    spots: Number(item.capacity || item.spots || 25),
    enrolled: Number(item.enrolled || 0),
    professorId: item.professor_id || "",
    professorName: item.professor_name || "Professor",
    professorBio: "Professor da plataforma LinguaPro.",
    meetingLink: item.meeting_link || "",
    approvalStatus: item.approval_status || "approved",
    content: parseList(item.content),
    materials: parseList(item.support_materials),
  };
}

async function loadCoursesCatalog() {
  try {
    const res = await fetch(API_BASE + "/courses");
    const data = await res.json().catch(() => ({}));
    coursesCatalog = Array.isArray(data.courses) ? data.courses : [];
  } catch {
    coursesCatalog = [];
  }
}

function populateCourseFilter(classes) {
  const options = [{ value: "all", label: "Todos os cursos" }];
  const seen = new Set();

  coursesCatalog.forEach((c) => {
    const id = String(c.id || "").trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    options.push({ value: id, label: c.title || "Curso" });
  });

  classes.forEach((c) => {
    if (!c.courseKey || seen.has(c.courseKey)) return;
    seen.add(c.courseKey);
    options.push({ value: c.courseKey, label: c.courseLabel || "Geral" });
  });

  filterCourse.innerHTML = options
    .map((opt) => "<option value=\"" + opt.value + "\">" + opt.label + "</option>")
    .join("");
}

function populateProfessorFilter(classes) {
  const unique = new Map();
  classes.forEach((c) => {
    if (!c.professorId) return;
    if (!unique.has(c.professorId)) unique.set(c.professorId, c.professorName);
  });
  filterProfessor.innerHTML = "<option value=\"all\">Todos os professores</option>";
  unique.forEach((name, id) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = name;
    filterProfessor.appendChild(opt);
  });
}

function populateScheduleCourses() {
  const select = document.getElementById("classCourseInput");
  if (!select) return;
  if (!coursesCatalog.length) return;
  select.innerHTML = coursesCatalog
    .map((course) => "<option value=\"" + course.id + "\">" + course.title + "</option>")
    .join("");
}

async function loadClasses() {
  try {
    const user = getUser();
    const token = getToken();

    let url = API_BASE + "/live-classes";
    let headers = {};

    if (user && user.role === "Admin" && token) {
      url = API_BASE + "/admin/live-classes";
      headers = { Authorization: "Bearer " + token };
    }

    const res = await fetch(url, { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Falha ao carregar aulas");

    allClasses = (data.classes || []).map(toUiClass);
    populateCourseFilter(allClasses);
    populateProfessorFilter(allClasses);
    renderClasses(allClasses);
    updateStats();
  } catch (error) {
    liveClassesContainer.innerHTML = "<div class=\"empty-state\"><h3>" + error.message + "</h3></div>";
  }
}

function renderClasses(classes) {
  liveClassesContainer.innerHTML = "";
  if (!classes.length) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  classes.forEach((cls) => {
    const card = document.createElement("div");
    card.className = "class-card";
    card.innerHTML =
      "<h3>" + cls.title + "</h3>" +
      "<p><strong>Professor:</strong> " + cls.professorName + "</p>" +
      "<p><strong>Curso:</strong> " + cls.courseLabel + "</p>" +
      "<p><strong>Data:</strong> " + cls.date + " " + cls.startTime + "</p>" +
      "<p><strong>Status:</strong> " + (cls.status === "upcoming" ? "Agendada" : cls.status === "live" ? "Ao Vivo" : "Gravada") + "</p>" +
      "<button class=\"btn-primary\" onclick=\"openClassModal('" + cls.id + "')\">Ver Detalhes</button>";
    liveClassesContainer.appendChild(card);
  });
}

function updateStats() {
  liveNowCount.textContent = allClasses.filter((c) => c.status === "live").length;
  upcomingCount.textContent = allClasses.filter((c) => c.status === "upcoming").length;
  teachersCount.textContent = new Set(allClasses.map((c) => c.professorId).filter(Boolean)).size;
  studentsCount.textContent = allClasses.reduce((acc, c) => acc + Number(c.enrolled || 0), 0);
}

function applyFilters() {
  const course = filterCourse.value;
  const professor = filterProfessor.value;
  const level = filterLevel.value;
  const status = filterStatus.value;
  const selectedDate = parseDateInput(filterDate.value);
  const maxDuration = filterDuration.value;

  const filtered = allClasses.filter((c) => {
    if (course !== "all" && c.courseKey !== course) return false;
    if (professor !== "all" && c.professorId !== professor) return false;
    if (level !== "all" && c.level !== level) return false;
    if (status !== "all" && c.status !== status) return false;
    if (selectedDate && c.dateIso !== selectedDate) return false;

    if (maxDuration !== "all") {
      const duration = Number(c.duration || 0);
      const max = Number(maxDuration);
      if (max === 30 && duration > 30) return false;
      if (max === 60 && (duration <= 30 || duration > 60)) return false;
      if (max === 90 && (duration <= 60 || duration > 90)) return false;
      if (max === 120 && duration <= 90) return false;
    }

    return true;
  });

  renderClasses(filtered);
}

function resetFilters() {
  filterCourse.value = "all";
  filterProfessor.value = "all";
  filterLevel.value = "all";
  filterStatus.value = "all";
  filterDate.value = "";
  filterDuration.value = "all";
  renderClasses(allClasses);
}

window.openClassModal = function openClassModal(classId) {
  const cls = allClasses.find((c) => String(c.id) === String(classId));
  if (!cls) return;
  currentClass = cls;

  document.getElementById("classTitle").textContent = cls.title;
  document.getElementById("classDescription").textContent = cls.description;
  document.getElementById("classCourse").textContent = cls.courseLabel;
  document.getElementById("classProfessor").textContent = cls.professorName;
  document.getElementById("classStart").textContent = cls.date + ", " + cls.startTime;
  document.getElementById("classDuration").textContent = cls.duration + " minutos";
  document.getElementById("classSpots").textContent = cls.enrolled + "/" + cls.spots + " preenchidas";
  document.getElementById("classLevel").textContent = cls.level;
  document.getElementById("teacherName").textContent = cls.professorName;
  document.getElementById("teacherBio").textContent = cls.professorBio;
  document.getElementById("classStatus").textContent =
    cls.status === "upcoming" ? "AGENDADA" : cls.status === "live" ? "AO VIVO" : "GRAVADA";
  const contentEl = document.getElementById("classContent");
  if (contentEl) {
    contentEl.innerHTML = cls.content.length
      ? cls.content.map((item) => "<li>" + item + "</li>").join("")
      : "<li>Conteúdo ainda não informado.</li>";
  }
  const materialsEl = document.getElementById("classMaterials");
  if (materialsEl) {
    materialsEl.innerHTML = cls.materials.length
      ? cls.materials
          .map((item) => "<a href=\"#\" class=\"material-item\"><i class=\"fas fa-file\"></i> " + item + "</a>")
          .join("")
      : "<div class=\"text-muted\">Sem materiais de apoio.</div>";
  }

  classModal.style.display = "block";
};

joinClassBtn.addEventListener("click", () => {
  if (!currentClass) return;
  if (!getToken()) {
    notify("Faça login para entrar na aula.", "error");
    loginModal.style.display = "block";
    return;
  }
  if (currentClass.meetingLink) {
    window.location.href = currentClass.meetingLink;
    return;
  }
  notify("Link da aula ainda não disponível.", "error");
});

closeClassModal.addEventListener("click", () => {
  classModal.style.display = "none";
});

closeLoginModalBtn.addEventListener("click", () => {
  loginModal.style.display = "none";
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = (document.getElementById("email").value || "").trim();
  const password = document.getElementById("password").value || "";

  try {
    let response = await fetch(API_BASE + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    let data = await response.json().catch(() => ({}));

    if (!response.ok) {
      response = await fetch(API_BASE + "/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      data = await response.json().catch(() => ({}));
    }

    if (!response.ok) throw new Error(data.error || "Falha no login");

    const user = data.user || data.admin;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(user));
    if (user && user.role === "Admin") localStorage.setItem("admin_token", data.token);

    loginModal.style.display = "none";
    syncAuthUI();
    await loadClasses();
  } catch (error) {
    notify(error.message || "Erro no login", "error");
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("admin_token");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  syncAuthUI();
  loadClasses();
});

function syncAuthUI() {
  const user = getUser();
  const token = getToken();
  if (!token || !user) {
    userAvatarHeader.style.display = "none";
    openLoginModalBtn.style.display = "inline-block";
    openLoginModalBtn.innerHTML = "<i class=\"fas fa-user\"></i> Login";
    openLoginModalBtn.onclick = () => {
      loginModal.style.display = "block";
    };
    logoutBtn.style.display = "none";
    scheduleClassBtn.style.display = "none";
    return;
  }

  userAvatarHeader.style.display = "flex";
  openLoginModalBtn.style.display = "inline-block";
  openLoginModalBtn.innerHTML = "<i class=\"fas fa-columns\"></i> Dashboard";
  openLoginModalBtn.onclick = () => {
    const target =
      user.role === "Admin"
        ? "dashboard-admin.html"
        : user.role === "professor"
        ? "dashboard-professor.html"
        : "dashboard-aluno.html";
    window.location.href = target;
  };
  logoutBtn.style.display = "inline-block";
  userAvatarInitial.textContent = (user.name || user.email || "U").charAt(0).toUpperCase();
  scheduleClassBtn.style.display = user.role === "professor" ? "inline-block" : "none";
}

window.openScheduleModal = function openScheduleModal() {
  scheduleModal.style.display = "block";
};

closeScheduleModalBtn.addEventListener("click", () => {
  scheduleModal.style.display = "none";
});

scheduleForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getToken();
  const user = getUser();
  if (!token || !user || user.role !== "professor") {
    notify("Apenas professores autenticados podem agendar aulas.", "error");
    return;
  }

  const title = document.getElementById("classTitleInput").value.trim();
  const description = document.getElementById("classDescriptionInput").value.trim();
  const courseId = document.getElementById("classCourseInput").value || null;
  const date = document.getElementById("classDateInput").value;
  const time = document.getElementById("classTimeInput").value;
  const visibility = document.getElementById("classVisibilityInput")?.value || "public";
  const duration = Number(document.getElementById("classDurationInput")?.value || 0);
  const spots = Number(document.getElementById("classSpotsInput")?.value || 0);
  const level = document.getElementById("classLevelInput")?.value || "intermediario";
  const content = parseList(document.getElementById("classContentInput")?.value || "");
  const materials = parseList(document.getElementById("classMaterialsInput")?.value || "");

  if (!title || !date || !time) {
    notify("Preencha os campos obrigatórios.", "error");
    return;
  }
  if (!duration || duration < 10) {
    notify("Defina a duração da aula.", "error");
    return;
  }
  if (!spots || spots < 1) {
    notify("Defina o número de vagas.", "error");
    return;
  }
  if (!content.length) {
    notify("Informe o conteúdo da aula.", "error");
    return;
  }

  const scheduledAt = new Date(date.split("-").reverse().join("-") + "T" + time + ":00");
  try {
    const response = await fetch(API_BASE + "/professor/live-classes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        title,
        description,
        course_id: courseId,
        scheduled_at: scheduledAt.toISOString(),
        visibility,
        duration_minutes: duration,
        capacity: spots,
        level,
        content,
        support_materials: materials,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Falha ao agendar aula");

    scheduleModal.style.display = "none";
    scheduleForm.reset();
    await loadClasses();
    notify("Aula agendada com sucesso.", "success");
  } catch (error) {
    notify(error.message || "Erro ao agendar aula", "error");
  }
});

if (window.flatpickr) {
  flatpickr("#filterDate", { dateFormat: "d/m/Y" });
  flatpickr("#classDateInput", { dateFormat: "d-m-Y" });
}

[filterCourse, filterProfessor, filterLevel, filterDate, filterStatus, filterDuration].forEach((el) => {
  el?.addEventListener("change", applyFilters);
});
filterDate?.addEventListener("input", applyFilters);
applyFiltersBtn.addEventListener("click", applyFilters);
resetFiltersBtn.addEventListener("click", resetFilters);

document.addEventListener("DOMContentLoaded", async () => {
  syncAuthUI();
  await loadCoursesCatalog();
  populateScheduleCourses();
  await loadClasses();
});

window.openSupportChat = function openSupportChat() {
  notify("Suporte: escoladelinguasdemaputo@gmail.com | +258 83 495 7798", "info");
};

window.startSimulatedClass = function startSimulatedClass() {
  notify("Função de simulação desativada. Use o botão Entrar na Aula para abrir o link real.", "info");
};

