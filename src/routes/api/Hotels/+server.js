import pool from '$lib/server/database.js';
import { API_USER, API_PASS } from '$env/static/private';

function checkAuth(request) {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Basic ')) return false;

    const base64 = auth.slice(6);
    const decoded = atob(base64);
    const [user, pass] = decoded.split(':');

    return user === API_USER && pass === API_PASS;
}

export async function GET() {
    const [rows] = await pool.query('SELECT * FROM events');
    return Response.json(rows, { status: 200 });
}

export async function POST({ request }) {
    if (!checkAuth(request)) {
        return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }


    const { name, stars, price_range, location } = await request.json();

    if (!name || !stars || !price_range || !location) {
        return Response.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const [result] = await pool.query(
        'INSERT INTO events (name, stars, price_range, location) VALUES (?, ?, ?, ?)',
        [name, stars, price_range, location]
    );

    return Response.json(
        { message: 'Hotel created', id: result.insertId },
        { status: 201 }
    );
}