'use client';
import { useState } from 'react';

export default function RegisterPage() {
    const [ip, setIp] = useState('');
    const [port, setPort] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip, port }),
        });

        const data = await res.json();
        setMessage(data.message || 'Something went wrong');
    };

    return (
        <div>
            <h1>Register Datastore</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>IP:</label>
                    <input type="text" value={ip} onChange={(e) => setIp(e.target.value)} required />
                </div>
                <div>
                    <label>Port:</label>
                    <input type="text" value={port} onChange={(e) => setPort(e.target.value)} required />
                </div>
                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}
