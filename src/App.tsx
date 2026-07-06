import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import OrdersPage from './pages/OrdersPage';
import NotificationsPage from './pages/NotificationsPage';
import { refreshToken } from './api/auth';
import {
  setAccessToken,
  setRefreshHandler,
  setLogoutHandler,
} from './api/client';

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp: number };
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

function App() {
  const [authReady, setAuthReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('token');
    setAccessToken(null);
    setToken(null);
  }, []);

  const handleLogin = (accessToken: string, refresh: string, userId: string) => {
    localStorage.removeItem('token');
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user_id', userId);
    setAccessToken(accessToken);
    setToken(accessToken);
  };

  const handleRefresh = useCallback(async (): Promise<string | null> => {
    const refresh = localStorage.getItem('refresh_token');
    const userId = localStorage.getItem('user_id');

    if (!refresh || !userId) {
      handleLogout();
      return null;
    }

    try {
      const data = await refreshToken(userId, refresh);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      setAccessToken(data.access_token);
      setToken(data.access_token);
      return data.access_token;
    } catch {
      handleLogout();
      return null;
    }
  }, [handleLogout]);

  // ลงทะเบียน handler ให้ client.ts
  useEffect(() => {
    setRefreshHandler(handleRefresh);
    setLogoutHandler(handleLogout);
  }, [handleRefresh, handleLogout]);

  // เช็ค auth ตอนเปิดแอป — รอเสร็จก่อนแสดงหน้า
  useEffect(() => {
    const initAuth = async () => {
      const access = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');

      if (!access || !refresh) {
        handleLogout();
        setAuthReady(true);
        return;
      }

      if (isTokenExpired(access)) {
        const newToken = await handleRefresh();
        if (!newToken) {
          handleLogout();
        }
      } else {
        setAccessToken(access);
        setToken(access);
      }

      setAuthReady(true);
    };

    void initAuth();
  }, [handleRefresh, handleLogout]);

  if (!authReady) {
    return null; // หรือ <div>Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={token ? '/products' : '/login'} />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/products" /> : <RegisterPage />}
        />
        <Route
          path="/login"
          element={
            token ? <Navigate to="/products" /> : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/products"
          element={
            token ? (
              <ProductsPage token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/cart"
          element={token ? <CartPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/payment"
          element={token ? <PaymentPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/orders"
          element={token ? <OrdersPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/notifications"
          element={token ? <NotificationsPage /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={token ? '/products' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;