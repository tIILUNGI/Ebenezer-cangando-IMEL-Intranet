import React from 'react';
import { HelpCircle, ArrowLeft, Mail, Phone, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const SupportPage: React.FC = () => {
  const whatsappLink = 'https://wa.me/244938229459';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-8 md:p-16 animate-fade">
      <div className="max-w-4xl mx-auto space-y-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
        >
          <ArrowLeft size={18} /> Voltar ao Início
        </Link>

        <header className="space-y-4">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Suporte Técnico</h1>
          <p className="text-slate-500">
            Estamos aqui para ajudar com qualquer dificuldade de acesso ou utilização.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] space-y-6">
            <h2 className="text-xl font-black dark:text-white uppercase">Canais Diretos</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                <Mail className="text-primary" />
                <span>suporte@imel.edu.ao</span>
              </div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-slate-600 dark:text-slate-300"
              >
                <Phone className="text-primary" />
                <span>+244 938 229 459 (WhatsApp)</span>
              </a>
            </div>
          </div>

          <div className="p-8 bg-primary text-white rounded-[2.5rem] space-y-6">
            <h2 className="text-xl font-black uppercase">Problemas Comuns</h2>
            <ul className="space-y-2 text-sm opacity-90">
              <li>• Esqueci a minha palavra-passe</li>
              <li>• Erro ao visualizar pauta de notas</li>
              <li>• Meu número de processo não é reconhecido</li>
              <li>• Dificuldade em baixar arquivos da biblioteca</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-10 rounded-[3rem] text-center space-y-6">
          <MessageSquare className="mx-auto text-primary" size={48} />
          <h2 className="text-2xl font-black dark:text-white">Atendimento Presencial</h2>
          <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
            Caso o problema persista, dirija-se ao Gabinete de TI no Bloco B do IMEL, de Segunda a
            Sexta, das 08:00 às 15:00.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
