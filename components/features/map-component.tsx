'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
import type { AgriOffice } from '@/lib/agri-offices'
import 'leaflet/dist/leaflet.css'

interface MapComponentProps {
  userLocation: { lat: number; lng: number }
  offices: AgriOffice[]
  selectedOfficeId: string | null
  onOfficeSelect: (office: AgriOffice) => void
}

export default function MapComponent({
  userLocation,
  offices,
  selectedOfficeId,
  onOfficeSelect,
}: MapComponentProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<LeafletMarker[]>([])
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(onOfficeSelect)

  onSelectRef.current = onOfficeSelect

  useEffect(() => {
    if (!mapContainerRef.current || typeof window === 'undefined') return

    let cancelled = false

    import('leaflet').then((leafletModule) => {
      if (cancelled || !mapContainerRef.current) return

      const L = leafletModule.default

      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current, {
          center: [userLocation.lat, userLocation.lng],
          zoom: 11,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapRef.current)
      }

      const map = mapRef.current
      map.setView([userLocation.lat, userLocation.lng], map.getZoom())

      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const userIcon = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })

      const officeIcon = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })

      const selectedIcon = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [28, 46],
        iconAnchor: [14, 46],
        popupAnchor: [1, -40],
      })

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('Your location')
      markersRef.current.push(userMarker)

      offices.forEach((office) => {
        const isSelected = office.id === selectedOfficeId
        const marker = L.marker([office.lat, office.lng], {
          icon: isSelected ? selectedIcon : officeIcon,
        })
          .addTo(map)
          .bindPopup(office.name)

        marker.on('click', () => onSelectRef.current(office))
        markersRef.current.push(marker)
      })

      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        ...offices.map((o) => [o.lat, o.lng] as [number, number]),
      ])
      map.fitBounds(bounds.pad(0.15))
      requestAnimationFrame(() => map.invalidateSize())
    })

    return () => {
      cancelled = true
    }
  }, [userLocation.lat, userLocation.lng, offices, selectedOfficeId])

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full min-h-[384px] z-0"
      aria-label="Agricultural offices map"
    />
  )
}
