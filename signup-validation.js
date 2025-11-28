
document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  const innerForm =
    nameInput?.form ||
    document.querySelector(".signin-container form form") ||
    document.querySelector(".signin-container form");

  // Submit button inside the inner form
  const submitBtn =
    innerForm?.querySelector('button[type="submit"]') ||
    document.querySelector(".signin-container .btn");

  if (!innerForm || !nameInput || !email || !password || !submitBtn) return;

  innerForm.setAttribute("novalidate", "");

  // --- Feedback element factory (no HTML edits needed) ---
  function makeFeedback(afterEl, id) {
    let span = document.createElement("span");
    span.id = id;
    span.setAttribute("aria-live", "polite");
    span.style.display = "block";
    span.style.fontSize = "0.9rem";
    span.style.marginTop = "4px";
    span.style.minHeight = "1em";
    span.textContent = "";
    afterEl.insertAdjacentElement("afterend", span);
    return span;
  }

  const nameFeedback = makeFeedback(nameInput, "nameFeedback");
  const emailFeedback = makeFeedback(email, "emailFeedback");
  const passwordFeedback = makeFeedback(password, "passwordFeedback");

  // --- UI helpers ---
  function setOK(el, span, msg) {
    el.style.outline = "2px solid #2a9d8f";
    span.style.color = "#2a9d8f";
    span.textContent = msg || "Looks good!";
  }
  function setError(el, span, msg) {
    el.style.outline = "2px solid #d00000";
    span.style.color = "#d00000";
    span.textContent = msg || "Please fix this.";
  }
  function clearStyles(el, span) {
    el.style.outline = "";
    span.textContent = "";
  }

  // --- Validators ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = (v) => emailRegex.test(v.trim());

  // Name: at least 3 chars, letters/spaces/dots allowed
  function isNameValid(v) {
    const t = v.trim();
    if (t.length < 3) return false;
    return /^[A-Za-z.\s]+$/.test(t);
  }

  function passwordIssues(v) {
    const issues = [];
    if (v.length < 8) issues.push("at least 8 characters");
    if (!/[A-Za-z]/.test(v)) issues.push("a letter");
    if (!/[0-9]/.test(v)) issues.push("a number");
    return issues;
  }

  function validateName(showEmptyMsg = true) {
    const val = nameInput.value;
    if (!val.trim()) {
      if (showEmptyMsg) setError(nameInput, nameFeedback, "Name is required.");
      else clearStyles(nameInput, nameFeedback);
      return false;
    }
    if (!isNameValid(val)) {
      setError(
        nameInput,
        nameFeedback,
        "Name must be ≥ 3 chars and only letters, spaces, or dots."
      );
      return false;
    }
    setOK(nameInput, nameFeedback, "Name looks good!");
    return true;
  }

  function validateEmail(showEmptyMsg = true) {
    const val = email.value;
    if (!val.trim()) {
      if (showEmptyMsg) setError(email, emailFeedback, "Email is required.");
      else clearStyles(email, emailFeedback);
      return false;
    }
    if (!isEmailValid(val)) {
      setError(email, emailFeedback, "Please enter a valid email address.");
      return false;
    }
    setOK(email, emailFeedback, "Email looks good!");
    return true;
  }

  function validatePassword(showEmptyMsg = true) {
    const val = password.value;
    if (!val.trim()) {
      if (showEmptyMsg) setError(password, passwordFeedback, "Password is required.");
      else clearStyles(password, passwordFeedback);
      return false;
    }
    const issues = passwordIssues(val);
    if (issues.length) {
      setError(
        password,
        passwordFeedback,
        `Password needs ${issues.join(", ")}.`
      );
      return false;
    }
    const strong =
      val.length >= 12 && /[A-Z]/.test(val) && /[^A-Za-z0-9]/.test(val);
    setOK(password, passwordFeedback, strong ? "Strong password!" : "Password looks good.");
    return true;
  }

  function updateSubmitState() {
    const ok =
      (validateName(false) & validateEmail(false) & validatePassword(false)) === 1;
    submitBtn.disabled = !ok;
    submitBtn.style.opacity = ok ? "1" : "0.6";
    submitBtn.style.cursor = ok ? "pointer" : "not-allowed";
  }

  // --- Real-time listeners ---
  nameInput.addEventListener("input", () => {
    validateName(true);
    updateSubmitState();
  });
  email.addEventListener("input", () => {
    validateEmail(true);
    updateSubmitState();
  });
  password.addEventListener("input", () => {
    validatePassword(true);
    updateSubmitState();
  });

  nameInput.addEventListener("blur", () => {
    validateName(true);
    updateSubmitState();
  });
  email.addEventListener("blur", () => {
    validateEmail(true);
    updateSubmitState();
  });
  password.addEventListener("blur", () => {
    validatePassword(true);
    updateSubmitState();
  });

  // Initialize button state on load
  updateSubmitState();

  // --- Submit handling ---
  innerForm.addEventListener("submit", (e) => {
    const nOK = validateName(true);
    const eOK = validateEmail(true);
    const pOK = validatePassword(true);

    if (!(nOK && eOK && pOK)) {
      e.preventDefault();
      // Focus first invalid
      if (!nOK) nameInput.focus();
      else if (!eOK) email.focus();
      else password.focus();
      alert("Please fix the highlighted fields before submitting.");
      return;
    }
  });
});
