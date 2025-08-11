class AuthManager {
    constructor() {
        this.page = this.getPageType();
        this.init();
    }

    getPageType() {
        const file = window.location.pathname.split('/').pop();
        if (file === "login.html") return "login";
        if (file === "register.html") return "register";
        return null;
    }

    init() {
        if (this.page === "login") {
            this.initLogin();
        } else if (this.page === "register") {
            this.initRegister();
        }
    }

    initLogin() {
        const form = document.getElementById('loginForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!email || !password) {
                this.showMessage("Please fill in all fields", "error");
                return;
            }

            let users = JSON.parse(localStorage.getItem("users") || "[]");
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem("authToken", "fake-jwt-token");
                localStorage.setItem("userName", user.name);
                localStorage.setItem("userEmail", user.email);

                this.showMessage("Login successful! Redirecting...", "success");
                setTimeout(() => window.location.href = "dashboard.html", 1500);
            } else {
                this.showMessage("Invalid email or password", "error");
            }
        });
    }

    initRegister() {
        const form = document.getElementById('registerForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();

            if (!name || !email || !password || !confirmPassword) {
                this.showMessage("Please fill in all fields", "error");
                return;
            }
            if (password !== confirmPassword) {
                this.showMessage("Passwords do not match", "error");
                return;
            }
            if (password.length < 6) {
                this.showMessage("Password must be at least 6 characters", "error");
                return;
            }

            let users = JSON.parse(localStorage.getItem("users") || "[]");
            if (users.find(u => u.email === email)) {
                this.showMessage("User already exists", "error");
                return;
            }

            users.push({ name, email, password });
            localStorage.setItem("users", JSON.stringify(users));

            this.showMessage("Registration successful! Redirecting to login...", "success");
            setTimeout(() => window.location.href = "login.html", 1500);
        });
    }

    showMessage(msg, type) {
        const messageEl = document.getElementById('message');
        if (!messageEl) return;

        messageEl.textContent = msg;
        messageEl.className = `message ${type} show`;

        setTimeout(() => {
            messageEl.classList.remove("show");
        }, 4000);
    }

    static logout() {
        localStorage.clear();
        window.location.href = "login.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new AuthManager();
});
