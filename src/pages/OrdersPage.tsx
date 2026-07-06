import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getMyOrders } from '../api/orders';

interface OrderItem {
    productId: {
        _id: string;
        name: string;
        price: number;
    };
    quantity: number;
    price: number;
}

interface Order {
    _id: string;
    items: OrderItem[];
    totalPrice: number;
    status: string;
    createdAt: string;
}

const statusLabel: Record<string, { text: string; color: string }> = {
    pending: { text: 'รอชำระ', color: '#fbbf24' },
    paid: { text: 'ชำระแล้ว', color: '#4ade80' },
    shipped: { text: 'จัดส่งแล้ว', color: '#60a5fa' },
    delivered: { text: 'ส่งถึงแล้ว', color: '#a78bfa' },
};

function OrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getMyOrders();
                setOrders(data);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message ?? 'โหลดออเดอร์ไม่สำเร็จ');
                } else {
                    setError('โหลดออเดอร์ไม่สำเร็จ');
                }
            } finally {
                setLoading(false);
            }
        };

        void fetchOrders();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>
                กำลังโหลด...
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0f0f0f', padding: '40px 20px' }}>
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <h1 style={{ color: '#fff', margin: 0 }}>📦 ประวัติออเดอร์</h1>
                    <button
                        onClick={() => navigate('/products')}
                        style={{
                            background: 'transparent',
                            border: '1px solid #555',
                            color: '#aaa',
                            padding: '8px 16px',
                            borderRadius: 8,
                            cursor: 'pointer',
                        }}
                    >
                        ← กลับไปเลือกสินค้า
                    </button>
                </div>

                {error && <p style={{ color: '#ff4d4d' }}>{error}</p>}

                {!orders.length ? (
                    <p style={{ color: '#888', textAlign: 'center' }}>ยังไม่มีออเดอร์</p>
                ) : (
                    <div style={{ display: 'grid', gap: 16 }}>
                        {orders.map((order) => {
                            const status = statusLabel[order.status] ?? { text: order.status, color: '#888' };
                            return (
                                <div
                                    key={order._id}
                                    style={{
                                        background: '#1a1a1a',
                                        border: '1px solid #2a2a2a',
                                        borderRadius: 12,
                                        padding: 20,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <span style={{ color: '#888', fontSize: 13 }}>
                                            {new Date(order.createdAt).toLocaleString('th-TH')}
                                        </span>
                                        <span style={{
                                            background: `${status.color}22`,
                                            color: status.color,
                                            padding: '4px 12px',
                                            borderRadius: 20,
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                        }}>
                                            {status.text}
                                        </span>
                                    </div>

                                    <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
                                        {order.items.map((item, index) => (
                                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: 14 }}>
                                                <span>{item.productId?.name ?? 'สินค้า'} × {item.quantity}</span>
                                                <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#fff', fontWeight: 'bold' }}>ยอดรวม</span>
                                        <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: 18 }}>
                                            ฿{order.totalPrice.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrdersPage;