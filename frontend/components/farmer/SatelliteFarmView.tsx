// @ts-nocheck
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Satellite, Eye, Layers } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../translations';
import { NASA_GIBS_LAYERS, getGIBSLayerUrl } from '../../lib/nasa/worldviewService';

interface SatelliteFarmViewProps {
  lang: Language;
  latitude: number;
  longitude: number;
  farmName: string;
  boundary?: [number, number][];
}

export const SatelliteFarmView: React.FC<SatelliteFarmViewProps> = ({
  lang,
  latitude,
  longitude,
  farmName,
  boundary = [],
}) => {
  const t = (key: string) => translations[key]?.[lang] || key;
  const [selectedLayerKey, setSelectedLayerKey] = useState<string>('true_color');
  const [showBoundary] = useState(true);

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const nasaLayerRef = useRef<any>(null);
  const baseLayerRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);

  // Initialise the Leaflet map once on mount, destroy on unmount
  useEffect(() => {
    if (!mapDivRef.current) return;

    let L: any;
    let map: any;

    const init = async () => {
      // Dynamically import Leaflet to avoid SSR issues
      L = (await import('leaflet')).default;

      const container = mapDivRef.current;
      if (!container) return;

      // Nuclear cleanup: if Leaflet already stamped this element, wipe it
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      map = L.map(container, {
        center: [latitude, longitude],
        zoom: 8,
        scrollWheelZoom: true,
        zoomControl: true,
      });
      mapRef.current = map;

      // Base OSM layer
      const baseLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          opacity: selectedLayerKey === 'true_color' ? 0.3 : 0.8,
        }
      ).addTo(map);
      baseLayerRef.current = baseLayer;

      // NASA GIBS layer
      const currentLayer = NASA_GIBS_LAYERS[selectedLayerKey] || NASA_GIBS_LAYERS.true_color;
      const tileUrl = getGIBSLayerUrl(selectedLayerKey, 2);
      const nasaLayer = L.tileLayer(tileUrl, {
        attribution: `NASA EOSDIS GIBS | ${currentLayer.attribution}`,
        maxZoom: currentLayer.maxZoom,
        opacity: selectedLayerKey === 'true_color' ? 0.85 : 0.65,
      }).addTo(map);
      nasaLayerRef.current = nasaLayer;

      // Farm marker
      const marker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(`
          <div style="padding:8px;font-family:sans-serif;">
            <strong style="color:#166534;font-size:13px;">${farmName}</strong><br/>
            <span style="color:#52525b;font-size:11px;">Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}</span><br/>
            <span style="color:#2563eb;font-size:11px;font-weight:600;">${lang === 'bn' ? currentLayer.nameBn : currentLayer.nameEn}</span>
          </div>
        `);
      markerRef.current = marker;

      // Farm boundary polygon
      if (showBoundary) {
        const effectiveBoundary =
          boundary.length > 2
            ? boundary
            : [
                [latitude + 0.003, longitude - 0.003],
                [latitude + 0.003, longitude + 0.003],
                [latitude - 0.003, longitude + 0.003],
                [latitude - 0.003, longitude - 0.003],
              ];

        const polygon = L.polygon(effectiveBoundary as any, {
          color: '#10b981',
          weight: 2,
          fillColor: '#10b981',
          fillOpacity: 0.25,
          dashArray: '4, 4',
        }).addTo(map);
        polygonRef.current = polygon;
      }
    };

    init();

    return () => {
      // Full Leaflet teardown — this is the only guaranteed-safe way
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (_) { /* ignore */ }
        mapRef.current = null;
      }
      nasaLayerRef.current = null;
      baseLayerRef.current = null;
      markerRef.current = null;
      polygonRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  // Update NASA layer when the user switches layers (no full map reinit needed)
  useEffect(() => {
    if (!mapRef.current) return;

    const updateLayers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapRef.current;
      if (!map) return;

      const currentLayer = NASA_GIBS_LAYERS[selectedLayerKey] || NASA_GIBS_LAYERS.true_color;
      const tileUrl = getGIBSLayerUrl(selectedLayerKey, 2);

      // Remove old layers
      if (nasaLayerRef.current) { map.removeLayer(nasaLayerRef.current); nasaLayerRef.current = null; }
      if (baseLayerRef.current) { map.removeLayer(baseLayerRef.current); baseLayerRef.current = null; }

      // Re-add base layer with updated opacity
      baseLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
          opacity: selectedLayerKey === 'true_color' ? 0.3 : 0.8,
        }
      ).addTo(map);

      // Re-add NASA layer
      nasaLayerRef.current = L.tileLayer(tileUrl, {
        attribution: `NASA EOSDIS GIBS | ${currentLayer.attribution}`,
        maxZoom: currentLayer.maxZoom,
        opacity: selectedLayerKey === 'true_color' ? 0.85 : 0.65,
      }).addTo(map);

      // Update marker popup
      if (markerRef.current) {
        markerRef.current.setPopupContent(`
          <div style="padding:8px;font-family:sans-serif;">
            <strong style="color:#166534;font-size:13px;">${farmName}</strong><br/>
            <span style="color:#52525b;font-size:11px;">Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}</span><br/>
            <span style="color:#2563eb;font-size:11px;font-weight:600;">${lang === 'bn' ? currentLayer.nameBn : currentLayer.nameEn}</span>
          </div>
        `);
      }
    };

    updateLayers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLayerKey]);

  const currentLayer = NASA_GIBS_LAYERS[selectedLayerKey] || NASA_GIBS_LAYERS.true_color;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
            <Satellite className="w-7 h-7 text-green-700 dark:text-green-400" />
            {t('satellite_view_title')}
          </h2>
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
            {t('satellite_view_sub')}
          </p>
        </div>

        {/* NASA GIBS Layer Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.values(NASA_GIBS_LAYERS).map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setSelectedLayerKey(layer.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm ${
                selectedLayerKey === layer.id
                  ? 'bg-green-700 text-white shadow-md'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? layer.nameBn : layer.nameEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map Container — plain div, Leaflet takes over in useEffect */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-700 h-[520px] bg-zinc-900">
        <div
          ref={mapDivRef}
          style={{ height: '100%', width: '100%', zIndex: 10 }}
        />

        {/* Floating Legend */}
        <div className="absolute bottom-4 left-4 z-[400] max-w-sm p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 text-xs pointer-events-none">
          <div className="flex items-center justify-between mb-1">
            <span className="font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-green-600" />
              {lang === 'bn' ? currentLayer.nameBn : currentLayer.nameEn}
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              {currentLayer.attribution.split('/')[0]}
            </span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 font-semibold leading-relaxed">
            {lang === 'bn' ? currentLayer.descriptionBn : currentLayer.descriptionEn}
          </p>
        </div>
      </div>
    </div>
  );
};
