"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Award, ShoppingBag, Sprout, TreePine, Package } from "lucide-react"
import Link from "next/link"

const rewards = [
  {
    id: 1,
    name: "Kit de Jardinagem Completo",
    points: 80,
    description: "Conjunto com pá, rastelo, luvas e regador",
    image: "/gardening-tools-kit.jpg",
    category: "Ferramentas",
    icon: ShoppingBag,
  },
  {
    id: 2,
    name: "Pacote de Sementes Orgânicas",
    points: 50,
    description: "10 variedades de sementes de hortaliças",
    image: "/organic-seeds-packets.jpg",
    category: "Sementes",
    icon: Sprout,
  },
  {
    id: 3,
    name: "Muda de Árvore Nativa",
    points: 120,
    description: "Muda de espécie nativa da região",
    image: "/tree-sapling-pot.jpg",
    category: "Mudas",
    icon: TreePine,
  },
  {
    id: 4,
    name: "Composteira Doméstica",
    points: 150,
    description: "Sistema completo para compostagem caseira",
    image: "/home-composting-bin.jpg",
    category: "Compostagem",
    icon: Package,
  },
  {
    id: 5,
    name: "Kit de Mudas de Temperos",
    points: 60,
    description: "5 mudas de temperos para horta caseira",
    image: "/herb-seedlings-kit.jpg",
    category: "Mudas",
    icon: Sprout,
  },
  {
    id: 6,
    name: "Livro de Permacultura",
    points: 70,
    description: "Guia completo de práticas sustentáveis",
    image: "/permaculture-book.jpg",
    category: "Educação",
    icon: Package,
  },
  {
    id: 7,
    name: "Regador Automático",
    points: 90,
    description: "Sistema de irrigação por gotejamento",
    image: "/automatic-watering-system.jpg",
    category: "Ferramentas",
    icon: ShoppingBag,
  },
  {
    id: 8,
    name: "Kit de Análise de Solo",
    points: 100,
    description: "Teste completo de pH e nutrientes",
    image: "/soil-testing-kit.jpg",
    category: "Ferramentas",
    icon: ShoppingBag,
  },
  {
    id: 9,
    name: "Camiseta Comitês Verdes",
    points: 40,
    description: "Camiseta 100% algodão orgânico",
    image: "/green-eco-tshirt.jpg",
    category: "Vestuário",
    icon: Package,
  },
]

export default function RecompensasPage() {
  const [userPoints] = useState(1250)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const handleRedeem = (rewardId: number, points: number) => {
    if (userPoints >= points) {
      console.log("[v0] Redeeming reward:", rewardId)
      // Lógica de resgate
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
            <Link href="/recompensas" className="text-sm font-medium text-primary">
              Recompensas
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header with Points */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Resgate suas Recompensas</h1>
              <p className="text-lg text-muted-foreground">
                Troque seus pontos por produtos sustentáveis e continue fazendo a diferença
              </p>
            </div>

            {/* Points Display */}
            <Card className="border-border bg-gradient-to-br from-primary/10 to-primary/5 md:w-64">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Seus Pontos</span>
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <p className="text-4xl font-bold text-foreground">{userPoints}</p>
                <p className="text-xs text-muted-foreground mt-1">Continue participando para ganhar mais!</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const canAfford = userPoints >= reward.points
            const Icon = reward.icon

            return (
              <Card
                key={reward.id}
                className={`border-border bg-card overflow-hidden transition-all ${
                  hoveredCard === reward.id ? "shadow-xl scale-105" : "shadow-md"
                } ${!canAfford ? "opacity-60" : ""}`}
                onMouseEnter={() => setHoveredCard(reward.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative h-64 bg-gradient-to-br from-primary/5 to-secondary/10 overflow-hidden">
                  <img
                    src={reward.image || "/placeholder.svg"}
                    alt={reward.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <div className="h-10 w-10 rounded-full bg-background/90 backdrop-blur flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <div className="px-3 py-1 rounded-full bg-background/90 backdrop-blur">
                      <span className="text-xs font-semibold text-foreground">{reward.category}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-card-foreground mb-2">{reward.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{reward.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold text-foreground">{reward.points}</span>
                      <span className="text-sm text-muted-foreground">pontos</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRedeem(reward.id, reward.points)}
                    disabled={!canAfford}
                    className={`w-full ${
                      canAfford
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    } ${hoveredCard === reward.id && canAfford ? "shadow-lg" : ""}`}
                  >
                    {canAfford ? "Resgatar" : `Faltam ${reward.points - userPoints} pontos`}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* How to Earn Points */}
        <Card className="border-border bg-card mt-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-card-foreground mb-6 text-center">Como Ganhar Pontos</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TreePine className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">Participe de Eventos</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ganhe 50 pontos por cada evento de plantio ou limpeza que você participar
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sprout className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">Plante Árvores</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Receba 20 pontos por cada árvore plantada e registrada no sistema
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">Conquiste Badges</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Complete desafios mensais e ganhe até 100 pontos extras por conquista
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
