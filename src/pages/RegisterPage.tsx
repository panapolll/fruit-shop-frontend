import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import axios from 'axios';

function RegisterPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัว');
            return;
        }

        setLoading(true);
        try {
            await register(email, password);
            navigate('/login', { state: { message: 'สมัครสำเร็จ! กรุณาเข้าสู่ระบบ' } });
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
            <h2>สมัครสมาชิก</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: 8, marginBottom: 10 }}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: 8, marginBottom: 10 }}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="ยืนยัน Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: 8, marginBottom: 10 }}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ width: '100%', padding: 8 }}>
                    {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
                </button>
            </form>
            <p style={{ marginTop: 16, textAlign: 'center' }}>
                มีบัญชีแล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
            </p>
        </div>
    );
}

export default RegisterPage;