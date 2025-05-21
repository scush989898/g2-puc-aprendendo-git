// profile.js
import { standardizeDate } from '../utils/date.js'

function initProfile() {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    loadUserData();
    setupProfileForm();
}

function loadUserData() {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    document.getElementById('profileName').value = currentUser.name || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';

    const preferences = Storage.getUserPreferences(currentUser.id);
    if (preferences.emailNotifications) {
        document.getElementById('emailNotifications').checked = true;
    }
}

function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');

    if (profileForm) {
        profileForm.addEventListener('submit', function (e) {
            e.preventDefault();
            saveUserProfile();
        });
    }
}

/**
 * RF-16: Salva o perfil do usuário
 * RF-19: Salvar preferências para envio de email
 */
function saveUserProfile() {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    const name = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    const emailNotifications = document.getElementById('emailNotifications').checked;

    if (!name) {
        alert('Por favor, informe seu nome.');
        return;
    }

    if (!email) {
        alert('Por favor, informe seu email.');
        return;
    }

    const users = Storage.getUsers();
    const userIndex = users.findIndex(user => user.id === currentUser.id);

    if (userIndex >= 0) {
        users[userIndex].name = name;
        users[userIndex].email = email;
        users[userIndex].phone = phone;
        users[userIndex].updatedAt = standardizeDate();

        Storage.saveUsers(users);

        const userWithoutPassword = { ...users[userIndex] };
        delete userWithoutPassword.password;

        Storage.setCurrentUser(userWithoutPassword);

        const preferences = {
            emailNotifications
        };

        Storage.saveUserPreferences(currentUser.id, preferences);
        alert('Perfil atualizado com sucesso!');
    }
}

document.addEventListener('DOMContentLoaded', initProfile);