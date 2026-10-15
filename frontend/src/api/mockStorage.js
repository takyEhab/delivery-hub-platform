/**
 * Standalone In-Browser Mock Storage Engine for DeliveryHub Pro Console
 * Provides 100% realistic in-browser data persistence via localStorage.
 * Guaranteed 0% network requests to live backend/database.
 */

const STORAGE_KEY = 'deliveryhub_demo_v1';

const INITIAL_USERS = [
  {
    id: 1,
    name: 'Sarah Jenkins (Ops Director)',
    phone: '01000000000',
    email: 'director@deliveryhub.io',
    role: 'owner',
    is_active: true,
  },
  {
    id: 2,
    name: 'Alex Johnson (Fast Courier)',
    phone: '01100000000',
    email: 'alex.courier@deliveryhub.io',
    role: 'driver',
    is_active: true,
  },
  {
    id: 3,
    name: 'Marcus Rivera',
    phone: '01200000000',
    email: 'marcus.courier@deliveryhub.io',
    role: 'driver',
    is_active: true,
  },
];

const INITIAL_CUSTOMERS = [
  {
    id: 1,
    name: 'David Miller',
    phone: '01011122233',
    address: '42 Lexington Avenue, Floor 4, Suite B',
    location_url: 'https://www.google.com/maps?q=40.758896,-73.985130',
    notes: 'Leave with front desk concierge',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 2,
    name: 'Elena Rostova',
    phone: '01122233344',
    address: '18 West End Plaza, Penthouse 3',
    location_url: 'https://www.google.com/maps?q=40.782864,-73.965355',
    notes: 'Call before arriving at the gate',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 3,
    name: 'Dr. Michael Chang',
    phone: '01233344455',
    address: '85 Broad Street, Tech Tower 12',
    location_url: 'https://www.google.com/maps?q=40.704285,-74.011887',
    notes: 'Corporate office delivery, buzzer #1204',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 4,
    name: 'Sophia Loren',
    phone: '01544455566',
    address: '250 Mercer Street, Apt 8A',
    location_url: 'https://www.google.com/maps?q=40.728157,-73.995743',
    notes: 'Leave at apartment door',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const INITIAL_ORDERS = [
  {
    id: 201,
    customer_id: 1,
    assigned_driver_id: 2,
    items: [
      { name: 'Artisan Truffle Smash Burger + Crispy Fries', quantity: 2, price: 18.5 },
      { name: 'Craft Sparkling Iced Tea', quantity: 2, price: 4.5 },
    ],
    total_amount: 46.0,
    payment_status: 'paid',
    paid_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    payment_notes: 'Paid via Apple Pay',
    status: 'out_for_delivery',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    customer: INITIAL_CUSTOMERS[0],
    driver: INITIAL_USERS[1],
  },
  {
    id: 202,
    customer_id: 2,
    assigned_driver_id: null,
    items: [
      { name: 'Wood-Fired Neapolitan Pizza (Margherita)', quantity: 1, price: 22.0 },
      { name: 'Wild Mushroom Risotto', quantity: 1, price: 24.5 },
      { name: 'Classic Tiramisu Dolce', quantity: 2, price: 8.0 },
    ],
    total_amount: 62.5,
    payment_status: 'unpaid',
    paid_at: null,
    payment_notes: 'Cash on delivery ($62.50 to collect)',
    status: 'preparing',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    customer: INITIAL_CUSTOMERS[1],
    driver: null,
  },
  {
    id: 203,
    customer_id: 3,
    assigned_driver_id: 2,
    items: [
      { name: 'Fresh Atlantic Salmon Poke Bowl', quantity: 2, price: 17.0 },
      { name: 'Ceremonial Matcha Iced Latte', quantity: 2, price: 5.5 },
    ],
    total_amount: 45.0,
    payment_status: 'paid',
    paid_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    payment_notes: 'Corporate Account Credit',
    status: 'preparing',
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    customer: INITIAL_CUSTOMERS[2],
    driver: INITIAL_USERS[1],
  },
  {
    id: 204,
    customer_id: 4,
    assigned_driver_id: 3,
    items: [
      { name: 'Gluten-Free Penne All’Arrabbiata', quantity: 1, price: 19.0 },
      { name: 'Caesar Salad with Grilled Chicken', quantity: 1, price: 15.0 },
    ],
    total_amount: 34.0,
    payment_status: 'paid',
    paid_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    payment_notes: 'Completed & Delivered',
    status: 'delivered',
    created_at: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    customer: INITIAL_CUSTOMERS[3],
    driver: INITIAL_USERS[2],
  },
];

function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse mock storage:', e);
  }

  const initial = {
    users: INITIAL_USERS,
    customers: INITIAL_CUSTOMERS,
    orders: INITIAL_ORDERS,
    nextOrderId: 205,
    nextCustomerId: 5,
    nextDriverId: 4,
  };
  saveStore(initial);
  return initial;
}

function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save to mock storage:', e);
  }
}

export function resetDemoData() {
  const initial = {
    users: INITIAL_USERS,
    customers: INITIAL_CUSTOMERS,
    orders: INITIAL_ORDERS,
    nextOrderId: 205,
    nextCustomerId: 5,
    nextDriverId: 4,
  };
  saveStore(initial);
  return initial;
}

// ---------------- AUTH API ----------------
export async function mockLogin({ phone, password }) {
  const store = getStore();
  const cleanPhone = String(phone).replace(/\s+/g, '').trim();

  let user = store.users.find((u) => u.phone === cleanPhone && u.is_active);

  // Fallback demo matching for instant convenience:
  if (!user) {
    if (cleanPhone === '01000000000' || cleanPhone.endsWith('000')) {
      user = store.users.find((u) => u.role === 'owner') || store.users[0];
    } else if (cleanPhone === '01100000000' || cleanPhone.endsWith('100')) {
      user = store.users.find((u) => u.role === 'driver') || store.users[1];
    }
  }

  if (!user) {
    throw new Error('Invalid phone number or password. Use demo buttons below.');
  }

  const token = `deliveryhub_token_${user.role}_${user.id}_${Date.now()}`;
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    },
  };
}

// ---------------- ORDERS API ----------------
export async function mockListOrders(currentUserId = null, isDriver = false) {
  const store = getStore();
  let orders = store.orders.slice();

  if (isDriver && currentUserId) {
    orders = orders.filter((o) => Number(o.assigned_driver_id) === Number(currentUserId));
  }

  return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function mockGetOrder(id) {
  const store = getStore();
  const order = store.orders.find((o) => Number(o.id) === Number(id));
  if (!order) throw new Error('Order not found');
  return order;
}

export async function mockCreateOrder(orderData) {
  const store = getStore();
  let customer = null;

  if (orderData.customer_id) {
    customer = store.customers.find((c) => Number(c.id) === Number(orderData.customer_id));
  } else if (orderData.customer) {
    const existing = store.customers.find((c) => c.phone === orderData.customer.phone);
    if (existing) {
      customer = existing;
      if (orderData.customer.address && !existing.address) {
        existing.address = orderData.customer.address;
      }
      if (orderData.customer.location_url && !existing.location_url) {
        existing.location_url = orderData.customer.location_url;
      }
    } else {
      customer = {
        id: store.nextCustomerId++,
        name: orderData.customer.name,
        phone: orderData.customer.phone,
        address: orderData.customer.address || '',
        location_url: orderData.customer.location_url || '',
        notes: orderData.customer.notes || '',
        created_at: new Date().toISOString(),
      };
      store.customers.push(customer);
    }
  }

  let driver = null;
  if (orderData.driver_id) {
    driver = store.users.find((u) => Number(u.id) === Number(orderData.driver_id)) || null;
  }

  let calculatedTotal = parseFloat(orderData.total_amount) || 0;
  if (calculatedTotal === 0 && Array.isArray(orderData.items)) {
    orderData.items.forEach((it) => {
      calculatedTotal += (parseInt(it.quantity, 10) || 1) * (parseFloat(it.price) || 0);
    });
  }

  const newOrder = {
    id: store.nextOrderId++,
    customer_id: customer?.id || 1,
    assigned_driver_id: driver?.id || null,
    items: orderData.items || [{ name: 'Chef Special Delivery Item', quantity: 1, price: calculatedTotal }],
    total_amount: calculatedTotal,
    payment_status: orderData.payment_status || 'unpaid',
    paid_at: orderData.payment_status === 'paid' ? new Date().toISOString() : null,
    payment_notes: orderData.payment_notes || null,
    status: 'preparing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: customer || { id: 1, name: 'Walk-in Guest', phone: '01000000000' },
    driver,
  };

  store.orders.unshift(newOrder);
  saveStore(store);
  return newOrder;
}

export async function mockUpdateOrder(orderId, orderData) {
  const store = getStore();
  const index = store.orders.findIndex((o) => Number(o.id) === Number(orderId));
  if (index === -1) throw new Error('Order not found');

  const current = store.orders[index];
  let driver = current.driver;
  if (orderData.driver_id !== undefined) {
    driver = orderData.driver_id
      ? store.users.find((u) => Number(u.id) === Number(orderData.driver_id)) || null
      : null;
  }

  const updated = {
    ...current,
    ...orderData,
    assigned_driver_id: driver ? driver.id : null,
    driver,
    updated_at: new Date().toISOString(),
  };

  if (orderData.payment_status === 'paid' && !current.paid_at) {
    updated.paid_at = new Date().toISOString();
  } else if (orderData.payment_status && orderData.payment_status !== 'paid') {
    updated.paid_at = null;
  }

  store.orders[index] = updated;
  saveStore(store);
  return updated;
}

export async function mockAssignOrder(orderId, driverId) {
  const store = getStore();
  const index = store.orders.findIndex((o) => Number(o.id) === Number(orderId));
  if (index === -1) throw new Error('Order not found');

  const driver = store.users.find((u) => Number(u.id) === Number(driverId));
  if (!driver) throw new Error('Courier not found');

  store.orders[index].assigned_driver_id = driver.id;
  store.orders[index].driver = driver;
  store.orders[index].updated_at = new Date().toISOString();

  saveStore(store);
  return store.orders[index];
}

export async function mockUpdateOrderStatus(orderId, status) {
  const store = getStore();
  const index = store.orders.findIndex((o) => Number(o.id) === Number(orderId));
  if (index === -1) throw new Error('Order not found');

  const order = store.orders[index];
  order.status = status;
  order.updated_at = new Date().toISOString();

  saveStore(store);
  return order;
}

export async function mockDeleteOrder(orderId) {
  const store = getStore();
  const initialLen = store.orders.length;
  store.orders = store.orders.filter((o) => Number(o.id) !== Number(orderId));
  if (store.orders.length === initialLen) throw new Error('Order not found');
  saveStore(store);
  return { message: 'Order deleted successfully' };
}

// ---------------- CUSTOMERS API ----------------
export async function mockListCustomers() {
  const store = getStore();
  return store.customers.slice().sort((a, b) => a.name.localeCompare(b.name));
}

export async function mockSearchCustomers(query) {
  const store = getStore();
  const q = (query || '').toLowerCase().trim();
  if (!q) return store.customers.slice(0, 10);

  return store.customers.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.address && c.address.toLowerCase().includes(q))
  );
}

export async function mockCreateCustomer(data) {
  const store = getStore();
  const newCustomer = {
    id: store.nextCustomerId++,
    name: data.name,
    phone: data.phone,
    address: data.address || '',
    location_url: data.location_url || '',
    notes: data.notes || '',
    created_at: new Date().toISOString(),
  };

  store.customers.push(newCustomer);
  saveStore(store);
  return newCustomer;
}

export async function mockUpdateCustomer(id, data) {
  const store = getStore();
  const index = store.customers.findIndex((c) => Number(c.id) === Number(id));
  if (index === -1) throw new Error('Customer not found');

  store.customers[index] = {
    ...store.customers[index],
    ...data,
  };
  saveStore(store);
  return store.customers[index];
}

export async function mockDeleteCustomer(id) {
  const store = getStore();
  store.customers = store.customers.filter((c) => Number(c.id) !== Number(id));
  saveStore(store);
}

// ---------------- DRIVERS API ----------------
export async function mockListDrivers() {
  const store = getStore();
  return store.users.filter((u) => u.role === 'driver');
}

export async function mockCreateDriver(data) {
  const store = getStore();
  const newDriver = {
    id: store.nextDriverId++,
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    role: 'driver',
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString(),
  };

  store.users.push(newDriver);
  saveStore(store);
  return newDriver;
}

export async function mockUpdateDriver(id, data) {
  const store = getStore();
  const index = store.users.findIndex((u) => Number(u.id) === Number(id) && u.role === 'driver');
  if (index === -1) throw new Error('Driver not found');

  store.users[index] = {
    ...store.users[index],
    ...data,
  };
  saveStore(store);
  return store.users[index];
}

export async function mockDeleteDriver(id) {
  const store = getStore();
  store.users = store.users.filter((u) => !(Number(u.id) === Number(id) && u.role === 'driver'));
  saveStore(store);
}
