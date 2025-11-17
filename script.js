// Simple product data to mimic the UI in the screenshot
const products = {
  men: [
    { id: 'jacket', name: 'Jacket', price: 200, icon: '🧥' },
    { id: 'overcoat', name: 'Over Coat', price: 150, icon: '🧥' },
    { id: 'shirt', name: 'Shirt', price: 50, icon: '👔' },
    { id: 'shirt-silk', name: 'Shirt Silk', price: 80, icon: '👔' },
    { id: 'suit-2pc', name: 'Suit 2 pc', price: 150, icon: '🤵' },
    { id: 'tie', name: 'Tie', price: 50, icon: '👔' },
    { id: 'trouser', name: 'Trouser', price: 70, icon: '👖' },
    { id: 'jeans', name: 'Jeans', price: 90, icon: '👖' },
    { id: 'blazer', name: 'Blazer', price: 150, icon: '🧥' },
    { id: 'tshirt', name: 'T-Shirt', price: 100, icon: '👕' },
    { id: 'suit-3pc', name: 'Suit 3 PC', price: 200, icon: '🤵' },
    { id: 'sweater', name: 'Sweater', price: 100, icon: '🧶' }
  ],
  women: [
    { id: 'dress', name: 'Dress', price: 40, icon: '👗' },
    { id: 'dress-evening', name: 'Dress Evening', price: 120, icon: '👗' },
    { id: 'scarf', name: 'Scarf', price: 60, icon: '🧣' },
    { id: 'skirt', name: 'Skirt', price: 50, icon: '🩳' },
    { id: 'top', name: 'Top', price: 50, icon: '👚' },
    { id: 'saree', name: 'Saree', price: 100, icon: '🧵' },
    { id: 'dress-gown', name: 'Dress Gown', price: 30, icon: '👗' }
  ]
};

const state = {
  cart: {}, // key -> { name, price, qty }
  filter: '',
};

function formatCurrency(v) { return `₹${v.toFixed(2)}`; }

function createTile(item) {
  const tile = document.createElement('div');
  tile.className = 'tile';
  tile.dataset.id = item.id;
  tile.innerHTML = `
    <div class="tile-controls">
      <button class="tile-btn" data-action="add">+</button>
      <button class="tile-btn" data-action="remove">−</button>
    </div>
    <div class="icon">${item.icon}</div>
    <div class="name">${item.name}</div>
    <div class="price">${formatCurrency(item.price)}</div>
    <div class="count" id="count-${item.id}">0</div>
  `;
  tile.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (action === 'add') { addToCart(item); return; }
    if (action === 'remove') { removeOne(item.id); return; }
    addToCart(item);
  });
  return tile;
}

function renderGrid(sectionId, items) {
  const grid = document.getElementById(sectionId);
  grid.innerHTML = '';
  items
    .filter(i => i.name.toLowerCase().includes(state.filter))
    .forEach(item => grid.appendChild(createTile(item)));
}

function updateCounts() {
  Object.keys(state.cart).forEach(id => {
    const el = document.getElementById(`count-${id}`);
    if (el) el.textContent = state.cart[id].qty;
  });
}

function renderCart() {
  const list = document.getElementById('cartItems');
  list.innerHTML = '';
  let itemCount = 0;
  let total = 0;

  Object.values(state.cart).forEach(({ name, price, qty, id }) => {
    itemCount += qty;
    total += price * qty;
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${name}</span>
      <span>x${qty}</span>
      <span>${formatCurrency(price * qty)}</span>
      <span class="remove" title="Remove">×</span>
    `;
    li.querySelector('.remove').addEventListener('click', () => removeFromCart(id));
    list.appendChild(li);
  });

  document.getElementById('itemCount').textContent = itemCount;
  document.getElementById('grandTotal').textContent = formatCurrency(total);
}

function addToCart(item) {
  const existing = state.cart[item.id];
  if (existing) existing.qty += 1; else state.cart[item.id] = { id: item.id, name: item.name, price: item.price, qty: 1 };
  updateCounts();
  renderCart();
}

function removeFromCart(id) {
  const entry = state.cart[id];
  if (!entry) return;
  entry.qty -= 1;
  if (entry.qty <= 0) delete state.cart[id];
  updateCounts();
  renderCart();
}

function removeOne(id) { // remove one unit directly from grid
  removeFromCart(id);
}

function resetCart() {
  state.cart = {};
  updateCounts();
  renderCart();
}

function applyFilter(value) {
  state.filter = value.toLowerCase();
  renderGrid('menGrid', products.men);
  renderGrid('womenGrid', products.women);
  updateCounts();
}

function previewNextOrderId() {
  const last = JSON.parse(localStorage.getItem('lastOrderNumber') || '0');
  const next = Number(last) + 1;
  document.getElementById('orderId').textContent = `SO-${next}`;
}

function init() {
  renderGrid('menGrid', products.men);
  renderGrid('womenGrid', products.women);
  renderCart();

  previewNextOrderId();

  // If Receipt is an anchor, point it to last order id if present
  const receiptLinkInit = document.getElementById('btnReceipt');
  if (receiptLinkInit && receiptLinkInit.tagName.toLowerCase() === 'a'){
    const last = JSON.parse(localStorage.getItem('lastOrder') || 'null');
    if (last){ receiptLinkInit.href = `receipt.html?id=${encodeURIComponent(last.id)}`; }
  }

  document.getElementById('searchInput').addEventListener('input', (e) => applyFilter(e.target.value));
  document.getElementById('resetBtn').addEventListener('click', resetCart);
  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);

  document.getElementById('addCustomerBtn').addEventListener('click', openCustomerModal);
  document.getElementById('customerInput').addEventListener('input', (e) => renderCustomerSuggestions(e.target.value));
  document.getElementById('customerInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      const term = e.target.value.trim();
      if (!term) return;
      const match = getCustomers().find(c => (c.name||'').toLowerCase() === term.toLowerCase() || (c.phone||'') === term);
      if (match){
        document.getElementById('customerName').textContent = `Customer: ${match.name}${match.phone?` (${match.phone})`:''}`;
        e.target.value = '';
        document.getElementById('customerSuggestions').classList.remove('open');
        document.getElementById('customerSuggestions').innerHTML = '';
      }
    }
  });
  document.addEventListener('click', (e) => {
    const box = document.getElementById('customerSuggestions');
    if (!box.contains(e.target) && e.target.id !== 'customerInput'){ box.classList.remove('open'); }
  });

  document.getElementById('btnNewOrder').addEventListener('click', () => { resetCart(); previewNextOrderId(); });
  const receiptBtn = document.getElementById('btnReceipt');
  if (receiptBtn && receiptBtn.tagName.toLowerCase() === 'button') {
    receiptBtn.addEventListener('click', printLastReceipt);
  }
  document.getElementById('btnGarment').addEventListener('click', openReturnModal);

  document.querySelectorAll('.tab').forEach((t) => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
    });
  });
}

// Checkout & Receipt
function openCheckout() {
  // Build table
  const table = document.getElementById('checkoutTable');
  table.innerHTML = '<tr><th>Item</th><th>Qty</th><th>Price</th></tr>';
  let total = 0;
  Object.values(state.cart).forEach(({ name, price, qty }) => {
    total += price * qty;
    const row = document.createElement('tr');
    row.innerHTML = `<td>${name}</td><td>${qty}</td><td>${formatCurrency(price * qty)}</td>`;
    table.appendChild(row);
  });
  document.getElementById('checkoutTotal').textContent = formatCurrency(total);
  toggleModal('checkoutModal', true);

  document.getElementById('closeCheckout').onclick = () => toggleModal('checkoutModal', false);
  document.getElementById('confirmCheckout').onclick = confirmCheckout;
  document.getElementById('printReceipt').onclick = printLastReceipt;
}

function confirmCheckout() {
  const items = Object.values(state.cart);
  if (items.length === 0) { alert('Cart is empty.'); return; }
  const customerText = document.getElementById('customerName').textContent.replace('Customer: ', '') || 'Walk-in';
  const nextId = nextOrderId();
  const order = {
    id: nextId,
    customer: customerText,
    createdAt: new Date().toISOString(),
    items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, returnedQty: 0 })),
    total: items.reduce((sum, i) => sum + i.price * i.qty, 0)
  };
  saveOrder(order);

  // Update Receipt anchor to point to this order id
  const receiptLink = document.getElementById('btnReceipt');
  if (receiptLink && receiptLink.tagName.toLowerCase() === 'a'){
    receiptLink.href = `receipt.html?id=${encodeURIComponent(order.id)}`;
  }

  document.getElementById('orderId').textContent = order.id;
  toggleModal('checkoutModal', false);
  resetCart();
  alert(`Order ${order.id} saved.`);
}

function toggleModal(id, open) {
  const el = document.getElementById(id);
  el.classList.toggle('open', open);
}

function nextOrderId() {
  const last = JSON.parse(localStorage.getItem('lastOrderNumber') || '0');
  const next = Number(last) + 1;
  localStorage.setItem('lastOrderNumber', String(next));
  return `SO-${next}`;
}

function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  localStorage.setItem('lastOrder', JSON.stringify(order));
}

function getOrderById(id) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  return orders.find(o => o.id === id);
}

function printLastReceipt() {
  const order = JSON.parse(localStorage.getItem('lastOrder') || 'null');
  if (!order) { alert('No receipt available. Complete a checkout first.'); return; }
  window.open(`receipt.html?id=${encodeURIComponent(order.id)}`, '_blank');
}

// Return Garment
function openReturnModal() {
  // Prefill with last order id to make returns easier
  const last = JSON.parse(localStorage.getItem('lastOrder') || 'null');
  const input = document.getElementById('returnOrderId');
  if (input) { input.value = last?.id || ''; }

  toggleModal('returnModal', true);
  document.getElementById('closeReturn').onclick = () => toggleModal('returnModal', false);
  document.getElementById('loadReturnOrder').onclick = loadReturnOrder;
  document.getElementById('confirmReturn').onclick = confirmReturn;
}

let returnContext = { order: null, pendingReturns: {} };

function loadReturnOrder() {
  const id = document.getElementById('returnOrderId').value.trim();
  const order = getOrderById(id);
  if (!order) { alert('Order not found.'); return; }
  returnContext.order = order;
  returnContext.pendingReturns = {};
  const table = document.getElementById('returnTable');
  table.innerHTML = '<tr><th>Item</th><th>Bought</th><th>Returned</th><th>Return Now</th></tr>';
  order.items.forEach(i => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i.name}</td>
      <td>${i.qty}</td>
      <td>${i.returnedQty || 0}</td>
      <td>
        <button data-id="${i.id}" data-delta="-1">−</button>
        <span id="ret-${i.id}">0</span>
        <button data-id="${i.id}" data-delta="1">+</button>
      </td>`;
    table.appendChild(row);
  });
  table.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const delta = Number(btn.getAttribute('data-delta'));
      const current = returnContext.pendingReturns[id] || 0;
      const item = order.items.find(x => x.id === id);
      const max = item.qty - (item.returnedQty || 0);
      const next = Math.max(0, Math.min(max, current + delta));
      returnContext.pendingReturns[id] = next;
      document.getElementById(`ret-${id}`).textContent = String(next);
    });
  });
}

function confirmReturn() {
  const order = returnContext.order;
  if (!order) { alert('Load an order first.'); return; }
  Object.entries(returnContext.pendingReturns).forEach(([id, qty]) => {
    const item = order.items.find(i => i.id === id);
    if (!item) return;
    item.returnedQty = (item.returnedQty || 0) + qty;
  });
  // Persist
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const idx = orders.findIndex(o => o.id === order.id);
  if (idx >= 0) orders[idx] = order;
  localStorage.setItem('orders', JSON.stringify(orders));
  if (JSON.parse(localStorage.getItem('lastOrder') || 'null')?.id === order.id) {
    localStorage.setItem('lastOrder', JSON.stringify(order));
  }
  alert('Return recorded.');
  toggleModal('returnModal', false);
}

// Customers
function getCustomers(){ return JSON.parse(localStorage.getItem('customers') || '[]'); }
function setCustomers(list){ localStorage.setItem('customers', JSON.stringify(list)); }
function addCustomer(c){ const list = getCustomers(); list.push(c); setCustomers(list); }

function openCustomerModal(){
  toggleModal('customerModal', true);
  document.getElementById('closeCustomer').onclick = () => toggleModal('customerModal', false);
  document.getElementById('saveCustomer').onclick = () => {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    if (!name) { alert('Enter customer name'); return; }
    addCustomer({ name, phone, address });
    document.getElementById('customerName').textContent = `Customer: ${name}${phone?` (${phone})`:''}`;
    toggleModal('customerModal', false);
  };
}

function renderCustomerSuggestions(term){
  const box = document.getElementById('customerSuggestions');
  if (!term){ box.classList.remove('open'); box.innerHTML = ''; return; }
  const list = getCustomers().filter(c =>
    (c.name||'').toLowerCase().includes(term.toLowerCase()) || (c.phone||'').includes(term)
  ).slice(0,8);
  if (list.length === 0){ box.classList.remove('open'); box.innerHTML = ''; return; }
  box.innerHTML = list.map(c => `<div class="suggestion-item" data-name="${c.name}" data-phone="${c.phone||''}">${c.name}${c.phone?` • ${c.phone}`:''}</div>`).join('');
  box.classList.add('open');
  box.querySelectorAll('.suggestion-item').forEach(el => {
    el.addEventListener('click', () => {
      const name = el.getAttribute('data-name');
      const phone = el.getAttribute('data-phone');
      document.getElementById('customerName').textContent = `Customer: ${name}${phone?` (${phone})`:''}`;
      document.getElementById('customerInput').value = '';
      box.classList.remove('open');
      box.innerHTML = '';
    });
  });
}

// extend init to wire customer features
function init(){
  renderGrid('menGrid', products.men);
  renderGrid('womenGrid', products.women);
  renderCart();

  previewNextOrderId();

  document.getElementById('searchInput').addEventListener('input', (e) => applyFilter(e.target.value));
  document.getElementById('resetBtn').addEventListener('click', resetCart);
  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);

  document.getElementById('addCustomerBtn').addEventListener('click', openCustomerModal);
  document.getElementById('customerInput').addEventListener('input', (e) => renderCustomerSuggestions(e.target.value));
  document.getElementById('customerInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      const term = e.target.value.trim();
      if (!term) return;
      const match = getCustomers().find(c => (c.name||'').toLowerCase() === term.toLowerCase() || (c.phone||'') === term);
      if (match){
        document.getElementById('customerName').textContent = `Customer: ${match.name}${match.phone?` (${match.phone})`:''}`;
        e.target.value = '';
        document.getElementById('customerSuggestions').classList.remove('open');
        document.getElementById('customerSuggestions').innerHTML = '';
      }
    }
  });
  document.addEventListener('click', (e) => {
    const box = document.getElementById('customerSuggestions');
    if (!box.contains(e.target) && e.target.id !== 'customerInput'){ box.classList.remove('open'); }
  });

  document.getElementById('btnNewOrder').addEventListener('click', () => { resetCart(); previewNextOrderId(); });
  document.getElementById('btnReceipt').addEventListener('click', printLastReceipt);
  document.getElementById('btnGarment').addEventListener('click', openReturnModal);

  document.querySelectorAll('.tab').forEach((t) => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
    });
  });
}
init();