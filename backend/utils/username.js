// backend/utils/username.js

// ✅ Usernames reservados (para que /:username no choque con rutas)
const RESERVED_USERNAMES = new Set([

  // 🔹 Sistema / Core
  "admin", "administrator", "administrador",
  "root", "system", "support", "soporte",
  "help", "ayuda", "info", "contact", "contacto",
  "about", "aboutus", "nosotros", "quienes-somos",
  "legal", "privacy", "privacidad", "cookies",
  "terms", "terminos", "terminos-y-condiciones",
  "api", "backend", "frontend",
  "dashboard", "panel", "controlpanel",
  "auth", "login", "logout", "register",
  "signup", "signin", "registro",
  "forgot-password", "reset-password",
  "verify", "verification",
  "token", "token-handler",
  "complete-registration",
  "config", "settings", "configuracion",
  "profile", "profiles",
  "myprofile", "mi-perfil",
  "community", "comunidad",
  "explorer", "explorador",
  "search", "buscar",
  "home", "inicio",

  // 🔹 Plataforma
  "thefolder", "the-folder", 
  "thefolderofficial", "thefolder-official",
  "thefolderoficial", "thefolder-oficial", 
  "app", "web", "site",
  "official", "oficial",
  "team", "equipo",
  "staff", "crew",

  // 🔹 Moda general
  "fashion", "moda",
  "fashionweek", "fashion-week",
  "runway", "pasarela",
  "couture", "haute-couture",
  "pretaporter",
  "readytowear",
  "atelier", "studio",
  "brand", "marca",
  "designer", "disenador", "disenador",
  "designers", "disenadores",
  "model", "modelo",
  "models", "modelos",
  "stylist", "estilista",
  "stylists", "estilistas",
  "creative", "creativo",
  "creatives", "creativos",
  "artdirector", "director-arte",
  "art-direction",
  "trend", "trends", "tendencia", "tendencias",

  // 🔹 Fotografía
  "photo", "photos",
  "photography", "fotografia",
  "fotografo", "fotografos",
  "photographer", "photographers",
  "shoot", "photoshoot",
  "editorial", "editoriales",
  "retouch", "retoucher", "retocador",
  "lighting", "iluminacion",

  // 🔹 Diseño gráfico / visual
  "graphic", "graphics",
  "graphicdesign", "disenografico", "diseno-grafico",
  "visual", "visualdesign",
  "illustration", "ilustracion",
  "illustrator", "ilustrador",
  "art", "arte",
  "portfolio", "portafolio",
  "branding", "identity",
  "logo", "logos",
  "typography", "tipografia",

  // 🔹 Calzado
  "shoes", "shoe",
  "zapatos", "zapato",
  "footwear", "calzado",
  "sneakers", "zapatillas",
  "boots", "botas",
  "heels", "tacones",
  "sandals", "sandalias",
  "luxuryshoes",
  "shoedesign", "disenozapatos",

  // 🔹 Ropa
  "clothing", "ropa",
  "wear", "apparel",
  "garments", "prendas",
  "collection", "coleccion",
  "collections", "colecciones",
  "capsule", "capsulecollection",
  "streetwear",
  "menswear", "womenswear",
  "unisex",
  "kidswear",

  // 🔹 Tienda / Ecommerce
  "shop", "store", "tienda",
  "boutique",
  "marketplace",
  "cart", "carrito",
  "checkout",
  "payment", "pago",
  "orders", "pedidos",
  "product", "producto",
  "products", "productos",
  "catalog", "catalogo",
  "sale", "sales", "rebajas",
  "discount", "descuento",

  // 🔹 Ofertas / trabajo
  "offers", "offer",
  "ofertas", "oferta",
  "jobs", "job",
  "trabajo", "trabajos",
  "vacantes",
  "employment",
  "careers", "career",

  // 🔹 Editorial / contenido
  "blog", "magazine",
  "revista", "revistas",
  "article", "articles",
  "post", "posts",
  "news", "noticias",
  "press", "prensa",

  // 🔹 Educación
  "education", "educacion",
  "school", "escuela",
  "academy", "academia",
  "course", "courses",
  "curso", "cursos",
  "university", "universidad",
  "instituto",

  // 🔹 Empresas
  "company", "empresa",
  "agency", "agencia",
  "studio", "estudio",
  "collective", "colectivo",
  "organization", "organizacion",

  // 🔹 Navegación interna
  "createpost", "createoffer",
  "createeducationaloffer",
  "editprofile",
  "misofertas",
  "guardados",
  "saved",
  "folder", "folders"
]);

const USERNAME_REGEX = /^[a-z0-9-]{1,20}$/;

function normalizeUsername(input) {
  let v = String(input || "").trim().toLowerCase();

  v = v.replace(/^@+/, "");
  v = v.replace(/[^a-z0-9-]/g, "");
  while (v.includes("--")) v = v.replace(/--/g, "-");
  v = v.replace(/^-+/, "");
  v = v.slice(0, 20);
  v = v.replace(/-+$/, "");

  return v;
}

function isReservedUsername(input) {
  const u = normalizeUsername(input);
  return RESERVED_USERNAMES.has(u);
}

function validateUsername(rawUsername) {
  const username = normalizeUsername(rawUsername);

  if (!username) return { ok: false, error: "El nombre de usuario es obligatorio." };

  if (username.length > 20) {
    return { ok: false, error: "El nombre de usuario no puede superar los 20 caracteres." };
  }

  if (!USERNAME_REGEX.test(username)) {
    return { ok: false, error: "Solo se permiten letras minúsculas, números y guiones." };
  }

  if (username.startsWith("-") || username.endsWith("-")) {
    return { ok: false, error: "No puede empezar ni acabar con guión." };
  }

  if (username.includes("--")) {
    return { ok: false, error: "No puede contener doble guión (--)." };
  }

  if (isReservedUsername(username)) {
    return { ok: false, error: "Ese nombre de usuario no está disponible." };
  }

  return { ok: true, username };
}

/**
 * Genera un username provisional limpio a partir del email.
 * Intenta: base → base2 → base3 … base99 → base-xxxx (fallback random)
 * Nunca produce sufijos de palabras aleatorias tipo "-sudo".
 */
async function generateProvisionalUsername(email, User) {
  const localPart = (email || '').split('@')[0].toLowerCase();
  let base = localPart
    .replace(/[^a-z0-9]/g, '')   // quita puntos, +, etc.
    .slice(0, 16);
  if (!base) base = 'user';

  // Intento directo
  if (validateUsername(base).ok && !(await User.findOne({ username: base }))) {
    return base;
  }

  // Incrementos numéricos: base2, base3 … base99
  const trimmed = base.slice(0, 18);
  for (let i = 2; i <= 99; i++) {
    const candidate = `${trimmed}${i}`;
    if (validateUsername(candidate).ok && !(await User.findOne({ username: candidate }))) {
      return candidate;
    }
  }

  // Fallback: sufijo numérico largo (extremadamente raro llegar aquí)
  let username;
  do {
    const n = Math.floor(Math.random() * 9000) + 1000;
    username = `${base.slice(0, 15)}${n}`;
  } while (!validateUsername(username).ok || await User.findOne({ username }));
  return username;
}

module.exports = {
  RESERVED_USERNAMES,
  normalizeUsername,
  isReservedUsername,
  validateUsername,
  generateProvisionalUsername,
};