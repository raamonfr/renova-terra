"use client"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Award, Calendar, TreePine, MapPin, LogOut, Plus, Users, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface UserData {
  id: string
  email: string
  user_metadata: {
    full_name: string
  }
}

interface Committee {
  id: string
  name: string
  neighborhood: string
  description: string
  creator_id: string
  profile_image_url?: string
}

interface Event {
  id: string
  title: string
  event_date: string
  event_time?: string
  location: string
  committee_id: string
  committees: {
    name: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [myCommittees, setMyCommittees] = useState<Committee[]>([])
  const [allCommittees, setAllCommittees] = useState<Committee[]>([])
  const [memberCommitteeIds, setMemberCommitteeIds] = useState<Set<string>>(new Set())
  const [events, setEvents] = useState<Event[]>([])
  const [userAttendance, setUserAttendance] = useState<Set<string>>(new Set())
  const [points, setPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  // Modal states
  const [showCreateCommittee, setShowCreateCommittee] = useState(false)
  const [createStep, setCreateStep] = useState(1)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Form states for creating committee
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
  }, [router])

  const loadData = async () => {
    try {
      const supabase = createClient()

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push("/auth/login")
        return
      }

      setUser(currentUser as unknown as UserData)

      const { data: createdCommittees } = await supabase.from("committees").select("*").eq("creator_id", currentUser.id)

      if (createdCommittees) {
        setMyCommittees(createdCommittees)
      }

      const { data: allCommitteesData } = await supabase.from("committees").select("*")

      if (allCommitteesData) {
        setAllCommittees(allCommitteesData)
      }

      const { data: memberships } = await supabase
        .from("committee_members")
        .select("committee_id")
        .eq("user_id", currentUser.id)

      if (memberships) {
        setMemberCommitteeIds(new Set(memberships.map((m) => m.committee_id)))
      }

      // Buscar todos os eventos
      const { data: eventsData } = await supabase
        .from("events")
        .select("*, committees(name)")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(10)

      if (eventsData) {
        setEvents(eventsData)
      }

      // Buscar presenças confirmadas do usuário
      const { data: attendanceData } = await supabase
        .from("event_attendance")
        .select("event_id")
        .eq("user_id", currentUser.id)

      if (attendanceData) {
        setUserAttendance(new Set(attendanceData.map((a) => a.event_id)))
      }

      // Buscar pontos do usuário
      const { data: pointsData } = await supabase
        .from("user_points")
        .select("points")
        .eq("user_id", currentUser.id)
        .single()

      if (pointsData) {
        setPoints(pointsData.points)
      }

      setLoading(false)
    } catch (error) {
      console.error("[v0] Erro ao carregar dados:", error)
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("[v0] Erro ao fazer logout:", error)
    }
  }

  const handleCreateCommittee = async () => {
    if (!user) return

    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("committees")
        .insert([
          {
            name: newCommittee.name,
            description: newCommittee.description,
            neighborhood: newCommittee.neighborhood,
            creator_id: user.id,
            profile_image_url: newCommittee.profileImage || null,
            street_address: newCommittee.streetAddress || null,
            street_number: newCommittee.streetNumber || null,
            cep: newCommittee.cep || null,
            gallery_images: newCommittee.galleryImages.length > 0 ? newCommittee.galleryImages : null,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Adicionar criador como membro
      await supabase.from("committee_members").insert([{ committee_id: data.id, user_id: user.id }])

      setShowCreateCommittee(false)
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

      setFeedbackMessage({ type: "success", message: "Comitê criado com sucesso!" })
      setTimeout(() => setFeedbackMessage(null), 3000)

      loadData()
    } catch (error) {
      console.error("[v0] Erro ao criar comitê:", error)
      setFeedbackMessage({ type: "error", message: "Erro ao criar comitê. Tente novamente." })
      setTimeout(() => setFeedbackMessage(null), 3000)
    }
  }

  const handleJoinCommittee = async () => {
    if (!user || !selectedCommittee) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("committee_members")
        .insert([{ committee_id: selectedCommittee.id, user_id: user.id }])

      if (error) throw error

      setShowJoinModal(false)
      setSelectedCommittee(null)
      setFeedbackMessage({ type: "success", message: `Você agora é membro do ${selectedCommittee.name}!` })
      setTimeout(() => setFeedbackMessage(null), 3000)

      loadData()
    } catch (error) {
      console.error("[v0] Erro ao entrar no comitê:", error)
      setFeedbackMessage({ type: "error", message: "Erro ao entrar no comitê. Tente novamente." })
      setTimeout(() => setFeedbackMessage(null), 3000)
    }
  }

  const handleJoinEvent = async () => {
    if (!user || !selectedEvent) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("event_attendance")
        .insert([{ event_id: selectedEvent.id, user_id: user.id }])

      if (error) throw error

      setShowEventModal(false)
      setSelectedEvent(null)
      setFeedbackMessage({
        type: "success",
        message: `Presença confirmada no evento "${selectedEvent.title}"!`,
      })
      setTimeout(() => setFeedbackMessage(null), 3000)

      loadData()
    } catch (error) {
      console.error("[v0] Erro ao confirmar presença:", error)
      setFeedbackMessage({ type: "error", message: "Erro ao confirmar presença. Tente novamente." })
      setTimeout(() => setFeedbackMessage(null), 3000)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <TreePine className="h-12 w-12 text-primary mx-auto mb-4 animate-bounce" />
          <p className="text-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
            feedbackMessage.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {feedbackMessage.type === "success" ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span>{feedbackMessage.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TreePine className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold text-foreground">RenovaTerra</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-primary">
              Dashboard
            </Link>
            <Link href="/mapa" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Mapa
            </Link>
            <Link href="/eventos" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Eventos
            </Link>
            <Link
              href="/recompensas"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Recompensas
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-primary text-primary hover:bg-primary/10 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Olá, {user?.user_metadata?.full_name || "Membro"}!
          </h1>
          <p className="text-lg text-muted-foreground">Bem-vindo de volta. Veja o que está acontecendo.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-border bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-3xl font-bold text-foreground">{points}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Meus Pontos</p>
                  <Link href="/recompensas">
                    <Button variant="link" className="text-primary p-0 h-auto text-sm mt-2">
                      Ver recompensas →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-border bg-gradient-to-br from-accent/10 to-accent/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Próximo Evento</p>
                  {events.length > 0 ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">{events[0].title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(events[0].event_date)}</p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Nenhum evento próximo</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border bg-gradient-to-br from-secondary/30 to-secondary/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <TreePine className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-3xl font-bold text-foreground">{myCommittees.length}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Meus Comitês</p>
                  <p className="text-xs text-muted-foreground mt-1">Comitês que você criou</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold text-card-foreground">Ver Todos os Eventos</CardTitle>
                <Link href="/eventos">
                  <Button variant="link" className="text-primary">
                    Ver calendário completo →
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.length > 0 ? (
                    events.slice(0, 5).map((event) => (
                      <Card key={event.id} className="border-border bg-secondary/10">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-4 flex-1">
                              <div className="h-14 w-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                                <Calendar className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-card-foreground mb-1">{event.title}</h4>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {formatDate(event.event_date)} às {formatTime(event.event_date)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>{event.location || "Local a confirmar"}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <TreePine className="h-3 w-3" />
                                    <span>{event.committees?.name}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {userAttendance.has(event.id) ? (
                              <Button
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700 flex-shrink-0"
                                disabled
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirmado
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
                                onClick={() => {
                                  setSelectedEvent(event)
                                  setShowEventModal(true)
                                }}
                              >
                                Participar do Evento
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum evento disponível no momento
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-card-foreground">Encontrar Mais Comitês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allCommittees.length > 0 ? (
                    allCommittees
                      .filter((c) => c.creator_id !== user?.id)
                      .map((committee) => (
                        <Card key={committee.id} className="border-border bg-secondary/10">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  {committee.profile_image_url ? (
                                    <img
                                      src={committee.profile_image_url || "/placeholder.svg"}
                                      alt={committee.name}
                                      className="h-12 w-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <TreePine className="h-6 w-6 text-primary" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/comite/${committee.id}`}>
                                    <h4 className="font-semibold text-card-foreground hover:text-primary transition-colors truncate">
                                      {committee.name}
                                    </h4>
                                  </Link>
                                  <p className="text-sm text-muted-foreground truncate">{committee.neighborhood}</p>
                                </div>
                              </div>
                              {memberCommitteeIds.has(committee.id) ? (
                                <Button
                                  size="sm"
                                  className="bg-green-600 text-white hover:bg-green-700 flex-shrink-0"
                                  disabled
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Membro
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-primary text-primary hover:bg-primary/10 bg-transparent flex-shrink-0"
                                  onClick={() => {
                                    setSelectedCommittee(committee)
                                    setShowJoinModal(true)
                                  }}
                                >
                                  <Users className="h-4 w-4 mr-1" />
                                  Ser Membro
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum comitê disponível</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-card-foreground">Meus Comitês</CardTitle>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setShowCreateCommittee(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Criar Comitê
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myCommittees.length > 0 ? (
                    myCommittees.map((committee) => (
                      <Link key={committee.id} href={`/comite/${committee.id}`}>
                        <Card className="border-border bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {committee.profile_image_url ? (
                                  <img
                                    src={committee.profile_image_url || "/placeholder.svg"}
                                    alt={committee.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <TreePine className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-card-foreground text-sm truncate">{committee.name}</p>
                                <p className="text-xs text-muted-foreground">{committee.neighborhood}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Você ainda não criou nenhum comitê</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-card-foreground">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/eventos">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border hover:bg-muted bg-transparent"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Calendário
                  </Button>
                </Link>
                <Link href="/mapa">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border hover:bg-muted bg-transparent"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Explorar Mapa
                  </Button>
                </Link>
                <Link href="/recompensas">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border hover:bg-muted bg-transparent"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Resgatar Pontos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showCreateCommittee} onOpenChange={setShowCreateCommittee}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Comitê</DialogTitle>
            <DialogDescription>
              Etapa {createStep} de 3 {createStep === 3 && "(opcional)"}
            </DialogDescription>
          </DialogHeader>

          {/* Progress indicator */}
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className={`flex-1 h-2 rounded-full ${step <= createStep ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>

          {createStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Comitê *</Label>
                <Input
                  id="name"
                  value={newCommittee.name}
                  onChange={(e) => setNewCommittee({ ...newCommittee, name: e.target.value.slice(0, 50) })}
                  placeholder="Ex: Comitê Verde do Centro"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">{newCommittee.name.length}/50 caracteres</p>
              </div>
              <div>
                <Label htmlFor="profileImage">URL da Foto de Perfil</Label>
                <Input
                  id="profileImage"
                  value={newCommittee.profileImage}
                  onChange={(e) => setNewCommittee({ ...newCommittee, profileImage: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div>
                <Label htmlFor="description">Sobre o Comitê *</Label>
                <Textarea
                  id="description"
                  value={newCommittee.description}
                  onChange={(e) => setNewCommittee({ ...newCommittee, description: e.target.value.slice(0, 300) })}
                  placeholder="Descreva o objetivo e atividades do comitê..."
                  rows={4}
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground mt-1">{newCommittee.description.length}/300 caracteres</p>
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="streetAddress">Endereço (Nome da Rua) *</Label>
                <Input
                  id="streetAddress"
                  value={newCommittee.streetAddress}
                  onChange={(e) => setNewCommittee({ ...newCommittee, streetAddress: e.target.value })}
                  placeholder="Ex: Rua das Flores"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="streetNumber">Número</Label>
                  <Input
                    id="streetNumber"
                    value={newCommittee.streetNumber}
                    onChange={(e) => setNewCommittee({ ...newCommittee, streetNumber: e.target.value })}
                    placeholder="123"
                  />
                </div>
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={newCommittee.cep}
                    onChange={(e) => setNewCommittee({ ...newCommittee, cep: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input
                  id="neighborhood"
                  value={newCommittee.neighborhood}
                  onChange={(e) => setNewCommittee({ ...newCommittee, neighborhood: e.target.value })}
                  placeholder="Ex: Centro"
                />
              </div>
            </div>
          )}

          {createStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Adicione URLs de imagens da galeria do seu comitê (opcional)
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
                      setNewCommittee({ ...newCommittee, galleryImages: newGallery.filter(Boolean) })
                    }}
                    placeholder="https://exemplo.com/imagem.jpg"
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
                className="border-border bg-transparent"
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
              <Button onClick={handleCreateCommittee} className="bg-primary text-primary-foreground">
                Criar Comitê
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entrar no Comitê</DialogTitle>
            <DialogDescription>Você deseja se tornar membro do comitê "{selectedCommittee?.name}"?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowJoinModal(false)
                setSelectedCommittee(null)
              }}
              className="border-border bg-transparent"
            >
              Cancelar
            </Button>
            <Button onClick={handleJoinCommittee} className="bg-primary text-primary-foreground">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Participar do Evento</DialogTitle>
            <DialogDescription>
              Você deseja confirmar sua presença no evento "{selectedEvent?.title}"?
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-2 text-sm text-muted-foreground py-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(selectedEvent.event_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatTime(selectedEvent.event_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{selectedEvent.location || "Local a confirmar"}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEventModal(false)
                setSelectedEvent(null)
              }}
              className="border-border bg-transparent"
            >
              Cancelar
            </Button>
            <Button onClick={handleJoinEvent} className="bg-primary text-primary-foreground">
              Confirmar Presença
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
