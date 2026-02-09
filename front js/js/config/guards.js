// ============================
// AUTH STORAGE HELPERS
// ============================

function getStorage() {
    return localStorage.getItem("token")
        localStorage
        : sessionStorage;
}

function getToken() {
    const storage = getStorage();
    return storage.getItem("token");
}

function getUser() {
    const storage = getStorage();
    const user = storage.getItem("user");
    return user ? JSON.parse(user) : null;
}

function clearAuth() {
    localStorage.clear();
    sessionStorage.clear();
}

// ============================
// BASIC AUTH GUARD
// ============================

export function requireAuth() {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
        clearAuth();
        window.location.href = "login.html";
    }
}

// ============================
// ROLE GUARD
// ============================

export function requireRole(allowedRoles = []) {
    requireAuth();

    const user = getUser();

    if (!allowedRoles.includes(user.role)) {
        window.location.href = "login.html";
    }
}

// ============================
// AUTO REDIRECT IF LOGGED
// ============================

export function redirectIfAuthenticated() {
    const token = getToken();
    const user = getUser();

    if (token && user) {
        switch (user.role) {
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
}

// ============================
// LOGOUT
// ============================

export function logout() {
    clearAuth();
    window.location.href = "login.html";
}
// ============================
// PROTEGER AÇÕES (ex: Solicitar Orçamento)
// ============================

export function protectAction(callback) {
    return function(...args) {
        const token = getToken();
        const user = getUser();

        if (!token || !user) {
            clearAuth();
            alert("Você precisa estar logado para realizar esta ação!");
            window.location.href = "login.html";
            return;
        }

        callback(...args);
    };
}
