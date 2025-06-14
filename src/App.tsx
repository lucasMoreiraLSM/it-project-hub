
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthPage } from '@/components/auth/AuthPage';
import { Toaster } from '@/components/ui/toaster';
import ResetPassword from '@/pages/ResetPassword';
import AcceptInvite from '@/pages/AcceptInvite';
import ProtectedRoute from '@/components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/*" element={<ProtectedRoute />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
