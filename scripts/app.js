const storageKey = 'evergreenPoultryData';

const defaultData = {
  birds: [
    { id: 'B001', name: 'Ruby Layer', type: 'Layer', age: 18, quantity: 42, status: 'Healthy', location: 'House A', notes: 'Strong daily production' },
    { id: 'B002', name: 'Gold Broiler', type: 'Broiler', age: 10, quantity: 120, status: 'Growing', location: 'House B', notes: 'Ready for market in 4 weeks' },
    { id: 'B003', name: 'Silver Duck', type: 'Duck', age: 12, quantity: 25, status: 'Healthy', location: 'Pond', notes: 'Good feed conversion' }
  ],
  feeds: [
    { day: 'Monday', schedule: 'Layer mash, vitamins', amount: '4 kg', status: 'On track' },
    { day: 'Wednesday', schedule: 'Broiler grower feed', amount: '6 kg', status: 'On track' },
    { day: 'Friday', schedule: 'Mineral mix + clean water', amount: '5 kg', status: 'On track' }
  ],
  health: [
    { date: '2026-04-10', item: 'Vaccination', bird: 'Ruby Layer', result: 'Completed' },
    { date: '2026-04-12', item: 'General check', bird: 'Gold Broiler', result: 'Normal' },
    { date: '2026-04-14', item: 'Pond water test', bird: 'Silver Duck', result: 'Optimal' }
  ],
  inventory: [
    { name: 'Layer Feed Bags', quantity: 18, unit: 'bags', status: 'Sufficient' },
    { name: 'Broiler Starter Mix', quantity: 12, unit: 'bags', status: 'Low stock' },
    { name: 'Vaccines', quantity: 6, unit: 'vials', status: 'Sufficient' }
  ]
};

const state = {
  birds: [],
  feeds: [],
  health: [],
  inventory: []
};

function loadState() {
  const saved = window.localStorage.getItem(storageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(state, parsed);
      return;
    } catch (error) {
      console.warn('Failed to parse saved data:', error);
    }
  }
  Object.assign(state, JSON.parse(JSON.stringify(defaultData)));
}

function saveState() {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

function formatNumber(value) {
  return Number(value).toLocaleString();
}

function buildStatusBadge(status) {
  const slug = status.toLowerCase().includes('low') ? 'yellow' : status.toLowerCase().includes('healthy') || status.toLowerCase().includes('sufficient') ? 'green' : 'red';
  return `<span class="badge ${slug}">${status}</span>`;
}

function renderSummary() {
  const birdCount = state.birds.reduce((sum, bird) => sum + bird.quantity, 0);
  const feedItems = state.feeds.length;
  const healthChecks = state.health.length;
  const lowStock = state.inventory.filter(item => item.status.toLowerCase().includes('low')).length;

  document.getElementById('summary-birds').innerHTML = `<h2>Total Flock</h2><p>All birds currently tracked</p><strong>${formatNumber(birdCount)}</strong>`;
  document.getElementById('summary-feed').innerHTML = `<h2>Feed Plans</h2><p>Scheduled feed entries</p><strong>${feedItems}</strong>`;
  document.getElementById('summary-health').innerHTML = `<h2>Health Logs</h2><p>Recent health checks</p><strong>${healthChecks}</strong>`;
  document.getElementById('summary-inventory').innerHTML = `<h2>Inventory Alerts</h2><p>Low stock items</p><strong>${lowStock}</strong>`;
}

function renderBirdTable() {
  const container = document.getElementById('birds-table-body');
  if (!container) return;
  container.innerHTML = state.birds.map(bird => `
    <tr>
      <td>${bird.id}</td>
      <td>${bird.name}</td>
      <td>${bird.type}</td>
      <td>${bird.age} wk</td>
      <td>${bird.quantity}</td>
      <td>${buildStatusBadge(bird.status)}</td>
      <td>${bird.location}</td>
      <td>${bird.notes}</td>
      <td><button class="secondary-btn" data-action="delete-bird" data-id="${bird.id}">Remove</button></td>
    </tr>
  `).join('');
}

function renderFeedTable() {
  const container = document.getElementById('feed-table-body');
  if (!container) return;
  container.innerHTML = state.feeds.map(row => `
    <tr>
      <td>${row.day}</td><td>${row.schedule}</td><td>${row.amount}</td><td>${buildStatusBadge(row.status)}</td>
    </tr>
  `).join('');
}

function renderHealthTable() {
  const container = document.getElementById('health-table-body');
  if (!container) return;
  container.innerHTML = state.health.map(item => `
    <tr>
      <td>${item.date}</td><td>${item.item}</td><td>${item.bird}</td><td>${item.result}</td>
    </tr>
  `).join('');
}

function renderInventoryTable() {
  const container = document.getElementById('inventory-table-body');
  if (!container) return;
  container.innerHTML = state.inventory.map(item => `
    <tr>
      <td>${item.name}</td><td>${item.quantity}</td><td>${item.unit}</td><td>${buildStatusBadge(item.status)}</td>
    </tr>
  `).join('');
}

function renderReports() {
  const reportElement = document.getElementById('report-summary');
  const birdsByType = state.birds.reduce((acc, bird) => {
    acc[bird.type] = (acc[bird.type] || 0) + bird.quantity;
    return acc;
  }, {});
  const reportLines = Object.entries(birdsByType).map(([type, qty]) => `<li><strong>${type}</strong>: ${qty} birds</li>`).join('');
  reportElement.innerHTML = `
    <p>Quick health and flock breakdown with feed and inventory readiness.</p>
    <ul>${reportLines}</ul>
  `;
}

function renderAll() {
  renderSummary();
  renderBirdTable();
  renderFeedTable();
  renderHealthTable();
  renderInventoryTable();
  renderReports();
}

function openModal() {
  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('bird-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.getElementById('bird-modal').classList.remove('active');
  document.getElementById('bird-form').reset();
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2200);
}

function addBird(event) {
  event.preventDefault();
  const form = document.getElementById('bird-form');
  const formData = new FormData(form);
  const newBird = {
    id: `B${String(state.birds.length + 1).padStart(3, '0')}`,
    name: formData.get('name').trim(),
    type: formData.get('type'),
    age: Number(formData.get('age')),
    quantity: Number(formData.get('quantity')),
    status: formData.get('status'),
    location: formData.get('location').trim(),
    notes: formData.get('notes').trim() || 'No notes provided'
  };

  if (!newBird.name || !newBird.location || !newBird.type || !newBird.status) {
    showToast('Please complete all required fields.');
    return;
  }

  state.birds.push(newBird);
  saveState();
  renderAll();
  closeModal();
  showToast(`Added ${newBird.name} to the flock.`);
}

function removeBird(id) {
  const index = state.birds.findIndex(bird => bird.id === id);
  if (index === -1) return;
  const [removed] = state.birds.splice(index, 1);
  saveState();
  renderAll();
  showToast(`Removed ${removed.name} from the flock.`);
}

function resetData() {
  window.localStorage.removeItem(storageKey);
  Object.assign(state, JSON.parse(JSON.stringify(defaultData)));
  renderAll();
  showToast('Data reset to the default sample app state.');
}

function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(button => button.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById(target).classList.add('active');
    });
  });
}

function attachEvents() {
  document.getElementById('add-bird-btn').addEventListener('click', openModal);
  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('cancel-modal').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', closeModal);
  document.getElementById('bird-form').addEventListener('submit', addBird);
  document.getElementById('reset-btn').addEventListener('click', resetData);

  document.getElementById('birds-table-body').addEventListener('click', event => {
    const target = event.target.closest('button[data-action="delete-bird"]');
    if (!target) return;
    removeBird(target.dataset.id);
  });
}

function init() {
  loadState();
  renderAll();
  initTabs();
  attachEvents();
}

init();
