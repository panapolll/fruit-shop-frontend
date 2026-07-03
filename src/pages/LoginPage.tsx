import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUserIdFromToken, login } from '../api/auth';
import axios from 'axios';

interface LoginPageProps {
    onLogin: (accessToken: string, refresh: string, userId: string) => void;
}

function LoginPage({ onLogin }: LoginPageProps) {
    const location = useLocation();
    const successMessage = (location.state as { message?: string })?.message;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await login(email, password);
            const userId = getUserIdFromToken(data.access_token);
            onLogin(data.access_token, data.refresh_token, userId);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? 'เกิดข้อผิดพลาด');
            } else {
                setError('เกิดข้อผิดพลาด');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
            <h2>Login</h2>
            {successMessage && (
                <p style={{ color: 'green' }}>{successMessage}</p>
            )}
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: 8, marginBottom: 10 }}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: 8, marginBottom: 10 }}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ width: '100%', padding: 8 }}>
                    {loading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
                </button>
            </form>
            <p style={{ marginTop: 16, textAlign: 'center' }}>
                ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
            </p>
        </div>
    );
}

export default LoginPage;