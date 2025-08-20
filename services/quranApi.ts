import { Surah, SurahEdition, Edition } from '../types';

const API_BASE_URL = 'https://api.alquran.cloud/v1';

export const fetchSurahs = async (): Promise<Surah[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/surah`);
    if (!response.ok) {
      throw new Error('Failed to fetch surahs');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching Surahs:', error);
    throw error;
  }
};

export const fetchSurahDetail = async (surahNumber: number, translationId: string, tafsirId: string): Promise<{ arabic: SurahEdition, translation: SurahEdition, tafsir: SurahEdition }> => {
  try {
    const editions = `quran-uthmani,${translationId},${tafsirId}`;
    const response = await fetch(`${API_BASE_URL}/surah/${surahNumber}/editions/${editions}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah ${surahNumber}`);
    }
    const data = await response.json();
    return {
      arabic: data.data[0],
      translation: data.data[1],
      tafsir: data.data[2],
    };
  } catch (error) {
    console.error(`Error fetching Surah ${surahNumber}:`, error);
    throw error;
  }
};

export const fetchEditions = async (type: 'audio' | 'translation' | 'tafsir'): Promise<Edition[]> => {
  try {
    let url = `${API_BASE_URL}/edition?format=${type === 'audio' ? 'audio' : 'text'}`;
    if(type !== 'audio') {
        url += `&type=${type}`;
    } else {
        url += '&language=ar&type=versebyverse';
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} editions`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching ${type} editions:`, error);
    throw error;
  }
};