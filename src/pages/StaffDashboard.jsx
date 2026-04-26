import { useState, useEffect, useRef } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { sendBroadcast } from '../services/incidentService';
import IncidentCard from '../components/IncidentCard';
import IncidentChat from '../components/IncidentChat';

const VENUE_ID = localStorage.getItem('crisisVenue') || 'venue_demo_001';

const teamEmoji = {
  security:'', medical:'', maintenance:'',
  management:'', fire_dept:'',
};

// ── Triage detail panel ───────────────────────────────────
function TriagePanel({ incident, onUseSuggestion }) {
  if (!incident) return (
    <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-400 text-center">
      Click an incident to see AI triage details
    </div>
  );

  if (!incident.triaged) return (
    <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-400 text-center">
      <div className="animate-spin text-2xl mb-2">⏳</div>
      AI triage running...
    </div>
  );

  const confidence = Math.round((incident.confidence || 0) * 100);
  const isCritical = (incident.severity || 0) >= 4;

  return (
    <div className={`border rounded-2xl p-4 space-y-3
      ${isCritical
        ? 'bg-red-50 border-red-200'
        : 'bg-white border-gray-100'}`}>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
           Gemini AI Triage
        </h3>
        <div className="flex items-center gap-2">
          {isCritical && (
            <span className="text-xs bg-red-600 text-white px-2 py-0.5
              rounded-full font-bold animate-pulse">
              ⚠ CRITICAL
            </span>
          )}
          <span className="text-xs text-gray-400">
            {confidence}% confidence
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className={`rounded-lg p-2.5
          ${isCritical ? 'bg-red-100' : 'bg-red-50'}`}>
          <div className="text-xs text-red-400 mb-0.5">Incident type</div>
          <div className="text-sm font-semibold text-red-700 capitalize">
            {incident.type || 'Unknown'}
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-2.5">
          <div className="text-xs text-orange-400 mb-0.5">Severity</div>
          <div className="text-sm font-semibold text-orange-700">
            {'★'.repeat(incident.severity || 0)}
            {'☆'.repeat(5 - (incident.severity || 0))}
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-2.5 col-span-2">
          <div className="text-xs text-blue-400 mb-0.5">Dispatch team</div>
          <div className="text-sm font-semibold text-blue-700">
            {teamEmoji[incident.responderTeam] || '👥'}{' '}
            {(incident.responderTeam || 'security')
              .replace('_', ' ').toUpperCase()}
          </div>
        </div>
      </div>

      {incident.summary && (
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="text-xs text-gray-400 mb-1">AI summary</div>
          <p className="text-xs text-gray-700">{incident.summary}</p>
        </div>
      )}

      {incident.broadcastSuggestion && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5">
          <div className="text-xs text-amber-600 mb-1">Suggested broadcast</div>
          <p className="text-xs text-amber-800 italic">
            "{incident.broadcastSuggestion}"
          </p>
          <button
            onClick={() => onUseSuggestion(incident.broadcastSuggestion)}
            className="mt-2 text-xs text-amber-600 underline hover:text-amber-800">
            Use this suggestion ↗
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────
export default function StaffDashboard() {
  const { active, resolved, loading } = useIncidents(VENUE_ID);
  const [broadcast, setBroadcast]     = useState('');
  const [sending,   setSending]       = useState(false);
  const [sent,      setSent]          = useState(false);
  const [selected,  setSelected]      = useState(null);
  const prevCountRef                  = useRef(0);

  const selectedIncident =
    active.find(i => i.id === selected) ||
    resolved.find(i => i.id === selected);

  // ── Live browser tab title ──────────────────────────────
  useEffect(() => {
    document.title = active.length > 0
      ? `🚨 (${active.length}) CrisisSync — Staff Dashboard`
      : 'CrisisSync — Staff Dashboard';
    return () => { document.title = 'CrisisSync'; };
  }, [active.length]);

  // ── Sound alert on new incident ─────────────────────────
  useEffect(() => {
    if (active.length > prevCountRef.current && prevCountRef.current >= 0) {
      playAlertSound();
    }
    prevCountRef.current = active.length;
  }, [active.length]);

  function playAlertSound() {
    try {
      const ctx        = new (window.AudioContext || window.webkitAudioContext)();
      const osc        = ctx.createOscillator();
      const gainNode   = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.30);
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch { /* Audio not supported */ }
  }

  async function handleBroadcast() {
    if (!broadcast.trim()) return;
    setSending(true);
    await sendBroadcast(VENUE_ID, broadcast.trim());
    setBroadcast('');
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  const criticalCount = active.filter(i => (i.severity || 0) >= 4).length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className={`border-b px-6 py-4 flex items-center justify-between
        transition-colors duration-500
        ${criticalCount > 0
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-gray-100'}`}>
        <div>
          <h1 className="text-lg font-bold text-gray-800">
             Staff Dashboard
          </h1>
          <p className="text-xs text-gray-400">
            CrisisSync · Live incident feed
          </p>
        </div>
        <div className="flex gap-4">
          {criticalCount > 0 && (
            <div className="text-center animate-pulse">
              <div className="text-xl font-bold text-red-600">
                {criticalCount}
              </div>
              <div className="text-xs text-red-500 font-semibold">
                CRITICAL
              </div>
            </div>
          )}
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">
              {active.length}
            </div>
            <div className="text-xs text-gray-400">Active</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {resolved.length}
            </div>
            <div className="text-xs text-gray-400">Resolved</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6
        grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT — incident feed */}
        <div>
          {/* Broadcast panel */}
          <div className="bg-amber-50 border border-amber-200
            rounded-2xl p-4 mb-4">
            <h2 className="text-sm font-semibold text-amber-800 mb-3">
               Broadcast to all guests
            </h2>
            <div className="flex gap-2">
              <input
                value={broadcast}
                onChange={e => setBroadcast(e.target.value)}
                placeholder="e.g. Please proceed to exit B calmly"
                className="flex-1 border border-amber-200 rounded-lg
                  px-3 py-2 text-sm focus:outline-none
                  focus:ring-2 focus:ring-amber-400 bg-white"
              />
              <button
                onClick={handleBroadcast}
                disabled={sending || !broadcast.trim()}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg
                  text-sm font-medium hover:bg-amber-400 disabled:opacity-50">
                {sent ? '✓ Sent!' : 'Send'}
              </button>
            </div>
          </div>

          {/* Severity summary row */}
          {active.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label:'🔴 Critical', val:active.filter(i=>(i.severity||0)>=4).length, color:'bg-red-50 border-red-200 text-red-700' },
                { label:'🟠 High',     val:active.filter(i=>(i.severity||0)===3).length, color:'bg-orange-50 border-orange-200 text-orange-700' },
                { label:'🟡 Moderate', val:active.filter(i=>(i.severity||0)<=2&&(i.severity||0)>0).length, color:'bg-yellow-50 border-yellow-200 text-yellow-700' },
              ].map(s => (
                <div key={s.label}
                  className={`rounded-xl border p-2.5 text-center ${s.color}`}>
                  <div className="text-lg font-bold">{s.val}</div>
                  <div className="text-xs font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Active incidents */}
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            🔴 Active Incidents ({active.length})
          </h2>
          {loading && (
            <p className="text-sm text-gray-400">Connecting to live feed...</p>
          )}
          {!loading && active.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed
              border-gray-200 p-6 text-center text-gray-400 text-sm">
              No active incidents — all clear ✓
            </div>
          )}
          {active.map(inc => (
            <div key={inc.id}
              onClick={() => setSelected(inc.id)}
              className={`cursor-pointer rounded-xl transition-all
                ${selected === inc.id ? 'ring-2 ring-blue-400' : ''}`}>
              <IncidentCard
                incident={inc}
                venueId={VENUE_ID}
                showActions={true}
              />
            </div>
          ))}

          {/* Resolved incidents */}
          {resolved.length > 0 && (
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-gray-500 mb-3">
                ✅ Resolved ({resolved.length})
              </h2>
              {resolved.map(inc => (
                <div key={inc.id}
                  onClick={() => setSelected(inc.id)}
                  className="cursor-pointer">
                  <IncidentCard
                    incident={inc}
                    venueId={VENUE_ID}
                    showActions={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — triage + chat */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">
             AI Triage Detail
          </h2>
          <TriagePanel
            incident={selectedIncident}
            onUseSuggestion={s => setBroadcast(s)}
          />
          {selectedIncident && (
            <IncidentChat
              venueId={VENUE_ID}
              incidentId={selectedIncident.id}
            />
          )}
        </div>

      </div>
    </div>
  );
}