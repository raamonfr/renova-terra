"use client"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TreePine, MapPin, Users, Calendar, MessageSquare, Edit, Plus, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Committee {
  id: string
  name: string
  neighborhood: string
  description: string
  creator_id: string
  profile_image_url?: string
  street_address?: string
  street_number?: string
  cep?: string
  gallery_images?: string[]
}

interface Event {
  id: string
  title: string
  event_date: string
  location: string
  description?: string
  reference_point?: string
  street_address?: string
  street_number?: string
  event_neighborhood?: string
  event_cep?: string
  attendees?: { id: string; full_name: string }[]
}

interface Member {
  id: string
  full_name: string
  email: string
}

interface UserData {
  id: string
  email: string
  user_metadata: {
    full_name: string
  }
}

export default function ComitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [activeTab, setActiveTab] = useState("sobre")
  const [committee, setCommittee] = useState<Committee | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isCreator, setIsCreator] = useState(false)
  const [loading, setLoading] = useState(true)
  const [memberCommitteeIds, setMemberCommitteeIds] = useState<Set<string>>(new Set())
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null)
  const [showJoinModal, setShowJoinModal] = useState(false)

  // Modals
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Edit form
  const [editForm, setEditForm] = useState({
    description: "",
    profileImage: "",
    galleryImages: [] as string[],
  })

  // Create event form
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    streetAddress: "",
    streetNumber: "",
    neighborhood: "",
    cep: "",
    referencePoint: "",
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUser(user)
      setUser(user as unknown as UserData)

      const { data: myMembership } = await supabase
        .from("committee_members")
        .select("id")
        .eq("committee_id", id)
        .eq("user_id", user.id)
        .single()

      // Se encontrar registro, atualiza o estado para mudar o botão
      if (myMembership) {
        setMemberCommitteeIds(new Set([id]))
      } else {
        setMemberCommitteeIds(new Set())
      }

      // Fetch committee
      const { data: committeeData, error: committeeError } = await supabase
        .from("committees")
        .select("*")
        .eq("id", id)
        .single()

      if (committeeError || !committeeData) {
        router.push("/dashboard")
        return
      }

      setCommittee(committeeData)
      setIsCreator(user?.id === committeeData.creator_id)
      setEditForm({
        description: committeeData.description || "",
        profileImage: committeeData.profile_image_url || "",
        galleryImages: committeeData.gallery_images || [],
      })

      // Fetch events with attendees
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("committee_id", id)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })

      if (eventsData) {
        // Fetch attendees for each event
        const eventsWithAttendees = await Promise.all(
          eventsData.map(async (event) => {
            const { data: attendees } = await supabase
              .from("event_attendance")
              .select("user_id")
              .eq("event_id", event.id)

            if (attendees && attendees.length > 0) {
              const userIds = attendees.map((a) => a.user_id)
              const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds)

              return { ...event, attendees: profiles || [] }
            }
            return { ...event, attendees: [] }
          }),
        )
        setEvents(eventsWithAttendees)
      }

      // Fetch members
      const { data: memberIds } = await supabase.from("committee_members").select("user_id").eq("committee_id", id)

      if (memberIds && memberIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in(
            "id",
            memberIds.map((m) => m.user_id),
          )

        if (profiles) {
          setMembers(profiles)
        }
      }

      setLoading(false)
    } catch (error) {
      console.error("[v0] Erro ao carregar dados:", error)
      setLoading(false)
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

  const handleUpdateCommittee = async () => {
    if (!committee) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("committees")
        .update({
          description: editForm.description,
          profile_image_url: editForm.profileImage || null,
          gallery_images:
            editForm.galleryImages.filter(Boolean).length > 0 ? editForm.galleryImages.filter(Boolean) : null,
        })
        .eq("id", committee.id)

      if (error) throw error

      setShowEditModal(false)
      setFeedbackMessage({ type: "success", message: "Comitê atualizado com sucesso!" })
      setTimeout(() => setFeedbackMessage(null), 3000)
      loadData()
    } catch (error) {
      console.error("[v0] Erro ao atualizar comitê:", error)
      setFeedbackMessage({ type: "error", message: "Erro ao atualizar comitê." })
      setTimeout(() => setFeedbackMessage(null), 3000)
    }
  }

  const handleCreateEvent = async () => {
    if (!committee || !currentUser) return

    try {
      const supabase = createClient()

      const eventDateTime = new Date(`${newEvent.eventDate}T${newEvent.eventTime || "09:00"}`)

      const { error } = await supabase.from("events").insert([
        {
          title: newEvent.title,
          description: newEvent.description,
          event_date: eventDateTime.toISOString(),
          location: `${newEvent.streetAddress}, ${newEvent.streetNumber} - ${newEvent.neighborhood}`,
          street_address: newEvent.streetAddress,
          street_number: newEvent.streetNumber,
          event_neighborhood: newEvent.neighborhood,
          event_cep: newEvent.cep,
          reference_point: newEvent.referencePoint,
          committee_id: committee.id,
          created_by: currentUser.id,
        },
      ])

      if (error) throw error

      setShowCreateEventModal(false)
      setNewEvent({
        title: "",
        description: "",
        eventDate: "",
        eventTime: "",
        streetAddress: "",
        streetNumber: "",
        neighborhood: "",
        cep: "",
        referencePoint: "",
      })
      setFeedbackMessage({ type: "success", message: "Evento criado com sucesso!" })
      setTimeout(() => setFeedbackMessage(null), 3000)
      loadData()
    } catch (error) {
      console.error("[v0] Erro ao criar evento:", error)
      setFeedbackMessage({ type: "error", message: "Erro ao criar evento." })
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

  if (!committee) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Comitê não encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${feedbackMessage.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
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
            <Link
              href="/dashboard"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link href="/mapa" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Mapa
            </Link>
            <Link href="/eventos" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Eventos
            </Link>
          </nav>
        </div>
      </header>

      {/* Cover and Title */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20">
        <img
          src={committee.gallery_images?.[0] || "/lush-green-community-garden-aerial-view.jpg"}
          alt="Capa do comitê"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="h-32 w-32 rounded-2xl bg-primary shadow-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {committee.profile_image_url ? (
                  <img
                    src={committee.profile_image_url || "/placeholder.svg"}
                    alt={committee.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <TreePine className="h-16 w-16 text-primary-foreground" />
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-4xl font-bold text-foreground mb-2">{committee.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{committee.neighborhood}</span>
                  <span className="mx-2">•</span>
                  <Users className="h-4 w-4" />
                  <span>{members.length} membros</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isCreator && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(true)}
                    className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => setShowCreateEventModal(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Evento
                  </Button>
                </>
              )}
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
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-border bg-card">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-foreground mb-1">{events.length}</p>
              <p className="text-sm text-muted-foreground">Eventos Ativos</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-foreground mb-1">{members.length}</p>
              <p className="text-sm text-muted-foreground">Membros</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-foreground mb-1">
                {events.reduce((acc, e) => acc + (e.attendees?.length || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Presenças Confirmadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="sobre">Sobre</TabsTrigger>
            <TabsTrigger value="eventos">Eventos</TabsTrigger>
            <TabsTrigger value="membros">Membros</TabsTrigger>
            <TabsTrigger value="discussoes">Discussões</TabsTrigger>
          </TabsList>

          <TabsContent value="sobre" className="space-y-8">
            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-card-foreground mb-4">Sobre o Comitê</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {committee.description || "Nenhuma descrição disponível."}
                </p>

                {committee.street_address && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">Endereço</h3>
                    <p className="text-muted-foreground">
                      {committee.street_address}
                      {committee.street_number && `, ${committee.street_number}`} - {committee.neighborhood}
                      {committee.cep && ` - CEP: ${committee.cep}`}
                    </p>
                  </div>
                )}

                <h3 className="text-xl font-semibold text-card-foreground mb-4">Área de Atuação</h3>
                <div className="h-64 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 rounded-lg mb-6 flex items-center justify-center">
                  <img
                    src="/neighborhood-map-with-green-areas-highlighted.jpg"
                    alt="Mapa da área"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {committee.gallery_images && committee.gallery_images.length > 0 && (
                  <>
                    <h3 className="text-xl font-semibold text-card-foreground mb-4">Galeria de Fotos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {committee.gallery_images.map((photo, index) => (
                        <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted">
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eventos" className="space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <Card key={event.id} className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        <div className="h-16 w-16 rounded-lg bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                          <Calendar className="h-6 w-6 text-primary mb-1" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-card-foreground mb-2">{event.title}</h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(event.event_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(event.event_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{event.attendees?.length || 0} participantes confirmados</span>
                            </div>
                          </div>

                          {isCreator && event.attendees && event.attendees.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-sm font-medium text-card-foreground mb-2">Confirmados:</p>
                              <div className="flex flex-wrap gap-2">
                                {event.attendees.map((attendee) => (
                                  <span
                                    key={attendee.id}
                                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                                  >
                                    {attendee.full_name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Participar</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="pt-6 text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum evento agendado</p>
                  {isCreator && (
                    <Button
                      onClick={() => setShowCreateEventModal(true)}
                      className="mt-4 bg-primary text-primary-foreground"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Evento
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="membros">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {members.map((member) => (
                <Card key={member.id} className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-semibold text-primary">
                        {member.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "??"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-card-foreground mb-1">{member.full_name || "Membro"}</h3>
                    <p className="text-sm text-muted-foreground">Membro</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discussoes" className="space-y-6">
            <Card className="border-border bg-card">
              <CardContent className="pt-6 text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">As discussões estarão disponíveis em breve!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Comitê</DialogTitle>
            <DialogDescription>Atualize as informações do seu comitê</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-description">Sobre o Comitê</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value.slice(0, 300) })}
                rows={4}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground mt-1">{editForm.description.length}/300 caracteres</p>
            </div>

            <div>
              <Label htmlFor="edit-profile">URL da Foto de Perfil</Label>
              <Input
                id="edit-profile"
                value={editForm.profileImage}
                onChange={(e) => setEditForm({ ...editForm, profileImage: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div>
              <Label>Galeria de Fotos</Label>
              {[0, 1, 2].map((index) => (
                <Input
                  key={index}
                  value={editForm.galleryImages[index] || ""}
                  onChange={(e) => {
                    const newGallery = [...editForm.galleryImages]
                    newGallery[index] = e.target.value
                    setEditForm({ ...editForm, galleryImages: newGallery })
                  }}
                  placeholder={`Imagem ${index + 1}`}
                  className="mt-2"
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)} className="border-border bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleUpdateCommittee} className="bg-primary text-primary-foreground">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entrar no Comitê</DialogTitle>
            <DialogDescription>
              Você deseja se tornar membro do comitê "{selectedCommittee?.name}"?
            </DialogDescription>
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

      <Dialog open={showCreateEventModal} onOpenChange={setShowCreateEventModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Evento</DialogTitle>
            <DialogDescription>Preencha as informações do evento</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">Nome do Evento *</Label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Ex: Plantio Coletivo"
              />
            </div>

            <div>
              <Label htmlFor="event-description">Descrição</Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Descreva o evento..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-date">Data *</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={newEvent.eventDate}
                  onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="event-time">Horário *</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={newEvent.eventTime}
                  onChange={(e) => setNewEvent({ ...newEvent, eventTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="event-street">Endereço (Rua) *</Label>
              <Input
                id="event-street"
                value={newEvent.streetAddress}
                onChange={(e) => setNewEvent({ ...newEvent, streetAddress: e.target.value })}
                placeholder="Ex: Rua das Palmeiras"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-number">Número</Label>
                <Input
                  id="event-number"
                  value={newEvent.streetNumber}
                  onChange={(e) => setNewEvent({ ...newEvent, streetNumber: e.target.value })}
                  placeholder="123"
                />
              </div>
              <div>
                <Label htmlFor="event-cep">CEP</Label>
                <Input
                  id="event-cep"
                  value={newEvent.cep}
                  onChange={(e) => setNewEvent({ ...newEvent, cep: e.target.value })}
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="event-neighborhood">Bairro *</Label>
              <Input
                id="event-neighborhood"
                value={newEvent.neighborhood}
                onChange={(e) => setNewEvent({ ...newEvent, neighborhood: e.target.value })}
                placeholder="Ex: Centro"
              />
            </div>

            <div>
              <Label htmlFor="event-reference">Ponto de Referência</Label>
              <Input
                id="event-reference"
                value={newEvent.referencePoint}
                onChange={(e) => setNewEvent({ ...newEvent, referencePoint: e.target.value })}
                placeholder="Ex: Próximo ao mercado"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateEventModal(false)}
              className="border-border bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={
                !newEvent.title ||
                !newEvent.eventDate ||
                !newEvent.eventTime ||
                !newEvent.streetAddress ||
                !newEvent.neighborhood
              }
              className="bg-primary text-primary-foreground"
            >
              Criar Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
