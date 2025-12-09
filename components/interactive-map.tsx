"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/client" // Confirme se o caminho está certo
import { TreePine, X } from "lucide-react"
import Link from "next/link"
// Importamos apenas os TIPOS. O 'L' não existe no Javascript final, só no Typescript.
import type L from "leaflet"

interface Committee {
  id: string
  name: string
  street_address: string
  street_number: string
  neighborhood: string
  cep: string
  creator_id: string
}

export function InteractiveMap({ isHomePage = false }: { isHomePage?: boolean }) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [committees, setCommittees] = useState<Committee[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Mudamos o nome para leafletClient para diferenciar do Tipo 'L'
  const [leafletClient, setLeafletClient] = useState<typeof L | null>(null)
  const markersRef = useRef<any[]>([])

  // 1. Carrega o Leaflet e o CSS (Client-side)
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // @ts-ignore - Ignora erro de módulo se o VS Code estiver confuso, pois sabemos que instalamos
        const L_module = await import("leaflet")
        // @ts-ignore
        await import("leaflet/dist/leaflet.css")
        
        setLeafletClient(L_module.default)
      } catch (e) {
        console.error("Erro ao carregar leaflet:", e)
      }
    }
    loadLeaflet()
  }, [])

  // 2. Busca comitês do Supabase
  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from("committees").select("*")

        if (error) {
          console.log("Error fetching committees:", error)
        } else {
          setCommittees(data || [])
        }
      } catch (error) {
        console.log("Fetch error:", error)
      }
      setLoading(false)
    }

    fetchCommittees()
  }, [])

  // 3. Pega localização do usuário
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
        },
        (error) => {
          console.log("Geolocation error:", error)
          setUserLocation({ lat: -23.5505, lng: -46.6333 }) // Fallback SP
        },
      )
    } else {
      setUserLocation({ lat: -23.5505, lng: -46.6333 })
    }
  }, [])

  // 4. Inicializa mapa e marcadores
  useEffect(() => {
    // Só roda se tivermos o container, a localização E a biblioteca leaflet carregada
    if (!containerRef.current || !userLocation || !leafletClient) return

    // Limpa marcadores anteriores
    markersRef.current.forEach((marker: any) => {
      if (mapRef.current) {
        mapRef.current.removeLayer(marker)
      }
    })
    markersRef.current = []

    // Corrige ícones padrão do Leaflet (Bug conhecido do Next.js)
    // @ts-ignore
    delete leafletClient.Icon.Default.prototype._getIconUrl
    leafletClient.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })

    // Inicializa o mapa se ainda não existir
    if (!mapRef.current) {
      mapRef.current = leafletClient.map(containerRef.current).setView([userLocation.lat, userLocation.lng], 13)

      leafletClient
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        })
        .addTo(mapRef.current)
    }

    // Marcador do Usuário (Bolinha Azul)
    const userMarker = leafletClient
      .circleMarker([userLocation.lat, userLocation.lng], {
        radius: 8,
        fillColor: "#3b82f6",
        color: "#1e40af",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
      .addTo(mapRef.current)
      .bindPopup("Sua localização")

    markersRef.current.push(userMarker)

    // Marcadores dos Comitês
    committees.forEach(async (committee) => {
      try {
        if (!committee.street_address || !committee.street_number) return

        const address = `${committee.street_address}, ${committee.street_number}, ${committee.neighborhood || ""}, ${committee.cep || ""}`
        // Fetch de geocodificação
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        )
        const results = await response.json()

        if (results && results.length > 0) {
          const { lat, lon } = results[0]
          const coords = { lat: Number.parseFloat(lat), lng: Number.parseFloat(lon) }

          // HTML do Ícone Personalizado
          const markerHtml = `
            <div style="
              width: 40px; height: 40px; border-radius: 50%; background-color: #10b981;
              border: 3px solid #047857; display: flex; align-items: center; justify-content: center;
              cursor: pointer; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2c1.1 0 2 .9 2 2 0 .5-.2 1-.5 1.4C15.1 6.1 16 7.8 16 10c0 1.7-.7 3.2-1.8 4.3.1.3.2.6.2 1v3h-6v-3c0-.4.1-.7.2-1-1.1-1.1-1.8-2.6-1.8-4.3 0-2.2.9-3.9 2.3-5.1-.3-.4-.5-.9-.5-1.4 0-1.1.9-2 2-2z"/>
              </svg>
            </div>
          `

          const customIcon = leafletClient.divIcon({
            html: markerHtml,
            iconSize: [40, 40],
            className: "custom-committee-marker",
          })

          const marker = leafletClient
            .marker([coords.lat, coords.lng], { icon: customIcon })
            .addTo(mapRef.current!)

          // Evento de Clique no Marcador
          marker.on("click", (e) => {
            // CORREÇÃO AQUI: Usamos leafletClient (a biblioteca carregada) e não L (o tipo)
            leafletClient.DomEvent.stopPropagation(e)
            
            setSelectedCommittee(committee)
            if (mapRef.current) {
              mapRef.current.setView([coords.lat, coords.lng], 15)
            }
          })

          markersRef.current.push(marker)
        }
      } catch (error) {
        // Silêncio em caso de erro de geocodificação individual
      }
    })
  }, [userLocation, committees, leafletClient]) // Dependência atualizada para leafletClient

  if (loading || !leafletClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Carregando mapa...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: "500px", zIndex: 0 }} />

      {/* MODAL COM Z-INDEX 1000 PARA FICAR ACIMA DO MAPA */}
      {selectedCommittee && (
        <div className="absolute bottom-8 left-8 z-[1000] bg-white rounded-lg shadow-2xl p-6 w-80 border border-gray-200">
          
          <button 
            onClick={() => setSelectedCommittee(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedCommittee.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="truncate">{selectedCommittee.neighborhood}</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <TreePine className="h-6 w-6 text-emerald-600" />
            </div>
          </div>

          <Link href={`/comite/${selectedCommittee.id}`}>
            <button className="w-full bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors">
              Ver Detalhes
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}