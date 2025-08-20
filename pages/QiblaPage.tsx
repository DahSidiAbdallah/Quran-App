import useLocalStorage from '../hooks/useLocalStorage';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/Icons';
import LoadingSpinner from '../components/LoadingSpinner';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

// Function to convert degrees to radians
const toRad = (deg: number) => (deg * Math.PI) / 180;

const QiblaPage = () => {
    useLocalStorage<'en' | 'ar' | 'fr'>('appLang', 'en');
    const navigate = useNavigate();
    const [qiblaDirection, setQiblaDirection] = useState(0);
    const [heading, setHeading] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get user's location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                const lat1 = toRad(latitude);
                const lon1 = toRad(longitude);
                const lat2 = toRad(KAABA_LAT);
                const lon2 = toRad(KAABA_LNG);

                const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
                const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
                const brng = (Math.atan2(y, x) * 180) / Math.PI;
                
                setQiblaDirection((brng + 360) % 360);
                setLoading(false);
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError(`Location Error: ${err.message}. Please allow location access and try again.`);
                setLoading(false);
            }
        );

        // Handle device orientation
        const handleOrientation = (event: DeviceOrientationEvent) => {
            // webkitCompassHeading is for iOS
            const compassHeading = (event as any).webkitCompassHeading ?? (typeof event.alpha === 'number' ? Math.abs(event.alpha - 360) : null);
            if (compassHeading !== null) {
                setHeading(compassHeading);
            }
        };

        if ('DeviceOrientationEvent' in window) {
             // Check for permission for non-webkit browsers
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                (DeviceOrientationEvent as any).requestPermission()
                    .then((permissionState: 'granted' | 'denied' | 'prompt') => {
                        if (permissionState === 'granted') {
                            window.addEventListener('deviceorientation', handleOrientation);
                        } else {
                            setError("Permission for device orientation not granted. You can still use the static Qibla direction.");
                        }
                    })
                    .catch((e: any) => setError(`Orientation Error: ${e.message}. You can still use the static Qibla direction.`));
            } else {
                 window.addEventListener('deviceorientation', handleOrientation);
            }
        } else {
            setError("Device orientation not supported on this browser.");
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    const retryLocation = () => {
        setLoading(true);
        setError(null);
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const lat1 = toRad(latitude);
            const lon1 = toRad(longitude);
            const lat2 = toRad(KAABA_LAT);
            const lon2 = toRad(KAABA_LNG);
            const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
            const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
            const brng = (Math.atan2(y, x) * 180) / Math.PI;
            setQiblaDirection((brng + 360) % 360);
            setLoading(false);
        }, (err) => {
            setError(`Location Error: ${err.message}.`);
            setLoading(false);
        });
    };

    const compassRotation = 360 - heading;
    const qiblaRotation = compassRotation + qiblaDirection;

    return (
        <div className="flex flex-col flex-1 bg-gray-900 text-white">
            <header className="sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10 shadow-sm">
                <div className="flex items-center gap-4 p-4">
                    <button onClick={() => navigate('/prayers')}><ArrowLeftIcon /></button>
                    <h1 className="text-lg font-bold">Qibla Compass</h1>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                {loading && <LoadingSpinner />}
                {error && (
                    <div>
                        <p className="text-red-400">{error}</p>
                        <div className="mt-4">
                            <button className="px-3 py-2 bg-brand-cyan rounded text-white" onClick={retryLocation}>Retry</button>
                        </div>
                    </div>
                )}
                
                {!loading && !error && (
                    <>
                        <p className="text-lg mb-4">Align the Kaaba icon with the top of your device.</p>
                        <div className="relative w-64 h-64">
                            <img src="https://img.icons8.com/ios-filled/200/ffffff/compass.png" alt="Compass"
                                className="w-full h-full transition-transform duration-200"
                                style={{ transform: `rotate(${compassRotation}deg)` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
                                 style={{ transform: `rotate(${qiblaRotation}deg)` }}>
                                <div className="relative w-full h-full">
                                    <img src="https://img.icons8.com/ios-glyphs/90/2CA5B4/kaaba.png" alt="Qibla direction" className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-12 h-12" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 font-mono text-xl">
                            <p>Qibla: {qiblaDirection.toFixed(2)}°</p>
                            <p>North: {heading.toFixed(2)}°</p>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default QiblaPage;