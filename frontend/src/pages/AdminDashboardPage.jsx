import React, { useState, useEffect } from 'react';
import { fetchAdminStats, fetchUsers, deleteUserApi, api } from '../services/api';
import { ShieldAlert, Users, MessageSquare, FileText, Bike, Trash2, ArrowLeft } from 'lucide-react';

export const AdminDashboardPage = ({ onBack }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        fetchAdminStats(),
        fetchUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? All their posts and comments will also be deleted.')) return;
    try {
      await deleteUserApi(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role: newRole });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1000px', padding: '24px 16px 60px' }}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={onBack}
        style={{ marginBottom: '16px', gap: '6px' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Forum</span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <ShieldAlert size={28} style={{ color: 'var(--color-brand-red)' }} />
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Moderation & Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage registered members, roles, and view platform metrics</p>
        </div>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,194,68,0.15)', color: 'var(--color-brand-yellow)', borderRadius: 'var(--radius-md)' }}>
              <Users size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700 }}>TOTAL USERS</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalUsers}</h2>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'rgba(0,160,130,0.15)', color: 'var(--color-brand-green)', borderRadius: 'var(--radius-md)' }}>
              <Bike size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700 }}>GLOVO RIDERS</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalRiders}</h2>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'rgba(59,130,246,0.15)', color: '#3B82F6', borderRadius: 'var(--radius-md)' }}>
              <FileText size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700 }}>TOTAL POSTS</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalPosts}</h2>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'rgba(168,85,247,0.15)', color: '#A855F7', borderRadius: 'var(--radius-md)' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700 }}>TOTAL COMMENTS</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalComments}</h2>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Registered Members ({users.length})</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>User</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Role</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 700 }}>
                    {u.username}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="USER">USER</option>
                      <option value="RIDER">RIDER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--color-brand-red)' }}
                      title="Delete User"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
