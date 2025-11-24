"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Leaf, MapPin, Users, Calendar, MessageSquare, Heart, Send } from "lucide-react"
import Link from "next/link"

export default function ComitePage() {
  const [activeTab, setActiveTab] = useState("sobre")
  const [newPost, setNewPost] = useState("")

  const committee = {
    id: 1,
    name: "Comitê Jardim Feliz",
    neighborhood: "Jardim Feliz",
    description:
      "Somos um grupo de moradores apaixonados por natureza, dedicados a transformar nosso bairro em um espaço mais verde e sustentável. Desde 2023, já plantamos mais de 100 árvores e realizamos diversos eventos de conscientização ambiental.",
    members: 42,
    treesPlanted: 127,
    eventsHeld: 15,
  }

  const upcomingEvents = [
    {
      id: 1,
      title: "Plantio Coletivo no Parque",
      date: "15 de Janeiro, 2025",
      time: "9h - 12h",
      location: "Parque Municipal",
      participants: 18,
    },
    {
      id: 2,
      title: "Workshop de Compostagem",
      date: "22 de Janeiro, 2025",
      time: "14h - 16h",
      location: "Centro Comunitário",
      participants: 12,
    },
    {
      id: 3,
      title: "Limpeza da Praça Central",
      date: "29 de Janeiro, 2025",
      time: "8h - 11h",
      location: "Praça Central",
      participants: 25,
    },
  ]

  const members = [
    { id: 1, name: "Maria Silva", role: "Fundadora", avatar: "MS" },
    { id: 2, name: "João Santos", role: "Coordenador", avatar: "JS" },
    { id: 3, name: "Ana Costa", role: "Membro", avatar: "AC" },
    { id: 4, name: "Carlos Oliveira", role: "Membro", avatar: "CO" },
    { id: 5, name: "Paula Ferreira", role: "Membro", avatar: "PF" },
    { id: 6, name: "Roberto Lima", role: "Membro", avatar: "RL" },
    { id: 7, name: "Juliana Souza", role: "Membro", avatar: "JS" },
    { id: 8, name: "Fernando Alves", role: "Membro", avatar: "FA" },
  ]

  const discussions = [
    {
      id: 1,
      author: "Maria Silva",
      avatar: "MS",
      time: "há 2 horas",
      content: "Pessoal, conseguimos autorização da prefeitura para plantar 20 árvores na Rua das Flores! 🎉",
      likes: 15,
      comments: 8,
    },
    {
      id: 2,
      author: "João Santos",
      avatar: "JS",
      time: "há 5 horas",
      content:
        "Alguém tem sugestões de espécies nativas que se adaptam bem ao clima da nossa região? Estou pesquisando para o próximo plantio.",
      likes: 8,
      comments: 12,
    },
    {
      id: 3,
      author: "Ana Costa",
      avatar: "AC",
      time: "há 1 dia",
      content: "Fotos do mutirão de ontem! Foi incrível ver tanta gente engajada. Plantamos 15 mudas!",
      image: true,
      likes: 24,
      comments: 6,
    },
  ]

  const photos = [
    "/community-planting-trees-together.jpg",
    "/group-of-volunteers-with-gardening-tools.jpg",
    "/newly-planted-tree-saplings-in-urban-area.jpg",
    "/community-vegetable-garden.png",
    "/people-cleaning-up-park-area.jpg",
    "/environmental-education-workshop.png",
  ]

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      console.log("[v0] New post:", newPost)
      setNewPost("")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold text-foreground">Comitês Verdes</span>
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
        <img src="/lush-green-community-garden-aerial-view.jpg" alt="Capa do comitê" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="h-32 w-32 rounded-2xl bg-primary shadow-xl flex items-center justify-center flex-shrink-0">
                <Leaf className="h-16 w-16 text-primary-foreground" />
              </div>
              <div className="pb-2">
                <h1 className="text-4xl font-bold text-foreground mb-2">{committee.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{committee.neighborhood}</span>
                  <span className="mx-2">•</span>
                  <Users className="h-4 w-4" />
                  <span>{committee.members} membros</span>
                </div>
              </div>
            </div>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Participar do Comitê
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-border bg-card">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-foreground mb-1">{committee.treesPlanted}</p>
              <p className="text-sm text-muted-foreground">Árvores Plantadas</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-foreground mb-1">{committee.eventsHeld}</p>
              <p className="text-sm text-muted-foreground">Eventos Realizados</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-foreground mb-1">{committee.members}</p>
              <p className="text-sm text-muted-foreground">Membros Ativos</p>
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
                <p className="text-muted-foreground leading-relaxed mb-6">{committee.description}</p>

                <h3 className="text-xl font-semibold text-card-foreground mb-4">Área de Atuação</h3>
                <div className="h-64 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 rounded-lg mb-6 flex items-center justify-center">
                  <img
                    src="/neighborhood-map-with-green-areas-highlighted.jpg"
                    alt="Mapa da área"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <h3 className="text-xl font-semibold text-card-foreground mb-4">Galeria de Fotos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={photo || "/placeholder.svg"}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eventos" className="space-y-4">
            {upcomingEvents.map((event) => (
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
                            <span>
                              {event.date} • {event.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{event.participants} participantes confirmados</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Participar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="membros">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {members.map((member) => (
                <Card key={member.id} className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-semibold text-primary">{member.avatar}</span>
                    </div>
                    <h3 className="font-semibold text-card-foreground mb-1">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discussoes" className="space-y-6">
            {/* New Post */}
            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">MS</span>
                  </div>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Compartilhe algo com o comitê..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="mb-3 bg-background border-border min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handlePostSubmit}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Publicar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discussion Feed */}
            {discussions.map((post) => (
              <Card key={post.id} className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">{post.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-card-foreground">{post.author}</h4>
                        <span className="text-xs text-muted-foreground">{post.time}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-3">{post.content}</p>
                      {post.image && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-3">
                          <img
                            src="/community-tree-planting-event-photos.jpg"
                            alt="Post image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
