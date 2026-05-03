export const LOCATIONS = {
  "España": [
    "A Coruña", "Albacete", "Alicante", "Almería", "Arteixo",
    "Asturias", "Álava", "Ávila", "Badajoz", "Barcelona",
    "Bizkaia", "Burgos", "Cantabria", "Castellón", "Ceuta",
    "Ciudad Real", "Córdoba", "Cuenca", "El Hierro", "Elche",
    "Elda", "Formentera", "Fuerteventura", "Girona", "Gipuzkoa",
    "Gran Canaria", "Granada", "Guadalajara", "Huelva", "Huesca",
    "Ibiza", "Jaén", "La Gomera", "La Palma", "La Rioja",
    "Lanzarote", "Las Palmas", "León", "Lleida", "Lugo",
    "Madrid", "Mallorca", "Málaga", "Menorca", "Murcia",
    "Navarra", "Ourense", "Palencia", "Pontevedra", "Salamanca",
    "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona",
    "Tenerife", "Teruel", "Toledo", "Ubrique", "Valencia",
    "Valladolid", "Zamora", "Zaragoza"
  ],

  "Portugal": [
    "Aveiro", "Barcelos", "Beja", "Braga", "Bragança",
    "Castelo Branco", "Coimbra", "Évora", "Faro", "Felgueiras",
    "Funchal", "Guimarães", "Leiria", "Lisboa", "Oporto",
    "Ponta Delgada", "Portalegre", "Santarém", "Setúbal", "Viana do Castelo",
    "Vila Nova de Famalicão", "Vila Real", "Viseu"
  ],

  "Andorra": [
    "Andorra la Vella", "Canillo", "Encamp", "Escaldes-Engordany",
    "La Massana", "Ordino", "Sant Julià de Lòria"
  ],

  "Francia": [
    "Aix-en-Provence", "Amiens", "Angers", "Brest", "Burdeos",
    "Cannes", "Cholet", "Clermont-Ferrand", "Dijon", "Estrasburgo",
    "Grenoble", "Le Havre", "Lille", "Limoges", "Lyon",
    "Marsella", "Metz", "Montpellier", "Nantes", "Niza",
    "Nîmes", "Orléans", "París", "Perpignan", "Reims",
    "Rennes", "Saint-Étienne", "Toulon", "Toulouse", "Tours",
    "Troyes", "Versalles"
  ],

  "Italia": [
    "Arezzo", "Bari", "Bergamo", "Biella", "Bolonia",
    "Brescia", "Cagliari", "Catania", "Como", "Ferrara",
    "Florencia", "Génova", "Livorno", "Messina", "Milán",
    "Módena", "Nápoles", "Novara", "Padua", "Palermo",
    "Parma", "Perugia", "Pisa", "Prato", "Ravenna",
    "Rimini", "Roma", "Salerno", "Siena", "Trento",
    "Trieste", "Turín", "Venecia", "Verona", "Vicenza"
  ],

  "Reino Unido": [
    "Aberdeen", "Bath", "Belfast", "Birmingham", "Brighton",
    "Bristol", "Cambridge", "Cardiff", "Coventry", "Derby",
    "Dundee", "Edimburgo", "Exeter", "Glasgow", "Leeds",
    "Leicester", "Liverpool", "Londres", "Manchester", "Newcastle",
    "Nottingham", "Oxford", "Plymouth", "Portsmouth", "Reading",
    "Sheffield", "Southampton", "Stoke-on-Trent", "Wolverhampton", "York"
  ],

  "Bélgica": [
    "Antwerp", "Bruselas", "Gante", "Lieja"
  ],

  "Países Bajos": [
    "Amsterdam", "Rotterdam", "La Haya", "Utrecht", "Eindhoven"
  ],

  "Alemania": [
    "Aquisgrán", "Augsburgo", "Berlín", "Bielefeld", "Bochum",
    "Bonn", "Braunschweig", "Bremen", "Dortmund", "Dresden",
    "Duisburgo", "Düsseldorf", "Erfurt", "Essen", "Frankfurt",
    "Friburgo", "Hamburgo", "Hannover", "Herzogenaurach", "Karlsruhe",
    "Kiel", "Leipzig", "Mannheim", "Metzingen", "Múnich",
    "Münster", "Núremberg", "Rostock", "Stuttgart", "Wiesbaden",
    "Wuppertal"
  ],

  "Dinamarca": [
    "Aalborg", "Aarhus", "Copenhague", "Esbjerg", "Fredericia",
    "Helsingør", "Herning", "Horsens", "Kolding", "Næstved",
    "Odense", "Randers", "Roskilde", "Silkeborg", "Vejle"
  ],

"México": [
    "Ciudad de México", "Guadalajara", "Monterrey", "Puebla"
  ],

  "Colombia": [
    "Bogotá", "Cali", "Medellín"
  ],

  "Argentina": [
    "Buenos Aires", "Córdoba", "Rosario"
  ],

  "Chile": [
    "Santiago"
  ],

  "Perú": [
    "Arequipa", "Lima"
  ],

  "Brasil": [
    "Belo Horizonte", "Curitiba", "Fortaleza", "Rio de Janeiro", "São Paulo"
  ],

  "Estados Unidos": [
    "Atlanta", "Austin", "Chicago", "Dallas", "Las Vegas",
    "Los Angeles", "Miami", "New York", "Portland", "San Francisco"
  ],
};

export const COUNTRY_CODES = {
  "España": "ES",
  "Portugal": "PT",
  "Andorra": "AD",
  "Francia": "FR",
  "Italia": "IT",
  "Reino Unido": "GB",
  "Bélgica": "BE",
  "Países Bajos": "NL",
  "Alemania": "DE",
  "Dinamarca": "DK",
  "México": "MX",
  "Colombia": "CO",
  "Argentina": "AR",
  "Chile": "CL",
  "Perú": "PE",
  "Brasil": "BR",
  "Estados Unidos": "US",
};

export const ALL_COUNTRIES = Object.keys(LOCATIONS);

// ── Helpers de traducción ────────────────────────────────────────────────────
// Las claves en LOCATIONS/COUNTRY_CODES están en español (son también los
// valores que se guardan en BD). Estos helpers traducen al idioma activo
// usando el namespace `filters` (ver i18n/locales/*/filters.json).

const slugifyCity = (raw) =>
  String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();

const slugifyGroup = (raw) =>
  String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();

/**
 * Traduce el nombre de un grupo de especialidad ("Fotografía & Vídeo" →
 * "Photography & Video"). Las claves viven en `filters:groups.<slug>`.
 */
export const translateGroup = (group, t) => {
  if (!group) return '';
  if (typeof t !== 'function') return group;
  const slug = slugifyGroup(group);
  if (!slug) return group;
  return t(`filters:groups.${slug}`, { defaultValue: group });
};

/**
 * Devuelve el label de un tag de la BD en el idioma activo.
 * El backend expone `labelEn`; si está vacío, cae al `label` (ES).
 * Acepta tanto el objeto tag completo como un id (en cuyo caso devuelve el id).
 */
export const translateTag = (tag, lang) => {
  if (!tag) return '';
  if (typeof tag === 'string') return tag;
  const isEn = String(lang || '').toLowerCase().startsWith('en');
  if (isEn && tag.labelEn) return tag.labelEn;
  return tag.label || tag.id || '';
};

/**
 * Traduce el nombre de país. `country` viene en español ("España", "Italia"...).
 * Si no hay traducción, devuelve el original.
 */
export const translateCountry = (country, t) => {
  if (!country) return '';
  const code = COUNTRY_CODES[country];
  if (!code || typeof t !== 'function') return country;
  return t(`filters:countries.${code}`, { defaultValue: country });
};

/**
 * Traduce el nombre de ciudad. `city` viene como esté guardada en BD
 * (generalmente en español para ciudades conocidas). Si no hay traducción
 * en el bundle i18n, devuelve el original.
 */
export const translateCity = (city, t) => {
  if (!city) return '';
  if (typeof t !== 'function') return city;
  const slug = slugifyCity(city);
  if (!slug) return city;
  return t(`filters:cities.${slug}`, { defaultValue: city });
};

/**
 * Formatea la ubicación completa de un usuario para mostrar junto a su nombre.
 * Ejemplos:
 *   ES: "Valencia, España"
 *   EN: "Valencia, Spain"
 */
export const formatUserLocation = (city, country, t, { city2, country2 } = {}) => {
  const cityLabel    = translateCity(city, t);
  const countryLabel = translateCountry(country, t);

  const main = city && countryLabel
    ? `${cityLabel}, ${countryLabel}`
    : (cityLabel || countryLabel || '');

  if (!city2) return main;

  const city2Label    = translateCity(city2, t);
  const country2Label = translateCountry(country2, t);
  const secondary = country2Label ? `${city2Label}, ${country2Label}` : city2Label;

  return main ? `${main} · ${secondary}` : secondary;
};