const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { processImageIfNeeded } = require('../utils/imageProcessor');
const jwt = require('jsonwebtoken');

const { validateUsername, generateProvisionalUsername } = require('../utils/username');
const { validatePassword } = require('../utils/passwordValidation');

const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

const pendingRegistrations = {};
const pendingResetRequests = {};

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendResetEmail = (email, resetCode) => {
    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
    const sender = { email: process.env.SENDER_EMAIL || "noreply@thefolder.es", name: process.env.SENDER_NAME || "THEFOLDER" };
    const receivers = [{ email }];
    tranEmailApi.sendTransacEmail({
        sender,
        to: receivers,
        subject: "Restablece tu contraseña",
        htmlContent: `<p>Tu código para restablecer la contraseña es: <strong>${resetCode}</strong></p>`,
    })
        .then((data) => {
        })
        .catch((error) => {
        });
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "El email es requerido." });
    }
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: "No se encontró un usuario con ese email." });
    }
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    pendingResetRequests[email] = {
        code: resetCode,
        expires: Date.now() + 3600000
    };

    sendResetEmail(email, resetCode);
    return res.status(200).json({ message: "Email enviado con instrucciones para restablecer la contraseña." });
};

exports.verifyForgotCode = async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(400).json({ error: "Email y código son requeridos." });
    }
    const pending = pendingResetRequests[email];
    if (!pending) {
        return res.status(400).json({ error: "No hay solicitud pendiente para este email." });
    }
    if (pending.code !== code) {
        return res.status(400).json({ error: "Código incorrecto." });
    }
    if (pending.expires < Date.now()) {
        delete pendingResetRequests[email];
        return res.status(400).json({ error: "El código ha expirado." });
    }
    return res.status(200).json({ message: "Código verificado. Puedes restablecer tu contraseña." });
};

exports.resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
        return res.status(400).json({ error: "Email, código y nueva contraseña son requeridos." });
    }
    const pending = pendingResetRequests[email];
    if (!pending) {
        return res.status(400).json({ error: "No hay solicitud pendiente para este email." });
    }
    if (pending.code !== code) {
        return res.status(400).json({ error: "Código incorrecto." });
    }
    if (pending.expires < Date.now()) {
        delete pendingResetRequests[email];
        return res.status(400).json({ error: "El código ha expirado." });
    }
    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.ok) {
        return res.status(400).json({ error: pwCheck.error });
    }
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ email }, { password: hashedPassword });
        delete pendingResetRequests[email];
        return res.status(200).json({ message: "Contraseña actualizada exitosamente." });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const sendVerificationEmail = (email, verificationCode) => {
    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
    const sender = { email: process.env.SENDER_EMAIL || "noreply@thefolder.es", name: process.env.SENDER_NAME || "THEFOLDER" };
    const receivers = [{ email }];
    tranEmailApi.sendTransacEmail({
        sender,
        to: receivers,
        subject: "Tu código de verificación",
        htmlContent: `<p>Tu código de verificación es: <strong>${verificationCode}</strong></p>`,
    })
        .then((data) => {
        })
        .catch((error) => {
        });
};

exports.sendVerificationCodePreRegistration = async (req, res) => {
  const { email, password, confirmPassword, acceptedTerms } = req.body;

  if (!email || !password || !confirmPassword || !acceptedTerms) {
    return res.status(400).json({ error: "Completa todos los campos." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Las contraseñas no coinciden." });
  }

  const pwCheck = validatePassword(password);
  if (!pwCheck.ok) {
    return res.status(400).json({ error: pwCheck.error });
  }

  // Ya no comprobamos username aquí
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "El usuario ya existe." });
  }

  const verificationCode = generateVerificationCode();
  const hashedPassword = await bcrypt.hash(password, 10);

  pendingRegistrations[email] = {
    data: { email, password: hashedPassword },
    code: verificationCode,
    expires: Date.now() + 3600000
  };

  sendVerificationEmail(email, verificationCode);

  return res.status(200).json({ message: "Código de verificación enviado." });
};


exports.verifyCodePreRegistration = async (req, res) => {
  const { email, code } = req.body;

  const pending = pendingRegistrations[email];
  if (!pending) {
    return res.status(400).json({ error: "No hay registro pendiente para este email." });
  }
  if (pending.code !== code) {
    return res.status(400).json({ error: "Código incorrecto." });
  }
  if (pending.expires < Date.now()) {
    delete pendingRegistrations[email];
    return res.status(400).json({ error: "El código ha expirado." });
  }

  const { email: regEmail, password } = pending.data;

    // username provisional limpio (sin sufijos aleatorios de palabras)
    const username = await generateProvisionalUsername(regEmail, User);

  // También aseguramos que no exista el email
  const existingEmail = await User.findOne({ email: regEmail });
  if (existingEmail) {
    delete pendingRegistrations[email];
    return res.status(400).json({ error: "El usuario ya existe." });
  }

  const newUser = new User({
    username,
    email: regEmail,
    password: password,
    isVerified: true,
    profileCompleted: false
  });

  await newUser.save();
  delete pendingRegistrations[email];

  const token = jwt.sign(
    { id: newUser._id, email: newUser.email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  return res.status(200).json({ message: "Usuario registrado exitosamente.", token, user: newUser });
};


exports.resendCodePreRegistration = async (req, res) => {
    const { email } = req.body;
    const pending = pendingRegistrations[email];
    if (!pending) {
        return res.status(400).json({ error: "No hay registro pendiente para este email." });
    }
    const newCode = generateVerificationCode();
    pendingRegistrations[email].code = newCode;
    pendingRegistrations[email].expires = Date.now() + 3600000;
    sendVerificationEmail(email, newCode);
    return res.status(200).json({ message: "Nuevo código enviado. Revise bandeja de correo." });
};

exports.register = async (req, res) => {
    const {
        username,
        fullName,
        email,
        password,
        role,              // 'Creativo' o 'Profesional'
        dateOfBirth,
        country,
        city,
        referralSource,
        termsAccepted,
        // Campos específicos de Creativos
        creativeType,
        formationType,
        institution,
        creativeOther,
        brandName,
        // Campos específicos de Profesionales
        professionalType,
        companyName,
        foundingYear,
        productServiceType,
        sector,
        employeeRange,
        institutionName,
        institutionType,
        agencyName,
        agencyServices,
        website,
        // Datos opcionales adicionales
        portfolio,
        instagram,
        linkedin,
        googleId  // Opcional: si viene, es registro desde Google
    } = req.body;

    let profilePictureUrl = '';
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'La foto de perfil es obligatoria.' });
        }
        const _bufAuth = await processImageIfNeeded(req.file.buffer);
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'profile_pictures' },
                (error, result) => (result ? resolve(result) : reject(error))
            );
            streamifier.createReadStream(_bufAuth).pipe(stream);
        });
        profilePictureUrl = result.secure_url;

        // ✅ Bloquear usernames reservados (por las URLs bonitas /:username)
        const checkUsername = validateUsername(username);
        if (!checkUsername.ok) {
        return res.status(400).json({ message: checkUsername.error });
        }
        const normalizedUsername = checkUsername.username;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ $or: [{ email }, { username: normalizedUsername }] });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe.' });
        }

        let hashedPassword = '';
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Si viene googleId, es un registro vía Google y se activa automáticamente.
        const isGoogleRegistration = googleId ? true : false;

        const newUser = new User({
            username: normalizedUsername,
            fullName,
            email,
            password: hashedPassword,
            googleId: googleId || undefined,
            role,
            dateOfBirth,
            country,
            city,
            referralSource,
            termsAccepted,
            // Datos específicos para Creativos
            creativeType,
            formationType,
            institution,
            creativeOther,
            brandName,
            // Datos específicos para Profesionales
            professionalType,
            companyName,
            foundingYear,
            productServiceType,
            sector,
            employeeRange,
            institutionName,
            institutionType,
            agencyName,
            agencyServices,
            website,
            profile: {
                profilePicture: profilePictureUrl,
                portfolio,
                socialLinks: {
                    instagram,
                    linkedin
                }
            },
            // Si es registro vía Google se marca como verificado
            isVerified: isGoogleRegistration ? true : false,
            isActive: true
        });

        await newUser.save();

        if (!newUser.isVerified) {
            // Generar un token de verificación (válido, por ejemplo, por 1 día)
            const verificationToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
            sendVerificationEmail(newUser.email, verificationToken);
            res.status(201).json({ message: 'Usuario registrado. Por favor verifica tu email.', user: newUser });
        } else {
            res.status(201).json({ message: 'Usuario registrado correctamente', user: newUser });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            return res.status(400).json({ message: info.message });
        }
        // Verificar que la cuenta esté activa y verificada
        if (!user.isActive) return res.status(403).json({ message: 'Cuenta inactiva.' });
        if (!user.isVerified) return res.status(403).json({ message: 'Cuenta no verificada.' });

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                professionalType: user.professionalType,
                accountType: user.accountType ?? null,
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        return res.status(200).json({ message: 'Login exitoso', token, user });
    })(req, res, next);
};

exports.googleCallback = (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email, professionalType: req.user.professionalType, accountType: req.user.accountType ?? null }, process.env.JWT_SECRET, { expiresIn: '30d' });

    if (req.user.profileCompleted) {
        return res.redirect(`${process.env.FRONTEND_URL}/token-handler?token=${token}`);
    } else {
        return res.redirect(`${process.env.FRONTEND_URL}/complete-registration?token=${token}`);
    }
};

exports.logout = (req, res) => {
    req.logout();
    res.status(200).json({ message: 'Sesión cerrada' });
};

// Autenticación para administradores
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Verificar que se proporcionan email y password
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Por favor, proporcione email y contraseña' 
            });
        }
        
        // Buscar el usuario por email
        const user = await User.findOne({ email });
        
        // Verificar que el usuario existe
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Credenciales incorrectas' 
            });
        }
        
        // Verificar que el usuario es un administrador
        if (user.role !== 'Admin' && !user.isAdmin) {
            return res.status(403).json({ 
                success: false,
                message: 'No tienes permisos de administrador' 
            });
        }
        
        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Credenciales incorrectas' 
            });
        }
        
        // Generar token JWT
        const payload = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin,
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        // Retornar token y datos básicos del usuario
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                isAdmin: user.isAdmin,
                profile: user.profile,
            }
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error en el servidor' 
        });
    }
};

// Verificar si el token es válido y pertenece a un administrador
exports.verifyAdminToken = async (req, res) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ 
                success: false,
                message: 'No autorizado, falta el token' 
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verificar el token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar que el usuario existe en la base de datos
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Usuario no encontrado' 
            });
        }
        
        // Verificar que el usuario es un administrador
        if (user.role !== 'Admin' && !user.isAdmin) {
            return res.status(403).json({ 
                success: false,
                message: 'No tienes permisos de administrador' 
            });
        }
        
        // Devolver información del usuario
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                isAdmin: user.isAdmin,
                profile: user.profile,
            },
            isAdmin: true
        });
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido o expirado' 
            });
        }
        res.status(500).json({ 
            success: false,
            message: 'Error en el servidor' 
        });
    }
};

// Cambiar email del usuario autenticado
exports.changeEmail = async (req, res) => {
  const { newEmail, password } = req.body;

  if (!newEmail || !newEmail.includes("@")) {
    return res.status(400).json({ error: "El email no es válido." });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    // Si el usuario tiene contraseña (no es solo Google), verificarla
    if (user.password && user.password.trim() !== "") {
      if (!password) {
        return res.status(400).json({ error: "Debes confirmar tu contraseña actual." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "La contraseña actual es incorrecta." });
      }
    }

    // Verificar que el email no está en uso por otro usuario
    const existing = await User.findOne({ email: newEmail.toLowerCase().trim() });
    if (existing && existing._id.toString() !== req.user.id) {
      return res.status(400).json({ error: "Este email ya está en uso por otra cuenta." });
    }

    user.email = newEmail.toLowerCase().trim();
    await user.save();

    return res.status(200).json({ message: "Email actualizado correctamente.", email: user.email });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ── NUEVO: completar registro desde el wizard unificado ───────────────────
const CREATIVE_LEVEL_NAMES = { 1: 'newcomer', 2: 'graduated', 3: 'emerging', 4: 'professional' };

exports.completeRegistration = async (req, res) => {
    const { accountType, username, fullName, creativeLevel, city, country, professionalTags, industryType, companyName, shortDescription, links } = req.body;

    const validAccountTypes = ['creative', 'industry', 'guest'];
    if (!accountType || !validAccountTypes.includes(accountType)) {
        return res.status(400).json({ error: 'accountType inválido. Valores permitidos: creative, industry, guest.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const update = { accountType, profileCompleted: true };

        if (accountType === 'creative') {
            if (!username || !creativeLevel || !city || !country) {
                return res.status(400).json({ error: 'Para cuenta creativa se requiere: username, creativeLevel, city, country.' });
            }
            const level = parseInt(creativeLevel, 10);
            if (![1, 2, 3, 4].includes(level)) {
                return res.status(400).json({ error: 'creativeLevel debe ser 1, 2, 3 o 4 en el registro.' });
            }
            const usernameCheck = validateUsername(username);
            if (!usernameCheck.ok) {
                return res.status(400).json({ error: usernameCheck.error });
            }
            const normalizedUsername = usernameCheck.username;
            const existing = await User.findOne({
                username: { $regex: new RegExp(`^${normalizedUsername}$`, 'i') },
                _id: { $ne: user._id }
            });
            if (existing) {
                return res.status(400).json({ error: 'Ese nombre de usuario ya está en uso.' });
            }
            const savedLevel = level === 4 ? 3 : level;
            update.username = normalizedUsername;
            update.role = 'Creativo';
            update.creativeLevel = savedLevel;
            if (Array.isArray(professionalTags) && professionalTags.length > 0) {
                update.professionalTags = professionalTags.slice(0, 3);
            }
            update.creativeLevelName = CREATIVE_LEVEL_NAMES[savedLevel];
            if (level === 4) update.requestedCreativeLevel = 4;
            if (fullName) update.fullName = fullName.trim();
            update.city = city.trim();
            update.country = country.trim();
        }

        if (accountType === 'industry') {
            if (!username || !industryType || !companyName || !city || !country) {
                return res.status(400).json({ error: 'Para cuenta de industria se requiere: username, industryType, companyName, city, country.' });
            }
            const validIndustryTypes = ['brand', 'showroom', 'agency', 'media', 'production', 'other'];
            if (!validIndustryTypes.includes(industryType)) {
                return res.status(400).json({ error: 'industryType inválido.' });
            }
            const usernameCheck = validateUsername(username);
            if (!usernameCheck.ok) {
                return res.status(400).json({ error: usernameCheck.error });
            }
            const normalizedUsername = usernameCheck.username;
            const existing = await User.findOne({
                username: { $regex: new RegExp(`^${normalizedUsername}$`, 'i') },
                _id: { $ne: user._id }
            });
            if (existing) {
                return res.status(400).json({ error: 'Ese nombre de usuario ya está en uso.' });
            }
            update.username = normalizedUsername;
            update.role = 'Profesional';
            update.industryType = industryType;
            update.companyName = companyName.trim();
            update.city = city.trim();
            update.country = country.trim();
            if (shortDescription) update.shortDescription = shortDescription.trim();
            if (Array.isArray(links)) update.links = links.filter(Boolean);
        }

        // guest: no requiere campos extra, solo accountType + profileCompleted: true

        await User.findByIdAndUpdate(user._id, { $set: update });
        return res.status(200).json({ message: 'Perfil completado correctamente.' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
