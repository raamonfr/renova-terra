import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TreePine, MapPin, Users, Award, Facebook, Instagram, Twitter, Mail } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-18 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreePine className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold text-foreground">RenovaTerra</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#como-funciona"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Como Funciona
            </a>
            <Link href="/mapa" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Mapa de Comitês
            </Link>
          </nav>
          <div className="flex gap-6">
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Cadastre-se
                </Button>
              </Link>
            </div>
        </div>
      </header>

      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/imgs/banner.jpg"
            alt="Comunidade plantando árvores"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>

        <div className="container mx-auto px-18 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
              Transforme seu bairro. Plante um futuro mais verde.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              Junte-se ou crie um Comitê Verde e ajude a arborizar sua cidade.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6">
                Quero Fazer Parte
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-20 md:py-28 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Como Funciona</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Três passos simples para começar a fazer a diferença na sua comunidade
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                <MapPin className="h-12 w-12 text-primary" />
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Encontre seu Comitê</h3>
              <p className="text-muted-foreground leading-relaxed">
                Navegue pelo mapa e descubra comitês ativos no seu bairro ou região. Veja as atividades e membros de
                cada grupo.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                <TreePine className="h-12 w-12 text-primary" />
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Participe das Ações</h3>
              <p className="text-muted-foreground leading-relaxed">
                Junte-se aos eventos de plantio, limpeza e educação ambiental. Cada ação conta para um futuro mais
                verde.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                <Award className="h-12 w-12 text-primary" />
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Ganhe Recompensas</h3>
              <p className="text-muted-foreground leading-relaxed">
                Acumule pontos por sua participação e troque por produtos sustentáveis, mudas e kits de jardinagem.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Veja o movimento crescendo na sua cidade
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Centenas de comitês já estão transformando bairros em espaços mais verdes e sustentáveis
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="border-border bg-card overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-[500px] bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5">
                  <img
                    src="/interactive-city-map-with-green-location-pins--urb.jpg"
                    alt="Mapa de comitês"
                    className="w-full h-full object-cover opacity-80"
                  />

                  {/* Pins de exemplo no mapa */}
                  <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative group cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-primary shadow-lg flex items-center justify-center animate-pulse">
                        <TreePine className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                        <div className="bg-card border border-border rounded-lg p-3 shadow-xl whitespace-nowrap">
                          <p className="font-semibold text-card-foreground text-sm">Comitê Jardim Feliz</p>
                          <p className="text-xs text-muted-foreground">42 membros</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative group cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-primary shadow-lg flex items-center justify-center animate-pulse delay-100">
                        <TreePine className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                        <div className="bg-card border border-border rounded-lg p-3 shadow-xl whitespace-nowrap">
                          <p className="font-semibold text-card-foreground text-sm">Verde Centro</p>
                          <p className="text-xs text-muted-foreground">68 membros</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative group cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-primary shadow-lg flex items-center justify-center animate-pulse delay-200">
                        <TreePine className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                        <div className="bg-card border border-border rounded-lg p-3 shadow-xl whitespace-nowrap">
                          <p className="font-semibold text-card-foreground text-sm">Árvores do Sul</p>
                          <p className="text-xs text-muted-foreground">35 membros</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                    <Link href="/mapa">
                      <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl">
                        Explorar Mapa Completo
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Histórias que Inspiram</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Conheça pessoas que estão fazendo a diferença em suas comunidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground">Maria Silva</p>
                      <p className="text-sm text-muted-foreground">Comitê Jardim Feliz</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    "Em 6 meses, plantamos mais de 100 árvores no nosso bairro. Ver a comunidade se unindo por um
                    objetivo comum é emocionante!"
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground">João Santos</p>
                      <p className="text-sm text-muted-foreground">Verde Centro</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    "Comecei sozinho e hoje somos 68 membros ativos. O impacto visual e ambiental no centro da cidade é
                    incrível!"
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground">Ana Costa</p>
                      <p className="text-sm text-muted-foreground">Árvores do Sul</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    "Meus filhos aprenderam sobre sustentabilidade na prática. Agora eles são os maiores defensores do
                    meio ambiente!"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border bg-secondary/20">
        <div className="container px-18">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TreePine className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold text-foreground">RenovaTerra</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Transformando bairros em espaços mais verdes, uma árvore de cada vez.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Facebook className="h-4 w-4 text-primary" />
                </a>
                <a
                  href="#"
                  className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Instagram className="h-4 w-4 text-primary" />
                </a>
                <a
                  href="#"
                  className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Twitter className="h-4 w-4 text-primary" />
                </a>
                <a
                  href="#"
                  className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Mail className="h-4 w-4 text-primary" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Navegação</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#como-funciona" className="hover:text-primary transition-colors">
                    Como Funciona
                  </a>
                </li>
                <li>
                  <Link href="/mapa" className="hover:text-primary transition-colors">
                    Mapa de Comitês
                  </Link>
                </li>
                <li>
                  <Link href="/eventos" className="hover:text-primary transition-colors">
                    Eventos
                  </Link>
                </li>
                <li>
                  <Link href="/recompensas" className="hover:text-primary transition-colors">
                    Recompensas
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Comunidade</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Criar Comitê
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Guia do Membro
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Histórias
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Fale Conosco
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Suporte
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Parcerias
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Imprensa
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>2025 RenovaTerra. Todos os direitos reservados. Feito com amor pelo planeta.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
