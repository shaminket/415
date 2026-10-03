/**
 * ENCARDOMY MINWEB 415 — MÓDULO OFICIAL DE HERRAMIENTAS PDF24
 * Inicialización controlada, carga única de scripts y protección estricta contra overflow.
 */

(function () {
  'use strict';

  // 1. Catálogo Completo de las 14 Herramientas PDF24
  const PDF_TOOLS_CATALOG = [
    {
      id: 'compress-pdf',
      containerId: 'compressPdfWidgetContainer',
      title: 'Comprimir PDF',
      icon: '🗜️',
      category: 'optimizar',
      desc: 'Reduce el tamaño de tus archivos PDF manteniendo la mejor legibilidad y calidad posible para compartirlos o enviarlos.',
      hasWidget: true
    },
    {
      id: 'merge-pdf',
      containerId: 'mergePdfWidgetContainer',
      title: 'Fusionar PDF',
      icon: '📑',
      category: 'organizar',
      desc: 'Combina múltiples archivos PDF en un solo documento unificado de forma rápida y sencilla.',
      hasWidget: true
    },
    {
      id: 'split-pdf',
      containerId: 'splitPdfWidgetContainer',
      title: 'Dividir PDF',
      icon: '✂️',
      category: 'organizar',
      desc: 'Separa un documento PDF por páginas concretas o rangos seleccionados para crear nuevos archivos individuales.',
      hasWidget: true
    },
    {
      id: 'convert-to-pdf',
      containerId: 'convertToPdfWidgetContainer',
      title: 'Convertir a PDF',
      icon: '📄',
      category: 'convertir',
      desc: 'Convierte archivos Word, Excel, PowerPoint, imágenes y otros formatos en documentos PDF de alta fidelidad.',
      hasWidget: true
    },
    {
      id: 'convert-pdf-to',
      containerId: 'convertPdfToWidgetContainer',
      title: 'Convertir PDF a otros formatos',
      icon: '🔄',
      category: 'convertir',
      desc: 'Exporta tus documentos PDF a formatos editables como Word, texto, imágenes y más.',
      hasWidget: true
    },
    {
      id: 'flatten-pdf',
      containerId: 'flattenPdfWidgetContainer',
      title: 'Aplanar PDF',
      icon: '🥞',
      category: 'optimizar',
      desc: 'Fusiona formularios interactivos, capas y anotaciones en una única capa visible e inmutable del PDF.',
      hasWidget: false, // NOTA REQUERIDA: PDF24 no tiene widget nativo para aplanar (usa merge-pdf por error en su doc). Se presenta honestamente sin simular.
      webFallbackUrl: 'https://tools.pdf24.org/es/aplanar-pdf'
    },
    {
      id: 'unlock-pdf',
      containerId: 'unlockPdfWidgetContainer',
      title: 'Desbloquear PDF',
      icon: '🔓',
      category: 'seguridad',
      desc: 'Elimina restricciones y contraseñas de seguridad de documentos PDF legítimos para permitir lectura y edición.',
      hasWidget: true
    },
    {
      id: 'lock-pdf',
      containerId: 'lockPdfWidgetContainer',
      title: 'Proteger PDF',
      icon: '🔒',
      category: 'seguridad',
      desc: 'Añade una contraseña robusta y cifrado digital a tus documentos PDF para proteger su privacidad.',
      hasWidget: true
    },
    {
      id: 'extract-pdf-pages',
      containerId: 'extractPdfPagesWidgetContainer',
      title: 'Extraer páginas de PDF',
      icon: '📥',
      category: 'paginas',
      desc: 'Selecciona y extrae únicamente las páginas necesarias de tu documento PDF en un nuevo archivo.',
      hasWidget: true
    },
    {
      id: 'remove-pdf-pages',
      containerId: 'removePdfPagesWidgetContainer',
      title: 'Eliminar páginas del PDF',
      icon: '🗑️',
      category: 'paginas',
      desc: 'Borra fácilmente las páginas sobrantes o en blanco de tu documento PDF.',
      hasWidget: true
    },
    {
      id: 'rotate-pdf-pages',
      containerId: 'rotatePdfPagesWidgetContainer',
      title: 'Rotar páginas de PDF',
      icon: '🔄',
      category: 'paginas',
      desc: 'Gira 90°, 180° o 270° la orientación de páginas específicas o de todo el documento PDF.',
      hasWidget: true
    },
    {
      id: 'sort-pdf-pages',
      containerId: 'sortPdfPagesWidgetContainer',
      title: 'Reordenar páginas de PDF',
      icon: '🔀',
      category: 'paginas',
      desc: 'Cambia el orden de las páginas de tu archivo PDF arrastrando y soltando visualmente.',
      hasWidget: true
    },
    {
      id: 'images-to-pdf',
      containerId: 'imagesToPdfWidgetContainer',
      title: 'Imágenes a PDF',
      icon: '🖼️',
      category: 'imagenes',
      desc: 'Convierte tus fotos, escaneos e imágenes (JPG, PNG) en un único documento PDF compilado.',
      hasWidget: true
    },
    {
      id: 'extract-pdf-images',
      containerId: 'extractPdfImagesWidgetContainer',
      title: 'Extraer imágenes de PDF',
      icon: '📷',
      category: 'imagenes',
      desc: 'Extrae todas las imágenes y gráficos contenidos dentro de tu PDF guardándolos en alta resolución.',
      hasWidget: true
    }
  ];

  // Estado del Gestor
  let isScriptLoaded = false;
  let isScriptLoading = false;
  const initializedWidgets = new Set();
  let currentActiveToolId = 'compress-pdf';
  let sharedWorkspaceElem = null;

  /**
   * Carga única y eficiente del script oficial de PDF24
   */
  function ensurePdf24Script(callback) {
    if (window.pdf24 && typeof window.pdf24.loadWidget === 'function') {
      isScriptLoaded = true;
      if (callback) callback();
      return;
    }

    if (isScriptLoaded) {
      if (callback) callback();
      return;
    }

    // Si ya se está cargando, esperar evento
    if (isScriptLoading) {
      window.addEventListener('pdf24-script-ready', function onReady() {
        window.removeEventListener('pdf24-script-ready', onReady);
        if (callback) callback();
      });
      return;
    }

    isScriptLoading = true;
    const script = document.createElement('script');
    script.src = 'https://tools.pdf24.org/static/js/widget.js';
    script.async = true;
    script.onload = function () {
      isScriptLoaded = true;
      isScriptLoading = false;
      window.dispatchEvent(new CustomEvent('pdf24-script-ready'));
      if (callback) callback();
    };
    script.onerror = function (err) {
      console.warn('El script de PDF24 requiere conexión activa a internet:', err);
      isScriptLoading = false;
    };
    document.head.appendChild(script);
  }

  /**
   * Inicializa un widget específico respetando el contrato de PDF24
   */
  function initWidget(tool) {
    if (!tool.hasWidget) return;
    if (initializedWidgets.has(tool.id)) return;

    const container = document.getElementById(tool.containerId);
    if (!container) return;

    // Asegurar clases y estilos de contención responsive
    container.classList.add('pdf24WidgetContainer');

    ensurePdf24Script(function () {
      if (!window.pdf24 || typeof window.pdf24.loadWidget !== 'function') {
        const loading = container.querySelector('.pdf-tool-loading-state');
        if (loading) {
          loading.innerHTML = '<span style="color: var(--accent-gold); font-size: 13px; text-align: center;">⚡ Conectando con los servidores seguros de PDF24...</span>';
        }
        return;
      }

      try {
        window.pdf24.loadWidget(tool.id, {
          containerId: tool.containerId,
          langCode: 'es',
          readyCallback: function () {
            console.log('PDF24 widget ready:', tool.id);
            initializedWidgets.add(tool.id);
            const spinner = container.querySelector('.pdf-tool-loading-state');
            if (spinner) spinner.style.display = 'none';

            // Monitorear y contener estrictamente el iframe
            sanitizeIframes(container);
          },
          widgetConfig: {
            theme: 'lightTheme'
          }
        });
        initializedWidgets.add(tool.id);
      } catch (e) {
        console.error('Error al inicializar widget PDF24:', tool.id, e);
      }
    });
  }

  /**
   * Aplica contención responsive forzada a los iframes inyectados por PDF24
   */
  function sanitizeIframes(scopeElement) {
    if (!scopeElement) return;
    const iframes = scopeElement.querySelectorAll('iframe');
    iframes.forEach(function (iframe) {
      iframe.style.setProperty('width', '100%', 'important');
      iframe.style.setProperty('max-width', '100%', 'important');
      iframe.style.setProperty('min-width', '0', 'important');
      iframe.style.setProperty('border', 'none', 'important');
      iframe.style.setProperty('box-sizing', 'border-box', 'important');
    });
  }

  /**
   * Cambia la herramienta activa de forma fluida
   */
  function setActiveTool(toolId) {
    currentActiveToolId = toolId;
    const tool = PDF_TOOLS_CATALOG.find(t => t.id === toolId) || PDF_TOOLS_CATALOG[0];

    // 1. Actualizar botones activos
    document.querySelectorAll('.pdf-tool-tab-btn, .pdf-summary-card').forEach(btn => {
      const isTarget = btn.getAttribute('data-tool-id') === tool.id;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    // 2. Ocultar todas las secciones de herramientas y mostrar la activa
    document.querySelectorAll('.pdf-tool-section-wrapper').forEach(wrapper => {
      const isMatch = wrapper.getAttribute('data-tool-id') === tool.id;
      wrapper.style.display = isMatch ? 'block' : 'none';
      if (isMatch) {
        wrapper.removeAttribute('hidden');
      } else {
        wrapper.setAttribute('hidden', 'true');
      }
    });

    // 3. Inicializar el widget si no está inicializado
    if (tool.hasWidget) {
      initWidget(tool);
    }

    // 4. Asegurar que ningún iframe o contenedor desborde
    const activeContainer = document.getElementById(tool.containerId);
    if (activeContainer) {
      sanitizeIframes(activeContainer);
    }
  }

  /**
   * Genera el elemento DOM único con todas las herramientas
   */
  function buildWorkspaceElement() {
    if (sharedWorkspaceElem) return sharedWorkspaceElem;

    const root = document.createElement('div');
    root.id = 'encardomy-pdf-tools-root';
    root.className = 'pdf-tools-suite';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'Herramientas PDF Escolares');

    let html = `
      <!-- Encabezado de la Suite -->
      <div class="pdf-tools-header">
        <div class="pdf-tools-header-badge">
          <span>🛠️</span>
          <span>Utilidades Académicas Oficiales</span>
        </div>
        <h2 class="pdf-tools-header-title">Herramientas PDF</h2>
        <p class="pdf-tools-header-desc">
          Suite integral de utilidades PDF impulsada por tecnología oficial PDF24. Optimiza, organiza, asegura y transforma tus documentos académicos del Grupo 415 sin salir de Encardomy.
        </p>
      </div>

      <!-- Barra de Filtros / Selector Rápido de Pestañas -->
      <div class="pdf-tools-nav-track" role="tablist" aria-label="Herramientas disponibles">
    `;

    PDF_TOOLS_CATALOG.forEach((tool, index) => {
      const isActive = index === 0;
      html += `
        <button type="button" 
                class="pdf-tool-tab-btn ${isActive ? 'active' : ''}" 
                role="tab" 
                aria-selected="${isActive ? 'true' : 'false'}" 
                data-tool-id="${tool.id}">
          <span aria-hidden="true">${tool.icon}</span>
          <span>${tool.title}</span>
        </button>
      `;
    });

    html += `
      </div>

      <!-- Cuadrícula Resumida de Herramientas -->
      <div class="pdf-tools-grid-summary" aria-label="Acceso rápido a utilidades">
    `;

    PDF_TOOLS_CATALOG.forEach((tool, index) => {
      const isActive = index === 0;
      html += `
        <div class="pdf-summary-card ${isActive ? 'active' : ''}" 
             role="button" 
             tabindex="0" 
             data-tool-id="${tool.id}" 
             title="${tool.title}">
          <span class="pdf-summary-card-icon" aria-hidden="true">${tool.icon}</span>
          <span class="pdf-summary-card-title">${tool.title}</span>
        </div>
      `;
    });

    html += `
      </div>

      <!-- Escenarios Individuales para cada Herramienta -->
      <div class="pdf-tools-stages-stack">
    `;

    PDF_TOOLS_CATALOG.forEach((tool, index) => {
      const isFirst = index === 0;
      html += `
        <section class="pdf-tool-section-wrapper" 
                 data-tool-id="${tool.id}" 
                 style="display: ${isFirst ? 'block' : 'none'};" 
                 ${isFirst ? '' : 'hidden'}>
          <div class="pdf-tool-stage-card">
            <div class="pdf-tool-stage-header">
              <div class="pdf-tool-stage-info">
                <h3 class="pdf-tool-stage-title">
                  <span aria-hidden="true">${tool.icon}</span>
                  <span>${tool.title}</span>
                </h3>
                <p class="pdf-tool-stage-desc">${tool.desc}</p>
              </div>
              <div class="pdf-tool-stage-status">
                <span class="pdf-tool-badge-official">
                  <span>✓</span>
                  <span>Motor Oficial PDF24</span>
                </span>
              </div>
            </div>

            <!-- Contenedor del Widget o Aviso Especial -->
      `;

      if (tool.hasWidget) {
        html += `
            <div id="${tool.containerId}" class="pdf24WidgetContainer" role="region" aria-label="Widget para ${tool.title}">
              <div class="pdf-tool-loading-state">
                <div class="pdf-spinner" aria-hidden="true"></div>
                <span>Cargando herramienta segura de PDF24...</span>
              </div>
            </div>
        `;
      } else {
        // Caso especial Aplanar PDF (Flatten PDF) solicitado estrictamente en el prompt
        html += `
            <div class="pdf-tool-notice-card" role="alert">
              <div class="pdf-tool-notice-icon" aria-hidden="true">ℹ️</div>
              <div class="pdf-tool-notice-content">
                <h4>Función en Espera de Widget Nativo</h4>
                <p>
                  La plataforma oficial de PDF24 no cuenta actualmente con un widget independiente para <strong>Aplanar PDF</strong> (su documentación técnica asigna erróneamente el código de <em>Fusionar PDF</em>).
                </p>
                <p>
                  Por transparencia y rigor en Encardomy, no simulamos esta función con un widget incorrecto. Puedes utilizar la herramienta oficial directa en la web de PDF24:
                </p>
                <a href="${tool.webFallbackUrl}" target="_blank" rel="noopener noreferrer" class="pdf-tool-notice-btn">
                  <span>Abrir Aplanar PDF en PDF24 Oficial</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
        `;
      }

      html += `
          </div>
        </section>
      `;
    });

    html += `
      </div>
    `;

    root.innerHTML = html;

    // Vincular Eventos de Interacción
    root.querySelectorAll('[data-tool-id]').forEach(elem => {
      elem.addEventListener('click', function () {
        const id = this.getAttribute('data-tool-id');
        if (id) setActiveTool(id);
      });
      elem.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = this.getAttribute('data-tool-id');
          if (id) setActiveTool(id);
        }
      });
    });

    sharedWorkspaceElem = root;
    return sharedWorkspaceElem;
  }

  /**
   * Conecta el espacio de trabajo en el contenedor activo del dispositivo
   */
  function syncWithActiveInterface() {
    const root = buildWorkspaceElement();
    const currentInterface = document.documentElement.getAttribute('data-current-interface') || 'desktop';

    let targetMount = null;
    if (currentInterface === 'mobile') {
      targetMount = document.getElementById('pdf-tools-mount-mobile');
    } else if (currentInterface === 'tablet') {
      targetMount = document.getElementById('pdf-tools-mount-tablet');
    } else {
      targetMount = document.getElementById('pdf-tools-mount-desktop');
    }

    if (!targetMount) {
      // Fallback a cualquier contenedor visible
      targetMount = document.getElementById('pdf-tools-mount-mobile') || 
                    document.getElementById('pdf-tools-mount-tablet') || 
                    document.getElementById('pdf-tools-mount-desktop');
    }

    if (targetMount && root.parentElement !== targetMount) {
      targetMount.appendChild(root);
      // Asegurar que la herramienta activa esté inicializada en el contenedor
      setActiveTool(currentActiveToolId);
    }
  }

  // API Global Exportada
  window.EncardomyPdfTools = {
    sync: syncWithActiveInterface,
    selectTool: setActiveTool,
    initWidget: initWidget,
    catalog: PDF_TOOLS_CATALOG
  };

  // Inicialización Automática
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      syncWithActiveInterface();
      window.addEventListener('interfaceChanged', syncWithActiveInterface);
      window.addEventListener('encardomy-interface-changed', syncWithActiveInterface);
      window.addEventListener('resize', syncWithActiveInterface);
    });
  } else {
    syncWithActiveInterface();
    window.addEventListener('interfaceChanged', syncWithActiveInterface);
    window.addEventListener('encardomy-interface-changed', syncWithActiveInterface);
    window.addEventListener('resize', syncWithActiveInterface);
  }

})();
