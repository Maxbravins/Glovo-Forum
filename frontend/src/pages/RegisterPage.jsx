import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bike, UserPlus } from 'lucide-react';

export const RegisterPage = ({ onSuccess, onSwitchToLogin }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/register', {
        username,
        email,
        password,
        role,
      });
      login(res.data.token, res.data.user);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '50px auto', padding: '0 16px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(0,160,130,0.15)', color: 'var(--color-brand-green)', borderRadius: '50%', marginBottom: '12px' }}>
            <Bike size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Join the Glovo Community</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Create an account to post, reply, and share photos
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
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. SpeedRider_99"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
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
              placeholder="At least 6 characters"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
              Account Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className={`btn ${role === 'USER' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRole('USER')}
                style={{ padding: '10px' }}
              >
                💬 Customer / User
              </button>
              <button
                type="button"
                className={`btn ${role === 'RIDER' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRole('RIDER')}
                style={{ padding: '10px' }}
              >
                🛵 Glovo Rider
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '10px' }} disabled={isSubmitting}>
            <UserPlus size={18} />
            <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} style={{ color: 'var(--color-brand-yellow)', fontWeight: 700 }}>
            Log in here
          </button>
        </div>
      </div>
    </div>
  );
};
