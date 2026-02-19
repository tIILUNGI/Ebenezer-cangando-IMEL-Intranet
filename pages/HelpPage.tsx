import React, { useState } from 'react';
import { AI_KNOWLEDGE_BASE } from '../ai_knowledge_base';
import { HelpCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';

const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFAQs = AI_KNOWLEDGE_BASE.filter(item => 
    item.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-primary rounded-3xl flex items-center justify-center mx-auto">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Central de Ajuda</h1>
        <p className="text-slate-500 dark:text-slate-400">Encontre respostas rápidas para as suas dúvidas.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar dúvida..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm outline-none focus:border-primary dark:text-white font-medium"
        />
      </div>

      <div className="space-y-4">
        {filteredFAQs.map((faq, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all">
            <button 
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              {faq.q}
              {openIndex === index ? <ChevronUp size={18} className="text-primary" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>
            {openIndex === index && (
              <div className="px-6 pb-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed animate-fade">
                {faq.a}
              </div>
            )}
          </div>
        ))}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Nenhum resultado encontrado para "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpPage;