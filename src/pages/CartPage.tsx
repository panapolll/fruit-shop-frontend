/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCart, removeFromCart, type Cart } from '../api/cart';
import { checkout } from '../api/orders'; // ← ใหม่

function CartPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCart = async () => {
        try {
            const data = await getCart();
            setCart(data);
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

    useEffect(() => {
        void fetchCart();
    }, []);

    const handleRemove = async (productId: string) => {
        try {
            await removeFromCart(productId);
            await fetchCart();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? 'ลบไม่สำเร็จ');
            }
        }
    };

    // ← ใหม่: ฟังก์ชัน checkout ใส่ตรงนี้ (หลัง handleRemove)
    const handleCheckout = async () => {
        try {
            const order = await checkout();
            navigate('/payment', {
                state: {
                    orderId: order._id,
                    totalPrice: order.totalPrice,
                },
            });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? 'ชำระเงินไม่สำเร็จ');
            } else {
                setError('ชำระเงินไม่สำเร็จ');
            }
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>
            กำลังโหลด...
        </div>
    );

    const items = cart?.items ?? [];
    const total = items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

    return (
        <div style={{ minHeight: '100vh', background: '#0f0f0f', padding: '40px 20px' }}>
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                    <h1 style={{ color: '#fff', margin: 0, fontSize: 28 }}>🛒 ตะกร้าของฉัน</h1>
                    <button
                        onClick={() => navigate('/products')}
                        style={{
                            background: 'transparent',
                            border: '1px solid #555',
                            color: '#aaa',
                            padding: '8px 20px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 14,
                        }}
                    >
                        ← กลับไปช้อปต่อ
                    </button>
                </div>

                {error && <p style={{ color: '#ff4d4d' }}>{error}</p>}

                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#888', padding: 60 }}>
                        ตะกร้าว่างเปล่า
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
                            {items.map((item) => (
                                <div
                                    key={item._id}
                                    style={{
                                        background: '#1a1a1a',
                                        border: '1px solid #2a2a2a',
                                        borderRadius: 12,
                                        padding: 16,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div>
                                        <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: 16 }}>
                                            {item.productId.name}
                                        </h3>
                                        <p style={{ color: '#888', margin: 0, fontSize: 14 }}>
                                            ฿{item.productId.price} x {item.quantity} ชิ้น
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: 16 }}>
                                            ฿{(item.productId.price * item.quantity).toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => handleRemove(item.productId._id)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #ff4d4d',
                                                color: '#ff4d4d',
                                                padding: '6px 14px',
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                                fontSize: 13,
                                            }}
                                        >
                                            ลบ
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            background: '#1a1a1a',
                            border: '1px solid #2a2a2a',
                            borderRadius: 12,
                            padding: 20,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>รวมทั้งหมด</span>
                            <span style={{ color: '#4ade80', fontSize: 24, fontWeight: 'bold' }}>
                                ฿{total.toLocaleString()}
                            </span>
                        </div>

                        {/* ← ใหม่: ปุ่มชำระเงิน ใส่ตรงนี้ ใต้ "รวมทั้งหมด" */}
                        <button
                            onClick={handleCheckout}
                            style={{
                                width: '100%',
                                marginTop: 16,
                                background: '#4ade80',
                                border: 'none',
                                color: '#000',
                                padding: '12px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 16,
                                fontWeight: 'bold',
                            }}
                        >
                            💳 ชำระเงิน ฿{total.toLocaleString()}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default CartPage;