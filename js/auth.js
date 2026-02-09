(function (global) {
  function getUser() {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function getToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
  }

  function isLoggedIn() {
    return Boolean(getToken());
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin_token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    global.location.href = "login.html";
  }

  global.AuthManager = { getUser, getToken, isLoggedIn, logout };
})(window);
