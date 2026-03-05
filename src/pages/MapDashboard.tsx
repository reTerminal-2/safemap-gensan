import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, Search, Navigation, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

// Mock Data for Hotspots (Static for now)
const MOCK_HOTSPOTS = [
    { id: '1', name: 'Barangay Lagao', lat: 6.1306, lng: 125.1917, risk: 85 },
    { id: '2', name: 'Barangay Calumpang', lat: 6.0967, lng: 125.1436, risk: 62 },
    { id: '3', name: 'Barangay City Heights', lat: 6.1133, lng: 125.1719, risk: 45 },
    { id: '4', name: 'Barangay San Isidro', lat: 6.1389, lng: 125.1758, risk: 78 },
]

const GENSAN_LANDMARKS = [
    { name: 'SM City General Santos', lat: 6.1215, lng: 125.1742 },
    { name: 'KCC Mall of GenSan', lat: 6.1207, lng: 125.1798 },
    { name: 'Robinsons Place GenSan', lat: 6.1082, lng: 125.1878 },
    { name: 'Gaisano Mall GenSan', lat: 6.1171, lng: 125.1775 },
    { name: 'General Santos City Hall', lat: 6.1128, lng: 125.1706 },
    { name: 'Notre Dame of Dadiangas University', lat: 6.1185, lng: 125.1721 },
    { name: 'MSU General Santos', lat: 6.1158, lng: 125.1172 },
    { name: 'St. Elizabeth Hospital', lat: 6.1192, lng: 125.1755 },
    { name: 'Pioneer Avenue', lat: 6.1152, lng: 125.1732 },
    { name: 'General Santos City Fish Port', lat: 6.0622, lng: 125.1528 },
    { name: 'Plaza General Santos', lat: 6.1125, lng: 125.1715 },
]

const GENSAN_BOUNDS = {
    minLat: 6.0000,
    maxLat: 6.2500,
    minLon: 125.0000,
    maxLon: 125.3000
};

export default function MapDashboard() {
    const [isConsoleVisible, setIsConsoleVisible] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [mapCenter, setMapCenter] = useState<[number, number]>([6.1167, 125.1667]);
    const [mapZoom, setMapZoom] = useState(13);
    const [showUnverified, setShowUnverified] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

    // Real-time alerts and incidents from Supabase
    const [incidents, setIncidents] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: incidentData } = await supabase
                .from('incidents')
                .select('*')
                .order('created_at', { ascending: false })

            const { data: alertData } = await supabase
                .from('alerts')
                .select('*')
                .order('created_at', { ascending: false })

            if (incidentData) setIncidents(incidentData)
            if (alertData) setAlerts(alertData)
        }

        fetchData()

        // Subscribe to incident changes
        const incidentChannel = supabase
            .channel('public:incidents')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
                fetchData() // Simple approach: refetch on change
            })
            .subscribe()

        // Subscribe to alert changes
        const alertChannel = supabase
            .channel('public:alerts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
                fetchData()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(incidentChannel)
            supabase.removeChannel(alertChannel)
        }
    }, [])

    // Fetch suggestions from Photon
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoadingSuggestions(true);
            try {
                // Search in local mock hotspots + landmarks
                const localHotspotMatches = MOCK_HOTSPOTS.filter(h =>
                    h.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(h => ({
                    ...h,
                    isHotspot: true,
                    name: h.name,
                    display_name: `${h.name}, GenSan`,
                    lat: h.lat.toString(),
                    lon: h.lng.toString()
                }));

                const landmarkMatches = GENSAN_LANDMARKS.filter(l =>
                    l.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(l => ({
                    name: l.name,
                    display_name: `${l.name}, GenSan`,
                    lat: l.lat.toString(),
                    lon: l.lng.toString(),
                    isHotspot: false,
                    isLandmark: true
                }));

                const localMatches = [...localHotspotMatches, ...landmarkMatches];

                const boostQuery = `${searchQuery} General Santos`.trim();
                const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(boostQuery)}&lat=6.1167&lon=125.1667&limit=15&location_bias_scale=0.9`;

                const response = await fetch(url);
                const data = await response.json();

                const photonSuggestions = (data.features || [])
                    .filter((f: any) => {
                        const [lon, lat] = f.geometry.coordinates;
                        return (
                            lat >= GENSAN_BOUNDS.minLat &&
                            lat <= GENSAN_BOUNDS.maxLat &&
                            lon >= GENSAN_BOUNDS.minLon &&
                            lon <= GENSAN_BOUNDS.maxLon
                        );
                    })
                    .map((f: any) => {
                        const p = f.properties;
                        const name = p.name || p.street || p.city;
                        const parts = [];
                        if (p.street) parts.push(p.street);
                        if (p.district) parts.push(p.district);
                        if (p.suburb) parts.push(p.suburb);
                        const subtitle = parts.length > 0 ? parts.join(', ') : "General Santos City";

                        return {
                            name: name,
                            subtitle: subtitle,
                            display_name: `${name}, ${subtitle}`,
                            lat: f.geometry.coordinates[1].toString(),
                            lon: f.geometry.coordinates[0].toString(),
                            isHotspot: false
                        };
                    });

                const combined = [
                    ...localMatches.map(m => ({ ...m, subtitle: m.isHotspot ? "High Risk Area" : "Major Landmark" })),
                    ...photonSuggestions.filter((d: any) => !localMatches.some(m => m.name.toLowerCase() === d.name.toLowerCase()))
                ];

                setSuggestions(combined.slice(0, 6));
                setActiveSuggestionIndex(-1);
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
        const map = useMap();
        useEffect(() => {
            map.setView(center, zoom, { animate: true, duration: 1.5 });
        }, [center, zoom, map]);
        return null;
    }

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;
        setShowSuggestions(false);

        try {
            const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&lat=6.1167&lon=125.1667&limit=1`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const [lon, lat] = data.features[0].geometry.coordinates;
                setMapCenter([lat, lon]);
                setMapZoom(16);
            }
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleSelectSuggestion = (suggestion: any) => {
        setMapCenter([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
        setMapZoom(17);
        setSearchQuery(suggestion.isHotspot ? suggestion.name : suggestion.display_name.split(',')[0]);
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveSuggestionIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter') {
            if (activeSuggestionIndex >= 0) {
                e.preventDefault();
                handleSelectSuggestion(suggestions[activeSuggestionIndex]);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div className="relative h-full w-full bg-slate-50 overflow-hidden flex flex-col">
            {/* TOP COMMAND HEADER */}
            <div className="absolute top-0 left-0 right-0 z-[20] p-3 safe-area-pt">
                <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-2xl mx-auto md:mx-0">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-[#2b5ba9] border border-white/20 flex items-center justify-center md:hidden shadow-md">
                        <Shield size={20} className="text-white" />
                    </div>
                    <div className="flex-1 relative search-container">
                        <div className="bg-white h-10 rounded-xl flex items-center px-4 shadow-sm border border-slate-200 overflow-hidden focus-within:border-[#2b5ba9] transition-colors">
                            <Search size={16} className="text-slate-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search General Santos (Supabase)..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={handleKeyDown}
                                className="bg-transparent border-none outline-none text-xs w-full placeholder:text-slate-300 text-slate-800 font-medium"
                            />
                            {isLoadingSuggestions && (
                                <div className="h-4 w-4 border-2 border-[#2b5ba9]/30 border-t-[#2b5ba9] rounded-full animate-spin" />
                            )}
                        </div>
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl z-[50]">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index} type="button" onClick={() => handleSelectSuggestion(suggestion)}
                                        className={cn("w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 flex items-center justify-between", activeSuggestionIndex === index ? "bg-slate-50" : "hover:bg-slate-50")}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", suggestion.isHotspot ? "bg-red-50 text-red-500" : suggestion.isLandmark ? "bg-blue-50 text-blue-500" : "bg-slate-50 text-slate-400")}>
                                                {suggestion.isHotspot ? <AlertTriangle size={14} /> : suggestion.isLandmark ? <Navigation size={12} /> : <Navigation size={12} className="rotate-45" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold text-slate-800 truncate">{suggestion.name}</p>
                                                <p className="text-[9px] text-slate-400 truncate uppercase font-bold tracking-tight">{suggestion.isHotspot ? `RISK AREA • ${suggestion.subtitle}` : suggestion.subtitle}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-[#2b5ba9] hover:bg-[#1e4480] text-white shadow-md transition-transform">
                        <Navigation size={18} />
                    </Button>
                </form>
            </div>

            {/* FULL-SCREEN MAP */}
            <div className="flex-1 z-0">
                <MapContainer center={mapCenter} zoom={mapZoom} zoomControl={false} className="h-full w-full">
                    <MapController center={mapCenter} zoom={mapZoom} />
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {MOCK_HOTSPOTS.map((spot) => (
                        <CircleMarker key={spot.id} center={[spot.lat, spot.lng]} radius={15 + (spot.risk / 10)} pathOptions={{ fillColor: spot.risk > 75 ? '#ef4444' : spot.risk > 50 ? '#f59e0b' : '#22c55e', color: 'white', weight: 2, fillOpacity: 0.15 }}>
                            <Popup>
                                <div className="p-2 min-w-[120px]">
                                    <p className="text-[10px] font-black uppercase text-[#2b5ba9] tracking-widest mb-1">Risk Assessment</p>
                                    <h3 className="font-black text-slate-900 text-sm leading-tight">{spot.name}</h3>
                                    <p className="text-xl font-black text-red-600 mt-1">{spot.risk}% <span className="text-[10px] uppercase text-slate-400">Security Risk</span></p>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}

                    {/* Official Broadcast Alerts (from Supabase) */}
                    {alerts.map((alert) => (
                        <CircleMarker key={alert.id} center={[alert.location.lat, alert.location.lng]} radius={12} pathOptions={{ fillColor: '#ef4444', color: 'white', weight: 3, fillOpacity: 1 }}>
                            <Popup>
                                <div className="p-3 min-w-[200px]">
                                    <Badge className="bg-red-600 text-white text-[8px] uppercase mb-2">OFFICIAL ALERT</Badge>
                                    <h4 className="font-black text-slate-900 text-base leading-tight">{alert.title}</h4>
                                    <p className="text-xs text-slate-600 font-bold mt-1 leading-relaxed">{alert.description}</p>
                                    <div className="mt-2 text-[8px] text-slate-400 uppercase font-black">Reported: {new Date(alert.created_at).toLocaleString()}</div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}

                    {/* Incident Markers from Community/Responders (Supabase) */}
                    {incidents.filter(inc => showUnverified || inc.status === 'verified').map((inc) => (
                        <CircleMarker
                            key={inc.id} center={[inc.location.lat, inc.location.lng]} radius={inc.status === 'verified' ? 10 : 8}
                            pathOptions={{ fillColor: inc.status === 'verified' ? '#2b5ba9' : '#f59e0b', color: 'white', weight: 2, fillOpacity: 1 }}
                        >
                            <Popup>
                                <div className="p-2 min-w-[150px]">
                                    <Badge variant={inc.status === 'verified' ? "default" : "outline"} className={cn("text-[8px] uppercase mb-1", inc.status === 'verified' ? "bg-[#2b5ba9]" : "text-amber-600 border-amber-200 bg-amber-50")}>
                                        {inc.status === 'verified' ? "PNP Verified" : "Citizen Report"}
                                    </Badge>
                                    <h4 className="font-black text-slate-900 text-sm leading-tight">{inc.type}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold mt-1 max-h-20 overflow-hidden">{inc.description}</p>
                                    <div className="mt-2 text-[8px] text-slate-400 uppercase font-black">Reported: {new Date(inc.created_at).toLocaleString()}</div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>

            {/* LAYER TOGGLE */}
            <div className="absolute top-16 right-3 z-[20] flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowUnverified(!showUnverified)} className={cn("rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest h-10 px-4 transition-all shadow-sm", showUnverified ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-white text-slate-600")}>
                    {showUnverified ? "Hide Community" : "Show Community"}
                </Button>
            </div>

            <div className={cn("absolute bottom-20 left-0 right-0 z-[20] flex flex-col gap-3 px-3 pointer-events-none transition-all duration-500", isConsoleVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0")}>
                {/* Stats Stup */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide pointer-events-auto">
                    <div className="bg-white border border-slate-200 min-w-[110px] p-3 rounded-xl flex items-center gap-3 shadow-lg">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400"><Shield size={16} /></div>
                        <div><p className="text-[8px] text-slate-400 uppercase font-bold leading-none mb-1">Live Safety</p><p className="text-[14px] font-black leading-none">{incidents.filter(i => i.status === 'verified').length}</p></div>
                    </div>
                    <div className="bg-white border border-slate-200 min-w-[110px] p-3 rounded-xl flex items-center gap-3 shadow-lg">
                        <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400"><AlertTriangle size={16} /></div>
                        <div><p className="text-[8px] text-slate-400 uppercase font-bold leading-none mb-1">Reports</p><p className="text-[14px] font-black leading-none">{incidents.length}</p></div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-[90px] right-4 flex gap-2 z-[30]">
                <Button onClick={() => setIsConsoleVisible(!isConsoleVisible)} className="h-14 w-14 rounded-2xl shadow-xl bg-white border border-slate-200 text-slate-400" size="icon">
                    {isConsoleVisible ? <EyeOff size={24} /> : <Eye size={24} />}
                </Button>
            </div>
        </div>
    )
}
