"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api";
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

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
console.log('Google Maps API Key:', googleMapsApiKey ? 'Configurada' : 'Não configurada');

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

interface Promoter {
  id: number;
  nome: string;
  apelido: string;
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
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey || '',
    version: "weekly"
  });

  const mapRef = useRef<google.maps.Map | null> (null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [selectedPromoter, setSelectedPromoter] = useState<Promoter | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: -27.5969,
    lng: -48.5495
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('Iniciando componente...');
    fetchPromoters();
  }, []);

  const fetchPromoters = async () => {
    try {
      console.log('Buscando promotores...');
      const { data, error } = await supabase
        .from('usuario')
        .select('id, nome, apelido, endereco')
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar promotores:', error);
        return;
      }
      
      console.log('Promotores encontrados:', data);
      if (data && data.length > 0) {
        setPromoters(data);
      }
    } catch (error) {
      console.error('Erro ao buscar promotores:', error);
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

  const geocodeAddress = async (address: string, cep?: string): Promise<google.maps.LatLngLiteral | null> => {
    if (!window.google) return null;
    
    try {
      // Primeiro tenta buscar pelo CEP
      if (cep) {
        const cepData = await searchViaCep(cep.replace(/\D/g, ''));
        if (cepData) {
          const fullAddressFromCep = `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade} - ${cepData.uf}, Brasil`;
          console.log('Endereço encontrado via CEP:', fullAddressFromCep);
          
          const geocoder = new google.maps.Geocoder();
          const result = await geocoder.geocode({ 
            address: fullAddressFromCep,
            region: 'BR'
          });

          if (result.results && result.results.length > 0) {
            const coordinates = result.results[0].geometry.location.toJSON();
            console.log('Coordenadas via CEP:', coordinates);
            return coordinates;
          }
        }
      }

      // Se não encontrou pelo CEP, tenta pelo endereço completo
      const normalizedAddress = address.trim()
        .replace(/\s+/g, ' ')
        .replace(/,/g, '');

      const hasCityInAddress = /(florianópolis|são josé|palhoça|biguaçu|santo amaro da imperatriz)/i.test(normalizedAddress);
      
      const fullAddress = `${normalizedAddress}${
        hasCityInAddress ? '' : ', São José'
      }${
        normalizedAddress.toLowerCase().includes('sc') || 
        normalizedAddress.toLowerCase().includes('santa catarina') ? 
        '' : ', Santa Catarina'
      }, Brasil`;
      
      console.log('Geocodificando endereço completo:', fullAddress);
      
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ 
        address: fullAddress,
        region: 'BR'
      });
      
      if (result.results && result.results.length > 0) {
        const location = result.results[0];
        const coordinates = location.geometry.location.toJSON();
        console.log('Resultado da geocodificação:', {
          input: fullAddress,
          formatted_address: location.formatted_address,
          location: coordinates
        });
        
        return coordinates;
      }
    } catch (error) {
      console.error('Erro ao geocodificar:', error);
    }
    return null;
  };

  const fetchStoresForPromoter = async (promoterId: number) => {
    setIsLoading(true);
    try {
      console.log('Buscando lojas do promotor:', promoterId);
      const { data, error } = await supabase
        .from('loja')
        .select('id, nome, endereco, cep, latitude, longitude')
        .eq('promotor_id', promoterId)
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar lojas:', error);
        return;
      }
      
      console.log('Lojas encontradas:', data);
      if (data) {
        const processedLocations: Location[] = [];
        const availableStores: Location[] = [];
        
        for (const store of data) {
          console.log('Processando loja:', store);
          let position: google.maps.LatLngLiteral;
          
          // Sempre tenta geocodificar novamente usando o CEP
          const geocoded = await geocodeAddress(store.endereco, store.cep);
          if (geocoded) {
            position = geocoded;
            // Atualiza as coordenadas no banco
            await supabase
              .from('loja')
              .update({ 
                latitude: geocoded.lat, 
                longitude: geocoded.lng 
              })
              .eq('id', store.id);
            console.log('Coordenadas atualizadas no banco:', position);
          } else {
            console.error('Não foi possível geocodificar:', store.endereco);
            continue;
          }
          
          const locationData = {
            id: store.id,
            name: store.nome,
            address: store.endereco,
            position,
            selected: false
          };

          if (processedLocations.length < 3) {
            processedLocations.push({ ...locationData, selected: true });
          } else {
            availableStores.push(locationData);
          }
        }
        
        console.log('Locations processadas:', processedLocations);
        setLocations(processedLocations);
        setAvailableLocations(availableStores);
        
        if (selectedPromoter && processedLocations.length > 0) {
          calculateRoute(processedLocations);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar lojas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeLocation = (index: number) => {
    const items = Array.from(locations);
    const [removedItem] = items.splice(index, 1);
    setLocations(items);
    setAvailableLocations([...availableLocations, { ...removedItem, selected: false }]);
    if (items.length > 0) {
      calculateRoute(items);
    } else {
      setDirections(null);
      setRouteInfo(null);
    }
  };

  const addLocation = (location: Location) => {
    setAvailableLocations(availableLocations.filter(l => l.id !== location.id));
    setLocations([...locations, { ...location, selected: true }]);
    calculateRoute([...locations, location]);
  };

const handlePromoterSelect = async (value: string) => {
    console.log('Promotor selecionado:', value);
    const promoter = promoters.find(p => p.id === parseInt(value));
    console.log('Dados do promotor:', promoter);
    if (promoter) {
        setSelectedPromoter(promoter);
        setLocations([]);
        setAvailableLocations([]);
        setDirections(null);
        await fetchStoresForPromoter(promoter.id);

        // Geocodificar o endereço do promotor e atualizar o centro do mapa
        const promoterLocation = await geocodeAddress(promoter.endereco);
        if (promoterLocation) {
            setCenter(promoterLocation); // Atualiza o centro do mapa
            if (mapRef.current) {
                mapRef.current.panTo(promoterLocation); // Move o mapa para o novo centro
            }
        }
    }
};

  const calculateRoute = useCallback(async (locations: Location[]) => {
    if (!selectedPromoter || locations.length === 0 || !isLoaded) {
      console.log('Faltam dados para calcular a rota:', {
        selectedPromoter: !!selectedPromoter,
        locationsLength: locations.length,
        isLoaded
      });
      return;
    }

    try {
      console.log('Geocodificando endereço do promotor:', selectedPromoter.endereco);
      const promoterLocation = await geocodeAddress(selectedPromoter.endereco);
      if (!promoterLocation) {
        console.error('Não foi possível geocodificar o endereço do promotor');
        return;
      }

      const waypoints = locations.map(loc => ({
        location: new google.maps.LatLng(loc.position.lat, loc.position.lng),
        stopover: true
      }));

      console.log('Calculando rota com waypoints:', waypoints);
      
      const directionsService = new google.maps.DirectionsService();
      
      return new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: promoterLocation,
            destination: promoterLocation, // Retorna ao ponto inicial (endereço do promotor)
            waypoints: waypoints,
            optimizeWaypoints: false,
            travelMode: google.maps.TravelMode.DRIVING
          },
          (result, status) => {
            console.log('Resposta do DirectionsService:', { status, result });
            if (status === google.maps.DirectionsStatus.OK && result) {
              setDirections(result);
              
              // Extrair informações da rota
              const route = result.routes[0];
              const legs = route.legs;
              let totalDistance = 0;
              let totalDuration = 0;
              
              legs.forEach(leg => {
                totalDistance += leg.distance?.value || 0;
                totalDuration += leg.duration?.value || 0;
              });
              
              setRouteInfo({
                duration: formatDuration(totalDuration),
                distance: formatDistance(totalDistance),
                steps: legs.flatMap(leg => leg.steps || [])
              });
              
              // Adiciona um marcador para o ponto inicial/final (promotor)
              if (map) {
                new google.maps.Marker({
                  position: promoterLocation,
                  map: map,
                  label: {
                    text: "P",
                    color: "white",
                    fontWeight: "bold"
                  },
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#22c55e",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff"
                  },
                  title: "Ponto de Partida/Retorno (Promotor)"
                });
              }
              
              resolve(result);
            } else {
              console.error('Erro ao calcular rota:', status);
              reject(status);
            }
          }
        );
      });
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
    }
  }, [selectedPromoter, isLoaded, geocodeAddress, map]);

  // Efeito para recalcular a rota quando as locations mudarem
  useEffect(() => {
    if (locations.length > 0 && selectedPromoter) {
      calculateRoute(locations);
    }
  }, [locations, selectedPromoter, calculateRoute]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
  };

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  const exportToPDF = async () => {
    if (!mapRef.current || !routeInfo) return;
    
    try {
      setIsLoading(true);
      const mapElement = mapRef.current.getDiv();
  
      // Salva o tamanho original do mapa
      const originalWidth = mapElement.style.width;
      const originalHeight = mapElement.style.height;
  
      // Reduz temporariamente o tamanho do mapa
      mapElement.style.width = '600px';
      mapElement.style.height = '400px';
      
      // Configurações otimizadas para html2canvas
      const canvas = await html2canvas(mapElement, {
        scale: 1,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: null,
        imageTimeout: 15000,
        removeContainer: true,
      });
  
      // Restaura o tamanho original do mapa
      mapElement.style.width = originalWidth;
      mapElement.style.height = originalHeight;
  
      // Comprime a qualidade da imagem
      const imgData = canvas.toDataURL('image/jpeg', 0.7);
  
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
  
      // Adiciona título com estilo
      pdf.setFillColor(51, 65, 85);
      pdf.rect(0, 0, pageWidth, 50, 'F'); // Aumenta a altura do cabeçalho
  
     
      // Adiciona o título principal
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('Roteiro de Visitas', pageWidth / 2, 35, { align: 'center' });
  
 // Adiciona informações do promotor como subtítulo
if (selectedPromoter) {
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Promotor: ${selectedPromoter.apelido || selectedPromoter.nome}`, pageWidth / 2, 40, { align: 'center' });
}



      // Informações do roteiro com estilo
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Informações do Roteiro:', margin, 60);
      
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(8);
      pdf.text(`Distância Total: ${routeInfo.distance}`, margin, 70);
      pdf.text(`Tempo Total: ${routeInfo.duration}`, margin, 75);
  
      // Adiciona mapa com borda
      const mapY = 85;
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(margin - 1, mapY - 1, imgWidth + 2, imgHeight + 2);
      pdf.addImage(imgData, 'JPEG', margin, mapY, imgWidth, imgHeight);
  
      // Lista de lojas com estilo
      const listY = mapY + imgHeight + 15;
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(8);
      pdf.text('Lojas no Roteiro:', margin, listY);
      
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(8);
      locations.forEach((location, index) => {
        const y = listY + 8 + (index * 6);
        if (y > pageHeight - margin) {
          pdf.addPage();
          pdf.setFont(undefined, 'bold');
          pdf.text('Lojas no Roteiro (continuação):', margin, margin);
          pdf.setFont(undefined, 'normal');
          return;
        }
        const letter = String.fromCharCode(65 + index);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${letter}.`, margin, y);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${location.name} - ${location.address}`, margin + 10, y);
      });
  
      // Adiciona rodapé
      const currentDate = new Date().toLocaleDateString('pt-BR');
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Gerado em: ${currentDate}`, margin, pageHeight - 10);
  
      pdf.save('roteiro.pdf');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsLoading(false);
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Roteiro</h1>
  {/* Botões */}
  <div className="flex gap-4 mb-6">
      <Button
        variant="outline"
        onClick={exportToPDF}
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
    </div>

      {/* Seleção de Promotor */}
      <div className="mb-6">
        <Select onValueChange={handlePromoterSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o Promotor" />
          </SelectTrigger>
          <SelectContent>
            {promoters.map((promoter) => (
              <SelectItem key={promoter.id} value={promoter.id.toString()}>
                {promoter.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-gray-500 mt-1">
          {promoters.length} promotores encontrados
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Coluna da Esquerda - Lista de Lojas */}
        <div className="md:col-span-1">
          <Card className="p-4">
            {routeInfo && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold">{routeInfo.duration}</div>
                <div className="text-sm text-gray-600">{routeInfo.distance}</div>
              </div>
            )}
            <h2 className="text-lg font-semibold mb-4">Lojas no Roteiro</h2>
            {isLoading ? (
              <div className="text-center py-4">Carregando lojas...</div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="locations">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {locations.map((location, index) => (
                        <Draggable
                          key={location.id.toString()}
                          draggableId={location.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex items-center gap-3 p-3 border rounded mb-2 bg-white ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-sm flex-shrink-0">
                                {String.fromCharCode(65 + index)}
                              </div>
                              <div className="flex-grow min-w-0">
                                <h3 className="font-medium truncate">{location.name}</h3>
                                <p className="text-sm text-gray-500 truncate">{location.address}</p>
                              </div>
                              <button
                                onClick={() => removeLocation(index)}
                                className="p-1 rounded text-red-500 hover:bg-red-50"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
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
            )}

            {/* Lojas Disponíveis */}
            {availableLocations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-3">Lojas Disponíveis</h3>
                <div className="space-y-2">
                  {availableLocations.map((location) => (
                    <Card 
                      key={location.id.toString()}
                      className="p-3 hover:shadow-md transition-shadow border-l-4 border-gray-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-grow min-w-0">
                          <h3 className="font-medium truncate">{location.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{location.address}</p>
                        </div>
                        <button
                          onClick={() => addLocation(location)}
                          className="p-1 rounded text-green-500 hover:bg-green-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Coluna da Direita - Mapa */}
        <div className="md:col-span-2 h-[700px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <div className="mt-2">Carregando mapa...</div>
              </div>
            </div>
          )}
          {loadError && (
            <div className="h-full flex items-center justify-center bg-red-50">
              <div className="text-center text-red-600">
                <p>Erro ao carregar o mapa</p>
                <p className="text-sm">{loadError.message}</p>
              </div>
            </div>
          )}
          {isLoaded && !loadError && (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '600px' }}
              center={center}
              zoom={12}
              onLoad={(map) => {
                mapRef.current = map;
                setMap(map);
              }}
              onUnmount={() => {
                mapRef.current = undefined;
                setMap(null);
              }}
              options={mapOptions}
            >
              {locations.map((location, index) => (
                <Marker
                  key={location.id.toString()}
                  position={location.position}
                  label={{
                    text: String.fromCharCode(65 + index),
                    color: "white",
                    fontWeight: "bold",
                  }}
                  zIndex={1000 - index}
                  optimized={false}
                />
              ))}
              {directions && (
                <DirectionsRenderer 
                  directions={directions}
                  options={{
                    zIndex: 1,
                    suppressMarkers: true,
                    preserveViewport: true,
                    polylineOptions: {
                      strokeColor: "#2563eb", // Azul
                      strokeWeight: 4,
                      strokeOpacity: 0.8
                    }
                  }}
                />
              )}
            </GoogleMap>
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
