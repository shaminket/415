/**
 * ENCARDOMY — MINWEB 415
 * Base de datos oficial y Fuente Única de la Verdad (Single Source of Truth)
 * Grupo 415 - ENP 4 "Vidal Castañeda y Nájera"
 *
 * Incluye:
 * - Horarios y Profesorado oficial (SIHO 25/Sept/2026)
 * - Hora oficial de Ciudad de México (America/Mexico_City)
 * - Sincronización en tiempo real para Avisos, Tareas y Exámenes en todas las páginas
 */

const ENCARDOMY_DATA = {
  school: {
    institution: "UNAM — ENP 4 \"Vidal Castañeda y Nájera\"",
    group: "415",
    generation: "2026-2027",
    project: "ENCARDOMY — MINWEB 415",
    version: "3.0 Mobile & iPad Edition",
    officialUpdate: "25/Septiembre/2026 5:04 PM",
    officialTimeZone: "America/Mexico_City"
  },

  // Obtener fecha y hora oficial de Ciudad de México (America/Mexico_City)
  // No depende de la hora configurada en el dispositivo del usuario
  getMexicoCityTime: function(simulatedDate) {
    if (simulatedDate) return new Date(simulatedDate);
    const now = new Date();
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Mexico_City",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
      });
      const parts = formatter.formatToParts(now);
      const m = {};
      parts.forEach(p => m[p.type] = p.value);
      let hour = parseInt(m.hour, 10);
      if (hour === 24) hour = 0;
      return new Date(
        parseInt(m.year, 10),
        parseInt(m.month, 10) - 1,
        parseInt(m.day, 10),
        hour,
        parseInt(m.minute, 10),
        parseInt(m.second, 10)
      );
    } catch (e) {
      // Fallback seguro
      return now;
    }
  },

  // Paleta de colores consistente por materia (estilo Apple / Glass)
  subjects: {
    "matematicas": {
      id: "matematicas",
      name: "Matemáticas IV",
      shortName: "Matemáticas",
      aliases: ["mate", "matematicas", "matemáticas", "algebra", "geometria", "saul", "quintana", "mejia"],
      color: "#2997FF", // Apple Blue
      colorSoft: "rgba(41, 151, 255, 0.15)",
      border: "rgba(41, 151, 255, 0.35)",
      professor: "Saúl Quintana Mejía",
      professorsBySection: null,
      hasOwnPage: false
    },
    "fisica": {
      id: "fisica",
      name: "Física III",
      shortName: "Física",
      aliases: ["fisica", "física", "fisica 3", "física iii", "gabriela", "reyna", "garcia"],
      color: "#00C7BE", // Apple Teal / Aqua
      colorSoft: "rgba(0, 199, 190, 0.15)",
      border: "rgba(0, 199, 190, 0.35)",
      professor: "Gabriela Reyna García",
      professorsBySection: null,
      hasOwnPage: true,
      pageUrl: "fisica.html"
    },
    "espanol": {
      id: "espanol",
      name: "Lengua Española",
      shortName: "Español",
      aliases: ["espanol", "español", "lengua espanola", "lengua española", "literatura", "redaccion", "guadalupe", "vazquez", "gonzalez"],
      color: "#FF9500", // Apple Orange
      colorSoft: "rgba(255, 149, 0, 0.15)",
      border: "rgba(255, 149, 0, 0.35)",
      professor: "María Guadalupe Vázquez González",
      professorsBySection: null,
      hasOwnPage: true,
      pageUrl: "lengua-espanola.html"
    },
    "historia": {
      id: "historia",
      name: "Historia Universal III",
      shortName: "Historia",
      aliases: ["historia", "historia universal", "historia 3", "historia iii", "karina", "cappello", "sanchez"],
      color: "#AF52DE", // Apple Purple
      colorSoft: "rgba(175, 82, 222, 0.15)",
      border: "rgba(175, 82, 222, 0.35)",
      professor: "Karina Cappello Sánchez",
      professorsBySection: null,
      hasOwnPage: true,
      pageUrl: "historia.html"
    },
    "logica": {
      id: "logica",
      name: "Lógica",
      shortName: "Lógica",
      aliases: ["logica", "lógica", "filosofia", "alam", "uriel", "munoz", "muñoz", "alonso"],
      color: "#FFD60A", // Apple Yellow / Gold
      colorSoft: "rgba(255, 214, 10, 0.15)",
      border: "rgba(255, 214, 10, 0.35)",
      professor: "Alam Uriel Muñoz Alonso",
      professorsBySection: null,
      hasOwnPage: false
    },
    "geografia": {
      id: "geografia",
      name: "Geografía",
      shortName: "Geografía",
      aliases: ["geografia", "geografía", "geo", "olivia", "virginia", "zamora", "guerrero"],
      color: "#34C759", // Apple Green
      colorSoft: "rgba(52, 199, 89, 0.15)",
      border: "rgba(52, 199, 89, 0.35)",
      professor: "Olivia Virginia Zamora Guerrero",
      professorsBySection: null,
      hasOwnPage: false
    },
    "ingles": {
      id: "ingles",
      name: "Lengua extranjera Inglés IV",
      shortName: "Inglés",
      aliases: ["ingles", "inglés", "lengua extranjera", "lengua extranjera inglés", "english", "jaime", "maldonado", "edgar", "rodriguez", "fuentevilla"],
      color: "#5E5CE6", // Apple Indigo
      colorSoft: "rgba(94, 92, 230, 0.15)",
      border: "rgba(94, 92, 230, 0.35)",
      professor: null,
      professorsBySection: {
        A: "Jaime Maldonado Ortega",
        B: "Edgar Rodríguez Fuentevilla"
      },
      hasOwnPage: false
    },
    "dibujo": {
      id: "dibujo",
      name: "Dibujo II",
      shortName: "Dibujo",
      aliases: ["dibujo", "dibujo 2", "dibujo ii", "artes", "erika", "paola", "jimenez", "genchi", "ana", "elvira", "yanez", "yañez", "arellano"],
      color: "#FF375F", // Apple Pink / Rose
      colorSoft: "rgba(255, 55, 95, 0.15)",
      border: "rgba(255, 55, 95, 0.35)",
      professor: null,
      professorsBySection: {
        A: "Erika Paola Jiménez Genchi",
        B: "Ana Elvira Yáñez Arellano"
      },
      hasOwnPage: false
    },
    "informatica": {
      id: "informatica",
      name: "Informática",
      shortName: "Informática",
      aliases: ["computacion", "computación", "informatica", "informática", "info", "juan", "carlos", "sotomayor", "guerra"],
      color: "#64D2FF", // Apple Light Blue / Cyan
      colorSoft: "rgba(100, 210, 255, 0.15)",
      border: "rgba(100, 210, 255, 0.35)",
      professor: "Juan Carlos Sotomayor Guerra",
      professorsBySection: null,
      hasOwnPage: false
    },
    "genero": {
      id: "genero",
      name: "Género y Prevención de las Violencias",
      shortName: "Género",
      aliases: ["genero", "género", "prevencion de violencias", "violencias", "anabel", "flores", "prieto"],
      color: "#BF5AF2", // Apple Light Purple
      colorSoft: "rgba(191, 90, 242, 0.15)",
      border: "rgba(191, 90, 242, 0.35)",
      professor: "Anabel Flores Prieto",
      professorsBySection: null,
      hasOwnPage: false
    },
    "educacion_fisica": {
      id: "educacion_fisica",
      name: "Educación Física IV",
      shortName: "Ed. Física",
      aliases: ["educacion fisica", "educación física", "ed fisica", "ed. física", "deportes", "arturo", "emanuel", "mora", "villanueva"],
      color: "#30D158", // Apple Mint Green
      colorSoft: "rgba(48, 209, 88, 0.15)",
      border: "rgba(48, 209, 88, 0.35)",
      professor: "Arturo Emanuel Mora Villanueva",
      professorsBySection: null,
      hasOwnPage: false
    },
    "orientacion": {
      id: "orientacion",
      name: "Orientación Educativa IV",
      shortName: "Orientación",
      aliases: ["orientacion", "orientación", "orientacion educativa", "ivonne", "becerra", "alcantara"],
      color: "#D4AF37", // Warm Bronze / Gold
      colorSoft: "rgba(212, 175, 55, 0.15)",
      border: "rgba(212, 175, 55, 0.35)",
      professor: null,
      professorsBySection: {
        A: "Ivonne Becerra Alcántara",
        B: "Prof. por Asignar"
      },
      hasOwnPage: false
    }
  },

  // Base de datos de Profesores Oficiales del Grupo 415 (Extraídos de SIHO)
  professors: [
    {
      subjectId: "matematicas",
      subjectName: "Matemáticas IV",
      name: "QUINTANA MEJIA SAUL",
      section: "ALL",
      salons: ["B-112", "B-109", "B-117"],
      notes: "Imparte a todo el grupo 415."
    },
    {
      subjectId: "espanol",
      subjectName: "Lengua Española",
      name: "VAZQUEZ GONZALEZ MARIA GUADALUPE",
      section: "ALL",
      salons: ["B-112", "B-113", "B-110"],
      notes: "Materia destacada con módulo propio de entregas necesarias."
    },
    {
      subjectId: "logica",
      subjectName: "Lógica",
      name: "MUÑOZ ALONSO ALAM URIEL",
      section: "ALL",
      salons: ["B-108", "B-206"],
      notes: "Sesiones de dos horas consecutivas los miércoles."
    },
    {
      subjectId: "dibujo",
      subjectName: "Dibujo II (Sección A)",
      name: "JIMENEZ GENCHI ERIKA PAOLA",
      section: "A",
      salons: ["B-008"],
      notes: "Profesora asignada a la Sección A."
    },
    {
      subjectId: "dibujo",
      subjectName: "Dibujo II (Sección B)",
      name: "YAÑEZ ARELLANO ANA ELVIRA",
      section: "B",
      salons: ["C-201"],
      notes: "Profesora asignada a la Sección B."
    },
    {
      subjectId: "ingles",
      subjectName: "Lengua extranjera Inglés IV (Sección A)",
      name: "MALDONADO ORTEGA JAIME",
      section: "A",
      salons: ["C-306"],
      notes: "Profesor asignado a la Sección A."
    },
    {
      subjectId: "ingles",
      subjectName: "Lengua extranjera Inglés IV (Sección B)",
      name: "RODRIGUEZ FUENTEVILLA EDGAR",
      section: "B",
      salons: ["C-205"],
      notes: "Profesor asignado a la Sección B."
    },
    {
      subjectId: "educacion_fisica",
      subjectName: "Educación Física IV",
      name: "MORA VILLANUEVA ARTURO EMANUEL",
      section: "ALL",
      salons: ["GIM1"],
      notes: "Gimnasio 1 los viernes."
    },
    {
      subjectId: "orientacion",
      subjectName: "Orientación Educativa IV (Sección A)",
      name: "BECERRA ALCANTARA IVONNE",
      section: "A",
      salons: ["B-110"],
      notes: "Profesora asignada a la Sección A."
    },
    {
      subjectId: "orientacion",
      subjectName: "Orientación Educativa IV (Sección B)",
      name: "Prof. por Asignar",
      section: "B",
      salons: ["Sin salón"],
      notes: "En Sección B es Clase libre por falta de profesor asignado."
    },
    {
      subjectId: "genero",
      subjectName: "Género y Prevención de las Violencias",
      name: "FLORES PRIETO ANABEL",
      section: "ALL",
      salons: ["B-109", "B-108"],
      notes: "Martes y viernes."
    },
    {
      subjectId: "fisica",
      subjectName: "Física III",
      name: "REYNA GARCIA GABRIELA",
      section: "ALL",
      salons: ["B-116", "B-109", "B-115", "A-302"],
      notes: "Cuenta con cambio de salón oficial los lunes y viernes."
    },
    {
      subjectId: "historia",
      subjectName: "Historia Universal III",
      name: "CAPPELLO SANCHEZ KARINA",
      section: "ALL",
      salons: ["B-117", "B-109"],
      notes: "Materia destacada con módulo propio de entregas necesarias."
    },
    {
      subjectId: "geografia",
      subjectName: "Geografía",
      name: "ZAMORA GUERRERO OLIVIA VIRGINIA",
      section: "ALL",
      salons: ["A-104"],
      notes: "Salón habitual A-104."
    },
    {
      subjectId: "informatica",
      subjectName: "Informática",
      name: "SOTOMAYOR GUERRA JUAN CARLOS",
      section: "ALL",
      salons: ["B-108", "CC-2"],
      notes: "Laboratorio CC-2 y aula B-108."
    }
  ],

  // Horario semanal oficial estructurado
  schedule: {
    // LUNES (1)
    1: [
      {
        start: "07:00",
        end: "07:50",
        durationMinutes: 50,
        subjectId: "geografia",
        subjectName: "Geografía",
        section: "ALL",
        salon: "A-104",
        isTwoHours: false,
        roomChange: null
      },
      {
        start: "07:50",
        end: "09:30",
        durationMinutes: 100,
        subjectId: "fisica",
        subjectName: "Física III",
        section: "ALL",
        isTwoHours: true,
        salon: "B-116 ➔ B-109",
        roomChange: {
          hasChange: true,
          firstHour: { start: "07:50", end: "08:40", salon: "B-116" },
          secondHour: { start: "08:40", end: "09:30", salon: "B-109" },
          label: "Cambio de salón: 1ª hr en B-116 ➔ 2ª hr en B-109"
        }
      },
      {
        start: "09:30",
        end: "10:20",
        durationMinutes: 50,
        subjectId: "ingles",
        subjectName: "Lengua extranjera Inglés IV",
        section: "SPLIT",
        isTwoHours: false,
        salonsBySection: {
          A: "C-306",
          B: "C-205"
        },
        roomChange: null
      },
      {
        start: "10:20",
        end: "12:00",
        durationMinutes: 100,
        subjectId: "espanol",
        subjectName: "Lengua Española",
        section: "ALL",
        salon: "B-112",
        isTwoHours: true,
        roomChange: null
      },
      {
        start: "12:00",
        end: "12:50",
        durationMinutes: 50,
        subjectId: "orientacion",
        subjectName: "Orientación Educativa IV",
        section: "SPLIT",
        isTwoHours: false,
        salonsBySection: {
          A: "B-110",
          B: "Sin salón"
        },
        customBySection: {
          A: { isFree: false, label: "Orientación Educativa IV", salon: "B-110", prof: "Ivonne Becerra Alcántara" },
          B: { isFree: true, label: "Clase libre", reason: "Prof. por Asignar", salon: "—", prof: "Sin profesor asignado" }
        },
        roomChange: null
      }
    ],

    // MARTES (2)
    2: [
      {
        start: "07:00",
        end: "08:40",
        durationMinutes: 100,
        subjectId: "matematicas",
        subjectName: "Matemáticas IV",
        section: "ALL",
        salon: "B-112",
        isTwoHours: true,
        roomChange: null
      },
      {
        start: "08:40",
        end: "09:30",
        durationMinutes: 50,
        subjectId: "dibujo",
        subjectName: "Dibujo II",
        section: "A_ONLY",
        isTwoHours: false,
        customBySection: {
          A: { isFree: false, label: "Dibujo II", salon: "B-008", prof: "Erika Paola Jiménez Genchi" },
          B: { isFree: true, label: "Sin clase programada", reason: "Horario exclusivo para Sección A", salon: "—", prof: "—" }
        },
        roomChange: null
      },
      {
        start: "09:30",
        end: "10:20",
        durationMinutes: 50,
        subjectId: "informatica",
        subjectName: "Informática",
        section: "ALL",
        salon: "B-108",
        isTwoHours: false,
        roomChange: null
      },
      {
        start: "10:20",
        end: "11:10",
        durationMinutes: 50,
        subjectId: "logica",
        subjectName: "Lógica",
        section: "ALL",
        salon: "B-206",
        isTwoHours: false,
        roomChange: null
      },
      {
        start: "11:10",
        end: "12:00",
        durationMinutes: 50,
        subjectId: "informatica",
        subjectName: "Informática",
        section: "ALL",
        salon: "CC-2",
        isTwoHours: false,
        roomChange: null
      },
      {
        start: "12:00",
        end: "12:50",
        durationMinutes: 50,
        subjectId: "genero",
        subjectName: "Género y Prevención de las Violencias",
        section: "ALL",
        salon: "B-109",
        isTwoHours: false,
        roomChange: null
      }
    ],

    // MIÉRCOLES (3)
    3: [
      {
        start: "07:00",
        end: "07:50",
        durationMinutes: 50,
        subjectId: "geografia",
        subjectName: "Geografía",
        section: "ALL",
        salon: "A-104",
        isTwoHours: false,
        roomChange: null
      },
      {
        start: "07:50",
        end: "09:30",
        durationMinutes: 100,
        subjectId: "logica",
        subjectName: "Lógica",
        section: "ALL",
        salon: "B-108",
        isTwoHours: true,
        roomChange: null
      },
      {
        start: "09:30",
        end: "10:20",
        durationMinutes: 50,
        subjectId: "ingles",
        subjectName: "Lengua extranjera Inglés IV",
        section: "SPLIT",
        isTwoHours: false,
        salonsBySection: {
          A: "C-306",
          B: "C-205"
        },
        roomChange: null
      },
      {
        start: "10:20",
        end: "11:10",
        durationMinutes: 50,
        subjectId: "dibujo",
        subjectName: "Dibujo II",
        section: "SPLIT",
        isTwoHours: false,
        salonsBySection: {
          A: "B-008",
          B: "C-201"
        },
        roomChange: null
      },
      {
        start: "11:10",
        end: "12:50",
        durationMinutes: 100,
        subjectId: "espanol",
        subjectName: "Lengua Española",
        section: "ALL",
        salon: "B-113",
        isTwoHours: true,
        roomChange: null
      }
    ],

    // JUEVES (4)
    4: [
      {
        start: "07:00",
        end: "08:40",
        durationMinutes: 100,
        subjectId: "matematicas",
        subjectName: "Matemáticas IV",
        section: "ALL",
        salon: "B-109",
        isTwoHours: true,
        roomChange: null
      },
      {
        start: "08:40",
        end: "09:30",
        durationMinutes: 50,
        subjectId: "espanol",
        subjectName: "Lengua Española",
        section: "ALL",
        salon: "B-110",
        isTwoHours: false,
        roomChange: null
      },
      {
        start: "09:30",
        end: "10:20",
        durationMinutes: 50,
        subjectId: "geografia",
        subjectName: "Geografía",
        section: "ALL",
        salon: "A-104",
        isTwoHours: false,
        roomChange: null
      },
      {
        start: "10:20",
        end: "12:00",
        durationMinutes: 100,
        subjectId: "historia",
        subjectName: "Historia Universal III",
        section: "ALL",
        salon: "B-109",
        isTwoHours: true,
        roomChange: null
      }
    ],

    // VIERNES (5)
    5: [
      {
        start: "07:00",
        end: "07:50",
        durationMinutes: 50,
        subjectId: "dibujo",
        subjectName: "Dibujo II",
        section: "B_ONLY",
        isTwoHours: false,
        customBySection: {
          A: { isFree: true, label: "Sin clase programada", reason: "Horario exclusivo para Sección B", salon: "—", prof: "—" },
          B: { isFree: false, label: "Dibujo II", salon: "C-201", prof: "Ana Elvira Yáñez Arellano" }
        },
        roomChange: null
      },
      {
        start: "07:50",
        end: "08:40",
        durationMinutes: 50,
        subjectId: "historia",
        subjectName: "Historia Universal III",
        section: "ALL",
        salon: "B-117",
        isTwoHours: false,
        roomChange: null
      },
      {
        start: "08:40",
        end: "09:30",
        durationMinutes: 50,
        subjectId: "matematicas",
        subjectName: "Matemáticas IV",
        section: "ALL",
        salon: "B-117",
        isTwoHours: false,
        roomChange: null
      },
      {
        start: "09:30",
        end: "10:20",
        durationMinutes: 50,
        subjectId: "ingles",
        subjectName: "Lengua extranjera Inglés IV",
        section: "SPLIT",
        isTwoHours: false,
        salonsBySection: {
          A: "C-306",
          B: "C-205"
        },
        roomChange: null
      },
      {
        start: "10:20",
        end: "11:10",
        durationMinutes: 50,
        subjectId: "genero",
        subjectName: "Género y Prevención de las Violencias",
        section: "ALL",
        salon: "B-108",
        isTwoHours: false,
        roomChange: null
      },
      {
        start: "11:10",
        end: "12:00",
        durationMinutes: 50,
        subjectId: "educacion_fisica",
        subjectName: "Educación Física IV",
        section: "ALL",
        salon: "GIM1",
        isTwoHours: false,
        roomChange: null
      },
      {
        start: "12:00",
        end: "13:40",
        durationMinutes: 100,
        subjectId: "fisica",
        subjectName: "Física III",
        section: "ALL",
        isTwoHours: true,
        salon: "B-115 ➔ A-302",
        roomChange: {
          hasChange: true,
          firstHour: { start: "12:00", end: "12:50", salon: "B-115" },
          secondHour: { start: "12:50", end: "13:40", salon: "A-302" },
          label: "Cambio de salón: 1ª hr en B-115 ➔ 2ª hr en A-302"
        }
      }
    ]
  },

  // ==========================================================================
  // FUENTE CENTRAL DE DATOS (Single Source of Truth) PARA AVISOS, TAREAS Y EXÁMENES
  // ==========================================================================
  // Estructura oficial para sincronización automática
  avisos: [],
  tareas: [],
  examenes: [],
  herramientas: [],
  clasesPerdidas: [],
  // Publicidad y oportunidades de interés (Vacío por ahora según Reglas 38 y 45)
  publicidad: [],

  // Arquitectura oficial de Pagos Clip (Preparada para enlaces dinámicos según monto/cotización)
  clipConfig: {
    enabled: false, // Deshabilitado por ahora hasta recibir enlaces oficiales
    phoneWhatsApp: "+52 55 7198 5641",
    whatsappClean: "525571985641",
    defaultUrl: null, // NO inventar enlace
    priceTiers: [],   // Permite asociar diferentes enlaces de Clip según el precio del pedido
    getClipUrlForAmount: function(amount) {
      if (!this.enabled) return null;
      if (!amount || isNaN(amount)) return this.defaultUrl;
      const tier = this.priceTiers.find(t => amount >= t.min && amount <= t.max);
      return tier ? tier.url : this.defaultUrl;
    }
  },

  _listeners: [],

  // Suscribir callback para actualizaciones en tiempo real
  subscribe: function(callback) {
    if (typeof callback === "function") {
      this._listeners.push(callback);
    }
  },

  // Notificar a todas las vistas abiertas
  notifyChange: function() {
    this._listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error(e); }
    });
  },

  // Obtener avisos filtrados desde la fuente única
  getAvisos: function(subjectFilter, priorityFilter, includeArchived) {
    this._loadFromStorageOverlay();
    return this.avisos.filter(item => {
      if (includeArchived) {
        if (!item.archived) return false;
      } else {
        if (item.archived) return false;
      }
      if (subjectFilter && subjectFilter !== "all" && item.subjectId !== subjectFilter) {
        return false;
      }
      if (priorityFilter && priorityFilter !== "all" && item.priority !== priorityFilter) {
        return false;
      }
      return true;
    });
  },

  // Obtener tareas filtradas desde la fuente única
  getTareas: function(subjectFilter, includeArchived) {
    this._loadFromStorageOverlay();
    return this.tareas.filter(item => {
      if (includeArchived) {
        if (!item.archived) return false;
      } else {
        if (item.archived) return false;
      }
      if (subjectFilter && subjectFilter !== "all" && item.subjectId !== subjectFilter) {
        return false;
      }
      return true;
    });
  },

  // Obtener exámenes filtrados desde la fuente única
  getExamenes: function(subjectFilter, includeArchived) {
    this._loadFromStorageOverlay();
    return this.examenes.filter(item => {
      if (includeArchived) {
        if (!item.archived) return false;
      } else {
        if (item.archived) return false;
      }
      if (subjectFilter && subjectFilter !== "all" && item.subjectId !== subjectFilter) {
        return false;
      }
      return true;
    });
  },

  // Métodos de mutación centralizados
  setAvisos: function(newList) {
    this.avisos = newList;
    this._saveToStorageOverlay();
    this.notifyChange();
  },

  setTareas: function(newList) {
    this.tareas = newList;
    this._saveToStorageOverlay();
    this.notifyChange();
  },

  setExamenes: function(newList) {
    this.examenes = newList;
    this._saveToStorageOverlay();
    this.notifyChange();
  },

  addAviso: function(item) {
    this.avisos.unshift(item);
    this._saveToStorageOverlay();
    this.notifyChange();
  },

  addTarea: function(item) {
    this.tareas.unshift(item);
    this._saveToStorageOverlay();
    this.notifyChange();
  },

  addExamen: function(item) {
    this.examenes.unshift(item);
    this._saveToStorageOverlay();
    this.notifyChange();
  },

  getPublicidad: function() {
    this._loadFromStorageOverlay();
    return this.publicidad || [];
  },

  setPublicidad: function(newList) {
    this.publicidad = newList;
    this._saveToStorageOverlay();
    this.notifyChange();
  },

  addPublicidad: function(item) {
    this.publicidad.unshift(item);
    this._saveToStorageOverlay();
    this.notifyChange();
  },

  _storageKey: "encardomy_central_academic_store",

  _saveToStorageOverlay: function() {
    try {
      const payload = {
        avisos: this.avisos,
        tareas: this.tareas,
        examenes: this.examenes,
        publicidad: this.publicidad,
        lastModified: Date.now()
      };
      localStorage.setItem(this._storageKey, JSON.stringify(payload));
    } catch (e) {}
  },

  _loadFromStorageOverlay: function() {
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.avisos)) this.avisos = parsed.avisos;
        if (Array.isArray(parsed.tareas)) this.tareas = parsed.tareas;
        if (Array.isArray(parsed.examenes)) this.examenes = parsed.examenes;
        if (Array.isArray(parsed.publicidad)) this.publicidad = parsed.publicidad;
      }
    } catch (e) {}
  },

  // Inicializar sincronización reactiva continua
  initSync: function() {
    this._loadFromStorageOverlay();

    // Intentar leer academics.json si está disponible en servidor
    if (typeof fetch === "function" && location.protocol.startsWith("http")) {
      fetch("data/academics.json")
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.avisos)) {
            // Unir datos oficiales del servidor si localStorage está vacío
            if (!localStorage.getItem(this._storageKey)) {
              this.avisos = data.avisos;
              this.tareas = data.tareas || [];
              this.examenes = data.examenes || [];
              this.publicidad = data.publicidad || [];
              this.notifyChange();
            }
          }
        })
        .catch(() => {});
    }

    // Escuchar eventos de Storage entre pestañas y ventanas
    window.addEventListener("storage", (e) => {
      if (e.key === this._storageKey) {
        this._loadFromStorageOverlay();
        this.notifyChange();
      }
    });

    // Sondeo periódico equilibrado (cada 3 segundos) para detectar cambios en datos
    setInterval(() => {
      this._loadFromStorageOverlay();
      this.notifyChange();
    }, 3000);
  }
};

// Inicializar sincronización automáticamente
if (typeof window !== "undefined") {
  window.ENCARDOMY_DATA = ENCARDOMY_DATA;
  ENCARDOMY_DATA.initSync();
}
