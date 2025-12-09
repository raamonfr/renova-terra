"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MapPin, Users, Search, CheckCircle, Plus, List, ChevronDown } from "lucide-react"
import { InteractiveMap } from "@/components/interactive-map"
import { AppHeader } from "@/components/app-header"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Committee {
  id: string
  name: string
  neighborhood: string
  description?: string
  committee_members?: { count: number }[]
}

export default function MapaPage() {
  // Estados de dados
  const [committees, setCommittees] = useState<Committee[]>([])
  const [memberCommitteeIds, setMemberCommitteeIds] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<any>(null)

  // Estados de UI e Controle
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null)
  const [committeeToJoin, setCommitteeToJoin] = useState<Committee | null>(null)
  const [loading, setLoading] = useState(true)

  // Estado mobile
  const [isMobileListOpen, setIsMobileListOpen] = useState(false)

  // Estados dos Modais e Formulários
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  // Estados do Formulário de Criação (3 Etapas)
  const [createStep, setCreateStep] = useState(1)
  const [newCommittee, setNewCommittee] = useState({
    name: "",
    description: "",
    profileImage: "",
    streetAddress: "",
    streetNumber: "",
    neighborhood: "",
    cep: "",
    galleryImages: [] as string[],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      const { data, error } = await supabase
        .from("committees")
        .select(`
          *,
          committee_members (count)
        `)
        .order("created_at", { ascending: false })

      if (error) console.error("Error fetching committees:", error)
      else setCommittees(data || [])

      if (currentUser) {
        const { data: memberships } = await supabase
          .from("committee_members")
          .select("committee_id")
          .eq("user_id", currentUser.id)

        if (memberships) {
          setMemberCommitteeIds(new Set(memberships.map((m) => m.committee_id)))
        }
      }

      setLoading(false)
    } catch (error) {
      console.error("Erro no loadData:", error)
    }
  }

  const handleCreateCommittee = async () => {
    // Nota: Removi o "e: React.FormEvent" pois agora é acionado por botão, não submit de form
    if (!user) return

    const supabase = createClient()

    try {
      const { data: committeeData, error } = await supabase
        .from("committees")
        .insert([
          {
            name: newCommittee.name,
            description: newCommittee.description, // Campo adicionado
            neighborhood: newCommittee.neighborhood,
            creator_id: user.id,
            profile_image_url: newCommittee.profileImage || null, // Campo adicionado
            street_address: newCommittee.streetAddress || null,   // Campo adicionado
            street_number: newCommittee.streetNumber || null,     // Campo adicionado
            cep: newCommittee.cep || null,                        // Campo adicionado
            gallery_images: newCommittee.galleryImages.length > 0 ? newCommittee.galleryImages : null,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Adiciona o criador como membro
      const { error: memberError } = await supabase
        .from("committee_members")
        .insert([{ committee_id: committeeData.id, user_id: user.id }])

      if (memberError) throw memberError

      // Reset total dos estados
      setShowCreateForm(false)
      setCreateStep(1)
      setNewCommittee({
        name: "",
        description: "",
        profileImage: "",
        streetAddress: "",
        streetNumber: "",
        neighborhood: "",
        cep: "",
        galleryImages: [],
      })

      loadData()
    } catch (error) {
      console.error("Erro ao criar comitê:", error)
    }
  }

  const handleJoinCommittee = async () => {
    if (!user || !committeeToJoin) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("committee_members").insert([
        {
          committee_id: committeeToJoin.id,
          user_id: user.id,
        },
      ])

      if (error && error.code !== "23505") {
        console.error("Error joining committee:", error)
      } else {
        setShowJoinModal(false)
        setCommitteeToJoin(null)
        loadData()
      }
    } catch (error) {
      console.error("Erro ao entrar:", error)
    }
  }

  const openJoinModal = (committee: Committee) => {
    setCommitteeToJoin(committee)
    setShowJoinModal(true)
  }

  const filteredCommittees = committees.filter(
    (committee) =>
      committee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      committee.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">

      {/* 1. Header Reutilizável */}
      <AppHeader />

      <div className="flex-1 flex overflow-hidden relative">

        {/* 2. SIDEBAR (Lista de Comitês) - Com lógica Mobile */}
        <aside
          className={`
            bg-background border-r border-border flex flex-col z-[60] transition-transform duration-300
            ${isMobileListOpen ? "fixed inset-0 pt-0" : "hidden"} 
            md:flex md:w-96 md:static md:h-full
          `}
        >
          {/* Header da Sidebar Mobile (Botão Fechar) */}
          {isMobileListOpen && (
            <div className="md:hidden p-4 border-b border-border flex items-center justify-between bg-background/95 backdrop-blur sticky top-0 z-50">
              <span className="font-bold text-lg">Lista de Comitês</span>
              <Button variant="ghost" size="sm" onClick={() => setIsMobileListOpen(false)}>
                <span className="mr-2">Fechar Lista</span>
                <ChevronDown className="h-6 w-6" />
              </Button>
            </div>
          )}

          {/* Conteúdo Fixo da Sidebar (Busca e Criar) */}
          <div className="p-6 pb-2 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Comitês</h1>
                <p className="text-muted-foreground mt-1">Encontre comitês na sua região</p>
              </div>
            </div>

            {!showCreateForm && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-4"
              >
                + Criar Novo Comitê
              </Button>
            )}

            {showCreateForm && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-4"
              >
                + Criar Novo Comitê
              </Button>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nome ou bairro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>

            {/* Modal de Criação de Comitê (3 Etapas) */}
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogContent className="sm:max-w-[500px] z-[100]">
                <DialogHeader>
                  <DialogTitle>Criar Novo Comitê</DialogTitle>
                  <DialogDescription>
                    Etapa {createStep} de 3 {createStep === 3 && "(opcional)"}
                  </DialogDescription>
                </DialogHeader>

                {/* Indicador de Progresso */}
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 h-2 rounded-full ${step <= createStep ? "bg-primary" : "bg-muted"
                        }`}
                    />
                  ))}
                </div>

                {/* ETAPA 1: Básico */}
                {createStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Comitê *</Label>
                      <Input
                        id="name"
                        value={newCommittee.name}
                        onChange={(e) =>
                          setNewCommittee({ ...newCommittee, name: e.target.value.slice(0, 50) })
                        }
                        placeholder="Ex: Comitê Verde do Centro"
                        maxLength={50}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profileImage">URL da Foto de Perfil</Label>
                      <Input
                        id="profileImage"
                        value={newCommittee.profileImage}
                        onChange={(e) =>
                          setNewCommittee({ ...newCommittee, profileImage: e.target.value })
                        }
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Sobre o Comitê *</Label>
                      <Textarea
                        id="description"
                        value={newCommittee.description}
                        onChange={(e) =>
                          setNewCommittee({ ...newCommittee, description: e.target.value.slice(0, 300) })
                        }
                        placeholder="Descreva o objetivo..."
                        rows={4}
                        maxLength={300}
                      />
                    </div>
                  </div>
                )}

                {/* ETAPA 2: Endereço */}
                {createStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="streetAddress">Endereço (Rua) *</Label>
                      <Input
                        id="streetAddress"
                        value={newCommittee.streetAddress}
                        onChange={(e) =>
                          setNewCommittee({ ...newCommittee, streetAddress: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="streetNumber">Número</Label>
                        <Input
                          id="streetNumber"
                          value={newCommittee.streetNumber}
                          onChange={(e) =>
                            setNewCommittee({ ...newCommittee, streetNumber: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                          id="cep"
                          value={newCommittee.cep}
                          onChange={(e) =>
                            setNewCommittee({ ...newCommittee, cep: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        value={newCommittee.neighborhood}
                        onChange={(e) =>
                          setNewCommittee({ ...newCommittee, neighborhood: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* ETAPA 3: Galeria */}
                {createStep === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      URLs de imagens da galeria (opcional)
                    </p>
                    {[0, 1, 2].map((index) => (
                      <div key={index}>
                        <Label htmlFor={`gallery-${index}`}>Imagem {index + 1}</Label>
                        <Input
                          id={`gallery-${index}`}
                          value={newCommittee.galleryImages[index] || ""}
                          onChange={(e) => {
                            const newGallery = [...newCommittee.galleryImages]
                            newGallery[index] = e.target.value
                            setNewCommittee({
                              ...newCommittee,
                              galleryImages: newGallery.filter(Boolean),
                            })
                          }}
                          placeholder="https://..."
                        />
                      </div>
                    ))}
                  </div>
                )}

                <DialogFooter className="flex gap-2">
                  {createStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setCreateStep(createStep - 1)}
                    >
                      Voltar
                    </Button>
                  )}

                  {createStep < 3 ? (
                    <Button
                      onClick={() => setCreateStep(createStep + 1)}
                      disabled={
                        createStep === 1
                          ? !newCommittee.name || !newCommittee.description
                          : !newCommittee.streetAddress || !newCommittee.neighborhood
                      }
                      className="bg-primary text-primary-foreground"
                    >
                      Próximo
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCreateCommittee}
                      className="bg-primary text-primary-foreground"
                    >
                      Criar Comitê
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista Rolável */}
          <div className="flex-1 overflow-y-auto p-6 pt-2 pb-24 md:pb-6">
            <div className="space-y-3">
              {filteredCommittees.map((committee) => (
                <Card
                  key={committee.id}
                  className={`border-border bg-card cursor-pointer transition-all hover:shadow-md ${selectedCommittee?.id === committee.id ? "ring-2 ring-primary" : ""
                    }`}
                  onClick={() => {
                    setSelectedCommittee(committee)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground mb-1">{committee.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{committee.neighborhood || "Sem localização"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{committee.committee_members?.[0]?.count || 0} membros</span>
                        </div>
                      </div>

                      {memberCommitteeIds.has(committee.id) ? (
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700 cursor-default"
                          disabled
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Membro
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            openJoinModal(committee)
                          }}
                          className="border-primary text-primary hover:bg-primary/10"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Entrar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCommittees.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum comitê encontrado</p>
              </div>
            )}
          </div>
        </aside>

        {/* 3. ÁREA DO MAPA */}
        <main className="h-full flex-1 relative bg-muted/20">
          <InteractiveMap />

          {/* 4. BOTÃO FLUTUANTE (Mobile) */}
          {!isMobileListOpen && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 md:hidden z-[50]">
              <Button
                onClick={() => setIsMobileListOpen(true)}
                className="shadow-xl bg-background text-foreground border border-border hover:bg-muted rounded-full px-6 py-6 font-semibold"
              >
                <List className="h-5 w-5 mr-2" />
                Ver Lista de Comitês
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Modal de Confirmação de Entrada */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="z-100">
          <DialogHeader>
            <DialogTitle>Entrar no Comitê</DialogTitle>
            <DialogDescription>
              Você deseja se tornar membro do comitê "{committeeToJoin?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleJoinCommittee} className="bg-primary text-primary-foreground">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}