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