import React from 'react';
import type { Ayah, Notes } from '../types';
import starImg from '../assets/star.png';
import { PlayCircleIcon, PauseCircleIcon, BookmarkIcon, InfoIcon, ShareIcon, NoteIcon, RepeatIcon } from './Icons';

interface AyahRowProps {
  ayah: Ayah;
  translation: string;
  tafsir?: string;
  surahNumber: number;
  isBookmarked: boolean;
  hasNote: boolean;
  expandedTafsir: number | null;
  playingAyah: number | null;
  isRepeating: boolean;
  playbackRate: number;
  notes: Notes;
  onPlayPause: (ayah: Ayah) => void;
  onToggleBookmark: (ayah: Ayah, translation: string) => void;
  onToggleTafsir: (ayahNumberInSurah: number) => void;
  onShare: (ayah: Ayah, translation: string) => void;
  onNoteEdit: (ayahNumberInSurah: number) => void;
  setIsRepeating: (repeat: boolean) => void;
  setPlaybackRate: (rate: number) => void;
}

const AyahRow: React.FC<AyahRowProps> = ({
  ayah,
  translation,
  tafsir,
  surahNumber,
  isBookmarked,
  hasNote,
  expandedTafsir,
  playingAyah,
  isRepeating,
  playbackRate,
  notes,
  onPlayPause,
  onToggleBookmark,
  onToggleTafsir,
  onShare,
  onNoteEdit,
  setIsRepeating,
  setPlaybackRate,
}) => {
  const noteKey = `${surahNumber}:${ayah.numberInSurah}`;
  return (
    <div key={ayah.numberInSurah} id={`ayah-${ayah.numberInSurah}`} className="py-6 transition-all duration-500">
      <div className="flex justify-center items-center gap-4">
        <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
          <img
            src={starImg}
            alt="star"
            className="absolute w-full h-full object-contain z-0 pointer-events-none select-none"
            draggable={false}
          />
          <span className="font-bold text-brand-cyan text-base z-10 select-none" style={{fontFamily: 'Poppins, sans-serif'}}>{ayah.numberInSurah}</span>
        </div>
        <p className="flex-1 text-right arabic-text text-3xl leading-loose text-brand-dark dark:text-white sepia-text mr-2" dir="rtl">{ayah.text}</p>
      </div>
      <div className="mt-4 pl-16">
        <p className="text-brand-gray dark:text-gray-400 sepia-text-light text-base/relaxed">{translation}</p>
        <div className="flex items-center flex-wrap gap-4 mt-3 text-gray-400 dark:text-gray-500 sepia-text-light">
          <button onClick={() => onPlayPause(ayah)} title={playingAyah === ayah.number ? "Pause" : "Play"} aria-label={playingAyah === ayah.number ? 'Pause audio' : 'Play audio'}>
            {playingAyah === ayah.number ? <PauseCircleIcon className="w-6 h-6 text-brand-cyan"/> : <PlayCircleIcon className="w-6 h-6 hover:text-brand-cyan"/>}
          </button>
          <button onClick={() => onToggleBookmark(ayah, translation)} title="Bookmark" aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
            <BookmarkIcon className={`w-5 h-5 transition-colors ${isBookmarked ? 'text-brand-cyan' : 'hover:text-brand-cyan'}`} filled={isBookmarked} />
          </button>
          {tafsir && (
            <button onClick={() => onToggleTafsir(ayah.numberInSurah)} title="Explanation" aria-label={expandedTafsir === ayah.numberInSurah ? 'Close explanation' : 'Open explanation'}>
              <InfoIcon className={`w-5 h-5 transition-colors ${expandedTafsir === ayah.numberInSurah ? 'text-brand-cyan' : 'hover:text-brand-cyan'}`} />
            </button>
          )}
          <button onClick={() => onShare(ayah, translation)} title="Share" aria-label="Share ayah">
            <ShareIcon className="w-5 h-5 hover:text-brand-cyan" />
          </button>
          <button onClick={() => onNoteEdit(ayah.numberInSurah)} title="Add Note" aria-label={hasNote ? 'Edit note' : 'Add note'}>
            <NoteIcon className={`w-5 h-5 hover:text-brand-cyan ${hasNote ? 'text-brand-cyan' : ''}`} filled={hasNote} />
          </button>
          {playingAyah === ayah.number && (
            <>
              <button onClick={() => setIsRepeating(!isRepeating)} title="Repeat" aria-pressed={isRepeating} aria-label={isRepeating ? 'Disable repeat' : 'Enable repeat'}>
                <RepeatIcon className={`w-5 h-5 hover:text-brand-cyan ${isRepeating ? 'text-brand-cyan' : ''}`} />
              </button>
              <select value={playbackRate} onChange={e => {
                const rate = parseFloat(e.target.value);
                setPlaybackRate(rate);
              }} className="bg-transparent text-xs rounded">
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </>
          )}
        </div>
        {hasNote && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-800/20 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">{notes[noteKey]}</p>
          </div>
        )}
        {expandedTafsir === ayah.numberInSurah && tafsir && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-gray-700/50 sepia-bg rounded-lg border-l-4 border-brand-cyan">
            <h4 className="font-bold text-brand-dark dark:text-white sepia-text mb-2">Explanation (Tafsir Ibn Kathir)</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300/90 sepia-text-light leading-relaxed">{tafsir}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AyahRow;
