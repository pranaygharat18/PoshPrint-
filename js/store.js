// POSHPRINT Luxury Apparel — Reactive Store & State Management
// Enforces Section 1 Security: Strict input sanitization, anti-tamper price verification.

import { PRODUCTS } from './products.js';

const STORAGE_KEYS = {
  CART: 'poshprint_cart_v2',
  WISHLIST: 'poshprint_wishlist_v2',
  ORDERS: 'poshprint_orders_v2',
  CURRENCY: 'poshprint_currency_v2',
  PROMO: 'poshprint_promo_v2'
};

const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)' },
  INR: { symbol: '₹', rate: 83.5, label: 'INR (₹)' }
};

const PROMO_CODES = {
  'POSH15': { discountPercent: 15, description: '15% Off Luxury Order' },
  'DROP20': { discountPercent: 20, description: '20% Off Spring Drop' },
  'FREESHIP': { freeShipping: true, description: 'Free Worldwide Express Shipping' }
};

const safeStorage = {
  getItem: (k) => (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(k) : null),
  setItem: (k, v) => { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(k, v); },
  removeItem: (k) => { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(k); }
};

class Store {
  constructor() {
    this.cart = this.loadCart();
    this.wishlist = this.loadWishlist();
    this.orders = this.loadOrders();
    this.currency = safeStorage.getItem(STORAGE_KEYS.CURRENCY) || 'USD';
    this.activePromo = this.loadPromo();
    this.searchQuery = '';
    this.filters = {
      style: 'all',
      category: 'all',
      gender: 'all',
      size: 'all',
      color: 'all',
      maxPrice: 350,
      sortBy: 'featured'
    };
  }

  // --- Security: HTML Sanitizer to prevent XSS (Section 1.4) ---
  sanitize(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Currency Handling ---
  setCurrency(curr) {
    if (CURRENCIES[curr]) {
      this.currency = curr;
      safeStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
      this.emit('currency:changed', { currency: curr });
      this.emit('cart:updated');
    }
  }

  formatPrice(usdAmount) {
    const curr = CURRENCIES[this.currency] || CURRENCIES.USD;
    const converted = usdAmount * curr.rate;
    if (this.currency === 'INR') {
      return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${curr.symbol}${converted.toFixed(0)}`;
  }

  // --- Cart Management with Price Tampering Protection ---
  loadCart() {
    try {
      const data = JSON.parse(safeStorage.getItem(STORAGE_KEYS.CART) || '[]');
      if (!Array.isArray(data)) return [];
      // Verify items against canonical PRODUCTS catalog to prevent tamper
      return data.filter(item => {
        if (item.isCustom) return true; // Custom studio order
        const real = PRODUCTS.find(p => p.id === item.productId);
        if (real) {
          item.price = real.price; // Force canonical server price
          item.title = real.title;
          return true;
        }
        return false;
      });
    } catch (e) {
      console.warn('Cart data corrupted; resetting.', e);
      return [];
    }
  }

  saveCart() {
    safeStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(this.cart));
    this.emit('cart:updated', { count: this.getCartCount(), subtotal: this.getCartSubtotal() });
  }

  addToCart({ productId, size, color, quantity = 1, isCustom = false, customData = null }) {
    quantity = Math.max(1, parseInt(quantity, 10) || 1);
    
    let price = 0;
    let title = '';
    let image = '';

    if (isCustom && customData) {
      price = customData.calculatedPrice;
      title = `Custom Studio: ${customData.garmentName}`;
      image = customData.previewImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';
    } else {
      const product = PRODUCTS.find(p => p.id === productId);
      if (!product) return { success: false, message: 'Garment not found' };
      price = product.price;
      title = product.title;
      image = product.images[0];
    }

    // Check if duplicate variant exists in cart
    const existingIndex = this.cart.findIndex(item => 
      item.productId === productId && 
      item.size === size && 
      item.color === color &&
      item.isCustom === isCustom
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        productId,
        title,
        price,
        size,
        color,
        quantity,
        image,
        isCustom,
        customData
      });
    }

    this.saveCart();
    this.emit('toast:show', { message: `Added "${title}" (${size}) to Bag`, type: 'success' });
    return { success: true };
  }

  updateCartQty(cartItemId, delta) {
    const item = this.cart.find(i => i.id === cartItemId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.cart = this.cart.filter(i => i.id !== cartItemId);
      this.emit('toast:show', { message: 'Item removed from Bag', type: 'info' });
    }
    this.saveCart();
  }

  removeCartItem(cartItemId) {
    this.cart = this.cart.filter(i => i.id !== cartItemId);
    this.saveCart();
    this.emit('toast:show', { message: 'Item removed from Bag', type: 'info' });
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getCartTotal() {
    return this.getCartSubtotal();
  }

  // --- Promo Engine ---
  loadPromo() {
    try {
      const code = safeStorage.getItem(STORAGE_KEYS.PROMO);
      return code && PROMO_CODES[code] ? { code, ...PROMO_CODES[code] } : null;
    } catch {
      return null;
    }
  }

  applyPromoCode(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (PROMO_CODES[cleanCode]) {
      this.activePromo = { code: cleanCode, ...PROMO_CODES[cleanCode] };
      safeStorage.setItem(STORAGE_KEYS.PROMO, cleanCode);
      this.emit('cart:updated');
      this.emit('toast:show', { message: `Promo code "${cleanCode}" applied!`, type: 'success' });
      return { success: true, promo: this.activePromo };
    }
    return { success: false, message: 'Invalid promo code. Try POSH15 or DROP20' };
  }

  removePromo() {
    this.activePromo = null;
    safeStorage.removeItem(STORAGE_KEYS.PROMO);
    this.emit('cart:updated');
  }

  getCartSummary() {
    const subtotal = this.getCartSubtotal();
    let discount = 0;
    let shipping = subtotal >= 150 ? 0 : 25; // Free over $150

    if (this.activePromo) {
      if (this.activePromo.discountPercent) {
        discount = (subtotal * this.activePromo.discountPercent) / 100;
      }
      if (this.activePromo.freeShipping) {
        shipping = 0;
      }
    }

    const total = Math.max(0, subtotal - discount + shipping);

    return {
      subtotal,
      discount,
      shipping,
      total,
      freeShippingThreshold: 150,
      amountToFreeShipping: Math.max(0, 150 - subtotal)
    };
  }

  // --- Wishlist Management ---
  loadWishlist() {
    try {
      return JSON.parse(safeStorage.getItem(STORAGE_KEYS.WISHLIST) || '[]');
    } catch {
      return [];
    }
  }

  toggleWishlist(productId) {
    const exists = this.wishlist.includes(productId);
    if (exists) {
      this.wishlist = this.wishlist.filter(id => id !== productId);
      this.emit('toast:show', { message: 'Removed from Wishlist', type: 'info' });
    } else {
      this.wishlist.push(productId);
      this.emit('toast:show', { message: 'Saved to Wishlist', type: 'success' });
    }
    safeStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(this.wishlist));
    this.emit('wishlist:updated', { count: this.wishlist.length });
    return !exists;
  }

  isInWishlist(productId) {
    return this.wishlist.includes(productId);
  }

  // --- Orders & Tracking ---
  loadOrders() {
    try {
      const data = JSON.parse(safeStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      if (data.length > 0) return data;
      // Seed initial demo completed order so the tracker and invoice demonstrator is immediately interactive
      const seedOrder = {
        orderId: 'POSH-89412',
        date: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        customer: {
          name: 'Julian Vance',
          email: 'julian@atelier.com',
          address: '450 Mercer St, Apt 4B',
          city: 'New York',
          postalCode: '10013',
          country: 'United States'
        },
        items: [
          {
            title: 'Terracotta Mirage Heavyweight Graphic Tee',
            size: 'L',
            color: 'Onyx Black',
            price: 95,
            quantity: 1,
            image: PRODUCTS[0].images[0]
          },
          {
            title: 'Obsidian Renaissance French Terry Hoodie',
            size: 'M',
            color: 'Obsidian Noir',
            price: 185,
            quantity: 1,
            image: PRODUCTS[1].images[0]
          }
        ],
        subtotal: 280,
        discount: 42,
        shipping: 0,
        total: 238,
        status: 'Quality Inspection',
        statusCode: 3, // 1: Confirmed, 2: Screen Printing, 3: Quality Inspection, 4: Dispatched, 5: Delivered
        trackingNumber: 'POSH-EXP-9402831'
      };
      safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([seedOrder]));
      return [seedOrder];
    } catch {
      return [];
    }
  }

  createOrder(orderData) {
    const newOrder = {
      orderId: 'POSH-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Order Confirmed',
      statusCode: 1,
      trackingNumber: 'POSH-EXP-' + Math.floor(1000000 + Math.random() * 9000000),
      ...orderData
    };

    this.orders.unshift(newOrder);
    safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    this.clearCart();
    this.emit('order:created', newOrder);
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus, statusCode) {
    const order = this.orders.find(o => o.orderId === orderId);
    if (order) {
      order.status = newStatus;
      order.statusCode = statusCode;
      safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
      this.emit('order:updated', order);
      return true;
    }
    return false;
  }

  findOrder(orderId, email) {
    const cleanId = (orderId || '').trim().toUpperCase();
    const cleanEmail = (email || '').trim().toLowerCase();
    return this.orders.find(o => 
      o.orderId.toUpperCase() === cleanId && 
      (!cleanEmail || o.customer.email.toLowerCase() === cleanEmail)
    );
  }

  // --- Event PubSub ---
  listeners = {};

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export const store = new Store();

if (typeof window !== 'undefined') {
  window.store = store;
}
