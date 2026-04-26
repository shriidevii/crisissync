import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInAnonymously,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

const VENUE_ID = 'venue_demo_001'; 

export default function Login() {
  const [mode, setMode]       = useState(null); // 'guest' | 'staff' | 'admin'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { setRole }           = useAuth();
  const navigate              = useNavigate();

  async function handleGuestLogin() {
    setLoading(true);
    setError('');
    try {
      await signInAnonymously(auth);
      setRole('guest');
      localStorage.setItem('crisisRole', 'guest');
      localStorage.setItem('crisisVenue', VENUE_ID);
      navigate('/guest');
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  async function handleStaffLogin(role, path) {
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setRole(role);
      localStorage.setItem('crisisRole', role);
      localStorage.setItem('crisisVenue', VENUE_ID);
      navigate(path);
    } catch (e) { setError('Invalid credentials. Check Firebase Auth users.'); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900
                    flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3"></div>
          <h1 className="text-3xl font-bold text-white">CrisisSync</h1>
          <p className="text-slate-400 mt-1">
            Hospitality Emergency Response Platform
          </p>
        </div>

        {!mode && (
          <div className="space-y-3">
            <button onClick={() => handleGuestLogin()}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold
                         py-4 rounded-2xl transition-colors text-lg">
               I am a Guest — Report Emergency
            </button>
            <button onClick={() => setMode('staff')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold
                         py-4 rounded-2xl transition-colors text-lg">
               Staff Login
            </button>
            <button onClick={() => setMode('admin')}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold
                         py-4 rounded-2xl transition-colors text-lg">
               Command Center Login
            </button>
          </div>
        )}

        {(mode === 'staff' || mode === 'admin') && (
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">
              {mode === 'staff' ? ' Staff Login' : ' Admin Login'}
            </h2>
            <input type="email" placeholder="Email"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5
                         text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input type="password" placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5
                         text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              onClick={() => handleStaffLogin(
                mode, mode === 'staff' ? '/staff' : '/admin'
              )}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg
                         font-medium hover:bg-blue-500 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <button onClick={() => setMode(null)}
              className="w-full text-gray-400 text-sm hover:text-gray-600">
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export { VENUE_ID };