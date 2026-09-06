document.addEventListener("DOMContentLoaded", () => {
    initializeAuthForms();
});

const AUTH_API_BASE = "https://ethiscan-backend.onrender.com";
const AUTH_TIMEOUT_MS = 10000;

function showAuthMessage(message, type = "info") {
    const target = document.getElementById("authMessage");
    if (!target) return;

    target.textContent = message;
    target.className = `auth-message ${type}`;
}

function showAuthLink(message, linkText, href) {
    const target = document.getElementById("authMessage");
    if (!target) return;

    target.textContent = "";
    target.className = "auth-message success";

    const copy = document.createElement("span");
    copy.textContent = `${message} `;

    const link = document.createElement("a");
    link.href = href;
    link.textContent = linkText;
    link.className = "auth-message-link";

    target.append(copy, link);
}

async function fetchAuth(url, options = {}) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);

    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        window.clearTimeout(timeout);
    }
}

function initializeAuthForms() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    const resetPasswordForm = document.getElementById("resetPasswordForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async event => {
            event.preventDefault();
            showAuthMessage("Signing you in...", "info");

            try {
                const response = await fetchAuth(`${AUTH_API_BASE}/api/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: document.getElementById("loginEmail").value,
                        password: document.getElementById("loginPassword").value
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.token) {
                    showAuthMessage(data.message || "Authentication rejected.", "error");
                    return;
                }

                localStorage.setItem("ethiscan_token", data.token);
                localStorage.setItem("ethiscan_user", JSON.stringify(data.user));

                window.location.href = "index.html";
            } catch (error) {
                console.error("Login error:", error);
                showAuthMessage("Unable to connect to the server. Please try again shortly.", "error");
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async event => {
            event.preventDefault();
            showAuthMessage("Creating your account...", "info");

            try {
                const response = await fetchAuth(`${AUTH_API_BASE}/api/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: document.getElementById("regName").value,
                        email: document.getElementById("regEmail").value,
                        password: document.getElementById("regPassword").value
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    showAuthMessage(data.message || "Registration failed.", "error");
                    return;
                }

                showAuthMessage("Account created successfully. Redirecting to sign in...", "success");
                window.setTimeout(() => {
                    window.location.href = "login.html";
                }, 900);
            } catch (error) {
                console.error("Registration error:", error);
                showAuthMessage("Unable to connect to the server. Please try again shortly.", "error");
            }
        });
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", async event => {
            event.preventDefault();
            showAuthMessage("Preparing reset link...", "info");

            try {
                const response = await fetchAuth(`${AUTH_API_BASE}/api/auth/forgot-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: document.getElementById("forgotEmail").value
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    showAuthMessage(data.message || "Could not prepare reset link.", "error");
                    return;
                }

                if (data.resetLink) {
                    showAuthLink(
                        "Reset link prepared.",
                        "Click here to reset your password",
                        data.resetLink
                    );
                    return;
                }

                showAuthMessage("No visible reset link was created. Register this email first, then request the reset link again.", "error");
            } catch (error) {
                console.error("Forgot password error:", error);
                showAuthMessage("Unable to connect to the server. Please try again shortly.", "error");
            }
        });
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", async event => {
            event.preventDefault();

            const token = new URLSearchParams(window.location.search).get("token");
            const password = document.getElementById("resetPassword").value;
            const confirmPassword = document.getElementById("confirmResetPassword").value;

            if (!token) {
                showAuthMessage("Reset token is missing. Please request a new reset link.", "error");
                return;
            }

            if (password !== confirmPassword) {
                showAuthMessage("Passwords do not match.", "error");
                return;
            }

            showAuthMessage("Updating password...", "info");

            try {
                const response = await fetchAuth(`${AUTH_API_BASE}/api/auth/reset-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, password })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    showAuthMessage(data.message || "Password reset failed.", "error");
                    return;
                }

                showAuthMessage(data.message || "Password updated. Please sign in.", "success");
            } catch (error) {
                console.error("Reset password error:", error);
                showAuthMessage("Unable to connect to the server. Please try again shortly.", "error");
            }
        });
    }
}
