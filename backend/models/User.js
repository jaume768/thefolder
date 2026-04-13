const mongoose = require('mongoose');

// Función de validación para limitar arrays a 3 elementos
function arrayLimit(val) {
  return !val || val.length <= 3;
}

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    fullName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Puede quedar vacío en registro con Google
    googleId: { type: String },
    role: { type: String, enum: ['Creativo', 'Profesional', 'Admin'] }, // DEPRECATED - sustituido por accountType
    isAdmin: { type: Boolean, default: false }, // DEPRECATED - sustituido por accountType: 'admin'

    // ── SISTEMA NUEVO DE TIPOS ─────────────────────────────────────────────
    accountType: { type: String, enum: ['creative', 'industry', 'guest', 'admin'], default: null },
    creativeLevel: { type: Number, enum: [1, 2, 3, 4, 5], default: null },
    creativeLevelName: { type: String, enum: ['newcomer', 'graduated', 'emerging', 'professional', 'curated'], default: null },
    industryType: { type: String, enum: ['brand', 'showroom', 'agency', 'media', 'production', 'other'], default: null },
    shortDescription: { type: String, default: null },
    links: { type: [String], default: [] },
    isScout: { type: Boolean, default: false },
    scoutCompany: { type: String, default: null },
    requestedCreativeLevel: { type: Number, default: null }, // nivel solicitado (4=professional), pendiente validación manual
    // ──────────────────────────────────────────────────────────────────────
    dateOfBirth: { type: Date },
    country: { type: String },
    city: { type: String },
    country2: { type: String },
    city2: { type: String },
    customCountry: { type: String, default: "" },
    referralSource: { type: String }, // ¿Cómo nos has conocido?
    termsAccepted: { type: Boolean },
    biography: { type: String },
    bio: { type: String, maxlength: 150 },
    professionalTitle: { type: String, default: "" },
    profileHeadlines: {
    type: [String],
    default: ["", "", ""],
    validate: [arrayLimit, "Máximo 3 especialidades permitidas"],
    },
    professionalTags: { type: [String], default: [], validate: [arrayLimit, 'Máximo 3 etiquetas permitidas'] },
    languages: {
    type: [
        {
        language: { type: String, trim: true, required: true },
        level: {
            type: String,
            enum: ["", "basic", "intermediate", "advanced", "native"],
            default: "",
        },
        },
    ],
    default: [],
    },
    featuredHeaderImage: { type: String, default: "" },

    // Portadas separadas (desktop / mobile)
    featuredHeaderImageDesktop: { type: String, default: "" },
    featuredHeaderImageMobile: { type: String, default: "" },

    // Imagen para el buscador de creativos
    creativeCoverDesktop: { type: String, default: "" },

    // Plantilla de portada (perfil) separada para desktop / mobile
    coverTemplateDesktop: { type: String, default: "fullscreen" },
    coverTemplateMobile: { type: String, default: "fullscreen" },

    // Estilo de galería
    galleryStyle: { type: String, enum: ["gap", "nogap"], default: "gap" },

    // Layout del perfil público (plantilla de página completa)
    profileLayout: { type: String, enum: ["default", "index-gallery", "studio-gallery"], default: "default" },


    // Campos específicos para Creativos
    // creativeType: 1 (Estudiantes), 2 (Graduados), 3 (Estilistas), 4 (Diseñador de marca propia), 5 (Otro)
    creativeType: { type: Number }, // DEPRECATED - sustituido por creativeLevel
    formationType: { type: String }, // DEPRECATED - onboarding viejo creativo
    institution: { type: String }, // DEPRECATED - onboarding viejo creativo
    creativeOther: { type: String }, // DEPRECATED - onboarding viejo creativo
    brandName: { type: String }, // DEPRECATED - onboarding viejo creativo

    // Campos específicos para Profesionales
    // professionalType: 1 (Pequeña marca), 2 (Empresa mediana-grande), 3 (Agencia), 4 (Instituciones), 5 (Otra)
    professionalType: { type: Number }, // DEPRECATED - sustituido por industryType
    companyName: { type: String },
    foundingYear: { type: Number }, // DEPRECATED - onboarding viejo profesional
    productServiceType: { type: String }, // DEPRECATED - onboarding viejo profesional
    sector: { type: String }, // DEPRECATED - onboarding viejo profesional
    employeeRange: { type: String }, // DEPRECATED - onboarding viejo profesional
    institutionName: { type: String }, // DEPRECATED - onboarding viejo profesional
    institutionType: { type: String }, // DEPRECATED - onboarding viejo profesional
    institutionOwnership: {
        type: String,
        enum: ['public', 'private', 'other', ''],
        default: 'public',
        required: false
    }, // DEPRECATED - onboarding viejo profesional
    agencyName: { type: String }, // DEPRECATED - onboarding viejo profesional
    agencyServices: { type: String }, // DEPRECATED - onboarding viejo profesional
    website: { type: String },
    showNameCompany: { type: Boolean },
    showFoundingYearCompany: { type: Boolean },

    // Información de perfil
    profile: {
        profilePicture: { type: String },
        portfolio: { type: String }, // URL del portfolio o web (opcional)
        socialLinks: {
            instagram: { type: String },
            linkedin: { type: String }
        }
    },

    // Tags pendientes de revisión
    pendingTags: {
    type: [
        {
        label: { type: String, trim: true, default: "" },
        type: { type: String, trim: true, default: "role" },      // "role" | "specialty"
        status: { type: String, trim: true, default: "pending" }, // "pending" | "approved" | "rejected"
        },
    ],
    default: [],
    },

    // URLs y nombres originales para CV y Portfolio
    cvUrl: { type: String },
    cvFileName: { type: String },
    portfolioUrl: { type: String },
    portfolioFileName: { type: String },
    education: [
        {
            id: { type: String, default: "" },
            institution: { type: String },
            formationName: { type: String },
            // Almacenamos mes y año como números separados
            formationStartMonth: { type: Number, min: 1, max: 12 },
            formationStartYear: { type: Number },
            formationEndMonth: { type: Number, min: 1, max: 12 },
            formationEndYear: { type: Number },
            currentlyEnrolled: { type: Boolean },
            // Nuevos campos
            institutionLogo: { type: String }, // URL del logo de la institución
            location: { type: String }, // Ciudad, País
            educationType: { type: String, default: "" }, // Grado, Máster, FP, etc.
            educationHours: { type: String, default: "" }, // Horas (Curso/Taller o Certificación)
            educationOtherType: { type: String, default: "" }, // Texto libre si educationType === "OTRO"
            isDraft: { type: Boolean, default: false } // Oculto en perfil público hasta que se publique
        }
    ],
    skills: { type: [String], default: [] },
    software: { type: [String], default: [] },
    jobSearchActive: { type: Boolean, default: false }, 

    availability: { type: [String], default: [] },

    contract: {
    practicas: { type: Boolean, default: false },
    convenioPracticas: { type: Boolean, default: false },
    tiempoCompleto: { type: Boolean, default: false },
    parcial: { type: Boolean, default: false },
    freelance: { type: Boolean, default: false },
    },

    locationType: {
    presencial: { type: Boolean, default: false },
    remoto: { type: Boolean, default: false },
    hibrido: { type: Boolean, default: false }
    },
    social: {
        emailContacto: { type: String, default: "" },
        representationName: { type: String, default: "" },
        representationWeb: { type: String, default: "" },
        sitioWeb: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        behance: { type: String, default: "" },
        tiktok: { type: String, default: "" },
        tumblr: { type: String, default: "" },
        youtube: { type: String, default: "" },
        pinterest: { type: String, default: "" },
        substack: { type: String, default: "" }
    },

    // Hitos profesionales para perfiles de empresa
    professionalMilestones: [
        {
            date: { type: String },
            name: { type: String },
            entity: { type: String },
            description: { type: String }
        }
    ],
    
    // Etiquetas para empresas
    companyTags: [{ type: String }],
    
    // Empresa ofrece prácticas
    offersPractices: { type: Boolean, default: false },
    
    professionalFormation: [
    {
        title: { type: String },
        institution: { type: String },
        description: { type: String },

        // Fechas como campos separados para mes y año (mismo formato que education)
        startMonth: { type: Number, min: 1, max: 12 },
        startYear: { type: Number },
        endMonth: { type: Number, min: 1, max: 12 },
        endYear: { type: Number },
        currentlyWorking: { type: Boolean, default: false },

        // Nuevos campos
        companyLogo: { type: String },          // URL del logo
        companyWebsite: { type: String, default: "" },
        location: { type: String },             // Ciudad, País
        isDraft: { type: Boolean, default: false } // Oculto en perfil público hasta que se publique
    }
    ],


    pressPublications: [
        {
            logoUrl: { type: String, default: "" },
            title: { type: String },
            publication: { type: String },
            role: { type: String, default: "" }, // autor, colaborador, entrevistado, mencionado
            url: { type: String, default: "" },
            pubMonth: { type: Number, min: 1, max: 12 },
            pubYear: { type: Number },
            description: { type: String, default: "" },
            isDraft: { type: Boolean, default: false },
        }
    ],

    awards: [
        {
            name: { type: String },
            type: { type: String, default: "" }, // Premio, Mención de honor, Beca, etc.
            otherType: { type: String, default: "" }, // si type === "Otro"
            issuer: { type: String },
            awardMonth: { type: Number, min: 1, max: 12 },
            awardYear: { type: Number },
            description: { type: String, default: "" },
            url: { type: String, default: "" },
            isDraft: { type: Boolean, default: false },
        }
    ],

    profileCompleted: { type: Boolean, default: false },
    favorites: [
        {
            postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
            savedImage: { type: String, required: true },
            savedAt: { type: Date, default: Date.now }
        }
    ],
    
    // ✅ NUEVO: clave random estable para ordenar sin duplicados
    randomKey: { type: Number, default: () => Math.random(), index: true },

    createdAt: { type: Date, default: Date.now },
    lastProfileEditAt: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isVerificatedProfesional: { type: Boolean, default: false },
    savedOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }],
    appliedOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('User', UserSchema);
