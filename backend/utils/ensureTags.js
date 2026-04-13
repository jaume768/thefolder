const Tag = require("../models/Tag");

const ROLE_TAGS = [
  // =====================
  // 1. Diseño & Desarrollo
  // =====================
  {
    id: "diseno-moda",
    label: "Diseño moda",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 1,
  },
  {
    id: "alta-costura",
    label: "Alta costura",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 2,
  },
  {
    id: "diseno-sostenible",
    label: "Sostenible",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 3,
  },
  {
    id: "diseno-textil",
    label: "Textil y estampados",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 4,
  },
  {
    id: "diseno-knitwear",
    label: "Knitwear",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 5,
  },
  {
    id: "diseno-sportswear",
    label: "Sportswear",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 6,
  },
  {
    id: "diseno-lenceria",
    label: "Lencería",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 7,
  },
  {
    id: "diseno-infantil",
    label: "Diseño infantil",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 8,
  },
  {
    id: "diseno-masculino",
    label: "Menswear",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 9,
  },
  {
    id: "diseno-femenino",
    label: "Womenswear",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 10,
  },
  {
    id: "patronaje",
    label: "Patronaje",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 11,
  },
  {
    id: "desarrollo-producto",
    label: "Desarrollo producto",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 12,
  },
  {
    id: "tecnico-confeccion",
    label: "Técnico confección",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 13,
  },
  {
    id: "sastreria",
    label: "Sastrería",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 14,
  },
  {
    id: "diseno-produccion",
    label: "Diseño de producción",
    type: "role",
    status: "active",
    group: "Diseño",
    order: 15,
  },

  // ============================
  // 2. Dirección Creativa
  // ============================
  {
    id: "direccion-creativa",
    label: "Dirección Creativa",
    type: "role",
    status: "active",
    group: "Dirección Creativa",
    order: 1,
  },
  {
    id: "direccion-arte",
    label: "Dirección arte",
    type: "role",
    status: "active",
    group: "Dirección Creativa",
    order: 2,
  },
  {
    id: "produccion-moda",
    label: "Producción moda",
    type: "role",
    status: "active",
    group: "Dirección Creativa",
    order: 3,
  },
  {
    id: "set-design",
    label: "Set design",
    type: "role",
    status: "active",
    group: "Dirección Creativa",
    order: 4,
  },
  {
    id: "scouting-localizaciones",
    label: "Scouting localizaciones",
    type: "role",
    status: "active",
    group: "Dirección Creativa",
    order: 5,
  },
  {
    id: "direccion-movimiento",
    label: "Dirección de movimiento",
    type: "role",
    status: "active",
    group: "Dirección Creativa",
    order: 6,
  },

  // =====================
  // 3. Fotografía & Vídeo
  // =====================
  {
    id: "fotografia-moda",
    label: "Fotografía",
    type: "role",
    status: "active",
    group: "Fotografía & Vídeo",
    subgroup: "Fotografía",
    order: 1,
  },
  {
    id: "fotografia-producto-ecommerce",
    label: "Fotografía ecommerce",
    type: "role",
    status: "active",
    group: "Fotografía & Vídeo",
    subgroup: "Fotografía",
    order: 2,
  },
  {
    id: "fotografia-still-life",
    label: "Fotografía still life",
    type: "role",
    status: "active",
    group: "Fotografía & Vídeo",
    subgroup: "Fotografía",
    order: 3,
  },
  {
    id: "direccion-fotografia",
    label: "Dirección de fotografía",
    type: "role",
    status: "active",
    group: "Fotografía & Vídeo",
    subgroup: "Fotografía",
    order: 4,
  },
  {
    id: "edicion-fotografica",
    label: "Edición fotográfica",
    type: "role",
    status: "active",
    group: "Fotografía & Vídeo",
    subgroup: "Fotografía",
    order: 5,
  },
  {
    id: "retoque-digital",
    label: "Retoque",
    type: "role",
    status: "active",
    group: "Fotografía & Vídeo",
    subgroup: "Fotografía",
    order: 6,
  },
  {
    id: "tecnico-digital",
    label: "Técnico digital",
    type: "role",
    status: "active",
    group: "Fotografía & Vídeo",
    subgroup: "Fotografía",
    order: 7,
  },
  {
    id: "fashion-film",
    label: "Fashion film",
    type: "role",
    status: "active",
    group: "Fotografía & Vídeo",
    subgroup: "Vídeo",
    order: 8,
  },
  {
    id: "videografia",
    label: "Videografía",
    type: "role",
    status: "active",
    group: "Fotografía & Vídeo",
    subgroup: "Vídeo",
    order: 9,
  },
  {
    id: "edicion-video",
    label: "Edición de vídeo",
    type: "role",
    status: "active",
    group: "Fotografía & Vídeo",
    subgroup: "Vídeo",
    order: 10,
  },

  // =====================
  // 4. Styling
  // =====================
  {
    id: "estilismo-editorial",
    label: "Estilismo editorial",
    type: "role",
    status: "active",
    group: "Styling",
    order: 1,
  },
  {
    id: "estilismo-celebrity",
    label: "Estilismo celebrity",
    type: "role",
    status: "active",
    group: "Styling",
    order: 2,
  },
  {
    id: "estilismo-personal",
    label: "Estilismo personal",
    type: "role",
    status: "active",
    group: "Styling",
    order: 3,
  },
  {
    id: "estilismo-ecommerce",
    label: "Estilismo ecommerce",
    type: "role",
    status: "active",
    group: "Styling",
    order: 4,
  },
  {
    id: "styling-publicidad",
    label: "Styling publicidad",
    type: "role",
    status: "active",
    group: "Styling",
    order: 5,
  },
  {
    id: "styling-videoclips",
    label: "Styling videoclips",
    type: "role",
    status: "active",
    group: "Styling",
    order: 6,
  },

  // =====================
  // 5. Beauty
  // =====================
  {
    id: "maquillaje-profesional",
    label: "Makeup",
    type: "role",
    status: "active",
    group: "Beauty (MUAH)",
    order: 1,
  },
  {
    id: "hair-styling",
    label: "Hair styling",
    type: "role",
    status: "active",
    group: "Beauty (MUAH)",
    order: 2,
  },
  {
    id: "hair-colorist",
    label: "Colorista",
    type: "role",
    status: "active",
    group: "Beauty (MUAH)",
    order: 3,
  },
  {
    id: "groomer",
    label: "Groomer",
    type: "role",
    status: "active",
    group: "Beauty (MUAH)",
    order: 4,
  },
  {
    id: "manicurista",
    label: "Manicurista / Nails",
    type: "role",
    status: "active",
    group: "Beauty (MUAH)",
    order: 5,
  },
  {
    id: "beauty-direction",
    label: "Beauty direction",
    type: "role",
    status: "active",
    group: "Beauty (MUAH)",
    order: 6,
  },

  // =====================
  // 6. Accesorios
  // =====================
  {
    id: "diseno-accesorios",
    label: "Accesorios",
    type: "role",
    status: "active",
    group: "Accesorios",
    order: 1,
  },
  {
    id: "diseno-joyas",
    label: "Joyería",
    type: "role",
    status: "active",
    group: "Accesorios",
    order: 2,
  },
  {
    id: "diseno-calzado",
    label: "Calzado",
    type: "role",
    status: "active",
    group: "Accesorios",
    order: 3,
  },
  {
    id: "diseno-bolsos",
    label: "Bolsos",
    type: "role",
    status: "active",
    group: "Accesorios",
    order: 4,
  },
  {
    id: "diseno-marroquineria",
    label: "Marroquinería",
    type: "role",
    status: "active",
    group: "Accesorios",
    order: 5,
  },
  {
    id: "diseno-sombrereria",
    label: "Sombrerería",
    type: "role",
    status: "active",
    group: "Accesorios",
    order: 6,
  },

  // =====================
  // 7. Digital & 3D
  // =====================
  {
    id: "diseno-moda-3d",
    label: "Diseño moda 3D",
    type: "role",
    status: "active",
    group: "Digital & 3D",
    order: 1,
  },
  {
    id: "render-producto",
    label: "Render producto",
    type: "role",
    status: "active",
    group: "Digital & 3D",
    order: 2,
  },
  {
    id: "prototipado-digital",
    label: "Prototipado digital",
    type: "role",
    status: "active",
    group: "Digital & 3D",
    order: 3,
  },
  {
    id: "diseno-grafico",
    label: "Diseño gráfico",
    type: "role",
    status: "active",
    group: "Digital & 3D",
    order: 4,
  },

  // =====================
  // 8. Ilustración
  // =====================
  {
    id: "ilustracion-moda",
    label: "Ilustración de moda",
    type: "role",
    status: "active",
    group: "Ilustración",
    order: 1,
  },
  {
    id: "ilustracion-tecnica",
    label: "Ilustración técnica",
    type: "role",
    status: "active",
    group: "Ilustración",
    order: 2,
  },

  // =====================
  // 9. Marketing & PR
  // =====================
  {
    id: "g-brand-manager",
    label: "Brand Manager",
    type: "role",
    status: "active",
    group: "Marketing & PR",
    order: 1,
  },
  {
    id: "g-pr-comm",
    label: "PR & Comunicación",
    type: "role",
    status: "active",
    group: "Marketing & PR",
    order: 2,
  },
  {
    id: "g-copywriting",
    label: "Copywriting de Moda",
    type: "role",
    status: "active",
    group: "Marketing & PR",
    order: 3,
  },
  {
    id: "g-showroom",
    label: "Showroom & Eventos",
    type: "role",
    status: "active",
    group: "Marketing & PR",
    order: 4,
  },

  // =====================
  // 10. Digital & Social
  // =====================
  {
    id: "g-social-media",
    label: "Social Media Manager",
    type: "role",
    status: "active",
    group: "Digital & Social",
    order: 1,
  },
  {
    id: "g-content-creator",
    label: "Content Creator",
    type: "role",
    status: "active",
    group: "Digital & Social",
    order: 2,
  },
  {
    id: "g-community",
    label: "Community Manager",
    type: "role",
    status: "active",
    group: "Digital & Social",
    order: 3,
  },
  {
    id: "g-influencer-mkt",
    label: "Influencer Marketing",
    type: "role",
    status: "active",
    group: "Digital & Social",
    order: 4,
  },
  {
    id: "g-ecommerce",
    label: "E-commerce & SEO",
    type: "role",
    status: "active",
    group: "Digital & Social",
    order: 5,
  },
  // =====================
  // 11. Comunicación & Editorial — NUEVO
  // =====================
  {
    id: "editor-moda",
    label: "Editor de moda",
    type: "role",
    status: "active",
    group: "Comunicación & Editorial",
    order: 1,
  },
  {
    id: "editor-beauty",
    label: "Editor de beauty",
    type: "role",
    status: "active",
    group: "Comunicación & Editorial",
    order: 2,
  },
  {
    id: "periodismo-moda",
    label: "Periodismo de moda",
    type: "role",
    status: "active",
    group: "Comunicación & Editorial",
    order: 3,
  },
  {
    id: "escritura-moda",
    label: "Escritura de moda",
    type: "role",
    status: "active",
    group: "Comunicación & Editorial",
    order: 4,
  },
];

async function ensureRoleTags() {
  // IDs y grupos válidos según el seed actual
  const validIds = ROLE_TAGS.map((t) => t.id);
  const validGroups = [...new Set(ROLE_TAGS.map((t) => t.group))];

  // 1. Borra tags con id que ya no existen en el seed
  await Tag.deleteMany({ id: { $nin: validIds } });

  // 2. Borra tags con grupo que ya no existe en el seed
  await Tag.deleteMany({ group: { $nin: validGroups } });

  // 3. Sincroniza todos los tags actuales
  for (const tag of ROLE_TAGS) {
    await Tag.updateOne({ id: tag.id }, { $set: tag }, { upsert: true });
  }
}

module.exports = { ensureRoleTags };