import uiT from '../locales';
import useLocalStorage from '../hooks/useLocalStorage';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SettingsContext } from '../contexts/SettingsContext';
import { ArrowLeftIcon, ChevronRightIcon, MoonIcon, SunIcon, UserIcon } from '../components/Icons';
import { Edition } from '../types';
import { fetchEditions } from '../services/quranApi';

const SettingsSelect = ({ label, value, onChange, options }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: Edition[] }) => (
    <div className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 sepia-card-bg rounded-lg shadow-sm">
        <span className="font-semibold text-brand-dark dark:text-gray-200 sepia-text">{label}</span>
        <select value={value} onChange={onChange} className="bg-transparent dark:bg-gray-800 sepia-card-bg text-right text-brand-gray dark:text-gray-400 sepia-text-light focus:outline-none max-w-[60%]">
            {options.map(o => <option key={o.identifier} value={o.identifier}>{o.englishName}</option>)}
        </select>
    </div>
);

const SettingsSlider = ({ label, value, onChange, min, max, step }: { label: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, min: number, max: number, step: number }) => (
    <div className="w-full p-4 bg-white dark:bg-gray-800 sepia-card-bg rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-brand-dark dark:text-gray-200 sepia-text">{label}</span>
            <span className="text-sm text-brand-gray dark:text-gray-400 sepia-text-light">{value}px</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full" />
    </div>
);

const SettingsPage = () => {
    const [appLang] = useLocalStorage<'en' | 'ar' | 'fr'>('appLang', 'en');
    const navigate = useNavigate();
    const { settings, setSetting } = useContext(SettingsContext);
    const [editions, setEditions] = useState<{ reciters: Edition[], translations: Edition[], tafsirs: Edition[] }>({ reciters: [], translations: [], tafsirs: [] });

    useEffect(() => {
        const loadEditions = async () => {
            const [reciters, translations, tafsirs] = await Promise.all([
                fetchEditions('audio'),
                fetchEditions('translation'),
                fetchEditions('tafsir'),
            ]);
            setEditions({ reciters, translations, tafsirs });
        };
        loadEditions();
    }, []);

    return (
        <div className="flex flex-col flex-1 bg-brand-light dark:bg-gray-900 sepia-bg">
            <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 sepia-bg/80 backdrop-blur-sm z-10 shadow-sm">
                <div className="flex items-center gap-4 p-4">
                    <button onClick={() => navigate('/')} className="text-brand-dark dark:text-gray-300 sepia-text"><ArrowLeftIcon /></button>
                    <h1 className="text-lg font-bold text-brand-dark dark:text-white sepia-text">Settings</h1>
                </div>
            </header>

            <main className="p-4 space-y-6 overflow-y-auto">
                <div>
                    <h2 className="px-2 pb-2 text-sm font-semibold text-brand-gray dark:text-gray-500 sepia-text-light">Appearance</h2>
                    <div className="bg-white dark:bg-gray-800 sepia-card-bg rounded-lg p-2 flex gap-1 shadow-sm">
                        {(['light', 'dark', 'sepia'] as const).map(theme => (
                            <button key={theme} onClick={() => setSetting('theme', theme)} className={`w-1/3 py-2 rounded-md font-semibold capitalize transition-colors ${settings.theme === theme ? 'bg-brand-cyan text-white shadow' : 'text-brand-gray dark:text-gray-400 sepia-text'}`}>
                                {theme}
                            </button>
                        ))}
                    </div>
                </div>

                 <div>
                    <h2 className="px-2 pb-2 text-sm font-semibold text-brand-gray dark:text-gray-500 sepia-text-light">Reading Preferences</h2>
                     <div className="space-y-2">
                        {editions.reciters.length > 0 && <SettingsSelect label="Reciter" value={settings.reciter} onChange={(e) => setSetting('reciter', e.target.value)} options={editions.reciters} />}
                        {editions.translations.length > 0 && <SettingsSelect label="Translation" value={settings.translation} onChange={(e) => setSetting('translation', e.target.value)} options={editions.translations} />}
                        {editions.tafsirs.length > 0 && <SettingsSelect label="Tafsir" value={settings.tafsir} onChange={(e) => setSetting('tafsir', e.target.value)} options={editions.tafsirs} />}
                    </div>
                </div>

                <div>
                    <h2 className="px-2 pb-2 text-sm font-semibold text-brand-gray dark:text-gray-500 sepia-text-light">Font Customization</h2>
                    <div className="space-y-2">
                        <SettingsSlider label="Translation Font Size" value={settings.translationFontSize} onChange={e => setSetting('translationFontSize', parseInt(e.target.value))} min={12} max={22} step={1} />
                        <SettingsSlider label="Arabic Font Size" value={settings.arabicFontSize} onChange={e => setSetting('arabicFontSize', parseInt(e.target.value))} min={20} max={40} step={1} />
                        <div className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 sepia-card-bg rounded-lg shadow-sm">
                            <span className="font-semibold text-brand-dark dark:text-gray-200 sepia-text">Arabic Font</span>
                            <select value={settings.arabicFont} onChange={e => setSetting('arabicFont', e.target.value as 'amiri' | 'naskh')} className="bg-transparent dark:bg-gray-800 sepia-card-bg text-right text-brand-gray dark:text-gray-400 sepia-text-light focus:outline-none">
                               <option value="amiri">Amiri (Serif)</option>
                               <option value="naskh">Naskh (Sans-serif)</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h2 className="px-2 pb-2 text-sm font-semibold text-brand-gray dark:text-gray-500 sepia-text-light">Account</h2>
                    <Link to="/profile" className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 sepia-card-bg rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                            <UserIcon className="w-6 h-6 text-brand-cyan" />
                            <span className="font-semibold text-brand-dark dark:text-gray-200 sepia-text">Profile</span>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-brand-gray dark:text-gray-400 sepia-text-light" />
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;