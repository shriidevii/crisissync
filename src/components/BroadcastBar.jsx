import { useState, useEffect } from 'react';
import { listenToBroadcast } from '../services/incidentService';

export default function BroadcastBar({ venueId }) {
  const [broadcast, setBroadcast] = useState(null);

  useEffect(() => {
    const unsub = listenToBroadcast(venueId, setBroadcast);
    return () => unsub();
  }, [venueId]);

  if (!broadcast?.message) return null;

  return (
    <div className="bg-amber-400 text-amber-900 px-4 py-3 text-sm font-medium
                    flex items-center gap-2 shadow">
      <span className="text-lg"></span>
      <span>{broadcast.message}</span>
    </div>
  );
}