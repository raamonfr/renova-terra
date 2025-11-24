"use client"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Calendar, TreePine, MapPin, LogOut } from "lucide-react"
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
}

interface Event {
  id: string
  title: string
  event_date: string
  committee_id: string
  committees: {
    name: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [committees, setCommittees] = useState<Committee[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [points, setPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

        setUser(currentUser)

        // Buscar comitês do usuário
        const { data: userCommittees } = await supabase
          .from("committee_members")
          .select("committee_id")
          .eq("user_id", currentUser.id)

        if (userCommittees && userCommittees.length > 0) {
          const committeeIds = userCommittees.map((c) => c.committee_id)

          const { data: committeesData } = await supabase.from("committees").select("*").in("id", committeeIds)

          if (committeesData) {
            setCommittees(committeesData)
          }

          // Buscar eventos dos comitês
          const { data: eventsData } = await supabase
            .from("events")
            .select("*, committees(name)")
            .in("committee_id", committeeIds)
            .gte("event_date", new Date().toISOString())
            .order("event_date", { ascending: true })
            .limit(5)

          if (eventsData) {
            setEvents(eventsData)
          }
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

    loadData()
  }, [router])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("[v0] Erro ao fazer logout:", error)
    }
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
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(events[0].event_date).toLocaleDateString("pt-BR")}
                      </p>
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
                    <span className="text-3xl font-bold text-foreground">{committees.length}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Meus Comitês</p>
                  <p className="text-xs text-muted-foreground mt-1">Comitês ativos</p>
                </CardContent>
              </Card>
            </div>

            {/* Activity Feed */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-card-foreground">Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {events.length > 0 ? (
                    events.map((event) => (
                      <div key={event.id} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-card-foreground">
                            <span className="font-semibold">{event.title}</span> - {event.committees?.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(event.event_date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Committees */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-card-foreground">Meus Comitês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {committees.length > 0 ? (
                    committees.map((committee) => (
                      <Link key={committee.id} href={`/comite/${committee.id}`}>
                        <Card className="border-border bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <TreePine className="h-5 w-5 text-primary" />
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
                    <p className="text-sm text-muted-foreground">Você ainda não participa de nenhum comitê</p>
                  )}
                </div>
                <Link href="/mapa">
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-primary text-primary hover:bg-primary/10 bg-transparent"
                  >
                    Encontrar Mais Comitês
                  </Button>
                </Link>
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
                    Ver Todos os Eventos
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
    </div>
  )
}
