import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-8 md:p-16 animate-fade">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
        >
          <ArrowLeft size={18} /> Voltar ao Início
        </Link>

        <header className="space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-3xl flex items-center justify-center">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">
            Termos de Utilização
          </h1>
          <p className="text-slate-500">Última atualização: Julho de 2024</p>
        </header>

        <article className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              1. Aceitação dos Termos
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Ao aceder ao sistema Intra IMEL, o utilizador concorda em cumprir estes termos de
              serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo
              cumprimento de todas as leis locais aplicáveis.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              2. Uso de Conta e Senha
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              O acesso ao sistema é pessoal e intransmissível. O utilizador é responsável por manter
              a confidencialidade da sua palavra-passe e por todas as atividades que ocorrem sob o
              seu número de processo.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              3. Conduta Institucional
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              É estritamente proibido o uso do sistema para atividades ilícitas, difamatórias ou que
              comprometam a integridade dos dados académicos de terceiros. Qualquer tentativa de
              fraude ou invasão resultará em processo disciplinar.
            </p>
          </section>

          <section className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-8">
            <p className="text-sm italic text-slate-400">
              Para mais informações sobre o uso ético da plataforma, contacte a Direção do IMEL.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default TermsPage;
