"use client";

import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 300px)",
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
  store_id?: number;
}

interface RouteInfo {
  distance: string;
  duration: string;
}

interface Promoter {
  id: number;
  nome: string;
  endereco: string;
}

interface Store {
  id: number;
  nome: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export default function CadastroRoteiro() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedPromoter, setSelectedPromoter] = useState<Promoter | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchPromoters();
  }, []);

  useEffect(() => {
    if (selectedPromoter) {
      fetchStores(selectedPromoter.id);
      // Adicionar endereço do promotor como ponto inicial
      const promoterLocation: Location = {
        id: 'promoter-home',
        name: 'Ponto Inicial (Promotor)',
        address: selectedPromoter.endereco,
        position: { lat: 0, lng: 0 },
      };
      geocodeAddress(promoterLocation);
    }
  }, [selectedPromoter]);

  const fetchPromoters = async () => {
    const { data, error } = await supabase
      .from('usuario')
      .select('id, nome, endereco')
      .eq('role', 'promotor');
    
    if (error) {
      console.error('Erro ao buscar promotores:', error);
      return;
    }
    
    setPromoters(data);
  };

  const fetchStores = async (promoterId: number) => {
    const { data, error } = await supabase
      .from('lojas')
      .select('id, nome, endereco, numero, bairro, cidade, uf')
      .eq('id_promotor', promoterId);
    
    if (error) {
      console.error('Erro ao buscar lojas:', error);
      return;
    }
    
    setStores(data);
  };

  const geocodeAddress = async (location: Location) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: location.address });
      
      if (result.results[0]) {
        const geocodedLocation: Location = {
          ...location,
          address: result.results[0].formatted_address,
          position: result.results[0].geometry.location.toJSON(),
        };
        
        setLocations(prev => {
          const filtered = prev.filter(loc => loc.id !== location.id);
          return [...filtered, geocodedLocation];
        });
        
        if (locations.length > 0) {
          updateRoute([...locations, geocodedLocation]);
        }
      }
    } catch (error) {
      console.error("Erro ao geocodificar endereço:", error);
    }
  };

  const addStore = async (store: Store) => {
    const address = `${store.endereco}, ${store.numero} - ${store.bairro}, ${store.cidade} - ${store.uf}`;
    const newLocation: Location = {
      id: `store-${store.id}`,
      name: store.nome,
      address: address,
      position: { lat: 0, lng: 0 },
      store_id: store.id,
    };
    
    geocodeAddress(newLocation);
  };

  const updateRoute = async (locs: Location[]) => {
    if (locs.length < 2) {
      setDirections(null);
      setRouteInfo(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    
    try {
      const firstLocation = locs[0];
      const lastLocation = locs[locs.length - 1];

      if (!firstLocation || !lastLocation) {
        throw new Error('Invalid locations array');
      }

      const origin = firstLocation.position;
      const destination = lastLocation.position;
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
      
      // Calcular informações da rota
      const route = result.routes[0];
      if (!route || !route.legs) {
        throw new Error('Invalid route result');
      }
      
      const distance = route.legs.reduce((total, leg) => {
        if (!leg.distance?.value) return total;
        return total + leg.distance.value;
      }, 0);
      const duration = route.legs.reduce((total, leg) => {
        if (!leg.duration?.value) return total;
        return total + leg.duration.value;
      }, 0);
      
      setRouteInfo({
        distance: `${(distance / 1000).toFixed(1)} km`,
        duration: `${Math.round(duration / 60)} min`,
      });
    } catch (error) {
      console.error("Erro ao calcular rota:", error);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(locations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    if (!reorderedItem) return;
    
    items.splice(result.destination.index, 0, reorderedItem);

    setLocations(items);
    updateRoute(items);
  };

  const removeLocation = (index: number) => {
    const newLocations = locations.filter((_, i) => i !== index);
    setLocations(newLocations);
    updateRoute(newLocations);
  };

  const saveRoute = async () => {
    if (!selectedPromoter || locations.length < 2 || !locations[0]) {
      alert('Selecione um promotor e adicione pelo menos 2 pontos no roteiro');
      return;
    }

    try {
      const { error } = await supabase.from('roteiros').insert({
        id_promotor: selectedPromoter.id,
        endereco_inicial: locations[0].address,
        pontos_rota: locations.map(loc => ({
          id: loc.id,
          name: loc.name,
          address: loc.address,
          position: loc.position,
          store_id: loc.store_id,
        })),
      });

      if (error) throw error;
      alert('Roteiro salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar roteiro:', error);
      alert('Erro ao salvar roteiro');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-7xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cadastro de Roteiro</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecione o Promotor
        </label>
        <Select onValueChange={(value) => {
          const promoter = promoters.find(p => p.id === parseInt(value));
          setSelectedPromoter(promoter || null);
          setLocations([]);
          setDirections(null);
        }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um promotor" />
          </SelectTrigger>
          <SelectContent>
            {promoters.map((promoter) => (
              <SelectItem key={promoter.id} value={promoter.id.toString()}>
                {promoter.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPromoter && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Lojas Disponíveis</h2>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {stores.map((store) => (
                    <Button
                      key={store.id}
                      variant="outline"
                      className="w-full justify-start text-left"
                      onClick={() => addStore(store)}
                    >
                      <div>
                        <div className="font-medium">{store.nome}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {store.endereco}, {store.numero}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Roteiro Atual</h2>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="locations">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {locations.map((location, index) => (
                          <Draggable key={location.id} draggableId={location.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white p-3 rounded border"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">
                                      {index + 1}. {location.name}
                                    </div>
                                    <div className="text-sm text-gray-500">{location.address}</div>
                                  </div>
                                  {index !== 0 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeLocation(index)}
                                    >
                                      ✕
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {routeInfo && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm font-medium">Informações da Rota:</div>
                    <div className="text-sm text-gray-600">Distância: {routeInfo.distance}</div>
                    <div className="text-sm text-gray-600">Duração: {routeInfo.duration}</div>
                  </div>
                )}
              </Card>

              <Button className="w-full" onClick={saveRoute}>
                Salvar Roteiro
              </Button>
            </div>

            <div className="md:col-span-2">
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={12}
                  options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: true,
                  }}
                >
                  {locations.map((location, index) => (
                    <Marker
                      key={location.id}
                      position={location.position}
                      label={{
                        text: (index + 1).toString(),
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  ))}
                  {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
              </LoadScript>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
