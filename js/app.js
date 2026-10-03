/**
 * ENCARDOMY — MINWEB 415 | Unified Academic Engine (Mobile & iPad)
 * Motor Central Unificado de Lógica y Datos Académicos
 * 
 * Cumplimiento Estricto de la Especificación:
 * - Regla 70: Separación clara entre Interfaz y Datos/Lógica compartida (NO duplicar la aplicación).
 * - Reglas 62 y 63: Horario completo oficial SIHO grupo 415 y profesores en ambas interfaces.
 * - Reglas 66-69: Cambio automático instantáneo de tamaño/orientación sin recarga ni pérdida de datos.
 * - Reglas 72-73: Formularios funcionales, pedidos a WhatsApp (+52 55 7198 5641) y modal Clip.
 * - Regla 10: Hora Oficial de la Ciudad de México (America/Mexico_City).
 * - Luces navideñas en clase activa y audio navideño nativo Web Audio API.
 * - Tolerancias estrictas (20 min maestro, 10 min alumno) solo al inicio de clase.
 */

(function () {
  "use strict";

  // Prevenir inicializaciones duplicadas
  if (window.__ENCARDOMY_APP_INITIALIZED__) {
    return;
  }
  window.__ENCARDOMY_APP_INITIALIZED__ = true;

  // Estado global unificado de la aplicación
  const state = {
    section: localStorage.getItem("encardomy_section") || "A",
    selectedDay: 1,
    simulatedDate: null,
    orientation: "portrait",
    device: "mobile",
    audioCtx: null
  };

  // ==========================================================================
  // INICIALIZACIÓN PRINCIPAL
  // ==========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    initDeviceAndOrientation();
    initSection();
    initClockAndCountdown();
    initScheduleTabs();
    initSimulator();
    initSearch();
    initRequiredWorksModule();
    initDynamicPagesSync();
    initAcademicHubSync();
    renderSubjectAcademicModules();
    initOrderForms();
    initFeedbackForms();
    initChristmasSound();
    initSnowfall();
    highlightActiveNav();

    // Suscribirse a cambios en la fuente única de datos
    if (window.ENCARDOMY_DATA && ENCARDOMY_DATA.subscribe) {
      ENCARDOMY_DATA.subscribe(() => {
        renderApp();
      });
    }
  });

  // ==========================================================================
  // 1. DETECCIÓN AUTOMÁTICA DE TAMAÑO Y ORIENTACIÓN (Reglas 66-69)
  // ==========================================================================
  function initDeviceAndOrientation() {
    updateLayoutMetrics();

    // Escuchar el evento reactivo de device-detector y layout-engine
    window.addEventListener("screenSizeChanged", (e) => {
      if (e.detail) {
        state.device = e.detail.device || state.device;
        state.orientation = e.detail.orientation || state.orientation;
      }
      handleScreenChange();
    });

    window.addEventListener("interfaceChanged", (e) => {
      if (e.detail) {
        state.device = e.detail.interface || state.device;
        state.orientation = e.detail.orientation || state.orientation;
      }
      handleScreenChange();
    });

    window.addEventListener("resize", handleScreenChange, { passive: true });
    window.addEventListener("orientationchange", handleScreenChange, { passive: true });
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener("change", handleScreenChange);
    }
  }

  function updateLayoutMetrics() {
    const w = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
    const h = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
    const isLandscape = (w > h) || (window.matchMedia && window.matchMedia("(orientation: landscape)").matches);
    const orientationName = isLandscape ? "landscape" : "portrait";
    
    let deviceName = "mobile";
    if (window.LayoutEngine && window.LayoutEngine.currentInterface) {
      deviceName = window.LayoutEngine.currentInterface;
    } else if (w >= 1200) {
      deviceName = "desktop";
    } else if (w >= 768) {
      deviceName = "tablet";
    }

    state.orientation = orientationName;
    state.device = deviceName;

    document.documentElement.setAttribute("data-device", deviceName);
    document.documentElement.setAttribute("data-current-interface", deviceName);
    document.documentElement.setAttribute("data-orientation", orientationName);
    document.documentElement.setAttribute("data-ipad-orientation", orientationName);

    if (document.body) {
      document.body.setAttribute("data-device", deviceName);
      document.body.setAttribute("data-current-interface", deviceName);
      document.body.setAttribute("data-orientation", orientationName);
      document.body.setAttribute("data-ipad-orientation", orientationName);
    }

    // Actualizar badges de orientación si existen
    document.querySelectorAll(".ipad-orientation-badge, #ipad-orientation-badge").forEach(badge => {
      badge.textContent = isLandscape ? "⟳ Horizontal" : "⟲ Vertical";
      badge.title = `Resolución: ${w} × ${h} px (${deviceName.toUpperCase()})`;
    });
  }

  function handleScreenChange() {
    updateLayoutMetrics();
    // Re-renderizar componentes activos sin recargar ni alterar formularios
    updateClassStatus();
    renderSchedule();
  }

  // ==========================================================================
  // 2. HORA OFICIAL DE CIUDAD DE MÉXICO (America/Mexico_City) (Regla 10)
  // ==========================================================================
  function getCurrentTime() {
    return ENCARDOMY_DATA.getMexicoCityTime(state.simulatedDate);
  }

  function timeStringToMinutes(str) {
    if (!str) return 0;
    const parts = str.split(":").map(Number);
    return parts[0] * 60 + parts[1];
  }

  // ==========================================================================
  // 3. SELECCIÓN DE SECCIÓN A / B (Reglas 6, 20 y 71)
  // ==========================================================================
  function initSection() {
    // Si no hay sección elegida y existe el modal de bienvenida
    const modal = document.getElementById("section-modal");
    if (!localStorage.getItem("encardomy_section") && modal) {
      modal.classList.add("show");
    }

    const btnA = document.getElementById("btn-select-a");
    const btnB = document.getElementById("btn-select-b");
    const pillA = document.getElementById("pill-section-a");
    const pillB = document.getElementById("pill-section-b");
    const ipadBtnA = document.getElementById("ipad-sec-a");
    const ipadBtnB = document.getElementById("ipad-sec-b");
    const sideBtnA = document.getElementById("sidebar-sec-a");
    const sideBtnB = document.getElementById("sidebar-sec-b");

    if (btnA) btnA.addEventListener("click", () => setSection("A"));
    if (btnB) btnB.addEventListener("click", () => setSection("B"));
    if (pillA) pillA.addEventListener("click", () => setSection("A"));
    if (pillB) pillB.addEventListener("click", () => setSection("B"));
    if (ipadBtnA) ipadBtnA.addEventListener("click", () => setSection("A"));
    if (ipadBtnB) ipadBtnB.addEventListener("click", () => setSection("B"));
    if (sideBtnA) sideBtnA.addEventListener("click", () => setSection("A"));
    if (sideBtnB) sideBtnB.addEventListener("click", () => setSection("B"));

    document.querySelectorAll(".mac-segment-btn").forEach(btn => {
      btn.addEventListener("click", () => setSection(btn.getAttribute("data-section")));
    });

    updateSectionUI(state.section);
  }

  function setSection(sec) {
    state.section = sec;
    localStorage.setItem("encardomy_section", sec);

    const modal = document.getElementById("section-modal");
    if (modal) modal.classList.remove("show");

    updateSectionUI(sec);
    renderApp();
  }

  function updateSectionUI(sec) {
    const pairs = [
      [document.getElementById("pill-section-a"), document.getElementById("pill-section-b")],
      [document.getElementById("ipad-sec-a"), document.getElementById("ipad-sec-b")],
      [document.getElementById("sidebar-sec-a"), document.getElementById("sidebar-sec-b")]
    ];

    pairs.forEach(([btnA, btnB]) => {
      if (btnA && btnB) {
        if (sec === "A") {
          btnA.classList.add("active");
          btnB.classList.remove("active");
        } else {
          btnB.classList.add("active");
          btnA.classList.remove("active");
        }
      }
    });

    document.querySelectorAll(".mac-segment-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-section") === sec);
    });

    const macSecBadge = document.getElementById("mac-current-section-badge");
    if (macSecBadge) macSecBadge.textContent = "Sección " + sec;
  }

  // ==========================================================================
  // 4. ASOCIACIÓN OFICIAL DE PROFESORES POR MATERIA (Regla 63)
  // ==========================================================================
  function getProfessorForSubject(block, sec) {
    const currentSec = sec || state.section || "A";

    // Si el bloque cuenta con personalización por sección (ej. Orientación Educativa IV)
    if (block.customBySection && block.customBySection[currentSec] && block.customBySection[currentSec].prof) {
      return block.customBySection[currentSec].prof;
    }

    const subj = ENCARDOMY_DATA.subjects[block.subjectId];
    if (subj) {
      if (subj.professorsBySection && subj.professorsBySection[currentSec]) {
        return subj.professorsBySection[currentSec];
      }
      if (subj.professor) {
        return subj.professor;
      }
    }

    // Búsqueda en catálogo oficial de profesores SIHO
    if (ENCARDOMY_DATA.professors) {
      const match = ENCARDOMY_DATA.professors.find(p => 
        p.subjectId === block.subjectId && (p.section === "ALL" || p.section === currentSec)
      );
      if (match) return match.name;
    }

    return "Profesor oficial";
  }

  // ==========================================================================
  // 5. CLASE ACTUAL, TIEMPO RESTANTE, SIGUIENTE CLASE Y TOLERANCIAS (Reglas 10, 11)
  // ==========================================================================
  function updateClassStatus() {
    const now = getCurrentTime();
    const day = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = now.getSeconds();

    // Actualizar reloj CDMX en todos los encabezados y sidebars
    const hStr = String(now.getHours()).padStart(2, "0");
    const mStr = String(now.getMinutes()).padStart(2, "0");
    const sStr = String(now.getSeconds()).padStart(2, "0");
    const timeFull = `${hStr}:${mStr}:${sStr} CDMX`;
    const timeShort = `${hStr}:${mStr}:${sStr}`;

    const clockMob = document.getElementById("current-time-clock");
    if (clockMob) clockMob.textContent = timeFull;

    const clockIpad = document.getElementById("ipad-cdmx-clock");
    if (clockIpad) clockIpad.textContent = timeFull;

    const clockSidebar = document.getElementById("ipad-sidebar-cdmx-clock");
    if (clockSidebar) clockSidebar.textContent = timeShort;

    const clockMacTitle = document.getElementById("mac-titlebar-cdmx-clock");
    if (clockMacTitle) clockMacTitle.textContent = timeFull;

    const clockMacSidebar = document.getElementById("mac-sidebar-cdmx-clock");
    if (clockMacSidebar) clockMacSidebar.textContent = timeFull;

    document.querySelectorAll(".current-time-clock").forEach(el => el.textContent = timeFull);

    const isSchoolDay = day >= 1 && day <= 5;
    const daySchedule = isSchoolDay ? ENCARDOMY_DATA.schedule[day] : null;

    let activeBlock = null;
    let nextBlock = null;
    let minutesUntilNext = null;

    if (daySchedule) {
      for (let i = 0; i < daySchedule.length; i++) {
        const block = daySchedule[i];
        const startMin = timeStringToMinutes(block.start);
        const endMin = timeStringToMinutes(block.end);

        if (currentMinutes >= startMin && currentMinutes < endMin) {
          activeBlock = block;
        } else if (currentMinutes < startMin) {
          if (!nextBlock) {
            nextBlock = block;
            minutesUntilNext = startMin - currentMinutes;
          }
        }
      }
    }

    // Renderizar tarjetas de Clase Actual (Móvil e iPad)
    renderCurrentClassCard(activeBlock, isSchoolDay, currentMinutes, currentSeconds);

    // Condición de Siguiente Clase (Regla 10: SOLO si faltan 10 minutos o más para iniciar)
    const showNextClass = nextBlock && minutesUntilNext !== null && minutesUntilNext >= 10;
    renderNextClassCards(nextBlock, minutesUntilNext, showNextClass);

    // Condición de Tolerancias (20 min maestros, 10 min alumnos):
    // SOLO aplican al comienzo de una clase (primeros 20 minutos). Oculto fuera de clase.
    renderTolerances(activeBlock, currentMinutes, currentSeconds);

    // Resaltar con luces navideñas en el horario correspondiente
    highlightActiveScheduleBlocks(activeBlock, day);
  }

  function renderCurrentClassCard(block, isSchoolDay, currentMinutes, currentSeconds) {
    // Referencias Móvil
    const mCard = document.getElementById("current-class-card");
    const mTitle = document.getElementById("current-subject-title");
    const mMeta = document.getElementById("current-class-meta");
    const mCountdown = document.getElementById("current-countdown-digits");
    const mRoomAlert = document.getElementById("room-change-alert");
    const mRoomText = document.getElementById("room-change-text");
    const mGarland = document.getElementById("card-christmas-lights");

    // Referencias iPad
    const iCard = document.getElementById("ipad-current-class-card");
    const iTitle = document.getElementById("ipad-current-subject");
    const iMeta = document.getElementById("ipad-current-meta");
    const iCountdown = document.getElementById("ipad-current-countdown");
    const iRoomAlert = document.getElementById("ipad-room-change-alert");
    const iRoomText = document.getElementById("ipad-room-change-text");
    const iGarland = document.getElementById("ipad-card-christmas-lights");

    const macCard = document.getElementById("mac-current-class-card");
    const macTitle = document.getElementById("mac-current-subject");
    const macMeta = document.getElementById("mac-current-meta");
    const macCountdown = document.getElementById("mac-current-countdown");
    const macGarland = document.querySelector(".mac-lights-garland");

    const cards = [
      { card: mCard, title: mTitle, meta: mMeta, cd: mCountdown, alert: mRoomAlert, alertTxt: mRoomText, garland: mGarland, isIpad: false, isMac: false },
      { card: iCard, title: iTitle, meta: iMeta, cd: iCountdown, alert: iRoomAlert, alertTxt: iRoomText, garland: iGarland, isIpad: true, isMac: false },
      { card: macCard, title: macTitle, meta: macMeta, cd: macCountdown, alert: null, alertTxt: null, garland: macGarland, isIpad: false, isMac: true }
    ];

    cards.forEach(c => {
      if (!c.card || !c.title) return;

      if (!isSchoolDay) {
        c.title.textContent = "Fin de semana escolar";
        c.meta.innerHTML = `<span class="${c.isIpad ? 'ipad-pill' : 'meta-pill meta-pill-free'}">Sin sesiones programadas</span>`;
        if (c.cd) c.cd.textContent = "--:--";
        if (c.alert) c.alert.style.display = "none";
        if (c.garland) c.garland.style.display = "none";
        c.card.style.borderLeftColor = "var(--text-tertiary)";
        return;
      }

      if (!block) {
        c.title.textContent = "Sin clase activa";
        c.meta.innerHTML = `<span class="${c.isIpad ? 'ipad-pill' : 'meta-pill meta-pill-free'}">Fuera de horario de clases</span>`;
        if (c.cd) c.cd.textContent = "--:--";
        if (c.alert) c.alert.style.display = "none";
        if (c.garland) c.garland.style.display = "none";
        c.card.style.borderLeftColor = "var(--text-tertiary)";
        return;
      }

      // Activar guirnalda de luces navideñas
      if (c.garland) c.garland.style.display = "flex";

      const sec = state.section;
      let isFree = false;
      let label = block.subjectName;
      let salonText = block.salon;
      let isRoomChange = false;
      let roomChangeMsg = "";

      if (block.customBySection && block.customBySection[sec]) {
        const custom = block.customBySection[sec];
        if (custom.isFree) {
          isFree = true;
          label = custom.label;
          salonText = custom.salon || "—";
        } else {
          label = custom.label;
          salonText = custom.salon;
        }
      } else if (block.salonsBySection) {
        salonText = block.salonsBySection[sec] || block.salon;
      }

      const profName = isFree ? "Sin profesor asignado" : getProfessorForSubject(block, sec);

      // Cambio de aula programado en Física III
      if (block.roomChange && block.roomChange.hasChange) {
        isRoomChange = true;
        const firstStart = timeStringToMinutes(block.roomChange.firstHour.start);
        const firstEnd = timeStringToMinutes(block.roomChange.firstHour.end);
        const secondStart = timeStringToMinutes(block.roomChange.secondHour.start);
        const secondEnd = timeStringToMinutes(block.roomChange.secondHour.end);

        if (currentMinutes >= firstStart && currentMinutes < firstEnd) {
          salonText = `${block.roomChange.firstHour.salon} (1ª hora)`;
          roomChangeMsg = `En la 2ª hora (${block.roomChange.secondHour.start}) la clase cambia al salón <strong>${block.roomChange.secondHour.salon}</strong>.`;
        } else if (currentMinutes >= secondStart && currentMinutes < secondEnd) {
          salonText = `${block.roomChange.secondHour.salon} (2ª hora)`;
          roomChangeMsg = `Cambio de salón realizado. Salón actual: <strong>${block.roomChange.secondHour.salon}</strong>.`;
        }
      }

      const subjectObj = ENCARDOMY_DATA.subjects[block.subjectId];
      const themeColor = isFree ? "#8E8E93" : (subjectObj ? subjectObj.color : "var(--accent-gold)");
      c.card.style.borderLeftColor = themeColor;

      c.title.textContent = label;

      let metaHtml = "";
      if (c.isMac) {
        metaHtml = `
          <span class="mac-pill ${isFree ? '' : 'mac-pill-salon'}">Salón: ${salonText}</span>
          <span class="mac-pill mac-pill-prof">Docente: ${profName}</span>
          <span class="mac-pill">${block.start} - ${block.end}</span>
          ${block.isTwoHours ? '<span class="mac-pill" style="background: rgba(229,192,123,0.18); color: var(--mac-accent-gold);">2 Horas continuas</span>' : ''}
          ${isFree ? '<span class="mac-pill" style="background: rgba(142,142,147,0.25); color: #c7c7cc;">Clase Libre</span>' : ''}
        `;
      } else if (c.isIpad) {
        metaHtml = `
          <span class="ipad-pill ${isFree ? '' : 'ipad-pill-salon'}">Salón: ${salonText}</span>
          <span class="ipad-pill ipad-pill-prof\">Prof: ${profName}</span>
          <span class="ipad-pill">${block.start} - ${block.end}</span>
          ${block.isTwoHours ? '<span class="ipad-pill" style="background: rgba(229,192,123,0.2); color: var(--accent-gold);">2 Horas continuas</span>' : ''}
          ${isFree ? '<span class="ipad-pill" style="background: rgba(142,142,147,0.25); color: #c7c7cc;">Clase Libre</span>' : ''}
        `;
      } else {
        metaHtml = `
          <span class="meta-pill ${isFree ? 'meta-pill-free' : 'meta-pill-salon'}">Salón: ${salonText}</span>
          <span class="meta-pill meta-pill-prof">Prof: ${profName}</span>
          <span class="meta-pill">${block.start} - ${block.end}</span>
          ${block.isTwoHours ? '<span class="meta-pill tag-badge two-hours">2 Horas continuas</span>' : ''}
          ${isFree ? '<span class="meta-pill meta-pill-free">Clase Libre</span>' : ''}
        `;
      }
      c.meta.innerHTML = metaHtml;

      if (c.alert && c.alertTxt) {
        if (isRoomChange) {
          c.alert.style.display = "flex";
          c.alertTxt.innerHTML = roomChangeMsg;
        } else {
          c.alert.style.display = "none";
        }
      }

      const endMinutes = timeStringToMinutes(block.end);
      const totalRemainingSec = (endMinutes - currentMinutes) * 60 - currentSeconds;

      if (c.cd) {
        if (totalRemainingSec > 0) {
          const remMin = Math.floor(totalRemainingSec / 60);
          const remSec = totalRemainingSec % 60;
          c.cd.textContent = `${String(remMin).padStart(2, "0")}:${String(remSec).padStart(2, "0")}`;
        } else {
          c.cd.textContent = "00:00";
        }
      }
    });
  }

  function renderNextClassCards(block, minutesUntil, show) {
    const mCard = document.getElementById("next-class-card");
    const mTitle = document.getElementById("next-subject-name");
    const mMeta = document.getElementById("next-subject-meta");

    const iCard = document.getElementById("ipad-next-class-card");
    const iTitle = document.getElementById("ipad-next-subject");
    const iMeta = document.getElementById("ipad-next-meta");

    [ { card: mCard, title: mTitle, meta: mMeta }, { card: iCard, title: iTitle, meta: iMeta } ].forEach(c => {
      if (!c.card) return;
      if (!show || !block) {
        c.card.style.display = "none";
        return;
      }

      c.card.style.display = "block";
      const sec = state.section;
      let label = block.subjectName;
      let salon = block.salon;

      if (block.customBySection && block.customBySection[sec]) {
        label = block.customBySection[sec].label;
        salon = block.customBySection[sec].salon;
      } else if (block.salonsBySection) {
        salon = block.salonsBySection[sec] || block.salon;
      }

      const prof = getProfessorForSubject(block, sec);
      const subjectObj = ENCARDOMY_DATA.subjects[block.subjectId];
      if (subjectObj) {
        c.card.style.borderLeftColor = subjectObj.color;
      }

      if (c.title) c.title.textContent = label;
      if (c.meta) c.meta.textContent = `Inicia a las ${block.start} (en ${minutesUntil} min) • Salón: ${salon} • Prof: ${prof}`;
    });

    const macNextTitle = document.getElementById("mac-next-subject");
    const macNextMeta = document.getElementById("mac-next-meta");
    if (macNextTitle) {
      if (!show || !block) {
        macNextTitle.textContent = "No hay más clases hoy";
        if (macNextMeta) macNextMeta.textContent = "Consulta el horario del día siguiente";
      } else {
        const sec = state.section;
        let label = block.subjectName;
        let salon = block.salon;
        if (block.customBySection && block.customBySection[sec]) {
          label = block.customBySection[sec].label;
          salon = block.customBySection[sec].salon;
        } else if (block.salonsBySection) {
          salon = block.salonsBySection[sec] || block.salon;
        }
        const prof = getProfessorForSubject(block, sec);
        macNextTitle.textContent = label;
        if (macNextMeta) macNextMeta.textContent = `${block.start} hrs · Salón ${salon} · ${prof}`;
      }
    }
  }

  function renderTolerances(activeBlock, currentMinutes, currentSeconds) {
    const mTolerances = document.getElementById("tolerances-container");
    const mTeach = document.getElementById("tolerance-teacher-digits");
    const mStud = document.getElementById("tolerance-student-digits");

    const iTolerances = document.getElementById("ipad-tolerances-container");
    const iTeach = document.getElementById("ipad-tolerance-teacher");
    const iStud = document.getElementById("ipad-tolerance-student");

    const macTolProf = document.getElementById("mac-tol-prof");
    const macTolStudent = document.getElementById("mac-tol-student");

    const groups = [
      { cont: mTolerances, t: mTeach, s: mStud },
      { cont: iTolerances, t: iTeach, s: iStud }
    ];

    if (!activeBlock) {
      groups.forEach(g => { if (g.cont) g.cont.style.display = "none"; });
      if (macTolProf) macTolProf.textContent = "20 min";
      if (macTolStudent) macTolStudent.textContent = "10 min";
      return;
    }

    const startMin = timeStringToMinutes(activeBlock.start);
    let elapsedSeconds = (currentMinutes - startMin) * 60 + currentSeconds;

    if (activeBlock.roomChange && activeBlock.roomChange.hasChange) {
      const secondStart = timeStringToMinutes(activeBlock.roomChange.secondHour.start);
      if (currentMinutes >= secondStart) {
        elapsedSeconds = (currentMinutes - secondStart) * 60 + currentSeconds;
      }
    }

    // Tolerancia SOLO en los primeros 20 minutos de clase
    const isBeginning = elapsedSeconds >= 0 && elapsedSeconds < 20 * 60;

    if (!isBeginning) {
      groups.forEach(g => { if (g.cont) g.cont.style.display = "none"; });
      if (macTolProf) macTolProf.textContent = "20 min";
      if (macTolStudent) macTolStudent.textContent = "10 min";
      return;
    }

    const teacherRemSec = Math.max(0, (20 * 60) - elapsedSeconds);
    const tM = Math.floor(teacherRemSec / 60);
    const tS = teacherRemSec % 60;
    const tStr = `${String(tM).padStart(2, "0")}:${String(tS).padStart(2, "0")}`;

    const studentRemSec = Math.max(0, (10 * 60) - elapsedSeconds);
    const sM = Math.floor(studentRemSec / 60);
    const sS = studentRemSec % 60;
    const sStr = `${String(sM).padStart(2, "0")}:${String(sS).padStart(2, "0")}`;

    groups.forEach(g => {
      if (g.cont) g.cont.style.display = "block";
      if (g.t) g.t.textContent = tStr;
      if (g.s) g.s.textContent = sStr;
    });

    if (macTolProf) macTolProf.textContent = tStr;
    if (macTolStudent) macTolStudent.textContent = sStr;
  }

  function highlightActiveScheduleBlocks(activeBlock, currentDay) {
    const isSameDay = state.selectedDay === currentDay;

    // Resaltado móvil
    document.querySelectorAll(".schedule-block-card").forEach(card => {
      if (isSameDay && activeBlock && card.dataset.start === activeBlock.start && card.dataset.end === activeBlock.end) {
        card.classList.add("is-active-subject");
      } else {
        card.classList.remove("is-active-subject");
      }
    });

    // Resaltado iPad
    document.querySelectorAll(".ipad-block-card").forEach(card => {
      if (isSameDay && activeBlock && card.dataset.start === activeBlock.start && card.dataset.end === activeBlock.end) {
        card.classList.add("is-active-subject");
      } else {
        card.classList.remove("is-active-subject");
      }
    });

    // Resaltado Mac
    document.querySelectorAll(".mac-block-card").forEach(card => {
      if (isSameDay && activeBlock && card.dataset.start === activeBlock.start && card.dataset.end === activeBlock.end) {
        card.classList.add("is-active-now");
      } else {
        card.classList.remove("is-active-now");
      }
    });
  }

  function initClockAndCountdown() {
    updateClassStatus();
    setInterval(updateClassStatus, 1000);
  }

  // ==========================================================================
  // 6. RENDERIZADO DEL HORARIO SEMANAL COMPLETO (Regla 62)
  // Celular + iPad utilizan exactamente los mismos datos académicos SIHO del Grupo 415
  // ==========================================================================
  function initScheduleTabs() {
    const today = getCurrentTime().getDay();
    state.selectedDay = (today >= 1 && today <= 5) ? today : 1;

    // Pestañas móviles
    const mobileTabs = document.querySelectorAll(".day-tab-btn");
    mobileTabs.forEach(tab => {
      const d = parseInt(tab.dataset.day, 10);
      if (d === state.selectedDay) tab.classList.add("active");
      else tab.classList.remove("active");

      tab.addEventListener("click", () => {
        selectScheduleDay(d);
      });
    });

    // Pestañas iPad
    const ipadTabs = document.querySelectorAll(".ipad-day-btn");
    ipadTabs.forEach(tab => {
      const d = parseInt(tab.dataset.day, 10);
      if (d === state.selectedDay) tab.classList.add("active");
      else tab.classList.remove("active");

      tab.addEventListener("click", () => {
        selectScheduleDay(d);
      });
    });

    // Pestañas Mac
    const macTabs = document.querySelectorAll(".mac-day-btn");
    macTabs.forEach(tab => {
      const d = parseInt(tab.dataset.day, 10);
      if (d === state.selectedDay) tab.classList.add("active");
      else tab.classList.remove("active");

      tab.addEventListener("click", () => {
        selectScheduleDay(d);
      });
    });

    renderSchedule();
  }

  function selectScheduleDay(dayNumber) {
    state.selectedDay = dayNumber;

    document.querySelectorAll(".day-tab-btn").forEach(t => {
      t.classList.toggle("active", parseInt(t.dataset.day, 10) === dayNumber);
    });

    document.querySelectorAll(".ipad-day-btn").forEach(t => {
      t.classList.toggle("active", parseInt(t.dataset.day, 10) === dayNumber);
    });

    document.querySelectorAll(".mac-day-btn").forEach(t => {
      t.classList.toggle("active", parseInt(t.dataset.day, 10) === dayNumber);
    });

    renderSchedule();
    updateClassStatus();
  }

  function renderSchedule() {
    const day = state.selectedDay;
    const blocks = ENCARDOMY_DATA.schedule[day] || [];
    const sec = state.section || "A";

    renderMobileScheduleList(blocks, sec);
    renderIpadScheduleGrid(blocks, sec);
    renderMacScheduleGrid(blocks, sec);
  }

  // Horario Formato Celular (Lista Vertical)
  function renderMobileScheduleList(blocks, sec) {
    const list = document.getElementById("schedule-blocks-list");
    if (!list) return;

    list.innerHTML = "";

    if (blocks.length === 0) {
      list.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-state-icon">☕</div>
          <div class="empty-state-text">Sin clases en este día</div>
          <div class="empty-state-subtext">Disfruta tu descanso.</div>
        </div>
      `;
      return;
    }

    blocks.forEach(block => {
      let isFree = false;
      let label = block.subjectName;
      let salonText = block.salon;
      let roomChangeBadge = "";

      if (block.customBySection && block.customBySection[sec]) {
        const custom = block.customBySection[sec];
        if (custom.isFree) {
          isFree = true;
          label = custom.label;
          salonText = custom.salon || "—";
        } else {
          label = custom.label;
          salonText = custom.salon;
        }
      } else if (block.salonsBySection) {
        salonText = block.salonsBySection[sec] || block.salon;
      }

      if (block.roomChange && block.roomChange.hasChange) {
        roomChangeBadge = `<span class="tag-badge room-change">${block.roomChange.label}</span>`;
      }

      const profName = isFree ? "Sin profesor asignado" : getProfessorForSubject(block, sec);
      const subjectObj = ENCARDOMY_DATA.subjects[block.subjectId];
      const blockColor = isFree ? "#8E8E93" : (subjectObj ? subjectObj.color : "#2997FF");

      const card = document.createElement("div");
      card.className = "schedule-block-card";
      card.dataset.start = block.start;
      card.dataset.end = block.end;
      card.style.setProperty("--block-color", blockColor);

      card.innerHTML = `
        <div class="schedule-block-time">
          <span class="time-start">${block.start}</span>
          <span class="time-end">${block.end}</span>
          <span class="time-duration">${block.durationMinutes} min</span>
        </div>
        <div class="schedule-block-info">
          <div class="schedule-block-title" style="color: ${isFree ? 'var(--text-secondary)' : 'var(--text-primary)'}">
            ${escapeHtml(label)}
          </div>
          <div class="schedule-block-prof">Prof: ${escapeHtml(profName)}</div>
          <div class="schedule-block-meta">
            <span class="tag-badge ${isFree ? 'free-class' : ''}">
              ${isFree ? 'Libre' : 'Salón: ' + escapeHtml(salonText)}
            </span>
            ${block.isTwoHours ? '<span class="tag-badge two-hours">2 Horas</span>' : ''}
            ${roomChangeBadge}
          </div>
        </div>
      `;

      card.style.cursor = "pointer";
      card.title = "Toca para ver información detallada de la materia y profesor";
      card.addEventListener("click", () => {
        openScheduleDetailModal(block, label, salonText, profName, blockColor, isFree);
      });

      list.appendChild(card);
    });
  }

  // Horario Formato iPad (Cuadrícula Amplia de Tarjetas con Apertura de Ficha Técnica)
  
  // Horario Formato Mac (Cuadrícula macOS de Escritorio)
  function renderMacScheduleGrid(blocks, sec) {
    const grid = document.getElementById("mac-schedule-grid");
    if (!grid) return;

    grid.innerHTML = "";

    if (blocks.length === 0) {
      grid.innerHTML = '<div class="mac-hub-empty" style="grid-column: 1 / -1;"><p>No hay bloques registrados para este día.</p></div>';
      return;
    }

    blocks.forEach(block => {
      let isFree = false;
      let label = block.subjectName;
      let salonText = block.salon;
      let roomBadge = "";

      if (block.customBySection && block.customBySection[sec]) {
        const custom = block.customBySection[sec];
        if (custom.isFree) {
          isFree = true;
          label = custom.label;
          salonText = custom.salon || "—";
        } else {
          label = custom.label;
          salonText = custom.salon;
        }
      } else if (block.salonsBySection) {
        salonText = block.salonsBySection[sec] || block.salon;
      }

      if (block.roomChange && block.roomChange.hasChange) {
        roomBadge = '<div class="mac-room-change-badge">⚠️ ' + escapeHtml(block.roomChange.label) + '</div>';
      }

      const profName = isFree ? "Sin profesor asignado" : getProfessorForSubject(block, sec);
      const subjectObj = ENCARDOMY_DATA.subjects[block.subjectId];
      const blockColor = isFree ? "#8E8E93" : (subjectObj ? subjectObj.color : "#2997FF");

      const card = document.createElement("div");
      card.className = "mac-block-card";
      card.dataset.start = block.start;
      card.dataset.end = block.end;
      card.dataset.subject = label;
      card.style.setProperty("--block-color", blockColor);
      card.style.cursor = "pointer";

      let twoHoursBadge = "";
      if (block.isTwoHours) {
        twoHoursBadge = '<span class="mac-block-badge">2 Horas continuas</span>';
      }

      card.innerHTML = 
        '<div class="mac-block-time-row">' +
          '<span class="mac-block-hours">' + block.start + ' – ' + block.end + '</span>' +
          twoHoursBadge +
        '</div>' +
        '<h3 class="mac-block-subject">' + escapeHtml(label) + '</h3>' +
        '<p class="mac-block-prof">' + escapeHtml(profName) + '</p>' +
        roomBadge +
        '<div class="mac-block-footer">' +
          '<span class="mac-block-room">Salón ' + escapeHtml(salonText) + '</span>' +
          '<span class="mac-block-tag">Duración: ' + block.durationMinutes + ' min</span>' +
        '</div>';

      card.addEventListener("click", () => {
        openScheduleDetailModal(block, label, salonText, profName, blockColor, isFree);
      });

      grid.appendChild(card);
    });
  }

  function renderIpadScheduleGrid(blocks, sec) {
    const grid = document.getElementById("ipad-schedule-grid");
    if (!grid) return;

    grid.innerHTML = "";

    if (blocks.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--surface-glass-card); border-radius: var(--radius-lg); border: 1px solid var(--surface-glass-border);">
          <div style="font-size: 32px; margin-bottom: 10px;">☕</div>
          <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">Sin clases programadas en este día</div>
          <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Fin de semana de descanso.</div>
        </div>
      `;
      return;
    }

    blocks.forEach(block => {
      let isFree = false;
      let label = block.subjectName;
      let salonText = block.salon;
      let roomBadge = "";

      if (block.customBySection && block.customBySection[sec]) {
        const custom = block.customBySection[sec];
        if (custom.isFree) {
          isFree = true;
          label = custom.label;
          salonText = custom.salon || "—";
        } else {
          label = custom.label;
          salonText = custom.salon;
        }
      } else if (block.salonsBySection) {
        salonText = block.salonsBySection[sec] || block.salon;
      }

      if (block.roomChange && block.roomChange.hasChange) {
        roomBadge = `<span class="ipad-pill" style="background: rgba(255,149,0,0.2); color: #ffa94d;">${block.roomChange.label}</span>`;
      }

      const profName = isFree ? "Sin profesor asignado" : getProfessorForSubject(block, sec);
      const subjectObj = ENCARDOMY_DATA.subjects[block.subjectId];
      const blockColor = isFree ? "#8E8E93" : (subjectObj ? subjectObj.color : "#2997FF");

      const card = document.createElement("div");
      card.className = "ipad-block-card";
      card.dataset.start = block.start;
      card.dataset.end = block.end;
      card.style.setProperty("--block-color", blockColor);
      card.style.cursor = "pointer";
      card.title = "Toca para ver detalles de la materia y profesor";

      card.innerHTML = `
        <div class="ipad-block-time-row">
          <span class="ipad-block-hours">${block.start} - ${block.end}</span>
          <span class="ipad-block-duration">${block.durationMinutes} min</span>
        </div>
        <div class="ipad-block-subject" style="color: ${isFree ? 'var(--text-secondary)' : 'var(--text-primary)'}">
          ${escapeHtml(label)}
        </div>
        <div class="ipad-block-prof">
          Prof: ${escapeHtml(profName)}
        </div>
        <div class="ipad-meta-row" style="margin-bottom: 0;">
          <span class="ipad-pill ${isFree ? '' : 'ipad-pill-salon'}">
            ${isFree ? 'Libre' : 'Salón: ' + escapeHtml(salonText)}
          </span>
          ${block.isTwoHours ? '<span class="ipad-pill" style="background: rgba(229,192,123,0.18); color: var(--accent-gold);">2 Horas</span>' : ''}
          ${roomBadge}
        </div>
      `;

      // Al tocar una tarjeta del horario en iPad, abrir ficha académica detallada
      card.addEventListener("click", () => {
        openScheduleDetailModal(block, label, salonText, profName, blockColor, isFree);
      });

      grid.appendChild(card);
    });
  }

  // Ficha detallada de materia y profesor al pulsar en el horario
  function openScheduleDetailModal(block, label, salon, prof, color, isFree) {
    const subj = ENCARDOMY_DATA.subjects[block.subjectId];
    let pageLink = "";
    if (subj && subj.hasOwnPage) {
      pageLink = `
        <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--surface-glass-border-subtle);">
          <a href="${subj.pageUrl}" class="btn-primary-ios" style="display: inline-block; text-decoration: none; padding: 8px 16px; font-size: 13.5px;">
            Ir al Módulo de ${subj.name} →
          </a>
        </div>
      `;
    }

    const detailsHtml = `
      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 14.5px; line-height: 1.5;">
        <div><strong>Profesor Oficial:</strong> ${escapeHtml(prof)}</div>
        <div><strong>Horario de Sesión:</strong> ${block.start} a ${block.end} (${block.durationMinutes} minutos${block.isTwoHours ? ' • 2 horas consecutivas' : ''})</div>
        <div><strong>Salón Oficial:</strong> ${escapeHtml(salon)}</div>
        ${block.roomChange && block.roomChange.hasChange ? `
          <div style="background: rgba(255, 149, 0, 0.15); border-left: 4px solid #ff9500; padding: 10px; border-radius: 4px; font-size: 13.5px; color: #ffd8a8;">
            <strong>⚠️ Cambio de Aula Oficial:</strong><br>${block.roomChange.label}
          </div>
        ` : ''}
        ${pageLink}
      </div>
    `;

    const currentInterface = document.documentElement.getAttribute("data-current-interface") || state.device;
    const macBackdrop = document.getElementById("mac-detail-modal");
    const ipadBackdrop = document.getElementById("ipad-detail-modal");

    if (currentInterface === "desktop" && macBackdrop) {
      const macTitle = document.getElementById("mac-modal-title");
      const macBody = document.getElementById("mac-modal-body");
      if (macTitle) macTitle.textContent = label;
      if (macBody) macBody.innerHTML = detailsHtml;
      macBackdrop.classList.add("show");
      return;
    }

    if (ipadBackdrop) {
      const titleElem = document.getElementById("ipad-modal-title");
      const bodyElem = document.getElementById("ipad-modal-body");
      if (titleElem) {
        titleElem.textContent = label;
        titleElem.style.color = color || "var(--accent-gold)";
      }
      if (bodyElem) bodyElem.innerHTML = detailsHtml;
      ipadBackdrop.classList.add("show");
    }
  }

  // Cerrar modales al hacer clic fuera o presionar Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".ipad-modal-backdrop, .mac-modal-backdrop").forEach(m => m.classList.remove("show"));
    }
  });
  document.querySelectorAll(".ipad-modal-backdrop, .mac-modal-backdrop").forEach(m => {
    m.addEventListener("click", (e) => {
      if (e.target === m) m.classList.remove("show");
    });
  });

  // ==========================================================================
  // 7. BUSCADOR INTELIGENTE DE PROFESORES (Regla 63)
  // Celular + iPad + Mac comparten la base de datos completa de profesores del Grupo 415
  // ==========================================================================
  let activeProfessorQuery = "";

  function initSearch() {
    const inputMob = document.getElementById("search-professors-input");
    const contMob = document.getElementById("search-results-container");

    const inputIpad = document.getElementById("ipad-prof-search-input");
    const contIpad = document.getElementById("ipad-prof-results-container");

    const inputMac = document.getElementById("mac-prof-search-input");
    const contMac = document.getElementById("mac-prof-results-container");

    const allInputs = [inputMob, inputIpad, inputMac].filter(Boolean);

    allInputs.forEach(inputElem => {
      inputElem.addEventListener("input", (e) => {
        const query = e.target.value;
        activeProfessorQuery = query;

        // Sincronizar el texto en los otros inputs para que no se pierda al redimensionar
        allInputs.forEach(other => {
          if (other !== inputElem) other.value = query;
        });

        updateAllProfessorContainers(query);
      });
    });

    updateAllProfessorContainers(activeProfessorQuery);
  }

  function updateAllProfessorContainers(query) {
    const contMob = document.getElementById("search-results-container");
    const contIpad = document.getElementById("ipad-prof-results-container");
    const contMac = document.getElementById("mac-prof-results-container");

    if (contMob) renderSearchResults(query, contMob, "mobile");
    if (contIpad) renderSearchResults(query, contIpad, "tablet");
    if (contMac) renderSearchResults(query, contMac, "desktop");
  }

  function normalize(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function renderSearchResults(query, container, layout) {
    const qNorm = normalize(query).trim();
    const professors = ENCARDOMY_DATA.professors || [];
    const currentSec = state.section || "A";

    const matches = professors.filter(p => {
      if (!qNorm) return true;
      const subj = ENCARDOMY_DATA.subjects[p.subjectId];
      const nameMatch = normalize(p.name).includes(qNorm);
      const subjectMatch = normalize(p.subjectName).includes(qNorm);
      const aliasMatch = subj && subj.aliases && subj.aliases.some(alias => normalize(alias).includes(qNorm) || qNorm.includes(normalize(alias)));
      const salonMatch = p.salons && p.salons.some(s => normalize(s).includes(qNorm));
      return nameMatch || subjectMatch || aliasMatch || salonMatch;
    });

    container.innerHTML = "";

    if (matches.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1; padding: 36px 20px;">
          <div class="empty-state-icon" style="font-size: 32px;">🔍</div>
          <div class="empty-state-text" style="font-size: 16px; font-weight: 700;">No se encontraron resultados</div>
          <div class="empty-state-subtext" style="margin-top: 6px;">Prueba buscando por nombre (ej. Saúl, Gabriela, Karina), materia (Español, Inglés, Mate) o salón oficial.</div>
        </div>
      `;
      return;
    }

    const listWrapper = document.createElement("div");
    if (layout === "tablet") {
      listWrapper.className = "tablet-cards-grid";
      listWrapper.style.display = "grid";
      listWrapper.style.gridTemplateColumns = "repeat(auto-fill, minmax(300px, 1fr))";
      listWrapper.style.gap = "14px";
    } else if (layout === "desktop") {
      listWrapper.className = "mac-professors-grid";
      listWrapper.style.display = "grid";
      listWrapper.style.gridTemplateColumns = "repeat(auto-fill, minmax(320px, 1fr))";
      listWrapper.style.gap = "16px";
    } else {
      listWrapper.className = "professors-list";
    }

    matches.forEach(item => {
      const subj = ENCARDOMY_DATA.subjects[item.subjectId];
      const color = subj ? subj.color : "var(--accent-gold)";
      const isSecMatch = item.section === "ALL" || item.section === currentSec;

      const card = document.createElement("div");
      if (layout === "desktop") {
        card.className = "mac-block-card";
        card.style.setProperty("--block-color", color);
        card.style.padding = "18px";
        card.style.marginBottom = "0";

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: ${color}; letter-spacing: 0.5px;">${escapeHtml(item.subjectName)}</span>
            ${item.section !== 'ALL' ? `<span class="mac-block-badge">Sección ${item.section}</span>` : ''}
          </div>
          <h3 style="font-size: 17px; font-weight: 800; color: var(--mac-text-primary); margin: 0 0 6px 0;">${escapeHtml(item.name)}</h3>
          <div style="font-size: 13px; color: var(--mac-text-secondary); margin-bottom: 6px;"><strong>Salones:</strong> ${escapeHtml(item.salons.join(" • "))}</div>
          <div style="font-size: 12px; color: var(--mac-text-tertiary); line-height: 1.4;">${escapeHtml(item.notes)}</div>
          ${subj && subj.hasOwnPage ? `<div style="margin-top: 10px;"><a href="${subj.pageUrl}" class="mac-btn-tool" style="display:inline-block; font-size:12px; text-decoration:none;">Módulo de ${subj.name} →</a></div>` : ''}
        `;
      } else if (layout === "tablet") {
        card.className = "ipad-block-card";
        card.style.setProperty("--block-color", color);
        card.style.padding = "18px";
        card.style.marginBottom = "0";

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: ${color}; letter-spacing: 0.5px;">${escapeHtml(item.subjectName)}</span>
            ${item.section !== 'ALL' ? `<span class="ipad-pill ${isSecMatch ? 'two-hours' : ''}" style="font-size: 11px;">Sección ${item.section}</span>` : ''}
          </div>
          <div style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">${escapeHtml(item.name)}</div>
          <div style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 8px;"><strong>Salones oficiales:</strong> ${escapeHtml(item.salons.join(" • "))}</div>
          <div style="font-size: 12.5px; color: var(--text-tertiary); line-height: 1.45;">${escapeHtml(item.notes)}</div>
          ${subj && subj.hasOwnPage ? `<div style="margin-top: 12px;"><a href="${subj.pageUrl}" class="ipad-pill" style="text-decoration:none; display:inline-block; font-size:12px; color:var(--accent-gold); background:rgba(245,197,24,0.15);">Ver módulo de ${subj.name} →</a></div>` : ''}
        `;
      } else {
        card.className = "glass-card";
        card.style.borderLeft = "5px solid " + color;
        card.style.marginBottom = "12px";

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${color};">${escapeHtml(item.subjectName)}</span>
            ${item.section !== 'ALL' ? `<span class="tag-badge ${isSecMatch ? 'two-hours' : ''}">Sección ${item.section}</span>` : ''}
          </div>
          <div style="font-size: 17px; font-weight: 700; margin-bottom: 6px; color: var(--text-primary);">${escapeHtml(item.name)}</div>
          <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;"><strong>Salones:</strong> ${escapeHtml(item.salons.join(" • "))}</div>
          <div style="font-size: 12px; color: var(--text-tertiary); line-height: 1.35;">${escapeHtml(item.notes)}</div>
          ${subj && subj.hasOwnPage ? `<div style="margin-top: 10px;"><a href="${subj.pageUrl}" class="ipad-pill" style="text-decoration:none; display:inline-block; font-size:12px; color:var(--accent-gold);">Ir al Módulo de ${subj.name} →</a></div>` : ''}
        `;
      }

      listWrapper.appendChild(card);
    });

    container.appendChild(listWrapper);
  }

  // ==========================================================================
  // 8. GESTIÓN DE TRABAJOS NECESARIOS (Historia, Español, Física)
  // Celular + iPad + Mac comparten el almacenamiento y persistencia de entregas clave
  // ==========================================================================
  function initRequiredWorksModule() {
    const anyContainer = document.querySelector("[id*='works-container']");
    const subjectId = anyContainer ? anyContainer.dataset.subjectId : null;
    if (!anyContainer || !subjectId) return;

    const storageKey = "encardomy_trabajos_" + subjectId;

    function getWorks() {
      try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        if (Array.isArray(stored) && stored.length > 0) return stored;
      } catch (e) {}

      // Entregas y trabajos oficiales por defecto para cada materia
      if (subjectId === "historia") {
        return [
          {
            id: 1,
            title: "Actividad: Cuarta Revolución Industrial",
            date: "2026-10-03",
            notes: "Investigación y reflexión sobre video oficial. Nomenclatura en PDF obligatoria.",
            completed: false
          },
          {
            id: 2,
            title: "Presentación Electrónica por Equipos",
            date: "2026-10-04",
            notes: "Equipos de 4 a 5. Opción Classroom o Metodología 1+3=1. Formatos .pptx, .ppt o .pdf.",
            completed: false
          },
          {
            id: 3,
            title: "2 Epístola Histórica",
            date: "2026-10-05",
            notes: "Cierre de Classroom el lunes 5 de oct. Entrega física de cartas el jueves 8 de oct.",
            completed: false
          }
        ];
      } else if (subjectId === "fisica") {
        return [
          {
            id: 101,
            title: "Investigación: Suma de Vectores por el Método del Polígono",
            date: "2026-10-05",
            notes: "Investigar todo sobre la suma de vectores por el método del polígono.",
            completed: false
          }
        ];
      } else if (subjectId === "espanol") {
        return [
          {
            id: 201,
            title: "Descarga o Adquisición de Copias para Clase",
            date: "2026-10-05",
            notes: "Descargar de Google Drive o comprar en la gomita / Encardomy.",
            completed: false
          }
        ];
      }
      return [];
    }

    function saveWorks(works) {
      localStorage.setItem(storageKey, JSON.stringify(works));
      renderWorksList();
    }

    function renderWorksList() {
      const lists = document.querySelectorAll("#required-works-list, #ipad-works-list, #mac-works-list");
      if (lists.length === 0) return;

      const works = getWorks();

      lists.forEach(listElem => {
        listElem.innerHTML = "";

        if (works.length === 0) {
          listElem.innerHTML = `
            <div class="empty-state-card" style="padding: 24px 16px; margin: 8px 0;">
              <div class="empty-state-icon" style="font-size: 24px;">📌</div>
              <div class="empty-state-text" style="font-size: 14px;">No hay trabajos necesarios registrados.</div>
              <div class="empty-state-subtext">Agrega trabajos obligatorios o entregas clave usando el botón de arriba.</div>
            </div>
          `;
          return;
        }

        works.forEach((w, index) => {
          const item = document.createElement("div");
          item.className = "work-item-card " + (w.completed ? "completed" : "");

          item.innerHTML = `
            <input type="checkbox" class="work-checkbox" ${w.completed ? "checked" : ""} aria-label="Marcar como entregado">
            <div class="work-details">
              <div class="work-title">${escapeHtml(w.title)}</div>
              <div class="work-meta">
                <span class="work-meta-badge">Entrega: ${escapeHtml(w.date || 'Sin fecha')}</span>
                ${w.notes ? `<span>${escapeHtml(w.notes)}</span>` : ''}
              </div>
            </div>
            <button type="button" class="delete-work-btn" title="Eliminar trabajo" aria-label="Eliminar trabajo">✕</button>
          `;

          const chk = item.querySelector(".work-checkbox");
          chk.addEventListener("change", () => {
            works[index].completed = chk.checked;
            saveWorks(works);
          });

          const delBtn = item.querySelector(".delete-work-btn");
          delBtn.addEventListener("click", () => {
            works.splice(index, 1);
            saveWorks(works);
          });

          listElem.appendChild(item);
        });
      });
    }

    // Configurar formularios en móvil, iPad y Mac
    const formGroups = [
      { toggle: document.getElementById("toggle-add-work-btn"), form: document.getElementById("add-work-form"), save: document.getElementById("save-work-btn"), title: document.getElementById("work-title-input"), date: document.getElementById("work-date-input"), notes: document.getElementById("work-notes-input") },
      { toggle: document.getElementById("ipad-toggle-work-btn"), form: document.getElementById("ipad-add-work-form"), save: document.getElementById("ipad-save-work-btn"), title: document.getElementById("ipad-work-title-input"), date: document.getElementById("ipad-work-date-input"), notes: document.getElementById("ipad-work-notes-input") },
      { toggle: document.getElementById("mac-toggle-work-btn"), form: document.getElementById("mac-add-work-form"), save: document.getElementById("mac-save-work-btn"), title: document.getElementById("mac-work-title-input"), date: document.getElementById("mac-work-date-input"), notes: document.getElementById("mac-work-notes-input") }
    ];

    formGroups.forEach(grp => {
      if (grp.toggle && grp.form) {
        grp.toggle.addEventListener("click", () => {
          grp.form.classList.toggle("show");
        });
      }

      if (grp.save && grp.title) {
        grp.save.addEventListener("click", () => {
          const title = grp.title.value.trim();
          const date = grp.date ? grp.date.value : "";
          const notes = grp.notes ? grp.notes.value.trim() : "";

          if (!title) {
            alert("Por favor escribe el título del trabajo.");
            return;
          }

          const works = getWorks();
          works.unshift({
            id: Date.now(),
            title: title,
            date: date,
            notes: notes,
            completed: false,
            createdAt: new Date().toISOString()
          });

          saveWorks(works);

          grp.title.value = "";
          if (grp.date) grp.date.value = "";
          if (grp.notes) grp.notes.value = "";
          if (grp.form) grp.form.classList.remove("show");
        });
      }
    });

    renderWorksList();
  }

  // ==========================================================================
  // 9. SINCRONIZACIÓN CENTRALIZADA DE PÁGINAS ACADÉMICAS (Avisos, Tareas, Exámenes)
  // Celular + iPad + Mac conectados a la Fuente Central de Datos (Single Source of Truth)
  // ==========================================================================
  function initDynamicPagesSync() {
    renderAvisosView();
    renderTareasView();
    renderExamenesView();
  }

    function getItemDetailUrl(item, deviceOverride) {
    if (!item) return "index.html";
    const currentInterface = deviceOverride || document.documentElement.getAttribute("data-current-interface") || state.device;
    if (currentInterface === "desktop" || state.device === "desktop") {
      return item.urlMac || `mac-${item.id}.html`;
    }
    if (currentInterface === "tablet" || state.device === "tablet") {
      return item.urlIpad || `ipad-${item.id}.html`;
    }
    return item.urlMobile || `${item.id}.html`;
  }
  window.getItemDetailUrl = getItemDetailUrl;

  function renderAvisosView() {
    const targets = document.querySelectorAll("#avisos-empty-state, #ipad-avisos-empty-state, #mac-avisos-empty-state");
    if (targets.length === 0) return;

    const avisos = ENCARDOMY_DATA.getAvisos("all", "all", false);
    if (avisos.length > 0) {
      targets.forEach(emptyState => {
        const parent = emptyState.parentElement;
        if (!parent) return;
        const isMac = emptyState.id.includes("mac");
        const isIpad = emptyState.id.includes("ipad");
        const dev = isMac ? "desktop" : (isIpad ? "tablet" : "mobile");

        let html = '<div class="schedule-list tablet-cards-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">';
        avisos.forEach(a => {
          const subj = ENCARDOMY_DATA.subjects[a.subjectId];
          const color = subj ? subj.color : "var(--accent-gold)";
          const detailUrl = getItemDetailUrl(a, dev);

          html += `
            <div class="glass-card" style="border-left: 5px solid ${color}; margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: ${color}; letter-spacing: 0.5px;">
                    ${escapeHtml(a.subjectName || '')}
                  </span>
                  <span style="font-size: 11px; color: var(--text-tertiary);">
                    ${escapeHtml(a.date || '')}
                  </span>
                </div>
                <h3 style="font-size: 16.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; line-height: 1.3;">
                  <a href="${detailUrl}" style="color: inherit; text-decoration: none;">${escapeHtml(a.title)}</a>
                </h3>
                <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.45; margin-bottom: 12px;">
                  ${escapeHtml(a.summary || a.content || '')}
                </p>
                ${a.location ? `<div style="font-size: 12px; color: var(--accent-gold); margin-bottom: 10px;">📍 ${escapeHtml(a.location)}</div>` : ''}
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06);">
                <a href="${detailUrl}" class="ipad-btn-action" style="padding: 7px 14px; font-size: 12.5px; font-weight: 700; text-decoration: none; background: var(--accent-gold); color: #04140b; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;">
                  <span>Más información →</span>
                </a>
                ${a.calendarEvent ? `<button type="button" class="ipad-btn-action" style="padding: 6px 12px; font-size: 12px; background: rgba(229,192,123,0.15); color: var(--accent-gold); cursor: pointer;" onclick='window.addCalendarEvent(${JSON.stringify(a.calendarEvent)})'>📅 Calendario</button>` : ''}
                ${a.locationUrl ? `<a href="${a.locationUrl}" target="_blank" rel="noopener noreferrer" class="ipad-btn-action" style="padding: 6px 12px; font-size: 12px; text-decoration: none; color: #64D2FF;">📍 Mapa</a>` : ''}
              </div>
            </div>
          `;
        });
        html += '</div>';
        parent.innerHTML = html;
      });
    }
  }

  function renderTareasView() {
    const targets = document.querySelectorAll("#tareas-empty-state, #ipad-tareas-empty-state, #mac-tareas-empty-state");
    if (targets.length === 0) return;

    const tareas = ENCARDOMY_DATA.getTareas("all", false);
    if (tareas.length > 0) {
      targets.forEach(emptyState => {
        const parent = emptyState.parentElement;
        if (!parent) return;
        const isMac = emptyState.id.includes("mac");
        const isIpad = emptyState.id.includes("ipad");
        const dev = isMac ? "desktop" : (isIpad ? "tablet" : "mobile");

        let html = '<div class="schedule-list tablet-cards-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">';
        tareas.forEach(t => {
          const subj = ENCARDOMY_DATA.subjects[t.subjectId];
          const color = subj ? subj.color : "var(--accent-gold)";
          const detailUrl = getItemDetailUrl(t, dev);

          html += `
            <div class="glass-card" style="border-left: 5px solid ${color}; margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: ${color}; letter-spacing: 0.5px;">
                    ${escapeHtml(t.subjectName || '')}
                  </span>
                  <span style="font-size: 11px; color: var(--accent-red, #ff453a); font-weight: 700;">
                    Entrega: ${escapeHtml(t.dueDate || 'Sin fecha')}
                  </span>
                </div>
                <h3 style="font-size: 16.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; line-height: 1.3;">
                  <a href="${detailUrl}" style="color: inherit; text-decoration: none;">${escapeHtml(t.title)}</a>
                </h3>
                <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.45; margin-bottom: 12px;">
                  ${escapeHtml(t.summary || t.description || '')}
                </p>
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06);">
                <a href="${detailUrl}" class="ipad-btn-action" style="padding: 7px 14px; font-size: 12.5px; font-weight: 700; text-decoration: none; background: var(--accent-gold); color: #04140b; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;">
                  <span>Más información →</span>
                </a>
              </div>
            </div>
          `;
        });
        html += '</div>';
        parent.innerHTML = html;
      });
    }
  }

  function renderExamenesView() {
    const targets = document.querySelectorAll("#examenes-empty-state, #ipad-examenes-empty-state, #mac-examenes-empty-state");
    if (targets.length === 0) return;

    const examenes = ENCARDOMY_DATA.getExamenes("all", false);
    if (examenes.length > 0) {
      targets.forEach(emptyState => {
        const parent = emptyState.parentElement;
        if (!parent) return;
        const isMac = emptyState.id.includes("mac");
        const isIpad = emptyState.id.includes("ipad");
        const dev = isMac ? "desktop" : (isIpad ? "tablet" : "mobile");

        let html = '<div class="schedule-list tablet-cards-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">';
        examenes.forEach(ex => {
          const subj = ENCARDOMY_DATA.subjects[ex.subjectId];
          const color = subj ? subj.color : "var(--accent-gold)";
          const detailUrl = getItemDetailUrl(ex, dev);

          html += `
            <div class="glass-card" style="border-left: 5px solid ${color}; margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: ${color}; letter-spacing: 0.5px;">
                    ${escapeHtml(ex.subjectName || '')}
                  </span>
                  <span style="font-size: 11px; color: var(--accent-gold); font-weight: 700;">
                    ${escapeHtml(ex.date || 'Por confirmar')}
                  </span>
                </div>
                <h3 style="font-size: 16.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; line-height: 1.3;">
                  <a href="${detailUrl}" style="color: inherit; text-decoration: none;">${escapeHtml(ex.title)}</a>
                </h3>
                <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.45; margin-bottom: 10px;">
                  <strong>Temario:</strong> ${escapeHtml(ex.topics || 'Por confirmar')}
                </div>
                ${ex.location ? `<div style="font-size: 12px; color: var(--accent-gold); margin-bottom: 10px;">📍 ${escapeHtml(ex.location)}</div>` : ''}
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06);">
                <a href="${detailUrl}" class="ipad-btn-action" style="padding: 7px 14px; font-size: 12.5px; font-weight: 700; text-decoration: none; background: var(--accent-gold); color: #04140b; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;">
                  <span>Más información →</span>
                </a>
                ${ex.calendarEvent ? `<button type="button" class="ipad-btn-action" style="padding: 6px 12px; font-size: 12px; background: rgba(229,192,123,0.15); color: var(--accent-gold); cursor: pointer;" onclick='window.addCalendarEvent(${JSON.stringify(ex.calendarEvent)})'>📅 Calendario</button>` : ''}
              </div>
            </div>
          `;
        });
        html += '</div>';
        parent.innerHTML = html;
      });
    }
  }

  // ==========================================================================
  // 10. ACADEMIC HUB SINCRONIZADO EN IPAD Y MAC (Avisos, Tareas y Exámenes)
  // ==========================================================================
  function initAcademicHubSync() {
    renderAvisosHub();
    renderTareasHub();
    renderExamenesHub();
    renderSubjectAcademicModules();
  }

  function renderAvisosHub() {
    const mobList = document.getElementById("mobile-avisos-list");
    const ipadList = document.getElementById("ipad-avisos-list");
    const macList = document.getElementById("mac-avisos-list");
    const lists = [mobList, ipadList, macList].filter(Boolean);
    if (lists.length === 0) return;

    const avisos = ENCARDOMY_DATA.getAvisos("all", "all", false);

    lists.forEach(list => {
      list.innerHTML = "";
      if (avisos.length === 0) {
        list.innerHTML = `
          <div class="empty-state-card" style="text-align: center; padding: 24px 10px; color: var(--text-tertiary); font-size: 13.5px;">
            <div style="font-size: 26px; margin-bottom: 6px;">📢</div>
            <strong style="color: var(--text-secondary);">No hay avisos por ahora.</strong>
          </div>
        `;
        return;
      }

      const dev = (list === macList) ? "desktop" : ((list === ipadList) ? "tablet" : "mobile");

      avisos.forEach(a => {
        const subj = ENCARDOMY_DATA.subjects[a.subjectId];
        const color = subj ? subj.color : "var(--accent-gold)";
        const targetUrl = getItemDetailUrl(a, dev);

        const item = document.createElement("div");
        item.className = (dev === "desktop") ? "mac-hub-card" : ((dev === "tablet") ? "ipad-academic-card" : "glass-card");
        item.style.setProperty("--item-color", color);
        item.style.borderLeft = "5px solid " + color;
        item.style.padding = (dev === "mobile") ? "14px 16px" : "12px 14px";
        item.style.borderRadius = "8px";
        item.style.background = "rgba(255,255,255,0.04)";
        item.style.marginBottom = "10px";
        item.style.cursor = "pointer";
        item.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${color};">${escapeHtml(a.subjectName || '')}</span>
            <span style="font-size: 11px; color: var(--text-tertiary);">${escapeHtml(a.date || '')}</span>
          </div>
          <div style="font-weight: 800; color: var(--text-primary); font-size: 15px; margin-bottom: 4px; line-height: 1.3;">
            <a href="${targetUrl}" style="color: inherit; text-decoration: none;">${escapeHtml(a.title)}</a>
          </div>
          <div style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.45; margin-bottom: 10px;">
            ${escapeHtml(a.summary || a.content || '')}
          </div>
          ${a.location ? `<div style="font-size: 12px; color: var(--accent-gold); margin-bottom: 8px;">📍 ${escapeHtml(a.location)}</div>` : ''}
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
            <a href="${targetUrl}" class="ipad-btn-action" style="padding: 6px 12px; font-size: 12px; font-weight: 700; text-decoration: none; background: var(--accent-gold); color: #04140b; border-radius: 6px;">
              <span>Más información →</span>
            </a>
            ${a.calendarEvent ? `<button type="button" class="ipad-btn-action" style="padding: 6px 12px; font-size: 12px; background: rgba(229,192,123,0.15); color: var(--accent-gold); border: none; cursor: pointer; border-radius: 6px;" onclick='event.stopPropagation(); window.addCalendarEvent(${JSON.stringify(a.calendarEvent)})'>📅 Calendario</button>` : ''}
            ${a.locationUrl ? `<a href="${a.locationUrl}" target="_blank" rel="noopener noreferrer" class="ipad-btn-action" style="padding: 6px 12px; font-size: 12px; text-decoration: none; color: #64D2FF; border-radius: 6px;" onclick="event.stopPropagation();">📍 Mapa</a>` : ''}
          </div>
        `;
        item.addEventListener("click", (e) => {
          if (e.target.tagName !== "A" && e.target.tagName !== "BUTTON" && !e.target.closest("button") && !e.target.closest("a")) {
            window.location.href = targetUrl;
          }
        });
        list.appendChild(item);
      });
    });
  }

  function renderTareasHub() {
    const mobList = document.getElementById("mobile-tareas-list");
    const ipadList = document.getElementById("ipad-tareas-list");
    const macList = document.getElementById("mac-tareas-list");
    const lists = [mobList, ipadList, macList].filter(Boolean);
    if (lists.length === 0) return;

    const tareas = ENCARDOMY_DATA.getTareas("all", false);

    lists.forEach(list => {
      list.innerHTML = "";
      if (tareas.length === 0) {
        list.innerHTML = `
          <div class="empty-state-card" style="text-align: center; padding: 24px 10px; color: var(--text-tertiary); font-size: 13.5px;">
            <div style="font-size: 26px; margin-bottom: 6px;">📝</div>
            <strong style="color: var(--text-secondary);">No hay tareas por ahora.</strong>
          </div>
        `;
        return;
      }

      const dev = (list === macList) ? "desktop" : ((list === ipadList) ? "tablet" : "mobile");

      tareas.forEach(t => {
        const subj = ENCARDOMY_DATA.subjects[t.subjectId];
        const color = subj ? subj.color : "var(--accent-gold)";
        const targetUrl = getItemDetailUrl(t, dev);

        const item = document.createElement("div");
        item.className = (dev === "desktop") ? "mac-hub-card" : ((dev === "tablet") ? "ipad-academic-card" : "glass-card");
        item.style.setProperty("--item-color", color);
        item.style.borderLeft = "5px solid " + color;
        item.style.padding = (dev === "mobile") ? "14px 16px" : "12px 14px";
        item.style.borderRadius = "8px";
        item.style.background = "rgba(255,255,255,0.04)";
        item.style.marginBottom = "10px";
        item.style.cursor = "pointer";
        item.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${color};">${escapeHtml(t.subjectName || '')}</span>
            <span style="font-size: 11px; color: #ff453a; font-weight: 700;">Entrega: ${escapeHtml(t.dueDate || 'Sin fecha')}</span>
          </div>
          <div style="font-weight: 800; color: var(--text-primary); font-size: 15px; margin-bottom: 4px; line-height: 1.3;">
            <a href="${targetUrl}" style="color: inherit; text-decoration: none;">${escapeHtml(t.title)}</a>
          </div>
          <div style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.45; margin-bottom: 10px;">
            ${escapeHtml(t.summary || t.description || '')}
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
            <a href="${targetUrl}" class="ipad-btn-action" style="padding: 6px 12px; font-size: 12px; font-weight: 700; text-decoration: none; background: var(--accent-gold); color: #04140b; border-radius: 6px;">
              <span>Más información →</span>
            </a>
          </div>
        `;
        item.addEventListener("click", (e) => {
          if (e.target.tagName !== "A" && e.target.tagName !== "BUTTON" && !e.target.closest("button") && !e.target.closest("a")) {
            window.location.href = targetUrl;
          }
        });
        list.appendChild(item);
      });
    });
  }

  function renderExamenesHub() {
    const mobList = document.getElementById("mobile-examenes-list");
    const ipadList = document.getElementById("ipad-examenes-list");
    const macList = document.getElementById("mac-examenes-list");
    const lists = [mobList, ipadList, macList].filter(Boolean);
    if (lists.length === 0) return;

    const examenes = ENCARDOMY_DATA.getExamenes("all", false);

    lists.forEach(list => {
      list.innerHTML = "";
      if (examenes.length === 0) {
        list.innerHTML = `
          <div class="empty-state-card" style="text-align: center; padding: 24px 10px; color: var(--text-tertiary); font-size: 13.5px;">
            <div style="font-size: 26px; margin-bottom: 6px;">📋</div>
            <strong style="color: var(--text-secondary);">No hay exámenes por ahora.</strong>
          </div>
        `;
        return;
      }

      const dev = (list === macList) ? "desktop" : ((list === ipadList) ? "tablet" : "mobile");

      examenes.forEach(ex => {
        const subj = ENCARDOMY_DATA.subjects[ex.subjectId];
        const color = subj ? subj.color : "var(--accent-gold)";
        const targetUrl = getItemDetailUrl(ex, dev);

        const item = document.createElement("div");
        item.className = (dev === "desktop") ? "mac-hub-card" : ((dev === "tablet") ? "ipad-academic-card" : "glass-card");
        item.style.setProperty("--item-color", color);
        item.style.borderLeft = "5px solid " + color;
        item.style.padding = (dev === "mobile") ? "14px 16px" : "12px 14px";
        item.style.borderRadius = "8px";
        item.style.background = "rgba(255,255,255,0.04)";
        item.style.marginBottom = "10px";
        item.style.cursor = "pointer";
        item.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${color};">${escapeHtml(ex.subjectName || '')}</span>
            <span style="font-size: 11px; color: var(--accent-gold); font-weight: 700;">${escapeHtml(ex.date || 'Por confirmar')}</span>
          </div>
          <div style="font-weight: 800; color: var(--text-primary); font-size: 15px; margin-bottom: 4px; line-height: 1.3;">
            <a href="${targetUrl}" style="color: inherit; text-decoration: none;">${escapeHtml(ex.title)}</a>
          </div>
          <div style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.45; margin-bottom: 8px;">
            <strong>Temario:</strong> ${escapeHtml(ex.topics || 'Por confirmar')}
          </div>
          ${ex.location ? `<div style="font-size: 12px; color: var(--accent-gold); margin-bottom: 8px;">📍 ${escapeHtml(ex.location)}</div>` : ''}
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
            <a href="${targetUrl}" class="ipad-btn-action" style="padding: 6px 12px; font-size: 12px; font-weight: 700; text-decoration: none; background: var(--accent-gold); color: #04140b; border-radius: 6px;">
              <span>Más información →</span>
            </a>
            ${ex.calendarEvent ? `<button type="button" class="ipad-btn-action" style="padding: 6px 12px; font-size: 12px; background: rgba(229,192,123,0.15); color: var(--accent-gold); border: none; cursor: pointer; border-radius: 6px;" onclick='event.stopPropagation(); window.addCalendarEvent(${JSON.stringify(ex.calendarEvent)})'>📅 Calendario</button>` : ''}
          </div>
        `;
        item.addEventListener("click", (e) => {
          if (e.target.tagName !== "A" && e.target.tagName !== "BUTTON" && !e.target.closest("button") && !e.target.closest("a")) {
            window.location.href = targetUrl;
          }
        });
        list.appendChild(item);
      });
    });
  }

  // ==========================================================================
  // SINCRONIZACIÓN DINÁMICA DE PÁGINAS INDIVIDUALES DE MATERIAS
  // Cada materia muestra única y exclusivamente sus propios avisos, tareas y exámenes
  // ==========================================================================
  function renderSubjectAcademicModules() {
    const subjectContainers = document.querySelectorAll("[data-subject-id]");
    if (subjectContainers.length === 0) return;

    const currentInterface = document.documentElement.getAttribute("data-current-interface") || state.device;

    subjectContainers.forEach(container => {
      const subjectId = container.dataset.subjectId;
      if (!subjectId) return;

      const subj = ENCARDOMY_DATA.subjects[subjectId];
      const color = subj ? subj.color : "var(--accent-gold)";

      // 1. Avisos de esta materia
      const avisosContainer = container.querySelector(".subject-avisos-list");
      if (avisosContainer) {
        const avisos = ENCARDOMY_DATA.getAvisos(subjectId, "all", false);
        avisosContainer.innerHTML = "";
        if (avisos.length === 0) {
          avisosContainer.innerHTML = `
            <div class="empty-state-card" style="padding: 16px 12px; margin: 4px 0; background: rgba(0,0,0,0.25);">
              <div class="empty-state-text" style="font-size: 13px; color: var(--text-tertiary);">Sin avisos activos para esta materia.</div>
            </div>
          `;
        } else {
          avisos.forEach(a => {
            const detailUrl = getItemDetailUrl(a, currentInterface);
            const card = document.createElement("div");
            card.className = "glass-card";
            card.style.borderLeft = "5px solid " + color;
            card.style.marginBottom = "14px";
            card.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${color};">${escapeHtml(a.subjectName || '')}</span>
                <span style="font-size: 11px; color: var(--text-tertiary);">${escapeHtml(a.date || '')}</span>
              </div>
              <h4 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
                <a href="${detailUrl}" style="color: inherit; text-decoration: none;">${escapeHtml(a.title)}</a>
              </h4>
              <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.45; margin-bottom: 10px;">
                ${escapeHtml(a.summary || a.content || '')}
              </p>
              ${a.location ? `<div style="font-size: 12px; color: var(--accent-gold); margin-bottom: 10px;">📍 ${escapeHtml(a.location)}</div>` : ''}
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <a href="${detailUrl}" class="ipad-btn-action" style="padding: 7px 14px; font-size: 12.5px; font-weight: 700; text-decoration: none; background: var(--accent-gold); color: #04140b; border-radius: 8px;">
                  <span>Más información →</span>
                </a>
                ${a.calendarEvent ? `<button type="button" class="ipad-btn-action" style="padding: 6px 12px; font-size: 12px; background: rgba(229,192,123,0.15); color: var(--accent-gold); cursor: pointer;" onclick='window.addCalendarEvent(${JSON.stringify(a.calendarEvent)})'>📅 Calendario</button>` : ''}
                ${a.locationUrl ? `<a href="${a.locationUrl}" target="_blank" rel="noopener noreferrer" class="ipad-btn-action" style="padding: 6px 12px; font-size: 12px; text-decoration: none; color: #64D2FF;">📍 Mapa</a>` : ''}
              </div>
            `;
            avisosContainer.appendChild(card);
          });
        }
      }

      // 2. Tareas de esta materia
      const tareasContainer = container.querySelector(".subject-tareas-list");
      if (tareasContainer) {
        const tareas = ENCARDOMY_DATA.getTareas(subjectId, false);
        tareasContainer.innerHTML = "";
        if (tareas.length === 0) {
          tareasContainer.innerHTML = `
            <div class="empty-state-card" style="padding: 16px 12px; margin: 4px 0; background: rgba(0,0,0,0.25);">
              <div class="empty-state-text" style="font-size: 13px; color: var(--text-tertiary);">Sin tareas pendientes para esta materia.</div>
            </div>
          `;
        } else {
          tareas.forEach(t => {
            const detailUrl = getItemDetailUrl(t, currentInterface);
            const card = document.createElement("div");
            card.className = "glass-card";
            card.style.borderLeft = "5px solid " + color;
            card.style.marginBottom = "14px";
            card.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${color};">${escapeHtml(t.subjectName || '')}</span>
                <span style="font-size: 11px; color: #ff453a; font-weight: 700;">Entrega: ${escapeHtml(t.dueDate || 'Sin fecha')}</span>
              </div>
              <h4 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
                <a href="${detailUrl}" style="color: inherit; text-decoration: none;">${escapeHtml(t.title)}</a>
              </h4>
              <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.45; margin-bottom: 10px;">
                ${escapeHtml(t.summary || t.description || '')}
              </p>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <a href="${detailUrl}" class="ipad-btn-action" style="padding: 7px 14px; font-size: 12.5px; font-weight: 700; text-decoration: none; background: var(--accent-gold); color: #04140b; border-radius: 8px;">
                  <span>Más información →</span>
                </a>
              </div>
            `;
            tareasContainer.appendChild(card);
          });
        }
      }

      // 3. Exámenes de esta materia
      const examenesContainer = container.querySelector(".subject-examenes-list");
      if (examenesContainer) {
        const examenes = ENCARDOMY_DATA.getExamenes(subjectId, false);
        examenesContainer.innerHTML = "";
        if (examenes.length === 0) {
          examenesContainer.innerHTML = `
            <div class="empty-state-card" style="padding: 16px 12px; margin: 4px 0; background: rgba(0,0,0,0.25);">
              <div class="empty-state-text" style="font-size: 13px; color: var(--text-tertiary);">Sin exámenes programados para esta materia.</div>
            </div>
          `;
        } else {
          examenes.forEach(ex => {
            const detailUrl = getItemDetailUrl(ex, currentInterface);
            const card = document.createElement("div");
            card.className = "glass-card";
            card.style.borderLeft = "5px solid " + color;
            card.style.marginBottom = "14px";
            card.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${color};">${escapeHtml(ex.subjectName || '')}</span>
                <span style="font-size: 11px; color: var(--accent-gold); font-weight: 700;">${escapeHtml(ex.date || 'Por confirmar')}</span>
              </div>
              <h4 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
                <a href="${detailUrl}" style="color: inherit; text-decoration: none;">${escapeHtml(ex.title)}</a>
              </h4>
              <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.45; margin-bottom: 8px;">
                <strong>Temario:</strong> ${escapeHtml(ex.topics || 'Por confirmar')}
              </div>
              ${ex.location ? `<div style="font-size: 12px; color: var(--accent-gold); margin-bottom: 10px;">📍 ${escapeHtml(ex.location)}</div>` : ''}
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <a href="${detailUrl}" class="ipad-btn-action" style="padding: 7px 14px; font-size: 12.5px; font-weight: 700; text-decoration: none; background: var(--accent-gold); color: #04140b; border-radius: 8px;">
                  <span>Más información →</span>
                </a>
                ${ex.calendarEvent ? `<button type="button" class="ipad-btn-action" style="padding: 6px 12px; font-size: 12px; background: rgba(229,192,123,0.15); color: var(--accent-gold); cursor: pointer;" onclick='window.addCalendarEvent(${JSON.stringify(ex.calendarEvent)})'>📅 Calendario</button>` : ''}
              </div>
            `;
            examenesContainer.appendChild(card);
          });
        }
      }
    });
  }

  // ==========================================================================
  // FUNCIÓN UNIVERSAL: AGREGAR EVENTO AL CALENDARIO (.ICS + GOOGLE CALENDAR)
  // Soporta iOS, iPadOS, macOS, Android y Windows sin dependencias externas
  // ==========================================================================
  function addCalendarEvent(eventData) {
    if (!eventData) return;
    const title = eventData.title || "Evento Escolar ENP 4";
    const location = eventData.location || "ENP 4 Vidal Castañeda y Nájera - UNAM";
    const description = eventData.description || "";
    
    // Parse dates
    const dStart = new Date(eventData.startISO || eventData.date);
    const dEnd = new Date(eventData.endISO || (dStart.getTime() + 60 * 60 * 1000));
    
    const toUtcIcs = d => {
      if (isNaN(d.getTime())) return "20261015T170000Z";
      return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const cleanIcs = str => (str || "").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ENCARDOMY MINWEB 415//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `SUMMARY:${cleanIcs(title)}`,
      `DTSTART:${toUtcIcs(dStart)}`,
      `DTEND:${toUtcIcs(dEnd)}`,
      `LOCATION:${cleanIcs(location)}`,
      `DESCRIPTION:${cleanIcs(description)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    // 1. Descarga del archivo .ics estándar para Apple Calendar / Outlook
    try {
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${title.replace(/[^a-zA-Z0-9_-]/g, "_")}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error al generar .ics:", e);
    }

    // 2. Abrir también en Google Calendar en nueva pestaña para usuarios de Google
    try {
      const gcalParams = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        dates: `${toUtcIcs(dStart)}/${toUtcIcs(dEnd)}`,
        details: description,
        location: location
      });
      window.open(`https://calendar.google.com/calendar/render?${gcalParams.toString()}`, "_blank");
    } catch (e) {}
  }
  window.addCalendarEvent = addCalendarEvent;

  function openDetailModal(type, data, color) {
    if (!data) return;
    const currentInterface = document.documentElement.getAttribute("data-current-interface") || state.device;
    const macBackdrop = document.getElementById("mac-detail-modal");
    const ipadBackdrop = document.getElementById("ipad-detail-modal");
    const itemColor = color || "var(--accent-gold)";

    let linksHtml = "";
    if (Array.isArray(data.links) && data.links.length > 0) {
      linksHtml = `
        <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
          <strong style="font-size: 13px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Enlaces y Recursos:</strong>
          ${data.links.map(l => `
            <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="mac-btn-tool" style="display: inline-flex; align-items: center; justify-content: space-between; padding: 10px 14px; text-decoration: none; border-radius: 8px; background: rgba(255,255,255,0.08); color: var(--text-primary); font-size: 13.5px; font-weight: 600;">
              <span>🔗 ${escapeHtml(l.label)}</span>
              <span style="font-size: 12px; opacity: 0.7;">Abrir ↗</span>
            </a>
          `).join("")}
        </div>
      `;
    }

    let calendarBtnHtml = "";
    if (data.calendarEvent) {
      calendarBtnHtml = `
        <div style="margin-top: 16px;">
          <button type="button" class="btn-primary-ios" style="background: var(--accent-gold, #E5C07B); color: #04140b; font-weight: 700; width: 100%; height: 46px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px;" onclick='window.addCalendarEvent(${JSON.stringify(data.calendarEvent)})'>
            <span>📅</span>
            <span>Agregar al Calendario (.ics / Google)</span>
          </button>
        </div>
      `;
    }

    let locationHtml = "";
    if (data.location) {
      locationHtml = `
        <div style="margin-top: 12px; padding: 10px 14px; background: rgba(0,0,0,0.3); border: 1px solid var(--surface-glass-border-subtle, rgba(255,255,255,0.1)); border-radius: 8px; font-size: 13px;">
          <strong style="color: var(--text-primary);">📍 Ubicación:</strong> ${escapeHtml(data.location)}
          ${data.locationUrl ? `<div style="margin-top: 6px;"><a href="${data.locationUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-blue, #2997FF); text-decoration: underline; font-size: 12.5px;">Ver en Google Maps ↗</a></div>` : ''}
        </div>
      `;
    }

    let whatsappHtml = "";
    if (data.whatsapp) {
      const waMsg = encodeURIComponent(data.whatsappMessage || `Hola, me comunico respecto a: ${data.title}`);
      whatsappHtml = `
        <div style="margin-top: 14px;">
          <a href="https://wa.me/${data.whatsapp.replace(/[^0-9]/g, '')}?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="mac-btn-tool" style="background: #25D366; color: #04140b; font-weight: 700; width: 100%; height: 44px; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; border-radius: 8px;">
            <span>💬</span>
            <span>Solicitar / Confirmar por WhatsApp (${escapeHtml(data.whatsapp)})</span>
          </a>
        </div>
      `;
    }

    let clipHtml = "";
    if (data.clipUrl) {
      clipHtml = `
        <div style="margin-top: 10px;">
          <a href="${data.clipUrl}" target="_blank" rel="noopener noreferrer" class="mac-btn-tool" style="background: #ffa94d; color: #04140b; font-weight: 700; width: 100%; height: 44px; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; border-radius: 8px;">
            <span>💳</span>
            <span>Pagar en Línea con Clip ↗</span>
          </a>
        </div>
      `;
    }

    let detailsHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.08);">
        <span class="ipad-pill" style="font-size: 12px; background: rgba(255,255,255,0.1); color: ${itemColor}; border-color: ${itemColor};">
          ${escapeHtml(data.subjectName || 'Aviso General')}
        </span>
        <span style="font-size: 12.5px; color: var(--text-tertiary);">
          📅 ${escapeHtml(data.date || data.dueDate || '')}
        </span>
      </div>

      <div style="font-size: 14.5px; color: var(--text-primary); line-height: 1.6; white-space: pre-wrap; margin-bottom: 14px;">
        ${escapeHtml(data.content || data.description || data.topics || '')}
      </div>

      ${locationHtml}
      ${linksHtml}
      ${calendarBtnHtml}
      ${whatsappHtml}
      ${clipHtml}
    `;

    if (currentInterface === "desktop" && macBackdrop) {
      const macTitle = document.getElementById("mac-modal-title");
      const macBody = document.getElementById("mac-modal-body");
      if (macTitle) {
        macTitle.textContent = `${type}: ${data.title}`;
        macTitle.style.color = itemColor;
      }
      if (macBody) macBody.innerHTML = detailsHtml;
      macBackdrop.classList.add("show");
      return;
    }

    if (ipadBackdrop) {
      const title = document.getElementById("ipad-modal-title");
      const body = document.getElementById("ipad-modal-body");
      if (title) {
        title.textContent = `${type}: ${data.title}`;
        title.style.color = itemColor;
      }
      if (body) body.innerHTML = detailsHtml;
      ipadBackdrop.classList.add("show");
    }
  }

  // Cerrar modales
  const closeBtnIpad = document.getElementById("ipad-modal-close");
  if (closeBtnIpad) {
    closeBtnIpad.addEventListener("click", () => {
      const backdrop = document.getElementById("ipad-detail-modal");
      if (backdrop) backdrop.classList.remove("show");
    });
  }

  const closeBtnMac = document.getElementById("mac-modal-close");
  if (closeBtnMac) {
    closeBtnMac.addEventListener("click", () => {
      const backdrop = document.getElementById("mac-detail-modal");
      if (backdrop) backdrop.classList.remove("show");
    });
  }
// ==========================================================================
  // 11. FORMULARIO DE PEDIDOS Y WHATSAPP (Reglas 72, 73)
  // Teléfono oficial obligatorio: +52 55 7198 5641
  // ==========================================================================
  function initOrderForms() {
    // Vincular funciones a window para soporte inline
    window.handleOrderSubmit = handleOrderSubmit;
    window.handleIpadOrderSubmit = handleOrderSubmit;
    window.handleMacOrderSubmit = handleOrderSubmit;
    window.handleMacOrderSubmit = handleOrderSubmit;
    window.openClipModal = openClipModal;
    window.closeClipModal = closeClipModal;
    window.updateMessagePreview = updateMessagePreview;

    const orderForm = document.getElementById("order-form");
    if (orderForm) {
      orderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleOrderSubmit("whatsapp");
      });
    }

    const ipadOrderForm = document.getElementById("ipad-order-form");
    if (ipadOrderForm) {
      ipadOrderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleOrderSubmit("whatsapp");
      });
    }

    const macOrderForm = document.getElementById("mac-order-form");
    if (macOrderForm) {
      macOrderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleOrderSubmit("whatsapp");
      });
    }
  }

  function updateMessagePreview() {
    const item = (document.getElementById("mac-order-item")?.value.trim()) ||
                 (document.getElementById("ipad-order-item")?.value.trim()) || 
                 (document.getElementById("order-item")?.value.trim()) || "[Artículo o solicitud]";
    const name = (document.getElementById("mac-order-name")?.value.trim()) ||
                 (document.getElementById("ipad-order-name")?.value.trim()) || 
                 (document.getElementById("order-name")?.value.trim()) || "[Tu nombre]";
    const desc = (document.getElementById("mac-order-desc")?.value.trim()) ||
                 (document.getElementById("ipad-order-desc")?.value.trim()) || 
                 (document.getElementById("order-desc")?.value.trim()) || "[Descripción / Especificaciones]";
    const qty = (document.getElementById("mac-order-qty")?.value.trim()) ||
                (document.getElementById("ipad-order-qty")?.value.trim()) || 
                (document.getElementById("order-qty")?.value.trim()) || "1";
    const notes = (document.getElementById("mac-order-notes")?.value.trim()) ||
                  (document.getElementById("ipad-order-notes")?.value.trim()) || 
                  (document.getElementById("order-notes")?.value.trim()) || "Ninguna";

    const previewText = 
      "¡Hola! Me comunico desde ENCARDOMY Minweb 415 (Tal vez te pueda interesar).\n" +
      "Me gustaría realizar la siguiente solicitud de pedido específico:\n\n" +
      "• Solicitud: " + item + "\n" +
      "• Solicitante: " + name + "\n" +
      "• Descripción / Especificaciones: " + desc + "\n" +
      "• Cantidad: " + qty + "\n" +
      "• Información adicional / Fecha: " + notes + "\n\n" +
      "¿Podrían confirmarme los detalles y disponibilidad? ¡Muchas gracias!";

    const elemIpad = document.getElementById("ipad-msg-preview");
    if (elemIpad) elemIpad.textContent = previewText;
    const elemMac = document.getElementById("mac-msg-preview");
    if (elemMac) elemMac.textContent = previewText;
  }

  function handleOrderSubmit(channel) {
    const itemElem = document.getElementById("mac-order-item") || document.getElementById("ipad-order-item") || document.getElementById("order-item");
    const nameElem = document.getElementById("mac-order-name") || document.getElementById("ipad-order-name") || document.getElementById("order-name");
    const descElem = document.getElementById("mac-order-desc") || document.getElementById("ipad-order-desc") || document.getElementById("order-desc");
    const qtyElem = document.getElementById("mac-order-qty") || document.getElementById("ipad-order-qty") || document.getElementById("order-qty");
    const notesElem = document.getElementById("mac-order-notes") || document.getElementById("ipad-order-notes") || document.getElementById("order-notes");

    const item = itemElem ? itemElem.value.trim() : "";
    const name = nameElem ? nameElem.value.trim() : "";
    const desc = descElem ? descElem.value.trim() : "";
    const qty = qtyElem ? (qtyElem.value.trim() || "1") : "1";
    const notes = notesElem ? (notesElem.value.trim() || "Sin notas adicionales") : "Sin notas adicionales";

    if (!item) {
      alert("Por favor indica qué deseas solicitar en el pedido.");
      if (itemElem) itemElem.focus();
      return;
    }

    if (!name) {
      alert("Por favor escribe tu nombre o cómo dirigirnos a ti.");
      if (nameElem) nameElem.focus();
      return;
    }

    if (!desc) {
      alert("Por favor describe brevemente las especificaciones de tu pedido.");
      if (descElem) descElem.focus();
      return;
    }

    if (channel === "whatsapp") {
      // Número oficial estricto: +52 55 7198 5641 (Regla 73)
      const phoneNumber = "525571985641";
      const messageText = 
        "¡Hola! Me comunico desde ENCARDOMY Minweb 415 (Tal vez te pueda interesar).\n" +
        "Me gustaría realizar la siguiente solicitud de pedido específico:\n\n" +
        "• Solicitud: " + item + "\n" +
        "• Solicitante: " + name + "\n" +
        "• Descripción / Especificaciones: " + desc + "\n" +
        "• Cantidad: " + qty + "\n" +
        "• Información adicional / Fecha: " + notes + "\n\n" +
        "¿Podrían confirmarme los detalles y disponibilidad? ¡Muchas gracias!";

      const waUrl = "https://wa.me/" + phoneNumber + "?text=" + encodeURIComponent(messageText);
      window.open(waUrl, "_blank");
    } else if (channel === "clip") {
      openClipModal();
    }
  }

  function openClipModal() {
    const modal = document.getElementById("clip-info-modal") || document.getElementById("ipad-clip-modal") || document.getElementById("mac-clip-modal");
    if (modal) modal.classList.add("show");
  }

  function closeClipModal() {
    document.querySelectorAll("#clip-info-modal, #ipad-clip-modal, #mac-clip-modal").forEach(m => {
      m.classList.remove("show");
    });
  }

  // ==========================================================================
  // 12. OTROS FORMULARIOS (Sugerencias y Sección B)
  // ==========================================================================
  function initFeedbackForms() {
    const sugForms = document.querySelectorAll("#sugerencias-form, #ipad-sugerencias-form, #mac-sugerencias-form");
    sugForms.forEach(form => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("¡Muchas gracias por tu sugerencia! Ha sido registrada con éxito para mejorar la Minweb 415.");
        form.reset();
      });
    });

    const secBForms = document.querySelectorAll("#seccion-b-form, #ipad-seccion-b-form, #mac-seccion-b-form");
    secBForms.forEach(form => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("¡Muchas gracias! Tu reporte ha sido recibido para actualizar los salones y particularidades de la Sección B.");
        form.reset();
      });
    });
  }

  // ==========================================================================
  // 13. SIMULADOR DE HORARIO ESCOLAR CDMX
  // ==========================================================================
  function initSimulator() {
    // Simulador Celular
    const mToggle = document.getElementById("toggle-simulator-btn");
    const mControls = document.getElementById("simulator-controls");
    const mDay = document.getElementById("sim-day-select");
    const mTime = document.getElementById("sim-time-input");
    const mReset = document.getElementById("sim-reset-btn");

    // Simulador iPad
    const iToggle = document.getElementById("ipad-toggle-sim");
    const iControls = document.getElementById("ipad-sim-controls");
    const iDay = document.getElementById("ipad-sim-day");
    const iTime = document.getElementById("ipad-sim-time");
    const iReset = document.getElementById("ipad-sim-reset");

    if (mToggle && mControls) {
      mToggle.addEventListener("click", () => mControls.classList.toggle("show"));
    }
    if (iToggle && iControls) {
      iToggle.addEventListener("click", () => {
        iControls.style.display = iControls.style.display === "flex" ? "none" : "flex";
      });
    }

    function apply(dayVal, timeVal) {
      if (!timeVal) return;
      const [hours, minutes] = timeVal.split(":").map(Number);
      const d = getCurrentTime();
      const currentDay = d.getDay();
      const distance = dayVal - currentDay;
      d.setDate(d.getDate() + distance);
      d.setHours(hours, minutes, 0, 0);

      state.simulatedDate = d;
      updateClassStatus();
    }

    if (mDay && mTime) {
      mDay.addEventListener("change", () => apply(parseInt(mDay.value, 10), mTime.value));
      mTime.addEventListener("input", () => apply(parseInt(mDay.value, 10), mTime.value));
    }
    if (iDay && iTime) {
      iDay.addEventListener("change", () => apply(parseInt(iDay.value, 10), iTime.value));
      iTime.addEventListener("input", () => apply(parseInt(iDay.value, 10), iTime.value));
    }

    const resetAction = () => {
      state.simulatedDate = null;
      updateClassStatus();
    };
    if (mReset) mReset.addEventListener("click", resetAction);
    if (iReset) iReset.addEventListener("click", resetAction);
  }

  // ==========================================================================
  // 14. AUDIO NAVIDEÑO NATIVO (Web Audio API)
  // ==========================================================================
  function initChristmasSound() {
    const btns = [
      document.getElementById("btn-play-jingle"),
      document.getElementById("ipad-btn-jingle"),
      document.getElementById("ipad-sidebar-jingle"),
      document.getElementById("mac-btn-chime")
    ].filter(Boolean);

    btns.forEach(btn => btn.addEventListener("click", playChristmasChime));
  }

  function playChristmasChime() {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!state.audioCtx) state.audioCtx = new AudioCtxClass();
      if (state.audioCtx.state === "suspended") state.audioCtx.resume();

      const ctx = state.audioCtx;
      const now = ctx.currentTime;

      const notes = [
        { f: 659.25, d: 0.18, pause: 0.05 },
        { f: 659.25, d: 0.18, pause: 0.05 },
        { f: 659.25, d: 0.35, pause: 0.15 },
        { f: 659.25, d: 0.18, pause: 0.05 },
        { f: 659.25, d: 0.18, pause: 0.05 },
        { f: 659.25, d: 0.35, pause: 0.15 },
        { f: 659.25, d: 0.18, pause: 0.05 },
        { f: 783.99, d: 0.22, pause: 0.05 },
        { f: 523.25, d: 0.22, pause: 0.05 },
        { f: 587.33, d: 0.22, pause: 0.05 },
        { f: 659.25, d: 0.50, pause: 0.20 }
      ];

      let startTime = now + 0.05;

      notes.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const harmonic = ctx.createOscillator();
        const harmGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.f, startTime);

        harmonic.type = "triangle";
        harmonic.frequency.setValueAtTime(note.f * 2.76, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.28, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + note.d + 0.35);

        harmGain.gain.setValueAtTime(0, startTime);
        harmGain.gain.linearRampToValueAtTime(0.08, startTime + 0.015);
        harmGain.gain.exponentialRampToValueAtTime(0.0001, startTime + note.d + 0.15);

        osc.connect(gain);
        harmonic.connect(harmGain);
        gain.connect(ctx.destination);
        harmGain.connect(ctx.destination);

        osc.start(startTime);
        harmonic.start(startTime);
        osc.stop(startTime + note.d + 0.4);
        harmonic.stop(startTime + note.d + 0.2);

        startTime += note.d + note.pause;
      });

      const soundBtns = [
        document.getElementById("btn-play-jingle"),
        document.getElementById("ipad-btn-jingle"),
        document.getElementById("ipad-sidebar-jingle")
      ].filter(Boolean);

      soundBtns.forEach(b => {
        b.style.background = "var(--accent-gold)";
        b.style.color = "#04140b";
      });

      setTimeout(() => {
        soundBtns.forEach(b => {
          b.style.background = "";
          b.style.color = "";
        });
      }, 3200);
    } catch (e) {
      console.warn("Audio Context aún no iniciado por interacción de usuario.");
    }
  }

  // ==========================================================================
  // 15. NIEVE SUTIL NAVIDEÑA
  // ==========================================================================
  function initSnowfall() {
    const container = document.querySelector(".snowfall-container");
    if (!container) return;

    for (let i = 0; i < 18; i++) {
      const flake = document.createElement("div");
      flake.className = "snowflake";
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.animationDuration = `${7 + Math.random() * 8}s`;
      flake.style.animationDelay = `${Math.random() * 5}s`;
      flake.style.opacity = `${0.35 + Math.random() * 0.45}`;
      const size = 3 + Math.random() * 3.5;
      flake.style.width = `${size}px`;
      flake.style.height = `${size}px`;
      container.appendChild(flake);
    }
  }

  // ==========================================================================
  // 16. RESALTADO DE NAVEGACIÓN ACTIVA
  // ==========================================================================
  function highlightActiveNav() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";

    // Navegación móvil y dock iPad
    document.querySelectorAll(".bottom-nav-bar .nav-item").forEach(item => {
      const href = item.getAttribute("href");
      if (href === currentPath || (currentPath === "" && (href === "index.html" || href === "ipad-index.html"))) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Sidebar lateral iPad
    document.querySelectorAll(".ipad-sidebar-nav-link").forEach(item => {
      const href = item.getAttribute("href");
      if (href === currentPath || (currentPath === "" && (href === "index.html" || href === "ipad-index.html"))) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  // ==========================================================================
  // UTILIDADES
  // ==========================================================================
  function escapeHtml(text) {
    if (!text) return "";
    return String(text).replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }

  
  // ==========================================================================
  // RENDERIZADO DEL FEED DE PUBLICIDAD (TAL VEZ TE PUEDA INTERESAR)
  // Celular + iPad + Mac
  // ==========================================================================
  function renderPublicidadFeed() {
    const feeds = document.querySelectorAll("#publicidad-feed, #ipad-publicidad-feed, #mac-publicidad-feed");
    if (feeds.length === 0) return;

    const items = ENCARDOMY_DATA.getPublicidad();
    feeds.forEach(container => {
      container.innerHTML = "";
      if (items.length === 0) {
        container.innerHTML = `
          <div class="empty-state-card" style="padding: 32px 16px; margin: 10px 0; background: rgba(0,0,0,0.35);">
            <div class="empty-state-icon" style="font-size: 36px; margin-bottom: 8px;">🎁</div>
            <div class="empty-state-text" style="font-size: 16px; font-weight: 700;">No hay nada disponible por ahora.</div>
            <div class="empty-state-subtext" style="font-size: 13px; line-height: 1.45; margin-top: 6px;">
              Este espacio mostrará oportunidades, productos y servicios de interés para la comunidad escolar del Grupo 415 cuando estén listos.
            </div>
          </div>
        `;
        return;
      }

      const gridWrapper = document.createElement("div");
      gridWrapper.style.display = "flex";
      gridWrapper.style.flexDirection = "column";
      gridWrapper.style.gap = "16px";

      items.forEach(ad => {
        const card = document.createElement("article");
        card.className = "mac-card";
        card.style.borderLeft = "5px solid var(--accent-gold, #E5C07B)";
        card.style.background = "linear-gradient(135deg, rgba(229, 192, 123, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)";
        card.style.padding = "18px 20px";
        card.style.marginBottom = "0";

        const waMsg = encodeURIComponent(ad.whatsappMessage || `Hola, me interesa el servicio: ${ad.title}`);
        const waUrl = ad.whatsapp ? `https://wa.me/${ad.whatsapp.replace(/[^0-9]/g, '')}?text=${waMsg}` : null;

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-gold); letter-spacing: 0.8px;">
              ${escapeHtml(ad.badge || 'Oportunidad')}
            </span>
            <span style="font-size: 13px; font-weight: 800; color: #25D366; background: rgba(37, 211, 102, 0.12); padding: 3px 8px; border-radius: 6px;">
              ${escapeHtml(ad.price || '')}
            </span>
          </div>
          <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
            ${escapeHtml(ad.title)}
          </h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
            ${escapeHtml(ad.description)}
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            ${ad.clipUrl ? `
              <a href="${ad.clipUrl}" target="_blank" rel="noopener noreferrer" class="mac-btn-tool" style="background: #ffa94d; color: #04140b; font-weight: 700; text-decoration: none; padding: 8px 14px; border-radius: 8px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
                <span>💳</span>
                <span>Pagar con Clip ↗</span>
              </a>
            ` : ''}
            ${waUrl ? `
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="mac-btn-tool" style="background: #25D366; color: #04140b; font-weight: 700; text-decoration: none; padding: 8px 14px; border-radius: 8px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
                <span>💬</span>
                <span>Pedir por WhatsApp ↗</span>
              </a>
            ` : ''}
          </div>
        `;
        gridWrapper.appendChild(card);
      });
      container.appendChild(gridWrapper);
    });
  }

  function renderApp() {
    updateClassStatus();
    renderSchedule();
    initDynamicPagesSync();
    renderPublicidadFeed();
    initAcademicHubSync();
    if (typeof updateAllProfessorContainers === "function") {
      updateAllProfessorContainers(activeProfessorQuery || "");
    }
  }

  // Exportar API para interoperabilidad
  window.EncardomyApp = {
    state,
    setSection,
    openDetailModal: openDetailModal,
    renderPublicidadFeed: renderPublicidadFeed,
    renderApp,
    updateClassStatus,
    renderSchedule
  };

})();
