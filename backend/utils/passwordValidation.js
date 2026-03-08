/**
 * Valida que una contraseña cumpla los requisitos mínimos de seguridad.
 * - Mínimo 6 caracteres
 * - Al menos una letra
 * - Al menos un número
 * @param {string} password
 * @returns {{ ok: boolean, error?: string }}
 */
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { ok: false, error: 'La contraseña es requerida.' };
    }
    if (password.length < 6) {
        return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }
    if (!/[a-zA-Z]/.test(password)) {
        return { ok: false, error: 'La contraseña debe contener al menos una letra.' };
    }
    if (!/[0-9]/.test(password)) {
        return { ok: false, error: 'La contraseña debe contener al menos un número.' };
    }
    return { ok: true };
}

module.exports = { validatePassword };
