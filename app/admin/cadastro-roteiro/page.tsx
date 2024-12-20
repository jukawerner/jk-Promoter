"use client";

import { useState, useRef, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 200px)",
};

const center = {
  lat: -23.550520,  // São Paulo
  lng: -46.633308,
};

interface Location {
  id: string;
  name: string;
  address: string;
  position: google.maps.LatLngLiteral;
  priority: boolean;
}

export default function CadastroRoteiro() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [startPoint, setStartPoint] = useState("");
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const mapRef = useRef<google.maps.Map>();

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const addLocation = async (address: string) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address });
      
      if (result.results[0]) {
        const newLocation: Location = {
          id: Date.now().toString(),
          name: address,
          address: result.results[0].formatted_address,
          position: result.results[0].geometry.location.toJSON(),
          priority: false,
        };
        
        setLocations([...locations, newLocation]);
        updateRoute([...locations, newLocation]);
      }
    } catch (error) {
      console.error("Erro ao geocodificar endereço:", error);
    }
  };

  const updateRoute = async (locs: Location[]) => {
    if (locs.length < 2) return;

    const directionsService = new google.maps.DirectionsService();
    
    try {
      const origin = locs[0].position;
      const destination = locs[locs.length - 1].position;
      const waypoints = locs.slice(1, -1).map(loc => ({
        location: loc.position,
        stopover: true,
      }));

      const result = await directionsService.route({
        origin,
        destination,
        waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirections(result);
    } catch (error) {
      console.error("Erro ao calcular rota:", error);
    }
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newLocation: Location = {
        id: Date.now().toString(),
        name: `Ponto ${locations.length + 1}`,
        address: `${event.latLng.lat()}, ${event.latLng.lng()}`,
        position: event.latLng.toJSON(),
        priority: false,
      };
      
      setLocations([...locations, newLocation]);
      updateRoute([...locations, newLocation]);
    }
  };

  const removeLocation = (id: string) => {
    const newLocations = locations.filter(loc => loc.id !== id);
    setLocations(newLocations);
    updateRoute(newLocations);
  };

  const togglePriority = (id: string) => {
    const newLocations = locations.map(loc => 
      loc.id === id ? { ...loc, priority: !loc.priority } : loc
    );
    setLocations(newLocations);
    updateRoute(newLocations);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cadastro de Roteiro</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => {}}>Desfazer</Button>
          <Button variant="outline" onClick={() => {}}>Refazer</Button>
          <Button onClick={() => {}}>Exportar Roteiro</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Pontos do Roteiro</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite um endereço"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                />
                <Button onClick={() => addLocation(startPoint)}>Adicionar</Button>
              </div>
              
              <div className="space-y-2">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="truncate">{location.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePriority(location.id)}
                      >
                        {location.priority ? "Prioritário" : "Normal"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeLocation(location.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-3">
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={12}
              onClick={handleMapClick}
              onLoad={onMapLoad}
            >
              {locations.map((location) => (
                <Marker
                  key={location.id}
                  position={location.position}
                  draggable={true}
                  onClick={() => setSelectedLocation(location)}
                />
              ))}
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="hidden">Editar Ponto</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ponto</DialogTitle>
          </DialogHeader>
          {selectedLocation && (
            <div className="space-y-4">
              <Input
                placeholder="Nome do ponto"
                value={selectedLocation.name}
                onChange={(e) => {
                  setSelectedLocation({
                    ...selectedLocation,
                    name: e.target.value,
                  });
                }}
              />
              <Input
                placeholder="Endereço"
                value={selectedLocation.address}
                onChange={(e) => {
                  setSelectedLocation({
                    ...selectedLocation,
                    address: e.target.value,
                  });
                }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedLocation(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  if (selectedLocation) {
                    const newLocations = locations.map(loc =>
                      loc.id === selectedLocation.id ? selectedLocation : loc
                    );
                    setLocations(newLocations);
                    setSelectedLocation(null);
                  }
                }}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
