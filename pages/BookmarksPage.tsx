import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import { Bookmarks } from '../types';
import { ArrowLeftIcon, FolderIcon, PlusIcon, TrashIcon } from '../components/Icons';

const BookmarksPage = () => {
    useLocalStorage<'en' | 'ar' | 'fr'>('appLang', 'en');
    const DEFAULT_FOLDER = 'Uncategorized';
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useLocalStorage<Bookmarks>('bookmarks', { 'Uncategorized': [] });
    const [newFolderName, setNewFolderName] = useState('');

    const handleAddFolder = () => {
        if (newFolderName.trim() && !bookmarks[newFolderName.trim()]) {
            setBookmarks(prev => ({ ...prev, [newFolderName.trim()]: [] }));
            setNewFolderName('');
        }
    };

    const handleDeleteBookmark = (folderName: string, surah: number, ayah: number) => {
        setBookmarks(prev => {
            const newBookmarks = { ...prev };
            newBookmarks[folderName] = newBookmarks[folderName].filter(b => !(b.surah === surah && b.ayah === ayah));
            return newBookmarks;
        });
    };

    const handleDeleteFolder = (folderName: string) => {
        if (folderName === DEFAULT_FOLDER) {
            alert("Cannot delete the default folder.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete the folder "${folderName}"? All bookmarks within it will be lost.`)) {
            setBookmarks(prev => {
                const newBookmarks = { ...prev };
                delete newBookmarks[folderName];
                return newBookmarks;
            });
        }
    };

    return (
        <div className="flex flex-col flex-1 bg-brand-light dark:bg-gray-900">
            <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 shadow-sm">
                <div className="flex items-center gap-4 p-4">
                    <button onClick={() => navigate('/')} className="text-brand-dark dark:text-gray-300"><ArrowLeftIcon /></button>
                    <h1 className="text-lg font-bold text-brand-dark dark:text-white">Bookmarks</h1>
                </div>
            </header>

            <main className="p-4 space-y-6 overflow-y-auto pb-24">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                        placeholder="New folder name..."
                        className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan dark:text-white"
                    />
                    <button onClick={handleAddFolder} className="p-3 bg-brand-cyan text-white rounded-lg shadow-md hover:bg-brand-teal transition-colors disabled:opacity-50" disabled={!newFolderName.trim()}>
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    {Object.entries(bookmarks).map(([folderName, folderBookmarks]) => (
                        <div key={folderName} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <div className="p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                                <div className="flex items-center gap-2 font-bold text-brand-dark dark:text-white">
                                    <FolderIcon className="w-5 h-5 text-brand-cyan" />
                                    <span>{folderName} ({folderBookmarks.length})</span>
                                </div>
                                {folderName !== 'Uncategorized' && (
                                    <button onClick={() => handleDeleteFolder(folderName)} className="text-gray-400 hover:text-red-500">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {folderBookmarks.length > 0 ? folderBookmarks.map(bookmark => (
                                    <div key={`${bookmark.surah}-${bookmark.ayah}`} className="p-4 flex justify-between items-start gap-2">
                                            <button onClick={() => navigate(`/surah/${bookmark.surah}#ayah-${bookmark.ayah}`)} className="flex-1 text-left">
                                                <p className="font-semibold text-brand-dark dark:text-gray-200">{bookmark.surahName} {bookmark.surah}:{bookmark.ayah}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate arabic-text" dir="rtl">{bookmark.text}</p>
                                            </button>
                                        <button onClick={() => handleDeleteBookmark(folderName, bookmark.surah, bookmark.ayah)} className="text-gray-400 hover:text-red-500">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                )) : (
                                    <p className="p-4 text-sm text-gray-400">No bookmarks in this folder.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default BookmarksPage;