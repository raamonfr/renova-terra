"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/client" 
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// Adicionei os imports necessários para o Modal e ícones
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TreePine, MapPin, Users, Search, CheckCircle, Plus } from "lucide-react"
import Link from "next/link"
import { InteractiveMap } from "@/components/interactive-map"

// Tipagem para evitar erros de TS
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
  // Agora selectedCommittee guarda o OBJETO inteiro, não só o ID, igual ao Dashboard
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null)
  const [committeeToJoin, setCommitteeToJoin] = useState<Committee | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Modals e Forms
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newCommitteeName, setNewCommitteeName] = useState("")
  const [newCommitteeNeighborhood, setNewCommitteeNeighborhood] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  // --- CORREÇÃO 1: Função centralizada de carregamento (Igual ao Dashboard) ---
  const loadData = async () => {
    try {
      const supabase = createClient()
      
      // 1. Pegar usuário
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      // 2. Pegar Comitês
      const { data, error } = await supabase
        .from("committees")
        .select(`
          *,
          committee_members (count)
        `)
        .order("created_at", { ascending: false })

      if (error) console.error("Error fetching committees:", error)
      else setCommittees(data || [])

      // 3. Pegar Membrosias (A parte que faltava!)
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

  const handleCreateCommittee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const supabase = createClient()
    const { error } = await supabase.from("committees").insert([
      {
        name: newCommitteeName,
        neighborhood: newCommitteeNeighborhood,
        creator_id: user.id,
        description: "Novo comitê da comunidade",
      },
    ])

    if (error) console.error("Error creating committee:", error)
    else {
      setNewCommitteeName("")
      setNewCommitteeNeighborhood("")
      setShowCreateForm(false)
      loadData() // Recarrega para aparecer na lista
    }
  }

  // --- CORREÇÃO 2: Função de entrar no comitê (Via Modal) ---
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

      if (error && error.code !== "23505") { // Ignora erro de duplicidade
        console.error("Error joining committee:", error)
      } else {
        setShowJoinModal(false)
        setCommitteeToJoin(null)
        loadData() // Atualiza a tela para o botão ficar verde
      }
    } catch (error) {
      console.error("Erro ao entrar:", error)
    }
  }

  // Função auxiliar para abrir o modal
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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur shrink-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TreePine className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold text-foreground">RenovaTerra</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary">
              Dashboard
            </Link>
            <Link href="/mapa" className="text-sm font-medium text-primary">
              Mapa
            </Link>
            <Link href="/eventos" className="text-sm font-medium text-foreground hover:text-primary">
              Eventos
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-96 border-r border-border bg-background flex flex-col h-full z-10">
          
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

          <div className="flex-1 overflow-y-auto p-6 pt-2">
            <div className="space-y-3">
              {filteredCommittees.map((committee) => (
                <Card
                  key={committee.id}
                  className={`border-border bg-card cursor-pointer transition-all hover:shadow-md ${
                    selectedCommittee?.id === committee.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedCommittee(committee)}
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

                      {/* --- CORREÇÃO 3: Botão Dinâmico (Verde ou Entrar) --- */}
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

        <main className="h-full flex-1 relative bg-muted/20">
          <InteractiveMap />
        </main>
      </div>

      {/* --- CORREÇÃO 4: Adicionado o Modal ao final --- */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent>
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