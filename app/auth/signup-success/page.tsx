import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TreePine, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignupSuccess() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TreePine className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">RenovaTerra</span>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <CheckCircle className="h-16 w-16 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Conta Criada com Sucesso!</h2>
                  <p className="text-muted-foreground mb-6">
                    Verifique seu email para confirmar sua conta. Depois faça login para começar.
                  </p>
                </div>
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full">Ir para Login</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
