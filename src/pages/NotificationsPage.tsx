/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    deleteNotification,
    getMyNotifications,
    markAllAsRead,
    markAsRead,
    type Notification,
} from '../api/notifications';

const typeLabel: Record<string, string> = {
    payment_success: 'ชำระเงินสำเร็จ',
    payment_failed: 'ชำระเงินไม่สำเร็จ',
    order_placed: 'สั่งซื้อแล้ว',
    order_shipped: 'จัดส่งแล้ว',
    order_delivered: 'ส่งถึงแล้ว',
    order_cancelled: 'ยกเลิกออเดอร์',
    promotion: 'โปรโมชัน',
    system: 'ระบบ',
};

function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchNotifications = async () => {
        try {
            const result = await getMyNotifications();
            setNotifications(result.data);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? 'โหลดแจ้งเตือนไม่สำเร็จ');
            } else {
                setError('โหลดแจ้งเตือนไม่สำเร็จ');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchNotifications();
    }, []);

    const handleMarkRead = async (id: string) => {
        await markAsRead(id);
        await fetchNotifications();
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        await fetchNotifications();
    };

    const handleDelete = async (id: string) => {
        await deleteNotification(id);
        await fetchNotifications();
    };

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h1 style={{ color: '#fff', margin: 0 }}>🔔 แจ้งเตือน</h1>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={() => void handleMarkAllRead()}
                            style={{
                                background: 'transparent',
                                border: '1px solid #fbbf24',
                                color: '#fbbf24',
                                padding: '8px 16px',
                                borderRadius: 8,
                                cursor: 'pointer',
                            }}
                        >
                            อ่านทั้งหมด
                        </button>
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
                            ← กลับ
                        </button>
                    </div>
                </div>

                {error && <p style={{ color: '#ff4d4d' }}>{error}</p>}

                {!notifications.length ? (
                    <p style={{ color: '#888', textAlign: 'center' }}>ยังไม่มีแจ้งเตือน</p>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {notifications.map((item) => (
                            <div
                                key={item._id}
                                style={{
                                    background: item.isRead ? '#1a1a1a' : '#1f2937',
                                    border: `1px solid ${item.isRead ? '#2a2a2a' : '#fbbf24'}`,
                                    borderRadius: 12,
                                    padding: 16,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <strong style={{ color: '#fff' }}>{item.title}</strong>
                                    <span style={{ color: '#888', fontSize: 12 }}>
                                        {typeLabel[item.type] ?? item.type}
                                    </span>
                                </div>
                                <p style={{ color: '#ccc', margin: '0 0 12px' }}>{item.message}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#666', fontSize: 12 }}>
                                        {new Date(item.createdAt).toLocaleString('th-TH')}
                                    </span>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {!item.isRead && (
                                            <button
                                                onClick={() => void handleMarkRead(item._id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid #4ade80',
                                                    color: '#4ade80',
                                                    padding: '4px 10px',
                                                    borderRadius: 6,
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                }}
                                            >
                                                อ่านแล้ว
                                            </button>
                                        )}
                                        <button
                                            onClick={() => void handleDelete(item._id)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #ff4d4d',
                                                color: '#ff4d4d',
                                                padding: '4px 10px',
                                                borderRadius: 6,
                                                cursor: 'pointer',
                                                fontSize: 12,
                                            }}
                                        >
                                            ลบ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotificationsPage;