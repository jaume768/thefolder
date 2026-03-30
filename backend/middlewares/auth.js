const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.ensureAuthenticated = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No autorizado, no hay token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Validar datos frescos contra la DB para evitar JWT con permisos obsoletos
        const freshUser = await User.findById(decoded.id).select('role professionalType isActive isAdmin email accountType');
        if (!freshUser) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }
        if (!freshUser.isActive) {
            return res.status(403).json({ message: 'Cuenta desactivada' });
        }

        req.user = {
            id: freshUser._id,
            email: freshUser.email,
            role: freshUser.role,
            professionalType: freshUser.professionalType,
            isAdmin: freshUser.isAdmin,
            accountType: freshUser.accountType,
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

exports.ensureAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'No autorizado, se requiere autenticación' });
    }
    try {
        const user = await User.findById(req.user.id).select('role isAdmin isActive accountType');
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Usuario no encontrado o inactivo' });
        }
        if (user.role !== 'Admin' && !user.isAdmin && user.accountType !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado, se requieren permisos de administrador' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Error del servidor' });
    }
};
