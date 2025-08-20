import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Surah } from '../types';
import uiT from '../locales';
import { fetchSurahs } from '../services/quranApi';
import { SearchIcon, CloseIcon } from '../components/Icons';
import Fuse from 'fuse.js';
import LoadingSpinner from '../components/LoadingSpinner';
import useLocalStorage from '../hooks/useLocalStorage';
import { JUZ_DATA, HIZB_DATA } from '../constants';

import starImg from '../assets/star.png';
const NumberingWrapper = ({ number }: { number: string | number }) => (
    <div className="relative w-14 h-14 flex items-center justify-center">
        <img
            src={starImg}
            alt="star"
            className="absolute w-full h-full object-contain z-0 pointer-events-none select-none"
            draggable={false}
        />
        <span className="font-bold text-brand-cyan text-lg z-10 select-none" style={{fontFamily: 'Poppins, sans-serif'}}>{number}</span>
    </div>
);

type Lang = 'en' | 'ar' | 'fr';
const SurahListItem = ({ surah, appLang, searchTerm }: { surah: Surah, appLang: Lang, searchTerm?: string }) => {
    const highlight = (text: string, term?: string) => {
        if (!term) return text;
        const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
        const parts = text.split(re);
        return parts.map((part, i) => {
            const key = `${part}-${i}`;
            return re.test(part) ? <mark key={key} className="bg-yellow-200 dark:bg-yellow-600 text-black px-0">{part}</mark> : <span key={key}>{part}</span>;
        });
    };

    return (
    <Link to={`/surah/${surah.number}`} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 focus:outline-none focus-visible:ring-4">
        <div className="flex items-center gap-4">
            <NumberingWrapper number={surah.number} />
            <div>
                <h3 className="font-bold text-brand-dark dark:text-white">{highlight(surah.englishName, searchTerm)}</h3>
                <p className="text-xs text-brand-gray dark:text-gray-500 uppercase">{surah.revelationType} &bull; {surah.numberOfAyahs} {uiT[appLang].surah}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-2xl font-serif text-brand-teal">{highlight(surah.name, searchTerm)}</p>
        </div>
    </Link>
    );
};

const JuzListItem = ({ juz, appLang }: { juz: typeof JUZ_DATA[0], appLang: Lang }) => (
    <Link to={`/surah/${juz.surah}#ayah-${juz.ayah}`} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
        <div className="flex items-center gap-4">
            <NumberingWrapper number={juz.juz} />
            <div>
                <h3 className="font-bold text-brand-dark dark:text-white">{uiT[appLang].juz} {juz.juz}</h3>
                <p className="text-xs text-brand-gray dark:text-gray-500 uppercase">{uiT[appLang].surah} {juz.surahName} {juz.ayah}</p>
            </div>
        </div>
    </Link>
);

const HizbListItem = ({ hizb, appLang }: { hizb: typeof HIZB_DATA[0], appLang: Lang }) => (
    <Link to={`/surah/${hizb.surah}#ayah-${hizb.ayah}`} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
        <div className="flex items-center gap-4">
            <NumberingWrapper number={hizb.hizb} />
            <div>
                <h3 className="font-bold text-brand-dark dark:text-white">{uiT[appLang].hizb} {hizb.hizb}</h3>
                <p className="text-xs text-brand-gray dark:text-gray-500 uppercase">{uiT[appLang].surah} {hizb.surahName} {hizb.ayah}</p>
            </div>
        </div>
    </Link>
);

const SurahListPage = () => {
    const [appLang] = useLocalStorage<'en' | 'ar' | 'fr'>('appLang', 'en');
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'surah' | 'juz' | 'hizb'>('surah');
    const [lastRead] = useLocalStorage('lastRead', { surah: 1, name: 'Al-Fatihah', arabicName: "ٱلْفَاتِحَة" });
    const [showBanner, setShowBanner] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadSurahs = async () => {
            setLoading(true);
            try {
                const data = await fetchSurahs();
                setSurahs(data);
            } catch (err) {
                console.error('Failed to fetch surahs', err);
                setError('Failed to load Surahs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        loadSurahs();
    }, []);

    const filteredSurahs = useMemo(() => {
        if (activeTab !== 'surah' || !searchTerm.trim()) return surahs;
        const fuse = new Fuse(surahs, { keys: ['englishName', 'name'], threshold: 0.4 });
        const res = fuse.search(searchTerm);
        return res.map(r => r.item);
    }, [surahs, searchTerm, activeTab]);

    const filteredJuzs = useMemo(() => {
        if (activeTab !== 'juz' || !searchTerm.trim()) return JUZ_DATA;
        const fuse = new Fuse(JUZ_DATA, { keys: ['surahName'], threshold: 0.4 });
        return fuse.search(searchTerm).map(r => r.item);
    }, [searchTerm, activeTab]);

    const filteredHizbs = useMemo(() => {
        if (activeTab !== 'hizb' || !searchTerm.trim()) return HIZB_DATA;
        const fuse = new Fuse(HIZB_DATA, { keys: ['surahName'], threshold: 0.4 });
        return fuse.search(searchTerm).map(r => r.item);
    }, [searchTerm, activeTab]);

    const lastReadSurah = useMemo(() => {
        return surahs.find(s => s.number === lastRead.surah);
    }, [surahs, lastRead]);
    
    return (
        <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
            <header className="p-4 space-y-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10">
                <h1 className="text-2xl font-bold text-center text-brand-dark dark:text-white">Reading Surah</h1>
                
                <div className="flex bg-slate-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('surah')} className={`w-1/3 py-2 rounded-md font-semibold transition-colors ${activeTab === 'surah' ? 'bg-brand-cyan text-white shadow' : 'text-brand-gray'}`}>Surah</button>
                    <button onClick={() => setActiveTab('juz')} className={`w-1/3 py-2 rounded-md font-semibold transition-colors ${activeTab === 'juz' ? 'bg-brand-cyan text-white shadow' : 'text-brand-gray'}`}>Juz'</button>
                    <button onClick={() => setActiveTab('hizb')} className={`w-1/3 py-2 rounded-md font-semibold transition-colors ${activeTab === 'hizb' ? 'bg-brand-cyan text-white shadow' : 'text-brand-gray'}`}>Hizb</button>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        aria-label="Search"
                        placeholder={`Search ${activeTab}..`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan focus-visible:ring-4"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray" />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pb-44">
                {loading && <LoadingSpinner />}
                {error && <p className="text-center text-red-500 p-4">{error}</p>}

                {!loading && !error && (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {activeTab === 'surah' && filteredSurahs.map(surah => (
                                                    <div key={surah.number}>
                                                        <SurahListItem surah={surah} appLang={appLang} searchTerm={searchTerm} />
                                                    </div>
                                                ))}
                                                {activeTab === 'juz' && filteredJuzs.map(juz => (
                                                    <div key={juz.juz}>
                                                        <JuzListItem juz={juz} appLang={appLang} />
                                                    </div>
                                                ))}
                                                {activeTab === 'hizb' && filteredHizbs.map(hizb => (
                                                    <div key={hizb.hizb}>
                                                        <HizbListItem hizb={hizb} appLang={appLang} />
                                                    </div>
                                                ))}
                    </div>
                )}
            </div>
            
            {lastReadSurah && showBanner && (
                 <div className="fixed bottom-20 left-0 right-0 p-4 max-w-md mx-auto z-20">
                                <div className="relative bg-white border-2 border-brand-cyan rounded-2xl flex items-center shadow-lg shadow-cyan-500/10 px-4 py-3 gap-3">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowBanner(false);
                                        }}
                                        className="absolute top-2 right-2 text-brand-cyan/70 hover:text-brand-cyan z-20"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                        <button className="flex-1 text-left" onClick={() => navigate(`/surah/${lastReadSurah.number}`)}>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block bg-brand-cyan text-white text-xs font-bold rounded-full px-2 py-1">Continue</span>
                                            <span className="font-semibold text-brand-dark text-sm">{lastReadSurah.number}. {lastReadSurah.englishName}</span>
                                        </div>
                                        <span className="font-naskh text-xl text-brand-cyan block mt-1" dir="rtl">{lastRead.arabicName}</span>
                                        </button>
                                </div>
                 </div>
            )}
        </div>
    );
};

export default SurahListPage;