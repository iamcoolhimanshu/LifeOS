import React, { useState, useRef, useEffect } from 'react';
import { Send, X, RefreshCw, Sparkles, BrainCircuit, CornerDownRight, Mic, MicOff } from 'lucide-react';
import { useSearchStore } from '../stores/useSearchStore';

export const AIChatWidget: React.FC = () => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const chatMessages = useSearchStore((state) => state.chatMessages);
  const askChatbot = useSearchStore((state) => state.askChatbot);
  const clearChat = useSearchStore((state) => state.clearChat);
  const isChatLoading = useSearchStore((state) => state.isChatLoading);
  const setChatOpen = useSearchStore((state) => state.setChatOpen);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + ' ' : '') + transcript);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Try Chrome, Edge or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;

    const question = input.trim();
    setInput('');
    await askChatbot(question);
  };

  const handleQuickQuestion = async (q: string) => {
    if (isChatLoading) return;
    await askChatbot(q);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 h-[550px] bg-[#0c1222]/95 border border-slate-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden backdrop-blur-xl animate-fade-in">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-neonPurple to-cyberBlue shadow-[0_0_10px_rgba(0,229,255,0.3)]">
            <BrainCircuit size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">LifeOS AI Assistant</h3>
            <span className="text-[9px] text-cyberBlue font-medium flex items-center gap-1">
              <Sparkles size={8} /> Active Memory Engine
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearChat}
            title="Clear Chat History"
            className="text-slate-500 hover:text-slate-300 p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw size={14} />
          </button>
          <button 
            onClick={() => setChatOpen(false)}
            className="text-slate-500 hover:text-red-400 p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-custom">
        {chatMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-gradient-to-br from-neonPurple/80 to-purple-800 text-white rounded-tr-none'
                : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none shadow-sm'
            }`}>
              {/* Format bold tags and headers simply */}
              <p className="whitespace-pre-wrap">
                {msg.text.split('\n').map((line, i) => {
                  let formatted = line;
                  // Handle bullet points
                  if (formatted.startsWith('- ')) {
                    return <span key={i} className="block pl-2 py-0.5 text-slate-300">• {formatted.substring(2)}</span>;
                  }
                  // Handle AI summary highlights
                  return <span key={i} className="block">{formatted}</span>;
                })}
              </p>
            </div>
            <span className="text-[8px] text-slate-500 mt-1 pl-1 pr-1 font-semibold">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isChatLoading && (
          <div className="flex flex-col mr-auto max-w-[80%] items-start">
            <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-slate-300">
              <div className="flex items-center gap-1.5 py-1">
                <span className="h-1.5 w-1.5 bg-cyberBlue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-1.5 w-1.5 bg-cyberBlue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-1.5 w-1.5 bg-cyberBlue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {chatMessages.length === 1 && (
        <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/40">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Suggested Prompts</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Where is my resume?",
              "Summarize today's work.",
              "Show my Java developer notes.",
              "What invoices are stored?"
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleQuickQuestion(q)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-cyberBlue hover:border-cyberBlue/40 text-[10px] text-left transition-all duration-200"
              >
                <CornerDownRight size={8} />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <form 
        onSubmit={handleSend}
        className="p-3 bg-slate-950 border-t border-slate-900 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask anything about your stored files..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isChatLoading}
          className="flex-1 bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyberBlue/50 transition-all"
        />
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 ${
            isListening 
              ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' 
              : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
          }`}
          title={isListening ? "Listening... Click to stop" : "Speak to Assistant"}
        >
          {isListening ? <MicOff size={14} /> : <Mic size={14} />}
        </button>
        <button
          type="submit"
          disabled={isChatLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-tr from-neonPurple to-cyberBlue text-white shadow-md disabled:opacity-40 disabled:shadow-none hover:shadow-[0_0_10px_rgba(0,229,255,0.4)] transition-all duration-200 active:scale-95"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};
