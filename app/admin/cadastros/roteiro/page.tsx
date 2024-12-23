"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { FileDown, Share2, Plus } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from "@/components/ui/toast";

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
console.log('Google Maps API Key:', googleMapsApiKey ? 'Configurada' : 'Não configurada');

interface Usuario {
  id: number;
  nome: string;
  endereco: string;
}

interface Store {
  id: number;
  nome: string;
  endereco: string;
  cep: string;
  latitude: number;
  longitude: number;
}

interface Route {
  id: string;
  name: string;
  usuario_id: number;
  stores: {
    id: string;
    order: number;
  }[];
  estimated_time: number;
  distance: number;
  created_at: string;
  updated_at: string;
}

interface Location {
  id: string | number;
  name: string;
  address: string;
  position: {
    lat: number;
    lng: number;
  };
  selected?: boolean;
}

interface RouteInfo {
  duration: string;
  distance: string;
  steps: google.maps.DirectionsStep[];
}

// Opções do mapa memoizadas
const mapOptions = {
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  markerClusterer: null,
  gestureHandling: 'cooperative',
  disableDefaultUI: false,
  zoomControl: true,
};

export default function CadastroRoteiro() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const mapRef = useRef<google.maps.Map | null> (null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: -28.4812,
    lng: -49.0061 // Coordenadas de Criciúma
  });
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ duration: string; distance: string }>({ duration: "", distance: "" });
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('Iniciando componente...');
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      console.log('Buscando usuários...');
      const { data, error } = await supabase
        .from('usuario')
        .select('id, nome, endereco')
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
      }
      
      console.log('Usuários encontrados:', data);
      if (data && data.length > 0) {
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(locations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocations(items);
    calculateRoute(items);
  };

  const moveLocation = (index: number, direction: 'up' | 'down') => {
    const items = Array.from(locations);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < items.length) {
      const [movedItem] = items.splice(index, 1);
      items.splice(newIndex, 0, movedItem);
      setLocations(items);
      calculateRoute(items);
    }
  };

  const searchViaCep = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('CEP não encontrado');
      const data = await response.json();
      if (data.erro) throw new Error('CEP não encontrado');
      return data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (!isLoaded) return null;
    
    try {
      console.log('Geocodificando endereço:', address);
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({
        address: address,
        region: 'BR'
      });

      if (result.results[0]?.geometry?.location) {
        const location = result.results[0].geometry.location;
        const coordinates = {
          lat: location.lat(),
          lng: location.lng()
        };
        console.log('Coordenadas encontradas:', coordinates);
        return coordinates;
      }
      return null;
    } catch (error) {
      console.error('Erro ao geocodificar endereço:', error);
      return null;
    }
  };

  const handleLocationSelect = (location: Location) => {
    console.log('Selecionando loja:', location);
    const newSelectedLocations = [...selectedLocations, location];
    setSelectedLocations(newSelectedLocations);
    setAvailableLocations(prev => prev.filter(loc => loc.id !== location.id));
    calculateRoute(newSelectedLocations);
  };

  const handleLocationRemove = (location: Location) => {
    console.log('Removendo loja:', location);
    const newSelectedLocations = selectedLocations.filter(loc => loc.id !== location.id);
    setSelectedLocations(newSelectedLocations);
    setAvailableLocations(prev => [...prev, location].sort((a, b) => a.name.localeCompare(b.name)));
    calculateRoute(newSelectedLocations);
  };

  const fetchStoresForUsuario = async (usuarioId: string) => {
    setIsLoading(true);
    try {
      console.log('Buscando lojas do usuário:', usuarioId);
      const { data, error } = await supabase
        .from('loja')
        .select('id, nome, endereco, cep, latitude, longitude')
        .eq('promotor_id', usuarioId)
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar lojas:', error);
        return;
      }

      if (data) {
        console.log('Lojas encontradas:', data);
        const processedLocations = data.map(store => ({
          id: store.id,
          name: store.nome,
          address: store.endereco,
          position: {
            lat: store.latitude || 0,
            lng: store.longitude || 0
          }
        }));

        setLocations([]);
        setSelectedLocations([]);
        setAvailableLocations(processedLocations);
      }
    } catch (error) {
      console.error('Erro ao buscar lojas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addLocation = (location: Location) => {
    setAvailableLocations(availableLocations.filter(l => l.id !== location.id));
    setLocations([...locations, { ...location, selected: true }]);
    calculateRoute([...locations, location]);
  };

  const fetchRoutes = async (usuarioId: string) => {
    try {
      console.log('Buscando rotas do usuário:', usuarioId);
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('usuario_id', usuarioId);

      if (error) {
        console.error('Erro ao buscar rotas:', error);
        throw error;
      }

      console.log('Rotas encontradas:', data);
      setRoutes(data || []);
    } catch (error) {
      console.error('Erro ao buscar rotas:', error);
      setRoutes([]);
    }
  };

  const handleAddRoute = async () => {
    if (!selectedUsuario || selectedLocations.length === 0) {
      toast({
        title: "Erro ao adicionar rota",
        description: "Selecione um usuário e pelo menos uma loja",
      });
      return;
    }

    try {
      console.log('Adicionando nova rota para usuário:', selectedUsuario.id);
      console.log('Lojas selecionadas:', selectedLocations);

      const newRoute = {
        name: `Rota ${routes.length + 1}`,
        usuario_id: selectedUsuario.id,
        stores: selectedLocations.map((loc, index) => ({
          id: loc.id,
          order: index
        })),
        estimated_time: parseInt(routeInfo.duration) || 0,
        distance: parseFloat(routeInfo.distance) || 0
      };

      console.log('Dados da nova rota:', newRoute);

      const { data, error } = await supabase
        .from('routes')
        .insert([newRoute])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar rota:', error);
        toast({
          title: "Erro ao salvar rota",
          description: error.message,
        });
        return;
      }

      console.log('Rota adicionada com sucesso:', data);
      setRoutes([...routes, data]);
      
      toast({
        title: "Sucesso!",
        description: "A rota foi salva com sucesso!",
      });

      // Limpa a seleção atual
      setSelectedLocations([]);
      setDirections(null);
      setRouteInfo({ duration: "", distance: "" });
    } catch (error) {
      console.error('Erro ao adicionar rota:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a rota",
      });
    }
  };

  const handleRouteClick = async (route: Route) => {
    setSelectedRoute(route);
    
    const routeLocations = locations.filter(loc => 
      route.stores.some(store => store.id === loc.id.toString())
    ).sort((a, b) => {
      const aOrder = route.stores.find(s => s.id === a.id.toString())?.order || 0;
      const bOrder = route.stores.find(s => s.id === b.id.toString())?.order || 0;
      return aOrder - bOrder;
    });

    setSelectedLocations(routeLocations);
    await calculateRoute(routeLocations);
  };

  const handleUsuarioSelect = async (usuarioId: string) => {
    setIsLoading(true);
    try {
      const usuario = usuarios.find(u => u.id.toString() === usuarioId);
      if (usuario) {
        console.log('Usuário selecionado:', usuario);
        setSelectedUsuario(usuario);

        // Geocodifica o endereço do usuário
        const coordinates = await geocodeAddress(usuario.endereco);
        if (coordinates) {
          setCenter(coordinates);
          map?.setCenter(coordinates);
          map?.setZoom(13);
        }

        await fetchStoresForUsuario(usuarioId);
      }
    } catch (error) {
      console.error('Erro ao selecionar usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRoute = useCallback(async (locations: Location[]) => {
    if (!selectedUsuario || !locations || locations.length < 1) {
      setDirections(null);
      setRouteInfo({ duration: "", distance: "" });
      return;
    }

    try {
      // Geocodifica o endereço do usuário
      const userCoordinates = await geocodeAddress(selectedUsuario.endereco);
      if (!userCoordinates) {
        console.error('Não foi possível encontrar as coordenadas do usuário');
        return;
      }

      const directionsService = new window.google.maps.DirectionsService();
      console.log('Calculando rota para:', locations);
      console.log('Endereço do usuário:', selectedUsuario.endereco);

      // Usa o endereço do usuário como ponto de partida e chegada
      const waypoints = locations.map(location => ({
        location: { lat: location.position.lat, lng: location.position.lng },
        stopover: true
      }));

      const result = await directionsService.route({
        origin: userCoordinates,
        destination: userCoordinates,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      console.log('Resultado da rota:', result);
      setDirections(result);

      // Calcula o tempo total e distância
      let totalDuration = 0;
      let totalDistance = 0;
      result.routes[0].legs.forEach(leg => {
        totalDuration += leg.duration?.value || 0;
        totalDistance += leg.distance?.value || 0;
      });

      // Converte para minutos e quilômetros
      const durationInMinutes = Math.round(totalDuration / 60);
      const distanceInKm = (totalDistance / 1000).toFixed(1);

      setRouteInfo({
        duration: durationInMinutes.toString(),
        distance: distanceInKm.toString()
      });
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      setDirections(null);
      setRouteInfo({ duration: "", distance: "" });
    }
  }, [selectedUsuario, isLoaded]);

  useEffect(() => {
    if (selectedUsuario) {
      fetchRoutes(selectedUsuario.id);
    }
  }, [selectedUsuario]);

  useEffect(() => {
    calculateRoute(selectedLocations);
  }, [selectedLocations, calculateRoute]);

  // Efeito para recalcular a rota quando as locations mudarem
  useEffect(() => {
    if (locations.length > 0 && selectedUsuario) {
      calculateRoute(locations);
    }
  }, [locations, selectedUsuario, calculateRoute]);

  useEffect(() => {
    if (selectedLocations.length > 0 && map) {
      const bounds = new window.google.maps.LatLngBounds();
      selectedLocations.forEach(location => {
        bounds.extend(new window.google.maps.LatLng(location.position.lat, location.position.lng));
      });
      map.fitBounds(bounds);
    }
  }, [selectedLocations, map]);

  useEffect(() => {
    if (selectedLocations.length > 0) {
      calculateRoute(selectedLocations);
    }
  }, [selectedLocations]);

  useEffect(() => {
    if (selectedLocations.length > 0 && map && isLoaded) {
      const bounds = new window.google.maps.LatLngBounds();
      selectedLocations.forEach(location => {
        bounds.extend(new window.google.maps.LatLng(location.position.lat, location.position.lng));
      });
      map.fitBounds(bounds);
    }
  }, [selectedLocations, map, isLoaded]);

  useEffect(() => {
    if (selectedUsuario?.endereco && map && isLoaded) {
      const coordinates = geocodeAddress(selectedUsuario.endereco);
      if (coordinates) {
        setCenter(coordinates);
        map.setCenter(coordinates);
        map.setZoom(13);
      }
    }
  }, [selectedUsuario, map, isLoaded]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
  };

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  const handleExportPDF = async () => {
    if (!selectedUsuario || selectedLocations.length === 0) {
      toast({
        title: "Erro ao exportar",
        description: "Selecione um usuário e pelo menos uma loja",
      });
      return;
    }

    try {
      // Captura a div que contém o mapa e a lista
      const element = document.getElementById('route-content');
      if (!element) return;

      toast({
        title: "Gerando PDF",
        description: "Aguarde enquanto geramos o PDF...",
      });

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY,
        scale: 2, // Melhor qualidade
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Cria o PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      });

      // Adiciona o cabeçalho
      pdf.setFillColor(52, 144, 220);
      pdf.rect(0, 0, pdf.internal.pageSize.width, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('Roteiro de Visitas', 20, 15);
      pdf.setFontSize(12);
      pdf.text(`Usuário: ${selectedUsuario.nome}`, 20, 23);

      // Calcula as dimensões para manter a proporção
      const imgWidth = pdf.internal.pageSize.width - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Adiciona a imagem
      pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);

      // Adiciona informações da rota
      const y = imgHeight + 50;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.text(`Tempo Estimado: ${routeInfo.duration} minutos`, 20, y);
      pdf.text(`Distância Total: ${routeInfo.distance} km`, 20, y + 8);

      // Lista as lojas
      pdf.text('Lojas no Roteiro:', 20, y + 20);
      selectedLocations.forEach((location, index) => {
        pdf.text(`${index + 1}. ${location.name}`, 30, y + 30 + (index * 8));
      });

      // Salva o PDF
      pdf.save(`roteiro_${selectedUsuario.nome}_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Sucesso!",
        description: "PDF gerado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o PDF",
      });
    }
  };

  const shareOnWhatsApp = () => {
    if (!routeInfo) return;
    
    const message = encodeURIComponent(
      `*Roteiro de Visitas*\n` +
      `Distância Total: ${routeInfo.distance}\n` +
      `Tempo Total: ${routeInfo.duration}\n\n` +
      `*Lojas:*\n` +
      locations.map((loc, i) => `${String.fromCharCode(65 + i)}. ${loc.name}`).join('\n')
    );
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Roteiro</h1>
      {/* Botões */}
      <div className="flex gap-4 mb-6">
        <Button
          variant="outline"
          onClick={handleExportPDF}
          disabled={!routeInfo || isLoading}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
        
        <Button
          variant="outline"
          onClick={shareOnWhatsApp}
          disabled={!routeInfo || isLoading}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar
        </Button>
        
        <Button 
          onClick={handleAddRoute}
          disabled={!selectedUsuario || selectedLocations.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Rota
        </Button>
      </div>

      {/* Seleção de Usuário */}
      <div className="mb-6">
        <Select onValueChange={handleUsuarioSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o Usuário" />
          </SelectTrigger>
          <SelectContent>
            {usuarios.map((usuario) => (
              <SelectItem key={usuario.id} value={usuario.id.toString()}>
                {usuario.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-gray-500 mt-1">
          {usuarios.length} usuários encontrados
        </div>
      </div>

      <div id="route-content" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Coluna da Esquerda - Lista de Lojas */}
        <div className="md:col-span-1">
          <div className="w-full max-w-md space-y-4">
            {/* Informações da Rota */}
            {routeInfo.duration && routeInfo.distance && (
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Tempo Estimado</h3>
                    <p className="text-2xl font-bold text-blue-600">{routeInfo.duration} min</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Distância</h3>
                    <p className="text-2xl font-bold text-blue-600">{routeInfo.distance} km</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Lojas Selecionadas */}
            {selectedLocations.length > 0 && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Lojas no Roteiro</h3>
                <div className="space-y-3">
                  {selectedLocations.map((location, index) => (
                    <div
                      key={location.id}
                      className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300"
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {location.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {location.address}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLocationRemove(location);
                        }}
                        className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Lojas Disponíveis */}
            {availableLocations.length > 0 && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Lojas Disponíveis</h3>
                <div className="space-y-3">
                  {availableLocations.map((location) => (
                    <div
                      key={location.id}
                      onClick={() => handleLocationSelect(location)}
                      className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {location.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {location.address}
                        </p>
                      </div>
                      <div className="flex-shrink-0 p-2 text-blue-500">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Rotas Salvas */}
            {routes.length > 0 && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Rotas Salvas</h3>
                <div className="space-y-3">
                  {routes.map((route) => (
                    <div
                      key={route.id}
                      onClick={() => handleRouteClick(route)}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">
                          {route.name}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500">
                            {route.stores.length} lojas
                          </span>
                          <span className="text-xs text-gray-500">
                            {route.estimated_time} min
                          </span>
                          <span className="text-xs text-gray-500">
                            {route.distance} km
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-blue-500">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Coluna da Direita - Mapa */}
        <div className="md:col-span-2 h-[calc(100vh-12rem)]">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={center}
              zoom={13}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: true,
                fullscreenControl: true,
              }}
              onLoad={map => {
                console.log('Mapa carregado');
                setMap(map);
              }}
            >
              {/* Marcador do usuário */}
              {selectedUsuario && selectedUsuario.endereco && (
                <Marker
                  position={center}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new window.google.maps.Size(32, 32)
                  }}
                  title={`Endereço de ${selectedUsuario.nome}`}
                />
              )}

              {/* Marcadores das lojas */}
              {selectedLocations.map((location, index) => (
                <Marker
                  key={location.id}
                  position={location.position}
                  label={{
                    text: (index + 1).toString(),
                    color: 'white',
                    className: 'font-semibold'
                  }}
                />
              ))}

              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: '#2563EB',
                      strokeWeight: 5,
                      strokeOpacity: 0.8
                    }
                  }}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-gray-500">Carregando mapa...</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button 
          className="w-full"
          onClick={() => {
            // TODO: Salvar roteiro
          }}
        >
          Salvar Roteiro
        </Button>
      </div>
    </div>
  );
}