import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/AuthPage';
import Dashboard from './components/Dashboard';
import ResetPassword from './components/ResetPassword';
import { Toaster } from "@/components/ui/toaster"
import { Session } from '@supabase/supabase-js';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'


function App() {
  const [session, setSession] = useState<Session | null>(null);
  const queryClient = new QueryClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={
            session ? <Navigate to="/dashboard" replace /> : <Auth />
          } />
          <Route path="/dashboard" element={
            session ? <Dashboard /> : <Navigate to="/" replace />
          } />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;