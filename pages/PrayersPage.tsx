import useLocalStorage from '../hooks/useLocalStorage';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrayerTimeData, PrayerTimes } from '../types';
import { fetchPrayerTimes } from '../services/prayerApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { MapPinIcon, CompassIcon, SunriseIcon, SunIcon, SunsetIcon, MoonIcon } from '../components/Icons';

const PrayerTimeRow = ({ name, time, icon }: { name: string, time: string, icon: React.ReactNode }) => {
    // A simple way to check if a prayer time is in the past for styling
    const isPast = () => {
        const now = new Date();
        const [hour, minute] = time.split(':').map(Number);
        const prayerDate = new Date();
        prayerDate.setHours(hour, minute, 0, 0);
        return now > prayerDate;
    };

    return (
        <div className={`flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm ${isPast() ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4">
                <div className="text-brand-cyan">{icon}</div>
                <span className="font-semibold text-brand-dark dark:text-gray-200">{name}</span>
            </div>
            <span className="text-lg font-bold text-brand-teal">{time}</span>
        </div>
    )
};

const PrayersPage = () => {
    useLocalStorage<'en' | 'ar' | 'fr'>('appLang', 'en');
    const [prayerData, setPrayerData] = useState<PrayerTimeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getPrayerTimes = (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            fetchPrayerTimes(latitude, longitude)
                .then(data => {
                    setPrayerData(data);
                })
                .catch((err: any) => {
                    console.error('Prayer API error:', err);
                    setError('Unable to load prayer times right now. Check your internet connection or try again.');
                })
                .finally(() => {
                    setLoading(false);
                });
        };

        const handleLocationError = (error: GeolocationPositionError) => {
            setLoading(false);
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    setLocationError("Location access denied. Allow location access in your browser settings and retry.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    setLocationError("Could not determine your location. Try again or enter location manually.");
                    break;
                case error.TIMEOUT:
                    setLocationError("Getting location timed out. Ensure your device has a location signal and try again.");
                    break;
                default:
                    setLocationError("An unexpected error occurred while determining your location.");
                    break;
            }
        };

        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(getPrayerTimes, handleLocationError, { timeout: 10000 });
        } else {
            setLoading(false);
            setLocationError("Geolocation is not supported by this browser. You can still view prayer times by setting your location in settings.");
        }
    }, []);

    const prayerIcons: Record<keyof PrayerTimes, React.ReactNode> = {
        Fajr: <SunriseIcon className="w-6 h-6" />,
        Sunrise: <SunriseIcon className="w-6 h-6" />,
        Dhuhr: <SunIcon className="w-6 h-6" />,
        Asr: <SunsetIcon className="w-6 h-6" />,
        Maghrib: <SunsetIcon className="w-6 h-6" />,
        Isha: <MoonIcon className="w-6 h-6" />,
    };

    return (
        <div className="flex flex-col flex-1 bg-brand-light dark:bg-gray-900">
            <header className="p-4 space-y-4 bg-white dark:bg-gray-800 shadow-sm">
                <h1 className="text-2xl font-bold text-center text-brand-dark dark:text-white">Prayer Times</h1>
                {prayerData && (
                    <div className="text-center">
                        <p className="font-semibold text-brand-dark dark:text-gray-200">{prayerData.date.readable}</p>
                        <p className="text-sm text-brand-gray dark:text-gray-400">{`${prayerData.date.hijri.day} ${prayerData.date.hijri.month.en} ${prayerData.date.hijri.year}`}</p>
                    </div>
                )}
            </header>
            
            <main className="p-4 overflow-y-auto pb-24">
                <button onClick={() => navigate('/qibla')} className="w-full flex items-center justify-center gap-2 mb-4 p-3 bg-brand-cyan text-white font-semibold rounded-lg shadow-md hover:bg-brand-teal transition-colors">
                    <CompassIcon className="w-5 h-5" />
                    <span>Qibla Compass</span>
                </button>

                {loading && <LoadingSpinner />}
                
                {locationError && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-center">
                         <MapPinIcon className="w-8 h-8 mx-auto mb-2" />
                         <h3 className="font-bold">Location</h3>
                        <p>{locationError}</p>
                        <div className="mt-3 flex justify-center gap-2">
                            <button onClick={() => window.location.reload()} className="px-3 py-2 bg-brand-cyan text-white rounded">Retry</button>
                        </div>
                    </div>
                )}

                {error && (
                     <div className="p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-center">
                        <h3 className="font-bold">Unable to load</h3>
                        <p>{error}</p>
                        <div className="mt-3 flex justify-center gap-2">
                            <button onClick={() => window.location.reload()} className="px-3 py-2 bg-brand-cyan text-white rounded">Retry</button>
                        </div>
                    </div>
                )}
                
                {prayerData && (
                    <div className="space-y-3">
                        {(
                            Object.keys(prayerData.timings) as Array<keyof PrayerTimes>
                        ).map((key) => {
                            const icon = prayerIcons[key];
                            const time = prayerData.timings[key];
                            if (!icon) return null;
                            return (
                                <div key={String(key)}>
                                    <PrayerTimeRow name={String(key)} time={time} icon={icon} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PrayersPage;