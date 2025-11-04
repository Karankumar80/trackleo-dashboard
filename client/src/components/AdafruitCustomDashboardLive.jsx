import React, { useEffect, useMemo, useRef, useState } from "react";

// ---------- helpers ----------
const fmtTime = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

// ---------- Premium Card Component ----------
function PremiumCard({ children, className = "", gradient = false }) {
    return (
        <div className={`bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : ''} ${className}`}>
            {children}
        </div>
    );
}

// ---------- Metric Card Component ----------
function MetricCard({ icon, label, value, unit, color = "blue", progress = null }) {
    const colorClasses = {
        red: "text-red-500 bg-red-50",
        blue: "text-blue-500 bg-blue-50",
        orange: "text-orange-500 bg-orange-50",
        purple: "text-purple-500 bg-purple-50",
        green: "text-green-500 bg-green-50",
    };

    return (
        <PremiumCard className="p-6">
            <div className="flex flex-col items-center justify-center h-full">
                <div className={`w-14 h-14 rounded-2xl ${colorClasses[color]} flex items-center justify-center mb-4`}>
                    {icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
                {unit && <div className="text-sm text-gray-500 mb-2">{unit}</div>}
                <div className="text-xs text-gray-600 font-medium">{label}</div>
                {progress !== null && (
                    <div className="w-full mt-4">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${colorClasses[color].split(' ')[0]}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-center">{progress}%</div>
                    </div>
                )}
            </div>
        </PremiumCard>
    );
}

// ---------- Enhanced Map Component ----------
function MapBox({ lat, lon, distance, speed }) {
    const ref = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        let mapInstance;
        (async () => {
            try {
                if (!ref.current) return;
                const mod = await import("leaflet");
                const L = mod.default || mod;
                if (!document.querySelector("#leaflet-css")) {
                    const link = document.createElement("link");
                    link.id = "leaflet-css";
                    link.rel = "stylesheet";
                    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                    document.head.appendChild(link);
                }

                if (mapRef.current) {
                    mapRef.current.remove();
                }

                mapInstance = L.map(ref.current).setView([lat || 13.0827, lon || 80.2707], lat && lon ? 13 : 2);
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 19,
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(mapInstance);

                if (lat && lon) {
                    if (markerRef.current) {
                        mapInstance.removeLayer(markerRef.current);
                    }
                    const customIcon = L.divIcon({
                        className: 'custom-marker',
                        html: `<div style="
              width: 24px;
              height: 24px;
              background: #3b82f6;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              animation: pulse 2s infinite;
            "></div>
            <style>
              @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.3); opacity: 0.7; }
              }
            </style>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });
                    markerRef.current = L.marker([lat, lon], { icon: customIcon }).addTo(mapInstance);
                    mapInstance.setView([lat, lon], 13);
                }

                mapRef.current = mapInstance;
            } catch (e) {
                console.error("Leaflet init failed:", e);
            }
        })();
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [lat, lon]);

    return (
        <div className="relative">
            <div ref={ref} className="rounded-3xl overflow-hidden shadow-lg" style={{ height: '420px' }} />
            {(distance !== null || speed !== null) && (
                <div className="absolute bottom-4 left-4 flex gap-3">
                    {distance !== null && (
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">Distance</div>
                            <div className="text-lg font-bold text-gray-900">{distance}</div>
                        </div>
                    )}
                    {speed !== null && (
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">Speed</div>
                            <div className="text-lg font-bold text-gray-900">{speed}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ---------- Icons (SVG) ----------
const HeartIcon = () => (
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);

const ThermometerIcon = () => (
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1h-1v1h1v2h-1v1h1v2h-2V5z" />
    </svg>
);

const OxygenIcon = () => (
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path fill="white" d="M12 6v6l4 2" />
    </svg>
);

const StepsIcon = () => (
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.5 2.5c-.8 0-1.5.7-1.5 1.5v2h-2v-2c0-.8-.7-1.5-1.5-1.5S8 3.2 8 4v2H6v-2c0-.8-.7-1.5-1.5-1.5S3 3.2 3 4v16h2V10h2v10h2V8h2v12h2V6h2v14h2V4c0-.8-.7-1.5-1.5-1.5z" />
    </svg>
);

const CaloriesIcon = () => (
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
    </svg>
);

export default function AdafruitCustomDashboardLive({
    wsUrl = "",
    feeds = { mpu6050: "mpu-data", tmp117: "temp-data", max30102: "max-data", gps: "gps-data" },
}) {
    const [latest, setLatest] = useState({});
    const [wsConnected, setWsConnected] = useState(false);
    const [prevCoords, setPrevCoords] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // Enhanced WebSocket for real-time updates
    useEffect(() => {
        const target =
            wsUrl ||
            (typeof window !== "undefined"
                ? window.location.protocol.replace("http", "ws") +
                "//" +
                window.location.host +
                "/ws/aio"
                : "");
        if (!target) return;
        let alive = true;
        let ws;
        let timer;
        const connect = () => {
            ws = new WebSocket(target);
            ws.onopen = () => {
                setWsConnected(true);
                console.log("WebSocket connected for real-time updates");
            };
            ws.onmessage = (e) => {
                try {
                    const msg = JSON.parse(e.data);
                    if (msg && msg.feed) {
                        const created_at = msg.created_at || new Date().toISOString();
                        console.log('WebSocket message received:', msg.feed, msg.value);
                        setLatest((prev) => {
                            const prevData = prev[msg.feed];
                            const prevTs = prevData?.created_at;
                            const prevValue = prevData?.value;

                            // Always update if timestamp is newer, or if value changed
                            const isNewer = !prevTs || new Date(created_at) > new Date(prevTs);
                            const valueChanged = prevValue !== String(msg.value);

                            if (isNewer || valueChanged) {
                                console.log('Updating feed:', msg.feed, 'with value:', msg.value, '(was:', prevValue, ')');
                                setLastUpdate(new Date());
                                return { ...prev, [msg.feed]: { value: msg.value, created_at } };
                            }
                            return prev;
                        });
                    }
                } catch (err) {
                    console.error('WebSocket message error:', err);
                }
            };
            ws.onclose = () => {
                setWsConnected(false);
                if (alive) {
                    timer = setTimeout(connect, 2000);
                }
            };
            ws.onerror = () => {
                setWsConnected(false);
                ws.close();
            };
        };
        connect();
        return () => {
            alive = false;
            clearTimeout(timer);
            ws && ws.close();
        };
    }, [wsUrl]);

    // Initial fetch on mount
    useEffect(() => {
        let aborted = false;
        const feedKeys = Object.values(feeds);
        const fetchOne = async (key) => {
            try {
                const res = await fetch(`/api/aio/feed/${encodeURIComponent(key)}/latest`);
                if (!res.ok) return;
                const arr = await res.json();
                const item = Array.isArray(arr) ? arr[0] : null;
                if (!item || aborted) return;
                setLatest((prev) => {
                    const prevTs = prev[key]?.created_at;
                    if (!prevTs || new Date(item.created_at) > new Date(prevTs)) {
                        setLastUpdate(new Date());
                        return { ...prev, [key]: { value: item.value, created_at: item.created_at } };
                    }
                    return prev;
                });
            } catch (e) {
                console.error(`Error fetching ${key}:`, e);
            }
        };
        feedKeys.forEach(fetchOne);
        return () => {
            aborted = true;
        };
    }, [feeds]);

    // Automatic polling fallback (every 3 seconds for more responsive updates)
    useEffect(() => {
        const feedKeys = Object.values(feeds);
        let aborted = false;

        const pollAll = async () => {
            if (aborted) return;
            console.log('Polling all feeds...');
            for (const key of feedKeys) {
                try {
                    const res = await fetch(`/api/aio/feed/${encodeURIComponent(key)}/latest`);
                    if (!res.ok) {
                        console.warn(`Poll failed for ${key}:`, res.status);
                        continue;
                    }
                    const arr = await res.json();
                    const item = Array.isArray(arr) ? arr[0] : null;
                    if (!item || aborted) continue;

                    setLatest((prev) => {
                        const prevData = prev[key];
                        const prevTs = prevData?.created_at;
                        const prevValue = prevData?.value;

                        // Always update if timestamp is newer, or if value changed but timestamp is same
                        const isNewer = !prevTs || new Date(item.created_at) > new Date(prevTs);
                        const valueChanged = prevValue !== String(item.value);

                        if (isNewer || valueChanged) {
                            console.log(`Poll update: ${key} = ${item.value} (was: ${prevValue})`);
                            setLastUpdate(new Date());
                            return { ...prev, [key]: { value: item.value, created_at: item.created_at } };
                        }
                        return prev;
                    });
                } catch (e) {
                    console.error(`Poll error for ${key}:`, e);
                }
            }
        };

        // Initial poll immediately
        pollAll();
        // Then poll every 3 seconds
        const interval = setInterval(pollAll, 3000);

        return () => {
            aborted = true;
            clearInterval(interval);
        };
    }, [feeds]);

    // Parse sensor data
    const tempValue = useMemo(() => {
        const v = latest[feeds.tmp117]?.value;
        return v != null ? Number(v) : null;
    }, [latest, feeds]);

    // Convert Celsius to Fahrenheit and add 2.7°F offset
    const tempFahrenheit = useMemo(() => {
        if (tempValue === null) return null;
        return (tempValue * 9 / 5) + 32 + 2.7;
    }, [tempValue]);

    const maxData = useMemo(() => {
        const v = latest[feeds.max30102]?.value;
        if (!v) return { heartRate: null, spO2: null, heartRateProgress: null, spO2Progress: null };
        const str = String(v).trim();

        let heartRate = null;
        let spO2 = null;

        // Try parsing as comma-separated (e.g., "75,98" for heart rate, SpO2)
        const parts = str.split(/[,\s]+/).filter(Boolean).map(Number);
        if (parts.length >= 2 && parts.every(n => Number.isFinite(n))) {
            heartRate = Math.round(parts[0]);
            spO2 = Math.round(parts[1]);
        } else {
            // Try JSON
            try {
                const json = JSON.parse(str);
                heartRate = json.heartRate || json.heart || json.bpm || null;
                spO2 = json.spO2 || json.spo2 || json.oxygen || null;
            } catch { }
        }

        // Clamp BPM to 60-120 range and calculate progress
        let heartRateProgress = null;
        if (heartRate !== null) {
            heartRate = Math.max(60, Math.min(120, Math.round(heartRate)));
            // Calculate progress: 0% at 60, 100% at 120
            heartRateProgress = Math.round(((heartRate - 60) / (120 - 60)) * 100);
        }

        // Clamp SpO2 to 90-100 range and calculate progress
        let spO2Progress = null;
        if (spO2 !== null) {
            spO2 = Math.max(90, Math.min(100, Math.round(spO2)));
            // Calculate progress: 0% at 90, 100% at 100
            spO2Progress = Math.round(((spO2 - 90) / (100 - 90)) * 100);
        }

        return {
            heartRate: heartRate,
            spO2: spO2,
            heartRateProgress: heartRateProgress,
            spO2Progress: spO2Progress,
        };
    }, [latest, feeds]);

    const coords = useMemo(() => {
        const v = latest[feeds.gps]?.value;
        if (!v) return { lat: null, lon: null, ts: null };

        let lat = null, lon = null;
        const str = String(v).trim();

        try {
            const json = JSON.parse(str);
            lat = parseFloat(json.lat || json.latitude || json.Lat || json.Latitude);
            lon = parseFloat(json.lon || json.longitude || json.Lon || json.Longitude);
            if (Number.isFinite(lat) && Number.isFinite(lon)) {
                return { lat, lon, ts: latest[feeds.gps]?.created_at };
            }
        } catch { }

        const parts = str.split(/[,\s]+/).filter(Boolean);
        if (parts.length >= 2) {
            lat = parseFloat(parts[0]);
            lon = parseFloat(parts[1]);
            if (Number.isFinite(lat) && Number.isFinite(lon)) {
                return { lat, lon, ts: latest[feeds.gps]?.created_at };
            }
        }

        return { lat: null, lon: null, ts: latest[feeds.gps]?.created_at };
    }, [latest, feeds]);

    // Calculate distance and speed from GPS
    const { distance, speed } = useMemo(() => {
        if (!coords.lat || !coords.lon) return { distance: null, speed: null };

        if (prevCoords && prevCoords.lat && prevCoords.lon) {
            // Haversine formula for distance
            const R = 6371; // Earth radius in km
            const dLat = ((coords.lat - prevCoords.lat) * Math.PI) / 180;
            const dLon = ((coords.lon - prevCoords.lon) * Math.PI) / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((prevCoords.lat * Math.PI) / 180) *
                Math.cos((coords.lat * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const dist = R * c;

            // Calculate speed if we have timestamps
            let speedKmh = null;
            if (prevCoords.ts && coords.ts) {
                const timeDiff = (new Date(coords.ts) - new Date(prevCoords.ts)) / 1000 / 3600; // hours
                if (timeDiff > 0) {
                    speedKmh = dist / timeDiff;
                }
            }

            return {
                distance: dist < 0.1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(2)} km`,
                speed: speedKmh ? `${speedKmh.toFixed(1)} km/h` : null,
            };
        }

        return { distance: null, speed: null };
    }, [coords, prevCoords]);

    // Update previous coordinates
    useEffect(() => {
        if (coords.lat && coords.lon) {
            setPrevCoords(coords);
        }
    }, [coords.lat, coords.lon]);

    // Parse MPU data for steps/activity
    const mpuData = useMemo(() => {
        const v = latest[feeds.mpu6050]?.value;
        if (!v) return { steps: null, calories: null };
        const str = String(v).trim();
        // Try parsing as comma-separated values
        const parts = str.split(/[,\s]+/).filter(Boolean).map(Number);
        if (parts.length >= 2 && parts.every(n => Number.isFinite(n))) {
            // Estimate steps from accelerometer data (simplified)
            const steps = Math.abs(Math.round(parts[0] * 100 + parts[1] * 50));
            const calories = Math.round(steps * 0.04); // Rough estimate
            return { steps, calories };
        }
        return { steps: null, calories: null };
    }, [latest, feeds]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="https://trackleo.com/assets/navigation-icon.webp"         // put your file in public/logo.png
                                alt="Logo"
                                className="w-10 h-10 rounded-2xl object-cover"
                            />

                            <h1 className="text-2xl font-bold text-gray-900">Trackleo</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-xs text-gray-500">
                                Last update: {lastUpdate.toLocaleTimeString()}
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${wsConnected ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                                <span className="text-xs font-medium">
                                    {wsConnected ? 'Live' : 'Polling'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                {/* Map Section */}
                <PremiumCard gradient>
                    <div className="p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Location Tracking</h2>
                            <p className="text-sm text-gray-500">
                                {coords.lat && coords.lon
                                    ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)} • ${fmtTime(coords.ts)}`
                                    : "Waiting for GPS data..."}
                            </p>
                        </div>
                        <MapBox lat={coords.lat} lon={coords.lon} distance={distance} speed={speed} />
                    </div>
                </PremiumCard>

                {/* Health Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                        icon={<HeartIcon />}
                        label="Heart Rate"
                        value={maxData.heartRate ?? "—"}
                        unit="BPM (60-120)"
                        color="red"
                        progress={maxData.heartRateProgress}
                    />
                    <MetricCard
                        icon={<OxygenIcon />}
                        label="SpO2"
                        value={maxData.spO2 ? `${maxData.spO2}%` : "—"}
                        unit="Oxygen (90-100%)"
                        color="blue"
                        progress={maxData.spO2Progress}
                    />
                    <MetricCard
                        icon={<ThermometerIcon />}
                        label="Temperature"
                        value={tempFahrenheit ? `${tempFahrenheit.toFixed(1)}°F` : "—"}
                        unit="Temp"
                        color="orange"
                    />
                </div>

                {/* Activity Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MetricCard
                        icon={<StepsIcon />}
                        label="Steps Today"
                        value={mpuData.steps ? mpuData.steps.toLocaleString() : "—"}
                        unit="Steps Today"
                        color="purple"
                        progress={mpuData.steps ? Math.min(100, Math.round((mpuData.steps / 10000) * 100)) : null}
                    />
                    <MetricCard
                        icon={<CaloriesIcon />}
                        label="Calories Burned"
                        value={mpuData.calories ?? "—"}
                        unit="Calories Burned"
                        color="orange"
                        progress={mpuData.calories ? Math.min(100, Math.round((mpuData.calories / 600) * 100)) : null}
                    />
                </div>

                {/* Raw Data Section (Collapsible) */}
                <PremiumCard>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Raw Sensor Data</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <div className="text-sm font-medium text-gray-700 mb-2">MPU6050 Data</div>
                                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                    {latest[feeds.mpu6050]?.value || "Waiting…"}
                                </pre>
                                <div className="text-xs text-gray-400 mt-2">
                                    Updated: {fmtTime(latest[feeds.mpu6050]?.created_at)}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <div className="text-sm font-medium text-gray-700 mb-2">MAX30102 Data</div>
                                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                    {latest[feeds.max30102]?.value || "Waiting…"}
                                </pre>
                                <div className="text-xs text-gray-400 mt-2">
                                    Updated: {fmtTime(latest[feeds.max30102]?.created_at)}
                                </div>
                            </div>
                        </div>
                    </div>
                </PremiumCard>
            </div>
        </div>
    );
}
