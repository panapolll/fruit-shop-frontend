/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { gatewayClient } from '../api/client';
import { addToCart } from '../api/cart';
import { createProduct, deleteProduct } from '../api/products';
import { getUnreadCount } from '../api/notifications';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
}

interface ProductsPageProps {
    token: string;
    onLogout: () => void;
}

const getUserRole = (token: string): string => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role ?? 'user';
    } catch {
        return 'user';
    }
};

function ProductsPage({ token, onLogout }: ProductsPageProps) {
    const navigate = useNavigate();
    const role = getUserRole(token);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [formError, setFormError] = useState('');
    const [cartMessage, setCartMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchProducts = async () => {
        try {
            const response = await gatewayClient.get<Product[]>('/products');
            setProducts(response.data);
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
        void fetchProducts();
    }, []);

    useEffect(() => {
        if (!token) return;
        void getUnreadCount()
            .then(setUnreadCount)
            .catch(() => setUnreadCount(0));
    }, [token]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        try {
            await createProduct({
                name,
                description,
                price: Number(price),
                stock: Number(stock),
                category: 'fruit',
            });
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
            setShowForm(false);
            await fetchProducts();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setFormError(err.response?.data?.message ?? 'เกิดข้อผิดพลาด');
            } else {
                setFormError('เกิดข้อผิดพลาด');
            }
        }
    };

    const handleAddToCart = async (productId: string) => {
        try {
            await addToCart(productId, 1);
            await fetchProducts();
            setCartMessage('✅ หยิบใส่ตะกร้าแล้ว');
            setTimeout(() => setCartMessage(''), 2000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setCartMessage(`❌ ${err.response?.data?.message ?? 'เกิดข้อผิดพลาด'}`);
            } else {
                setCartMessage('❌ เกิดข้อผิดพลาด');
            }
            setTimeout(() => setCartMessage(''), 2000);
        }
    };

    const handleDelete = async (productId: string, productName: string) => {
        const confirmed = window.confirm(`ลบ "${productName}" ออกจากร้าน?`);
        if (!confirmed) return;

        try {
            await deleteProduct(productId);
            setCartMessage(`✅ ลบ ${productName} แล้ว`);
            setTimeout(() => setCartMessage(''), 2000);
            await fetchProducts();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setCartMessage(`❌ ${err.response?.data?.message ?? 'ลบไม่สำเร็จ'}`);
            } else {
                setCartMessage('❌ ลบไม่สำเร็จ');
            }
            setTimeout(() => setCartMessage(''), 2000);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>
            กำลังโหลด...
        </div>
    );

    if (error) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#ff4d4d' }}>
            {error}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0f0f0f', padding: '40px 20px' }}>
            {cartMessage && (
                <div style={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    color: '#fff',
                    padding: '12px 20px',
                    borderRadius: 8,
                    zIndex: 1000,
                }}>
                    {cartMessage}
                </div>
            )}

            <div style={{
                maxWidth: 900,
                margin: '0 auto 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div>
                    <h1 style={{ color: '#fff', margin: 0, fontSize: 28 }}>🛒 ร้านค้าออนไลน์</h1>
                    <p style={{ color: '#888', margin: '4px 0 0' }}>สินค้าทั้งหมด {products.length} รายการ</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {role === 'admin' && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            style={{
                                background: '#4ade80',
                                border: 'none',
                                color: '#000',
                                padding: '8px 20px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 'bold',
                            }}
                        >
                            {showForm ? 'ยกเลิก' : '+ เพิ่มสินค้า'}
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/notifications')}
                        style={{
                            background: 'transparent',
                            border: '1px solid #f59e0b',
                            color: '#f59e0b',
                            padding: '8px 20px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 14,
                            position: 'relative',
                        }}
                    >
                        🔔 แจ้งเตือน
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                background: '#ef4444',
                                color: '#fff',
                                fontSize: 11,
                                fontWeight: 'bold',
                                minWidth: 18,
                                height: 18,
                                borderRadius: 9,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 4px',
                            }}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => navigate('/orders')}
                        style={{
                            background: 'transparent',
                            border: '1px solid #a78bfa',
                            color: '#a78bfa',
                            padding: '8px 20px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 14,
                        }}
                    >
                        📦 ออเดอร์
                    </button>
                    <button
                        onClick={() => navigate('/cart')}
                        style={{
                            background: 'transparent',
                            border: '1px solid #3b82f6',
                            color: '#3b82f6',
                            padding: '8px 20px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 14,
                        }}
                    >
                        🛒 ตะกร้า
                    </button>
                    <button
                        onClick={onLogout}
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
                        ออกจากระบบ
                    </button>
                </div>
            </div>

            {showForm && role === 'admin' && (
                <div style={{ maxWidth: 900, margin: '0 auto 30px' }}>
                    <form
                        onSubmit={handleCreate}
                        style={{
                            background: '#1a1a1a',
                            border: '1px solid #2a2a2a',
                            borderRadius: 12,
                            padding: 24,
                            display: 'grid',
                            gap: 12,
                        }}
                    >
                        <input placeholder="ชื่อสินค้า" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
                        <input placeholder="คำอธิบาย" value={description} onChange={(e) => setDescription(e.target.value)} required style={inputStyle} />
                        <div style={{ display: 'flex', gap: 12 }}>
                            <input placeholder="ราคา" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
                            <input placeholder="จำนวน" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
                        </div>
                        {formError && <p style={{ color: '#ff4d4d', margin: 0 }}>{formError}</p>}
                        <button type="submit" style={{ background: '#4ade80', border: 'none', color: '#000', padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
                            บันทึก
                        </button>
                    </form>
                </div>
            )}

            <div style={{
                maxWidth: 900,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 20,
                alignItems: 'stretch',
            }}>
                {products.map((product) => (
                    <div
                        key={product._id}
                        style={{
                            background: '#1a1a1a',
                            border: '1px solid #2a2a2a',
                            borderRadius: 12,
                            padding: 20,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                        }}
                    >
                        <div style={{ background: '#2a2a2a', borderRadius: 8, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, marginBottom: 16 }}>
                            🍎
                        </div>
                        <h3 style={{ color: '#fff', margin: '0 0 8px', fontSize: 18 }}>{product.name}</h3>
                        <p style={{ color: '#888', margin: '0 0 16px', fontSize: 14, flex: 1 }}>{product.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: 18 }}>฿{product.price.toLocaleString()}</span>
                            <span style={{ background: '#2a2a2a', color: '#888', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>
                                เหลือ {product.stock} ชิ้น
                            </span>
                        </div>
                        <button
                            onClick={() => handleAddToCart(product._id)}
                            style={{ width: '100%', marginTop: 12, background: '#3b82f6', border: 'none', color: '#fff', padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }}
                        >
                            🛒 หยิบใส่ตะกร้า
                        </button>
                        {role === 'admin' && (
                            <button
                                onClick={() => handleDelete(product._id, product.name)}
                                style={{
                                    width: '100%',
                                    marginTop: 8,
                                    background: 'transparent',
                                    border: '1px solid #ff4d4d',
                                    color: '#ff4d4d',
                                    padding: '8px',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                }}
                            >
                                🗑️ ลบสินค้า
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    background: '#0f0f0f',
    border: '1px solid #333',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 14,
};

export default ProductsPage;