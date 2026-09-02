import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, Mail } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@osis.com'); // Default admin
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/pengurus/dashboard');
    } catch (err: any) {
      // Auto-bootstrap for the default admin account if it doesn't exist yet
      if ((err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') && email === 'admin@osis.com' && password === 'sangsaka2627') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          navigate('/pengurus/dashboard');
          return;
        } catch (createErr: any) {
          console.error("Gagal membuat akun admin:", createErr);
          setError(createErr.message || 'Gagal menyiapkan akun admin');
        }
      } else {
        setError('Kredensial salah atau tidak valid. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Papan Publik
        </Link>
        
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner overflow-hidden">
            <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" alt="Logo OSIS SMAN 1 Kemangkon" className="w-full h-full object-cover" />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Admin Login</h1>
            <p className="text-slate-500 text-sm">Masuk untuk mengelola Kotak Curhat OSIS</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Email Admin
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@osis.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-900"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-900"
                  autoFocus
                  required
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2 font-medium animate-in fade-in">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              {loading ? 'Memeriksa...' : 'Masuk ke Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
