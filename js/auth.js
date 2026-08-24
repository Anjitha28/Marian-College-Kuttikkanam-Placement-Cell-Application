// auth.js
// Handles login form submission

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('loginForm');
    const loginAlert = document.getElementById('loginAlert');
    const submitBtn = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

    // Show loading state while Google Sheets data loads
    if (submitBtn) {
        submitBtn.textContent = 'Connecting...';
        submitBtn.disabled = true;
    }

    // Wait for DB to be ready before allowing login
    await db.ready;

    if (submitBtn) {
        submitBtn.textContent = 'Login';
        submitBtn.disabled = false;
    }
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            let role = document.getElementById('role').value;

            if (!username || !password) {
                showAlert('Please fill in all fields.', 'danger');
                return;
            }

            const response = db.validateLogin(username, password, role);

            if (response.success) {
                // Automatically route to coordinator portal if student is coordinator
                if (role === 'student' && (response.user.isCoordinator === true || response.user.isCoordinator === 'true')) {
                    role = 'studentCoordinator';
                }
                // Automatically route to teacher coordinator portal if teacher is coordinator
                if (role === 'teacher' && (response.user.isCoordinator === true || response.user.isCoordinator === 'true')) {
                    role = 'teacherCoordinator';
                }

                sessionStorage.setItem('currentUser', JSON.stringify(response.user));
                sessionStorage.setItem('userRole', role);
                sessionStorage.setItem('userName', response.user.name || response.user.regNo || username);

                showAlert('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    if (role === 'admin') {
                        window.location.href = 'admin.html';
                    } else if (role === 'teacherCoordinator') {
                        window.location.href = 'admin.html';
                    } else if (role === 'studentCoordinator') {
                        window.location.href = 'coordinator.html';
                    } else if (role === 'student') {
                        window.location.href = 'student.html';
                    } else if (role === 'teacher') {
                        window.location.href = 'teacher.html';
                    }
                }, 1000);
            } else {
                showAlert(response.message, 'danger');
            }
        });
    }

    // Role Selection Tabs
    const tabs = document.querySelectorAll('.login-tab');
    const roleInput = document.getElementById('role');
    const usernameLabel = document.querySelector('label[for="username"]');
    const usernameInput = document.getElementById('username');

    function updateUsernameField(role) {
        if (!usernameInput || !usernameLabel) return;
        if (role === 'student') {
            usernameLabel.textContent = 'Register Number';
            usernameInput.placeholder = 'Enter Register Number';
        } else if (role === 'teacher') {
            usernameLabel.textContent = 'Phone Number';
            usernameInput.placeholder = 'Enter Phone Number';
        } else {
            usernameLabel.textContent = 'Username';
            usernameInput.placeholder = 'Enter Admin Username';
        }
    }

    if (tabs) {
        updateUsernameField(roleInput.value);
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                roleInput.value = tab.dataset.role;
                updateUsernameField(tab.dataset.role);
            });
        });
    }

    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    if (togglePasswordBtn && passwordInput && eyeIcon) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            // Toggle eye icon (open/closed)
            if (type === 'text') {
                eyeIcon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c-1.73 4.39-6 7.5-11 7.5s-9.27-3.11-11-7.5c1.73-4.39 6-7.5 11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>'; // Keep simple open eye, or you can use a crossed eye SVG
                eyeIcon.innerHTML = '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>';
                togglePasswordBtn.title = 'Hide Password';
            } else {
                eyeIcon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
                togglePasswordBtn.title = 'Show Password';
            }
        });
    }

    function showAlert(message, type) {
        loginAlert.textContent = message;
        loginAlert.className = `alert alert-${type}`;
        loginAlert.classList.remove('hidden');
    }
});

// Utility to check session on protected pages
function checkAuth(allowedRoles) {
    const userRole = sessionStorage.getItem('userRole');
    if (!userRole) {
        window.location.href = 'index.html';
        return;
    }
    if (Array.isArray(allowedRoles)) {
        if (!allowedRoles.includes(userRole)) {
            window.location.href = 'index.html';
        }
    } else {
        if (userRole !== allowedRoles) {
            window.location.href = 'index.html';
        }
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    window.location.href = 'index.html';
}
