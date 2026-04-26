export default function FloorPlanMap({ incidents }) {
  const FLOORS = [6, 5, 4, 3, 2, 1, 'G'];
  const active = incidents.filter(i => i.status === 'active');

  function getFloorData(floor) {
    const floorInc = active.filter(
      i => String(i.floor).toLowerCase() === String(floor).toLowerCase()
    );
    const maxSev = floorInc.length
      ? Math.max(...floorInc.map(i => Number(i.severity) || 0))
      : 0;
    return { count: floorInc.length, maxSev, incidents: floorInc };
  }

  function floorStyle(maxSev, count) {
    if (count === 0) return {
      bg: 'rgba(255,255,255,0.05)',
      border: 'rgba(255,255,255,0.1)',
      text: '#94a3b8',
      badge: null,
    };
    if (maxSev >= 5) return {
      bg: 'rgba(226,75,74,0.25)',
      border: '#E24B4A',
      text: '#fca5a5',
      badge: { bg: '#E24B4A', label: 'EXTREME' },
    };
    if (maxSev >= 4) return {
      bg: 'rgba(216,90,48,0.2)',
      border: '#D85A30',
      text: '#fdba74',
      badge: { bg: '#D85A30', label: 'CRITICAL' },
    };
    if (maxSev >= 3) return {
      bg: 'rgba(186,117,23,0.2)',
      border: '#BA7517',
      text: '#fcd34d',
      badge: { bg: '#BA7517', label: 'HIGH' },
    };
    return {
      bg: 'rgba(29,158,117,0.15)',
      border: '#1D9E75',
      text: '#6ee7b7',
      badge: { bg: '#1D9E75', label: 'ALERT' },
    };
  }

  const totalActive = active.length;

  return (
    <div className="bg-slate-800 rounded-2xl p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">
             Live Floor Plan
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {totalActive === 0
              ? 'All floors clear'
              : `${totalActive} active incident${totalActive > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            Clear
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
            Alert
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
            Critical
          </span>
        </div>
      </div>

      {/* Floor rows */}
      <div className="space-y-2">
        {FLOORS.map(floor => {
          const { count, maxSev, incidents: floorIncs } = getFloorData(floor);
          const style   = floorStyle(maxSev, count);
          const pulse   = maxSev >= 4 && count > 0;

          return (
            <div key={floor}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5
                          border transition-all duration-700
                          ${pulse ? 'animate-pulse' : ''}`}
              style={{ background: style.bg, borderColor: style.border,
                       borderWidth: count > 0 ? '1.5px' : '0.5px' }}>

              {/* Floor label */}
              <div className="w-14 flex-shrink-0">
                <div className="text-xs font-bold"
                  style={{ color: style.text }}>
                  {floor === 'G' ? 'GROUND' : `FLOOR ${floor}`}
                </div>
              </div>

              {/* Incident pills */}
              <div className="flex-1 flex gap-1.5 flex-wrap">
                {floorIncs.map(inc => (
                  <span key={inc.id}
                    className="text-white text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: style.border }}>
                    {inc.type && inc.type !== 'unknown'
                      ? inc.type.toUpperCase()
                      : '⚠ INCIDENT'}
                  </span>
                ))}
              </div>

              {/* Status badge */}
              <div className="flex-shrink-0">
                {count === 0 ? (
                  <span className="text-xs text-slate-500">✓ Clear</span>
                ) : (
                  <span className="text-xs font-bold px-2 py-0.5
                                   rounded-full text-white"
                    style={{ background: style.border }}>
                    {style.badge?.label} · {count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-600 text-center mt-3">
        Updates in real time · Pulses red on critical severity
      </p>
    </div>
  );
}