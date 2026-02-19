
import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-8 md:p-16 animate-fade">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
          <ArrowLeft size={18} /> Voltar ao Início
        </Link>
        
        <header className="space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center">
            <Lock size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Política de Privacidade</h1>
          <p className="text-slate-500">Privacidade e Proteção de Dados Académicos</p>
        </header>

        <article className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Recolha de Dados</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              O Intra IMEL recolhe dados estritamente necessários para a gestão académica, incluindo nome, número de processo, notas, assiduidade e registos de acesso.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Segurança da Informação</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Implementamos protocolos de segurança modernos para garantir que as suas informações não sejam acedidas por pessoas não autorizadas. Todos os lançamentos de notas são auditados.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Direitos do Utilizador</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Alunos e Encarregados têm o direito de solicitar a retificação de dados incorretos através da Secretaria Académica presencialmente.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPage;
