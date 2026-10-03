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
  // Estructura oficial actualizada para sincronización automática
  avisos: [
    {
        "id": "aviso-matematicas-obra",
        "subjectId": "matematicas",
        "subjectName": "Matemáticas IV",
        "title": "Obra de Teatro: ¿Cómo pasar Matemáticas sin problemas?",
        "date": "2 de octubre de 2026 · 12:30 hrs",
        "priority": "medium",
        "summary": "Obra de teatro. Viernes 2 de octubre de 2026, 12:30 hrs en Teatro Auditorio del SME. Duración: 2 horas. Otorga 2 puntos extra (asistencia no obligatoria).",
        "content": "Actividad: Obra de teatro.\nFecha: 2 de octubre de 2026.\nHora: 12:30 horas.\nDuración: 2 horas (12:30 a 14:30 hrs).\nLugar: Teatro Auditorio del SME.\nBeneficio: Otorga 2 puntos extra.\nAsistencia: NO es obligatoria.",
        "location": "Teatro Auditorio del SME",
        "locationUrl": "https://maps.google.com/?q=Teatro+Auditorio+del+SME",
        "calendarEvent": {
            "title": "Obra de Teatro: ¿Cómo pasar Matemáticas sin problemas?",
            "startISO": "2026-10-02T12:30:00-06:00",
            "endISO": "2026-10-02T14:30:00-06:00",
            "location": "Teatro Auditorio del SME",
            "description": "Obra de teatro. Otorga 2 puntos extra. Asistencia no obligatoria. Duración: 2 horas."
        },
        "urlMobile": "aviso-matematicas-obra.html",
        "urlIpad": "ipad-aviso-matematicas-obra.html",
        "urlMac": "mac-aviso-matematicas-obra.html"
    },
    {
        "id": "aviso-fisica-clase-especial",
        "subjectId": "fisica",
        "subjectName": "Física III",
        "title": "Clase Especial de Apoyo — ShaMinKet",
        "date": "Domingo 4 de octubre de 2026 · 14:00 hrs",
        "priority": "medium",
        "summary": "Domingo 4 de octubre a las 14:00 hrs CDMX. Duración 30 a 120 min. Participación voluntaria. Tema: suma de vectores.",
        "content": "El domingo a las 14:00 horas CDMX, ShaMinKet tendrá preparada una pequeña clase sobre el tema de suma de vectores.\n\n• Duración: 30 a 120 minutos, dependiendo de los participantes.\n• Participación voluntaria: si alguien no puede o no quiere unirse, no pasa nada.\n• Importante: Esta actividad no contradice las normas indicadas para el comunicado oficial porque no se realizará pase de lista, evaluación, revisión de trabajos, entrega de tareas ni revisión de exámenes. Es únicamente una clase de apoyo.\n• Confirmación: Si un alumno asistirá, debe confirmar mediante WhatsApp al 52 5642834619.\n• Material recomendado para la clase: 2 hojas milimétricas, 4 colores, 2 escuadras y 1 transportador.",
        "whatsapp": "52 5642834619",
        "urlMobile": "aviso-fisica-clase-especial.html",
        "urlIpad": "ipad-aviso-fisica-clase-especial.html",
        "urlMac": "mac-aviso-fisica-clase-especial.html"
    },
    {
        "id": "aviso-espanol-copias",
        "subjectId": "espanol",
        "subjectName": "Lengua Española",
        "title": "Material de Copias Disponible",
        "date": "5 de octubre de 2026",
        "priority": "high",
        "summary": "Copias disponibles para descarga en Google Drive y en la gomita. También disponibles a domicilio con Encardomy.",
        "content": "Las copias para Lengua Española pueden descargarse directamente desde la carpeta oficial de Google Drive o adquirirse en la gomita.\n\nFecha: 5 de octubre de 2026.",
        "links": [
            {
                "label": "Abrir carpeta en Google Drive",
                "url": "https://drive.google.com/drive/folders/1rB-R6pZYTYaGLz6wQbta6dbcVqDk-1Ol?usp=sharing"
            }
        ],
        "urlMobile": "aviso-espanol-copias.html",
        "urlIpad": "ipad-aviso-espanol-copias.html",
        "urlMac": "mac-aviso-espanol-copias.html"
    },
    {
        "id": "aviso-fisica-materiales",
        "subjectId": "fisica",
        "subjectName": "Física III",
        "title": "Materiales Obligatorios para Sesión de Vectores",
        "date": "Lunes 5 de octubre de 2026",
        "priority": "high",
        "summary": "Materiales requeridos para el lunes 5 de octubre: escuadras, transportador, 4 colores, tijeras, pegamento y rosa de los 4 vientos.",
        "content": "Para la sesión del lunes 5 de octubre de 2026 se requiere llevar los siguientes materiales obligatorios:\n\n1. Escuadras\n2. Transportador\n3. 4 colores\n4. Tijeras escolares\n5. Pegamento\n6. Rosa de los 4 vientos",
        "urlMobile": "aviso-fisica-materiales.html",
        "urlIpad": "ipad-aviso-fisica-materiales.html",
        "urlMac": "mac-aviso-fisica-materiales.html"
    },
    {
        "id": "aviso-geografia-mapas",
        "subjectId": "geografia",
        "subjectName": "Geografía",
        "title": "Mapas Requeridos para Examen Departamental",
        "date": "Lunes 5 de octubre de 2026",
        "priority": "high",
        "summary": "Descarga de mapas en Google Drive para el examen del próximo lunes. Recordatorio: nombre completo (apellidos primero) + grupo dentro del margen.",
        "content": "El próximo lunes se realizará el examen de Geografía sobre localización de estados, capitales y alcaldías. El alumno debe llevar sus mapas impresos. Además, dentro del margen debe colocar: nombre completo comenzando por apellidos + grupo.",
        "links": [
            {
                "label": "Descargar Mapas en Google Drive",
                "url": "https://drive.google.com/drive/folders/1cpaHBqMTHCgMKtQteXqd8QIuOricH7kq?usp=sharing"
            }
        ],
        "urlMobile": "aviso-geografia-mapas.html",
        "urlIpad": "ipad-aviso-geografia-mapas.html",
        "urlMac": "mac-aviso-geografia-mapas.html"
    },
    {
        "id": "aviso-historia-puntos-extra",
        "subjectId": "historia",
        "subjectName": "Historia Universal III",
        "title": "Avisos de Puntos Extra para Examen",
        "date": "Octubre 2026",
        "priority": "medium",
        "summary": "1 punto extra por registrar pilas (con foto) y 1 punto extra por contestar la guía de estudio.",
        "content": "Apartado oficial de puntos extra para Historia Universal III:\n\n• Aviso 1: Lleva tus pilas para registrar, toma una foto y obtén: 1 punto extra sobre el próximo examen.\n• Aviso 2: Responder la guía de estudio otorgará: 1 punto extra para el examen. (Nota: La guía de estudio aún no está disponible).",
        "urlMobile": "aviso-historia-puntos-extra.html",
        "urlIpad": "ipad-aviso-historia-puntos-extra.html",
        "urlMac": "mac-aviso-historia-puntos-extra.html"
    },
    {
        "id": "aviso-espanol-don-juan",
        "subjectId": "espanol",
        "subjectName": "Lengua Española",
        "title": "Obra Don Juan Tenorio — Clásico",
        "date": "Sábado 17 de octubre de 2026 · 10:00 hrs",
        "priority": "medium",
        "summary": "17 de octubre de 2026, 10:00 hrs. Asistencia no obligatoria (+1 punto extra). Precio: $300 pesos en Eje 4 Sur 809, Col. Del Valle.",
        "content": "Obra Don Juan Tenorio — Clásico.\nFecha: 17 de octubre de 2026.\nHora: 10:00 horas (duración: 2 horas).\n\n• Asistencia: Acudir a la obra NO es obligatorio. Sin embargo, si el alumno acude obtendrá 1 punto extra.\n• Precio: $300 pesos mexicanos. (IMPORTANTE: No existe precio preferencial para estudiantes porque la obra ya cuenta con descuento).\n• Ubicación: Eje 4 Sur 809, Colonia Del Valle.",
        "location": "Eje 4 Sur 809, Colonia Del Valle",
        "locationUrl": "https://maps.google.com/?q=Eje+4+Sur+809,+Colonia+Del+Valle",
        "calendarEvent": {
            "title": "Obra Don Juan Tenorio — Clásico (Lengua Española)",
            "startISO": "2026-10-17T10:00:00-06:00",
            "endISO": "2026-10-17T12:00:00-06:00",
            "location": "Eje 4 Sur 809, Colonia Del Valle",
            "description": "Obra Don Juan Tenorio. Asistencia no obligatoria (+1 punto extra). Precio: $300 pesos (sin descuento estudiante)."
        },
        "urlMobile": "aviso-espanol-don-juan.html",
        "urlIpad": "ipad-aviso-espanol-don-juan.html",
        "urlMac": "mac-aviso-espanol-don-juan.html"
    }
],
  tareas: [
    {
        "id": "tarea-historia-cuarta-rev",
        "subjectId": "historia",
        "subjectName": "Historia Universal III",
        "title": "Actividad: Cuarta Revolución Industrial",
        "dueDate": "3 de octubre de 2026 · 23:59 hrs",
        "priority": "urgent",
        "summary": "Investigación sobre la Revolución Industrial y reflexión sobre uno de los videos. Nomenclatura oficial en PDF.",
        "description": "La actividad consiste en:\n1. Realizar la investigación sobre la Revolución Industrial.\n2. Realizar una reflexión sobre UNO de los siguientes videos:\n   • Video 1: https://youtu.be/lOoLmGcnBfU?si=76ziIcIScaD5bGcX\n   • Video 2: https://youtu.be/dFc-Etxo6jY?si=FGDUqWgdbJtLjhmw\n\nNomenclatura obligatoria del archivo:\n415_apellidos del alumno_cuarta revolución industrial.pdf\n\nPuedes utilizar las herramientas PDF de Encardomy/Minweb para preparar o unir tu archivo.",
        "links": [
            {
                "label": "Ver Video 1 (YouTube)",
                "url": "https://youtu.be/lOoLmGcnBfU?si=76ziIcIScaD5bGcX"
            },
            {
                "label": "Ver Video 2 (YouTube)",
                "url": "https://youtu.be/dFc-Etxo6jY?si=FGDUqWgdbJtLjhmw"
            },
            {
                "label": "Herramientas PDF de la Minweb",
                "url": "herramientas.html"
            }
        ],
        "urlMobile": "tarea-historia-cuarta-rev.html",
        "urlIpad": "ipad-tarea-historia-cuarta-rev.html",
        "urlMac": "mac-tarea-historia-cuarta-rev.html"
    },
    {
        "id": "tarea-historia-presentacion",
        "subjectId": "historia",
        "subjectName": "Historia Universal III",
        "title": "Presentación Electrónica por Equipos",
        "dueDate": "4 de octubre de 2026 · 23:59 hrs",
        "priority": "urgent",
        "summary": "Presentación en equipos de 4 a 5 integrantes sobre una de las 4 Revoluciones Industriales. Formatos: .pptx, .ppt o .pdf.",
        "description": "El alumno debe seleccionar una revolución:\n• Primera Revolución Industrial\n• Segunda Revolución Industrial\n• Tercera Revolución Industrial\n• Cuarta Revolución Industrial\n\nExisten dos opciones para realizar la presentación:\n• Opción 1: Seguir las instrucciones de Classroom (https://classroom.google.com/c/ODA1NjIzOTQwNjUy/a/ODg3NjE1NDg0MTM3/details)\n• Opción 2: Utilizar la metodología 1 + 3 = 1 (https://drive.google.com/file/d/13Rrxm22qQBBfRGnfV4nDkCwfv4w2ox4U/view?usp=sharing)\n\nEquipos: Estrictamente de 4 a 5 integrantes (no más y no menos).\n\nFormato de entrega: La presentación NO debe subirse únicamente como PDF. Son válidos:\n• 415_nombre del equipo_nombre de la Rev.Ind.pptx\n• 415_nombre del equipo_nombre de la Rev.Ind.ppt\n• 415_nombre del equipo_nombre de la Rev.Ind.pdf\n(Los tres formatos son válidos según las instrucciones indicadas). La presentación debe poder abrirse correctamente. Si contiene videos o animaciones, se recomienda enviar también un enlace directamente pegado en Classroom (no usar 'mandar por link'), configurado en 'solo ver'.\n\nEntrega por equipo: La presentación debe ser entregada solamente por 2 integrantes del equipo. Los demás integrantes deben marcar la actividad como completada.",
        "links": [
            {
                "label": "Instrucciones en Classroom",
                "url": "https://classroom.google.com/c/ODA1NjIzOTQwNjUy/a/ODg3NjE1NDg0MTM3/details"
            },
            {
                "label": "Metodología 1 + 3 = 1 (Google Drive)",
                "url": "https://drive.google.com/file/d/13Rrxm22qQBBfRGnfV4nDkCwfv4w2ox4U/view?usp=sharing"
            }
        ],
        "urlMobile": "tarea-historia-presentacion.html",
        "urlIpad": "ipad-tarea-historia-presentacion.html",
        "urlMac": "mac-tarea-historia-presentacion.html"
    },
    {
        "id": "tarea-historia-epistola",
        "subjectId": "historia",
        "subjectName": "Historia Universal III",
        "title": "2 Epístola Histórica",
        "dueDate": "5 de octubre de 2026",
        "priority": "high",
        "summary": "Entrega en Classroom el lunes 5 de octubre (se cierra el acceso). La maestra recoge cartas físicas el jueves 8 de octubre de 2026.",
        "description": "2 EPISTOLA HISTÓRICA.\nFecha de entrega: lunes 5 de octubre de 2026.\n\n• El lunes se cierra el Classroom.\n• El alumno debe realizar la actividad y marcarla como completada en Classroom.\n• La maestra recogerá todas las cartas físicas el jueves 8 de octubre de 2026.\n\nAcceso directo a las instrucciones de Classroom:\nhttps://classroom.google.com/c/ODA1NjIzOTQwNjUy/a/ODg4MjYzNzkzMDk3/details",
        "links": [
            {
                "label": "Instrucciones de Classroom",
                "url": "https://classroom.google.com/c/ODA1NjIzOTQwNjUy/a/ODg4MjYzNzkzMDk3/details"
            }
        ],
        "urlMobile": "tarea-historia-epistola.html",
        "urlIpad": "ipad-tarea-historia-epistola.html",
        "urlMac": "mac-tarea-historia-epistola.html"
    },
    {
        "id": "tarea-fisica-vectores",
        "subjectId": "fisica",
        "subjectName": "Física III",
        "title": "Investigación: Suma de Vectores por el Método del Polígono",
        "dueDate": "5 de octubre de 2026",
        "priority": "medium",
        "summary": "Investigar todo sobre la suma de vectores por el método del polígono.",
        "description": "Investigar todo sobre la suma de vectores por el método del polígono.",
        "urlMobile": "tarea-fisica-vectores.html",
        "urlIpad": "ipad-tarea-fisica-vectores.html",
        "urlMac": "mac-tarea-fisica-vectores.html"
    }
],
  examenes: [
    {
        "id": "examen-geografia-estados",
        "subjectId": "geografia",
        "subjectName": "Geografía",
        "title": "Examen: Estados, Capitales y Alcaldías",
        "date": "Lunes 5 de octubre de 2026",
        "topics": "Localización de estados y capitales; localización de alcaldías.",
        "summary": "Examen el próximo lunes 5 de octubre. Llevar mapas oficiales con nombre completo (apellidos primero) + grupo dentro del margen.",
        "links": [
            {
                "label": "Descargar Mapas Oficiales en Google Drive",
                "url": "https://drive.google.com/drive/folders/1cpaHBqMTHCgMKtQteXqd8QIuOricH7kq?usp=sharing"
            }
        ],
        "notes": "El alumno debe llevar sus mapas. Además, dentro del margen debe colocar: nombre completo comenzando por apellidos + grupo.",
        "urlMobile": "examen-geografia-estados.html",
        "urlIpad": "ipad-examen-geografia-estados.html",
        "urlMac": "mac-examen-geografia-estados.html"
    },
    {
        "id": "examen-matematicas-oct",
        "subjectId": "matematicas",
        "subjectName": "Matemáticas IV",
        "title": "Examen de Matemáticas IV",
        "date": "Jueves 8 de octubre de 2026",
        "topics": "Temario oficial de Matemáticas IV",
        "summary": "Examen programado para el 8 de octubre de 2026.",
        "notes": "Fecha oficial: 8 de octubre de 2026.",
        "urlMobile": "examen-matematicas-oct.html",
        "urlIpad": "ipad-examen-matematicas-oct.html",
        "urlMac": "mac-examen-matematicas-oct.html"
    },
    {
        "id": "examen-historia-revoluciones",
        "subjectId": "historia",
        "subjectName": "Historia Universal III",
        "title": "Examen: Las 4 Revoluciones Industriales",
        "date": "Jueves 15 de octubre de 2026 · 11:00 a 11:30 hrs",
        "topics": "Las 4 Revoluciones Industriales (20 preguntas)",
        "summary": "Jueves 15 de octubre de 2026, 11:00 a 11:30 hrs en CC1 — Centro de Cómputo 1. 20 preguntas (sujeto a disponibilidad de CC1).",
        "location": "CC1 — Centro de Cómputo 1, ENP 4",
        "calendarEvent": {
            "title": "Examen de Historia Universal III: Las 4 Revoluciones Industriales",
            "startISO": "2026-10-15T11:00:00-06:00",
            "endISO": "2026-10-15T11:30:00-06:00",
            "location": "CC1 — Centro de Cómputo 1, ENP 4",
            "description": "Examen de 20 preguntas sobre Las 4 Revoluciones Industriales. Acudir directamente a CC1 (sujeto a disponibilidad de CC1)."
        },
        "notes": "Temas: Las 4 Revoluciones Industriales. El examen estará compuesto por 20 preguntas. Lugar: CC1 — Centro de Cómputo 1. Ese día los alumnos deben acudir directamente a CC1.\n\nAviso importante: La fecha está sujeta a cambios dependiendo de la disponibilidad de CC1.",
        "urlMobile": "examen-historia-revoluciones.html",
        "urlIpad": "ipad-examen-historia-revoluciones.html",
        "urlMac": "mac-examen-historia-revoluciones.html"
    }
],
  herramientas: [],
  clasesPerdidas: [],
  publicidad: [
    {
        "id": "ad-copias-lengua",
        "subjectId": "espanol",
        "title": "Copias Impresas de Lengua Española",
        "badge": "Servicio Escolar",
        "price": "$20 anticipado / $25 contra entrega",
        "description": "Por $20 pesos, Encardomy puede llevar las copias impresas. Para apartarlas se debe realizar el pago por adelantado mediante Clip. Al realizar el pago por Clip, enviar el comprobante por privado a Diego. Si prefieres pagar contra entrega: $25 pesos solicitando por WhatsApp.",
        "clipUrl": "https://pago.clip.mx/v3/5ada33a9-a3b7-4722-bb91-00dbbf4f27c6",
        "whatsapp": "52 5642834619",
        "whatsappMessage": "Hola, me gustaría solicitar las copias de Lengua Española ($25 contra entrega) para el grupo 415."
    },
    {
        "id": "ad-mapas-geografia",
        "subjectId": "geografia",
        "title": "Paquete de Mapas de Geografía (2 copias c/u)",
        "badge": "Uno nunca sabe",
        "price": "$15 pesos",
        "description": "Servicio: $15 pesos. ShaMinKet entrega 2 copias de cada mapa para el examen de Geografía (estados, capitales y alcaldías). ¡Uno nunca sabe cuando se necesita un repuesto! Solicítalo por WhatsApp contra entrega.",
        "whatsapp": "52 5642834619",
        "whatsappMessage": "Hola, me gustaría solicitar el paquete de mapas de Geografía (2 copias c/u por $15 pesos) para el grupo 415."
    },
    {
        "id": "ad-combo-lengua-historia",
        "subjectId": "general",
        "title": "Convocatoria Combinada: Lengua + Historia",
        "badge": "Paquete Ahorro",
        "price": "$30 pesos",
        "description": "Opción correspondiente para Lengua + Historia. Precio: $30 pesos. Pago: contra entrega. Para solicitarlo envía mensaje a WhatsApp.",
        "whatsapp": "52 5642834619",
        "whatsappMessage": "Hola, me gustaría solicitar el paquete combinado de Lengua + Historia por $30 pesos (contra entrega)."
    }
],

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

  _storageKey: "encardomy_central_academic_store_v3",

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
