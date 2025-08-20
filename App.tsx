import React, { useContext, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SurahListPage from './pages/SurahListPage';
import SurahDetailPage from './pages/SurahDetailPage';
import ChatPage from './pages/ChatPage';
import PrayersPage from './pages/PrayersPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import BookmarksPage from './pages/BookmarksPage';
import QiblaPage from './pages/QiblaPage';
import BottomNav from './components/BottomNav';

import useLocalStorage from './hooks/useLocalStorage';
import uiT from './locales';
import { SettingsProvider, SettingsContext } from './contexts/SettingsContext';


const ThemedApp = () => {
    const location = useLocation();
    const { settings } = useContext(SettingsContext);
    const [appLang, setAppLang] = useLocalStorage<'en' | 'ar' | 'fr'>('appLang', 'en');

    const noNavRoutes = ['/chat', '/settings', '/profile', '/qibla', '/surah/'];
    const showNav = !noNavRoutes.some(path => location.pathname.startsWith(path));

    // This is a bit of a hack to apply the theme class to the body for the background color
    useEffect(() => {
        document.body.classList.remove('theme-sepia');
        if (settings.theme === 'sepia') {
            document.body.classList.add('theme-sepia');
        }
    }, [settings.theme]);

    // Global language switcher UI
    const LanguageSwitcher = () => (
        <div className="flex items-center gap-2 px-4 py-2">
            <label className="font-semibold text-sm" htmlFor="appLangSwitcher">{uiT[appLang].translation}:</label>
            <select
                id="appLangSwitcher"
                className="border rounded px-2 py-1 text-sm"
                value={appLang}
                onChange={e => setAppLang(e.target.value as 'en' | 'ar' | 'fr')}
            >
                <option value="en">{uiT[appLang].english}</option>
                <option value="ar">{uiT[appLang].arabic}</option>
                <option value="fr">{uiT[appLang].french}</option>
            </select>
        </div>
    );

    return (
        <div className={`font-sans antialiased text-brand-dark dark:text-gray-200 ${settings.theme === 'sepia' ? 'theme-sepia' : ''}`}>
            <div className="relative min-h-screen max-w-md mx-auto bg-slate-50 dark:bg-gray-900 sepia-bg shadow-2xl shadow-slate-300/30 flex flex-col">
                <LanguageSwitcher />
                <Routes>
                    <Route path="/" element={<HomePage appLang={appLang} setAppLang={setAppLang} />} />
                    <Route path="/surahs" element={<SurahListPage appLang={appLang} setAppLang={setAppLang} />} />
                    <Route path="/surah/:number" element={<SurahDetailPage appLang={appLang} setAppLang={setAppLang} />} />
                    <Route path="/chat" element={<ChatPage appLang={appLang} setAppLang={setAppLang} />} />
                    <Route path="/prayers" element={<PrayersPage appLang={appLang} setAppLang={setAppLang} />} />
                    <Route path="/qibla" element={<QiblaPage appLang={appLang} setAppLang={setAppLang} />} />
                    <Route path="/settings" element={<SettingsPage appLang={appLang} setAppLang={setAppLang} />} />
                    <Route path="/profile" element={<ProfilePage appLang={appLang} setAppLang={setAppLang} />} />
                    <Route path="/bookmarks" element={<BookmarksPage appLang={appLang} setAppLang={setAppLang} />} />
                </Routes>
                {showNav && <BottomNav />}
            </div>
        </div>
    );
};

const App = () => {
    return <ThemedApp />;
}

export default App;