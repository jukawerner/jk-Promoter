import { toast } from "sonner";

export interface GeocodingResult {
  lat: number;
  lng: number;
  name: string;
  type: "home" | "store";
}

const GEOCODING_DELAY = 1000; // 1 segundo entre requisições
const MAX_RETRIES = 3;

export class GeocodingService {
  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static normalizeAddress(address: string, city: string): string {
    const normalizedAddress = address.trim()
      .replace(/\s+/g, ' ')
      .replace(/,/g, '');
    
    const normalizedCity = city.trim()
      .replace(/\s+/g, ' ')
      .replace(/,/g, '');

    return `${normalizedAddress}, ${normalizedCity}, Brasil`;
  }

  private static async fetchGeocodingData(address: string, retryCount = 0): Promise<any> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            "Accept-Language": "pt-BR",
            "User-Agent": "JK-Promoter/1.0"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API de geocodificação: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        if (retryCount < MAX_RETRIES) {
          await this.delay(GEOCODING_DELAY);
          return this.fetchGeocodingData(address, retryCount + 1);
        }
        throw new Error(`Endereço não encontrado: ${address}`);
      }

      return data[0];
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        await this.delay(GEOCODING_DELAY);
        return this.fetchGeocodingData(address, retryCount + 1);
      }
      throw error;
    }
  }

  static async geocodeAddress(
    address: string,
    city: string,
    type: "home" | "store",
    name: string
  ): Promise<GeocodingResult> {
    try {
      if (!address.trim() || !city.trim()) {
        throw new Error("Endereço ou cidade não fornecidos");
      }

      const fullAddress = this.normalizeAddress(address, city);
      await this.delay(GEOCODING_DELAY);

      const data = await this.fetchGeocodingData(fullAddress);

      return {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
        name,
        type
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao geocodificar endereço";
      toast.error(`Erro ao localizar endereço: ${errorMessage}`);
      throw error;
    }
  }
}