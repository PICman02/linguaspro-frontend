document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("formLogin");
  const registerForm = document.getElementById("formRegister");
  const loginFeedback = document.getElementById("loginFeedback");
  const registerFeedback = document.getElementById("registerFeedback");
  const apiBase = window.__API_URL__ || window.API_URL || "http://localhost:5001/api";

  const showFeedback = (target, message, type = "danger") => {
    if (!target) return;
    target.className = `alert alert-${type}`;
    target.textContent = message;
  };

  const withTimeout = async (url, options = {}, timeoutMs = 15000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  };

  const setFormLoading = (form, loading, loadingText = "A processar...") => {
    const submit = form?.querySelector('button[type="submit"]');
    if (!submit) return;
    if (!submit.dataset.originalText) submit.dataset.originalText = submit.textContent;
    submit.disabled = loading;
    submit.textContent = loading ? loadingText : submit.dataset.originalText;
  };

  const login = async (email, password) => {
    let response = await withTimeout(`${apiBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    let payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      response = await withTimeout(`${apiBase}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      payload = await response.json().catch(() => ({}));
    }

    if (!response.ok) {
      throw new Error(payload.error || payload.message || "Falha no login");
    }

    return payload;
  };

  const params = new URLSearchParams(window.location.search);
  if (params.get("reason") === "expired") {
    showFeedback(loginFeedback, "Sessao expirada. Por favor, faca login novamente.", "warning");
  }

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = (document.getElementById("emailLogin")?.value || "").trim().toLowerCase();
    const password = document.getElementById("passwordLogin")?.value || "";
    const remember = document.getElementById("rememberMe")?.checked;

    if (!email || !password) {
      showFeedback(loginFeedback, "Preencha email e password.", "warning");
      return;
    }

    setFormLoading(loginForm, true, "A entrar...");
    try {
      const data = await login(email, password);
      const token = data.token;
      const user = data.user || data.admin || { email, role: "aluno" };

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));

      if (user.role === "Admin") {
        localStorage.setItem("admin_token", token);
        window.location.href = "dashboard-admin.html";
      } else if (user.role === "professor") {
        localStorage.removeItem("admin_token");
        window.location.href = "dashboard-professor.html";
      } else {
        localStorage.removeItem("admin_token");
        window.location.href = "dashboard-aluno.html";
      }
    } catch (error) {
      const message = error?.name === "AbortError"
        ? "Tempo de resposta excedido. Tente novamente."
        : (error.message || "Erro no login");
      showFeedback(loginFeedback, message, "danger");
    } finally {
      setFormLoading(loginForm, false);
    }
  });

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    const role = String(formData.get("role") || "aluno");

    if (!name || !email || !password) {
      showFeedback(registerFeedback, "Preencha todos os campos obrigatorios.", "warning");
      return;
    }

    if (password !== confirmPassword) {
      showFeedback(registerFeedback, "As passwords nao coincidem.", "warning");
      return;
    }

    setFormLoading(registerForm, true, "A criar conta...");
    try {
      const response = await withTimeout(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.message || "Falha no cadastro");
      }

      showFeedback(registerFeedback, "Conta criada com sucesso. Faca login para continuar.", "success");
      registerForm.reset();
    } catch (error) {
      const message = error?.name === "AbortError"
        ? "Tempo de resposta excedido. Tente novamente."
        : (error.message || "Erro no cadastro");
      showFeedback(registerFeedback, message, "danger");
    } finally {
      setFormLoading(registerForm, false);
    }
  });
});
