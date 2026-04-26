import { useState, useEffect } from 'react';
import SeverityBadge from './SeverityBadge';
import { updateIncidentStatus } from '../services/incidentService';

const borderColor = {
  1: 'border-green-400',
  2: 'border-yellow-400',
  3: 'border-orange-400',
  4: 'border-red-400',
  5: 'border-red-700',
};

function formatElapsed(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function IncidentCard({ incident, venueId, showActions }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (incident.status === 'resolved') return;
    const start  = incident.timestamp || Date.now();
    const timer  = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [incident.timestamp, incident.status]);

  const isEscalated  = elapsed > 300 && incident.status === 'active';
  const isWarning    = elapsed > 120 && elapsed <= 300 && incident.status === 'active';
  const displayLevel = isEscalated ? 5 : incident.severity;
  const border       = borderColor[displayLevel] || 'border-gray-300';

  async function handleResolve() {
    await updateIncidentStatus(venueId, incident.id, 'resolved');
  }

  return (
    <div className={`bg-white rounded-xl border-l-4 ${border} shadow-sm p-4 mb-3
      ${isEscalated ? 'animate-pulse ring-2 ring-red-400' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">

          {/* Header row */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <SeverityBadge level={displayLevel} />

            {/* Live timer */}
            {incident.status === 'active' && (
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded
                ${isEscalated
                  ? 'bg-red-600 text-white'
                  : isWarning
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-500'}`}>
                ⏱ {formatElapsed(elapsed)}
              </span>
            )}

            {/* Escalated badge */}
            {isEscalated && (
              <span className="text-xs font-bold text-red-600
                               bg-red-50 border border-red-300
                               px-2 py-0.5 rounded-full animate-pulse">
                ⚠ ESCALATED
              </span>
            )}

            {incident.status === 'resolved' && (
              <span className="text-xs text-green-600 font-medium">
                ✓ Resolved
              </span>
            )}

            <span className="text-xs text-gray-400">
              {incident.timestamp
                ? new Date(incident.timestamp).toLocaleTimeString()
                : 'Just now'}
            </span>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-800 font-medium">
            {incident.type && incident.type !== 'unknown'
              ? `[${incident.type.toUpperCase()}] ` : ''}
            {incident.message}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Room: {incident.room || 'Unknown'} · Floor: {incident.floor || '?'}
          </p>

          {/* Escalation warning */}
          {isEscalated && (
            <p className="text-xs text-red-600 font-medium mt-1">
              This incident has been active for over 5 minutes — immediate action required.
            </p>
          )}
          {isWarning && !isEscalated && (
            <p className="text-xs text-orange-500 mt-1">
              Incident unresolved for over 2 minutes.
            </p>
          )}
        </div>

        {/* Resolve button */}
        {showActions && incident.status === 'active' && (
          <button
            onClick={handleResolve}
            className="text-xs bg-green-50 text-green-700 border border-green-200
                       px-3 py-1.5 rounded-lg hover:bg-green-100
                       transition-colors whitespace-nowrap flex-shrink-0">
            Mark resolved
          </button>
        )}
      </div>
    </div>
  );
}