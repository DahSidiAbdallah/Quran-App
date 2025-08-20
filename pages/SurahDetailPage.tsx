import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { SurahFullData, LastRead, Ayah, Bookmarks, Notes, Surah } from '../types';
import { fetchSurahDetail, fetchSurahs } from '../services/quranApi';
import useLocalStorage from '../hooks/useLocalStorage';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeftIcon, BookmarkIcon, PlayCircleIcon, PauseCircleIcon } from '../components/Icons';
// import AyahRow from '../components/AyahRow';
import { JUZ_DATA, HIZB_DATA } from '../constants';
import { SettingsContext } from '../contexts/SettingsContext';

const SurahDetailPage = () => {
    const { number } = useParams<{ number: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { settings } = useContext(SettingsContext);

    const [surahData, setSurahData] = useState<SurahFullData | null>(null);
    const [arabicTranslation, setArabicTranslation] = useState<string[]>([]);
    const [frenchTranslation, setFrenchTranslation] = useState<string[]>([]);

    const [translationLang] = useLocalStorage<'en' | 'ar' | 'fr'>('translationLang', 'en');


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [bookmarks, setBookmarks] = useLocalStorage<Bookmarks>('bookmarks', {});
    const [notes, setNotes] = useLocalStorage<Notes>('notes', {});
    const [, setLastRead] = useLocalStorage<LastRead>('lastRead', { surah: 1, ayah: 1, name: "Al-Fatihah", arabicName: "ٱلْفَاتِحَة" });
    // readingStats: { lastReadDate: string, streak: number }
    const [, setReadingStats] = useLocalStorage<{ lastReadDate?: string, streak: number }>('readingStats', { streak: 0 });
    
    const [playingAyah, setPlayingAyah] = useState<number | null>(null);
    const [isRepeating, setIsRepeating] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isSurahPlaying, setIsSurahPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const surahAudioRef = useRef<HTMLAudioElement | null>(null);

    // Popover for ayah actions
    const [ayahPopover, setAyahPopover] = useState<{ ayah: Ayah, index: number; anchor: HTMLElement | null } | null>(null);

    const [expandedTafsir, setExpandedTafsir] = useState<number | null>(null);
    const [editingNote, setEditingNote] = useState<number | null>(null);
    const [noteText, setNoteText] = useState("");

    // Dropdown state
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [navType, setNavType] = useState<'surah' | 'juz' | 'hizb'>('surah');

    // For dropdown and whole surah bookmark
    const [surahList, setSurahList] = useState<Surah[]>([]);
    const [dropdownSearch, setDropdownSearch] = useState('');
    let dropdownPlaceholder = 'Surah';
    if (navType === 'juz') dropdownPlaceholder = 'Juz';
    else if (navType === 'hizb') dropdownPlaceholder = 'Hizb';
    const [isWholeBookmarked, setIsWholeBookmarked] = useState(false);

    // Load surah list for dropdown
    useEffect(() => {
        if (navType === 'surah') {
            fetchSurahs().then(setSurahList);
        }
        setDropdownSearch('');
    }, [navType]);

    // Whole surah/juz/hizb bookmark check
    useEffect(() => {
        if (!surahData) return;
        let ayahNumbers: { surah: number, ayah: number }[] = [];
        if (navType === 'surah') {
            ayahNumbers = surahData.arabicAyahs.map(a => ({ surah: surahData.number, ayah: a.numberInSurah }));
        } else if (navType === 'juz') {
            const juzInfo = JUZ_DATA.find(j => j.surah === surahData.number && j.ayah === surahData.arabicAyahs[0].numberInSurah);
            if (juzInfo) {
                ayahNumbers = surahData.arabicAyahs.map(a => ({ surah: surahData.number, ayah: a.numberInSurah }));
            }
        } else if (navType === 'hizb') {
            const hizbInfo = HIZB_DATA.find(h => h.surah === surahData.number && h.ayah === surahData.arabicAyahs[0].numberInSurah);
            if (hizbInfo) {
                ayahNumbers = surahData.arabicAyahs.map(a => ({ surah: surahData.number, ayah: a.numberInSurah }));
            }
        }
        // Flattened check for allBookmarked
        const allBookmarked = ayahNumbers.length > 0 && ayahNumbers.every(({ surah, ayah }) => {
            for (const folder of Object.values(bookmarks)) {
                if (folder.some(b => b.surah === surah && b.ayah === ayah)) return true;
            }
            return false;
        });
        setIsWholeBookmarked(allBookmarked);
    }, [bookmarks, surahData, navType]);

    // Toggle whole surah/juz/hizb bookmark
    const toggleWholeBookmark = () => {
        if (!surahData) return;
        let ayahNumbers: { surah: number, ayah: number, surahName: string, text: string }[] = [];
        if (navType === 'surah') {
            ayahNumbers = surahData.arabicAyahs.map(a => ({
                surah: surahData.number,
                ayah: a.numberInSurah,
                surahName: surahData.englishName,
                text: a.text
            }));
        } else if (navType === 'juz') {
            const juzInfo = JUZ_DATA.find(j => j.surah === surahData.number && j.ayah === surahData.arabicAyahs[0].numberInSurah);
            if (juzInfo) {
                // For demo, just use all ayahs in this surah (real implementation would span multiple surahs)
                ayahNumbers = surahData.arabicAyahs.map(a => ({
                    surah: surahData.number,
                    ayah: a.numberInSurah,
                    surahName: surahData.englishName,
                    text: a.text
                }));
            }
        } else if (navType === 'hizb') {
            const hizbInfo = HIZB_DATA.find(h => h.surah === surahData.number && h.ayah === surahData.arabicAyahs[0].numberInSurah);
            if (hizbInfo) {
                ayahNumbers = surahData.arabicAyahs.map(a => ({
                    surah: surahData.number,
                    ayah: a.numberInSurah,
                    surahName: surahData.englishName,
                    text: a.text
                }));
            }
        }
        if (isWholeBookmarked) {
            // Remove all ayah bookmarks for this group
            const newBookmarks = { ...bookmarks };
            for (const folder in newBookmarks) {
                newBookmarks[folder] = newBookmarks[folder].filter(b =>
                    !ayahNumbers.some(a => a.surah === b.surah && a.ayah === b.ayah)
                );
            }
            setBookmarks(newBookmarks);
        } else {
            // Add all ayahs to bookmarks (Uncategorized)
            const newBookmarks = { ...bookmarks };
            if (!newBookmarks['Uncategorized']) newBookmarks['Uncategorized'] = [];
            ayahNumbers.forEach(a => {
                if (!newBookmarks['Uncategorized'].some(b => b.surah === a.surah && b.ayah === a.ayah)) {
                    newBookmarks['Uncategorized'].push({
                        surah: a.surah,
                        ayah: a.ayah,
                        surahName: a.surahName,
                        text: a.text
                    });
                }
            });
            setBookmarks(newBookmarks);
        }
    };

    const surahNumber = parseInt(number || '1', 10);

    useEffect(() => {
        const loadSurah = async () => {
            try {
                setLoading(true);
                // Fetch English, Arabic, and French translations
                const { arabic, translation, tafsir } = await fetchSurahDetail(surahNumber, settings.translation, settings.tafsir);
                // Arabic translation (ar.muyassar)
                const arabicRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.muyassar`);
                const arabicData = await arabicRes.json();
                // French translation (fr.hamidullah)
                const frenchRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/fr.hamidullah`);
                const frenchData = await frenchRes.json();
                const fullData: SurahFullData = {
                    number: arabic.number,
                    name: arabic.name,
                    englishName: arabic.englishName,
                    englishNameTranslation: arabic.englishNameTranslation,
                    numberOfAyahs: arabic.ayahs.length,
                    revelationType: arabic.revelationType,
                    arabicAyahs: arabic.ayahs,
                    translationAyahs: translation.ayahs,
                    tafsirAyahs: tafsir.ayahs,
                };
                setSurahData(fullData);
                setArabicTranslation(arabicData.data.ayahs.map((a: any) => a.text));
                setFrenchTranslation(frenchData.data.ayahs.map((a: any) => a.text));
                setLastRead({ surah: surahNumber, ayah: 1, name: fullData.englishName, arabicName: fullData.name });
                // Update reading stats (streak)
                try {
                    const today = new Date().toISOString().slice(0,10);
                    setReadingStats(prev => {
                        const last = prev.lastReadDate;
                        let streak = prev.streak || 0;
                        if (last === today) {
                            return prev; // no change
                        }
                        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
                        if (last === yesterday) streak = streak + 1; else streak = 1;
                        return { lastReadDate: today, streak };
                    });
                } catch (e) {
                    console.error('Failed to update reading stats', e);
                }
            } catch (err) {
                console.error('Failed to load surah details', err);
                setError('Failed to load Surah details.');
            } finally {
                setLoading(false);
            }
        };

        loadSurah();
        
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        }
    }, [number, settings.translation, settings.tafsir, setLastRead]);
    
    useEffect(() => {
        if (!loading && surahData && location.hash) {
            const ayahNumberStr = location.hash.replace('#ayah-', '');
            const ayahNumber = parseInt(ayahNumberStr, 10);
            const element = document.getElementById(`ayah-${ayahNumber}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('bg-yellow-100', 'dark:bg-yellow-800/50', 'rounded-lg');
                setTimeout(() => {
                    element.classList.remove('bg-yellow-100', 'dark:bg-yellow-800/50', 'rounded-lg');
                }, 2000);
            }
        }
    }, [loading, surahData, location.hash]);
    
    const isAyahBookmarked = (sNum: number, ayahNumberInSurah: number) => {
        // Flattened, less nesting
        return Object.values(bookmarks).some(folder =>
            folder.some(b => b.surah === sNum && b.ayah === ayahNumberInSurah)
        );
    };

    const toggleBookmark = (ayah: Ayah, translationText: string) => {
        const bookmarked = isAyahBookmarked(surahNumber, ayah.numberInSurah);
        const newBookmark = {
            surah: surahNumber,
            ayah: ayah.numberInSurah,
            surahName: surahData?.englishName || '',
            text: ayah.text
        };

        if (bookmarked) {
            // Remove from all folders
            const newBookmarks = { ...bookmarks };
            for (const folder in newBookmarks) {
                newBookmarks[folder] = newBookmarks[folder].filter(b => !(b.surah === surahNumber && b.ayah === ayah.numberInSurah));
            }
            setBookmarks(newBookmarks);
        } else {
            // Add to "Uncategorized" folder
            const newBookmarks = { ...bookmarks };
            if (!newBookmarks['Uncategorized']) {
                newBookmarks['Uncategorized'] = [];
            }
            newBookmarks['Uncategorized'].push(newBookmark);
            setBookmarks(newBookmarks);
        }
    };

    // Play/pause a single ayah
    const handlePlayPause = async (ayah: Ayah) => {
        if (playingAyah === ayah.number) {
            audioRef.current?.pause();
            setPlayingAyah(null);
        } else {
            if (audioRef.current) audioRef.current.pause();
            const audioUrl = `https://cdn.islamic.network/quran/audio/128/${settings.reciter}/${ayah.number}.mp3`;
            try {
                const res = await fetch(audioUrl, { method: 'HEAD' });
                if (!res.ok) {
                    alert('Audio for this ayah/reciter is not available. Please try another reciter.');
                    return;
                }
                audioRef.current = new Audio(audioUrl);
                audioRef.current.playbackRate = playbackRate;
                await audioRef.current.play();
                setPlayingAyah(ayah.number);
                audioRef.current.onended = () => {
                    if (isRepeating) {
                        audioRef.current?.play();
                    } else {
                        setPlayingAyah(null);
                    }
                };
            } catch (e) {
                console.error('Audio play failed or is not supported for this reciter.', e);
                setPlayingAyah(null);
            }
        }
    };

    // Play/pause the whole surah
    const handleSurahPlayPause = async () => {
        if (isSurahPlaying) {
            surahAudioRef.current?.pause();
            setIsSurahPlaying(false);
        } else {
            if (surahAudioRef.current) surahAudioRef.current.pause();
            // Use a full surah audio URL (Mishary, 128kbps)
            const surahAudioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${settings.reciter}/${surahNumber}.mp3`;
            try {
                const res = await fetch(surahAudioUrl, { method: 'HEAD' });
                if (!res.ok) {
                    alert('Audio for this surah/reciter is not available. Please try another reciter.');
                    return;
                }
                surahAudioRef.current = new Audio(surahAudioUrl);
                surahAudioRef.current.playbackRate = playbackRate;
                await surahAudioRef.current.play();
                setIsSurahPlaying(true);
                surahAudioRef.current.onended = () => setIsSurahPlaying(false);
            } catch (e) {
                console.error('Surah audio play failed.', e);
                setIsSurahPlaying(false);
            }
        }
    };
    
    const toggleTafsir = (ayahNumberInSurah: number) => {
        setExpandedTafsir(prev => (prev === ayahNumberInSurah ? null : ayahNumberInSurah));
    };

    const handleShare = async (ayah: Ayah, translationText: string) => {
        const shareData = {
            title: `Quran - ${surahData?.englishName} Ayah ${ayah.numberInSurah}`,
            text: `"${ayah.text}"\n\n"${translationText}"\n\n(Quran ${surahData?.number}:${ayah.numberInSurah})`,
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                alert('Web Share API not supported in your browser.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleNoteEdit = (ayahNumberInSurah: number) => {
        const noteKey = `${surahNumber}:${ayahNumberInSurah}`;
        setEditingNote(ayahNumberInSurah);
        setNoteText(notes[noteKey] || "");
    };

    const handleNoteSave = () => {
        if (editingNote === null) return;
        const noteKey = `${surahNumber}:${editingNote}`;
        setNotes(prev => {
            const newNotes = { ...prev };
            if (noteText.trim()) {
                newNotes[noteKey] = noteText;
            } else {
                delete newNotes[noteKey];
            }
            return newNotes;
        });
        setEditingNote(null);
        setNoteText("");
    };

    const handleImportNotesFile = (file?: File | null) => {
        if (!file) return;
        if (!file.type.includes('json') && !file.name.endsWith('.json')) {
            alert('Please select a valid JSON file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                // Use explicit string conversion for ArrayBuffer or string
                let text = '';
                if (typeof ev.target?.result === 'string') text = ev.target.result;
                else if (ev.target?.result instanceof ArrayBuffer) text = new TextDecoder().decode(ev.target.result);
                const imported = JSON.parse(text) as Notes;
                setNotes(prev => ({ ...prev, ...imported }));
                alert('Notes imported successfully.');
            } catch (err) {
                console.error('Failed to import notes', err);
                alert('Failed to import notes: invalid file.');
            }
        };
        reader.readAsText(file);
    };


    // appLang and setAppLang now come from props (global)
    // Remove local appLang/setAppLang

    if (loading) return <div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>;
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
    if (!surahData) return null;

    const showBismillah = surahData.number !== 1 && surahData.number !== 9;

    // Set background classes based on theme
    let bgClass = "bg-[#F8F9FA] dark:bg-gray-900";
    if (settings.theme === 'sepia') bgClass = "theme-sepia";
        return (
                <div className={`flex flex-col flex-1 min-h-screen ${bgClass}`}>
                        {/* Ayah action popover */}
                                    {ayahPopover?.anchor && (
                                            <div
                                                className="fixed z-50"
                                                style={{
                                                    left: ayahPopover.anchor.getBoundingClientRect().left + window.scrollX,
                                                    top: ayahPopover.anchor.getBoundingClientRect().bottom + window.scrollY + 8
                                                }}
                                            >
                                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-2 min-w-[160px] flex flex-col gap-1">
                                                    <button className="text-left hover:bg-brand-cyan/10 px-3 py-1 rounded" onClick={() => { handlePlayPause(ayahPopover.ayah); }}>
                                                        {playingAyah === ayahPopover.ayah.number ? 'Pause' : 'Play'}
                                                    </button>
                                                    <button className="text-left hover:bg-brand-cyan/10 px-3 py-1 rounded" onClick={() => { handleShare(ayahPopover.ayah, surahData?.translationAyahs?.[ayahPopover.index]?.text || ''); }}>
                                                        Share
                                                    </button>
                                                    <button className="text-left hover:bg-brand-cyan/10 px-3 py-1 rounded" onClick={() => { toggleBookmark(ayahPopover.ayah, surahData?.translationAyahs?.[ayahPopover.index]?.text || ''); }}>
                                                        {isAyahBookmarked(surahNumber, ayahPopover.ayah.numberInSurah) ? 'Remove Bookmark' : 'Bookmark'}
                                                    </button>
                                                    <button className="text-left hover:bg-brand-cyan/10 px-3 py-1 rounded" onClick={() => { handleNoteEdit(ayahPopover.ayah.numberInSurah); setAyahPopover(null); }}>
                                                        {notes[`${surahNumber}:${ayahPopover.ayah.numberInSurah}`] ? 'Edit Note' : 'Add Note'}
                                                    </button>
                                                    {surahData?.tafsirAyahs?.[ayahPopover.index]?.text ? (
                                                        <button className="text-left hover:bg-brand-cyan/10 px-3 py-1 rounded" onClick={() => { toggleTafsir(ayahPopover.ayah.numberInSurah); setAyahPopover(null); }}>
                                                            {expandedTafsir === ayahPopover.ayah.numberInSurah ? 'Hide Tafsir' : 'Show Tafsir'}
                                                        </button>
                                                    ) : null}
                                                    <button className="text-left text-red-500 hover:bg-red-50 px-3 py-1 rounded" onClick={() => setAyahPopover(null)}>Close</button>
                                                </div>
                                            </div>
                                    )}
            {editingNote !== null && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4 text-brand-dark dark:text-white">Note for Ayah {editingNote}</h3>
                        <textarea
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            rows={5}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Write your reflection..."
                        ></textarea>
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setEditingNote(null)} className="px-4 py-2 rounded-md text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-600">Cancel</button>
                            <button onClick={handleNoteSave} className="px-4 py-2 rounded-md bg-brand-cyan text-white">Save</button>
                        </div>
                    </div>
                </div>
            )}
                        <header className="sticky top-0 bg-[#F8F9FA]/90 dark:bg-gray-900/90 theme-sepia/80 sepia-bg backdrop-blur-sm z-10 shadow-sm">
            <div className="flex items-center justify-between p-4">
                <button onClick={() => navigate('/surahs')} className="text-brand-dark dark:text-gray-300 sepia-text"><ArrowLeftIcon /></button>
                <div className="relative text-center flex-1 flex flex-col items-center">
                    <button
                        className="flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-cyan/90 text-white font-semibold text-base shadow"
                        onClick={() => setDropdownOpen(v => !v)}
                    >
                        {navType === 'surah' && `${surahData.number}. ${surahData.englishName}`}
                        {navType === 'juz' && `Juz'`}
                        {navType === 'hizb' && `Hizb`}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                    </button>
                    {dropdownOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border rounded-lg shadow-lg z-20 min-w-[260px] max-h-96 overflow-y-auto">
                            <div className="py-2 border-b">
                                <button className="block w-full text-left px-4 py-2 hover:bg-brand-cyan/10" onClick={() => { setNavType('surah'); setDropdownOpen(false); }}>Surah</button>
                                <button className="block w-full text-left px-4 py-2 hover:bg-brand-cyan/10" onClick={() => { setNavType('juz'); setDropdownOpen(false); }}>Juz'</button>
                                <button className="block w-full text-left px-4 py-2 hover:bg-brand-cyan/10" onClick={() => { setNavType('hizb'); setDropdownOpen(false); }}>Hizb</button>
                            </div>
                                        <div className="px-3 py-2">
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring"
                                                placeholder={`Search ${dropdownPlaceholder}...`}
                                                value={dropdownSearch}
                                                onChange={e => setDropdownSearch(e.target.value)}
                                            />
                                        </div>
                            {navType === 'surah' && surahList.filter(s =>
                                s.englishName.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
                                s.name.includes(dropdownSearch) ||
                                String(s.number).includes(dropdownSearch)
                            ).map(s => (
                                <button key={s.number} className="block w-full text-left px-4 py-2 hover:bg-brand-cyan/10" onClick={() => { navigate(`/surah/${s.number}`); setDropdownOpen(false); }}>
                                    {s.number}. {s.englishName}
                                </button>
                            ))}
                            {navType === 'juz' && JUZ_DATA.filter(j =>
                                String(j.juz).includes(dropdownSearch) ||
                                j.surahName.toLowerCase().includes(dropdownSearch.toLowerCase())
                            ).map(j => (
                                <button key={j.juz} className="block w-full text-left px-4 py-2 hover:bg-brand-cyan/10" onClick={() => { navigate(`/surah/${j.surah}#ayah-${j.ayah}`); setDropdownOpen(false); }}>
                                    Juz {j.juz} - {j.surahName} {j.ayah}
                                </button>
                            ))}
                            {navType === 'hizb' && HIZB_DATA.filter(h =>
                                String(h.hizb).includes(dropdownSearch) ||
                                h.surahName.toLowerCase().includes(dropdownSearch.toLowerCase())
                            ).map(h => (
                                <button key={h.hizb} className="block w-full text-left px-4 py-2 hover:bg-brand-cyan/10" onClick={() => { navigate(`/surah/${h.surah}#ayah-${h.ayah}`); setDropdownOpen(false); }}>
                                    Hizb {h.hizb} - {h.surahName} {h.ayah}
                                </button>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-brand-gray sepia-text-light mt-1">{surahData.englishNameTranslation}</p>
                </div>
                <button title="Bookmark Surah" className={`text-brand-cyan hover:text-brand-dark dark:hover:text-white sepia-text ${isWholeBookmarked ? 'opacity-100' : 'opacity-60'}`} onClick={toggleWholeBookmark}>
                    <BookmarkIcon className="w-6 h-6" filled={isWholeBookmarked} />
                </button>
            </div>
                        </header>
            
            <main className="p-4 overflow-y-auto flex justify-center">
                <div className="bg-white dark:bg-gray-800 sepia-card-bg rounded-2xl p-4 md:p-8 shadow-lg max-w-2xl w-full mx-auto border border-gray-100">
                    {/* Surah playback controls */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <button className="p-2 bg-brand-cyan text-white rounded-full" onClick={handleSurahPlayPause}>
                                {isSurahPlaying ? <PauseCircleIcon className="w-8 h-8" /> : <PlayCircleIcon className="w-8 h-8" />}
                            </button>
                            <select value={playbackRate} onChange={e => setPlaybackRate(Number(e.target.value))} className="px-2 py-1 rounded border text-sm">
                                <option value="0.5">0.5x</option>
                                <option value="0.75">0.75x</option>
                                <option value="1">1x</option>
                                <option value="1.25">1.25x</option>
                                <option value="1.5">1.5x</option>
                                <option value="2">2x</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => {
                                // Export notes as JSON
                                const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `quran-notes-${new Date().toISOString()}.json`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                URL.revokeObjectURL(url);
                            }}>Export Notes</button>
                            <input id="importNotesInput" type="file" accept="application/json" className="hidden" onChange={(e) => handleImportNotesFile(e.target.files?.[0])} />
                            <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => (document.getElementById('importNotesInput') as HTMLInputElement)?.click()}>Import Notes</button>
                        </div>
                    </div>
                    {showBismillah && (
                        <div className="text-center border-b border-gray-200 dark:border-gray-700 sepia-border pb-6 mb-6">
                            <p className="arabic-text text-brand-dark dark:text-white sepia-text">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                        </div>
                    )}

                    {/* Verses with translations */}
                    <div className="space-y-8">
                        {surahData.arabicAyahs.map((ayah, index) => (
                            <div key={ayah.numberInSurah} className="mb-4">
                                <div className="text-right arabic-text text-3xl leading-loose text-brand-dark dark:text-white sepia-text" dir="rtl" style={{ wordSpacing: '0.5em', lineHeight: 2.2 }}>
                                    {ayah.text}
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center mx-1 w-8 h-8 rounded-full border-2 border-brand-cyan text-brand-cyan font-bold bg-white dark:bg-gray-900 hover:bg-brand-cyan hover:text-white cursor-pointer transition-all shadow-sm align-middle focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                style={{ verticalAlign: 'middle', fontSize: '1.1rem' }}
                                        aria-label={`Ayah ${ayah.numberInSurah} options`}
                                        onClick={e => setAyahPopover({ ayah, index, anchor: e.currentTarget })}
                                    >
                                        {ayah.numberInSurah}
                                    </button>
                                </div>
                                <div className="text-base text-brand-gray dark:text-gray-400 sepia-text-light leading-relaxed mt-2" dir="ltr">
                                    {surahData.translationAyahs[index]?.text}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};


// Accept appLang and setAppLang as props (from App.tsx)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SurahDetailPageWithLang = (props: any) => <SurahDetailPage {...props} />;
export default SurahDetailPageWithLang;