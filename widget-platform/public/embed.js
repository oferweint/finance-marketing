(function() {
  'use strict';

  // Configuration
  const XPOZ_BASE_URL = 'https://widgets.xpoz.io';
  const DEFAULT_WIDTH = '100%';
  const DEFAULT_HEIGHT = '600px';
  const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

  // Track initialized widgets
  const initializedWidgets = new WeakSet();

  /**
   * Initialize a single XPOZ widget element
   */
  function initWidget(element) {
    if (initializedWidgets.has(element)) {
      return;
    }

    const widget = element.dataset.xpozWidget;
    if (!widget) {
      console.warn('[XPOZ] Widget element missing data-xpoz-widget attribute');
      return;
    }

    // Get configuration from data attributes
    const ticker = element.dataset.xpozTicker || '';
    const category = element.dataset.xpozCategory || 'finance';
    const autoRefresh = element.dataset.xpozAutoRefresh === 'true';
    const width = element.dataset.xpozWidth || DEFAULT_WIDTH;
    const height = element.dataset.xpozHeight || DEFAULT_HEIGHT;
    const theme = element.dataset.xpozTheme || 'dark';

    // Build embed URL
    const params = new URLSearchParams();
    if (ticker) params.set('ticker', ticker);
    if (autoRefresh) params.set('autoRefresh', 'true');
    if (theme !== 'dark') params.set('theme', theme);

    const embedUrl = `${XPOZ_BASE_URL}/embed/${category}/${widget}?${params.toString()}`;

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.style.width = width;
    iframe.style.height = height;
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.backgroundColor = '#0f172a';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('title', `XPOZ ${widget} Widget`);

    // Allow fullscreen for any interactive features
    iframe.setAttribute('allowfullscreen', 'true');

    // Clear element and append iframe
    element.innerHTML = '';
    element.appendChild(iframe);

    // Set up auto-refresh if enabled
    if (autoRefresh) {
      setInterval(() => {
        iframe.src = iframe.src; // Reload iframe
      }, REFRESH_INTERVAL);
    }

    // Mark as initialized
    initializedWidgets.add(element);
  }

  /**
   * Initialize all XPOZ widgets on the page
   */
  function initAllWidgets() {
    const widgets = document.querySelectorAll('[data-xpoz-widget]');
    widgets.forEach(initWidget);
  }

  /**
   * Watch for new widget elements added to the DOM
   */
  function watchForNewWidgets() {
    if (typeof MutationObserver === 'undefined') {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a widget
            if (node.dataset && node.dataset.xpozWidget) {
              initWidget(node);
            }
            // Check for widgets within the added node
            const widgets = node.querySelectorAll && node.querySelectorAll('[data-xpoz-widget]');
            if (widgets) {
              widgets.forEach(initWidget);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Public API
   */
  window.XPOZ = window.XPOZ || {};
  window.XPOZ.widgets = {
    init: initAllWidgets,
    initWidget: initWidget,
    version: '1.0.0',
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAllWidgets();
      watchForNewWidgets();
    });
  } else {
    initAllWidgets();
    watchForNewWidgets();
  }
})();
