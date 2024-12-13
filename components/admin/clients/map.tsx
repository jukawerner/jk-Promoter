"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  location: [number, number];
  onLocationChange?: (lat: number, lng: number) => void;
}

function MapUpdater({ location }: { location: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(location, map.getZoom());
  }, [location, map]);
  
  return null;
}

function MapEventHandler({ onLocationChange }: { onLocationChange?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationChange) {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  
  return null;
}

export default function Map({ location, onLocationChange }: MapProps) {
  const mapRef = useRef<L.Map>(null);
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker && onLocationChange) {
        const latLng = marker.getLatLng();
        onLocationChange(latLng.lat, latLng.lng);
      }
    },
  };

  return (
    <div className="h-full w-full">
      <MapContainer
        center={location}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker 
          position={location} 
          draggable={!!onLocationChange}
          eventHandlers={eventHandlers}
          ref={markerRef}
        >
          <Popup>
            Localização do Cliente
            <br />
            {onLocationChange && "(Arraste para ajustar a localização)"}
          </Popup>
        </Marker>
        <MapUpdater location={location} />
        <MapEventHandler onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
}