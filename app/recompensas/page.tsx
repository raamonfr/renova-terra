"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  TreePine,
  Award,
  ShoppingBag,
  Sprout,
  Package,
  MapPin,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { AppHeader } from "@/components/app-header"

interface Store {
  id: string
  name: string
  address: string
  neighborhood: string
  city: string
  state: string
  cep: string
  phone: string
}

interface Product {
  id: string
  store_id: string
  name: string
  description: string
  points_cost: number
  image_url: string
  category: string
  store?: Store
}

interface Redemption {
  id: string
  user_id: string
  product_id: string
  store_id: string
  points_spent: number
  redeemed_at: string
}

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case "ferramentas":
      return ShoppingBag
    case "sementes":
    case "mudas":
      return Sprout
    default:
      return Package
  }
}

export default function RecompensasPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [userPoints, setUserPoints] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)

  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackStore, setFeedbackStore] = useState<Store | null>(null)

  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // Verificar autenticação
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }
        setUserId(user.id)

        // Buscar pontos do usuário
        const { data: pointsData } = await supabase.from("user_points").select("points").eq("user_id", user.id).single()

        if (pointsData) {
          setUserPoints(pointsData.points)
        } else {
          // Se não existir, criar registro com 1250 pontos
          await supabase.from("user_points").insert({ user_id: user.id, points: 1250 })
          setUserPoints(1250)
        }

        // Buscar produtos com informações da loja
        const { data: productsData } = await supabase
          .from("products")
          .select(`
            *,
            store:stores(*)
          `)
          .order("points_cost", { ascending: true })

        if (productsData) {
          setProducts(productsData)
        }

        // Buscar resgates do usuário
        const { data: redemptionsData } = await supabase.from("redemptions").select("*").eq("user_id", user.id)

        if (redemptionsData) {
          setRedemptions(redemptionsData)
        }
      } catch (error) {
        console.error("[v0] Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase, router])

  const isOnCooldown = (productId: string): boolean => {
    const redemption = redemptions.find((r) => r.product_id === productId)
    if (!redemption) return false

    const redeemedAt = new Date(redemption.redeemed_at)
    const now = new Date()
    const diffDays = (now.getTime() - redeemedAt.getTime()) / (1000 * 60 * 60 * 24)

    return diffDays < 4
  }

  const getCooldownDaysLeft = (productId: string): number => {
    const redemption = redemptions.find((r) => r.product_id === productId)
    if (!redemption) return 0

    const redeemedAt = new Date(redemption.redeemed_at)
    const now = new Date()
    const diffDays = (now.getTime() - redeemedAt.getTime()) / (1000 * 60 * 60 * 24)

    return Math.ceil(4 - diffDays)
  }

  const handleOpenConfirmModal = (product: Product) => {
    setSelectedProduct(product)
    setShowConfirmModal(true)
  }

  const handleConfirmRedeem = async () => {
    if (!selectedProduct || !userId) return

    setIsRedeeming(true)

    try {
      // Verificar se tem pontos suficientes
      if (userPoints < selectedProduct.points_cost) {
        setFeedbackSuccess(false)
        setFeedbackMessage("Você não tem pontos suficientes para resgatar esta recompensa.")
        setFeedbackStore(null)
        setShowConfirmModal(false)
        setShowFeedbackModal(true)
        return
      }

      // Registrar resgate
      const { error: redemptionError } = await supabase.from("redemptions").insert({
        user_id: userId,
        product_id: selectedProduct.id,
        store_id: selectedProduct.store_id,
        points_spent: selectedProduct.points_cost,
      })

      if (redemptionError) throw redemptionError

      // Atualizar pontos do usuário
      const newPoints = userPoints - selectedProduct.points_cost
      const { error: pointsError } = await supabase
        .from("user_points")
        .update({ points: newPoints, updated_at: new Date().toISOString() })
        .eq("user_id", userId)

      if (pointsError) throw pointsError

      // Atualizar estado local
      setUserPoints(newPoints)
      setRedemptions([
        ...redemptions,
        {
          id: crypto.randomUUID(),
          user_id: userId,
          product_id: selectedProduct.id,
          store_id: selectedProduct.store_id,
          points_spent: selectedProduct.points_cost,
          redeemed_at: new Date().toISOString(),
        },
      ])

      // Mostrar feedback de sucesso
      setFeedbackSuccess(true)
      setFeedbackMessage(`Parabéns! Você resgatou "${selectedProduct.name}" com sucesso!`)
      setFeedbackStore(selectedProduct.store as Store)
    } catch (error) {
      console.error("[v0] Error redeeming:", error)
      setFeedbackSuccess(false)
      setFeedbackMessage("Ocorreu um erro ao resgatar a recompensa. Tente novamente.")
      setFeedbackStore(null)
    } finally {
      setIsRedeeming(false)
      setShowConfirmModal(false)
      setShowFeedbackModal(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando recompensas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader />

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

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const canAfford = userPoints >= product.points_cost
            const onCooldown = isOnCooldown(product.id)
            const cooldownDays = getCooldownDaysLeft(product.id)
            const Icon = getCategoryIcon(product.category)
            const isDisabled = !canAfford || onCooldown

            return (
              <Card
                key={product.id}
                className={`border-border bg-card overflow-hidden transition-all ${
                  hoveredCard === product.id ? "shadow-xl scale-105" : "shadow-md"
                } ${isDisabled ? "opacity-60" : ""}`}
                onMouseEnter={() => setHoveredCard(product.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative h-64 bg-gradient-to-br from-primary/5 to-secondary/10 overflow-hidden">
                  <img
                    src={product.image_url || "/imgs/placeholder.svg?height=256&width=384&query=eco product"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <div className="h-10 w-10 rounded-full bg-background/90 backdrop-blur flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <div className="px-3 py-1 rounded-full bg-background/90 backdrop-blur">
                      <span className="text-xs font-semibold text-foreground">{product.category}</span>
                    </div>
                  </div>
                  {onCooldown && (
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="px-3 py-2 rounded-lg bg-amber-500/90 backdrop-blur text-white text-center">
                        <span className="text-xs font-semibold">Disponível em {cooldownDays} dia(s)</span>
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-card-foreground mb-1">{product.name}</h3>
                  {product.store && (
                    <p className="text-xs text-primary mb-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {product.store.name} - {product.store.neighborhood}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{product.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold text-foreground">{product.points_cost}</span>
                      <span className="text-sm text-muted-foreground">pontos</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleOpenConfirmModal(product)}
                    disabled={isDisabled}
                    className={`w-full ${
                      !isDisabled
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    } ${hoveredCard === product.id && !isDisabled ? "shadow-lg" : ""}`}
                  >
                    {onCooldown
                      ? `Aguarde ${cooldownDays} dia(s)`
                      : canAfford
                        ? "Resgatar"
                        : `Faltam ${product.points_cost - userPoints} pontos`}
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

      {showConfirmModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-card-foreground">Confirmar Resgate</h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex gap-4 mb-6">
                <img
                  src={selectedProduct.image_url || "/placeholder.svg?height=80&width=80&query=product"}
                  alt={selectedProduct.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-semibold text-card-foreground">{selectedProduct.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Custo:</span>
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <Award className="h-4 w-4 text-primary" />
                    {selectedProduct.points_cost} pontos
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-muted-foreground">Seus pontos após resgate:</span>
                  <span className="font-bold text-foreground">{userPoints - selectedProduct.points_cost} pontos</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6 text-center">
                Deseja realmente gastar <strong>{selectedProduct.points_cost} pontos</strong> nesta recompensa?
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1"
                  disabled={isRedeeming}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmRedeem}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isRedeeming}
                >
                  {isRedeeming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Resgatando...
                    </>
                  ) : (
                    "Confirmar Resgate"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border bg-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                {feedbackSuccess ? (
                  <>
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-card-foreground mb-2">Resgate Realizado!</h3>
                    <p className="text-muted-foreground mb-4">{feedbackMessage}</p>

                    {feedbackStore && (
                      <div className="w-full bg-muted/50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-card-foreground mb-2 flex items-center justify-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          Local de Retirada
                        </h4>
                        <p className="font-medium text-foreground">{feedbackStore.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {feedbackStore.address}, {feedbackStore.neighborhood}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {feedbackStore.city} - {feedbackStore.state}, {feedbackStore.cep}
                        </p>
                        {feedbackStore.phone && <p className="text-sm text-primary mt-2">Tel: {feedbackStore.phone}</p>}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mb-4">
                      Apresente seu perfil no app para retirar a recompensa na loja.
                      <br />
                      Este produto estará disponível para novo resgate em 4 dias.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-card-foreground mb-2">Ops! Algo deu errado</h3>
                    <p className="text-muted-foreground mb-6">{feedbackMessage}</p>
                  </>
                )}

                <Button
                  onClick={() => setShowFeedbackModal(false)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Entendido
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
