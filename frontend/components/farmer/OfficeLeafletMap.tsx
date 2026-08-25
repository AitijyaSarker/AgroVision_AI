'use client';

import { useEffect, useRef } from 'react';
import type { AgriOffice } from '@/lib/agri-offices';
import 'leaflet/dist/leaflet.css';

interface OfficeLeafletMapProps {
  userLocation: { lat: number; lng: number };
  offices: AgriOffice[];
  selectedOfficeId: string | null;
  onOfficeSelect: (office: AgriOffice) => void;
}

export default function OfficeLeafletMap({
  userLocation,
  offices,
  selectedOfficeId,
  onOfficeSelect,
}: OfficeLeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onOfficeSelect);
  onSelectRef.current = onOfficeSelect;

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return;

      const leaflet = L.default;

      delete (leaflet.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapRef.current) {
        mapRef.current = leaflet.map(containerRef.current).setView(
          [userLocation.lat, userLocation.lng],
          10
        );
        leaflet
          .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19,
          })
          .addTo(mapRef.current);
      }

      const map = mapRef.current;
      map.eachLayer((layer) => {
        if (layer instanceof leaflet.Marker) map.removeLayer(layer);
      });

      const userIcon = leaflet.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      const officeIcon = leaflet.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      const selectedIcon = leaflet.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [28, 46],
        iconAnchor: [14, 46],
      });

      leaflet
        .marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('Your location');

      offices.forEach((office) => {
        const marker = leaflet
          .marker([office.lat, office.lng], {
            icon: office.id === selectedOfficeId ? selectedIcon : officeIcon,
          })
          .addTo(map)
          .bindPopup(office.name);
        marker.on('click', () => onSelectRef.current(office));
      });

      const bounds = leaflet.latLngBounds([
        [userLocation.lat, userLocation.lng],
        ...offices.map((o) => [o.lat, o.lng] as [number, number]),
      ]);
      map.fitBounds(bounds.pad(0.12));
      setTimeout(() => map.invalidateSize(), 150);
    });

    return () => {
      cancelled = true;
    };
  }, [userLocation.lat, userLocation.lng, offices, selectedOfficeId]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[420px]" />;
}
