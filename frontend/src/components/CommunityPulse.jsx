import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, MapPin, Plus, Radio, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  confirmPulseUpdateApi,
  createPulseUpdateApi,
  fetchPulseUpdatesApi,
  fetchSavedPulseAreasApi,
  savePulseAreaApi,
  removeSavedPulseAreaApi,
} from '../services/api';
import { ReportButton } from './ReportButton';

const pulseTypes = [
  ['DELAY', 'Restaurant delay'],
  ['ROAD_CLOSURE', 'Road closure'],
  ['BUSY_AREA', 'Busy area'],
  ['APP_ISSUE', 'App issue'],
  ['LOCAL_TIP', 'Local tip'],
  ['SAFETY_NOTICE', 'Safety notice'],
];

const typeLabels = Object.fromEntries(pulseTypes);

export const CommunityPulse = ({ onRequestLogin }) => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [areaFilter, setAreaFilter] = useState('');
  const [type, setType] = useState('DELAY');
  const [area, setArea] = useState('');
  const [content, setContent] = useState('');
  const [durationHours, setDurationHours] = useState('4');
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [savedAreas, setSavedAreas] = useState([]);
  const [savedAreaInput, setSavedAreaInput] = useState('');
  const [areaManagerOpen, setAreaManagerOpen] = useState(false);
  const [savedAreasOnly, setSavedAreasOnly] = useState(false);
  const [areaBusy, setAreaBusy] = useState(false);
  const [error, setError] = useState('');

  const loadUpdates = async () => {
    try {
      setUpdates(await fetchPulseUpdatesApi());
    } catch (loadError) {
      console.error('Failed to load Community Pulse updates', loadError);
      setError('Community Pulse is temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
    const refreshTimer = window.setInterval(loadUpdates, 60_000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  useEffect(() => {
    if (!user) {
      setSavedAreas([]);
      setSavedAreasOnly(false);
      return;
    }
    setSavedAreas([]);
    setSavedAreasOnly(false);
    fetchSavedPulseAreasApi().then(setSavedAreas).catch((loadError) => {
      console.error('Failed to load saved Pulse areas', loadError);
    });
  }, [user?.id]);

  const visibleUpdates = useMemo(() => {
    const query = areaFilter.trim().toLowerCase();
    return updates.filter((update) => {
      const matchesText = !query || update.area.toLowerCase().includes(query);
      const savedKeys = new Set(savedAreas.map((savedArea) => savedArea.areaKey));
      const matchesSaved = !savedAreasOnly || savedKeys.has(update.areaKey);
      return matchesText && matchesSaved;
    });
  }, [updates, areaFilter, savedAreas, savedAreasOnly]);

  const addSavedArea = async (event) => {
    event.preventDefault();
    const cleanArea = savedAreaInput.trim();
    if (!cleanArea) return;
    setAreaBusy(true);
    setError('');
    try {
      const savedArea = await savePulseAreaApi(cleanArea);
      setSavedAreas((current) => current.some((item) => item.id === savedArea.id) ? current : [...current, savedArea]);
      setSavedAreaInput('');
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Unable to save this area.');
    } finally {
      setAreaBusy(false);
    }
  };

  const removeSavedArea = async (id) => {
    setAreaBusy(true);
    setError('');
    try {
      await removeSavedPulseAreaApi(id);
      setSavedAreas((current) => current.filter((item) => item.id !== id));
      if (savedAreas.length === 1) setSavedAreasOnly(false);
    } catch (removeError) {
      setError(removeError.response?.data?.message || 'Unable to remove this area.');
    } finally {
      setAreaBusy(false);
    }
  };

  const publishUpdate = async (event) => {
    event.preventDefault();
    if (!user) {
      onRequestLogin?.();
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const created = await createPulseUpdateApi({ type, area, content, durationHours: Number(durationHours) });
      setUpdates((current) => [created, ...current]);
      setType('DELAY');
      setArea('');
      setContent('');
      setDurationHours('4');
      setIsComposerOpen(false);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to publish this update.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmUpdate = async (update) => {
    if (!user) {
      onRequestLogin?.();
      return;
    }
    setBusyId(update.id);
    setError('');
    try {
      const result = await confirmPulseUpdateApi(update.id);
      setUpdates((current) => current.map((item) => item.id === update.id
        ? { ...item, isConfirmed: true, confirmationCount: result.confirmationCount }
        : item));
    } catch (confirmError) {
      setError(confirmError.response?.data?.message || 'Unable to confirm this update.');
      loadUpdates();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section id="community-pulse" className="mb-8 scroll-mt-24 overflow-hidden rounded-2xl border border-[#2e3440] bg-[#181b20] shadow-lg" aria-labelledby="community-pulse-title">
      <div className="flex flex-col gap-4 border-b border-white/5 bg-gradient-to-r from-[#00a082]/10 to-transparent p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00a082]/15 text-[#00a082]"><Radio size={20} /></span>
          <div>
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-[#00a082]">Live community updates</p>
            <h2 id="community-pulse-title" className="mt-1 text-xl font-extrabold text-white">Community Pulse</h2>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-gray-400">Share what’s happening nearby. Updates expire automatically, and the community can confirm what’s still current.</p>
          </div>
        </div>
        <button type="button" onClick={() => user ? setIsComposerOpen((open) => !open) : onRequestLogin?.()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ffc244] px-4 py-2.5 text-sm font-bold text-[#0f1115] hover:bg-[#eab233]">
          {isComposerOpen ? <X size={16} /> : <Plus size={16} />}{isComposerOpen ? 'Close' : 'Post an update'}
        </button>
      </div>

      {isComposerOpen && (
        <form onSubmit={publishUpdate} className="grid gap-4 border-b border-white/5 bg-[#14171c] p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <label htmlFor="pulse-type" className="mb-1.5 block text-xs font-bold text-gray-300">Update type</label>
            <select id="pulse-type" value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-lg border border-[#343b47] bg-[#20242b] px-3 py-2.5 text-sm text-white">
              {pulseTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="pulse-area" className="mb-1.5 block text-xs font-bold text-gray-300">Neighborhood or town</label>
            <input id="pulse-area" value={area} onChange={(event) => setArea(event.target.value)} maxLength={80} required placeholder="e.g. Westlands, Nairobi" className="w-full rounded-lg border border-[#343b47] bg-[#20242b] px-3 py-2.5 text-sm text-white placeholder:text-gray-500" />
            <p className="mt-1 text-[0.7rem] text-gray-500">Use a broad area. Don’t share an exact address or live location.</p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pulse-content" className="mb-1.5 block text-xs font-bold text-gray-300">What should the community know?</label>
            <textarea id="pulse-content" value={content} onChange={(event) => setContent(event.target.value)} maxLength={500} minLength={8} required rows={3} placeholder="Keep it brief and useful…" className="w-full resize-y rounded-lg border border-[#343b47] bg-[#20242b] px-3 py-2.5 text-sm leading-5 text-white placeholder:text-gray-500" />
            <div className="mt-1 flex items-center justify-between text-[0.7rem] text-gray-500"><span>For safety notices, share only information you can verify.</span><span>{content.length}/500</span></div>
          </div>
          <div>
            <label htmlFor="pulse-expiry" className="mb-1.5 block text-xs font-bold text-gray-300">Keep visible for</label>
            <select id="pulse-expiry" value={durationHours} onChange={(event) => setDurationHours(event.target.value)} className="w-full rounded-lg border border-[#343b47] bg-[#20242b] px-3 py-2.5 text-sm text-white">
              <option value="1">1 hour</option><option value="4">4 hours</option><option value="12">12 hours</option>
            </select>
          </div>
          <div className="flex items-end justify-end">
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-[#00a082] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#008f75] disabled:opacity-60">{submitting ? 'Posting…' : 'Share update'}</button>
          </div>
        </form>
      )}

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Current in the community</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {user && savedAreas.length > 0 && (
              <button type="button" onClick={() => setSavedAreasOnly((current) => !current)} aria-pressed={savedAreasOnly} className={`rounded-lg border px-3 py-2 text-xs font-bold ${savedAreasOnly ? 'border-[#00a082] bg-[#00a082]/15 text-[#56d6b3]' : 'border-[#343b47] text-gray-400 hover:text-white'}`}>
                {savedAreasOnly ? 'Showing saved areas' : 'Show saved areas'}
              </button>
            )}
            {user && <button type="button" onClick={() => setAreaManagerOpen((open) => !open)} className="rounded-lg border border-[#343b47] px-3 py-2 text-xs font-bold text-gray-300 hover:bg-white/5">
              {areaManagerOpen ? 'Close area settings' : `My areas (${savedAreas.length}/5)`}
            </button>}
            {!user && <button type="button" onClick={onRequestLogin} className="rounded-lg border border-[#343b47] px-3 py-2 text-xs font-bold text-gray-300 hover:bg-white/5">Save your areas</button>}
            <div className="relative w-full sm:w-[190px]">
              <MapPin size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input aria-label="Filter updates by area" value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} placeholder="Filter by area" className="w-full rounded-lg border border-[#343b47] bg-[#20242b] py-2 pl-9 pr-3 text-xs text-white placeholder:text-gray-500" />
            </div>
          </div>
        </div>

        {areaManagerOpen && user && (
          <div className="mb-4 rounded-xl border border-[#343b47] bg-[#14171c] p-4">
            <p className="mb-3 text-xs leading-5 text-gray-400">Save up to five neighborhoods or towns. We use these only to filter updates and send matching safety notices. No device location is collected.</p>
            <form onSubmit={addSavedArea} className="flex flex-col gap-2 sm:flex-row">
              <input value={savedAreaInput} onChange={(event) => setSavedAreaInput(event.target.value)} maxLength={80} placeholder="Add an area, e.g. Westlands, Nairobi" className="min-w-0 flex-1 rounded-lg border border-[#343b47] bg-[#20242b] px-3 py-2 text-sm text-white placeholder:text-gray-500" />
              <button type="submit" disabled={areaBusy || savedAreas.length >= 5 || !savedAreaInput.trim()} className="rounded-lg bg-[#00a082] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{areaBusy ? 'Saving…' : 'Save area'}</button>
            </form>
            {savedAreas.length > 0 && <div className="mt-3 flex flex-wrap gap-2">
              {savedAreas.map((savedArea) => <span key={savedArea.id} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-gray-200">
                <MapPin size={12} className="text-[#56d6b3]" />{savedArea.area}
                <button type="button" disabled={areaBusy} aria-label={`Remove ${savedArea.area}`} onClick={() => removeSavedArea(savedArea.id)} className="ml-1 text-gray-400 hover:text-white"><X size={13} /></button>
              </span>)}
            </div>}
          </div>
        )}

        {error && <p role="alert" className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
        {loading ? <p className="py-6 text-center text-sm text-gray-500">Loading current updates…</p> : visibleUpdates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#343b47] px-4 py-8 text-center">
            <p className="text-sm font-semibold text-gray-300">No current updates{areaFilter ? ` for “${areaFilter}”` : ''}.</p>
            <p className="mt-1 text-xs text-gray-500">Share the first useful update for your area.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {visibleUpdates.map((update) => (
              <article key={update.id} className="rounded-xl border border-[#303743] bg-[#20242b] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#00a082]/15 px-2.5 py-1 text-[0.68rem] font-bold text-[#56d6b3]">{typeLabels[update.type] || 'Community update'}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-300"><MapPin size={12} />{update.area}</span>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-100">{update.content}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.7rem] text-gray-500">
                  <span>{update.author?.username ? `Posted by ${update.author.username}` : 'Community member'}</span>
                  <span className="inline-flex items-center gap-1"><Clock3 size={12} />Expires {new Date(update.expiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
                {update.type === 'SAFETY_NOTICE' && <p className="mt-2 flex items-center gap-1 text-[0.68rem] text-amber-300"><AlertTriangle size={12} />Check official sources for urgent safety information.</p>}
                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                  <button type="button" disabled={update.isConfirmed || busyId === update.id} onClick={() => confirmUpdate(update)} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold ${update.isConfirmed ? 'bg-[#00a082]/15 text-[#56d6b3]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                    <CheckCircle2 size={14} />{update.isConfirmed ? 'You confirmed' : 'Still happening?'} <span>· {update.confirmationCount}</span>
                  </button>
                  <ReportButton pulseUpdateId={update.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
