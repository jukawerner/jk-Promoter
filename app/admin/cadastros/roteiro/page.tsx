"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { FileDown, Share2, Plus, X, Trash2 } from "lucide-react";
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
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userMarkerPosition, setUserMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);

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

    const items = Array.from(selectedLocations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedLocations(items);
    // Recalcula a rota com a nova ordem
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
      toast.error("Selecione um usuário e pelo menos uma loja");
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
        toast.error(error.message);
        return;
      }

      console.log('Rota adicionada com sucesso:', data);
      setRoutes([...routes, data]);
      
      toast.success("A rota foi salva com sucesso!");

      // Limpa a seleção atual
      setSelectedLocations([]);
      setDirections(null);
      setRouteInfo({ duration: "", distance: "" });
    } catch (error) {
      console.error('Erro ao adicionar rota:', error);
      toast.error("Ocorreu um erro ao salvar a rota");
    }
  };

  const handleRouteClick = (route: Route) => {
    setSelectedRoute(route);
    setShowRouteDetails(true);
    
    // Busca as informações completas das lojas do array locations
    const routeLocations = route.stores
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(savedStore => {
        const fullLocation = locations.find(loc => loc.id.toString() === savedStore.id);
        if (!fullLocation) return null;
        
        return {
          ...fullLocation,
          name: savedStore.name,
          address: savedStore.address
        };
      })
      .filter(loc => loc !== null) as Location[];

    console.log('Route Locations:', routeLocations);
    
    if (routeLocations.length > 0) {
      setSelectedLocations(routeLocations);
      setCenter(routeLocations[0].position);
      calculateRoute(routeLocations);
    }
  };

  const calculateRoute = async (locations: Location[]) => {
    if (!selectedUsuario || locations.length < 1) return;
    
    console.log('Calculating route for locations:', locations);

    const directionsService = new google.maps.DirectionsService();
    
    try {
      // Geocodifica o endereço do usuário para usar como ponto de partida/chegada
      const userCoordinates = await geocodeAddress(selectedUsuario.endereco);
      if (!userCoordinates) {
        console.error('Não foi possível encontrar as coordenadas do usuário');
        return;
      }

      console.log('User coordinates:', userCoordinates);

      // Usa o endereço do usuário como ponto de partida e chegada
      const waypoints = locations.map(location => ({
        location: location.position,
        stopover: true
      }));

      console.log('Route params:', { origin: userCoordinates, destination: userCoordinates, waypoints });

      const result = await directionsService.route({
        origin: userCoordinates,
        destination: userCoordinates,
        waypoints,
        optimizeWaypoints: false,
        travelMode: google.maps.TravelMode.DRIVING
      });

      console.log('Directions result:', result);
      setDirections(result);

      // Atualiza o tempo e distância total
      if (result.routes[0]) {
        let totalDistance = 0;
        let totalDuration = 0;

        result.routes[0].legs.forEach(leg => {
          totalDistance += leg.distance?.value || 0;
          totalDuration += leg.duration?.value || 0;
        });

        // Converte para km e minutos
        const distanceInKm = (totalDistance / 1000).toFixed(1);
        const durationInMinutes = Math.round(totalDuration / 60);

        setRouteInfo({
          duration: durationInMinutes.toString(),
          distance: distanceInKm.toString()
        });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error('Erro ao calcular a rota');
    }
  };

  useEffect(() => {
    if (selectedUsuario) {
      fetchRoutes(selectedUsuario.id);
    }
  }, [selectedUsuario]);

  useEffect(() => {
    calculateRoute(selectedLocations);
  }, [selectedLocations]);

  // Efeito para recalcular a rota quando as locations mudarem
  useEffect(() => {
    if (locations.length > 0 && selectedUsuario) {
      calculateRoute(locations);
    }
  }, [locations, selectedUsuario]);

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
        setUserMarkerPosition(coordinates);
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
      toast.error("Selecione um usuário e pelo menos uma loja");
      return;
    }

    try {
      // Captura a div que contém o mapa e a lista
      const element = document.getElementById('route-content');
      if (!element) return;

      const loadingToast = toast.loading("Gerando PDF...");

      // Aguarda mais tempo para garantir que o mapa e os marcadores estejam renderizados
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Força uma atualização do mapa antes da captura
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY,
        scale: 2, // Melhor qualidade
        width: element.offsetWidth,
        height: element.offsetHeight,
        backgroundColor: '#ffffff',
        logging: true,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          // Ajusta os elementos do mapa no clone
          const mapContainer = clonedDoc.querySelector('.leaflet-container');
          if (mapContainer) {
            // Força o mapa a ocupar todo o espaço disponível
            (mapContainer as HTMLElement).style.width = '100%';
            (mapContainer as HTMLElement).style.height = '100%';
          }

          // Garante que os marcadores e outros elementos do mapa estejam visíveis
          ['leaflet-marker-icon', 'leaflet-marker-shadow', 'leaflet-popup', 'leaflet-overlay-pane'].forEach(className => {
            const elements = clonedDoc.getElementsByClassName(className);
            Array.from(elements).forEach((el: any) => {
              if (el.style) {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                // Remove transformações que podem causar desalinhamento
                el.style.transform = 'none';
              }
            });
          });

          // Garante que as rotas (linhas azuis) estejam visíveis
          const pathElements = clonedDoc.querySelectorAll('.leaflet-overlay-pane svg path');
          pathElements.forEach((path: any) => {
            path.style.strokeWidth = '3px';
            path.style.stroke = '#3B82F6';
          });
        }
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

      // Calcula as dimensões da página
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 10;
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - 40;

      // Calcula as dimensões da imagem mantendo a proporção
      let imgWidth = maxWidth;
      let imgHeight = (canvas.height * maxWidth) / canvas.width;

      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = (canvas.width * maxHeight) / canvas.height;
      }

      // Centraliza a imagem horizontalmente
      const x = (pageWidth - imgWidth) / 2;
      
      // Adiciona a imagem logo abaixo do cabeçalho
      pdf.addImage(imgData, 'PNG', x, 35, imgWidth, imgHeight);

      // Salva o PDF
      pdf.save(`roteiro_${selectedUsuario.nome}_${new Date().toISOString().split('T')[0]}.pdf`);

      toast.dismiss(loadingToast);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Ocorreu um erro ao gerar o PDF");
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

  const handleSaveRoute = async () => {
    if (selectedLocations.length === 0) {
      toast.error("Adicione pelo menos uma loja ao roteiro");
      return;
    }

    const loadingToast = toast.loading("Salvando roteiro...");

    try {
      // Encontra o maior número entre as rotas existentes com nome similar
      const baseRouteName = "Rota";
      const existingRoutes = routes.filter(r => r.name.startsWith(baseRouteName));
      const maxNumber = existingRoutes.reduce((max, route) => {
        const num = parseInt(route.name.replace(baseRouteName, "")) || 0;
        return Math.max(max, num);
      }, 0);

      // Cria um novo nome incrementando o número
      const newRouteName = `${baseRouteName} ${maxNumber + 1}`;

      const { data, error } = await supabase.from("routes").insert([
        {
          name: newRouteName,
          stores: selectedLocations.map((loc, index) => ({
            id: loc.id.toString(),
            name: loc.name,
            address: loc.address,
            order: index
          })),
          estimated_time: parseInt(routeInfo.duration) || 0,
          distance: parseFloat(routeInfo.distance) || 0,
          usuario_id: selectedUsuario.id
        }
      ]).select();

      if (error) throw error;

      // Atualiza a lista de rotas
      if (data) {
        setRoutes([...routes, data[0]]);
        toast.success("Roteiro salvo com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar roteiro:", error);
      toast.error("Erro ao salvar o roteiro");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta rota?")) {
      return;
    }

    const loadingToast = toast.loading("Excluindo rota...");

    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId);

      if (error) {
        throw error;
      }

      // Atualiza a lista de rotas
      setRoutes(routes.filter(route => route.id !== routeId));
      setShowRouteDetails(false);
      toast.success("Rota excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir rota:", error);
      toast.error("Erro ao excluir a rota");
    } finally {
      toast.dismiss(loadingToast);
    }
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
          setUserMarkerPosition(coordinates);
          map?.setCenter(coordinates);
          map?.setZoom(13);
        }

        await fetchStoresForUsuario(usuarioId);
      }
    } catch (error) {
      console.error('Erro ao selecionar usuário:', error);
      toast.error('Erro ao carregar dados do usuário');
    } finally {
      setIsLoading(false);
    }
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

            {/* Lojas no Roteiro */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">Lojas no Roteiro</h3>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="selected-stores">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {selectedLocations.map((location, index) => (
                        <Draggable
                          key={location.id}
                          draggableId={location.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-gray-50 p-3 rounded-md flex items-center justify-between group hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-sm">
                                  {index + 1}
                                </span>
                                <div className="flex flex-col">
                                  <span className="font-medium">{location.name}</span>
                                  <span className="text-sm text-gray-500">{location.address}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleLocationRemove(location)}
                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* Lojas Disponíveis */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">Lojas Disponíveis</h3>
              <div className="space-y-2">
                {availableLocations.map((location) => (
                  <div
                    key={location.id}
                    className="bg-gray-50 p-3 rounded-md flex items-center justify-between group hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{location.name}</span>
                      <span className="text-sm text-gray-500">{location.address}</span>
                    </div>
                    <Plus className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Rotas Salvas */}
            {routes.length > 0 && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Rotas Salvas</h3>
                <div className="space-y-3">
                  {routes.map((route) => (
                    <div
                      key={route.id}
                      onClick={() => handleRouteClick(route)}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-500 cursor-pointer transition-colors"
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
              {userMarkerPosition && (
                <Marker
                  position={userMarkerPosition}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/micons/yellow-dot.png',
                    scaledSize: new google.maps.Size(48, 48),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(24, 48),
                  }}
                  title={selectedUsuario?.nome || 'Ponto de Partida'}
                  zIndex={1000}
                />
              )}

              {/* Marcadores das lojas */}
              {selectedLocations.map((location, index) => (
                <Marker
                  key={location.id}
                  position={location.position}
                  label={{
                    text: (index + 1).toString(),
                    color: "white",
                    className: "font-bold"
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
          onClick={handleSaveRoute}
        >
          Salvar Roteiro
        </Button>
      </div>

      {/* Modal de Detalhes da Rota */}
      <Dialog open={showRouteDetails} onOpenChange={setShowRouteDetails}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-bold">{selectedRoute?.name}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setShowRouteDetails(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Fechar
                </Button>
                <Button onClick={() => handleExportPDF()}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => selectedRoute && handleDeleteRoute(selectedRoute.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Rota
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-auto mt-4">
            {/* Coluna da Esquerda - Informações e Lista */}
            <div className="space-y-4">
              {/* Informações da Rota */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-500">Lojas</span>
                  <p className="font-medium">{selectedRoute?.stores.length} lojas</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Tempo Estimado</span>
                  <p className="font-medium">{selectedRoute?.estimated_time} minutos</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Distância Total</span>
                  <p className="font-medium">{selectedRoute?.distance} km</p>
                </div>
              </div>

              {/* Lista de Lojas */}
              <div className="space-y-2 overflow-auto max-h-[calc(80vh-300px)]">
                <h4 className="font-medium">Lojas no Roteiro</h4>
                {selectedRoute?.stores.map((store, index) => (
                  <div key={store.id} className="p-3 bg-white border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{store.name}</p>
                        <p className="text-sm text-gray-500">{store.address}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna da Direita - Mapa */}
            <div className="h-[calc(80vh-100px)] rounded-lg overflow-hidden">
              <GoogleMap
                zoom={13}
                center={center}
                mapContainerClassName="w-full h-full rounded-lg"
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                }}
              >
                {selectedLocations.map((location, index) => (
                  <Marker
                    key={location.id}
                    position={location.position}
                    label={{
                      text: (index + 1).toString(),
                      color: "white",
                      className: "font-bold"
                    }}
                  />
                ))}
                {directions && (
                  <DirectionsRenderer directions={directions} />
                )}
              </GoogleMap>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}