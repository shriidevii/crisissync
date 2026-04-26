import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createIncident, updateIncidentTriage } from '../services/incidentService';
import { triageIncident } from '../services/geminiService';
import BroadcastBar from '../components/BroadcastBar';

const VENUE_ID = localStorage.getItem('crisisVenue') || 'venue_demo_001';

export default function GuestPortal() {
  const { user }                          = useAuth();
  const [message,      setMessage]        = useState('');
  const [room,         setRoom]           = useState('');
  const [floor,        setFloor]          = useState('');
  const [sent,         setSent]           = useState(false);
  const [loading,      setLoading]        = useState(false);
  const [status,       setStatus]         = useState('');
  const [listening,    setListening]      = useState(false);
  const [triageResult, setTriageResult]   = useState(null);
  const isFiringRef                       = useRef(false);

  // ── Voice SOS ──────────────────────────────────────────
  function startVoiceSOS() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input requires Chrome browser.');
      return;
    }
    const recognition           = new SR();
    recognition.lang            = 'en-IN';
    recognition.interimResults  = false;
    recognition.maxAlternatives = 1;
    recognition.onstart  = () => setListening(true);
    recognition.onend    = () => setListening(false);
    recognition.onerror  = () => setListening(false);
    recognition.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setMessage(prev => prev ? prev + ' ' + t : t);
    };
    recognition.start();
  }

  // ── SOS handler ────────────────────────────────────────
  async function handleSOS() {
    if (isFiringRef.current || !message.trim()) return;
    isFiringRef.current = true;
    setLoading(true);
    setStatus('');
    setTriageResult(null);

    try {
      // Step 1: Write to Firebase immediately
      console.log(' Creating incident...');
      const incidentId = await createIncident(VENUE_ID, {
        message:    message.trim(),
        room:       room  || 'Unknown',
        floor:      floor || 'Unknown',
        reportedBy: user?.uid || 'anonymous',
      });
      console.log('✓ Incident created:', incidentId);

      // Step 2: Show success to guest immediately
      setSent(true);
      setStatus('AI triage running...');

      // Step 3: Call Gemini AI triage
      console.log('Starting triage...');
      const triage = await triageIncident(message.trim());
      console.log('✓ Triage complete:', triage);

      // Step 4: Write triage back to Firebase
      await updateIncidentTriage(VENUE_ID, incidentId, triage);
      setTriageResult(triage);
      setStatus('Triage complete ✓');

    } catch (err) {
      console.error(' SOS error:', err);
      setStatus('Alert sent. Triage unavailable.');
    } finally {
      setLoading(false);
      setTimeout(() => { isFiringRef.current = false; }, 5000);
    }
  }

  // ── Panic mode — severity 4 or 5 triggers red screen ──
  const isCritical = triageResult && triageResult.severity >= 4;

  return (
    <div className="min-h-screen bg-gray-50">
      <BroadcastBar venueId={VENUE_ID} />

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2"></div>
          <h1 className="text-2xl font-bold text-gray-800">Emergency Report</h1>
          <p className="text-gray-500 text-sm mt-1">
            Help is on the way — fill in what you can
          </p>
        </div>

        {sent ? (
          /* ── CONFIRMATION SCREEN — PANIC MODE ── */
          <div className={`rounded-2xl p-8 text-center border-2
            transition-all duration-700
            ${isCritical
              ? 'bg-red-50 border-red-500 animate-pulse'
              : 'bg-green-50 border-green-200'}`}>

            <div className="text-5xl mb-4">
              {isCritical ? '' : ''}
            </div>

            <h2 className={`text-xl font-bold
              ${isCritical ? 'text-red-800' : 'text-green-800'}`}>
              {isCritical ? 'CRITICAL ALERT SENT!' : 'Alert Sent!'}
            </h2>

            <p className={`mt-2 font-medium
              ${isCritical ? 'text-red-700' : 'text-green-700'}`}>
              {isCritical
                ? ' Emergency services notified. Stay low. Await evacuation instructions.'
                : 'Staff have been notified. Stay calm and follow instructions above.'}
            </p>

            {/* AI Assessment card */}
            {triageResult && (
              <div className={`mt-4 rounded-xl p-3 text-left
                ${isCritical ? 'bg-red-100' : 'bg-white'}`}>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase
                  tracking-wide">
                   AI Assessment
                </p>
                <p className="text-sm font-bold text-gray-800 capitalize">
                  {triageResult.type} Incident
                  {' '}— Severity {triageResult.severity}/5
                  {' '}({Math.round(triageResult.confidence * 100)}% confidence)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {triageResult.summary}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-700
                    px-2 py-0.5 rounded-full font-medium">
                    Dispatching: {(triageResult.responderTeam || '').replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {status && (
              <p className={`text-xs mt-3 font-medium
                ${isCritical ? 'text-red-500' : 'text-green-500'}`}>
                {status}
              </p>
            )}

            <button
              onClick={() => {
                setSent(false); setMessage(''); setRoom('');
                setFloor(''); setStatus(''); setTriageResult(null);
              }}
              className="mt-6 text-sm text-gray-500 underline
                hover:text-gray-700">
              Report another emergency
            </button>
          </div>

        ) : (
          /* ── SOS FORM ── */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Room number"
                value={room}
                onChange={e => setRoom(e.target.value)}
                disabled={loading}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-red-400
                  disabled:opacity-50"
              />
              <input
                placeholder="Floor"
                value={floor}
                onChange={e => setFloor(e.target.value)}
                disabled={loading}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-red-400
                  disabled:opacity-50"
              />
            </div>

            {/* Voice SOS button */}
            <button
              type="button"
              onClick={startVoiceSOS}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2
                py-3 rounded-xl border text-sm font-medium transition-all
                disabled:opacity-50
                ${listening
                  ? 'bg-red-100 border-red-400 text-red-700 animate-pulse'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'}`}>
              <span className="text-lg">{listening ? '' : ''}</span>
              {listening ? 'Listening... speak now' : 'Tap to speak your emergency'}
            </button>

            <textarea
              placeholder="Or type — e.g. 'Smoke in corridor on floor 3'"
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={loading}
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                text-sm focus:outline-none focus:ring-2 focus:ring-red-400
                resize-none disabled:opacity-50"
            />

            <button
              onClick={handleSOS}
              disabled={loading || !message.trim()}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50
                disabled:cursor-not-allowed text-white font-bold py-5
                rounded-2xl text-xl transition-all active:scale-95
                shadow-lg shadow-red-200">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12"
                      r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Sending alert...
                </span>
              ) : '🆘 SEND SOS'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Your alert goes directly to hotel security and management
            </p>
          </div>
        )}
      </div>
    </div>
  );
}