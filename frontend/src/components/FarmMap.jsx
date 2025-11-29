import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet with Vite
// Using CDN URLs for marker icons to avoid Vite asset issues
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
})

// Custom green marker icon for farms
const createFarmIcon = () => {
    return L.divIcon({
        className: 'custom-farm-marker',
        html: `
            <div style="
                width: 30px;
                height: 30px;
                background-color: #10b981;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    })
}

// Component to handle automatic zoom to region
function ChangeMapView({ center, zoom }) {
    const map = useMap()
    
    useEffect(() => {
        if (center && Array.isArray(center) && center.length === 2 && typeof zoom === 'number') {
            // Use flyTo for smooth animation
            map.flyTo(center, zoom, {
                duration: 1.5
            })
        }
    }, [center, zoom, map])
    
    return null
}

export default function FarmMap({ farmDetails, farms }) {
    const { t, translateRegion, translateSoil } = useLanguage()
    const [regionData, setRegionData] = useState(null)
    const [mapError, setMapError] = useState(null)
    const [mapKey, setMapKey] = useState(0)

    useEffect(() => {
        if (!farmDetails || !farmDetails.location) {
            setRegionData(null)
            return
        }

        // Fetch region data and geocode if needed
        const fetchRegionData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/regions/')
                const regions = response.data
                
                // Find the region matching the farm's location
                let matchingRegion = regions.find(region => 
                    region.name === farmDetails.location || 
                    region.name_ar === farmDetails.location
                )
                
                // If region found but no coordinates, geocode the region name
                if (matchingRegion && (!matchingRegion.latitude || !matchingRegion.longitude)) {
                    try {
                        // Use Nominatim (OpenStreetMap) geocoding service
                        const regionName = matchingRegion.name
                        const geocodeResponse = await axios.get(
                            `https://nominatim.openstreetmap.org/search`,
                            {
                                params: {
                                    q: `${regionName}, Algeria`,
                                    format: 'json',
                                    limit: 1
                                },
                                headers: {
                                    'User-Agent': 'AgroVisor/1.0' // Required by Nominatim
                                }
                            }
                        )
                        
                        if (geocodeResponse.data && geocodeResponse.data.length > 0) {
                            const result = geocodeResponse.data[0]
                            matchingRegion = {
                                ...matchingRegion,
                                latitude: parseFloat(result.lat),
                                longitude: parseFloat(result.lon)
                            }
                        }
                    } catch (geocodeError) {
                        console.error('Geocoding error:', geocodeError)
                        // Continue with region data even if geocoding fails
                    }
                }
                
                // If region not found in database, try geocoding the location name directly
                if (!matchingRegion) {
                    try {
                        const geocodeResponse = await axios.get(
                            `https://nominatim.openstreetmap.org/search`,
                            {
                                params: {
                                    q: `${farmDetails.location}, Algeria`,
                                    format: 'json',
                                    limit: 1
                                },
                                headers: {
                                    'User-Agent': 'AgroVisor/1.0'
                                }
                            }
                        )
                        
                        if (geocodeResponse.data && geocodeResponse.data.length > 0) {
                            const result = geocodeResponse.data[0]
                            matchingRegion = {
                                name: farmDetails.location,
                                name_ar: farmDetails.location,
                                latitude: parseFloat(result.lat),
                                longitude: parseFloat(result.lon),
                                soil_type: null
                            }
                        }
                    } catch (geocodeError) {
                        console.error('Geocoding error:', geocodeError)
                    }
                }
                
                if (matchingRegion) {
                    setRegionData(matchingRegion)
                    setMapError(null)
                    // Force map remount when region data changes
                    setMapKey(prev => prev + 1)
                } else {
                    // If region not found, try to get coordinates from farmDetails.region if it's an object
                    if (farmDetails.region && typeof farmDetails.region === 'object') {
                        setRegionData(farmDetails.region)
                        setMapKey(prev => prev + 1)
                    } else {
                        setMapError('Region coordinates not available')
                    }
                }
            } catch (error) {
                console.error('Error fetching region data:', error)
                setMapError('Failed to load map data')
            }
        }

        fetchRegionData()
    }, [farmDetails])

    // Default coordinates for Algeria (center of country) if no region data
    const defaultLat = 28.0339
    const defaultLng = 1.6596
    const defaultZoom = 6

    // Get coordinates from region data or use defaults
    const latitude = regionData?.latitude || defaultLat
    const longitude = regionData?.longitude || defaultLng
    
    // Zoom levels for different scenarios:
    // - Region with coordinates: zoom 11 (shows region area well)
    // - No coordinates: zoom 6 (shows entire Algeria)
    const zoom = regionData?.latitude && regionData?.longitude ? 11 : defaultZoom

    if (!farmDetails || !farmDetails.location) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-emerald-100 card-hover">
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t('farmLocation')}
                </h3>
                <p className="text-sm text-slate-500 text-center py-8">
                    {t('selectFarmToViewLocation')}
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-emerald-100 card-hover">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('farmLocation')}: {farmDetails.name}
            </h3>
            
            {mapError ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                    <p className="font-semibold mb-1">{t('mapUnavailable')}</p>
                    <p className="text-xs">{mapError}</p>
                </div>
            ) : (
                <div className="relative w-full h-[300px] sm:h-[350px] rounded-lg overflow-hidden border border-slate-200">
                    <MapContainer
                        key={mapKey}
                        center={[latitude, longitude]}
                        zoom={zoom}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                        className="rounded-lg"
                    >
                        {regionData?.latitude && regionData?.longitude && (
                            <ChangeMapView center={[regionData.latitude, regionData.longitude]} zoom={11} />
                        )}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {regionData && regionData.latitude && regionData.longitude && (
                            <Marker 
                                position={[regionData.latitude, regionData.longitude]}
                                icon={createFarmIcon()}
                            >
                                <Popup>
                                    <div style={{ padding: '4px', minWidth: '200px' }}>
                                        <h3 style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1e293b', fontSize: '16px' }}>
                                            {farmDetails?.name || ''}
                                        </h3>
                                        <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
                                            {translateRegion(farmDetails?.location || '')}
                                        </p>
                                        {regionData.soil_type && (
                                            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '12px' }}>
                                                <strong>{t('soilType')}:</strong> {translateSoil(regionData.soil_type)}
                                            </p>
                                        )}
                                        {farmDetails?.size_hectares && (
                                            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '12px' }}>
                                                <strong>{t('size')}:</strong> {farmDetails.size_hectares} {t('hectares')}
                                            </p>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>
            )}
            
            {regionData && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-slate-700">
                        <span className="font-semibold text-emerald-700">{t('region')}:</span> {translateRegion(regionData.name)}
                    </p>
                    {regionData.soil_type && (
                        <p className="text-xs sm:text-sm text-slate-700 mt-1">
                            <span className="font-semibold text-emerald-700">{t('soilType')}:</span> {translateSoil(regionData.soil_type)}
                        </p>
                    )}
                    {regionData.latitude && regionData.longitude && (
                        <p className="text-xs text-slate-500 mt-1">
                            {regionData.latitude.toFixed(4)}, {regionData.longitude.toFixed(4)}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
