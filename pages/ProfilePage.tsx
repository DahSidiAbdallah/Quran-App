import uiT from '../locales';
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import { UserProfile } from '../types';
import { ArrowLeftIcon, CameraIcon } from '../components/Icons';

const DefaultAvatar = 'https://picsum.photos/seed/user/128/128';

const ProfilePage = () => {
    const [appLang] = useLocalStorage<'en' | 'ar' | 'fr'>('appLang', 'en');
    const navigate = useNavigate();
    const [profile, setProfile] = useLocalStorage<UserProfile>('userProfile', {
        name: 'Al Ghazali',
        picture: DefaultAvatar
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfile(prev => ({ ...prev, picture: e.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProfile(prev => ({ ...prev, name: event.target.value }));
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    return (
        <div className="flex flex-col flex-1 bg-brand-light dark:bg-gray-900">
            <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 shadow-sm">
                <div className="flex items-center gap-4 p-4">
                    <button onClick={() => navigate('/settings')} className="text-brand-dark dark:text-gray-300"><ArrowLeftIcon /></button>
                    <h1 className="text-lg font-bold text-brand-dark dark:text-white">Edit Profile</h1>
                </div>
            </header>

            <main className="p-4 pt-8 space-y-8 overflow-y-auto">
                <div className="relative w-32 h-32 mx-auto">
                    <img src={profile.picture || DefaultAvatar} alt="Profile" className="w-full h-full rounded-full object-cover shadow-lg" />
                    <button
                        onClick={triggerFileSelect}
                        className="absolute bottom-0 right-0 bg-brand-cyan text-white p-2 rounded-full shadow-md hover:bg-brand-teal transition-colors"
                        aria-label="Change profile picture"
                    >
                        <CameraIcon className="w-5 h-5" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePictureChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-brand-gray dark:text-gray-400 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={profile.name}
                            onChange={handleNameChange}
                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan dark:text-white"
                        />
                    </div>
                </div>

                 <div className="pt-4">
                     <button
                        onClick={() => navigate('/settings')}
                        className="w-full bg-brand-cyan text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-brand-cyan/50 hover:bg-brand-teal transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;