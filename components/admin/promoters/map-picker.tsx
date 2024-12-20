"use client";

import { useEffect, useState, useCallback } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';

interface MapPickerProps {
  address: string;
  onAddressChange: (address: string) => void;
  onCepChange: (cep: string) => void;
}

const defaultCenter = {
  lat: -27.5969,
  lng: -48.5495
};

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem'
};

const options = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy' as const
};

export function MapPicker({ address, onAddressChange, onCepChange }: MapPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [center, setCenter] = useState(defaultCenter);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  const updateAddressAndCep = useCallback(async (results: google.maps.GeocoderResult[]) => {
    if (results && results[0]) {
      const newAddress = results[0].formatted_address;
      onAddressChange(newAddress);

      const postalCodeComponent = results[0].address_components.find(
        component => component.types.includes('postal_code')
      );
      
      if (postalCodeComponent) {
        const cep = postalCodeComponent.long_name.replace(/\D/g, '');
        const formattedCep = cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
        onCepChange(formattedCep);
      }
    }
  }, [onAddressChange, onCepChange]);

  useEffect(() => {
    if (!isLoaded || !address || !map) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const newCenter = {
          lat: location.lat(),
          lng: location.lng()
        };
        setCenter(newCenter);
        map.panTo(newCenter);
        
        if (marker) {
          marker.setPosition(location);
        }
      }
    });
  }, [address, map, marker, isLoaded]);

  const handleMapClick = useCallback((e: google.maps.MouseEvent) => {
    const clickedLat = e.latLng?.lat();
    const clickedLng = e.latLng?.lng();
    
    if (clickedLat && clickedLng && marker) {
      const newPosition = new google.maps.LatLng(clickedLat, clickedLng);
      marker.setPosition(newPosition);
      
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: newPosition }, (results, status) => {
        if (status === 'OK') {
          updateAddressAndCep(results);
        }
      });
    }
  }, [marker, updateAddressAndCep]);

  const onMarkerLoad = useCallback((marker: google.maps.Marker) => {
    setMarker(marker);
  }, []);

  if (loadError) {
    return <div className="w-full h-[400px] rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
      Erro ao carregar o mapa
    </div>;
  }

  if (!isLoaded) {
    return <div className="w-full h-[400px] rounded-lg bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
    </div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={15}
      onClick={handleMapClick}
      onLoad={setMap}
      options={options}
    >
      <Marker
        position={center}
        draggable={true}
        onDragEnd={(e) => {
          if (e.latLng) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: e.latLng }, (results, status) => {
              if (status === 'OK') {
                updateAddressAndCep(results);
              }
            });
          }
        }}
        onLoad={onMarkerLoad}
      />
    </GoogleMap>
  );
}
