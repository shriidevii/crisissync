import { useState, useEffect } from 'react';
import { listenToIncidents } from '../services/incidentService';

export function useIncidents(venueId) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;

    // listenToIncidents returns an unsubscribe function
    const unsubscribe = listenToIncidents(venueId, (data) => {
      setIncidents(data);
      setLoading(false);
    });

    // Clean up listener when component unmounts
    return () => unsubscribe();
  }, [venueId]);

  const active   = incidents.filter(i => i.status === 'active');
  const resolved = incidents.filter(i => i.status === 'resolved');

  return { incidents, active, resolved, loading };
}