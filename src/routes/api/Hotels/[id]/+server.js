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

export async function GET({ params }) {
    const { id } = params;

    const [rows] = await pool.query(
        'SELECT * FROM hotels WHERE id = ?',
        [id]
    );

    if (rows.length === 0) {
        return Response.json({ message: 'Hotel not found' }, { status: 404 });
    }

    return Response.json(rows[0], { status: 200 });
}

export async function PUT({ params, request }) {
    if (!checkAuth(request)) {
        return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { name, stars, price_range, location } = await request.json();

    if (!name || !stars || !price_range || !location) {
        return Response.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const [result] = await pool.query(
        'UPDATE hotels SET name = ?, stars = ?, price_range = ?, location = ? WHERE id = ?',
        [name, stars, price_range, location, id]
    );

    if (result.affectedRows === 0) {
        return Response.json({ message: 'Hotel not found' }, { status: 404 });
    }

    return Response.json({ message: 'Hotel updated' }, { status: 200 });
}