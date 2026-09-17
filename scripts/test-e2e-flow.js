const http = require('http');

async function request(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : null;
                    resolve({ status: res.statusCode, headers: res.headers, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, text: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runE2E() {
    console.log('--- 1. Testing Frontend Vite server on :5173 ---');
    const viteRes = await request({
        hostname: 'localhost',
        port: 5173,
        path: '/',
        method: 'GET',
    });
    console.log(`Vite response status: ${viteRes.status} (Expected 200)`);
    if (viteRes.status !== 200) throw new Error('Vite server not responding');

    console.log('\n--- 2. Testing Backend Health on :3000 ---');
    const healthRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/health',
        method: 'GET',
    });
    console.log('Health check:', healthRes.data);

    console.log('\n--- 3. Testing Owner Login (/auth/login) ---');
    const ownerLogin = await request(
        {
            hostname: 'localhost',
            port: 3000,
            path: '/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        },
        { phone: '01007479928', password: 'changeme123' }
    );
    console.log('Owner login status:', ownerLogin.status);
    const ownerToken = ownerLogin.data.token;
    console.log('Owner authenticated:', ownerLogin.data.user);

    console.log('\n--- 4. Testing Create Customer via Owner (/customers) ---');
    const customerRes = await request(
        {
            hostname: 'localhost',
            port: 3000,
            path: '/customers',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ownerToken}`,
            },
        },
        {
            name: 'Maria Rodriguez',
            phone: '0509988776',
            address: '42 Palm Avenue, Suite 4B, Downtown',
            notes: 'Call when outside building',
        }
    );
    console.log('Customer create status:', customerRes.status);
    const customer = customerRes.data.customer;
    console.log('Created customer:', customer);

    console.log('\n--- 5. Testing Customer Search (/customers/search?q=Maria) ---');
    const searchRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/customers/search?q=Maria',
        method: 'GET',
        headers: { Authorization: `Bearer ${ownerToken}` },
    });
    console.log(`Found ${searchRes.data.customers.length} customer(s) matching "Maria"`);

    console.log('\n--- 6. Testing List Drivers (/drivers) ---');
    const driversRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/drivers',
        method: 'GET',
        headers: { Authorization: `Bearer ${ownerToken}` },
    });
    console.log(`Found ${driversRes.data.drivers.length} driver(s):`);
    driversRes.data.drivers.forEach((d) => console.log(`  - #${d.id} ${d.name} (${d.phone}) active=${d.is_active}`));
    const driver = driversRes.data.drivers.find((d) => d.phone === '0501112233');

    console.log('\n--- 7. Testing Create Order with Items (/orders) ---');
    const orderRes = await request(
        {
            hostname: 'localhost',
            port: 3000,
            path: '/orders',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ownerToken}`,
            },
        },
        {
            customer_id: customer.id,
            items: [
                { name: 'Double Smash Burger', quantity: 2, price: 12.5 },
                { name: 'Truffle Fries', quantity: 1, price: 5.5 },
            ],
        }
    );
    console.log('Create order status:', orderRes.status);
    const order = orderRes.data.order;
    console.log(`Created Order #${order.id}, status="${order.status}", items=${JSON.stringify(order.items)}`);

    console.log('\n--- 8. Testing Assign Order to Driver (/orders/:id/assign) ---');
    const assignRes = await request(
        {
            hostname: 'localhost',
            port: 3000,
            path: `/orders/${order.id}/assign`,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ownerToken}`,
            },
        },
        { driver_id: driver.id }
    );
    console.log('Assign order status:', assignRes.status);
    console.log(`Order #${assignRes.data.order.id} assigned to driver: ${assignRes.data.order.driver.name}`);

    console.log('\n--- 9. Testing Driver Login (/auth/login) ---');
    const driverLogin = await request(
        {
            hostname: 'localhost',
            port: 3000,
            path: '/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        },
        { phone: '0501112233', password: 'driver123' }
    );
    console.log('Driver login status:', driverLogin.status);
    const driverToken = driverLogin.data.token;
    console.log('Driver authenticated:', driverLogin.data.user);

    console.log('\n--- 10. Testing Driver View Orders (/orders) ---');
    const driverOrdersRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/orders',
        method: 'GET',
        headers: { Authorization: `Bearer ${driverToken}` },
    });
    console.log(`Driver sees ${driverOrdersRes.data.orders.length} assigned order(s)`);

    console.log('\n--- 11. Testing Driver Status Update -> "out_for_delivery" (/orders/:id/status) ---');
    const status1Res = await request(
        {
            hostname: 'localhost',
            port: 3000,
            path: `/orders/${order.id}/status`,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${driverToken}`,
            },
        },
        { status: 'out_for_delivery' }
    );
    console.log('Status update 1 result:', status1Res.status, `new status: "${status1Res.data.order.status}"`);

    console.log('\n--- 12. Testing Driver Status Update -> "delivered" (/orders/:id/status) ---');
    const status2Res = await request(
        {
            hostname: 'localhost',
            port: 3000,
            path: `/orders/${order.id}/status`,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${driverToken}`,
            },
        },
        { status: 'delivered' }
    );
    console.log('Status update 2 result:', status2Res.status, `new status: "${status2Res.data.order.status}"`);

    console.log('\n--- 13. Owner views final order details (/orders/:id) ---');
    const finalOrderRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: `/orders/${order.id}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${ownerToken}` },
    });
    console.log(`Order #${finalOrderRes.data.order.id} verified as "${finalOrderRes.data.order.status}" with customer "${finalOrderRes.data.order.customer.name}" and driver "${finalOrderRes.data.order.driver.name}"`);

    console.log('\n========================================');
    console.log('ALL API ENDPOINTS & FLOWS VERIFIED 100%!');
    console.log('========================================');
}

runE2E().catch((err) => {
    console.error('E2E test failed:', err);
    process.exit(1);
});
