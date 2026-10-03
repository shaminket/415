/**
 * ENCARDOMY — MINWEB 415
 * Central Real-Time Viewport & Layout Engine
 * 
 * Orquestador Central de Detección Dinámica de Interfaz y Viewport Real:
 * 1. Mide continuamente el espacio real disponible en el viewport (CSS pixels):
 *    - window.innerWidth / window.innerHeight
 *    - document.documentElement.clientWidth / clientHeight
 *    - Proporción de aspecto (width / height)
 *    - Orientación (landscape vs portrait)
 *    - Tipo de dispositivo (touch/iPad vs desktop Mac)
 * 2. Determina con zona de histeresis (estabilidad en los bordes para evitar parpadeos):
 *    - CELULAR (< 768px) → Muestra la interfaz oficial de index.html
 *    - TABLETA / iPad (768px a 1199px, o iPads en rotación vertical/horizontal) → Muestra ipad-index.html
 *    - COMPUTADORA / Mac (>= 1200px en monitores/escritorio) → Muestra mac-index.html
 * 3. Conmuta entre las 3 interfaces en tiempo real SIN RECARGAR LA PÁGINA (sin pérdidas de datos ni estado).
 * 4. Actualiza suavemente la URL en la barra de direcciones con history.replaceState sin reload ni loop.
 * 5. Adapta la vista Mac internamente a: Ventana Pequeña (Compact), Mediana (Medium), Grande (Large) y Pantalla Completa.
 * 6. Adapta la vista iPad a orientación vertical u horizontal y a Split View instantáneamente.
 */

(function () {
  "use strict";

  const LayoutEngine = {
    currentInterface: null, // 'mobile' | 'tablet' | 'desktop'
    currentOrientation: null, // 'portrait' | 'landscape'
    rafId: null,
    resizeObserver: null,

    // Umbrales con histéresis calibrada:
    // Celular < 740px. Entre 740px y 768px preserva el estado actual.
    // Tableta: 768px a 1160px.
    // Entre 1160px y 1200px preserva el estado actual.
    // Mac / Desktop: >= 1200px.
    THRESHOLDS: {
      MOBILE_TO_TABLET: 768,
      TABLET_TO_MOBILE: 740,
      TABLET_TO_DESKTOP: 1200,
      DESKTOP_TO_TABLET: 1160
    },

    init: function () {
      this.evaluateViewport(true);
      this.setupObservers();
    },

    measureViewport: function () {
      const w = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0, (document.body ? document.body.clientWidth : 0));
      const h = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0, (document.body ? document.body.clientHeight : 0));
      const aspect = h > 0 ? (w / h) : 1;
      const isLandscape = (w > h) || (window.matchMedia && window.matchMedia("(orientation: landscape)").matches);
      const orientation = isLandscape ? "landscape" : "portrait";

      // Detección precisa de iPad / pantalla táctil
      const maxTouch = (typeof navigator !== "undefined" && navigator.maxTouchPoints) ? navigator.maxTouchPoints : 0;
      const isTouch = maxTouch > 0 || (typeof window !== "undefined" && "ontouchstart" in window);
      const ua = (typeof navigator !== "undefined" && navigator.userAgent) ? navigator.userAgent : "";
      const isIPad = isTouch && (/iPad/i.test(ua) || (ua.includes("Macintosh") && maxTouch > 1));

      return {
        width: w,
        height: h,
        aspect: aspect,
        isLandscape: isLandscape,
        orientation: orientation,
        isTouch: isTouch,
        isIPad: isIPad
      };
    },

    determineInterface: function (v) {
      const w = v.width;
      const current = this.currentInterface;

      // 1. Detección en iPads reales:
      // En iPad (Mini, estándar, Air, Pro) tanto vertical (768 a 1024px)
      // como horizontal (1024 a 1366px), utilizar la interfaz de Tableta (ipad-index).
      // Solo en Split View angosto (< 680px) usar móvil para no apretar elementos.
      if (v.isIPad) {
        if (w < 680) {
          return "mobile";
        }
        return "tablet";
      }

      // 2. En Mac, laptops, monitores externos o ventanas redimensionables de computadora:
      // Conmutación con histéresis:
      if (current === "mobile") {
        if (w >= this.THRESHOLDS.MOBILE_TO_TABLET) {
          if (w >= this.THRESHOLDS.TABLET_TO_DESKTOP && !v.isTouch) {
            return "desktop";
          }
          return "tablet";
        }
        return "mobile";
      }

      if (current === "tablet") {
        if (w < this.THRESHOLDS.TABLET_TO_MOBILE) {
          return "mobile";
        }
        if (w >= this.THRESHOLDS.TABLET_TO_DESKTOP && (!v.isTouch || w >= 1400)) {
          return "desktop";
        }
        return "tablet";
      }

      if (current === "desktop") {
        if (w < this.THRESHOLDS.DESKTOP_TO_TABLET) {
          if (w < this.THRESHOLDS.TABLET_TO_MOBILE) {
            return "mobile";
          }
          return "tablet";
        }
        return "desktop";
      }

      // 3. Evaluación inicial sin estado previo:
      if (w >= this.THRESHOLDS.TABLET_TO_DESKTOP && (!v.isTouch || w >= 1400)) {
        return "desktop";
      } else if (w >= 768) {
        return "tablet";
      } else {
        return "mobile";
      }
    },

    evaluateViewport: function (immediate) {
      const v = this.measureViewport();
      if (!v.width || !v.height) return;

      const target = this.determineInterface(v);
      const orientationChanged = (this.currentOrientation !== v.orientation);
      const interfaceChanged = (this.currentInterface !== target);

      this.currentOrientation = v.orientation;

      // Actualizar variables y atributos globales en root y body
      const root = document.documentElement;
      const body = document.body;

      root.style.setProperty("--vw", v.width + "px");
      root.style.setProperty("--vh", v.height + "px");
      root.setAttribute("data-screen-width", String(v.width));
      root.setAttribute("data-screen-height", String(v.height));
      root.setAttribute("data-orientation", v.orientation);
      root.setAttribute("data-ipad-orientation", v.orientation);

      if (body) {
        body.setAttribute("data-screen-width", String(v.width));
        body.setAttribute("data-screen-height", String(v.height));
        body.setAttribute("data-orientation", v.orientation);
        body.setAttribute("data-ipad-orientation", v.orientation);
      }

      // Nivel de layout interno adaptable para computadoras Mac:
      // Ventana Compacta: < 960px (1 col fluida sin sidebar ni inspector)
      // Ventana Mediana: 960px a 1359.98px (2 col: sidebar + main stage amplio)
      // Ventana Grande / Pantalla Completa: >= 1360px (3 col completas: sidebar + main stage + inspector)
      let macLayout = "large";
      if (v.width < 960) macLayout = "compact";
      else if (v.width < 1360) macLayout = "medium";
      root.setAttribute("data-mac-layout", macLayout);
      if (body) body.setAttribute("data-mac-layout", macLayout);

      // En iPad: si el ancho es menor a 880px (Split View o vertical), usar modo vertical
      const ipadEffectiveOrientation = (v.isLandscape && v.width >= 880) ? "landscape" : "portrait";
      root.setAttribute("data-ipad-orientation", ipadEffectiveOrientation);
      if (body) body.setAttribute("data-ipad-orientation", ipadEffectiveOrientation);

      // Si cambió de interfaz o es la primera carga:
      if (interfaceChanged || immediate) {
        this.applyInterface(target, v);
      } else if (orientationChanged) {
        this.notifyOrientationChange(v);
      }
    },

    applyInterface: function (newInterface, v) {
      this.currentInterface = newInterface;

      const root = document.documentElement;
      const body = document.body;

      root.setAttribute("data-current-interface", newInterface);
      root.setAttribute("data-device", newInterface);

      if (body) {
        body.setAttribute("data-current-interface", newInterface);
        body.setAttribute("data-device", newInterface);
      }

      // Sincronizar URL suavemente sin recarga (history.replaceState)
      this.syncUrl(newInterface);

      // Sincronizar badges de orientación
      const effectiveIpadMode = (v.isLandscape && v.width >= 880) ? "⟳ Horizontal" : "⟲ Vertical";
      document.querySelectorAll(".ipad-orientation-badge, #ipad-orientation-badge").forEach(badge => {
        badge.textContent = effectiveIpadMode;
        badge.title = `Resolución: ${v.width} × ${v.height} px (${newInterface.toUpperCase()})`;
      });

      // Sincronizar pills de modo de ventana Mac según el ancho real
      let currentMacMode = "Ventana Grande (3 Col)";
      if (v.width < 960) currentMacMode = "Ventana Compacta (1 Col)";
      else if (v.width < 1360) currentMacMode = "Ventana Mediana (2 Col)";
      document.querySelectorAll(".mac-window-mode-pill").forEach(pill => {
        pill.textContent = currentMacMode;
        pill.title = `${v.width} × ${v.height} px — ${currentMacMode}`;
      });

      // Refrescar componentes activos en el nuevo contenedor sin parpadeo ni recarga
      if (window.EncardomyApp && typeof window.EncardomyApp.renderApp === "function") {
        window.EncardomyApp.renderApp();
      }

      // Notificar a toda la aplicación con eventos desacoplados
      window.dispatchEvent(new CustomEvent("interfaceChanged", {
        detail: {
          interface: newInterface,
          width: v.width,
          height: v.height,
          orientation: v.orientation,
          aspect: v.aspect
        }
      }));

      window.dispatchEvent(new CustomEvent("screenSizeChanged", {
        detail: {
          device: newInterface,
          orientation: v.orientation,
          width: v.width,
          height: v.height,
          isTablet: newInterface === "tablet" || newInterface === "desktop",
          isLandscape: v.isLandscape
        }
      }));
    },

    syncUrl: function (targetInterface) {
      const hist = (typeof history !== "undefined" && history.replaceState) ? history : ((typeof window !== "undefined" && window.history && window.history.replaceState) ? window.history : null);
      if (!hist) return;

      const currentPath = (window.location.pathname.split("/").pop() || "index.html");
      
      // Obtener el nombre base del archivo actual (eliminando 'ipad-' o 'mac-')
      let baseName = currentPath;
      if (baseName.startsWith("ipad-")) {
        baseName = baseName.replace("ipad-", "");
      } else if (baseName.startsWith("mac-")) {
        baseName = baseName.replace("mac-", "");
      }
      if (!baseName || baseName === "") {
        baseName = "index.html";
      }

      let targetUrl = baseName;
      if (targetInterface === "tablet") {
        targetUrl = "ipad-" + baseName;
      } else if (targetInterface === "desktop") {
        targetUrl = "mac-" + baseName;
      } else {
        targetUrl = baseName;
      }

      if (targetUrl !== currentPath) {
        try {
          hist.replaceState(null, "", targetUrl);
        } catch (e) {
          // Silenciar restricciones locales de file://
        }
      }
    },

    notifyOrientationChange: function (v) {
      if (window.EncardomyApp && typeof window.EncardomyApp.updateClassStatus === "function") {
        window.EncardomyApp.updateClassStatus();
      }
    },

    setupObservers: function () {
      // 1. ResizeObserver en elemento raíz (supervisión continua de cambios en el contenedor)
      if (typeof ResizeObserver === "function") {
        this.resizeObserver = new ResizeObserver(() => {
          this.scheduleEvaluation();
        });
        this.resizeObserver.observe(document.documentElement);
      }

      // 2. Escucha continua de window resize
      window.addEventListener("resize", () => {
        this.scheduleEvaluation();
      }, { passive: true });

      // 3. Orientación y rotación en iPad y teléfonos móviles
      window.addEventListener("orientationchange", () => {
        setTimeout(() => this.evaluateViewport(false), 60);
      }, { passive: true });

      if (window.screen && window.screen.orientation) {
        window.screen.orientation.addEventListener("change", () => {
          this.scheduleEvaluation();
        });
      }

      // 4. Media queries reactivas para cambios de orientación y puntos de quiebre
      if (window.matchMedia) {
        window.matchMedia("(orientation: landscape)").addEventListener("change", () => {
          this.scheduleEvaluation();
        });
        window.matchMedia("(min-width: 768px)").addEventListener("change", () => {
          this.scheduleEvaluation();
        });
        window.matchMedia("(min-width: 1200px)").addEventListener("change", () => {
          this.scheduleEvaluation();
        });
      }
    },

    scheduleEvaluation: function () {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      this.rafId = requestAnimationFrame(() => {
        this.evaluateViewport(false);
      });
    }
  };

  window.LayoutEngine = LayoutEngine;

  // Ejecución inmediata
  LayoutEngine.init();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => LayoutEngine.evaluateViewport(true));
  }
})();
