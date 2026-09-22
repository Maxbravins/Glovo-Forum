import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bike, LogIn } from 'lucide-react';

export const LoginPage = ({ onSuccess, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div style={{ maxWidth: '440px', margin: '60px auto', padding: '0 16px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(255,194,68,0.15)', color: 'var(--color-brand-yellow)', borderRadius: '50%', marginBottom: '12px' }}>
            <Bike size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Log In to Glovo Forum</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Connect with Glovo riders & community
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,90,95,0.15)', color: 'var(--color-brand-red)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rider@glovo.com"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%' }}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '10px' }} disabled={isSubmitting}>
            <LogIn size={18} />
            <span>{isSubmitting ? 'Logging in...' : 'Log In'}</span>
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
          <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px', textAlign: 'center' }}>
            DEMO ACCOUNTS (CLICK TO AUTOFILL):
          </span>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            <button type="button" onClick={() => setDemoUser('rider@glovo.com')} className="btn btn-secondary btn-sm">
              🛵 Rider
            </button>
            <button type="button" onClick={() => setDemoUser('admin@glovo.com')} className="btn btn-secondary btn-sm">
              👑 Admin
            </button>
            <button type="button" onClick={() => setDemoUser('customer@glovo.com')} className="btn btn-secondary btn-sm">
              💬 Customer
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToRegister} style={{ color: 'var(--color-brand-yellow)', fontWeight: 700 }}>
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};
