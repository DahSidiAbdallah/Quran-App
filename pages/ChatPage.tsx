import useLocalStorage from '../hooks/useLocalStorage';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeftIcon, SendIcon } from '../components/Icons';

const ChatPage = () => {
    useLocalStorage<'en' | 'ar' | 'fr'>('appLang', 'en');
    const navigate = useNavigate();
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
            if (!apiKey) {
                throw new Error("Gemini API key not configured. Set GEMINI_API_KEY in your environment.");
            }
            const ai = new GoogleGenAI({ apiKey: apiKey });
            const chatSession = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: 'You are a helpful and knowledgeable Islamic scholar assistant. Answer questions about the Quran and Islam respectfully, accurately, and in a way that is easy to understand. Keep your answers concise unless asked for detail.'
                }
            });
            setChat(chatSession);
            setMessages([{ id: uuidv4(), role: 'model', text: 'As-salamu alaykum! How can I help you today? Feel free to ask me anything about the Quran or Islam.' } as any]);
        } catch (e: any) {
            console.error("Failed to initialize Gemini AI:", e);
            setError("Could not initialize the AI assistant. Please ensure the API key is configured correctly.");
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
    if (!input.trim() || !chat || isLoading) return;

    const userMessage: ChatMessage & { id: string } = { id: uuidv4(), role: 'user', text: input } as any;
    setMessages(prev => [...prev, userMessage as any]);
        setInput('');
        setIsLoading(true);
        setError(null);
        
        try {
            const stream = await chat.sendMessageStream({ message: input });
            
            let modelResponse = '';
            setMessages(prev => [...prev, { id: uuidv4(), role: 'model', text: '' } as any]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    if (prev.length === 0) return prev;
                    const newMessages = prev.slice();
                    const lastIndex = newMessages.length - 1;
                    newMessages[lastIndex] = { ...newMessages[lastIndex], text: modelResponse };
                    return newMessages;
                });
            }
        } catch (e) {
            console.error("Error sending message to Gemini:", e);
            setError("Sorry, I encountered an error. Please try again.");
            setMessages(prev => [...prev, { id: uuidv4(), role: 'model', text: 'Apologies, I could not process your request.' } as any]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 bg-slate-50 dark:bg-gray-900">
            <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 shadow-sm">
                <div className="flex items-center gap-4 p-4">
                    <button onClick={() => navigate('/')} className="text-brand-dark dark:text-gray-300"><ArrowLeftIcon /></button>
                    <div>
                        <h1 className="text-lg font-bold text-brand-dark dark:text-white">AI Assistant</h1>
                        <p className="text-xs text-brand-cyan">Online</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-cyan text-white rounded-br-lg' : 'bg-white dark:bg-gray-800 text-brand-dark dark:text-gray-200 rounded-bl-lg shadow-sm'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 text-brand-dark dark:text-gray-200 rounded-bl-lg shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce delay-200"></span>
                                <span className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce delay-300"></span>
                            </div>
                         </div>
                    </div>
                )}
                {error && <p className="text-center text-red-500">{error}</p>}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a question..."
                        className="w-full pl-4 pr-4 py-3 bg-slate-100 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-brand-cyan text-white rounded-lg disabled:bg-cyan-300 disabled:cursor-not-allowed"
                    >
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ChatPage;