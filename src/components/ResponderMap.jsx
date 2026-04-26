import { useEffect, useRef, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const VENUE_CENTER = { lat: 19.0760, lng: 72.8777 }; // Mumbai — change to your venue

export default function ResponderMap({ venueId, incidents }) {
  const mapRef    = useRef(null);
  const mapObj    = useRef(null);
  const markers   = useRef([]);
  const [staffLocs, setStaffLocs] = useState({});
  const { user }  = useAuth();


  useEffect(() => {
    if (!window.google || mapObj.current) return;
    mapObj.current = new window.google.maps.Map(mapRef.current, {
      center: VENUE_CENTER,
      zoom: 17,
      mapTypeId: 'roadmap',
      styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
      disableDefaultUI: true,
      zoomControl: true,
    });
  }, []);

  // Write this staff member's location to Firebase every 30s
  useEffect(() => {
    if (!user || !venueId) return;

    function writeLocation() {
      navigator.geolocation?.getCurrentPosition((pos) => {
        const locRef = ref(db, `staff/${venueId}/${user.uid}/location`);
        set(locRef, {
          lat:  pos.coords.latitude,
          lng:  pos.coords.longitude,
          name: user.email || 'Staff',
          ts:   Date.now(),
        });
      });
    }
    writeLocation();
    const interval = setInterval(writeLocation, 30000);
    return () => clearInterval(interval);
  }, [user, venueId]);

  // Listen to all staff locations
  useEffect(() => {
    if (!venueId) return;
    const staffRef = ref(db, `staff/${venueId}`);
    const unsub = onValue(staffRef, (snap) => {
      setStaffLocs(snap.val() || {});
    });
    return () => unsub();
  }, [venueId]);

  // Place/update markers whenever incidents or staff locations change
  useEffect(() => {
    if (!mapObj.current || !window.google) return;

    
    markers.current.forEach(m => m.setMap(null));
    markers.current = [];

    
    incidents.filter(i => i.status === 'active').forEach(inc => {
      // Offset slightly per floor so markers don't stack
      const offset = (parseInt(inc.floor) || 0) * 0.0001;
      const pos = {
        lat: VENUE_CENTER.lat + offset,
        lng: VENUE_CENTER.lng + offset,
      };
      const marker = new window.google.maps.Marker({
        position: pos,
        map: mapObj.current,
        title: inc.message,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor:   '#EF4444',
          fillOpacity: 1,
          strokeColor: '#B91C1C',
          strokeWeight: 2,
        },
      });
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="font-size:13px;max-width:200px">
          <strong style="color:#DC2626">🚨 ${inc.type?.toUpperCase() || 'INCIDENT'}</strong>
          <p style="margin:4px 0">${inc.message}</p>
          <p style="color:#6B7280;font-size:11px">Room ${inc.room} · Floor ${inc.floor}</p>
        </div>`,
      });
      marker.addListener('click', () => {
        infoWindow.open(mapObj.current, marker);
      });
      markers.current.push(marker);
    });

    
    Object.entries(staffLocs).forEach(([uid, data]) => {
      if (!data?.location?.lat) return;
      const marker = new window.google.maps.Marker({
        position: { lat: data.location.lat, lng: data.location.lng },
        map: mapObj.current,
        title: data.location.name || 'Staff',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor:   '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#1D4ED8',
          strokeWeight: 2,
        },
      });
      markers.current.push(marker);
    });
  }, [incidents, staffLocs]);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100">
      <div className="bg-white px-4 py-2.5 border-b border-gray-100
                      flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          Live Responder Map
        </span>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span> Incident</span>
          <span> Staff</span>
        </div>
      </div>
      <div ref={mapRef} style={{ height: '340px', width: '100%' }} />
    </div>
  );
}