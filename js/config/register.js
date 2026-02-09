document.addEventListener("DOMContentLoaded", () => {
  let currentStep = 1;
  const totalSteps = 4;

  const formData = {
    personal: {},
    credentials: {},
    professional: {},
    files: [],
  };

  const API_BASE = window.__API_URL__ || window.API_URL || "http://localhost:5001/api";

  const progressFill = document.getElementById("progressFill");
  const steps = document.querySelectorAll(".step");
  const formContainers = document.querySelectorAll(".form-container");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const birthdateInput = document.getElementById("birthdate");

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const termsCheckbox = document.getElementById("terms");

  const professionSelect = document.getElementById("profession");
  const experienceSelect = document.getElementById("experience");
  const educationSelect = document.getElementById("education");
  const objectiveInput = document.getElementById("objective");
  const skillCheckboxes = document.querySelectorAll(".checkbox-group input[type='checkbox']");

  const fileInput = document.getElementById("fileInput");
  const fileUploadArea = document.getElementById("fileUploadArea");
  const fileList = document.getElementById("fileList");

  const nameValidation = document.getElementById("nameValidation");
  const emailValidation = document.getElementById("emailValidation");
  const phoneValidation = document.getElementById("phoneValidation");
  const birthdateValidation = document.getElementById("birthdateValidation");
  const usernameValidation = document.getElementById("usernameValidation");
  const passwordValidation = document.getElementById("passwordValidation");
  const confirmPasswordValidation = document.getElementById("confirmPasswordValidation");
  const termsValidation = document.getElementById("termsValidation");
  const professionValidation = document.getElementById("professionValidation");
  const experienceValidation = document.getElementById("experienceValidation");
  const educationValidation = document.getElementById("educationValidation");
  const skillsValidation = document.getElementById("skillsValidation");
  const objectiveValidation = document.getElementById("objectiveValidation");

  function showStep(step) {
    formContainers.forEach((c) => c.classList.remove("active"));
    document.getElementById(`formStep${step}`)?.classList.add("active");

    steps.forEach((s) => s.classList.remove("active"));
    steps.forEach((s) => {
      if (parseInt(s.dataset.step, 10) <= step) s.classList.add("active");
    });

    progressFill.style.width = `${(step / totalSteps) * 100}%`;
    currentStep = step;
  }

  function showError(input, container, message) {
    if (input) {
      input.classList.remove("success");
      input.classList.add("error");
    }
    if (container) {
      container.innerHTML = `<i class=\"fas fa-exclamation-circle\"></i> ${message}`;
      container.className = "validation-message error";
    }
  }

  function showSuccess(input, container) {
    if (input) {
      input.classList.remove("error");
      input.classList.add("success");
    }
    if (container) {
      container.innerHTML = "";
      container.className = "validation-message";
    }
  }

  function validateStep1() {
    let valid = true;

    if (!nameInput.value.trim() || nameInput.value.trim().length < 3) {
      showError(nameInput, nameValidation, "Nome deve ter pelo menos 3 caracteres");
      valid = false;
    } else showSuccess(nameInput, nameValidation);

    if (!emailInput.value.includes("@")) {
      showError(emailInput, emailValidation, "E-mail invalido");
      valid = false;
    } else showSuccess(emailInput, emailValidation);

    if (phoneInput.value.trim().length < 9) {
      showError(phoneInput, phoneValidation, "Telefone invalido");
      valid = false;
    } else showSuccess(phoneInput, phoneValidation);

    if (!birthdateInput.value) {
      showError(birthdateInput, birthdateValidation, "Informe a data de nascimento");
      valid = false;
    } else showSuccess(birthdateInput, birthdateValidation);

    if (valid) {
      formData.personal = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim().toLowerCase(),
        phone: phoneInput.value.trim(),
        birthdate: birthdateInput.value,
      };
    }

    return valid;
  }

  function validateStep2() {
    let valid = true;

    if (usernameInput.value.trim().length < 4) {
      showError(usernameInput, usernameValidation, "Usuario deve ter pelo menos 4 caracteres");
      valid = false;
    } else showSuccess(usernameInput, usernameValidation);

    if (passwordInput.value.length < 8) {
      showError(passwordInput, passwordValidation, "Senha deve ter pelo menos 8 caracteres");
      valid = false;
    } else showSuccess(passwordInput, passwordValidation);

    if (passwordInput.value !== confirmPasswordInput.value) {
      showError(confirmPasswordInput, confirmPasswordValidation, "As senhas nao coincidem");
      valid = false;
    } else showSuccess(confirmPasswordInput, confirmPasswordValidation);

    if (!termsCheckbox.checked) {
      termsValidation.textContent = "Voce precisa aceitar os termos";
      termsValidation.className = "validation-message error";
      valid = false;
    } else {
      termsValidation.textContent = "";
      termsValidation.className = "validation-message";
    }

    if (valid) {
      formData.credentials = {
        username: usernameInput.value.trim(),
        password: passwordInput.value,
      };
    }

    return valid;
  }

  function validateStep3() {
    let valid = true;

    if (!professionSelect.value) {
      showError(professionSelect, professionValidation, "Selecione sua area");
      valid = false;
    } else showSuccess(professionSelect, professionValidation);

    if (!experienceSelect.value) {
      showError(experienceSelect, experienceValidation, "Selecione sua experiencia");
      valid = false;
    } else showSuccess(experienceSelect, experienceValidation);

    if (!educationSelect.value) {
      showError(educationSelect, educationValidation, "Selecione sua escolaridade");
      valid = false;
    } else showSuccess(educationSelect, educationValidation);

    const selectedSkills = [...skillCheckboxes].filter((c) => c.checked).map((c) => c.value);
    if (selectedSkills.length === 0) {
      skillsValidation.textContent = "Selecione pelo menos uma habilidade";
      skillsValidation.className = "validation-message error";
      valid = false;
    } else {
      skillsValidation.textContent = "";
      skillsValidation.className = "validation-message";
    }

    if (objectiveInput.value.trim().length < 50) {
      showError(objectiveInput, objectiveValidation, "Minimo de 50 caracteres");
      valid = false;
    } else showSuccess(objectiveInput, objectiveValidation);

    if (valid) {
      formData.professional = {
        profession: professionSelect.value,
        experience: experienceSelect.value,
        education: educationSelect.value,
        skills: selectedSkills,
        objective: objectiveInput.value.trim(),
      };
    }

    return valid;
  }

  fileUploadArea?.addEventListener("click", () => fileInput?.click());

  fileInput?.addEventListener("change", () => {
    [...fileInput.files].forEach((file) => {
      if (file.size <= 5 * 1024 * 1024) {
        formData.files.push({ name: file.name, size: file.size, type: file.type });
        const li = document.createElement("li");
        li.textContent = file.name;
        fileList.appendChild(li);
      }
    });
  });

  document.getElementById("nextStep1").onclick = () => validateStep1() && showStep(2);
  document.getElementById("backStep2").onclick = () => showStep(1);
  document.getElementById("nextStep2").onclick = () => validateStep2() && showStep(3);
  document.getElementById("backStep3").onclick = () => showStep(2);
  document.getElementById("nextStep3").onclick = () => {
    if (!validateStep3()) return;
    showStep(4);
    document.getElementById("summaryContent").innerHTML = `
      <p><strong>Nome:</strong> ${formData.personal.name}</p>
      <p><strong>Email:</strong> ${formData.personal.email}</p>
      <p><strong>Area:</strong> ${formData.professional.profession}</p>
      <p><strong>Experiência:</strong> ${formData.professional.experience}</p>
    `;
  };
  document.getElementById("backStep4").onclick = () => showStep(3);

  document.getElementById("submitForm").onclick = async () => {
    try {
      const payload = {
        name: formData.personal.name,
        email: formData.personal.email,
        phone: formData.personal.phone,
        birthdate: formData.personal.birthdate,
        username: formData.credentials.username,
        password: formData.credentials.password,
        profession: formData.professional.profession,
        experience: formData.professional.experience,
        education: formData.professional.education,
        skills: formData.professional.skills,
        objective: formData.professional.objective,
        files: formData.files,
      };

      const res = await fetch(`${API_BASE}/teachers/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Falha ao enviar candidatura");
      }

      document.getElementById("formStep4").classList.remove("active");
      document.getElementById("pendingMessage").classList.add("active");
      document.getElementById("registeredEmail").innerText = payload.email;
    } catch (error) {
      alert(error.message || "Erro ao enviar candidatura");
    }
  };

  document.getElementById("goToDashboard")?.addEventListener("click", () => {
    window.location.href = "login.html";
  });
});

