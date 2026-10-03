/**
 * ENCARDOMY — MINWEB 415
 * Central Real-Time Viewport & Layout Engine
 * 
 * Orquestador Central de Detección Dinámica de Interfaz:
 * 1. Mide continuamente el espacio real disponible en el viewport (CSS pixels):
 *    - window.innerWidth / window.innerHeight
 *    - document.documentElement.clientWidth / clientHeight
 *    - Proporción de aspecto (width / height)
 *    - Orientación (landscape vs portrait)
 * 2. Determina con zona de histeresis (estabilidad en los bordes) la interfaz conveniente:
 *    - CELULAR (< 720px)
 *    - TABLETA (720px a 1120px, o pantallas verticales)
 *    - COMPUTADORA (>= 1120px en formato horizontal / escritorio)
 * 3. Conmuta entre las 3 interfaces en tiempo real SIN RECARGAR LA PÁGINA.
 * 4. Actualiza suavemente la URL en la barra de direcciones con history.replaceState.
 * 5. Notifica y sincroniza el estado de la aplicación (EncardomyApp).
 */

(function () {
  "use strict";

  const LayoutEngine = {
    currentInterface: null, // 'mobile' | 'tablet' | 'desktop'
    currentOrientation: null, // 'portrait' | 'landscape'
    rafId: null,
    resizeObserver: null,

    // Umbrales con histéresis (evita parpadeo en los bordes)
    // Para pasar a tablet: 740px; para volver a mobile: 700px
    // Para pasar a desktop: 1140px; para volver a tablet: 1100px
    THRESHOLDS: {
      MOBILE_TO_TABLET: 740,
      TABLET_TO_MOBILE: 700,
      TABLET_TO_DESKTOP: 1140,
      DESKTOP_TO_TABLET: 1100
    },

    init: function () {
      this.evaluateViewport(true);
      this.setupObservers();
    },

    measureViewport: function () {
      const w = window.innerWidth || document.documentElement.clientWidth || (document.body ? document.body.clientWidth : 0);
      const h = window.innerHeight || document.documentElement.clientHeight || (document.body ? document.body.clientHeight : 0);
      const aspect = h > 0 ? (w / h) : 1;
      const isLandscape = (w > h) || (window.matchMedia && window.matchMedia("(orientation: landscape)").matches);
      const orientation = isLandscape ? "landscape" : "portrait";

      return {
        width: w,
        height: h,
        aspect: aspect,
        isLandscape: isLandscape,
        orientation: orientation
      };
    },

    determineInterface: function (v) {
      const path = (typeof window !== "undefined" && window.location.pathname) ? window.location.pathname.split("/").pop() : "";
      
      // Si la URL es explícitamente ipad-*, siempre preservar la interfaz de tableta
      // y adaptar la composición internamente a la orientación, ancho o Split View real.
      if (path.startsWith("ipad-")) {
        return "tablet";
      }
      
      // Si la URL es explícitamente mac-*, siempre preservar la interfaz de computadora
      // y adaptar la composición internamente al nivel de ventana (compacta, mediana, grande, ultrawide).
      if (path.startsWith("mac-")) {
        return "desktop";
      }

      const w = v.width;
      const aspect = v.aspect;
      const current = this.currentInterface;

      // 1. Si estamos en CELULAR actualmente:
      if (current === "mobile") {
        if (w >= this.THRESHOLDS.MOBILE_TO_TABLET) {
          if (w >= this.THRESHOLDS.TABLET_TO_DESKTOP && aspect >= 1.0) {
            return "desktop";
          }
          return "tablet";
        }
        return "mobile";
      }

      // 2. Si estamos en COMPUTADORA actualmente:
      if (current === "desktop") {
        if (w < this.THRESHOLDS.DESKTOP_TO_TABLET || aspect < 0.85) {
          if (w < this.THRESHOLDS.TABLET_TO_MOBILE) {
            return "mobile";
          }
          return "tablet";
        }
        return "desktop";
      }

      // 3. Si estamos en TABLETA actualmente:
      if (current === "tablet") {
        if (w < this.THRESHOLDS.TABLET_TO_MOBILE) {
          return "mobile";
        }
        if (w >= this.THRESHOLDS.TABLET_TO_DESKTOP && aspect >= 1.0) {
          return "desktop";
        }
        return "tablet";
      }

      // 4. Primera evaluación (sin estado previo para index.html general):
      if (w >= 1140 && aspect >= 0.95) {
        return "desktop";
      } else if (w >= 720) {
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

      // Actualizar variables y atributos globales
      const root = document.documentElement;
      root.style.setProperty("--vw", v.width + "px");
      root.style.setProperty("--vh", v.height + "px");
      root.setAttribute("data-screen-width", String(v.width));
      root.setAttribute("data-screen-height", String(v.height));
      root.setAttribute("data-orientation", v.orientation);
      root.setAttribute("data-ipad-orientation", v.orientation);

      if (document.body) {
        document.body.setAttribute("data-orientation", v.orientation);
        document.body.setAttribute("data-ipad-orientation", v.orientation);
      }

      // Nivel de layout interno proporcional para computadoras Mac
      // Compact: < 920px (1 col fluida sin sidebar ni inspector)
      // Medium: 920px a 1359px (2 col: sidebar + main stage espacioso)
      // Large / Ultrawide: >= 1360px (3 col completas: sidebar + main stage amplio + inspector)
      let macLayout = "large";
      if (v.width < 920) macLayout = "compact";
      else if (v.width < 1360) macLayout = "medium";
      root.setAttribute("data-mac-layout", macLayout);
      if (document.body) document.body.setAttribute("data-mac-layout", macLayout);

      // En iPad: si el ancho es menor a 880px (Split View 1/2 o 1/3, o pantalla angosta),
      // usar modo vertical/dock inferior para evitar que una barra lateral devore la pantalla.
      const ipadEffectiveOrientation = (v.isLandscape && v.width >= 880) ? "landscape" : "portrait";
      root.setAttribute("data-ipad-orientation", ipadEffectiveOrientation);
      if (document.body) document.body.setAttribute("data-ipad-orientation", ipadEffectiveOrientation);

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
      root.setAttribute("data-current-interface", newInterface);
      root.setAttribute("data-device", newInterface);

      if (document.body) {
        document.body.setAttribute("data-current-interface", newInterface);
        document.body.setAttribute("data-device", newInterface);
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
      if (v.width < 920) currentMacMode = "Ventana Compacta (1 Col)";
      else if (v.width < 1360) currentMacMode = "Ventana Mediana (2 Col)";
      document.querySelectorAll(".mac-window-mode-pill").forEach(pill => {
        pill.textContent = currentMacMode;
      });

      // Refrescar componentes activos en el nuevo contenedor sin parpadeo
      if (window.EncardomyApp && typeof window.EncardomyApp.renderApp === "function") {
        window.EncardomyApp.renderApp();
      }

      // Notificar a toda la aplicación
      window.dispatchEvent(new CustomEvent("interfaceChanged", {
        detail: {
          interface: newInterface,
          width: v.width,
          height: v.height,
          orientation: v.orientation,
          aspect: v.aspect
        }
      }));
    },

    syncUrl: function (targetInterface) {
      if (typeof history === "undefined" || !history.replaceState) return;

      const currentPath = window.location.pathname.split("/").pop() || "index.html";
      // Si el usuario ya está en una página dedicada ipad-* o mac-*, mantener la URL intacta
      if (currentPath.startsWith("ipad-") || currentPath.startsWith("mac-")) {
        return;
      }
      let baseName = currentPath;

      if (baseName.startsWith("ipad-")) {
        baseName = baseName.replace("ipad-", "");
      } else if (baseName.startsWith("mac-")) {
        baseName = baseName.replace("mac-", "");
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
          history.replaceState(null, "", targetUrl);
        } catch (e) {
          // Si el protocolo local restringe replaceState, ignorar silenciosamente
        }
      }
    },

    notifyOrientationChange: function (v) {
      if (window.EncardomyApp && typeof window.EncardomyApp.updateClassStatus === "function") {
        window.EncardomyApp.updateClassStatus();
      }
    },

    setupObservers: function () {
      // 1. ResizeObserver en elemento raíz
      if (typeof ResizeObserver === "function") {
        this.resizeObserver = new ResizeObserver(() => {
          this.scheduleEvaluation();
        });
        this.resizeObserver.observe(document.documentElement);
      }

      // 2. Escucha continua de window resize
      window.addEventListener("resize", () => {
        this.scheduleEvaluation();
      });

      // 3. Orientación y rotación
      window.addEventListener("orientationchange", () => {
        setTimeout(() => this.evaluateViewport(false), 80);
      });

      if (window.screen && window.screen.orientation) {
        window.screen.orientation.addEventListener("change", () => {
          this.scheduleEvaluation();
        });
      }

      if (window.matchMedia) {
        window.matchMedia("(orientation: landscape)").addEventListener("change", () => {
          this.scheduleEvaluation();
        });
        window.matchMedia("(min-width: 720px)").addEventListener("change", () => {
          this.scheduleEvaluation();
        });
        window.matchMedia("(min-width: 1120px)").addEventListener("change", () => {
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
