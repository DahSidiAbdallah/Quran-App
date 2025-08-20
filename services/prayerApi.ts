import { PrayerTimeData } from '../types';

const PRAYER_API_BASE_URL = 'https://api.aladhan.com/v1';

export const fetchPrayerTimes = async (latitude: number, longitude: number): Promise<PrayerTimeData> => {
  const date = new Date();
  const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  // Using ISNA (Islamic Society of North America) calculation method.
  const method = 2;

  try {
    const response = await fetch(`${PRAYER_API_BASE_URL}/timings/${dateString}?latitude=${latitude}&longitude=${longitude}&method=${method}`);
    if (!response.ok) {
      throw new Error('Failed to fetch prayer times');
    }
    const data = await response.json();
    if (data.code !== 200) {
        throw new Error(data.data || 'Error from prayer times API');
    }
    return data.data;
  } catch (error) {
    console.error('Error fetching Prayer Times:', error);
    throw error;
  }
};
