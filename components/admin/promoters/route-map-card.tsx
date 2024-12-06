"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Label } from "@/components/ui/label";

interface RouteMapCardProps {
  promoterAddress: string;
  promoterCity: string;
  stores: Array<{ name: string; address: string; city: string }>;
}

export function RouteMapCard({ promoterAddress, promoterCity, stores }: RouteMapCardProps) {
  const [locations, setLocations] = useState<Array<{ lat: number; lng: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const customIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const homeIcon = new Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  useEffect(() => {
    const fetchLocations = async () => {
      if (!promoterAddress || !promoterCity) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Buscar localização do promotor
        const promoterResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            `${promoterAddress}, ${promoterCity}`
          )}`
        );
        const promoterData = await promoterResponse.json();

        if (promoterData && promoterData[0]) {
          const promoterLocation = {
            lat: parseFloat(promoterData[0].lat),
            lng: parseFloat(promoterData[0].lon),
            name: "Residência do Promotor",
          };

          const allLocations = [promoterLocation];

          // Buscar localização das lojas
          for (const store of stores) {
            const storeResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                `${store.address}, ${store.city}`
              )}`
            );
            const storeData = await storeResponse.json();

            if (storeData && storeData[0]) {
              allLocations.push({
                lat: parseFloat(storeData[0].lat),
                lng: parseFloat(storeData[0].lon),
                name: store.name,
              });
            }
          }

          // Adicionar ponto de retorno
          allLocations.push({
            ...promoterLocation,
            name: "Retorno à Residência",
          });

          setLocations(allLocations);
        }
      } catch (error) {
        console.error("Erro ao buscar localizações:", error);
        setError("Erro ao carregar o mapa");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [promoterAddress, promoterCity, stores]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Label className="text-lg font-semibold block mb-4">
          Rota do Promotor
        </Label>
        <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Label className="text-lg font-semibold block mb-4">
          Rota do Promotor
        </Label>
        <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Label className="text-lg font-semibold block mb-4">
          Rota do Promotor
        </Label>
        <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            Preencha o endereço do promotor e selecione as lojas para visualizar a rota
          </p>
        </div>
      </div>
    );
  }

  const center = locations[0];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Label className="text-lg font-semibold block mb-4">
        Rota do Promotor
      </Label>
      <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {locations.map((location, index) => (
            <Marker
              key={index}
              position={[location.lat, location.lng]}
              icon={index === 0 || index === locations.length - 1 ? homeIcon : customIcon}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{location.name}</strong>
                  {index === 0 && <p>Ponto de Partida</p>}
                  {index === locations.length - 1 && <p>Ponto de Retorno</p>}
                </div>
              </Popup>
            </Marker>
          ))}
          <Polyline
            positions={locations.map(loc => [loc.lat, loc.lng])}
            color="#2563eb"
            weight={3}
            opacity={0.7}
          />
        </MapContainer>
      </div>
    </div>
  );
}