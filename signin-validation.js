// signin-validation.js
// Real-time validation for your existing Sign In page WITHOUT editing the HTML structure.

document.addEventListener("DOMContentLoaded", () => {
  // Grab inputs by their existing IDs
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  // Find the inner form (since your HTML has a nested form)
  // This targets the form that actually contains the inputs.
  const innerForm = email?.form || document.querySelector(".signin-container form form") || document.querySelector(".signin-container form");

  // Find the submit button inside that inner form
  const submitBtn = innerForm?.querySelector('button[type="submit"]') || document.querySelector('.signin-container .btn');

  // Ensure form exists
  if (!innerForm || !email || !password || !submitBtn) return;

  // Turn off native popup validation (we’ll show our own messages)
  innerForm.setAttribute("novalidate", "");

  // --- Helpers to create and manage feedback elements (no HTML edits needed) ---
  function makeFeedback(afterEl, id) {
    let span = document.createElement("span");
    span.id = id;
    span.setAttribute("aria-live", "polite");
    span.style.display = "block";
    span.style.fontSize = "0.9rem";
    span.style.marginTop = "4px";
    span.style.minHeight = "1em";
    // start empty + neutral
    span.textContent = "";
    afterEl.insertAdjacentElement("afterend", span);
    return span;
  }

  const emailFeedback = makeFeedback(email, "emailFeedback");
  const passwordFeedback = makeFeedback(password, "passwordFeedback");

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

  function passwordIssues(v) {
    const issues = [];
    if (v.length < 8) issues.push("at least 8 characters");
    if (!/[A-Za-z]/.test(v)) issues.push("a letter");
    if (!/[0-9]/.test(v)) issues.push("a number");
    return issues;
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
      setError(password, passwordFeedback, `Password needs ${issues.join(", ")}.`);
      return false;
    }
    // Optional “strong” hint
    const strong = val.length >= 12 && /[A-Z]/.test(val) && /[^A-Za-z0-9]/.test(val);
    setOK(password, passwordFeedback, strong ? "Strong password!" : "Password looks good.");
    return true;
  }

  function updateSubmitState() {
    const ok = validateEmail(false) & validatePassword(false); // single-pass booleans
    // Enable/disable visually (no CSS required)
    submitBtn.disabled = !ok;
    submitBtn.style.opacity = ok ? "1" : "0.6";
    submitBtn.style.cursor = ok ? "pointer" : "not-allowed";
  }

  // --- Real-time listeners ---
  email.addEventListener("input", () => {
    validateEmail(true);
    updateSubmitState();
  });

  password.addEventListener("input", () => {
    validatePassword(true);
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

  innerForm.addEventListener("submit", (e) => {
    const eOK = validateEmail(true);
    const pOK = validatePassword(true);

    if (!(eOK && pOK)) {
      e.preventDefault();
      if (!eOK) email.focus();
      else password.focus();
      alert("Please fix the highlighted fields before submitting.");
      return;
    }
  });
});
