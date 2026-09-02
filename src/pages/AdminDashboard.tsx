import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Check, X, MessageCircleReply, Trash2, ChevronDown, ChevronUp, PieChart as PieChartIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminDashboard() {
  const { aspirations, updateAspirationStatus, addResponse, deleteAspiration, announcements, addAnnouncement, deleteAnnouncement } = useAppContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [activeTab, setActiveTab] = useState<'aspirasi' | 'mading'>('aspirasi');
  
  // Announcement form state
  const [madingTitle, setMadingTitle] = useState('');
  const [madingContent, setMadingContent] = useState('');
  const [isAddingMading, setIsAddingMading] = useState(false);

  const stats = {
    total: aspirations.length,
    pending: aspirations.filter(a => a.status === 'Pending').length,
    approved: aspirations.filter(a => a.status === 'Approved').length,
    rejected: aspirations.filter(a => a.status === 'Rejected').length,
  };

  // Prepare data for the chart
  const categoryCounts = aspirations.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(categoryCounts).map(key => ({
    name: key,
    value: categoryCounts[key]
  }));

  const COLORS = ['#38bdf8', '#fbbf24', '#34d399', '#f87171', '#818cf8'];

  const handleResponseSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    addResponse(id, responseText);
    setResponseText('');
    setExpandedId(null);
  };

  const handleMadingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!madingTitle.trim() || !madingContent.trim()) return;
    // We use a default author for simplicity since it's just 'osis123' logging in
    addAnnouncement(madingTitle, madingContent, 'Admin OSIS');
    setMadingTitle('');
    setMadingContent('');
    setIsAddingMading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Admin</h1>
        <p className="text-slate-500 mt-2">Kelola dan tanggapi aspirasi dari siswa dengan bijak.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <p className="text-sm font-semibold text-slate-500">Total Aspirasi</p>
          <p className="text-4xl font-extrabold text-slate-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-3xl shadow-sm border border-amber-100">
          <p className="text-sm font-semibold text-amber-600">Perlu Ditinjau</p>
          <p className="text-4xl font-extrabold text-amber-700 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-3xl shadow-sm border border-green-100">
          <p className="text-sm font-semibold text-green-600">Disetujui</p>
          <p className="text-4xl font-extrabold text-green-700 mt-2">{stats.approved}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-3xl shadow-sm border border-red-100">
          <p className="text-sm font-semibold text-red-600">Ditolak</p>
          <p className="text-4xl font-extrabold text-red-700 mt-2">{stats.rejected}</p>
        </div>
      </div>

      {/* Chart Section */}
      {aspirations.length > 0 && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-sky-500" />
            Distribusi Kategori Aspirasi
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl max-w-sm">
        <button
          onClick={() => setActiveTab('aspirasi')}
          className={cn(
            "w-full py-2.5 text-sm font-bold rounded-lg transition-all",
            activeTab === 'aspirasi' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Aspirasi Masuk
        </button>
        <button
          onClick={() => setActiveTab('mading')}
          className={cn(
            "w-full py-2.5 text-sm font-bold rounded-lg transition-all",
            activeTab === 'mading' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Kelola Mading
        </button>
      </div>

      {activeTab === 'aspirasi' ? (
        /* Aspirations List */
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 sm:px-8 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Daftar Aspirasi Terbaru</h2>
          </div>
          
          <div className="divide-y divide-slate-100">
          {aspirations.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Belum ada aspirasi masuk.</div>
          ) : (
            aspirations.map((aspiration) => (
              <div key={aspiration.id} className="p-6 sm:px-8 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        aspiration.status === 'Pending' ? "bg-amber-100 text-amber-800" :
                        aspiration.status === 'Approved' ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        {aspiration.status}
                      </span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {aspiration.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(aspiration.createdAt), { addSuffix: true, locale: localeId })}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug break-words">{aspiration.subject}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3 break-words">{aspiration.message}</p>
                    
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600">
                        {aspiration.isAnonymous ? '?' : aspiration.authorName?.charAt(0).toUpperCase()}
                      </div>
                      Dari: {aspiration.isAnonymous ? 'Anonim' : aspiration.authorName}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                    {aspiration.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => updateAspirationStatus(aspiration.id, 'Approved')}
                          className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-xl transition-colors text-sm font-bold"
                          title="Setujui (Tampil di Publik)"
                        >
                          <Check className="w-4 h-4" />
                          Setujui
                        </button>
                        <button
                          onClick={() => updateAspirationStatus(aspiration.id, 'Rejected')}
                          className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded-xl transition-colors text-sm font-bold"
                          title="Tolak"
                        >
                          <X className="w-4 h-4" />
                          Tolak
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => {
                        if (expandedId === aspiration.id) {
                          setExpandedId(null);
                        } else {
                          setExpandedId(aspiration.id);
                          setResponseText(aspiration.response || '');
                        }
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl transition-colors text-sm font-bold",
                        aspiration.response 
                          ? "bg-sky-100 text-sky-800 hover:bg-sky-200" 
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      )}
                    >
                      <MessageCircleReply className="w-4 h-4" />
                      {aspiration.response ? 'Edit Balasan' : 'Beri Balasan'}
                      {expandedId === aspiration.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Yakin ingin menghapus aspirasi ini?')) {
                          deleteAspiration(aspiration.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Section for Reply */}
                {expandedId === aspiration.id && (
                  <div className="mt-6 pt-6 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-slate-900 mb-2">Pesan Lengkap:</h4>
                      <div className="bg-slate-100 p-5 rounded-2xl text-sm text-slate-800 leading-relaxed break-words">
                        {aspiration.message}
                      </div>
                    </div>
                    
                    <form onSubmit={(e) => handleResponseSubmit(e, aspiration.id)}>
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Tanggapan OSIS
                      </label>
                      <textarea
                        rows={4}
                        value={responseText}
                        onChange={e => setResponseText(e.target.value)}
                        placeholder="Ketik tanggapan resmi dari OSIS di sini..."
                        className="w-full px-5 py-4 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none mb-4"
                      />
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(null)}
                          className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          Simpan Tanggapan
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Kelola Pengumuman Mading</h2>
            <button
              onClick={() => setIsAddingMading(!isAddingMading)}
              className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors text-sm"
            >
              {isAddingMading ? 'Batal Tambah' : '+ Buat Pengumuman'}
            </button>
          </div>

          {isAddingMading && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-2">
              <form onSubmit={handleMadingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Judul Pengumuman</label>
                  <input
                    type="text"
                    value={madingTitle}
                    onChange={(e) => setMadingTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    placeholder="Contoh: Jadwal Class Meeting 2026"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Isi Pengumuman</label>
                  <textarea
                    rows={5}
                    value={madingContent}
                    onChange={(e) => setMadingContent(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                    placeholder="Tulis detail pengumuman di sini..."
                    required
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Terbitkan Pengumuman
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {announcements.length === 0 ? (
                <div className="p-12 text-center text-slate-500">Belum ada pengumuman di mading.</div>
              ) : (
                announcements.map((announcement) => (
                  <div key={announcement.id} className="p-6 hover:bg-slate-50/50 transition-colors flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{announcement.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-2">{announcement.content}</p>
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true, locale: localeId })} oleh {announcement.author}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('Yakin ingin menghapus pengumuman ini?')) {
                          deleteAnnouncement(announcement.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
