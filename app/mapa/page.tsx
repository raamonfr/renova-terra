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
  
  // Inputs do formulário simplificado do mapa
  const [newCommitteeName, setNewCommitteeName] = useState("")
  const [newCommitteeNeighborhood, setNewCommitteeNeighborhood] = useState("")

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

  // --- FUNÇÃO CORRIGIDA AQUI ---
  const handleCreateCommittee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const supabase = createClient()

    try {
      // 1. Cria o comitê e RETORNA os dados (incluindo o ID gerado)
      const { data: newCommittee, error } = await supabase
        .from("committees")
        .insert([
          {
            name: newCommitteeName,
            neighborhood: newCommitteeNeighborhood,
            creator_id: user.id,
            description: "Novo comitê da comunidade",
          },
        ])
        .select() // Importante: pede para o banco devolver o item criado
        .single() // Pega apenas um item

      if (error) throw error

      // 2. Adiciona o criador como membro automaticamente usando o ID do passo 1
      const { error: memberError } = await supabase
        .from("committee_members")
        .insert([{ committee_id: newCommittee.id, user_id: user.id }])

      if (memberError) throw memberError

      // 3. Limpa o formulário e atualiza a tela
      setNewCommitteeName("")
      setNewCommitteeNeighborhood("")
      setShowCreateForm(false)
      
      // Recarrega os dados para mostrar o novo comitê na lista e o botão verde
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
              <Card className="border-border bg-secondary/20 mb-4">
                <CardContent className="p-4">
                  <form onSubmit={handleCreateCommittee} className="space-y-3">
                    <Input
                      placeholder="Nome do comitê"
                      value={newCommitteeName}
                      onChange={(e) => setNewCommitteeName(e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Bairro"
                      value={newCommitteeNeighborhood}
                      onChange={(e) => setNewCommitteeNeighborhood(e.target.value)}
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="flex-1 bg-primary">Criar</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowCreateForm(false)}>Cancelar</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
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
          </div>

          {/* Lista Rolável */}
          <div className="flex-1 overflow-y-auto p-6 pt-2 pb-24 md:pb-6">
            <div className="space-y-3">
              {filteredCommittees.map((committee) => (
                <Card
                  key={committee.id}
                  className={`border-border bg-card cursor-pointer transition-all hover:shadow-md ${
                    selectedCommittee?.id === committee.id ? "ring-2 ring-primary" : ""
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