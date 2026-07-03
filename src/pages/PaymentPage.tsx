import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { OMISE_PUBLIC_KEY } from '../api/config';
import { chargePayment } from '../api/payments';
import type { OmiseTokenResponse } from '../types/omise';

interface PaymentState {
    orderId: string;
    totalPrice: number;
}

function PaymentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as PaymentState | null;

    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [expMonth, setExpMonth] = useState('');
    const [expYear, setExpYear] = useState('');
    const [cvv, setCvv] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!state?.orderId) {
        return (
            <div style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>
                <p>ไม่พบออเดอร์</p>
                <button onClick={() => navigate('/cart')}>กลับไปตะกร้า</button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const Omise = window.Omise;
        if (!Omise) {
            setError('โหลด Omise ไม่สำเร็จ');
            setLoading(false);
            return;
        }

        Omise.setPublicKey(OMISE_PUBLIC_KEY);

        Omise.createToken(
            'card',
            {
                name,
                number: number.replace(/\s/g, ''),
                expiration_month: Number(expMonth),
                expiration_year: Number(expYear),
                security_code: cvv,
            },
            async (_statusCode: number, response: OmiseTokenResponse) => {
                if (response.object === 'error') {
                    setError(response.message ?? 'บัตรไม่ถูกต้อง');
                    setLoading(false);
                    return;
                }

                if (!response.id) {
                    setError('ไม่สามารถสร้าง token ได้');
                    setLoading(false);
                    return;
                }

                try {
                    const result = await chargePayment(state.orderId, response.id);
                    if (result.status === 'successful') {
                        alert('ชำระเงินสำเร็จ!');
                        navigate('/products');
                    } else {
                        setError('ชำระเงินไม่สำเร็จ');
                    }
                } catch (err) {
                    if (axios.isAxiosError(err)) {
                        setError(err.response?.data?.message ?? 'ชำระเงินไม่สำเร็จ');
                    } else {
                        setError('ชำระเงินไม่สำเร็จ');
                    }
                } finally {
                    setLoading(false);
                }
            },
        );
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0f0f0f', padding: '40px 20px' }}>
            <div style={{ maxWidth: 400, margin: '0 auto' }}>
                <h1 style={{ color: '#fff', fontSize: 24, marginBottom: 8 }}>💳 ชำระเงิน</h1>
                <p style={{ color: '#4ade80', fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>
                    ยอดชำระ: ฿{state.totalPrice.toLocaleString()}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
                    <input
                        placeholder="ชื่อบนบัตร"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <input
                        placeholder="เลขบัตร 4242 4242 4242 4242"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <div style={{ display: 'flex', gap: 12 }}>
                        <input
                            placeholder="เดือน (MM)"
                            value={expMonth}
                            onChange={(e) => setExpMonth(e.target.value)}
                            required
                            style={{ ...inputStyle, flex: 1 }}
                        />
                        <input
                            placeholder="ปี (YYYY)"
                            value={expYear}
                            onChange={(e) => setExpYear(e.target.value)}
                            required
                            style={{ ...inputStyle, flex: 1 }}
                        />
                        <input
                            placeholder="CVV"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            required
                            style={{ ...inputStyle, flex: 1 }}
                        />
                    </div>

                    {error && <p style={{ color: '#ff4d4d', margin: 0 }}>{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: '#4ade80',
                            border: 'none',
                            color: '#000',
                            padding: '12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: 16,
                        }}
                    >
                        {loading ? 'กำลังชำระ...' : `จ่าย ฿${state.totalPrice.toLocaleString()}`}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/cart')}
                        style={{
                            background: 'transparent',
                            border: '1px solid #555',
                            color: '#aaa',
                            padding: '10px',
                            borderRadius: 8,
                            cursor: 'pointer',
                        }}
                    >
                        ยกเลิก
                    </button>
                </form>

                <p style={{ color: '#666', fontSize: 12, marginTop: 16 }}>
                    Test mode: ใช้บัตร 4242 4242 4242 4242
                </p>
            </div>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    background: '#1a1a1a',
    border: '1px solid #333',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 14,
};

export default PaymentPage;