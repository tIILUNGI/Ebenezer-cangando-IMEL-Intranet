import React, { useState } from 'react';
import { useSystemAdmin, useSettings } from '../App';
import { Palette, Globe, Save, RefreshCw, AlertCircle, X } from 'lucide-react';
import {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SECONDARY_COLOR,
  DEFAULT_SCHOOL_NAME,
  DEFAULT_SCHOOL_ACRONYM,
} from '../constants';
import { updateSettings as apiUpdateSettings } from '../src/api/index';

const BrandingPage: React.FC = () => {
  const { settings, updateSettings } = useSystemAdmin();
  const { t } = useSettings();
  const [formData, setFormData] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetReady, setResetReady] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiUpdateSettings(formData);
    } catch (err) {
      console.warn('API update failed, using local');
    }
    updateSettings(formData);
    setIsSaving(false);
  };

  const handleReset = () => {
    if (
      confirm('Deseja resetar todas as definições para os valores originais de fábrica do sistema?')
    ) {
      const resetData = {
        ...formData,
        schoolName: DEFAULT_SCHOOL_NAME,
        schoolAcronym: DEFAULT_SCHOOL_ACRONYM,
        primaryColor: DEFAULT_PRIMARY_COLOR,
        secondaryColor: DEFAULT_SECONDARY_COLOR,
      };
      setFormData(resetData);
      updateSettings(resetData);
    }
  };

  const handleResetLocalData = () => {
    if (!resetReady) {
      setResetReady(true);
      return;
    }
    setShowConfirm(true);
  };

  const confirmReset = () => {
    const keys = Object.keys(localStorage).filter(
      (k) => k.startsWith('imel_db_') || k === 'imel_user'
    );
    keys.forEach((k) => localStorage.removeItem(k));
    window.location.hash = '#/login';
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <Palette className="text-primary" />
          Marca do Sistema
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Configure a identidade visual e o nome da instituição para todos os utilizadores.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Globe size={20} className="text-primary" /> Instituição
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Nome Completo da Escola
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Sigla / Nome Curto
              </label>
              <input
                type="text"
                value={formData.schoolAcronym}
                onChange={(e) => setFormData({ ...formData, schoolAcronym: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Palette size={20} className="text-primary" /> Cores do SIG
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200">Cor Primária</p>
                <p className="text-[10px] text-slate-400">Barra lateral e elementos principais.</p>
              </div>
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200">Cor Secundária</p>
                <p className="text-[10px] text-slate-400">Destaques e ícones secundários.</p>
              </div>
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20 flex items-start gap-4">
        <AlertCircle className="text-primary shrink-0" size={24} />
        <div>
          <p className="font-bold text-primary tracking-tight">Alterações em Tempo Real</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            As mudanças de cores e nomes refletem instantaneamente no cabeçalho, barra lateral e em
            todas as telas.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:flex-1 bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="animate-spin" /> : <Save />}
          Aplicar Definições
        </button>
        <button
          onClick={handleReset}
          className="w-full sm:w-auto px-8 py-5 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          Resetar Padrão Original
        </button>
        <button
          onClick={() => setShowReset(!showReset)}
          className="w-full sm:w-auto px-8 py-5 border border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all"
        >
          Resetar Dados Locais
        </button>
      </div>

      {showReset && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-3xl space-y-3">
          <p className="font-bold text-red-700">
            Atenção: isto apaga todos os dados locais (utilizadores, mensagens, biblioteca, etc).
          </p>
          <p className="text-sm text-red-600">Depois de apagar, não há como recuperar.</p>
          <button
            onClick={handleResetLocalData}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold"
          >
            {resetReady ? 'Confirmar Reset Local' : 'Clique de Novo para Confirmar'}
          </button>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 bg-red-600 text-white flex items-center justify-between">
              <h3 className="text-lg font-black">Confirmação Final</h3>
              <button onClick={() => setShowConfirm(false)}>
                <X />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-slate-700 dark:text-slate-200 font-bold">
                Esta ação vai apagar TODOS os dados locais.
              </p>
              <p className="text-slate-500">Não poderá recuperar depois.</p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold"
                >
                  Apagar Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandingPage;
