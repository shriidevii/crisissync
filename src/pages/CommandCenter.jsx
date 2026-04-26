import { useIncidents } from '../hooks/useIncidents';
import IncidentCard from '../components/IncidentCard';
import ResponderMap from '../components/ResponderMap';
import FloorPlanMap from '../components/FloorPlanMap';

const VENUE_ID = localStorage.getItem('crisisVenue') || 'venue_demo_001';

function AnalyticsPanel({ incidents }) {
  const total    = incidents.length;
  const resolved = incidents.filter(i => i.status === 'resolved');
  const active   = incidents.filter(i => i.status === 'active');
  const critical = active.filter(i => (i.severity || 0) >= 4);

  const types = incidents.reduce((acc, i) => {
    const t = i.type || 'unknown';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const sevCounts = [1,2,3,4,5].map(s =>
    incidents.filter(i => i.severity === s).length
  );
  const maxCount  = Math.max(...sevCounts, 1);
  const sevColors = ['#1D9E75','#639922','#BA7517','#D85A30','#E24B4A'];
  const sevLabels = ['Low','Med','High','Crit','Ext'];

  return (
    <div className="bg-slate-800 rounded-2xl p-4">
      <h3 className="text-sm font-bold text-white mb-3">
         Incident Analytics
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Total',    val: total,           color: '#94a3b8' },
          { label: 'Active',   val: active.length,   color: '#f87171' },
          { label: 'Critical', val: critical.length, color: '#fb923c' },
          { label: 'Resolved', val: resolved.length, color: '#34d399' },
        ].map(s => (
          <div key={s.label}
            className="bg-slate-700 rounded-xl p-2.5 text-center">
            <div className="text-xl font-bold"
              style={{ color: s.color }}>
              {s.val}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Severity bar chart */}
      <div className="mb-3">
        <p className="text-xs text-slate-400 mb-2">
          Severity distribution
        </p>
        <div className="flex items-end gap-1.5" style={{ height: '60px' }}>
          {sevCounts.map((count, i) => (
            <div key={i}
              className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-400">{count}</span>
              <div className="w-full rounded-t transition-all duration-700"
                style={{
                  height: `${Math.max(3, (count / maxCount) * 40)}px`,
                  background: sevColors[i],
                  opacity: count === 0 ? 0.2 : 1,
                }} />
              <span className="text-slate-500"
                style={{ fontSize: '9px' }}>
                {sevLabels[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Type breakdown */}
      {Object.keys(types).length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-2">By type</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(types).map(([type, count]) => (
              <span key={type}
                className="text-xs bg-slate-700 text-slate-300
                           px-2.5 py-1 rounded-full capitalize">
                {type}: {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommandCenter() {
  const { incidents, active, resolved, loading } = useIncidents(VENUE_ID);

  const criticalCount = active.filter(i => (i.severity || 0) >= 4).length;

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">
               CrisisSync Command Center
            </h1>
            <p className="text-xs text-slate-400">
              Multi-venue overview · Real-time
            </p>
          </div>
          <div className="flex gap-6">
            {[
              { val: active.length,   label: 'Active',   color: 'text-red-400'    },
              { val: criticalCount,   label: 'Critical',  color: 'text-orange-400' },
              { val: resolved.length, label: 'Resolved',  color: 'text-green-400'  },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={`text-2xl font-bold ${s.color}`}>
                  {s.val}
                </div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT col — Floor plan + Analytics */}
          <div className="space-y-4">
            <FloorPlanMap incidents={incidents} />
            <AnalyticsPanel incidents={incidents} />
          </div>

          {/* MIDDLE col — Responder map */}
          <div>
            <ResponderMap venueId={VENUE_ID} incidents={incidents} />
            <div className="mt-2 text-xs text-slate-600 text-center">
               Incidents ·  Staff (30s update) · Allow location when prompted
            </div>
          </div>

          {/* RIGHT col — Incident list */}
          <div>
            <h2 className="text-sm font-semibold text-slate-300 mb-3">
              Active Incidents
            </h2>
            {loading && (
              <p className="text-slate-400 text-sm">Connecting...</p>
            )}
            {!loading && active.length === 0 && (
              <div className="bg-slate-800 rounded-xl border border-dashed
                              border-slate-600 p-6 text-center
                              text-slate-500 text-sm">
                No active incidents — all clear ✓
              </div>
            )}
            {active.map(inc => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                venueId={VENUE_ID}
                showActions={false}
              />
            ))}

            {resolved.length > 0 && (
              <div className="mt-4">
                <h2 className="text-sm font-semibold text-slate-500 mb-3">
                  Resolved ({resolved.length})
                </h2>
                {resolved.map(inc => (
                  <IncidentCard
                    key={inc.id}
                    incident={inc}
                    venueId={VENUE_ID}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}