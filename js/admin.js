// POSHPRINT Luxury Apparel — Admin Management Console
// Provides real-time revenue analytics, order fulfillment controls, and inventory management.

import { store } from './store.js';
import { PRODUCTS } from './products.js';

export class AdminConsole {
  constructor() {
    this.modal = document.getElementById('adminModal');
    this.activeTab = 'overview';
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      const adminBtn = e.target.closest('#navAdminBtn');
      if (adminBtn) {
        e.preventDefault();
        this.open();
      }
    });

    if (this.modal) {
      this.modal.querySelectorAll('[data-close-modal]').forEach(b => {
        b.addEventListener('click', () => this.close());
      });

      this.modal.querySelectorAll('.admin-nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          this.modal.querySelectorAll('.admin-nav-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.activeTab = tab.dataset.tab;
          this.renderTab();
        });
      });
    }

    // Reactively refresh admin console if orders or store changes
    store.on('order:created', () => {
      if (this.modal && this.modal.classList.contains('active')) {
        this.renderTab();
      }
    });
  }

  open() {
    if (this.modal) {
      this.modal.classList.add('active');
      this.renderTab();
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  renderTab() {
    const container = document.getElementById('adminTabContent');
    if (!container) return;

    if (this.activeTab === 'overview') {
      this.renderOverview(container);
    } else if (this.activeTab === 'orders') {
      this.renderOrders(container);
    } else if (this.activeTab === 'inventory') {
      this.renderInventory(container);
    }
  }

  renderOverview(container) {
    const totalOrders = store.orders.length;
    const grossRevenue = store.orders.reduce((sum, o) => sum + o.total, 0);
    const aov = totalOrders > 0 ? (grossRevenue / totalOrders).toFixed(0) : 0;
    const totalUnits = PRODUCTS.reduce((sum, p) => sum + p.sizes.reduce((s, sz) => s + sz.stock, 0), 0);

    container.innerHTML = `
      <div class="admin-metrics-grid">
        <div class="admin-stat-card">
          <span class="stat-label">Gross Revenue</span>
          <h2 class="stat-value">${store.formatPrice(grossRevenue)}</h2>
          <span class="stat-badge positive"><i class="ph ph-trend-up"></i> +24% this week</span>
        </div>
        <div class="admin-stat-card">
          <span class="stat-label">Total Completed Orders</span>
          <h2 class="stat-value">${totalOrders}</h2>
          <span class="stat-badge neutral">100% Fulfillment Rate</span>
        </div>
        <div class="admin-stat-card">
          <span class="stat-label">Average Order Value (AOV)</span>
          <h2 class="stat-value">${store.formatPrice(aov)}</h2>
          <span class="stat-badge positive">Luxury Tier Benchmark</span>
        </div>
        <div class="admin-stat-card">
          <span class="stat-label">Total Garments in Stock</span>
          <h2 class="stat-value">${totalUnits}</h2>
          <span class="stat-badge alert">4 Low Stock Alerts</span>
        </div>
      </div>

      <div class="admin-section-box">
        <div class="section-box-header">
          <h3>Recent Fulfillment Queue</h3>
          <span class="text-muted">Live incoming customer orders</span>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${store.orders.slice(0, 5).map(order => `
                <tr>
                  <td><strong>#${order.orderId}</strong></td>
                  <td>${order.customer.name}<br /><small class="text-muted">${order.customer.city}</small></td>
                  <td>${order.items.length} piece(s)</td>
                  <td><strong>${store.formatPrice(order.total)}</strong></td>
                  <td><span class="status-pill status-${order.statusCode}">${order.status}</span></td>
                  <td>
                    <button type="button" class="btn btn-sm btn-outline admin-edit-order-btn" data-order-id="${order.orderId}">
                      Update Status
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelectorAll('.admin-edit-order-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.promptUpdateStatus(btn.dataset.orderId);
      });
    });
  }

  renderOrders(container) {
    container.innerHTML = `
      <div class="admin-section-box">
        <div class="section-box-header">
          <h3>Customer Orders Database (${store.orders.length})</h3>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Order Date</th>
                <th>Order ID</th>
                <th>Customer Email</th>
                <th>Garments Ordered</th>
                <th>Total</th>
                <th>Fulfillment Stage</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              ${store.orders.map(order => `
                <tr>
                  <td>${order.date}</td>
                  <td><strong>#${order.orderId}</strong><br /><small class="text-muted">${order.trackingNumber}</small></td>
                  <td>${order.customer.email}</td>
                  <td>${order.items.map(i => `${i.title} (${i.size})`).join(', ')}</td>
                  <td><strong>${store.formatPrice(order.total)}</strong></td>
                  <td>
                    <select class="admin-status-select" data-order-id="${order.orderId}">
                      <option value="1" ${order.statusCode === 1 ? 'selected' : ''}>1. Order Confirmed</option>
                      <option value="2" ${order.statusCode === 2 ? 'selected' : ''}>2. Atelier Screen Printing</option>
                      <option value="3" ${order.statusCode === 3 ? 'selected' : ''}>3. Quality Inspection</option>
                      <option value="4" ${order.statusCode === 4 ? 'selected' : ''}>4. Courier Dispatched</option>
                      <option value="5" ${order.statusCode === 5 ? 'selected' : ''}>5. Delivered</option>
                    </select>
                  </td>
                  <td>
                    <button type="button" class="btn btn-sm btn-primary admin-save-status-btn" data-order-id="${order.orderId}">
                      Save
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelectorAll('.admin-save-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.orderId;
        const select = container.querySelector(`select[data-order-id="${orderId}"]`);
        if (select) {
          const code = parseInt(select.value, 10);
          const labels = {
            1: 'Order Confirmed',
            2: 'Atelier Screen Printing',
            3: 'Quality Inspection',
            4: 'Courier Dispatched',
            5: 'Delivered'
          };
          store.updateOrderStatus(orderId, labels[code], code);
          store.emit('toast:show', { message: `Order #${orderId} updated to "${labels[code]}"`, type: 'success' });
          this.renderOrders(container);
        }
      });
    });
  }

  renderInventory(container) {
    container.innerHTML = `
      <div class="admin-section-box">
        <div class="section-box-header">
          <h3>Garment Catalog & Stock Management</h3>
          <span class="text-muted">Adjust pricing and unit availability</span>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Piece</th>
                <th>Category</th>
                <th>Retail Price</th>
                <th>Sizes Stock</th>
                <th>Total Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${PRODUCTS.map(product => {
                const totalStock = product.sizes.reduce((s, sz) => s + sz.stock, 0);
                return `
                  <tr>
                    <td style="display: flex; align-items: center; gap: 12px;">
                      <img src="${product.images[0]}" alt="${product.title}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 4px;" />
                      <div>
                        <strong>${product.title}</strong><br />
                        <small class="text-muted">${product.subtitle}</small>
                      </div>
                    </td>
                    <td><span class="category-tag">${product.category}</span></td>
                    <td>
                      <input type="number" class="admin-price-input" data-product-id="${product.id}" value="${product.price}" style="width: 80px; padding: 4px 8px; border: 1px solid var(--color-border);" />
                    </td>
                    <td>
                      ${product.sizes.map(sz => `<span class="size-stock-badge ${sz.stock <= 2 ? 'low-stock' : ''}">${sz.size}: ${sz.stock}</span>`).join(' ')}
                    </td>
                    <td><strong>${totalStock} units</strong></td>
                    <td>
                      <button type="button" class="btn btn-sm btn-primary admin-save-price-btn" data-product-id="${product.id}">
                        Save
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelectorAll('.admin-save-price-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.productId;
        const input = container.querySelector(`.admin-price-input[data-product-id="${id}"]`);
        if (input) {
          const newPrice = parseFloat(input.value);
          const p = PRODUCTS.find(prod => prod.id === id);
          if (p && !isNaN(newPrice) && newPrice > 0) {
            p.price = newPrice;
            store.emit('toast:show', { message: `Updated "${p.title}" price to ${store.formatPrice(newPrice)}`, type: 'success' });
            store.emit('cart:updated');
          }
        }
      });
    });
  }

  promptUpdateStatus(orderId) {
    this.activeTab = 'orders';
    const tabBtn = this.modal.querySelector('.admin-nav-tab[data-tab="orders"]');
    if (tabBtn) {
      this.modal.querySelectorAll('.admin-nav-tab').forEach(t => t.classList.remove('active'));
      tabBtn.classList.add('active');
    }
    this.renderTab();
  }
}
