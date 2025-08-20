import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AyahRow from '../components/AyahRow';

test('renders ayah text and translation', () => {
  const ayah = { number: 1, text: 'بِسْمِ اللَّهِ', numberInSurah: 1 } as any;
  render(<AyahRow ayah={ayah} translation="In the name of Allah" surahNumber={1} isBookmarked={false} hasNote={false} expandedTafsir={null} playingAyah={null} isRepeating={false} playbackRate={1} notes={{}} onPlayPause={() => {}} onToggleBookmark={() => {}} onToggleTafsir={() => {}} onShare={() => {}} onNoteEdit={() => {}} setIsRepeating={() => {}} setPlaybackRate={() => {}} />);
  expect(screen.getByText('بِسْمِ اللَّهِ')).toBeInTheDocument();
  expect(screen.getByText('In the name of Allah')).toBeInTheDocument();
});
