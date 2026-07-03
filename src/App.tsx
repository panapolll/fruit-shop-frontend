import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import { refreshToken } from './api/auth';
import { setAccessToken, setRefreshHandler } from './api/client';

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('access_token'),
  );

  const handleLogin = (accessToken: string, refresh: string, userId: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user_id', userId);
    setToken(accessToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    setToken(null);
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
      setToken(data.access_token);
      return data.access_token;
    } catch {
      handleLogout();
      return null;
    }
  }, []);

  useEffect(() => {
    setAccessToken(token);
    setRefreshHandler(handleRefresh);
  }, [token, handleRefresh]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/register"
          element={
            token ? <Navigate to="/products" /> : <RegisterPage />
          }
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
          element={
            token ? <CartPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/payment"
          element={
            token ? <PaymentPage /> : <Navigate to="/login" />
          }
        />
        <Route path="*" element={<Navigate to={token ? '/products' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;