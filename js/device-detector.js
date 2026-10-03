/**
 * ENCARDOMY — MINWEB 415
 * Automatic Screen Size & Device Detector (Tablet / iPad / Mobile / Desktop)
 * 
 * Funcionalidad:
 * 1. Detecta automáticamente las dimensiones de la pantalla y la orientación.
 * 2. Asigna en tiempo real los atributos data-device ("mobile", "tablet", "desktop")
 *    y data-orientation / data-ipad-orientation ("portrait", "landscape") en <html> y <body>.
 * 3. Sincronizado 100% con LayoutEngine para evitar discrepancias o bucles.
 * 4. Escucha continuamente cambios de tamaño (resize), orientación (orientationchange),
 *    y división de pantalla (iPad Split View) adaptando la interfaz instantáneamente.
 */
(function () {
  "use strict";

  function detectScreen() {
    if (window.LayoutEngine && typeof window.LayoutEngine.evaluateViewport === "function") {
      window.LayoutEngine.evaluateViewport(false);
      return;
    }

    const width = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
    const height = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);

    if (!width || !height) return;

    // Orientación
    const isLandscape = (width > height) || (window.matchMedia && window.matchMedia("(orientation: landscape)").matches);
    const orientation = isLandscape ? "landscape" : "portrait";

    // Clasificación de dispositivo calibrada:
    // Móvil: < 768px
    // Tableta / iPad: 768px a 1199px (incluye iPad Mini 768px, iPad Estándar 810/820px, iPad Air 820px, iPad Pro 11" 834px, iPad Pro 12.9" 1024px)
    // Desktop: >= 1200px (MacBook, iMac, Monitores externos)
    const maxTouch = (typeof navigator !== "undefined" && navigator.maxTouchPoints) ? navigator.maxTouchPoints : 0;
    const isTouch = maxTouch > 0 || (typeof window !== "undefined" && "ontouchstart" in window);
    const ua = (typeof navigator !== "undefined" && navigator.userAgent) ? navigator.userAgent : "";
    const isIPad = isTouch && (/iPad/i.test(ua) || (ua.includes("Macintosh") && maxTouch > 1));

    let device = "mobile";
    if (isIPad) {
      device = width < 680 ? "mobile" : "tablet";
    } else if (width >= 1200 && (!isTouch || width >= 1400)) {
      device = "desktop";
    } else if (width >= 768) {
      device = "tablet";
    } else {
      device = "mobile";
    }

    const isMac = (ua.includes("Macintosh") || (navigator.platform && navigator.platform.toUpperCase().indexOf("MAC") >= 0)) && (maxTouch === 0);
    if (isMac) {
      document.documentElement.setAttribute("data-is-mac", "true");
    }

    // Atributos en <html> y <body>
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute("data-device", device);
    root.setAttribute("data-current-interface", device);
    root.setAttribute("data-orientation", orientation);
    root.setAttribute("data-ipad-orientation", orientation);
    root.setAttribute("data-screen-width", String(width));
    root.setAttribute("data-screen-height", String(height));

    if (body) {
      body.setAttribute("data-device", device);
      body.setAttribute("data-current-interface", device);
      body.setAttribute("data-orientation", orientation);
      body.setAttribute("data-ipad-orientation", orientation);
    }

    // Variables CSS dinámicas de viewport real
    root.style.setProperty("--vw", width + "px");
    root.style.setProperty("--vh", height + "px");

    // Sincronizar badge de orientación si existe en pantalla
    const orientationBadges = document.querySelectorAll(".ipad-orientation-badge, #ipad-orientation-badge");
    orientationBadges.forEach(badge => {
      badge.textContent = isLandscape ? "⟳ Horizontal" : "⟲ Vertical";
      badge.title = `Resolución: ${width} × ${height} px (${device.toUpperCase()})`;
    });

    // Notificar a toda la aplicación
    window.dispatchEvent(new CustomEvent("screenSizeChanged", {
      detail: {
        device: device,
        orientation: orientation,
        width: width,
        height: height,
        isTablet: device === "tablet" || device === "desktop",
        isLandscape: isLandscape
      }
    }));
  }

  // Detección inmediata en carga temprana
  detectScreen();

  // Detección al cargar el DOM completo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", detectScreen);
  } else {
    detectScreen();
  }

  // Detección continua en tiempo real ante redimensionamiento de ventana
  let resizeTimer = null;
  window.addEventListener("resize", function () {
    detectScreen();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(detectScreen, 60);
  }, { passive: true });

  // Giro de pantalla en tabletas y móviles
  window.addEventListener("orientationchange", function () {
    detectScreen();
    setTimeout(detectScreen, 80);
  }, { passive: true });

  if (window.screen && window.screen.orientation) {
    window.screen.orientation.addEventListener("change", detectScreen);
  }

  window.EncardomyDetector = {
    detect: detectScreen
  };
})();
