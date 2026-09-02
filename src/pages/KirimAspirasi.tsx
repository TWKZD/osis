import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Send, User, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { AspirationCategory } from '../types';
import { cn } from '../lib/utils';

export default function KirimAspirasi() {
  const { addAspiration } = useAppContext();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<AspirationCategory>('Fasilitas');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authorName, setAuthorName] = useState('');

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    
    addAspiration({
      category,
      subject,
      message,
      isAnonymous,
      authorName: isAnonymous ? undefined : authorName,
    });
    
    setSubmitted(true);
    setTimeout(() => {
      navigate('/');
    }, 2500);
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto py-24 text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <Send className="w-10 h-10 ml-2" />
        </motion.div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Aspirasi Terkirim!</h2>
        <p className="text-slate-600 mb-8 text-lg">
          Terima kasih telah berkontribusi. Aspirasi kamu akan ditinjau oleh tim OSIS secepatnya.
        </p>
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-24 h-24 mx-auto"
        >
          <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788310116346-file_000000007ed881faae311454aeec136b.png" alt="Logo OSIS SMAN 1 Kemangkon" className="w-full h-full object-contain" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-4 mb-10"
      >
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Kirim Aspirasi</h1>
        <p className="text-lg text-slate-600">
          Ada keluhan, saran, atau ide seru? Jangan ragu untuk curhat ke OSIS!
        </p>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit} 
        className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-200 space-y-8"
      >
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">Kategori</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['Fasilitas', 'Akademik', 'Kegiatan', 'Lainnya'] as AspirationCategory[]).map(cat => (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "py-3 px-3 rounded-xl text-sm font-medium border transition-colors",
                  category === cat
                    ? "border-sky-600 bg-sky-50 text-sky-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-slate-50"
                )}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-slate-900 mb-3">
            Subjek / Ringkasan
          </label>
          <input
            id="subject"
            type="text"
            required
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Contoh: AC kelas rusak, Usulan lomba baru..."
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-slate-900 mb-3">
            Pesan / Curhatan
          </label>
          <textarea
            id="message"
            required
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Ceritakan lebih detail di sini..."
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all resize-none"
          />
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Kirim sebagai Anonim?</p>
              <p className="text-xs text-slate-500 mt-1">Nama kamu tidak akan dipublikasikan.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isAnonymous} 
                onChange={e => setIsAnonymous(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          {!isAnonymous && (
            <div className="mt-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <label htmlFor="authorName" className="block text-sm font-semibold text-slate-900 mb-2">
                Nama Lengkap (Opsional)
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="authorName"
                  type="text"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  placeholder="Masukkan nama kamu"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">
            Harap gunakan bahasa yang sopan dan tidak mengandung unsur SARA, ujaran kebencian, atau perundungan.
          </p>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
        >
          <Send className="w-5 h-5" />
          Kirim Aspirasi Sekarang
        </button>
      </motion.form>
    </div>
  );
}
