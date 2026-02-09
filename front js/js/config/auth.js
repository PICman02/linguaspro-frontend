// ============================
// AUTH HELPERS
// ============================

function getAuthData() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const userRaw =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  if (!token || !userRaw) return null;

  try {
    const user = JSON.parse(userRaw);
    return { token, user };
  } catch {
    return null;
  }
}

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}

function redirectToLogin() {
  clearAuth();
  window.location.href = "login.html";
}

// ============================
// GUARDS
// ============================

/**
 * Protege qualquer página que exija login
 */
export function requireAuth() {
  const auth = getAuthData();

  if (!auth) {
    redirectToLogin();
  }
}

/**
 * Protege páginas por ROLE
 * @param {"aluno"|"professor"|"admin"} role
 */
export function requireRole(role) {
  const auth = getAuthData();

  if (!auth) {
    redirectToLogin();
    return;
  }

  if (auth.user.role !== role) {
    // acesso negado → redireciona para dashboard correto
    redirectByRole(auth.user.role);
  }
}

/**
 * Redireciona automaticamente pelo role
 */
export function redirectByRole(role) {
  switch (role) {
    case "admin":
      window.location.href = "dashboard-admin.html";
      break;
    case "professor":
      window.location.href = "dashboard-professor.html";
      break;
    default:
      window.location.href = "dashboard-aluno.html";
  }
}

/**
 * Logout seguro
 */
export function logout() {
  clearAuth();
  window.location.href = "login.html";
}
