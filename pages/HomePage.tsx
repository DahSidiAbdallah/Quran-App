import uiT from '../locales';
import React from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, ChatIcon } from '../components/Icons';
import ScheduleCard from '../components/ScheduleCard';
import CommunityCard from '../components/CommunityCard';
import useLocalStorage from '../hooks/useLocalStorage';
import { LastRead, UserProfile } from '../types';

import QuranIllustration from '../assets/Quran.png';
const DefaultAvatar = 'https://picsum.photos/seed/user/40/40';

const Header = () => {
    const [profile] = useLocalStorage<UserProfile>('userProfile', { name: 'Al Ghazali', picture: DefaultAvatar });

    return (
        <header className="flex justify-between items-center p-4">
            <Link to="/settings" className="text-brand-dark dark:text-gray-300">
                <MenuIcon className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-4">
                <Link to="/chat" className="text-brand-dark dark:text-gray-300">
                    <ChatIcon className="w-6 h-6" />
                </Link>
                <Link to="/profile">
                    <img src={profile.picture || DefaultAvatar} alt="User" className="w-10 h-10 rounded-full object-cover" />
                </Link>
            </div>
        </header>
    );
};

const CompletionCard = () => {
    const [lastRead] = useLocalStorage<LastRead>('lastRead', { surah: 1, ayah: 1, name: "Al-Fatihah", arabicName: "ٱلْفَاتِحَة" });
    const completionPercentage = ((lastRead.surah || 1) / 114) * 100;

    return (
        <div className="bg-gradient-to-r from-brand-cyan to-brand-teal text-white p-5 rounded-2xl shadow-lg shadow-brand-cyan/30">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg">Quran Completion</h3>
                    <p className="text-sm opacity-90 mt-1">Last Read: {lastRead.name}</p>
                </div>
                 <img src={QuranIllustration} alt="Quran" className="w-16 h-16 rounded-lg object-contain" />
            </div>
            <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{completionPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2.5">
                    <div className="bg-white rounded-full h-2.5" style={{ width: `${completionPercentage}%` }}></div>
                </div>
            </div>
        </div>
    );
};

const HomePage = () => {
    const [appLang] = useLocalStorage<'en' | 'ar' | 'fr'>('appLang', 'en');
  const [profile] = useLocalStorage<UserProfile>('userProfile', { name: 'Al Ghazali', picture: DefaultAvatar });
  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="p-4 space-y-6 flex-1 overflow-y-auto pb-24">
        <div>
          <p className="text-brand-gray dark:text-gray-400">Assalamualaikum</p>
          <h1 className="text-2xl font-bold text-brand-dark dark:text-white">{profile.name}</h1>
        </div>
        <CompletionCard />
        <ScheduleCard />
        <CommunityCard />
      </main>
    </div>
  );
};

export default HomePage;