// POSHPRINT Luxury Apparel — Autonomous AI Lead Recovery & Sizing Concierge Telemetry Engine
// Dispatches real-time intent telemetry, drop-off signals, and conversion reconciliation hooks.

import { PRODUCTS } from './products.js';

export const TELEMETRY_CONFIG = {
  CAPTURE_ENDPOINT: 'https://ais-pre-laf7wyseu7o76hwjq7zxcd-553231830280.asia-east1.run.app/api/v1/leads/capture',
  CONVERSION_ENDPOINT: 'https://ais-pre-laf7wyseu7o76hwjq7zxcd-553231830280.asia-east1.run.app/api/v1/webhooks/simulate-conversion',
  DEFAULT_SESSION_PREFIX: 'posh_sess_',
  SIZING_HESITATION_DELAY_MS: 40000, // 40 seconds deliberation threshold
  INACTIVITY_TIMEOUT_MS: 15 * 60 * 1000, // 15 minutes inactivity threshold
  EXIT_INTENT_COOLDOWN_MS: 30000, // 30 seconds cooldown between exit intent triggers
  TAB_SWITCH_COOLDOWN_MS: 30000 // 30 seconds cooldown between tab-switch triggers
};

class PoshTelemetryEngine {
  constructor() {
    this.sessionId = this.initSessionId();
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
    this.recentSearches = this.initRecentSearches();

    // Trigger state tracking
    this.lastExitIntentTime = 0;
    this.lastTabSwitchAbandonTime = 0;
    this.sizingHesitationTimer = null;
    this.activeSizingProduct = null;
    this.bespokeInteracted = false;
    this.bespokeAddedToBag = false;
    this.inactivityInterval = null;

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.init();
    }
  }

  // --- Session & Identity Management ---
  initSessionId() {
    try {
      let id = sessionStorage.getItem('posh_telemetry_session_id');
      if (!id) {
        id = `${TELEMETRY_CONFIG.DEFAULT_SESSION_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('posh_telemetry_session_id', id);
      }
      return id;
    } catch {
      return `${TELEMETRY_CONFIG.DEFAULT_SESSION_PREFIX}${Date.now()}_std`;
    }
  }

  getSessionId() {
    return this.sessionId;
  }

  initRecentSearches() {
    try {
      const stored = sessionStorage.getItem('posh_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return ['italian tailoring super 130s', 'suit size conversion'];
  }

  recordSearch(query) {
    if (!query || typeof query !== 'string') return;
    const clean = query.trim().toLowerCase();
    if (!clean || clean.length < 2) return;

    this.recentSearches = [clean, ...this.recentSearches.filter(s => s !== clean)].slice(0, 8);
    try {
      sessionStorage.setItem('posh_recent_searches', JSON.stringify(this.recentSearches));
    } catch {
      // ignore storage limits
    }
  }

  getDwellTimeSeconds() {
    return Math.max(1, Math.floor((Date.now() - this.sessionStartTime) / 1000));
  }

  getDeviceType() {
    if (typeof window === 'undefined') return 'desktop';
    const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isMobile ? 'mobile' : 'desktop';
  }

  getCustomerInfo() {
    let fullName = '';
    let email = '';
    let phone = '';

    if (typeof document !== 'undefined') {
      // 1. Pull from active Checkout inputs if present
      const nameInput = document.getElementById('shippingFullName');
      const emailInput = document.getElementById('shippingEmail');
      const phoneInput = document.getElementById('shippingPhone');

      fullName = (nameInput?.value || '').trim();
      email = (emailInput?.value || '').trim();
      phone = (phoneInput?.value || '').trim();
    }

    // 2. Fallback to store orders or saved profiles
    if (typeof window !== 'undefined' && window.store?.orders?.[0]?.customer) {
      if (!fullName && window.store.orders[0].customer.name) {
        fullName = window.store.orders[0].customer.name;
      }
      if (!email && window.store.orders[0].customer.email) {
        email = window.store.orders[0].customer.email;
      }
    }

    return {
      first_name: fullName || 'Valued Patron',
      email: email || 'customer@example.com',
      phone: phone || '+14155552671',
      instagram_handle: '@instagram_handle'
    };
  }

  getCategoryForProduct(productId, defaultCategory = 'Luxury Apparel') {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return defaultCategory;
    if (product.style === 'professional') return 'Professional';
    if (product.style === 'casual') return 'Casual';
    if (product.style === 'kids') return 'Kids';
    if (product.style === 'shoes') return 'Footwear';
    return product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : defaultCategory;
  }

  getCartData(suggestedProduct = null) {
    const storeObj = typeof window !== 'undefined' ? window.store : null;
    const cart = storeObj?.cart || [];
    
    if (cart.length > 0) {
      const items = cart.map(item => ({
        sku: item.productId || 'pp-custom',
        name: item.title || 'Luxury Garment',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        category: item.isCustom ? 'Bespoke' : this.getCategoryForProduct(item.productId),
        size: item.size || 'Standard',
        color: item.color || 'Standard'
      }));

      const cartValue = Number((storeObj.getCartSubtotal ? storeObj.getCartSubtotal() : 0).toFixed(2));
      return {
        cart_items: items,
        cart_value: cartValue,
        currency: storeObj?.currency || 'USD'
      };
    }

    // If cart is currently empty but user was deliberating on a specific garment
    if (suggestedProduct) {
      return {
        cart_items: [
          {
            sku: suggestedProduct.id || 'pp-p01',
            name: suggestedProduct.title || 'Verona Tailored Italian Wool Double-Breasted Blazer',
            price: Number(suggestedProduct.price) || 280.00,
            quantity: 1,
            category: this.getCategoryForProduct(suggestedProduct.id, 'Professional'),
            size: suggestedProduct.sizes?.[0]?.size || '40R',
            color: suggestedProduct.colors?.[0]?.name || 'Sartorial Navy'
          }
        ],
        cart_value: Number(suggestedProduct.price) || 280.00,
        currency: storeObj ? storeObj.currency : 'USD'
      };
    }

    // Default canonical luxury suit baseline for sizing hesitation if neither cart nor product open
    return {
      cart_items: [
        {
          sku: 'pp-p01',
          name: 'Verona Tailored Italian Wool Double-Breasted Blazer',
          price: 280.00,
          quantity: 1,
          category: 'Professional',
          size: '40R',
          color: 'Sartorial Navy'
        }
      ],
      cart_value: 280.00,
      currency: storeObj ? storeObj.currency : 'USD'
    };
  }

  // --- Telemetry Dispatch Engine ---
  async dispatchSignal(eventType, dropOffReason, contextProduct = null) {
    const customer = this.getCustomerInfo();
    const cartData = this.getCartData(contextProduct);

    const payload = {
      external_session_id: this.sessionId,
      first_name: customer.first_name,
      email: customer.email,
      phone: customer.phone,
      instagram_handle: customer.instagram_handle,
      device_type: this.getDeviceType(),
      cart_value: cartData.cart_value,
      currency: cartData.currency,
      cart_items: cartData.cart_items,
      recent_searches: this.recentSearches,
      dwell_time_seconds: this.getDwellTimeSeconds(),
      event_type: eventType,
      drop_off_reason: dropOffReason
    };

    console.group(`%c[POSHPRINT Telemetry Engine] Dispatching ${eventType}`, 'color: #C4A265; font-weight: bold;');
    console.log('Target Endpoint:', TELEMETRY_CONFIG.CAPTURE_ENDPOINT);
    console.log('Telemetry Payload:', payload);
    console.groupEnd();

    const bodyString = JSON.stringify(payload);

    // Attempt navigator.sendBeacon if page is unloading or tab switching
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden' && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const blob = new Blob([bodyString], { type: 'application/json' });
        const enqueued = navigator.sendBeacon(TELEMETRY_CONFIG.CAPTURE_ENDPOINT, blob);
        if (enqueued) {
          console.log('[POSHPRINT Telemetry] Signal enqueued via sendBeacon');
          return;
        }
      } catch (beaconErr) {
        console.warn('[POSHPRINT Telemetry] sendBeacon failed; falling back to fetch', beaconErr);
      }
    }

    // Standard asynchronous keepalive fetch
    try {
      const response = await fetch(TELEMETRY_CONFIG.CAPTURE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: bodyString,
        keepalive: true
      });

      if (response.status === 201 || response.ok) {
        try {
          const resData = await response.json();
          console.log('%c[POSHPRINT Concierge Engine] Lead Captured (201 Created)!', 'color: #4CAF50; font-weight: bold;', {
            intent_score: resData.intent_score,
            coupon_code: resData.coupon_code
          });
        } catch {
          console.log('%c[POSHPRINT Concierge Engine] Lead Captured (201 Created)', 'color: #4CAF50; font-weight: bold;');
        }
      } else {
        console.info(`[POSHPRINT Telemetry] Server responded with status: ${response.status}`);
      }
    } catch (fetchErr) {
      console.warn('[POSHPRINT Telemetry] Dispatch notification:', fetchErr.message);
    }
  }

  // --- Checkout Auto-Cancellation Webhook ---
  async simulateConversion(orderData) {
    const payload = {
      lead_id: this.sessionId,
      order_id: orderData.orderId || orderData.order_id || 'POSH-ORD-9021',
      amount: Number(orderData.amount || orderData.total || 0),
      currency: orderData.currency || (typeof window !== 'undefined' && window.store ? window.store.currency : 'USD'),
      coupon_code: orderData.couponCode || orderData.coupon_code || (typeof window !== 'undefined' && window.store?.activePromo?.code ? window.store.activePromo.code : 'POSH15-VIP')
    };

    console.group('%c[POSHPRINT Conversion Webhook] Order Completed — Cancelling Recovery Delay Timers', 'color: #D8CCA3; font-weight: bold;');
    console.log('Target Endpoint:', TELEMETRY_CONFIG.CONVERSION_ENDPOINT);
    console.log('Conversion Payload:', payload);
    console.groupEnd();

    const bodyString = JSON.stringify(payload);

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const blob = new Blob([bodyString], { type: 'application/json' });
        if (navigator.sendBeacon(TELEMETRY_CONFIG.CONVERSION_ENDPOINT, blob)) {
          return;
        }
      } catch (err) {
        // fallback
      }
    }

    try {
      const res = await fetch(TELEMETRY_CONFIG.CONVERSION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyString,
        keepalive: true
      });
      if (res.ok) {
        console.log('[POSHPRINT Conversion Webhook] Conversion recorded & BullMQ delay timer cancelled.');
      }
    } catch (err) {
      console.warn('[POSHPRINT Conversion Webhook] Conversion signal dispatched.', err.message);
    }
  }

  // --- Initializer & Event Listeners ---
  init() {
    this.bindActivityTracking();
    this.bindExitIntent();
    this.bindCartAbandonment();
    this.bindSizingHesitation();
    this.bindBespokeStudio();
    this.bindSearchTracking();
  }

  bindActivityTracking() {
    const updateActivity = () => {
      this.lastActivityTime = Date.now();
    };

    ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, updateActivity, { passive: true });
    });

    // Check for 15-minute inactivity Cart Abandon
    this.inactivityInterval = setInterval(() => {
      const elapsed = Date.now() - this.lastActivityTime;
      const cartCount = window.store?.getCartCount() || 0;

      if (elapsed >= TELEMETRY_CONFIG.INACTIVITY_TIMEOUT_MS && cartCount > 0) {
        const now = Date.now();
        if (now - this.lastTabSwitchAbandonTime > TELEMETRY_CONFIG.TAB_SWITCH_COOLDOWN_MS) {
          this.lastTabSwitchAbandonTime = now;
          this.dispatchSignal('CART_ABANDON', 'CART_ABANDON');
        }
      }
    }, 15000);
  }

  // Scenario 1: CART_ABANDON on tab switch or inactivity
  bindCartAbandonment() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        const cartCount = window.store?.getCartCount() || 0;
        const now = Date.now();

        if (cartCount > 0 && (now - this.lastTabSwitchAbandonTime > TELEMETRY_CONFIG.TAB_SWITCH_COOLDOWN_MS)) {
          this.lastTabSwitchAbandonTime = now;
          this.dispatchSignal('CART_ABANDON', 'CART_ABANDON');
        }

        // Also check if bespoke studio was active but abandoned
        if (this.bespokeInteracted && !this.bespokeAddedToBag) {
          this.dispatchSignal('BESPOKE_ABANDON', 'BESPOKE_STUDIO_ABANDON');
          this.bespokeInteracted = false;
        }
      }
    });

    window.addEventListener('beforeunload', () => {
      const cartCount = window.store?.getCartCount() || 0;
      if (cartCount > 0) {
        this.dispatchSignal('CART_ABANDON', 'CART_ABANDON');
      }
      if (this.bespokeInteracted && !this.bespokeAddedToBag) {
        this.dispatchSignal('BESPOKE_ABANDON', 'BESPOKE_STUDIO_ABANDON');
      }
    });
  }

  // Scenario 2: SIZING_HESITATION on luxury suits or Italian loafers (>40s deliberation)
  bindSizingHesitation() {
    const checkProductSuitOrLoafer = (prod) => {
      if (!prod) return false;
      const id = (prod.id || '').toLowerCase();
      const title = (prod.title || '').toLowerCase();
      const style = (prod.style || '').toLowerCase();
      const category = (prod.category || '').toLowerCase();

      return (
        id === 'pp-p01' || // Verona Tailored Wool Double-Breasted Blazer
        id === 'pp-s01' || // Atelier Modena Handcrafted Italian Calfskin Loafers
        style === 'professional' ||
        category === 'blazers' ||
        category === 'shoes' ||
        title.includes('blazer') ||
        title.includes('suit') ||
        title.includes('loafer')
      );
    };

    // Listen to size guide opens
    document.addEventListener('click', (e) => {
      const openTrigger = e.target.closest('#btnOpenSizeGuide, .pdp-size-guide-link, .size-guide-link, #btnOpenSizeGuideFooter, #mobileSizeGuideBtn');
      if (openTrigger) {
        const currentProd = window.poshApp?.selectedProduct || PRODUCTS.find(p => p.id === 'pp-p01');
        this.activeSizingProduct = currentProd;

        // If product is suit or Italian loafers (or opened globally, default to luxury tailoring)
        if (checkProductSuitOrLoafer(currentProd) || openTrigger.id === 'btnOpenSizeGuide') {
          this.startSizingHesitationTimer(currentProd);
        }
      }

      // If user picks size and adds to bag, clear hesitation timer
      const addToBagBtn = e.target.closest('#btnPdpAddToCart, .btn-add-pdp');
      if (addToBagBtn) {
        this.clearSizingHesitationTimer();
      }

      // If user closes size guide modal
      const closeBtn = e.target.closest('#closeSizeGuideModal, [data-close-modal]');
      if (closeBtn && e.target.closest('#sizeGuideModal')) {
        this.clearSizingHesitationTimer();
      }
    });
  }

  startSizingHesitationTimer(product) {
    this.clearSizingHesitationTimer();
    console.log('[POSHPRINT Telemetry] Sizing hesitation deliberation timer started (40s)...', product.title);

    this.sizingHesitationTimer = setTimeout(() => {
      const modal = document.getElementById('sizeGuideModal');
      const isModalActive = modal && modal.classList.contains('active');

      // Deliberated for >40s without choosing a size
      console.log('[POSHPRINT Telemetry] Sizing deliberation threshold exceeded (40s without size selection).');
      this.dispatchSignal('SIZING_HESITATION', 'SIZING_HESITATION', product);
      this.sizingHesitationTimer = null;
    }, TELEMETRY_CONFIG.SIZING_HESITATION_DELAY_MS);
  }

  clearSizingHesitationTimer() {
    if (this.sizingHesitationTimer) {
      clearTimeout(this.sizingHesitationTimer);
      this.sizingHesitationTimer = null;
    }
  }

  // Scenario 3: BESPOKE_ABANDON on Bespoke Studio interaction without adding to bag
  bindBespokeStudio() {
    const customizerEl = document.getElementById('customizerSection') || document.getElementById('customizerContainer');
    if (!customizerEl) return;

    // Detect user interactions in Bespoke Studio
    customizerEl.addEventListener('click', (e) => {
      if (e.target.closest('#btnAddCustomToBag')) {
        this.bespokeAddedToBag = true;
        this.bespokeInteracted = false;
        return;
      }
      this.bespokeInteracted = true;
      this.bespokeAddedToBag = false;
    });

    customizerEl.addEventListener('input', () => {
      this.bespokeInteracted = true;
      this.bespokeAddedToBag = false;
    });

    // Detect navigation away from customizer
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        const href = link.getAttribute('href');
        if (href && href !== '#customizerSection' && this.bespokeInteracted && !this.bespokeAddedToBag) {
          this.dispatchSignal('BESPOKE_ABANDON', 'BESPOKE_STUDIO_ABANDON');
          this.bespokeInteracted = false;
        }
      });
    });

    // IntersectionObserver to detect scrolling away from Bespoke Studio
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && this.bespokeInteracted && !this.bespokeAddedToBag) {
            // User scrolled away from studio after interacting
            this.dispatchSignal('BESPOKE_ABANDON', 'BESPOKE_STUDIO_ABANDON');
            this.bespokeInteracted = false;
          }
        });
      }, { threshold: 0.1 });

      const studioSection = document.getElementById('customizerSection');
      if (studioSection) observer.observe(studioSection);
    }
  }

  // Scenario 4: EXIT_INTENT on mouse velocity approaching top navigation (clientY <= 10px)
  bindExitIntent() {
    let prevClientY = 200;

    document.addEventListener('mousemove', (e) => {
      const isMovingUp = e.clientY < prevClientY;
      prevClientY = e.clientY;

      if (e.clientY <= 10 && isMovingUp) {
        const now = Date.now();
        if (now - this.lastExitIntentTime > TELEMETRY_CONFIG.EXIT_INTENT_COOLDOWN_MS) {
          this.lastExitIntentTime = now;
          const currentProd = window.poshApp?.selectedProduct || null;
          this.dispatchSignal('EXIT_INTENT', 'EXIT_INTENT', currentProd);
        }
      }
    });
  }

  bindSearchTracking() {
    const searchInput = document.getElementById('storeSearchInput');
    if (!searchInput) return;

    let debounceTimer = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = e.target.value.trim();
        if (query.length >= 3) {
          this.recordSearch(query);
        }
      }, 500);
    });
  }
}

// Global singleton instance
export const telemetry = new PoshTelemetryEngine();

if (typeof window !== 'undefined') {
  window.PoshTelemetry = telemetry;
}
