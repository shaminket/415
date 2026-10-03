/**
 * ENCARDOMY — MINWEB 415 (macOS Desktop Edition)
 * Motor Central de la Interfaz Mac
 * 
 * Sincronizado con la fuente central de datos (window.EncardomyData / ENCARDOMY_DATA)
 * Hora Oficial: America/Mexico_City
 * WhatsApp Oficial: +52 55 7198 5641
 */

(function () {
  "use strict";

  const MacApp = {
    currentSection: "A",
    selectedDay: 1,
    currentLayout: "large", // 'compact' | 'medium' | 'large'
    timerId: null,
    cdmxTz: "America/Mexico_City",
    orderPhone: "525571985641",

    init: function () {
      this.initSection();
      this.initWindowResizeObserver();
      this.initClockAndCountdown();
      this.initScheduleTabs();
      this.initAudioJingle();
      this.initSearch();
      this.initDynamicSync();
      this.initRequiredWorksModule();
      this.initOrderForms();
      this.initFeedbackForms();
      this.initSnowfall();
      this.highlightActiveNav();
      this.renderAll();

      // Sincronización continua de almacenamiento
      window.addEventListener("storage", (e) => {
        if (e.key === "encardomy_section_choice" || e.key === "encardomy_academics_v1" || (e.key && e.key.startsWith("encardomy_trabajos_"))) {
          this.initSection();
          this.renderAll();
          this.initRequiredWorksModule();
        }
      });

      // Sincronización reactiva ante cambios en EncardomyData
      window.addEventListener("encardomyDataChanged", () => {
        this.renderAll();
      });
    },

    /* ========================================================================
       1. ADAPTACIÓN DINÁMICA DE VENTANA EN TIEMPO REAL (macOS)
       ======================================================================== */
    initWindowResizeObserver: function () {
      const evaluateSize = () => {
        const width = window.innerWidth || document.documentElement.clientWidth;
        const height = window.innerHeight || document.documentElement.clientHeight;
        const root = document.documentElement;
        const body = document.body;

        let layout = "large";
        if (width < 860) {
          layout = "compact";
        } else if (width < 1240) {
          layout = "medium";
        } else {
          layout = "large";
        }

        this.currentLayout = layout;

        // Establecer atributos en root y body
        root.setAttribute("data-mac-layout", layout);
        root.setAttribute("data-device", "desktop");
        root.setAttribute("data-mac-width", String(width));
        root.setAttribute("data-mac-height", String(height));

        if (body) {
          body.setAttribute("data-mac-layout", layout);
        }

        // Actualizar indicador de modo en la barra de título
        const modePill = document.querySelector(".mac-window-mode-pill");
        if (modePill) {
          if (layout === "compact") {
            modePill.textContent = "Ventana Compacta";
            modePill.title = `${width} × ${height} px — Vista Vertical Compacta`;
          } else if (layout === "medium") {
            modePill.textContent = "Ventana Mediana (2 Col)";
            modePill.title = `${width} × ${height} px — Sidebar + Escenario`;
          } else {
            modePill.textContent = "Ventana Grande (3 Col)";
            modePill.title = `${width} × ${height} px — Sidebar + Escenario + Inspector`;
          }
        }

        // Sincronizar badges de reloj o estado
        window.dispatchEvent(new CustomEvent("macLayoutChanged", {
          detail: { layout: layout, width: width, height: height }
        }));
      };

      evaluateSize();

      if (typeof ResizeObserver === "function") {
        const ro = new ResizeObserver(() => evaluateSize());
        ro.observe(document.documentElement);
      }

      let rTimer = null;
      window.addEventListener("resize", () => {
        evaluateSize();
        clearTimeout(rTimer);
        rTimer = setTimeout(evaluateSize, 60);
      });
    },

    /* ========================================================================
       2. SECCIÓN A / B
       ======================================================================== */
    initSection: function () {
      const stored = localStorage.getItem("encardomy_section_choice");
      if (stored === "A" || stored === "B") {
        this.currentSection = stored;
      } else {
        this.currentSection = "A";
      }

      const btns = document.querySelectorAll(".mac-segment-btn");
      btns.forEach(btn => {
        const sec = btn.getAttribute("data-section");
        if (sec === this.currentSection) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }

        btn.onclick = () => {
          this.setSection(sec);
        };
      });

      const statusSection = document.getElementById("mac-current-section-badge");
      if (statusSection) {
        statusSection.textContent = `Sección ${this.currentSection}`;
      }
    },

    setSection: function (section) {
      if (section !== "A" && section !== "B") return;
      this.currentSection = section;
      localStorage.setItem("encardomy_section_choice", section);
      this.initSection();
      this.renderSchedule();
      this.updateClassStatus();
    },

    /* ========================================================================
       3. HORA OFICIAL CDMX Y CUENTA REGRESIVA
       ======================================================================== */
    getCDMXDate: function () {
      const now = new Date();
      try {
        const cdmxStr = now.toLocaleString("en-US", { timeZone: this.cdmxTz });
        return new Date(cdmxStr);
      } catch (e) {
        return now;
      }
    },

    initClockAndCountdown: function () {
      const updateClocks = () => {
        const cdmxDate = this.getCDMXDate();
        let hours = cdmxDate.getHours();
        const minutes = String(cdmxDate.getMinutes()).padStart(2, "0");
        const seconds = String(cdmxDate.getSeconds()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const h12 = String(hours % 12 || 12).padStart(2, "0");

        const formattedTime = `${h12}:${minutes}:${seconds} ${ampm} CDMX`;

        const titleClock = document.getElementById("mac-titlebar-cdmx-clock");
        if (titleClock) titleClock.textContent = formattedTime;

        const sidebarClock = document.getElementById("mac-sidebar-cdmx-clock");
        if (sidebarClock) sidebarClock.textContent = formattedTime;

        this.updateClassStatus(cdmxDate);
      };

      updateClocks();
      if (this.timerId) clearInterval(this.timerId);
      this.timerId = setInterval(updateClocks, 1000);
    },

    /* ========================================================================
       4. ESTADO DE CLASE ACTUAL, PRÓXIMA Y TOLERANCIAS
       ======================================================================== */
    updateClassStatus: function (currentDate) {
      const date = currentDate || this.getCDMXDate();
      const day = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      const currentMinutes = date.getHours() * 60 + date.getMinutes();
      const currentSeconds = date.getSeconds();

      const heroSubject = document.getElementById("mac-current-subject");
      const heroMeta = document.getElementById("mac-current-meta");
      const heroCountdown = document.getElementById("mac-current-countdown");
      const nextSubject = document.getElementById("mac-next-subject");
      const nextMeta = document.getElementById("mac-next-meta");
      const toleranceProf = document.getElementById("mac-tol-prof");
      const toleranceStudent = document.getElementById("mac-tol-student");

      if (!heroSubject) return;

      if (day === 0 || day === 6) {
        heroSubject.textContent = "Fin de semana escolar";
        if (heroMeta) heroMeta.innerHTML = `<span class="mac-pill">✦ Escuela Cerrada</span><span class="mac-pill">Grupo 415 — Sección ${this.currentSection}</span>`;
        if (heroCountdown) heroCountdown.textContent = "--:--";
        if (nextSubject) nextSubject.textContent = "Lunes: Física III (07:00)";
        if (nextMeta) nextMeta.textContent = "Aula B-116 · Prof. Saúl Quintana";
        if (toleranceProf) toleranceProf.textContent = "20 min";
        if (toleranceStudent) toleranceStudent.textContent = "10 min";
        return;
      }

      const schedule = window.EncardomyData ? window.EncardomyData.getScheduleForDay(day, this.currentSection) : [];

      if (!schedule || schedule.length === 0) {
        heroSubject.textContent = "Sin clases programadas";
        if (heroCountdown) heroCountdown.textContent = "--:--";
        return;
      }

      let activeBlock = null;
      let nextBlock = null;

      for (let i = 0; i < schedule.length; i++) {
        const b = schedule[i];
        const [sh, sm] = b.start.split(":").map(Number);
        const [eh, em] = b.end.split(":").map(Number);
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;

        if (currentMinutes >= startMin && currentMinutes < endMin) {
          activeBlock = { block: b, startMin, endMin };
          nextBlock = schedule[i + 1] || null;
          break;
        } else if (currentMinutes < startMin) {
          if (!nextBlock) {
            nextBlock = schedule[i];
          }
        }
      }

      if (activeBlock) {
        const b = activeBlock.block;
        const remainingMin = activeBlock.endMin - currentMinutes - 1;
        const remainingSec = 59 - currentSeconds;
        const timeDisplay = `${String(Math.max(0, remainingMin)).padStart(2, "0")}:${String(Math.max(0, remainingSec)).padStart(2, "0")}`;

        heroSubject.textContent = b.subject;
        if (heroCountdown) heroCountdown.textContent = timeDisplay;

        if (heroMeta) {
          let changeBadge = "";
          if (b.hasChange) {
            changeBadge = `<span class="mac-room-change-badge">⚠️ ${b.changeNote}</span>`;
          }
          heroMeta.innerHTML = `
            <span class="mac-pill mac-pill-salon">Salón: ${b.room}</span>
            <span class="mac-pill mac-pill-prof">Docente: ${b.teacher}</span>
            <span class="mac-pill">Horario: ${b.start} - ${b.end}</span>
            ${changeBadge}
          `;
        }

        const elapsed = currentMinutes - activeBlock.startMin;
        if (elapsed <= 20) {
          if (toleranceProf) toleranceProf.textContent = `${20 - elapsed} min rest.`;
        } else {
          if (toleranceProf) toleranceProf.textContent = "Vencida";
        }

        if (elapsed <= 10) {
          if (toleranceStudent) toleranceStudent.textContent = `${10 - elapsed} min rest.`;
        } else {
          if (toleranceStudent) toleranceStudent.textContent = "Con retardo";
        }
      } else {
        if (currentMinutes < 7 * 60) {
          heroSubject.textContent = "Antes de iniciar jornada (07:00)";
        } else if (currentMinutes >= 15 * 60 + 20) {
          heroSubject.textContent = "Jornada escolar concluida";
        } else {
          heroSubject.textContent = "Receso o Cambio de Aula";
        }

        if (heroCountdown) heroCountdown.textContent = "--:--";
        if (heroMeta) {
          heroMeta.innerHTML = `
            <span class="mac-pill">Grupo 415 — Sección ${this.currentSection}</span>
            <span class="mac-pill">ENP 4 Vidal Castañeda y Nájera</span>
          `;
        }

        if (toleranceProf) toleranceProf.textContent = "20 min";
        if (toleranceStudent) toleranceStudent.textContent = "10 min";
      }

      if (nextBlock) {
        if (nextSubject) nextSubject.textContent = nextBlock.subject;
        if (nextMeta) {
          nextMeta.textContent = `${nextBlock.start} hrs · Salón ${nextBlock.room} · ${nextBlock.teacher}`;
        }
      } else {
        if (nextSubject) nextSubject.textContent = "No hay más clases hoy";
        if (nextMeta) nextMeta.textContent = "Consulta el horario del día siguiente";
      }

      this.highlightActiveCard(activeBlock ? activeBlock.block.subject : null);
    },

    highlightActiveCard: function (subjectName) {
      const cards = document.querySelectorAll(".mac-block-card");
      cards.forEach(card => {
        const sub = card.getAttribute("data-subject");
        if (subjectName && sub === subjectName) {
          card.classList.add("is-active-now");
        } else {
          card.classList.remove("is-active-now");
        }
      });
    },

    /* ========================================================================
       5. HORARIO EN MAC
       ======================================================================== */
    initScheduleTabs: function () {
      const today = this.getCDMXDate().getDay();
      this.selectedDay = (today >= 1 && today <= 5) ? today : 1;

      const tabs = document.querySelectorAll(".mac-day-btn");
      tabs.forEach(tab => {
        const d = parseInt(tab.getAttribute("data-day"), 10);
        if (d === this.selectedDay) {
          tab.classList.add("active");
        } else {
          tab.classList.remove("active");
        }

        tab.onclick = () => {
          tabs.forEach(t => t.classList.remove("active"));
          tab.classList.add("active");
          this.selectedDay = d;
          this.renderSchedule();
        };
      });
    },

    renderSchedule: function () {
      const grid = document.getElementById("mac-schedule-grid");
      if (!grid) return;

      const blocks = window.EncardomyData ? window.EncardomyData.getScheduleForDay(this.selectedDay, this.currentSection) : [];

      if (!blocks || blocks.length === 0) {
        grid.innerHTML = `
          <div class="mac-hub-empty" style="grid-column: 1 / -1;">
            <p>No hay bloques registrados para este día.</p>
          </div>
        `;
        return;
      }

      let html = "";
      blocks.forEach(b => {
        let changeHtml = "";
        if (b.hasChange) {
          changeHtml = `<div class="mac-room-change-badge">⚠️ ${b.changeNote}</div>`;
        }

        let twoHoursBadge = "";
        if (b.isTwoHours) {
          twoHoursBadge = `<span class="mac-block-badge">2 Horas continuas</span>`;
        }

        html += `
          <div class="mac-block-card" data-subject="${this.escapeHtml(b.subject)}" style="--block-color: ${b.color || '#2997FF'};" onclick="window.MacApp.openDetailModal('${this.escapeHtml(b.subject)}', '${this.escapeHtml(b.teacher)}', '${this.escapeHtml(b.room)}', '${b.start} - ${b.end}', '${b.durationMinutes} min', '${this.escapeHtml(b.changeNote || '')}')">
            <div class="mac-block-time-row">
              <span class="mac-block-hours">${b.start} – ${b.end}</span>
              ${twoHoursBadge}
            </div>
            <h3 class="mac-block-subject">${this.escapeHtml(b.subject)}</h3>
            <p class="mac-block-prof">${this.escapeHtml(b.teacher)}</p>
            ${changeHtml}
            <div class="mac-block-footer">
              <span class="mac-block-room">Salón ${this.escapeHtml(b.room)}</span>
              <span class="mac-block-tag">Duración: ${b.durationMinutes} min</span>
            </div>
          </div>
        `;
      });

      grid.innerHTML = html;
      this.updateClassStatus();
    },

    /* ========================================================================
       6. ACADEMIC HUB Y PÁGINAS DINÁMICAS
       ======================================================================== */
    initDynamicSync: function () {
      this.renderAvisos();
      this.renderTareas();
      this.renderExamenes();
    },

    renderAvisos: function () {
      const container = document.getElementById("mac-avisos-list") || document.getElementById("avisos-active-list");
      if (!container) return;

      const items = (window.EncardomyData && window.EncardomyData.avisos) ? window.EncardomyData.avisos : [];
      if (items.length === 0) {
        container.innerHTML = `
          <div class="mac-hub-empty" style="grid-column: 1 / -1;">
            <span style="font-size: 24px; margin-bottom: 6px;">📢</span>
            <strong>No hay avisos por ahora.</strong>
            <p>La coordinación y profesores publicarán comunicados aquí.</p>
          </div>
        `;
      } else {
        container.innerHTML = items.map(item => `
          <div class="mac-card" style="padding: 16px; margin-bottom: 12px; border-left: 5px solid var(--mac-accent-gold);">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--mac-accent-gold); margin-bottom: 4px;">Aviso Oficial</div>
            <h4 style="font-size: 16px; font-weight: 800; color: var(--mac-text-primary); margin-bottom: 6px;">${this.escapeHtml(item.title || item.titulo)}</h4>
            <p style="font-size: 13px; color: var(--mac-text-secondary); line-height: 1.45;">${this.escapeHtml(item.body || item.contenido)}</p>
            <span style="font-size: 11px; color: var(--mac-text-tertiary); display: block; margin-top: 8px;">${item.date || ""}</span>
          </div>
        `).join("");
      }
    },

    renderTareas: function () {
      const container = document.getElementById("mac-tareas-list") || document.getElementById("tareas-active-list");
      if (!container) return;

      const items = (window.EncardomyData && window.EncardomyData.tareas) ? window.EncardomyData.tareas : [];
      if (items.length === 0) {
        container.innerHTML = `
          <div class="mac-hub-empty" style="grid-column: 1 / -1;">
            <span style="font-size: 24px; margin-bottom: 6px;">📝</span>
            <strong>No hay tareas por ahora.</strong>
            <p>Las asignaciones escolares activas se listarán aquí.</p>
          </div>
        `;
      } else {
        container.innerHTML = items.map(item => `
          <div class="mac-card" style="padding: 16px; margin-bottom: 12px; border-left: 5px solid var(--mac-accent-blue);">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--mac-accent-blue); margin-bottom: 4px;">${this.escapeHtml(item.subject || item.materia || 'Tarea')}</div>
            <h4 style="font-size: 16px; font-weight: 800; color: var(--mac-text-primary); margin-bottom: 6px;">${this.escapeHtml(item.title || item.titulo)}</h4>
            <p style="font-size: 13px; color: var(--mac-text-secondary); line-height: 1.45;">Entrega programada: <strong>${this.escapeHtml(item.dueDate || item.fechaEntrega || 'Por definir')}</strong></p>
          </div>
        `).join("");
      }
    },

    renderExamenes: function () {
      const container = document.getElementById("mac-examenes-list") || document.getElementById("examenes-active-list");
      if (!container) return;

      const items = (window.EncardomyData && window.EncardomyData.examenes) ? window.EncardomyData.examenes : [];
      if (items.length === 0) {
        container.innerHTML = `
          <div class="mac-hub-empty" style="grid-column: 1 / -1;">
            <span style="font-size: 24px; margin-bottom: 6px;">📅</span>
            <strong>No hay exámenes por ahora.</strong>
            <p>El calendario de evaluaciones se actualizará conforme a cada profesor.</p>
          </div>
        `;
      } else {
        container.innerHTML = items.map(item => `
          <div class="mac-card" style="padding: 16px; margin-bottom: 12px; border-left: 5px solid var(--mac-accent-red);">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--mac-accent-red); margin-bottom: 4px;">${this.escapeHtml(item.subject || item.materia || 'Examen')}</div>
            <h4 style="font-size: 16px; font-weight: 800; color: var(--mac-text-primary); margin-bottom: 6px;">${this.escapeHtml(item.title || item.temas)}</h4>
            <p style="font-size: 13px; color: var(--mac-text-secondary); line-height: 1.45;">Fecha de aplicación: <strong>${this.escapeHtml(item.date || item.fecha || 'Por definir')}</strong></p>
          </div>
        `).join("");
      }
    },

    /* ========================================================================
       7. BUSCADOR DE PROFESORES TOLERANTE
       ======================================================================== */
    initSearch: function () {
      const input = document.getElementById("mac-prof-search-input") || document.getElementById("search-professors-input");
      const container = document.getElementById("mac-prof-results-container") || document.getElementById("search-results-container");

      if (!input || !container) return;

      const normalize = (text) => {
        return (text || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();
      };

      const professors = window.EncardomyData ? window.EncardomyData.profesores : [];

      const renderProfs = (list) => {
        if (!list || list.length === 0) {
          container.innerHTML = `
            <div class="mac-hub-empty" style="grid-column: 1 / -1;">
              <p>No se encontraron docentes con el criterio ingresado.</p>
            </div>
          `;
          return;
        }

        container.innerHTML = list.map(p => `
          <div class="mac-card" style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <h3 style="font-size: 16px; font-weight: 800; color: var(--mac-text-primary);">${this.escapeHtml(p.name)}</h3>
              <span class="mac-pill" style="font-size: 11px;">Salón: ${this.escapeHtml(p.room || "Asignado")}</span>
            </div>
            <p style="font-size: 13px; color: var(--mac-accent-gold); font-weight: 700;">${this.escapeHtml(p.subject)}</p>
            <p style="font-size: 12px; color: var(--mac-text-secondary); line-height: 1.4;">${this.escapeHtml(p.notes || "Profesor oficial del Grupo 415")}</p>
            <div style="margin-top: auto; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11.5px; color: var(--mac-text-tertiary);">
              Horario asignado en SIHO UNAM
            </div>
          </div>
        `).join("");
      };

      renderProfs(professors);

      input.oninput = () => {
        const query = normalize(input.value);
        if (!query) {
          renderProfs(professors);
          return;
        }

        let querySynonym = query;
        if (query.includes("espanol")) querySynonym += " lengua espanola";
        if (query.includes("lengua espanola")) querySynonym += " espanol";
        if (query.includes("ingles")) querySynonym += " lengua extranjera ingles";
        if (query.includes("fisica")) querySynonym += " fisica iii";
        if (query.includes("historia")) querySynonym += " historia universal iii";

        const filtered = professors.filter(p => {
          const normName = normalize(p.name);
          const normSub = normalize(p.subject);
          const normRoom = normalize(p.room);
          const normNotes = normalize(p.notes);

          const fullString = `${normName} ${normSub} ${normRoom} ${normNotes}`;
          const tokens = querySynonym.split(" ");
          return tokens.some(t => t.length > 2 && fullString.includes(t)) || fullString.includes(query);
        });

        renderProfs(filtered);
      };
    },

    /* ========================================================================
       8. MÓDULO DE ENTREGAS Y TRABAJOS REQUERIDOS (Física, Historia, Español)
       ======================================================================== */
    initRequiredWorksModule: function () {
      const container = document.getElementById("required-works-container");
      const subjectId = container ? container.dataset.subjectId : null;
      if (!container || !subjectId) return;

      const toggleBtn = document.getElementById("toggle-add-work-btn");
      const form = document.getElementById("add-work-form");
      const saveBtn = document.getElementById("save-work-btn");
      const titleInput = document.getElementById("work-title-input");
      const dateInput = document.getElementById("work-date-input");
      const notesInput = document.getElementById("work-notes-input");
      const listElem = document.getElementById("required-works-list");

      const storageKey = "encardomy_trabajos_" + subjectId;

      const getWorks = () => {
        try {
          return JSON.parse(localStorage.getItem(storageKey)) || [];
        } catch (e) {
          return [];
        }
      };

      const saveWorks = (works) => {
        localStorage.setItem(storageKey, JSON.stringify(works));
        renderWorks();
      };

      const renderWorks = () => {
        if (!listElem) return;
        const works = getWorks();
        listElem.innerHTML = "";

        if (works.length === 0) {
          listElem.innerHTML = `
            <div class="mac-hub-empty" style="padding: 16px;">
              <p>No hay entregas pendientes registradas para esta materia.</p>
            </div>
          `;
          return;
        }

        works.forEach((w, idx) => {
          const item = document.createElement("div");
          item.className = "mac-card";
          item.style.padding = "14px";
          item.style.marginBottom = "10px";
          item.style.display = "flex";
          item.style.justifyContent = "space-between";
          item.style.alignItems = "center";

          item.innerHTML = `
            <div>
              <div style="font-size: 14px; font-weight: 700; color: ${w.completed ? 'var(--mac-text-tertiary)' : 'var(--mac-text-primary)'}; text-decoration: ${w.completed ? 'line-through' : 'none'};">
                ${this.escapeHtml(w.title)}
              </div>
              <div style="font-size: 12px; color: var(--mac-accent-gold); margin-top: 2px;">
                📅 Entrega: ${this.escapeHtml(w.date || 'Sin fecha')} ${w.notes ? ` · ${this.escapeHtml(w.notes)}` : ''}
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button style="border: none; background: ${w.completed ? 'var(--mac-accent-green)' : 'rgba(255,255,255,0.1)'}; color: ${w.completed ? '#04140b' : 'var(--mac-text-primary)'}; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700;">
                ${w.completed ? '✓ Hecho' : 'Completar'}
              </button>
              <button style="border: none; background: rgba(255,69,58,0.2); color: #FF453A; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                ✕
              </button>
            </div>
          `;

          const completeBtn = item.querySelectorAll("button")[0];
          const deleteBtn = item.querySelectorAll("button")[1];

          completeBtn.onclick = () => {
            works[idx].completed = !works[idx].completed;
            saveWorks(works);
          };

          deleteBtn.onclick = () => {
            works.splice(idx, 1);
            saveWorks(works);
          };

          listElem.appendChild(item);
        });
      };

      if (toggleBtn && form) {
        toggleBtn.onclick = () => {
          form.style.display = form.style.display === "none" ? "block" : "none";
        };
      }

      if (saveBtn && titleInput) {
        saveBtn.onclick = () => {
          const title = titleInput.value.trim();
          if (!title) return;
          const date = dateInput ? dateInput.value.trim() : "";
          const notes = notesInput ? notesInput.value.trim() : "";

          const works = getWorks();
          works.push({ title, date, notes, completed: false });
          saveWorks(works);

          titleInput.value = "";
          if (dateInput) dateInput.value = "";
          if (notesInput) notesInput.value = "";
          if (form) form.style.display = "none";
        };
      }

      renderWorks();
    },

    /* ========================================================================
       9. FORMULARIO DE PEDIDOS Y MODAL CLIP
       ======================================================================== */
    initOrderForms: function () {
      const form = document.getElementById("mac-order-form") || document.getElementById("ipad-order-form") || document.getElementById("order-form");
      if (!form) return;

      form.onsubmit = (e) => {
        e.preventDefault();
        const item = (document.getElementById("mac-order-item") || document.getElementById("order-item") || {}).value || "";
        const name = (document.getElementById("mac-order-name") || document.getElementById("order-name") || {}).value || "";
        const desc = (document.getElementById("mac-order-desc") || document.getElementById("order-desc") || {}).value || "";
        const qty = (document.getElementById("mac-order-qty") || document.getElementById("order-qty") || {}).value || "1";
        const notes = (document.getElementById("mac-order-notes") || document.getElementById("order-notes") || {}).value || "";

        if (!item.trim() || !name.trim()) {
          alert("Por favor completa al menos el artículo y tu nombre.");
          return;
        }

        const message = 
          `¡Hola! Me comunico desde ENCARDOMY Minweb 415 (Versión Mac).\n` +
          `Me gustaría solicitar el siguiente pedido específico:\n\n` +
          `• Solicitud / Artículo: ${item.trim()}\n` +
          `• Solicitante: ${name.trim()}\n` +
          `• Descripción / Especificaciones: ${desc.trim() || "Estándar"}\n` +
          `• Cantidad solicitada: ${qty}\n` +
          `• Notas adicionales: ${notes.trim() || "Ninguna"}\n\n` +
          `¿Podrían confirmarme los detalles y disponibilidad? ¡Muchas gracias!`;

        const waUrl = `https://wa.me/${this.orderPhone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, "_blank");
      };
    },

    openClipModal: function () {
      const modal = document.getElementById("mac-clip-modal") || document.getElementById("clip-info-modal") || document.getElementById("ipad-clip-modal");
      if (modal) modal.classList.add("show");
    },

    closeClipModal: function () {
      const modal = document.getElementById("mac-clip-modal") || document.getElementById("clip-info-modal") || document.getElementById("ipad-clip-modal");
      if (modal) modal.classList.remove("show");
    },

    initFeedbackForms: function () {
      const sugForm = document.getElementById("sugerencias-form") || document.getElementById("mac-feedback-form");
      if (sugForm) {
        sugForm.onsubmit = (e) => {
          e.preventDefault();
          alert("¡Muchas gracias! Tu sugerencia ha sido enviada al buzón oficial del Grupo 415.");
          sugForm.reset();
        };
      }

      const secBForm = document.getElementById("seccion-b-form");
      if (secBForm) {
        secBForm.onsubmit = (e) => {
          e.preventDefault();
          alert("¡Reporte de Sección B registrado satisfactoriamente!");
          secBForm.reset();
        };
      }
    },

    /* ========================================================================
       10. MODAL DETALLE DE CLASE
       ======================================================================== */
    openDetailModal: function (subject, teacher, room, time, duration, changeNote) {
      const modal = document.getElementById("mac-detail-modal");
      const title = document.getElementById("mac-modal-title");
      const body = document.getElementById("mac-modal-body");

      if (!modal || !title || !body) return;

      title.textContent = subject;

      let changeAlert = "";
      if (changeNote) {
        changeAlert = `
          <div style="background: rgba(255, 149, 0, 0.2); border: 1px solid rgba(255, 149, 0, 0.45); border-radius: 8px; padding: 10px; margin-top: 10px; color: #FFA500; font-size: 13px;">
            ⚠️ <strong>Aviso Importante:</strong> ${this.escapeHtml(changeNote)}
          </div>
        `;
      }

      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <p><strong>Docente a cargo:</strong> ${this.escapeHtml(teacher)}</p>
          <p><strong>Salón asignado:</strong> ${this.escapeHtml(room)}</p>
          <p><strong>Horario:</strong> ${this.escapeHtml(time)}</p>
          <p><strong>Duración del bloque:</strong> ${this.escapeHtml(duration)}</p>
          <p><strong>Grupo:</strong> 415 (Sección ${this.currentSection})</p>
          ${changeAlert}
        </div>
      `;

      modal.classList.add("show");
    },

    closeDetailModal: function () {
      const modal = document.getElementById("mac-detail-modal");
      if (modal) modal.classList.remove("show");
    },

    /* ========================================================================
       11. CAMPANA NAVIDEÑA Y NIEVE
       ======================================================================== */
    initAudioJingle: function () {
      const btn = document.getElementById("mac-btn-chime");
      if (!btn) return;

      btn.onclick = () => {
        this.playChime();
      };
    },

    playChime: function () {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0.001, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.22, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.85);
        });
      } catch (e) {}
    },

    initSnowfall: function () {
      const container = document.querySelector(".mac-snow-layer");
      if (!container) return;

      container.innerHTML = "";
      const count = 35;
      for (let i = 0; i < count; i++) {
        const flake = document.createElement("div");
        flake.className = "mac-snowflake";
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.animationDuration = `${5 + Math.random() * 8}s`;
        flake.style.animationDelay = `${Math.random() * 5}s`;
        flake.style.opacity = `${0.3 + Math.random() * 0.6}`;
        flake.style.transform = `scale(${0.6 + Math.random() * 0.8})`;
        container.appendChild(flake);
      }
    },

    highlightActiveNav: function () {
      const currentPath = window.location.pathname.split("/").pop() || "mac-index.html";
      const links = document.querySelectorAll(".mac-nav-item, .mac-compact-nav-link");
      links.forEach(l => {
        const href = l.getAttribute("href");
        if (href === currentPath) {
          l.classList.add("active");
        } else if (currentPath === "" && href === "mac-index.html") {
          l.classList.add("active");
        }
      });
    },

    escapeHtml: function (text) {
      if (!text) return "";
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    renderAll: function () {
      this.renderSchedule();
      this.initDynamicSync();
    }
  };

  window.MacApp = MacApp;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => MacApp.init());
  } else {
    MacApp.init();
  }
})();
