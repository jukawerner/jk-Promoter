"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: -23.5505,
  lng: -46.6333,
};

interface Promotor {
  id: number;
  nome: string;
  apelido: string;
  endereco: string;
  avatar_url: string;
}

export default function CadastroRoteiro() {
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [selectedPromotor, setSelectedPromotor] = useState<string>("");
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar promotores do Supabase
  useEffect(() => {
    const fetchPromotores = async () => {
      console.log("Iniciando busca de promotores...");
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('usuario')
          .select(`
            id,
            nome,
            apelido,
            endereco,
            avatar_url
          `)
          .eq('tipo', 'PROMOTOR')
          .order('nome');

        if (error) {
          console.error("Erro do Supabase:", error.message);
          throw error;
        }
        
        console.log("Resposta do Supabase:", { data, error });
        
        if (data && data.length > 0) {
          console.log("Promotores encontrados:", data);
          setPromotores(data);
        } else {
          console.log("Nenhum promotor encontrado na tabela usuario");
        }
      } catch (error) {
        console.error("Erro ao buscar promotores:", error);
        toast.error("Erro ao carregar promotores");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotores();
  }, []);

  // Quando um promotor é selecionado
  const handlePromotorChange = async (value: string) => {
    setSelectedPromotor(value);
    const promotor = promotores.find(p => p.id.toString() === value);
    
    if (promotor && promotor.endereco) {
      const geocoder = new google.maps.Geocoder();
      try {
        const result = await geocoder.geocode({ address: promotor.endereco });
        if (result.results[0]) {
          setMarkerPosition(result.results[0].geometry.location.toJSON());
        }
      } catch (error) {
        console.error("Erro ao geocodificar endereço:", error);
        toast.error("Erro ao localizar endereço no mapa");
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Roteiro</h1>
      
      <div className="space-y-6">
        {/* Seleção de Promotor */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Selecione o Promotor
          </label>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Carregando promotores...</span>
            </div>
          ) : (
            <Select onValueChange={handlePromotorChange} value={selectedPromotor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um promotor" />
              </SelectTrigger>
              <SelectContent>
                {promotores.map((promotor) => (
                  <SelectItem key={promotor.id} value={promotor.id.toString()}>
                    {promotor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Mapa */}
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={markerPosition || center}
            zoom={13}
          >
            {markerPosition && (
              <Marker
                position={markerPosition}
                title={promotores.find(p => p.id.toString() === selectedPromotor)?.endereco}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}
