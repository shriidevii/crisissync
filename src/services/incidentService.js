import { db } from '../firebase';
import {
  ref, push, set, onValue,
  serverTimestamp, update
} from 'firebase/database';


export async function createIncident(venueId, data) {
  const incidentsRef = ref(db, `incidents/${venueId}`);
  const newRef = push(incidentsRef);
  await set(newRef, {
    ...data,
    status: 'active',
    timestamp: serverTimestamp(),
    severity: 0,      
    type: 'unknown',   
  });
  return newRef.key;
}

export function listenToIncidents(venueId, callback) {
  const incidentsRef = ref(db, `incidents/${venueId}`);
  return onValue(incidentsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) { callback([]); return; }
    const list = Object.entries(data).map(([id, val]) => ({
      id,
      ...val,
    }));
    
    list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    callback(list);
  });
}


export async function updateIncidentStatus(venueId, incidentId, status) {
  const incidentRef = ref(db, `incidents/${venueId}/${incidentId}`);
  await update(incidentRef, { status });
}


export async function sendBroadcast(venueId, message) {
  const broadcastRef = ref(db, `broadcasts/${venueId}`);
  await set(broadcastRef, {
    message,
    timestamp: serverTimestamp(),
  });
}


export function listenToBroadcast(venueId, callback) {
  const broadcastRef = ref(db, `broadcasts/${venueId}`);
  return onValue(broadcastRef, (snapshot) => {
    callback(snapshot.val());
  });
}

export async function updateIncidentTriage(venueId, incidentId, triage) {
  const incidentRef = ref(db, `incidents/${venueId}/${incidentId}`);
  await update(incidentRef, {
    type:               triage.type,
    severity:           triage.severity,
    responderTeam:      triage.responderTeam,
    confidence:         triage.confidence,
    broadcastSuggestion: triage.broadcastSuggestion,
    summary:            triage.summary,
    triaged:            true,
  });
}