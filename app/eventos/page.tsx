"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TreePine, Calendar, MapPin, List, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function EventosPage() {
  const [events, setEvents] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 0, 1))
  const [userAttendance, setUserAttendance] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
    fetchUserAttendance()
  }, [])

  const fetchEvents = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        committees (name)
      `)
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })

    if (error) console.error("Error fetching events:", error)
    else setEvents(data || [])
    setLoading(false)
  }

  const fetchUserAttendance = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from("event_attendance").select("event_id").eq("user_id", user.id)

    if (error) console.error("Error fetching attendance:", error)
    else setUserAttendance(new Set(data?.map((a) => a.event_id) || []))
  }

  const handleConfirmAttendance = async (eventId: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (userAttendance.has(eventId)) {
      // Remove attendance
      const { error } = await supabase.from("event_attendance").delete().eq("event_id", eventId).eq("user_id", user.id)

      if (error) console.error("Error removing attendance:", error)
      else {
        userAttendance.delete(eventId)
        setUserAttendance(new Set(userAttendance))
      }
    } else {
      // Add attendance
      const { error } = await supabase.from("event_attendance").insert([{ event_id: eventId, user_id: user.id }])

      if (error && error.code !== "23505") {
        // 23505 is duplicate key error
        console.error("Error confirming attendance:", error)
      } else {
        userAttendance.add(eventId)
        setUserAttendance(new Set(userAttendance))
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getEventsForDay = (day: number) => {
    const { year, month } = getDaysInMonth(currentMonth)
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.event_date.startsWith(dateString))
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

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
            <Link
              href="/dashboard"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link href="/mapa" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Mapa
            </Link>
            <Link href="/eventos" className="text-sm font-medium text-primary">
              Eventos
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Próximas Atividades</h1>
            <p className="text-lg text-muted-foreground">Participe dos eventos e ganhe pontos</p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-primary" : "border-border"}
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
              className={viewMode === "calendar" ? "bg-primary" : "border-border"}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendário
            </Button>
          </div>
        </div>

        {/* List View */}
        {viewMode === "list" && (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-xl font-bold text-card-foreground flex-1">{event.title}</h3>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location || "Local a confirmar"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TreePine className="h-4 w-4" />
                      <span>{event.committees?.name}</span>
                    </div>
                  </div>

                  {event.description && <p className="text-sm text-muted-foreground mb-4">{event.description}</p>}

                  <Button
                    onClick={() => handleConfirmAttendance(event.id)}
                    className={
                      userAttendance.has(event.id)
                        ? "w-full bg-green-600 text-white hover:bg-green-700"
                        : "w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    }
                  >
                    {userAttendance.has(event.id) ? "✓ Presença Confirmada" : "Confirmar Presença"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-card-foreground capitalize">{monthName}</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={previousMonth}
                    className="border-border hover:bg-muted bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextMonth}
                    className="border-border hover:bg-muted bg-transparent"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-8">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                  <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                    {day}
                  </div>
                ))}

                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1
                  const dayEvents = getEventsForDay(day)
                  const hasEvents = dayEvents.length > 0

                  return (
                    <div
                      key={day}
                      className={`aspect-square border border-border rounded-lg p-2 ${
                        hasEvents ? "bg-primary/5 hover:bg-primary/10 cursor-pointer" : "bg-background"
                      } transition-colors`}
                    >
                      <div className="flex flex-col h-full">
                        <span className={`text-sm font-medium ${hasEvents ? "text-primary" : "text-foreground"}`}>
                          {day}
                        </span>
                        {hasEvents && (
                          <div className="flex-1 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Events for Selected Month */}
              <div>
                <h3 className="text-xl font-bold text-card-foreground mb-4">Eventos deste mês</h3>
                <div className="space-y-3">
                  {events
                    .filter((event) => {
                      const eventDate = new Date(event.event_date)
                      return (
                        eventDate.getMonth() === currentMonth.getMonth() &&
                        eventDate.getFullYear() === currentMonth.getFullYear()
                      )
                    })
                    .map((event) => (
                      <Card key={event.id} className="border-border bg-secondary/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-lg bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                              <span className="text-2xl font-bold text-primary">
                                {new Date(event.event_date).getDate()}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.event_date).toLocaleDateString("pt-BR", { month: "short" })}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-card-foreground mb-1">{event.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location || "Local a confirmar"}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleConfirmAttendance(event.id)}
                              className={
                                userAttendance.has(event.id)
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "bg-primary hover:bg-primary/90"
                              }
                            >
                              {userAttendance.has(event.id) ? "✓ Confirmado" : "Confirmar"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
