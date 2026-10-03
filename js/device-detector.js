/**
 * ENCARDOMY — MINWEB 415
 * Automatic Screen Size & Device Detector (Tablet / iPad / Mobile / Desktop)
 * 
 * Funcionalidad:
 * 1. Detecta automáticamente las dimensiones de la pantalla y la orientación.
 * 2. Asigna en tiempo real los atributos data-device ("mobile", "tablet", "desktop")
 *    y data-orientation / data-ipad-orientation ("portrait", "landscape") en <html> y <body>.
 * 3. Escucha continuamente cambios de tamaño (resize), orientación (orientationchange),
 *    y división de pantalla (iPad Split View 1/3, 1/2, 2/3) adaptando la interfaz
 *    instantáneamente sin recargar la página.
 */
(function () {
  "use strict";

  function detectScreen() {
    const width = window.innerWidth || document.documentElement.clientWidth || (document.body ? document.body.clientWidth : 0);
    const height = window.innerHeight || document.documentElement.clientHeight || (document.body ? document.body.clientHeight : 0);

    if (!width || !height) return;

    // Orientación
    const isLandscape = (width > height) || (window.matchMedia && window.matchMedia("(orientation: landscape)").matches);
    const orientation = isLandscape ? "landscape" : "portrait";

    // Clasificación de dispositivo
    // Móvil: < 768px
    // Tableta / iPad: 768px a 1366px (incluye iPad Mini 768px, iPad Estándar 810/820px, iPad Air 820px, iPad Pro 11" 834px, iPad Pro 12.9" 1024/1366px)
    // Desktop: > 1366px
    let device = "mobile";
    if (width >= 768 && width <= 1366) {
      device = "tablet";
    } else if (width > 1366) {
      device = "desktop";
    }

    // Detección complementaria de iPad por User Agent y pantalla táctil
    const isMac = (navigator.userAgent.includes("Macintosh") || (navigator.platform && navigator.platform.toUpperCase().indexOf("MAC") >= 0)) && (!navigator.maxTouchPoints || navigator.maxTouchPoints === 0);
    const isIPadOS = (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1) || /iPad/i.test(navigator.userAgent);
    if (isMac) {
      document.documentElement.setAttribute("data-is-mac", "true");
    }
    if (isIPadOS && width >= 600) {
      device = "tablet";
    }

    // Atributos en <html> y <body>
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute("data-device", device);
    root.setAttribute("data-orientation", orientation);
    root.setAttribute("data-ipad-orientation", orientation);
    root.setAttribute("data-screen-width", String(width));
    root.setAttribute("data-screen-height", String(height));

    if (body) {
      body.setAttribute("data-device", device);
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
      badge.title = `Resolución detectada: ${width} × ${height} px (${device.toUpperCase()})`;
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
    resizeTimer = setTimeout(detectScreen, 80);
  });

  // Giro de pantalla en tabletas y móviles
  window.addEventListener("orientationchange", function () {
    detectScreen();
    setTimeout(detectScreen, 120);
  });

  if (window.screen && window.screen.orientation) {
    window.screen.orientation.addEventListener("change", detectScreen);
  }

  if (window.matchMedia) {
    window.matchMedia("(orientation: landscape)").addEventListener("change", detectScreen);
    window.matchMedia("(min-width: 768px)").addEventListener("change", detectScreen);
    window.matchMedia("(min-width: 1024px)").addEventListener("change", detectScreen);
  }

  window.EncardomyDetector = {
    detect: detectScreen
  };
})();
