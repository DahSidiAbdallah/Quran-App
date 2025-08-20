import { Chat } from '@google/genai';

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Ayah[];
  edition: {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: string;
    type: string;
  }
}

export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
  direction: 'ltr' | 'rtl' | null;
}

export interface SurahEdition {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    ayahs: Ayah[];
    edition: Edition;
}

export interface SurahFullData {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
    arabicAyahs: Ayah[];
    translationAyahs: Ayah[];
    tafsirAyahs?: Ayah[];
}


export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  text: string;
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface PrayerTimeData {
  timings: PrayerTimes;
  date: {
    readable: string;
    hijri: {
      date: string;
      day: string;
      month: {
        en: string;
      };
      year: string;
    }
  };
}

export interface LastRead {
    surah: number;
    ayah: number;
    name: string;
    arabicName: string;
}

export interface UserProfile {
  name: string;
  picture: string;
}

export interface Bookmark {
  surah: number;
  ayah: number;
  surahName: string;
  text: string;
}

export type Bookmarks = Record<string, Bookmark[]>;

export type Notes = Record<string, string>; // Key: "surah:ayah", Value: note text

export interface Settings {
    theme: 'light' | 'dark' | 'sepia';
    reciter: string;
    translation: string;
    tafsir: string;
    arabicFont: 'amiri' | 'naskh';
    translationFont: 'poppins';
    arabicFontSize: number;
    translationFontSize: number;
}