import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import axios from 'axios'

export default function FarmMap({ farmDetails, farms }) {
    const { t, translateRegion } = useLanguage()
    const [regionData, setRegionData] = useState(null)
    const [mapError, setMapError] = useState(null)
    const mapRef = useRef(null)

    useEffect(() => {
        if (!farmDetails || !farmDetails.location) {
            setRegionData(null)
            return
        }

        // Fetch region data with coordinates
        const fetchRegionData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/regions/')
                const regions = response.data
                
                // Find the region matching the farm's location
                const matchingRegion = regions.find(region => 
                    region.name === farmDetails.location || 
                    region.name_ar === farmDetails.location
                )
                
                if (matchingRegion) {
                    setRegionData(matchingRegion)
                    setMapError(null)
                } else {
                    // If region not found, try to get coordinates from farmDetails.region if it's an object
                    if (farmDetails.region && typeof farmDetails.region === 'object') {
                        setRegionData(farmDetails.region)
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
    const zoom = regionData?.latitude ? 10 : defaultZoom

    // Use Google Maps JavaScript API
    // Note: In production, you should use an environment variable for the API key
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    
    const loadGoogleMapsScript = () => {
        if (window.google && window.google.maps) {
            initMap()
            return
        }

        // If no API key, use embed iframe as fallback
        if (!GOOGLE_MAPS_API_KEY) {
            setMapError('Google Maps API key not configured')
            return
        }

        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
        if (existingScript) {
            existingScript.addEventListener('load', () => initMap())
            if (window.google && window.google.maps) {
                initMap()
            }
            return
        }

        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => {
            if (window.google && window.google.maps) {
                initMap()
            }
        }
        script.onerror = () => {
            setMapError('Failed to load Google Maps. Please check your API key.')
        }
        document.head.appendChild(script)
    }

    const initMap = () => {
        if (!mapRef.current || !window.google) return

        const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: latitude, lng: longitude },
            zoom: zoom,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        })

        // Add marker for the farm location
        if (regionData && regionData.latitude && regionData.longitude) {
            // Create custom marker icon
            const markerIcon = {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#10b981',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3
            }

            // Create marker
            const marker = new window.google.maps.Marker({
                position: { lat: regionData.latitude, lng: regionData.longitude },
                map: map,
                title: farmDetails?.name || translateRegion(farmDetails?.location || ''),
                icon: markerIcon,
                animation: window.google.maps.Animation.DROP
            })

            // Add info window
            const infoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 8px; min-width: 200px;">
                        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b; font-size: 16px;">${farmDetails?.name || ''}</h3>
                        <p style="margin: 0; color: #64748b; font-size: 14px;">${translateRegion(farmDetails?.location || '')}</p>
                        ${regionData.soil_type ? `<p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;"><strong>${t('soilType')}:</strong> ${regionData.soil_type}</p>` : ''}
                        ${farmDetails?.size_hectares ? `<p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;"><strong>${t('size')}:</strong> ${farmDetails.size_hectares} ${t('hectares')}</p>` : ''}
                    </div>
                `
            })

            // Open info window on marker click
            marker.addListener('click', () => {
                infoWindow.open(map, marker)
            })

            // Open info window by default
            infoWindow.open(map, marker)
        } else if (farmDetails?.location) {
            // If no coordinates, try geocoding
            const geocoder = new window.google.maps.Geocoder()
            geocoder.geocode({ address: farmDetails.location + ', Algeria' }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const location = results[0].geometry.location
                    map.setCenter(location)
                    map.setZoom(12)

                    const marker = new window.google.maps.Marker({
                        position: location,
                        map: map,
                        title: farmDetails?.name || translateRegion(farmDetails?.location || ''),
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#10b981',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 3
                        },
                        animation: window.google.maps.Animation.DROP
                    })

                    // Add info window for geocoded location
                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `
                            <div style="padding: 8px; min-width: 200px;">
                                <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b; font-size: 16px;">${farmDetails?.name || ''}</h3>
                                <p style="margin: 0; color: #64748b; font-size: 14px;">${translateRegion(farmDetails?.location || '')}</p>
                            </div>
                        `
                    })

                    marker.addListener('click', () => {
                        infoWindow.open(map, marker)
                    })
                }
            })
        }
    }

    useEffect(() => {
        if (farmDetails && farmDetails.location) {
            loadGoogleMapsScript()
        }
    }, [farmDetails, regionData])

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
                    {farmDetails?.location && (
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(farmDetails.location + ', Algeria')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 underline text-xs mt-2 inline-block"
                        >
                            {t('openInGoogleMaps')}
                        </a>
                    )}
                </div>
            ) : (
                <div className="relative w-full h-[300px] sm:h-[350px] rounded-lg overflow-hidden border border-slate-200">
                    <div 
                        ref={mapRef} 
                        className="w-full h-full"
                        style={{ minHeight: '300px' }}
                    />
                    {!window.google && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                            <div className="text-center p-4">
                                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-sm text-slate-600">{t('loadingMap')}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {regionData && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-slate-700">
                        <span className="font-semibold text-emerald-700">{t('region')}:</span> {translateRegion(regionData.name)}
                    </p>
                    {regionData.soil_type && (
                        <p className="text-xs sm:text-sm text-slate-700 mt-1">
                            <span className="font-semibold text-emerald-700">{t('soilType')}:</span> {regionData.soil_type}
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

