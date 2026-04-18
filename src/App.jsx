import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'evergreenPoultryData';
const AUTH_KEY = 'evergreenAuthUser';
const defaultData = {
  accounts: [
    { 
      username: 'admin', 
      password: 'admin', 
      email: 'admin@evergreen.com',
      fullName: 'System Administrator',
      phone: '',
      farmName: 'Evergreen Poultry Farm',
      city: 'Farmville',
      role: 'admin' 
    },
    { 
      username: 'customer', 
      password: 'customer', 
      email: 'customer@evergreen.com',
      fullName: 'John Customer',
      phone: '+1 (555) 123-4567',
      farmName: 'Customer Farm',
      city: 'Springfield',
      role: 'customer' 
    }
  ],
  birds: [
    { id: 'B001', name: 'Ruby Layer', breed: 'Rhode Island Red', type: 'Layer', age: 18, quantity: 42, arrivalDate: '2025-10-05', pen: 'House A', status: 'Healthy', notes: 'Strong daily production' },
    { id: 'B002', name: 'Gold Broiler', breed: 'Cornish Cross', type: 'Broiler', age: 10, quantity: 120, arrivalDate: '2026-03-20', pen: 'House B', status: 'Growing', notes: 'Ready for market in 4 weeks' },
    { id: 'B003', name: 'Silver Duck', breed: 'Pekin', type: 'Duck', age: 12, quantity: 25, arrivalDate: '2026-02-28', pen: 'Pond', status: 'Healthy', notes: 'Good feed conversion' }
  ],
  feeds: [
    { type: 'Starter', schedule: 'Layer mash, vitamins', amount: '4 kg', stock: '20 kg', cost: 12.5, status: 'On track' },
    { type: 'Grower', schedule: 'Broiler grower feed', amount: '6 kg', stock: '14 kg', cost: 18.0, status: 'On track' },
    { type: 'Finisher', schedule: 'Mineral mix + clean water', amount: '5 kg', stock: '10 kg', cost: 15.0, status: 'On track' }
  ],
  eggProduction: [
    { date: '2026-04-15', collected: 320, broken: 8, gradeA: 210, gradeB: 102 },
    { date: '2026-04-14', collected: 305, broken: 6, gradeA: 195, gradeB: 104 },
    { date: '2026-04-13', collected: 298, broken: 10, gradeA: 190, gradeB: 98 }
  ],
  mortality: {
    deadRecords: [
      { date: '2026-04-14', batch: 'Gold Broiler', cause: 'Heat stress', quantity: 2 },
      { date: '2026-04-12', batch: 'Ruby Layer', cause: 'Unknown', quantity: 1 }
    ],
    cullingLogs: [
      { date: '2026-04-10', batch: 'Silver Duck', reason: 'Low production', quantity: 3 }
    ]
  },
  health: {
    vaccinations: [
      { date: '2026-04-01', batch: 'Ruby Layer', vaccine: 'Newcastle', status: 'Completed' },
      { date: '2026-04-12', batch: 'Gold Broiler', vaccine: 'IB', status: 'Scheduled' }
    ],
    medications: [
      { date: '2026-04-06', batch: 'Silver Duck', medicine: 'Probiotic', notes: 'Support gut health' }
    ],
    diseaseHistory: [
      { date: '2026-03-18', batch: 'Gold Broiler', issue: 'Coccidiosis', resolution: 'Medication given' }
    ],
    vetNotes: [
      { date: '2026-04-08', note: 'Monitor water quality in House B and adjust feed ratio.' }
    ]
  },
  housing: [
    { house: 'House A', pen: 'Pen 1', capacity: 60, currentPopulation: 42 },
    { house: 'House B', pen: 'Pen 2', capacity: 130, currentPopulation: 120 },
    { house: 'Pond', pen: 'Pen 3', capacity: 40, currentPopulation: 25 }
  ],
  sales: {
    eggSales: [
      { date: '2026-04-15', customer: 'Market Stall', quantity: 280, revenue: 210.0 },
      { date: '2026-04-14', customer: 'Local Shop', quantity: 250, revenue: 187.5 }
    ],
    birdSales: [
      { date: '2026-04-10', customer: 'Distributor', type: 'Broiler', quantity: 50, revenue: 375.0 }
    ],
    customers: ['Market Stall', 'Local Shop', 'Distributor']
  },
  inventory: [
    { category: 'Feed', name: 'Layer Feed Bags', quantity: 18, unit: 'bags', status: 'Sufficient' },
    { category: 'Feed', name: 'Broiler Starter Mix', quantity: 12, unit: 'bags', status: 'Low stock' },
    { category: 'Vaccine', name: 'Vaccines', quantity: 6, unit: 'vials', status: 'Sufficient' },
    { category: 'Equipment', name: 'Water Nipples', quantity: 8, unit: 'pcs', status: 'Sufficient' }
  ],
  users: [
    { 
      name: 'System Administrator', 
      username: 'admin',
      email: 'admin@evergreen.com',
      phone: '',
      farmName: 'Evergreen Poultry Farm',
      city: 'Farmville',
      role: 'Administrator', 
      lastActive: '2026-04-15', 
      activity: 'Updated feed schedule' 
    },
    { 
      name: 'John Customer', 
      username: 'customer',
      email: 'customer@evergreen.com',
      phone: '+1 (555) 123-4567',
      farmName: 'Customer Farm',
      city: 'Springfield',
      role: 'Staff', 
      lastActive: '2026-04-15', 
      activity: 'Logged egg collection' 
    }
  ],
  notifications: [
    { message: 'Vaccination due for Gold Broiler on 2026-04-18', type: 'Reminder' },
    { message: 'Broiler Starter Mix stock is low', type: 'Alert' },
    { message: 'High mortality warning in House B', type: 'Warning' }
  ],
  settings: {
    farmName: 'Evergreen Poultry Farm',
    owner: 'Evergreen Management',
    units: 'kg / bags / pcs',
    preferences: 'Use 24-hour clock, metric units'
  }
};

const getStatusBadgeClass = (status) => {
  const normalized = status.toLowerCase();
  if (normalized.includes('low')) return 'yellow';
  if (normalized.includes('healthy') || normalized.includes('sufficient')) return 'green';
  return 'red';
};

const buildBadge = (status) => (
  <span className={`badge ${getStatusBadgeClass(status)}`}>{status}</span>
);

const generateBirdId = (birds) => `B${String(birds.length + 1).padStart(3, '0')}`;
const tabKeys = ['dashboard', 'birds', 'feed', 'egg', 'mortality', 'health', 'housing', 'sales', 'inventory', 'reports', 'users', 'notifications', 'settings'];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [state, setState] = useState(defaultData);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authType, setAuthType] = useState('general'); // 'general' or 'admin'
  const [authFields, setAuthFields] = useState({ 
    username: '', 
    password: '', 
    email: '',
    fullName: '',
    phone: '',
    farmName: '',
    city: '',
    role: 'customer' 
  });
  const [authError, setAuthError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', breed: '', type: '', age: 8, quantity: 10, arrivalDate: '', pen: '', status: '', location: '', notes: ''
  });
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.accounts) {
          parsed.accounts = defaultData.accounts;
        } else {
          // Migrate existing accounts to include new fields
          parsed.accounts = parsed.accounts.map(account => ({
            email: account.email || '',
            fullName: account.fullName || account.username || '',
            phone: account.phone || '',
            farmName: account.farmName || '',
            city: account.city || '',
            username: account.username,
            password: account.password,
            role: account.role
          }));
        }
        if (!parsed.users) {
          parsed.users = defaultData.users;
        } else {
          // Migrate existing users to include new fields
          parsed.users = parsed.users.map(user => ({
            name: user.name || user.username || '',
            username: user.username,
            email: user.email || '',
            phone: user.phone || '',
            farmName: user.farmName || '',
            city: user.city || '',
            role: user.role,
            lastActive: user.lastActive || 'Never',
            activity: user.activity || 'Account created'
          }));
        }
        setState(parsed);
      } catch (error) {
        console.warn('Unable to parse saved data', error);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const savedAuth = window.localStorage.getItem(AUTH_KEY);
    if (savedAuth) {
      try {
        setCurrentUser(JSON.parse(savedAuth));
      } catch (error) {
        console.warn('Unable to parse saved auth', error);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser));
    } else {
      window.localStorage.removeItem(AUTH_KEY);
    }
  }, [currentUser]);

  const handleAuthChange = (event) => {
    const { name, value } = event.target;
    setAuthFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const user = state.accounts.find((account) =>
      account.username === authFields.username &&
      account.password === authFields.password
    );

    if (!user) {
      setAuthError('Invalid username or password.');
      return;
    }

    // Check role-based access
    if (authType === 'admin' && user.role !== 'admin') {
      setAuthError('Access denied. This login is for administrators only.');
      return;
    }

    if (authType === 'general' && user.role === 'admin') {
      setAuthError('Admin accounts must login through the Admin Login page.');
      return;
    }

    setCurrentUser({ username: user.username, role: user.role });
    setAuthError('');
  };

  const handleSignup = (event) => {
    event.preventDefault();
    const { username, password, email, fullName, phone, farmName, city } = authFields;
    
    // Required field validation
    if (!username || !password || !email || !fullName) {
      setAuthError('Please fill in all required fields (username, password, email, full name).');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    // Username uniqueness check
    if (state.accounts.some((account) => account.username === username)) {
      setAuthError('Username already exists. Please choose another.');
      return;
    }

    // Email uniqueness check
    if (state.accounts.some((account) => account.email === email)) {
      setAuthError('Email address already registered. Please use a different email.');
      return;
    }

    const newAccount = { 
      username, 
      password, 
      email,
      fullName,
      phone: phone || '',
      farmName: farmName || '',
      city: city || '',
      role: 'customer' 
    };
    
    setState((prev) => ({
      ...prev,
      accounts: [...prev.accounts, newAccount],
      users: [...prev.users, { 
        name: fullName, 
        username,
        email,
        phone: phone || '',
        farmName: farmName || '',
        city: city || '',
        role: 'customer', 
        lastActive: 'Just now', 
        activity: 'Signed up' 
      }]
    }));
    
    setCurrentUser({ username, role: 'customer' });
    setAuthError('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthFields({ 
      username: '', 
      password: '', 
      email: '',
      fullName: '',
      phone: '',
      farmName: '',
      city: '',
      role: 'customer' 
    });
    setAuthType('general');
    setAuthError('');
    setActiveTab('dashboard');
  };

  const visibleTabKeys = tabKeys.filter((tabKey) => {
    if (!currentUser) return false;
    if (['users', 'settings'].includes(tabKey) && currentUser.role !== 'admin') {
      return false;
    }
    return true;
  });

  const authScreen = (
    <div className="auth-screen">
      <div className="auth-card">
        {authType === 'general' ? (
          <>
            <h2>Evergreen Login</h2>
            <p>Sign in to access the farm dashboard. Use customer accounts only.</p>
            <div className="auth-tabs">
              <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => { setAuthMode('login'); setAuthError(''); }}>
                Login
              </button>
              <button type="button" className={authMode === 'signup' ? 'active' : ''} onClick={() => { setAuthMode('signup'); setAuthError(''); }}>
                Signup
              </button>
            </div>
            <form onSubmit={authMode === 'login' ? handleLogin : handleSignup}>
              <label>
                Username *
                <input name="username" value={authFields.username} onChange={handleAuthChange} required />
              </label>
              <label>
                Password *
                <input name="password" type="password" value={authFields.password} onChange={handleAuthChange} required />
              </label>
              {authMode === 'signup' && (
                <>
                  <label>
                    Email Address *
                    <input name="email" type="email" value={authFields.email} onChange={handleAuthChange} required placeholder="your@email.com" />
                  </label>
                  <label>
                    Full Name *
                    <input name="fullName" value={authFields.fullName} onChange={handleAuthChange} required placeholder="John Doe" />
                  </label>
                  <label>
                    Phone Number
                    <input name="phone" type="tel" value={authFields.phone} onChange={handleAuthChange} placeholder="+1 (555) 123-4567" />
                  </label>
                  <label>
                    Farm/Business Name
                    <input name="farmName" value={authFields.farmName} onChange={handleAuthChange} placeholder="Evergreen Farms" />
                  </label>
                  <label>
                    City
                    <input name="city" value={authFields.city} onChange={handleAuthChange} placeholder="Springfield" />
                  </label>
                </>
              )}
              {authError && <div className="auth-error">{authError}</div>}
              <button type="submit" className="primary-btn">{authMode === 'login' ? 'Login' : 'Create account'}</button>
            </form>
            <div className="auth-links">
              <button type="button" className="admin-link" onClick={() => { setAuthType('admin'); setAuthMode('login'); setAuthError(''); }}>
                Admin Login →
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Admin Login</h2>
            <p>Administrative access only. Use admin credentials to login.</p>
            <form onSubmit={handleLogin}>
              <label>
                Admin Username
                <input name="username" value={authFields.username} onChange={handleAuthChange} required />
              </label>
              <label>
                Admin Password
                <input name="password" type="password" value={authFields.password} onChange={handleAuthChange} required />
              </label>
              {authError && <div className="auth-error">{authError}</div>}
              <button type="submit" className="primary-btn">Admin Login</button>
            </form>
            <div className="auth-links">
              <button type="button" className="back-link" onClick={() => { setAuthType('general'); setAuthError(''); }}>
                ← Back to General Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const summary = useMemo(() => {
    const birdCount = state.birds.reduce((sum, bird) => sum + bird.quantity, 0);
    const feedItems = state.feeds.length;
    const healthChecks = state.health.vaccinations.length + state.health.medications.length;
    const lowStock = state.inventory.filter((item) => item.status.toLowerCase().includes('low')).length;
    return { birdCount, feedItems, healthChecks, lowStock };
  }, [state]);

  const dashboardMetrics = useMemo(() => {
    const totalBirds = state.birds.reduce((sum, bird) => sum + bird.quantity, 0);
    const totalLayers = state.birds
      .filter((bird) => bird.type.toLowerCase() === 'layer')
      .reduce((sum, bird) => sum + bird.quantity, 0);
    const latestEgg = state.eggProduction[0] || { collected: 0 };
    const dailyEggProduction = latestEgg.collected;
    const deadCount = state.mortality.deadRecords.reduce((sum, record) => sum + record.quantity, 0)
      + state.mortality.cullingLogs.reduce((sum, record) => sum + record.quantity, 0);
    const mortalityRate = totalBirds ? Number(((deadCount / totalBirds) * 100).toFixed(1)) : 0;
    const feedConsumption = state.feeds.reduce((sum, item) => {
      const match = item.amount.match(/\d+(?:\.\d+)?/);
      return sum + (match ? Number(match[0]) : 0);
    }, 0);

    const alerts = [];
    const lowStock = state.inventory.filter((item) => item.status.toLowerCase().includes('low'));
    lowStock.forEach((item) => alerts.push(`Low feed: ${item.name}`));
    state.notifications.forEach((notification) => alerts.push(`${notification.type}: ${notification.message}`));

    const diseaseAlerts = state.health.diseaseHistory.filter((item) => /disease|illness|sick|fever|infection/i.test(item.issue));
    diseaseAlerts.forEach((item) => alerts.push(`Disease alert: ${item.batch} - ${item.issue}`));

    if (!alerts.length) {
      alerts.push('No active alerts. Farm is stable.');
    }

    return { totalBirds, dailyEggProduction, mortalityRate, feedConsumption, alerts };
  }, [state]);

  const tabBadgeCounts = useMemo(() => {
    const lowStockCount = state.inventory.filter((item) => item.status.toLowerCase().includes('low')).length;
    const brokenEggCount = state.eggProduction.reduce((sum, entry) => sum + entry.broken, 0);
    const mortalityCount = state.mortality.deadRecords.length + state.mortality.cullingLogs.length;
    const healthCount = state.health.vaccinations.filter((item) => item.status.toLowerCase() !== 'completed').length
      + state.health.diseaseHistory.length;
    const notificationCount = state.notifications.length;
    return {
      feed: lowStockCount,
      egg: brokenEggCount,
      mortality: mortalityCount,
      health: healthCount,
      notifications: notificationCount
    };
  }, [state]);

  const tabLabel = (tabKey) => {
    if (tabKey === 'dashboard') return 'Dashboard';
    if (tabKey === 'birds') return 'Flock Management';
    if (tabKey === 'egg') return 'Egg Production';
    if (tabKey === 'mortality') return 'Mortality & Culling';
    if (tabKey === 'housing') return 'Housing / Pens';
    if (tabKey === 'sales') return 'Sales & Revenue';
    if (tabKey === 'inventory') return 'Inventory';
    if (tabKey === 'reports') return 'Reports';
    if (tabKey === 'users') return 'User Management';
    if (tabKey === 'notifications') return 'Notifications';
    if (tabKey === 'settings') return 'Settings';
    return tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
  };

  const reportStats = useMemo(() => {
    const totalEggs = state.eggProduction.reduce((sum, entry) => sum + entry.collected, 0);
    const totalBroken = state.eggProduction.reduce((sum, entry) => sum + entry.broken, 0);
    const totalRevenue = state.sales.eggSales.reduce((sum, sale) => sum + sale.revenue, 0)
      + state.sales.birdSales.reduce((sum, sale) => sum + sale.revenue, 0);
    const totalFeedCost = state.feeds.reduce((sum, item) => sum + (item.cost || 0), 0);
    const profit = totalRevenue - totalFeedCost;
    return { totalEggs, totalBroken, totalRevenue, profit };
  }, [state]);

  const birdsByType = useMemo(() => {
    return state.birds.reduce((acc, bird) => {
      acc[bird.type] = (acc[bird.type] || 0) + bird.quantity;
      return acc;
    }, {});
  }, [state.birds]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', breed: '', type: '', age: 8, quantity: 10, arrivalDate: '', pen: '', status: '', location: '', notes: '' });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'age' || name === 'quantity' ? Number(value) : value }));
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2200);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { name, breed, type, age, quantity, arrivalDate, pen, status, location, notes } = formData;
    if (!name || !breed || !type || !arrivalDate || !pen || !status || !location) {
      showToast('Please complete all required fields.');
      return;
    }

    const newBird = {
      id: generateBirdId(state.birds),
      name,
      breed,
      type,
      age,
      quantity,
      arrivalDate,
      pen,
      status,
      location,
      notes: notes || 'No notes provided'
    };

    setState((prev) => ({ ...prev, birds: [...prev.birds, newBird] }));
    handleCloseModal();
    showToast(`Added ${name} to the flock.`);
  };

  const removeBird = (id) => {
    setState((prev) => ({ ...prev, birds: prev.birds.filter((bird) => bird.id !== id) }));
    showToast('Bird record removed.');
  };

  const resetData = () => {
    setState(defaultData);
    window.localStorage.removeItem(STORAGE_KEY);
    showToast('Data reset to the sample state.');
  };

  if (!currentUser) {
    return authScreen;
  }

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="brand">
          <div className="logo">🌿</div>
          <div>
            <h1>Evergreen</h1>
            <p>Online Poultry Management Information System</p>
          </div>
        </div>
        <div className="header-info">
          <p>Signed in as <strong>{currentUser.username}</strong> ({currentUser.role})</p>
        </div>
        <div className="header-actions">
          <button type="button" className="primary-btn" onClick={handleOpenModal}>Add New Bird</button>
          {currentUser.role === 'admin' && (
            <button type="button" className="secondary-btn" onClick={resetData}>Reset Data</button>
          )}
          <button type="button" className="secondary-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <section className="layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="logo small">🌿</div>
            <div>
              <h2>Evergreen</h2>
              <p>Control center</p>
            </div>
          </div>
          <nav className="tabs">
            {visibleTabKeys.map((tabKey) => (
              <button
                key={tabKey}
                type="button"
                className={`tab ${activeTab === tabKey ? 'active' : ''}`}
                onClick={() => setActiveTab(tabKey)}
              >
                <span>{tabLabel(tabKey)}</span>
                {tabBadgeCounts[tabKey] > 0 && (
                  <span className="tab-count">{tabBadgeCounts[tabKey]}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        <div className="main-content">
          {activeTab === 'dashboard' && (
          <div className="tab-panel active">
            <div className="summary-grid">
              <article className="card">
                <h2>Total birds</h2>
                <p>All birds currently tracked on the farm.</p>
                <strong>{dashboardMetrics.totalBirds.toLocaleString()}</strong>
              </article>
              <article className="card">
                <h2>Daily egg production</h2>
                <p>Estimated eggs produced per day.</p>
                <strong>{dashboardMetrics.dailyEggProduction} eggs</strong>
              </article>
              <article className="card">
                <h2>Mortality rate</h2>
                <p>Recent loss rate across the flock.</p>
                <strong>{dashboardMetrics.mortalityRate}%</strong>
              </article>
              <article className="card">
                <h2>Feed consumption</h2>
                <p>Scheduled feed use per day.</p>
                <strong>{dashboardMetrics.feedConsumption.toFixed(1)} kg</strong>
              </article>
            </div>
            <div className="card" style={{ marginTop: '18px' }}>
              <h2>Alerts</h2>
              <ul>
                {dashboardMetrics.alerts.map((alert, index) => (
                  <li key={index}>{alert}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'birds' && (
          <div className="tab-panel active">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Breed</th>
                    <th>Type</th>
                    <th>Age</th>
                    <th>Quantity</th>
                    <th>Arrival Date</th>
                    <th>Pen / House</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.birds.map((bird) => (
                    <tr key={bird.id}>
                      <td>{bird.id}</td>
                      <td>{bird.name}</td>
                      <td>{bird.breed}</td>
                      <td>{bird.type}</td>
                      <td>{bird.age} wk</td>
                      <td>{bird.quantity}</td>
                      <td>{bird.arrivalDate}</td>
                      <td>{bird.pen}</td>
                      <td>{buildBadge(bird.status)}</td>
                      <td>{bird.notes}</td>
                      <td>
                        <button className="secondary-btn" type="button" onClick={() => removeBird(bird.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="tab-panel active">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Feed Type</th>
                    <th>Schedule</th>
                    <th>Daily Usage</th>
                    <th>Stock Level</th>
                    <th>Cost</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {state.feeds.map((item, index) => (
                    <tr key={`${item.type}-${index}`}>
                      <td>{item.type}</td>
                      <td>{item.schedule}</td>
                      <td>{item.amount}</td>
                      <td>{item.stock}</td>
                      <td>${item.cost.toFixed(2)}</td>
                      <td>{buildBadge(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'egg' && (
          <div className="tab-panel active">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Collected</th>
                    <th>Broken</th>
                    <th>Grade A</th>
                    <th>Grade B</th>
                  </tr>
                </thead>
                <tbody>
                  {state.eggProduction.map((entry, index) => (
                    <tr key={`${entry.date}-${index}`}>
                      <td>{entry.date}</td>
                      <td>{entry.collected}</td>
                      <td>{entry.broken}</td>
                      <td>{entry.gradeA}</td>
                      <td>{entry.gradeB}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card" style={{ marginTop: '18px' }}>
              <h2>Production Trends</h2>
              <p>Recent egg collection trend by day.</p>
              <ul>
                {state.eggProduction.map((entry) => (
                  <li key={entry.date}>{entry.date}: {entry.collected} eggs, {entry.broken} broken</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'mortality' && (
          <div className="tab-panel active">
            <div className="card">
              <h2>Mortality & Culling</h2>
              <p>Track lost birds and culling actions for farm health.</p>
              <strong>Mortality rate: {dashboardMetrics.mortalityRate}%</strong>
            </div>

            <div className="table-wrapper" style={{ marginTop: '18px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Batch</th>
                    <th>Cause</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {state.mortality.deadRecords.map((record, index) => (
                    <tr key={`${record.date}-dead-${index}`}>
                      <td>{record.date}</td>
                      <td>{record.batch}</td>
                      <td>{record.cause}</td>
                      <td>{record.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-wrapper" style={{ marginTop: '18px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Batch</th>
                    <th>Reason</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {state.mortality.cullingLogs.map((log, index) => (
                    <tr key={`${log.date}-cull-${index}`}>
                      <td>{log.date}</td>
                      <td>{log.batch}</td>
                      <td>{log.reason}</td>
                      <td>{log.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="tab-panel active">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Batch</th>
                    <th>Vaccination</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {state.health.vaccinations.map((item, index) => (
                    <tr key={`${item.date}-vac-${index}`}>
                      <td>{item.date}</td>
                      <td>{item.batch}</td>
                      <td>{item.vaccine}</td>
                      <td>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-wrapper" style={{ marginTop: '18px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Batch</th>
                    <th>Medication</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {state.health.medications.map((item, index) => (
                    <tr key={`${item.date}-med-${index}`}>
                      <td>{item.date}</td>
                      <td>{item.batch}</td>
                      <td>{item.medicine}</td>
                      <td>{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-wrapper" style={{ marginTop: '18px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Batch</th>
                    <th>Issue</th>
                    <th>Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {state.health.diseaseHistory.map((item, index) => (
                    <tr key={`${item.date}-dis-${index}`}>
                      <td>{item.date}</td>
                      <td>{item.batch}</td>
                      <td>{item.issue}</td>
                      <td>{item.resolution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card" style={{ marginTop: '18px' }}>
              <h2>Vet Notes</h2>
              <ul>
                {state.health.vetNotes.map((note, index) => (
                  <li key={`${note.date}-note-${index}`}>{note.date}: {note.note}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'housing' && (
          <div className="tab-panel active">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>House</th>
                    <th>Pen</th>
                    <th>Capacity</th>
                    <th>Current Population</th>
                    <th>Density</th>
                  </tr>
                </thead>
                <tbody>
                  {state.housing.map((item, index) => (
                    <tr key={`${item.house}-${index}`}>
                      <td>{item.house}</td>
                      <td>{item.pen}</td>
                      <td>{item.capacity}</td>
                      <td>{item.currentPopulation}</td>
                      <td>{((item.currentPopulation / item.capacity) * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="tab-panel active">
            <div className="card">
              <h2>Revenue Summary</h2>
              <p>Track egg and bird sales revenue.</p>
              <strong>${reportStats.totalRevenue.toFixed(2)}</strong>
            </div>
            <div className="table-wrapper" style={{ marginTop: '18px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {state.sales.eggSales.map((sale, index) => (
                    <tr key={`egg-${index}`}>
                      <td>{sale.date}</td>
                      <td>{sale.customer}</td>
                      <td>Eggs</td>
                      <td>{sale.quantity}</td>
                      <td>${sale.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                  {state.sales.birdSales.map((sale, index) => (
                    <tr key={`bird-${index}`}>
                      <td>{sale.date}</td>
                      <td>{sale.customer}</td>
                      <td>{sale.type}</td>
                      <td>{sale.quantity}</td>
                      <td>${sale.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="tab-panel active">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {state.inventory.map((item, index) => (
                    <tr key={`${item.name}-${index}`}>
                      <td>{item.category}</td>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unit}</td>
                      <td>{buildBadge(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="tab-panel active">
            <div className="card">
              <h2>Reports & Analytics</h2>
              <p>Production, mortality, and revenue insights.</p>
              <ul>
                <li>Total eggs collected: {reportStats.totalEggs}</li>
                <li>Broken eggs: {reportStats.totalBroken}</li>
                <li>Total revenue: ${reportStats.totalRevenue.toFixed(2)}</li>
                <li>Profit/Loss estimate: ${reportStats.profit.toFixed(2)}</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="tab-panel active">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Last Active</th>
                    <th>Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {state.users.map((user, index) => (
                    <tr key={`${user.name}-${index}`}>
                      <td>{user.name}</td>
                      <td>{user.role}</td>
                      <td>{user.lastActive}</td>
                      <td>{user.activity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="tab-panel active">
            <div className="card">
              <h2>Notifications</h2>
              <ul>
                {state.notifications.map((note, index) => (
                  <li key={`${note.message}-${index}`}><strong>{note.type}</strong>: {note.message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-panel active">
            <div className="card">
              <h2>Settings</h2>
              <p>Farm configuration and preferences.</p>
              <ul>
                <li><strong>Farm name:</strong> {state.settings.farmName}</li>
                <li><strong>Owner:</strong> {state.settings.owner}</li>
                <li><strong>Units:</strong> {state.settings.units}</li>
                <li><strong>Preferences:</strong> {state.settings.preferences}</li>
              </ul>
            </div>
          </div>
        )}
        </div>
      </section>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="close-btn" onClick={handleCloseModal}>×</button>
            <h2>Add New Bird Record</h2>
            <form onSubmit={handleSubmit}>
              <div className="field-grid">
                <label className="input-group">
                  <span>Name</span>
                  <input name="name" value={formData.name} onChange={handleChange} required placeholder="Ruby Layer" />
                </label>
                <label className="input-group">
                  <span>Breed</span>
                  <input name="breed" value={formData.breed} onChange={handleChange} required placeholder="Rhode Island Red" />
                </label>
                <label className="input-group">
                  <span>Type</span>
                  <select name="type" value={formData.type} onChange={handleChange} required>
                    <option value="">Select type</option>
                    <option value="Layer">Layer</option>
                    <option value="Broiler">Broiler</option>
                    <option value="Duck">Duck</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </label>
                <label className="input-group">
                  <span>Arrival Date</span>
                  <input name="arrivalDate" type="date" value={formData.arrivalDate} onChange={handleChange} required />
                </label>
                <label className="input-group">
                  <span>Pen / House</span>
                  <input name="pen" value={formData.pen} onChange={handleChange} required placeholder="House A" />
                </label>
                <label className="input-group">
                  <span>Age (weeks)</span>
                  <input name="age" type="number" min="1" value={formData.age} onChange={handleChange} required />
                </label>
                <label className="input-group">
                  <span>Quantity</span>
                  <input name="quantity" type="number" min="1" value={formData.quantity} onChange={handleChange} required />
                </label>
                <label className="input-group">
                  <span>Health Status</span>
                  <select name="status" value={formData.status} onChange={handleChange} required>
                    <option value="">Select status</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Growing">Growing</option>
                    <option value="Needs attention">Needs attention</option>
                  </select>
                </label>
                <label className="input-group">
                  <span>Location</span>
                  <input name="location" value={formData.location} onChange={handleChange} required placeholder="House A" />
                </label>
              </div>
              <label className="input-group">
                <span>Notes</span>
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional notes" />
              </label>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="primary-btn">Save Bird</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && <div className="toast visible">{toastMessage}</div>}
    </div>
  );
}

export default App;
