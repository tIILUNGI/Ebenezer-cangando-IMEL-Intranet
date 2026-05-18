import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useDatabase } from '../App';
import {
  fetchLibrary,
  uploadLibraryResource,
  incrementLibraryDownload,
  deleteLibraryResource,
} from '../src/api/index';
import {
  Download,
  FileText,
  PlayCircle,
  Search,
  Plus,
  X,
  Upload,
  FileArchive,
  BookOpen,
  Filter,
} from 'lucide-react';
import { UserRole } from '../types';
import Swal from 'sweetalert2';
import gsap from 'gsap';

const LibraryPage: React.FC = () => {
  const {
    library,
    addLibraryResource,
    incrementLibraryDownloads,
    deleteLibraryResource: localDelete,
    replaceLibrary,
  } = useDatabase();
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({ subject: '', type: '' });
  const gridRef = useRef<HTMLDivElement>(null);

  const [newRes, setNewRes] = useState({
    title: '',
    subject: '',
    type: 'PDF' as any,
    size: '0MB',
    fileName: '',
    mimeType: '',
    dataUrl: '',
  });

  const isProfessor = user?.role === UserRole.PROFESSOR || user?.role === UserRole.ADMIN;
  const userRole = user?.role;
  const userTurma = user?.turma;

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.children;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [library]);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await fetchLibrary();
      replaceLibrary(data);
    } catch (err) {
      console.warn('Using cached library');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownload = async (id: string) => {
    const resource = library.find((r) => r.id === id);
    if (!resource) return;

    try {
      await incrementLibraryDownload(id);
    } catch (err) {
      /* fallback */
    }
    incrementLibraryDownloads(id);

    const content =
      resource.dataUrl ||
      `data:text/plain;charset=utf-8,${encodeURIComponent(`Arquivo gerado localmente: ${resource.title}`)}`;
    const fileName =
      resource.fileName || `${resource.title}.${(resource.type || 'PDF').toLowerCase()}`;
    const link = document.createElement('a');
    link.href = content;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Limite de 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewRes((prev) => ({
        ...prev,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        dataUrl: String(reader.result || ''),
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      }));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRes.dataUrl || !newRes.fileName) {
      setError('Selecione um arquivo para publicar.');
      return;
    }

    setError('');

    const resourceData = {
      title: newRes.title,
      subject: newRes.subject,
      type: newRes.type,
      size: newRes.size,
      fileName: newRes.fileName,
      mimeType: newRes.mimeType,
      dataUrl: newRes.dataUrl,
      author: user?.name || 'Desconhecido',
      authorId: user?.id || '0',
      turmaTarget: user?.turma || 'Todas',
    };

    try {
      // Try API upload first
      const formData = new FormData();
      formData.append('title', newRes.title);
      formData.append('subject', newRes.subject);
      formData.append('type', newRes.type);

      const base64Response = await fetch(newRes.dataUrl);
      const blob = await base64Response.blob();
      formData.append('file', blob, newRes.fileName);

      await uploadLibraryResource(formData);
    } catch (apiErr) {
      console.warn('API upload failed, saving locally', apiErr);
    }

    addLibraryResource(resourceData);
    Swal.fire({
      icon: 'success',
      title: 'Publicado!',
      text: 'Recurso adicionado à biblioteca com sucesso.',
      timer: 2000,
      showConfirmButton: false,
    });
    setShowUpload(false);
    setNewRes({
      title: '',
      subject: '',
      type: 'PDF',
      size: '0MB',
      fileName: '',
      mimeType: '',
      dataUrl: '',
    });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação removerá o recurso permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await deleteLibraryResource(id);
      } catch (err) {
        console.warn('API delete failed', err);
      }
      localDelete(id);
      Swal.fire({
        icon: 'success',
        title: 'Removido!',
        text: 'Recurso removido com sucesso.',
        timer: 1500,
      });
    }
  };

  const filteredLibrary = library.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = !filters.subject || r.subject === filters.subject;
    const matchType = !filters.type || r.type === filters.type;
    
    // Turma filtering: only for students, show resources for their turma, "Todas", or resources without turmaTarget
    let matchTurma = true;
    if (userRole === UserRole.ALUNO && userTurma) {
      matchTurma = r.turmaTarget === userTurma || r.turmaTarget === 'Todas' || !r.turmaTarget;
    }
    
    return matchSearch && matchSubject && matchType && matchTurma;
  });

  const subjects = Array.from(new Set(library.map((r) => r.subject).filter(Boolean)));
  const types = Array.from(new Set(library.map((r) => r.type).filter(Boolean)));

  // Placeholder URL generator for resource type
  const getPlaceholderUrl = (type: string) => {
    // Using placeholder.com service with type text
    return `https://via.placeholder.com/150x200/${type === 'PDF' ? '2563eb' : type === 'DOC' ? '16a34a' : type === 'VIDEO' ? 'ea580c' : type === 'ZIP' ? '7c3aed' : '6b7280'}/ffffff?text=${type}`;
  };

  return (
    <>
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .library-grid { 
              grid-template-columns: repeat(3, 1fr) !important; 
              gap: 10px !important; 
              width: 100% !important;
              max-width: 1000px !important;
              margin: 0 auto !important;
            }
            .library-card { 
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            body {
              background: white !important;
              color: black !important;
            }
          }
        `}
      </style>
      <div className="space-y-8 animate-fade">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <BookOpen className="text-primary" /> Biblioteca Digital IMEL
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Repositório oficial de livros, pautas e manuais do curso.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Pesquisar manuais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-64 shadow-sm outline-none focus:border-primary dark:text-white text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none dark:text-white"
              >
                <option value="">Todas Matérias</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none dark:text-white"
              >
                <option value="">Todos Tipos</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            {isProfessor && (
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-all"
              >
                <Plus size={18} /> Publicar
              </button>
            )}
          </div>
        </div>

        {isRefreshing && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full border-4 border-slate-200 border-t-primary h-8 w-8"></div>
            <p className="text-sm text-slate-400 mt-2">Sincronizando biblioteca...</p>
          </div>
        )}

        {showUpload && (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-md animate-fade mb-8 max-w-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <BookOpen className="text-primary" /> Publicar Novo Recurso
              </h3>
              <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                  Nome do Documento
                </label>
                <input
                  required
                  value={newRes.title}
                  onChange={(e) => setNewRes({ ...newRes, title: e.target.value })}
                  type="text"
                  placeholder="Ex: Manual de Redes"
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                    Componente
                  </label>
                  <select
                    required
                    value={newRes.subject}
                    onChange={(e) => setNewRes({ ...newRes, subject: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white text-sm"
                  >
                    <option value="">Selecionar...</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="Geral">Manual Institucional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                    Tipo
                  </label>
                  <select
                    value={newRes.type}
                    onChange={(e) => setNewRes({ ...newRes, type: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white text-sm"
                  >
                    <option value="PDF">PDF</option>
                    <option value="ZIP">ZIP</option>
                    <option value="DOC">DOC / Word</option>
                    <option value="VIDEO">Vídeo</option>
                  </select>
                </div>
              </div>
              <div className="border-4 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-900/50">
                <Upload className="mx-auto text-slate-300 mb-2" size={28} />
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">
                  Anexar Documento (máx. 10MB)
                </p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="text-xs w-full cursor-pointer text-slate-500"
                  accept=".pdf,.doc,.docx,.zip,.mp4,.txt"
                />
                {newRes.fileName && (
                  <p className="text-[11px] text-emerald-500 font-bold mt-2">
                    ✅ {newRes.fileName}
                  </p>
                )}
                {error && <p className="text-[11px] text-red-500 font-bold mt-2">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"
              >
                Publicar na Biblioteca
              </button>
            </form>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" ref={gridRef}>
          {filteredLibrary.map((res) => (
            <div
              key={res.id}
              className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 group hover:border-primary transition-all max-w-full"
            >
              <div className="h-40 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-slate-300 group-hover:bg-primary/5 transition-colors relative">
                {res.type === 'VIDEO' ? (
                  <PlayCircle size={40} className="group-hover:text-primary transition-colors" />
                ) : res.type === 'ZIP' ? (
                  <FileArchive size={40} className="group-hover:text-primary transition-colors" />
                ) : res.type === 'DOC' ? (
                  <FileText size={40} className="group-hover:text-primary transition-colors" />
                ) : (
                  <FileText size={40} className="group-hover:text-primary transition-colors" />
                )}
                <span className="absolute top-3 left-3 text-[8px] font-black bg-primary text-white px-2 py-0.5 rounded uppercase">
                  {res.type}
                </span>
                <span className="absolute bottom-3 right-3 text-[8px] font-bold bg-white/90 dark:bg-slate-700/90 px-2 py-0.5 rounded text-slate-500">
                  {res.size}
                </span>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary dark:text-secondary">
                    {res.subject}
                  </span>
                  <span className="text-[8px] text-slate-400">{res.date}</span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-1 text-sm leading-tight line-clamp-2">
                  {res.title}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-3">
                  Autor: {res.author}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-bold text-slate-300 uppercase">
                    ⬇ {res.downloads || 0}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDownload(res.id)}
                      className="flex-1 py-2 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[9px] uppercase tracking-wider group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center gap-1"
                    >
                      <Download size={12} /> Baixar
                    </button>
                    {isProfessor && (
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Remover"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredLibrary.length === 0 && (
            <div className="col-span-full text-center py-16">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-400 font-bold">Nenhum recurso encontrado na biblioteca.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LibraryPage;