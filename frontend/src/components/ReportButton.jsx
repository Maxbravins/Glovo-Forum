import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { submitReportApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const reasons = [
  ['ABUSE', 'Abusive or hateful language'],
  ['HARASSMENT', 'Harassment or bullying'],
  ['INAPPROPRIATE', 'Sensitive or inappropriate content'],
  ['SPAM', 'Spam or misleading content'],
  ['MISINFORMATION', 'Misinformation'],
  ['FRAUD', 'Fraud or scam'],
  ['OTHER', 'Something else'],
];

export const ReportButton = ({ postId, commentId, pulseUpdateId, stopPropagation = false }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('ABUSE');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const openDialog = (event) => {
    if (stopPropagation) event.stopPropagation();
    if (!user) {
      setMessage('Please log in to report content.');
      return;
    }
    setError('');
    setMessage('');
    setIsOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const target = postId ? { postId } : commentId ? { commentId } : { pulseUpdateId };
      await submitReportApi(target, reason, description.trim());
      setIsOpen(false);
      setDescription('');
      setMessage('Thanks. Your report was sent to the moderation team.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send your report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" onClick={openDialog} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        <AlertTriangle size={14} /> Report
      </button>
      {message && <span role="status" style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: '0.78rem' }}>{message}</span>}
      {isOpen && (
        <div role="presentation" onClick={(event) => { event.stopPropagation(); setIsOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,.65)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <form role="dialog" aria-modal="true" aria-labelledby="report-title" onSubmit={submit} onClick={(event) => event.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 440, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 id="report-title" style={{ fontSize: '1.1rem', fontWeight: 800 }}>Report content</h2>
              <button type="button" className="btn btn-secondary btn-sm" aria-label="Close report dialog" onClick={() => setIsOpen(false)}><X size={16} /></button>
            </div>
            <label htmlFor="report-reason" style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: '.85rem' }}>What is the concern?</label>
            <select id="report-reason" value={reason} onChange={(event) => setReason(event.target.value)} style={{ width: '100%', marginBottom: 14 }}>
              {reasons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <label htmlFor="report-description" style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: '.85rem' }}>Add context (optional)</label>
            <textarea id="report-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1000} rows={4} placeholder="Help moderators understand the issue" style={{ width: '100%', marginBottom: 10 }} />
            {error && <p role="alert" style={{ color: 'var(--color-brand-red)', marginBottom: 10 }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send report'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
