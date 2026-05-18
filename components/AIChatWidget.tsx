import React, { useState, useMemo } from 'react';
import { BrainCircuit } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAuth, useDatabase } from '../App';
import { UserRole } from '../types';

const AIChatWidget: React.FC = () => {
  const { user, activeStudent } = useAuth();
  const { grades } = useDatabase();
  const [chatOpen, setChatOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const currentGrades = useMemo(
    () => grades.filter((g) => g.studentId === activeStudent?.id),
    [grades, activeStudent]
  );
  const avgGrade =
    currentGrades.length > 0
      ? (
          currentGrades.reduce((acc, g) => acc + (g.t1.average || 0), 0) / currentGrades.length
        ).toFixed(1)
      : '0.0';
  const totalFaltas = currentGrades.reduce((acc, g) => acc + g.faltas, 0);

  const askAiAboutSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setIsAiLoading(true);
    const question = aiQuestion.trim();
    setChatMessages((prev) => [...prev, { role: 'user', text: question }]);
    setAiQuestion('');

    const roleContext = user ? `${user.role} (${user.name})` : 'Utilizador';
    const studentContext =
      user?.role === UserRole.ALUNO || user?.role === UserRole.ENCARREGADO
        ? `Aluno: ${activeStudent?.name || 'N/A'}, Media: ${avgGrade}, Faltas: ${totalFaltas}.`
        : '';

    try {
      if (!geminiApiKey) throw new Error('Chave GEMINI_API_KEY em falta.');
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é assistente do sistema escolar IMEL. Responda de forma curta e prática. Perfil: ${roleContext}. ${studentContext} Pergunta do utilizador: ${question}`,
      });
       setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: (response as any).text || 'Sem resposta no momento.' },
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Não foi possível consultar a IA agora. Verifique a chave VITE_GEMINI_API_KEY.',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-all z-50"
        title="Abrir Chat IA"
      >
        <BrainCircuit size={28} />
      </button>

      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <h3 className="text-lg font-black flex items-center gap-2">
                <BrainCircuit size={18} /> Chat IA
              </h3>
              <button onClick={() => setChatOpen(false)} className="text-white font-black">
                Fechar
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {chatMessages.length === 0 ? (
                <p className="text-slate-400">
                  Faça uma pergunta, por exemplo: "de acordo às minhas notas como estou".
                </p>
              ) : (
                chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl ${m.role === 'user' ? 'bg-blue-50 text-slate-800' : 'bg-emerald-50 text-slate-800'}`}
                  >
                    <p className="text-xs font-black uppercase mb-1">
                      {m.role === 'user' ? 'Você' : 'IA'}
                    </p>
                    <p className="text-sm leading-relaxed">{m.text}</p>
                  </div>
                ))
              )}
            </div>
            <form
              onSubmit={askAiAboutSystem}
              className="p-4 border-t border-slate-100 dark:border-slate-700 flex gap-2"
            >
              <input
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Digite sua pergunta..."
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-sm"
              />
              <button
                type="submit"
                disabled={isAiLoading}
                className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-60"
              >
                {isAiLoading ? 'A processar...' : 'Enviar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
