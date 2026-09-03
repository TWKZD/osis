import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Check, X, MessageCircleReply, Trash2, ChevronDown, ChevronUp, PieChart as PieChartIcon, Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSearchParams } from 'react-router-dom';

export default function AdminDashboard() {
  const { aspirations, updateAspirationStatus, addResponse, deleteAspiration, announcements, addAnnouncement, deleteAnnouncement, aiConfig, updateAiConfig } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'aspirasi';
  const setActiveTab = (tab: string) => setSearchParams({ tab });
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isMobileTabOpen, setIsMobileTabOpen] = useState(false);
  
  useEffect(() => {
    if (activeTab === 'ai') {
      setAiPersonality(aiConfig.personality);
      setAiKnowledge(aiConfig.knowledge);
      setAiProviders(aiConfig.providers || []);
    }
  }, [activeTab, aiConfig]);

  
  // Announcement form state
  const [madingTitle, setMadingTitle] = useState('');
  const [madingContent, setMadingContent] = useState('');
  const [isAddingMading, setIsAddingMading] = useState(false);

  // AI settings form state
  const [aiPersonality, setAiPersonality] = useState(aiConfig.personality);
  const [aiKnowledge, setAiKnowledge] = useState(aiConfig.knowledge);
  const [aiProviders, setAiProviders] = useState(aiConfig.providers || []);
  const [isSavingAi, setIsSavingAi] = useState(false);
  
  // New Provider form state
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [newProvider, setNewProvider] = useState({ name: '', baseUrl: '', apiKey: '', model: '' });

  // Pagination & Filtering state
  const [aspirationFilter, setAspirationFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [aspirationPage, setAspirationPage] = useState(1);
  const itemsPerPage = 20;

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



      {activeTab === 'aspirasi' ? (
        /* Aspirations List */
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 sm:px-8 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Daftar Aspirasi</h2>
            {/* Sub-tabs for Aspirasi */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setAspirationFilter('Pending'); setAspirationPage(1); }}
                className={cn("px-4 py-2 text-sm font-bold rounded-xl transition-all", aspirationFilter === 'Pending' ? "bg-amber-100 text-amber-800" : "bg-slate-50 text-slate-500 hover:bg-slate-100")}
              >
                Menunggu ({stats.pending})
              </button>
              <button
                onClick={() => { setAspirationFilter('Approved'); setAspirationPage(1); }}
                className={cn("px-4 py-2 text-sm font-bold rounded-xl transition-all", aspirationFilter === 'Approved' ? "bg-green-100 text-green-800" : "bg-slate-50 text-slate-500 hover:bg-slate-100")}
              >
                Disetujui ({stats.approved})
              </button>
              <button
                onClick={() => { setAspirationFilter('Rejected'); setAspirationPage(1); }}
                className={cn("px-4 py-2 text-sm font-bold rounded-xl transition-all", aspirationFilter === 'Rejected' ? "bg-red-100 text-red-800" : "bg-slate-50 text-slate-500 hover:bg-slate-100")}
              >
                Ditolak ({stats.rejected})
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100">
          {(() => {
            const filtered = aspirations.filter(a => a.status === aspirationFilter);
            const totalPages = Math.ceil(filtered.length / itemsPerPage);
            const paginated = filtered.slice((aspirationPage - 1) * itemsPerPage, aspirationPage * itemsPerPage);

            if (filtered.length === 0) {
              return <div className="p-12 text-center text-slate-500">Belum ada aspirasi di kategori ini.</div>;
            }

            return (
              <>
                {paginated.map((aspiration) => (
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
            ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="p-6 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Halaman {aspirationPage} dari {totalPages} ({filtered.length} aspirasi)
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAspirationPage(p => Math.max(1, p - 1))}
                        disabled={aspirationPage === 1}
                        className="px-4 py-2 text-sm font-bold bg-slate-100 text-slate-700 rounded-xl disabled:opacity-50 transition-all hover:bg-slate-200"
                      >
                        Sebelumnya
                      </button>
                      <button
                        onClick={() => setAspirationPage(p => Math.min(totalPages, p + 1))}
                        disabled={aspirationPage === totalPages}
                        className="px-4 py-2 text-sm font-bold bg-slate-100 text-slate-700 rounded-xl disabled:opacity-50 transition-all hover:bg-slate-200"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
          </div>
        </div>
      ) : activeTab === 'mading' ? (
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
      ) : activeTab === 'ai' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 sm:px-8 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Pengaturan Chatbot AI</h2>
            <p className="text-sm text-slate-500 mt-1">Ubah nama, kepribadian, dan pengetahuan tambahan untuk Chatbot OSIS.</p>
          </div>
          <div className="p-6 sm:px-8">
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSavingAi(true);
              await updateAiConfig({
                personality: aiPersonality,
                knowledge: aiKnowledge,
                providers: aiProviders
              });
              setIsSavingAi(false);
              alert("Pengaturan AI berhasil disimpan!");
            }} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Kepribadian & Instruksi (System Prompt)</label>
                <textarea
                  value={aiPersonality}
                  onChange={(e) => setAiPersonality(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all resize-y min-h-[120px]"
                  placeholder="Contoh: Kamu adalah OSIS ASISTEN..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Informasi Tambahan / Pengetahuan AI</label>
                <p className="text-xs text-slate-500 mb-2">Tambahkan fakta seputar sekolah, jadwal event, HUT, dll.</p>
                <textarea
                  value={aiKnowledge}
                  onChange={(e) => setAiKnowledge(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all resize-y min-h-[160px]"
                  placeholder="Contoh: HUT SMAN 1 Kemangkon diadakan setiap tanggal 12 Agustus..."
                />
              </div>
              <hr className="my-6 border-slate-200" />
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-bold text-slate-900">Konfigurasi API AI</label>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingProvider(!isAddingProvider)}
                    className="text-sm font-bold text-sky-600 hover:text-sky-700"
                  >
                    {isAddingProvider ? 'Batal Tambah' : '+ Tambah API Baru'}
                  </button>
                </div>
                
                {isAddingProvider && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 space-y-4">
                    <input type="text" placeholder="Nama Layanan (misal: Groq, OpenAI)" value={newProvider.name} onChange={e => setNewProvider({...newProvider, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                    <input type="text" placeholder="Base URL" value={newProvider.baseUrl} onChange={e => setNewProvider({...newProvider, baseUrl: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                    <input type="text" placeholder="API Key" value={newProvider.apiKey} onChange={e => setNewProvider({...newProvider, apiKey: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                    <input type="text" placeholder="Model (misal: openai/gpt-oss-20b)" value={newProvider.model} onChange={e => setNewProvider({...newProvider, model: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                    <button type="button" onClick={() => {
                      if (!newProvider.name || !newProvider.baseUrl || !newProvider.apiKey || !newProvider.model) {
                         alert('Harap isi semua kolom');
                         return;
                      }
                      setAiProviders([...aiProviders, { ...newProvider, id: Date.now().toString(), isActive: aiProviders.length === 0 }]);
                      setNewProvider({ name: '', baseUrl: '', apiKey: '', model: '' });
                      setIsAddingProvider(false);
                    }} className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800">
                      Simpan API
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {aiProviders.map(provider => (
                    <div key={provider.id} className={cn("p-4 rounded-xl border transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", provider.isActive ? "bg-sky-50 border-sky-200" : "bg-white border-slate-200")}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900">{provider.name}</h4>
                          {provider.isActive && <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-md font-bold">Aktif</span>}
                        </div>
                        <p className="text-xs text-slate-500 font-mono break-all">{provider.baseUrl}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">Model: {provider.model}</p>
                      </div>
                      <div className="flex gap-2">
                        {!provider.isActive && (
                          <button type="button" onClick={() => {
                            setAiProviders(aiProviders.map(p => ({ ...p, isActive: p.id === provider.id })));
                          }} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700">
                            Jadikan Aktif
                          </button>
                        )}
                        <button type="button" onClick={() => {
                          if (window.confirm('Hapus konfigurasi API ini?')) {
                            setAiProviders(aiProviders.filter(p => p.id !== provider.id));
                          }
                        }} className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                  {aiProviders.length === 0 && (
                     <p className="text-sm text-slate-500 text-center py-4">Belum ada konfigurasi API AI. Aplikasi akan menggunakan bawaan (default).</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingAi}
                  className="px-6 py-2.5 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-50"
                >
                  {isSavingAi ? "Menyimpan..." : "Simpan Pengaturan AI"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
