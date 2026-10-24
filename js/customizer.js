// POSHPRINT Luxury Apparel — Interactive Custom Print Studio
// Real-time garment rendering, artwork upload, placement & sizing engine.

import { CUSTOM_PRESETS } from './products.js';
import { store } from './store.js';
import { telemetry } from './telemetry.js';

export class CustomizerStudio {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.selectedGarment = CUSTOM_PRESETS[0];
    this.selectedColor = this.selectedGarment.colors[0];
    this.selectedPlacement = 'front-center'; // 'front-center', 'back-oversized', 'chest-crest'
    this.selectedSize = 'L';
    this.artworkDataUrl = null;
    this.artworkScale = 1.0;
    this.activePresetGraphic = 'abstract';

    // Preset luxury graphics for instant demonstration if user doesn't have an image on hand
    this.presetGraphics = {
      'abstract': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
      'renaissance': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      'typographic': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
      'botanical': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80'
    };

    this.artworkDataUrl = this.presetGraphics['abstract'];
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.updatePreview();
  }

  calculatePrice() {
    let price = this.selectedGarment.basePrice;
    if (this.selectedPlacement === 'back-oversized') price += 15; // Oversized large screenprint
    if (this.selectedGarment.id === 'hoodie') price += 10; // Extra heavy print area
    return price;
  }

  render() {
    this.container.innerHTML = `
      <div class="customizer-grid">
        <!-- Visualizer Stage -->
        <div class="customizer-stage-card">
          <div class="stage-header">
            <span class="stage-tag">INTERACTIVE STUDIO</span>
            <div class="view-toggles" role="tablist">
              <button type="button" class="view-toggle-btn active" data-placement="front-center">Front View</button>
              <button type="button" class="view-toggle-btn" data-placement="back-oversized">Back View</button>
              <button type="button" class="view-toggle-btn" data-placement="chest-crest">Crest View</button>
            </div>
          </div>

          <div class="stage-canvas-wrapper" id="garmentCanvasContainer">
            <!-- Dynamic Garment Canvas -->
            <div class="garment-mockup" id="garmentMockup" style="background-color: ${this.selectedColor.hex};">
              <!-- Garment SVG Silhouette with realistic fabric folds & shading -->
              <svg class="garment-svg-silhouette" viewBox="0 0 600 700" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Outer Body / Neck / Shoulders -->
                <path d="M210 50 C250 85 350 85 390 50 L470 95 L560 210 L495 260 L445 190 L445 660 L155 660 L155 190 L105 260 L40 210 L130 95 Z" 
                      fill="currentColor" fill-opacity="0.96" />
                <!-- Collar Ribbing -->
                <path d="M210 50 C250 85 350 85 390 50 C360 95 240 95 210 50 Z" 
                      fill="#000" fill-opacity="0.12" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
                <!-- Fabric Shadow Folds & Creases -->
                <path d="M155 190 C180 280 180 440 165 650" stroke="rgba(0,0,0,0.18)" stroke-width="4" stroke-linecap="round"/>
                <path d="M445 190 C420 280 420 440 435 650" stroke="rgba(0,0,0,0.18)" stroke-width="4" stroke-linecap="round"/>
                <path d="M250 180 C270 320 270 480 260 620" stroke="rgba(255,255,255,0.06)" stroke-width="8" stroke-linecap="round"/>
                <!-- Bottom Hem Line -->
                <line x1="155" y1="655" x2="445" y2="655" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
              </svg>

              <!-- Print Artwork Target Zone -->
              <div class="print-target-zone ${this.selectedPlacement}" id="printTargetZone">
                <div class="print-artwork-wrapper" id="artworkWrapper" style="transform: scale(${this.artworkScale});">
                  <img src="${this.artworkDataUrl}" alt="Custom Print Preview" id="customArtImg" class="custom-art-img" />
                  <div class="screenprint-screen-texture"></div>
                </div>
              </div>

              <!-- PoshPrint Woven Atelier Tag -->
              <div class="garment-hem-tag">POSHPRINT • 01/01</div>
            </div>
          </div>

          <div class="stage-footer">
            <span class="tech-spec"><i class="ph ph-sparkle"></i> 12-Color Archival Japanese Direct-to-Garment Inks</span>
            <span class="tech-spec"><i class="ph ph-shield-check"></i> Wash Fastness Grade 4.5/5</span>
          </div>
        </div>

        <!-- Studio Control Deck -->
        <div class="customizer-controls-card">
          <div class="controls-header">
            <h3>Custom Atelier Studio</h3>
            <p>Upload your own graphic or select curated designs to print onto luxury garments.</p>
          </div>

          <!-- Step 1: Select Garment -->
          <div class="control-group">
            <label class="control-label">1. Choose Garment Base</label>
            <div class="garment-select-grid">
              ${CUSTOM_PRESETS.map(preset => `
                <button type="button" class="garment-chip ${preset.id === this.selectedGarment.id ? 'active' : ''}" data-garment-id="${preset.id}">
                  <span class="chip-title">${preset.name}</span>
                  <span class="chip-price">+${store.formatPrice(preset.basePrice)}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Step 2: Choose Garment Color -->
          <div class="control-group">
            <label class="control-label">2. Fabric Color: <strong id="selectedColorName">${this.selectedColor.name}</strong></label>
            <div class="color-swatch-row">
              ${this.selectedGarment.colors.map(color => `
                <button type="button" class="swatch-btn ${color.name === this.selectedColor.name ? 'active' : ''}" 
                        data-color-name="${color.name}" 
                        data-color-hex="${color.hex}" 
                        style="background-color: ${color.hex};" 
                        title="${color.name}"></button>
              `).join('')}
            </div>
          </div>

          <!-- Step 3: Artwork Upload or Preset -->
          <div class="control-group">
            <div class="label-row">
              <label class="control-label">3. Print Graphic / Artwork</label>
              <span class="sub-label">PNG, JPG up to 25MB (300 DPI Recommended)</span>
            </div>

            <!-- File Upload Dropzone -->
            <div class="artwork-upload-dropzone" id="artworkDropzone">
              <input type="file" id="artworkFileInput" accept="image/png, image/jpeg, image/webp" class="visually-hidden" />
              <div class="dropzone-inner" id="dropzonePrompt">
                <i class="ph ph-cloud-arrow-up drop-icon"></i>
                <span class="drop-text">Click or drag your artwork here</span>
                <span class="drop-hint">Transparent PNGs produce the highest quality screenprint result</span>
              </div>
            </div>

            <!-- Quick Presets -->
            <div class="preset-row">
              <span class="preset-label">Or choose sample art:</span>
              <div class="preset-buttons">
                <button type="button" class="preset-btn active" data-preset="abstract">Abstract Terracotta</button>
                <button type="button" class="preset-btn" data-preset="renaissance">Renaissance</button>
                <button type="button" class="preset-btn" data-preset="typographic">Typography</button>
                <button type="button" class="preset-btn" data-preset="botanical">Botanical</button>
              </div>
            </div>
          </div>

          <!-- Step 4: Scale & Placement -->
          <div class="control-group">
            <div class="label-row">
              <label class="control-label">4. Print Scale & Size</label>
              <span id="scaleDisplay" class="scale-display">100%</span>
            </div>
            <input type="range" id="artworkScaleSlider" min="0.6" max="1.5" step="0.05" value="1.0" class="range-slider" />
          </div>

          <!-- Step 5: Size Selection -->
          <div class="control-group">
            <label class="control-label">5. Garment Size</label>
            <div class="size-pill-row">
              ${['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => `
                <button type="button" class="size-pill ${sz === this.selectedSize ? 'active' : ''}" data-size="${sz}">${sz}</button>
              `).join('')}
            </div>
          </div>

          <!-- Summary & Action Bar -->
          <div class="customizer-checkout-bar">
            <div class="price-block">
              <span class="price-label">Custom Atelier Total:</span>
              <span class="price-val" id="customPriceValue">${store.formatPrice(this.calculatePrice())}</span>
              <span class="price-note">Crafted & printed on demand in 3 business days</span>
            </div>
            <button type="button" class="btn btn-primary btn-add-custom" id="btnAddCustomToBag">
              <i class="ph ph-bag"></i> Add Bespoke Piece to Bag
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Garment selection
    this.container.querySelectorAll('.garment-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.garmentId;
        const g = CUSTOM_PRESETS.find(p => p.id === id);
        if (g) {
          this.selectedGarment = g;
          this.selectedColor = g.colors[0];
          this.render();
          this.bindEvents();
          this.updatePreview();
        }
      });
    });

    // Color Swatches
    this.container.querySelectorAll('.swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedColor = {
          name: btn.dataset.colorName,
          hex: btn.dataset.colorHex
        };
        const colorLabel = this.container.querySelector('#selectedColorName');
        if (colorLabel) colorLabel.textContent = this.selectedColor.name;
        this.updatePreview();
      });
    });

    // View Toggles (Placement)
    this.container.querySelectorAll('.view-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedPlacement = btn.dataset.placement;
        this.updatePreview();
        this.updatePrice();
      });
    });

    // Preset Art Selection
    this.container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.dataset.preset;
        if (this.presetGraphics[key]) {
          this.artworkDataUrl = this.presetGraphics[key];
          this.updatePreview();
        }
      });
    });

    // Scale Slider
    const slider = this.container.querySelector('#artworkScaleSlider');
    const scaleDisplay = this.container.querySelector('#scaleDisplay');
    if (slider) {
      slider.addEventListener('input', (e) => {
        this.artworkScale = parseFloat(e.target.value);
        if (scaleDisplay) scaleDisplay.textContent = `${Math.round(this.artworkScale * 100)}%`;
        const wrapper = this.container.querySelector('#artworkWrapper');
        if (wrapper) wrapper.style.transform = `scale(${this.artworkScale})`;
      });
    }

    // Size Selection
    this.container.querySelectorAll('.size-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.size-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedSize = btn.dataset.size;
      });
    });

    // File Upload Dropzone
    const dropzone = this.container.querySelector('#artworkDropzone');
    const fileInput = this.container.querySelector('#artworkFileInput');
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-hover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-hover');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-hover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }

    // Add To Bag Button
    const addBtn = this.container.querySelector('#btnAddCustomToBag');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.handleAddToBag());
    }

    // Listen to currency changes to refresh price display
    store.on('currency:changed', () => this.updatePrice());
  }

  handleFileUpload(file) {
    if (!file.type.startsWith('image/')) {
      store.emit('toast:show', { message: 'Please upload an image file (PNG, JPG, or WebP)', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.artworkDataUrl = e.target.result;
      this.updatePreview();
      store.emit('toast:show', { message: `Uploaded "${file.name}" to Atelier Studio`, type: 'success' });
      
      // Update dropzone prompt
      const prompt = this.container.querySelector('#dropzonePrompt');
      if (prompt) {
        prompt.innerHTML = `
          <i class="ph ph-check-circle" style="color: var(--color-accent); font-size: 1.6rem;"></i>
          <span class="drop-text">${file.name}</span>
          <span class="drop-hint">Custom artwork loaded successfully</span>
        `;
      }
    };
    reader.readAsDataURL(file);
  }

  updatePreview() {
    const mockup = this.container.querySelector('#garmentMockup');
    const targetZone = this.container.querySelector('#printTargetZone');
    const img = this.container.querySelector('#customArtImg');

    if (mockup) {
      mockup.style.backgroundColor = this.selectedColor.hex;
      mockup.style.color = this.selectedColor.hex;
    }

    if (targetZone) {
      targetZone.className = `print-target-zone ${this.selectedPlacement}`;
    }

    if (img && this.artworkDataUrl) {
      img.src = this.artworkDataUrl;
    }
  }

  updatePrice() {
    const priceVal = this.container.querySelector('#customPriceValue');
    if (priceVal) {
      priceVal.textContent = store.formatPrice(this.calculatePrice());
    }
  }

  handleAddToBag() {
    const calculatedPrice = this.calculatePrice();
    const customData = {
      garmentId: this.selectedGarment.id,
      garmentName: this.selectedGarment.name,
      color: this.selectedColor.name,
      placement: this.selectedPlacement,
      size: this.selectedSize,
      calculatedPrice: calculatedPrice,
      previewImage: this.artworkDataUrl
    };

    store.addToCart({
      productId: 'custom_' + this.selectedGarment.id,
      size: this.selectedSize,
      color: this.selectedColor.name,
      quantity: 1,
      isCustom: true,
      customData
    });

    // Mark bespoke item added to bag to avoid drop-off abandonment trigger
    telemetry.bespokeAddedToBag = true;
    telemetry.bespokeInteracted = false;
  }
}
