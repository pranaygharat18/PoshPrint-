// POSHPRINT Luxury Apparel — Master Application Controller
// Orchestrates storefront browsing, catalog filtering, PDP modal, cart drawer, wishlist, and size guide.

import { PRODUCTS, STYLES, SIZE_CHART } from './products.js';
import { store } from './store.js';
import { CustomizerStudio } from './customizer.js';
import { CheckoutManager } from './checkout.js';
import { AdminConsole } from './admin.js';

class App {
  constructor() {
    this.selectedProduct = null;
    this.selectedPdpSize = null;
    this.selectedPdpColor = null;
    this.pdpImageIndex = 0;
    this.sizeUnit = 'metric'; // 'metric' or 'imperial'

    this.init();
  }

  init() {
    // Initialize Subsystems
    this.customizer = new CustomizerStudio('customizerContainer');
    this.checkout = new CheckoutManager();
    this.admin = new AdminConsole();

    // Initial Renders
    this.renderCategoryNav();
    this.renderProducts();
    this.renderCartDrawer();
    this.renderWishlistDrawer();
    this.updateHeaderBadges();

    // Event Bindings
    this.bindEvents();
    this.bindStoreEvents();
  }

  bindStoreEvents() {
    store.on('cart:updated', () => {
      this.renderCartDrawer();
      this.updateHeaderBadges();
      this.checkout.updateOrderSummary();
    });

    store.on('wishlist:updated', () => {
      this.renderWishlistDrawer();
      this.updateHeaderBadges();
      this.renderProducts(); // Update heart icon states
    });

    store.on('currency:changed', () => {
      this.renderProducts();
      this.renderCartDrawer();
      this.renderWishlistDrawer();
      if (this.selectedProduct) this.renderPdpPrice();
      // Update currency dropdown label
      const currLabel = document.getElementById('currentCurrencyLabel');
      if (currLabel) currLabel.textContent = store.currency;
      document.querySelectorAll('.currency-opt').forEach(btn => {
        btn.style.color = (btn.dataset.currency === store.currency) ? '#D8CCA3' : '#FFFFFF';
        btn.style.textDecoration = (btn.dataset.currency === store.currency) ? 'underline' : 'none';
      });
    });

    store.on('toast:show', (data) => {
      this.showToast(data.message, data.type);
    });
  }

  bindEvents() {
    // Currency Selector
    document.querySelectorAll('.currency-opt').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.preventDefault();
        store.setCurrency(opt.dataset.currency);
      });
    });

    // Cart Drawer Toggle
    const cartToggleBtn = document.getElementById('navCartBtn');
    const closeCartBtn = document.getElementById('closeCartDrawer');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartBackdrop = document.getElementById('cartDrawerBackdrop');

    // Nav Filter Style Clicks
    document.querySelectorAll('[data-filter-style]').forEach(link => {
      link.addEventListener('click', (e) => {
        const style = link.dataset.filterStyle;
        store.filters.style = style;
        this.renderCategoryNav();
        this.renderProducts();
        document.getElementById('catalogSection')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    if (cartToggleBtn && cartDrawer) {
      cartToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openCart();
      });
    }

    if (closeCartBtn && cartDrawer) {
      closeCartBtn.addEventListener('click', () => this.closeCart());
    }

    if (cartBackdrop) {
      cartBackdrop.addEventListener('click', () => this.closeCart());
    }

    // Wishlist Drawer Toggle
    const wishlistToggleBtn = document.getElementById('navWishlistBtn');
    const closeWishlistBtn = document.getElementById('closeWishlistDrawer');
    const wishlistDrawer = document.getElementById('wishlistDrawer');
    const wishlistBackdrop = document.getElementById('wishlistDrawerBackdrop');

    if (wishlistToggleBtn && wishlistDrawer) {
      wishlistToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openWishlist();
      });
    }

    if (closeWishlistBtn) {
      closeWishlistBtn.addEventListener('click', () => this.closeWishlist());
    }

    if (wishlistBackdrop) {
      wishlistBackdrop.addEventListener('click', () => this.closeWishlist());
    }

    // Search Input with Debounce (Section 1.4 security & UX)
    const searchInput = document.getElementById('storeSearchInput');
    let debounceTimer;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          store.searchQuery = e.target.value.trim().toLowerCase();
          this.renderProducts();
        }, 220);
      });
    }

    // Sort Dropdown
    const sortSelect = document.getElementById('storeSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        store.filters.sortBy = e.target.value;
        this.renderProducts();
      });
    }

    // Gender Filter Pills
    document.querySelectorAll('.gender-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gender-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.filters.gender = btn.dataset.gender;
        this.renderProducts();
      });
    });

    // Size Filter Chips
    document.querySelectorAll('.size-filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.size-filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.filters.size = btn.dataset.size;
        this.renderProducts();
      });
    });

    // Price Range Slider
    const priceSlider = document.getElementById('priceRangeSlider');
    const priceDisplay = document.getElementById('priceRangeDisplay');
    if (priceSlider) {
      priceSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        store.filters.maxPrice = val;
        if (priceDisplay) priceDisplay.textContent = store.formatPrice(val);
        this.renderProducts();
      });
    }

    // Mobile Menu & Drawers
    const mobileMenuBtn = document.getElementById('mobileMenuToggle');
    const mobileNavDrawer = document.getElementById('mobileNavDrawer');

    if (mobileMenuBtn && mobileNavDrawer) {
      mobileMenuBtn.addEventListener('click', () => mobileNavDrawer.classList.add('active'));
    }

    // Close any drawer on [data-close-drawer]
    document.querySelectorAll('[data-close-drawer]').forEach(btn => {
      btn.addEventListener('click', () => {
        const drawer = btn.closest('.drawer');
        if (drawer) drawer.classList.remove('active');
        else document.querySelectorAll('.drawer').forEach(d => d.classList.remove('active'));
      });
    });

    // Close mobile nav drawer when any link inside it is tapped
    if (mobileNavDrawer) {
      mobileNavDrawer.querySelectorAll('.mobile-nav-link, .mobile-quick-action-btn').forEach(link => {
        link.addEventListener('click', () => {
          mobileNavDrawer.classList.remove('active');
        });
      });
    }

    // Quick mobile action buttons
    const mobileAdminBtn = document.getElementById('mobileAdminBtn');
    if (mobileAdminBtn) {
      mobileAdminBtn.addEventListener('click', (e) => {
        e.preventDefault();
        mobileNavDrawer?.classList.remove('active');
        document.getElementById('adminModal')?.classList.add('active');
      });
    }

    const mobileSizeGuideBtn = document.getElementById('mobileSizeGuideBtn');
    if (mobileSizeGuideBtn) {
      mobileSizeGuideBtn.addEventListener('click', (e) => {
        e.preventDefault();
        mobileNavDrawer?.classList.remove('active');
        this.renderSizeGuide();
        document.getElementById('sizeGuideModal')?.classList.add('active');
      });
    }

    // PDP Modal Close
    const pdpModal = document.getElementById('pdpModal');
    if (pdpModal) {
      pdpModal.querySelectorAll('[data-close-modal]').forEach(b => {
        b.addEventListener('click', () => pdpModal.classList.remove('active'));
      });
    }

    // Size Guide Modal Open & Close
    const sizeGuideModal = document.getElementById('sizeGuideModal');
    document.addEventListener('click', (e) => {
      const openGuide = e.target.closest('#btnOpenSizeGuide, #btnOpenSizeGuideFooter');
      if (openGuide && sizeGuideModal) {
        e.preventDefault();
        this.renderSizeGuide();
        sizeGuideModal.classList.add('active');
      }

      const closeGuide = e.target.closest('#closeSizeGuideModal');
      if (closeGuide && sizeGuideModal) {
        sizeGuideModal.classList.remove('active');
      }

      // Legal & Policy Modals
      const openPrivacy = e.target.closest('#btnOpenPrivacyModal');
      if (openPrivacy) {
        e.preventDefault();
        document.getElementById('privacyModal')?.classList.add('active');
      }

      const openTerms = e.target.closest('#btnOpenTermsModal');
      if (openTerms) {
        e.preventDefault();
        document.getElementById('termsModal')?.classList.add('active');
      }

      const openReturns = e.target.closest('#btnOpenReturnsModal');
      if (openReturns) {
        e.preventDefault();
        document.getElementById('returnsModal')?.classList.add('active');
      }

      // Global Close Modal Handler for any modal
      const closeTrigger = e.target.closest('[data-close-modal]');
      if (closeTrigger) {
        const m = closeTrigger.closest('.modal');
        if (m) m.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Auto-maintain copyright year (Section 4.3)
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Promo Code Form in Cart
    const promoForm = document.getElementById('cartPromoForm');
    if (promoForm) {
      promoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('cartPromoInput');
        if (input) {
          const res = store.applyPromoCode(input.value);
          if (!res.success) {
            store.emit('toast:show', { message: res.message, type: 'error' });
          }
        }
      });
    }

    // Keyboard ESC to close any open modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active, .drawer.active').forEach(el => el.classList.remove('active'));
        document.body.style.overflow = '';
      }
    });
  }

  openCart() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeCart() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  openWishlist() {
    const drawer = document.getElementById('wishlistDrawer');
    if (drawer) {
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeWishlist() {
    const drawer = document.getElementById('wishlistDrawer');
    if (drawer) {
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  updateHeaderBadges() {
    const cartCountEl = document.getElementById('headerCartCount');
    const wishlistCountEl = document.getElementById('headerWishlistCount');

    const cCount = store.getCartCount();
    const wCount = store.wishlist.length;

    if (cartCountEl) {
      cartCountEl.textContent = cCount;
      cartCountEl.style.display = cCount > 0 ? 'inline-flex' : 'none';
    }

    if (wishlistCountEl) {
      wishlistCountEl.textContent = wCount;
      wishlistCountEl.style.display = wCount > 0 ? 'inline-flex' : 'none';
    }
  }

  renderCategoryNav() {
    const container = document.getElementById('categoryTabsContainer');
    if (!container) return;

    container.innerHTML = STYLES.map(style => `
      <button type="button" class="category-tab-btn ${style.id === store.filters.style ? 'active' : ''}" data-style-id="${style.id}">
        <i class="ph ${style.icon}"></i> ${style.name}
      </button>
    `).join('');

    container.querySelectorAll('.category-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.filters.style = btn.dataset.styleId;
        this.renderProducts();
      });
    });
  }

  getFilteredProducts() {
    let list = [...PRODUCTS];

    // Public Choices / Lifestyle Style (Casual, Professional, Kids, Shoes)
    if (store.filters.style && store.filters.style !== 'all') {
      list = list.filter(p => p.style === store.filters.style);
    }

    // Category
    if (store.filters.category && store.filters.category !== 'all') {
      list = list.filter(p => p.category === store.filters.category);
    }

    // Gender
    if (store.filters.gender && store.filters.gender !== 'all') {
      list = list.filter(p => p.gender === store.filters.gender || p.gender === 'unisex');
    }

    // Size
    if (store.filters.size && store.filters.size !== 'all') {
      list = list.filter(p => p.sizes.some(sz => sz.size === store.filters.size && sz.stock > 0));
    }

    // Max Price
    if (store.filters.maxPrice) {
      list = list.filter(p => p.price <= store.filters.maxPrice);
    }

    // Search Query
    if (store.searchQuery) {
      const q = store.searchQuery;
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (store.filters.sortBy) {
      case 'price-low':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // 'featured'
        break;
    }

    return list;
  }

  renderProducts() {
    const grid = document.getElementById('productGrid');
    const counter = document.getElementById('productCountBadge');
    if (!grid) return;

    const products = this.getFilteredProducts();

    if (counter) {
      counter.textContent = `${products.length} Archival Garments`;
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <div class="empty-catalog-state">
          <i class="ph ph-magnifying-glass empty-icon"></i>
          <h3>No matching luxury garments found</h3>
          <p>Try broadening your filters or resetting your search criteria.</p>
          <button type="button" class="btn btn-outline" id="btnResetFilters">Reset All Filters</button>
        </div>
      `;
      const resetBtn = grid.querySelector('#btnResetFilters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          store.filters.category = 'all';
          store.filters.gender = 'all';
          store.filters.size = 'all';
          store.filters.maxPrice = 350;
          store.searchQuery = '';
          const searchIn = document.getElementById('storeSearchInput');
          if (searchIn) searchIn.value = '';
          this.renderCategoryNav();
          this.renderProducts();
        });
      }
      return;
    }

    grid.innerHTML = products.map(product => {
      const isFav = store.isInWishlist(product.id);
      return `
        <article class="product-card" data-product-id="${product.id}">
          <div class="product-media-wrap">
            ${product.isLimited ? '<span class="product-badge badge-limited">LIMITED DROP</span>' : ''}
            ${product.isNew && !product.isLimited ? '<span class="product-badge badge-new">NEW ATELIER</span>' : ''}
            
            <button type="button" class="wishlist-btn ${isFav ? 'active' : ''}" data-wishlist-id="${product.id}" aria-label="Save to Wishlist">
              <i class="ph ${isFav ? 'ph-heart-fill' : 'ph-heart'}"></i>
            </button>

            <img src="${product.images[0]}" alt="${product.title}" class="product-img" loading="lazy" />

            <div class="card-action-overlay">
              <button type="button" class="btn-quick-view" data-quickview-id="${product.id}">
                <i class="ph ph-eye"></i> Quick Look & Sizing
              </button>
            </div>
          </div>

          <div class="product-meta">
            <span class="product-subtitle">${product.subtitle}</span>
            <h3 class="product-title" data-open-pdp="${product.id}">${product.title}</h3>
            
            <div class="product-swatches">
              ${product.colors.map(c => `
                <span class="color-dot" style="background-color: ${c.hex};" title="${c.name}"></span>
              `).join('')}
              <span class="fit-spec">${product.fit}</span>
            </div>

            <div class="product-footer-row">
              <div class="price-wrap">
                <span class="current-price">${store.formatPrice(product.price)}</span>
                ${product.comparePrice ? `<span class="compare-price">${store.formatPrice(product.comparePrice)}</span>` : ''}
              </div>
              <div class="rating-wrap">
                <i class="ph ph-star-fill star-icon"></i>
                <span>${product.rating}</span>
                <span class="review-count">(${product.reviewCount})</span>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Bind card interaction buttons
    grid.querySelectorAll('.wishlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        store.toggleWishlist(btn.dataset.wishlistId);
      });
    });

    grid.querySelectorAll('.btn-quick-view, [data-open-pdp]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.quickviewId || btn.dataset.openPdp;
        this.openPdp(id);
      });
    });

    // Touch-friendly: tapping product media directly opens PDP
    grid.querySelectorAll('.product-media-wrap').forEach(wrap => {
      wrap.addEventListener('click', (e) => {
        if (e.target.closest('.wishlist-btn')) return;
        const card = wrap.closest('.product-card');
        const id = card?.dataset.productId;
        if (id) this.openPdp(id);
      });
    });
  }

  openPdp(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    this.selectedProduct = product;
    this.selectedPdpColor = product.colors[0];
    // Pick first size that has stock
    const availableSize = product.sizes.find(s => s.stock > 0) || product.sizes[0];
    this.selectedPdpSize = availableSize.size;
    this.pdpImageIndex = 0;

    const modal = document.getElementById('pdpModal');
    if (!modal) return;

    const container = document.getElementById('pdpModalContent');
    if (container) {
      container.innerHTML = `
        <div class="pdp-layout-grid">
          <!-- Gallery Column -->
          <div class="pdp-gallery-col">
            <div class="pdp-main-image-wrap">
              <img src="${product.images[0]}" alt="${product.title}" id="pdpMainImage" class="pdp-main-image" />
              ${product.isLimited ? '<span class="pdp-drop-pill">Limited Edition Drop</span>' : ''}
            </div>
            <div class="pdp-thumbs-row">
              ${product.images.map((img, idx) => `
                <button type="button" class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" data-thumb-idx="${idx}">
                  <img src="${img}" alt="${product.title} view ${idx + 1}" />
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Product Details Column -->
          <div class="pdp-details-col">
            <span class="pdp-subtitle">${product.subtitle}</span>
            <h2 class="pdp-title">${product.title}</h2>
            
            <div class="pdp-rating-row">
              <div class="stars">
                <i class="ph ph-star-fill"></i>
                <i class="ph ph-star-fill"></i>
                <i class="ph ph-star-fill"></i>
                <i class="ph ph-star-fill"></i>
                <i class="ph ph-star-fill"></i>
              </div>
              <span class="rating-text">${product.rating} / 5.0 (${product.reviewCount} verified client reviews)</span>
            </div>

            <div class="pdp-price-row">
              <span class="pdp-price" id="pdpPriceVal">${store.formatPrice(product.price)}</span>
              ${product.comparePrice ? `<span class="pdp-compare-price">${store.formatPrice(product.comparePrice)}</span>` : ''}
              <span class="pdp-tax-note">Tax included • Complimentary insured delivery on orders over $150</span>
            </div>

            <p class="pdp-description">${product.description}</p>

            <!-- Color Swatches -->
            <div class="pdp-option-block">
              <div class="option-header">
                <span>Color: <strong id="pdpSelectedColorName">${this.selectedPdpColor.name}</strong></span>
              </div>
              <div class="pdp-swatches-row">
                ${product.colors.map((c, i) => `
                  <button type="button" class="pdp-swatch-btn ${i === 0 ? 'active' : ''}" 
                          data-color-name="${c.name}" 
                          style="background-color: ${c.hex};" 
                          title="${c.name}"></button>
                `).join('')}
              </div>
            </div>

            <!-- Size Selection with Stock Status -->
            <div class="pdp-option-block">
              <div class="option-header">
                <span>Size: <strong id="pdpSelectedSizeName">${this.selectedPdpSize}</strong></span>
                <button type="button" class="pdp-size-guide-link" id="btnOpenSizeGuide">
                  <i class="ph ph-ruler"></i> Interactive Size Guide & Fit Finder
                </button>
              </div>
              <div class="pdp-sizes-grid">
                ${product.sizes.map(sz => `
                  <button type="button" class="pdp-size-btn ${sz.size === this.selectedPdpSize ? 'active' : ''} ${sz.stock === 0 ? 'disabled' : ''}" 
                          data-size="${sz.size}" 
                          data-stock="${sz.stock}"
                          ${sz.stock === 0 ? 'disabled' : ''}>
                    ${sz.size}
                    ${sz.stock > 0 && sz.stock <= 4 ? `<span class="stock-pill">Only ${sz.stock} left</span>` : ''}
                    ${sz.stock === 0 ? '<span class="stock-pill oos">Sold out</span>' : ''}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="pdp-actions-row">
              <button type="button" class="btn btn-primary btn-add-pdp" id="btnPdpAddToCart">
                <i class="ph ph-bag"></i> Add to Bag • ${store.formatPrice(product.price)}
              </button>
              <button type="button" class="btn-wishlist-pdp ${store.isInWishlist(product.id) ? 'active' : ''}" id="btnPdpWishlist" aria-label="Wishlist">
                <i class="ph ${store.isInWishlist(product.id) ? 'ph-heart-fill' : 'ph-heart'}"></i>
              </button>
            </div>

            <!-- Specs Accordion -->
            <div class="pdp-specs-accordion">
              <div class="spec-item">
                <div class="spec-title"><i class="ph ph-needle"></i> Fabric & Craftsmanship</div>
                <div class="spec-body">${product.fabric}</div>
              </div>
              <div class="spec-item">
                <div class="spec-title"><i class="ph ph-arrows-out-cardinal"></i> Silhouette & Fit</div>
                <div class="spec-body">${product.fit}. Model is 6'1" (185cm) wearing Size Large for a relaxed drape.</div>
              </div>
              <div class="spec-item">
                <div class="spec-title"><i class="ph ph-drop"></i> Atelier Care Instructions</div>
                <div class="spec-body">${product.care}</div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Bind PDP internal events
      const mainImg = container.querySelector('#pdpMainImage');
      container.querySelectorAll('.pdp-thumb-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.pdp-thumb-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const idx = parseInt(btn.dataset.thumbIdx, 10);
          if (mainImg && product.images[idx]) {
            mainImg.src = product.images[idx];
          }
        });
      });

      // Color select
      container.querySelectorAll('.pdp-swatch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.pdp-swatch-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const colorName = btn.dataset.colorName;
          this.selectedPdpColor = product.colors.find(c => c.name === colorName) || product.colors[0];
          const label = container.querySelector('#pdpSelectedColorName');
          if (label) label.textContent = this.selectedPdpColor.name;
        });
      });

      // Size select
      container.querySelectorAll('.pdp-size-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.pdp-size-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedPdpSize = btn.dataset.size;
          const label = container.querySelector('#pdpSelectedSizeName');
          if (label) label.textContent = this.selectedPdpSize;
        });
      });

      // Add to bag
      const addBtn = container.querySelector('#btnPdpAddToCart');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          store.addToCart({
            productId: product.id,
            size: this.selectedPdpSize,
            color: this.selectedPdpColor.name,
            quantity: 1
          });
          modal.classList.remove('active');
          this.openCart();
        });
      }

      // Wishlist toggle
      const wishBtn = container.querySelector('#btnPdpWishlist');
      if (wishBtn) {
        wishBtn.addEventListener('click', () => {
          const isAdded = store.toggleWishlist(product.id);
          wishBtn.classList.toggle('active', isAdded);
          wishBtn.innerHTML = `<i class="ph ${isAdded ? 'ph-heart-fill' : 'ph-heart'}"></i>`;
        });
      }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  renderPdpPrice() {
    if (!this.selectedProduct) return;
    const priceVal = document.getElementById('pdpPriceVal');
    const addBtn = document.getElementById('btnPdpAddToCart');
    if (priceVal) priceVal.textContent = store.formatPrice(this.selectedProduct.price);
    if (addBtn) addBtn.innerHTML = `<i class="ph ph-bag"></i> Add to Bag • ${store.formatPrice(this.selectedProduct.price)}`;
  }

  renderCartDrawer() {
    const listContainer = document.getElementById('cartDrawerItems');
    const subtotalEl = document.getElementById('cartDrawerSubtotal');
    const shippingProgressEl = document.getElementById('freeShippingProgressBar');
    const shippingTextEl = document.getElementById('freeShippingText');
    const promoTagContainer = document.getElementById('cartAppliedPromoTag');

    if (!listContainer) return;

    const summary = store.getCartSummary();

    if (subtotalEl) {
      subtotalEl.textContent = store.formatPrice(summary.total);
    }

    // Free shipping threshold bar
    if (shippingProgressEl && shippingTextEl) {
      const pct = Math.min(100, Math.round((summary.subtotal / summary.freeShippingThreshold) * 100));
      shippingProgressEl.style.width = `${pct}%`;
      if (summary.amountToFreeShipping === 0) {
        shippingTextEl.innerHTML = '<i class="ph ph-check-circle" style="color: #2e7d32;"></i> You unlocked <strong>Complimentary Worldwide Shipping</strong>!';
      } else {
        shippingTextEl.innerHTML = `Add <strong>${store.formatPrice(summary.amountToFreeShipping)}</strong> more to unlock Complimentary Express Delivery`;
      }
    }

    // Active Promo Tag
    if (promoTagContainer) {
      if (store.activePromo) {
        promoTagContainer.innerHTML = `
          <div class="active-promo-chip">
            <span><i class="ph ph-tag"></i> <strong>${store.activePromo.code}</strong> (${store.activePromo.description})</span>
            <button type="button" class="btn-remove-promo" id="btnRemovePromoCode" aria-label="Remove Promo">&times;</button>
          </div>
        `;
        const removeBtn = promoTagContainer.querySelector('#btnRemovePromoCode');
        if (removeBtn) {
          removeBtn.addEventListener('click', () => store.removePromo());
        }
      } else {
        promoTagContainer.innerHTML = '';
      }
    }

    if (store.cart.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-cart-view">
          <i class="ph ph-handbag empty-bag-icon"></i>
          <h4>Your luxury bag is empty</h4>
          <p>Discover our newest limited drops and bespoke atelier pieces.</p>
          <button type="button" class="btn btn-primary" id="btnStartShopping">Explore Collections</button>
        </div>
      `;
      const startBtn = listContainer.querySelector('#btnStartShopping');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          this.closeCart();
          document.getElementById('catalogSection')?.scrollIntoView({ behavior: 'smooth' });
        });
      }
      return;
    }

    listContainer.innerHTML = store.cart.map(item => `
      <div class="cart-item-card" data-cart-id="${item.id}">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img" />
        <div class="cart-item-content">
          <div class="cart-item-top">
            <h4 class="cart-item-title">${item.title}</h4>
            <button type="button" class="cart-item-delete" data-delete-id="${item.id}" aria-label="Remove item">
              <i class="ph ph-trash"></i>
            </button>
          </div>
          <div class="cart-item-variants">
            <span>Size: <strong>${item.size}</strong></span>
            <span>Color: <strong>${item.color}</strong></span>
            ${item.isCustom ? '<span class="custom-atelier-tag">Bespoke Studio</span>' : ''}
          </div>
          <div class="cart-item-bottom">
            <div class="qty-stepper">
              <button type="button" class="qty-btn" data-qty-id="${item.id}" data-delta="-1">-</button>
              <span class="qty-num">${item.quantity}</span>
              <button type="button" class="qty-btn" data-qty-id="${item.id}" data-delta="1">+</button>
            </div>
            <span class="cart-item-price">${store.formatPrice(item.price * item.quantity)}</span>
          </div>
        </div>
      </div>
    `).join('');

    // Bind quantity and delete buttons
    listContainer.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.qtyId;
        const delta = parseInt(btn.dataset.delta, 10);
        store.updateCartQty(id, delta);
      });
    });

    listContainer.querySelectorAll('.cart-item-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        store.removeCartItem(btn.dataset.deleteId);
      });
    });
  }

  renderWishlistDrawer() {
    const container = document.getElementById('wishlistDrawerItems');
    if (!container) return;

    const items = store.wishlist.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-cart-view">
          <i class="ph ph-heart empty-bag-icon"></i>
          <h4>Your wishlist is empty</h4>
          <p>Tap the heart icon on any archival garment to save it for later.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(product => `
      <div class="wishlist-item-card">
        <img src="${product.images[0]}" alt="${product.title}" class="wishlist-thumb" />
        <div class="wishlist-meta">
          <h4 class="wishlist-title">${product.title}</h4>
          <span class="wishlist-price">${store.formatPrice(product.price)}</span>
          <div class="wishlist-actions">
            <button type="button" class="btn btn-sm btn-primary btn-move-to-bag" data-product-id="${product.id}">
              <i class="ph ph-bag"></i> Move to Bag
            </button>
            <button type="button" class="btn-remove-wishlist" data-remove-wishlist-id="${product.id}">
              Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-move-to-bag').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.productId;
        this.closeWishlist();
        this.openPdp(id);
      });
    });

    container.querySelectorAll('.btn-remove-wishlist').forEach(btn => {
      btn.addEventListener('click', () => {
        store.toggleWishlist(btn.dataset.removeWishlistId);
      });
    });
  }

  renderSizeGuide() {
    const modal = document.getElementById('sizeGuideModal');
    if (!modal) return;

    const tableWrap = document.getElementById('sizeChartTableWrap');
    if (!tableWrap) return;

    const data = SIZE_CHART[this.sizeUnit] || SIZE_CHART.metric;

    tableWrap.innerHTML = `
      <div class="size-unit-toggle">
        <button type="button" class="unit-toggle-btn ${this.sizeUnit === 'metric' ? 'active' : ''}" data-unit="metric">Centimeters (cm)</button>
        <button type="button" class="unit-toggle-btn ${this.sizeUnit === 'imperial' ? 'active' : ''}" data-unit="imperial">Inches (in)</button>
      </div>

      <table class="size-guide-table">
        <thead>
          <tr>
            <th>Size</th>
            <th>Chest Width</th>
            <th>Garment Length</th>
            <th>Shoulder Span</th>
            <th>Sleeve Length</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              <td><strong>${row.size}</strong></td>
              <td>${row.chest}</td>
              <td>${row.length}</td>
              <td>${row.shoulder}</td>
              <td>${row.sleeve}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="fit-advisory-box">
        <h4><i class="ph ph-sparkle"></i> PoshPrint Fit Advisory</h4>
        <p>Our heavy French Terry hoodies and 280gsm Graphic Tees are tailored in a modern boxy streetwear silhouette with dropped shoulders. For a standard relaxed drape, select your true size. For a more tailored appearance, size down one step.</p>
      </div>
    `;

    tableWrap.querySelectorAll('.unit-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sizeUnit = btn.dataset.unit;
        this.renderSizeGuide();
      });
    });
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `posh-toast toast-${type}`;
    
    let icon = 'ph-info';
    if (type === 'success') icon = 'ph-check-circle';
    if (type === 'error') icon = 'ph-warning-circle';

    toast.innerHTML = `
      <i class="ph ${icon} toast-icon"></i>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add('active'), 20);
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 350);
    }, 3800);
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.poshApp = new App();
});
