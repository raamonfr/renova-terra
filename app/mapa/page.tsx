"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TreePine, MapPin, Users, Search } from "lucide-react"
import Link from "next/link"

export default function MapaPage() {
  const [committees, setCommittees] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCommittee, setSelectedCommittee] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCommitteeName, setNewCommitteeName] = useState("")
  const [newCommitteeNeighborhood, setNewCommitteeNeighborhood] = useState("")

  useEffect(() => {
    fetchCommittees()
  }, [])

  const fetchCommittees = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("committees")
      .select(`
        *,
        committee_members (count)
      `)
      .order("created_at", { ascending: false })

    if (error) console.error("Error fetching committees:", error)
    else setCommittees(data || [])
    setLoading(false)
  }

  const handleCreateCommittee = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

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
      fetchCommittees()
    }
  }

  const handleJoinCommittee = async (committeeId: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("committee_members").insert([
      {
        committee_id: committeeId,
        user_id: user.id,
      },
    ])

    if (error && error.code !== "23505") {
      // 23505 is duplicate key error
      console.error("Error joining committee:", error)
    } else {
      fetchCommittees()
    }
  }

  const filteredCommittees = committees.filter(
    (committee) =>
      committee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      committee.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TreePine className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold text-foreground">RenovaTerra</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link href="/mapa" className="text-sm font-medium text-primary">
              Mapa
            </Link>
            <Link href="/eventos" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Eventos
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-full md:w-96 border-r border-border bg-background overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Comitês</h1>
                <p className="text-muted-foreground mt-1">Encontre comitês na sua região</p>
              </div>
            </div>

            {/* Create Committee Button */}
            {!showCreateForm && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-6"
              >
                + Criar Novo Comitê
              </Button>
            )}

            {/* Create Committee Form */}
            {showCreateForm && (
              <Card className="border-border bg-secondary/20 mb-6">
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
                      <Button type="submit" size="sm" className="flex-1 bg-primary">
                        Criar
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowCreateForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nome ou bairro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>

            {/* Committee List */}
            <div className="space-y-3">
              {filteredCommittees.map((committee) => (
                <Card
                  key={committee.id}
                  className={`border-border bg-card cursor-pointer transition-all hover:shadow-md ${
                    selectedCommittee === committee.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedCommittee(committee.id)}
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
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleJoinCommittee(committee.id)
                        }}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Entrar
                      </Button>
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

        {/* Map */}
        <main className="flex-1 relative bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5">
          <div className="absolute inset-0">
            <img
              src="/interactive-city-map-with-green-location-pins--urb.jpg"
              alt="Mapa da cidade"
              className="w-full h-full object-cover opacity-60"
            />
          </div>

          {/* Selected Committee Info Box */}
          {selectedCommittee && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
              <Card className="border-border bg-card shadow-2xl w-80">
                <CardContent className="p-6">
                  {(() => {
                    const committee = committees.find((c) => c.id === selectedCommittee)
                    if (!committee) return null
                    return (
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-card-foreground mb-1">{committee.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{committee.neighborhood || "Sem localização"}</span>
                            </div>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <TreePine className="h-6 w-6 text-primary" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                          <Users className="h-4 w-4" />
                          <span>{committee.committee_members?.[0]?.count || 0} membros ativos</span>
                        </div>

                        <Link href={`/comite/${committee.id}`}>
                          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
