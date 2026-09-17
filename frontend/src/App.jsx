import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Drivers } from './pages/Drivers';
import { Orders } from './pages/Orders';
import { OrderDetails } from './pages/OrderDetails';
import { NotFound } from './pages/NotFound';

function RootRedirect() {
  const { isAuthenticated, isDriver } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (isDriver) {
    return <Navigate to="/orders" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Root redirect based on auth & role */}
      <Route path="/" element={<RootRedirect />} />

      {/* Protected application layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Owner-only routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/drivers"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <Drivers />
            </ProtectedRoute>
          }
        />

        {/* Shared routes (Owner & Driver) */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={['owner', 'driver']}>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['owner', 'driver']}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['owner', 'driver']}>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
