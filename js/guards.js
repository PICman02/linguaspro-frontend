export function getUser() {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("token") || sessionStorage.getItem("token"));
}

export function protectAction(action) {
  return (...args) => {
    if (!isLoggedIn()) {
      alert("Precisa fazer login para continuar.");
      window.location.href = "login.html";
      return;
    }
    return action(...args);
  };
}

window.getUser = getUser;
window.protectAction = protectAction;
