# 🚀 Como rodar o projeto localmente

Siga os passos abaixo para baixar, configurar e rodar o RenovaTerra no seu computador.

### 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (Versão 18 ou superior)
* [Git](https://git-scm.com/)

### 🔧 Passo a Passo

**1. Clone o repositório**
Abra o seu terminal (Git Bash, Powershell ou CMD) e digite:

```bash
git clone [https://github.com/raamonfr/renova-terra.git](https://github.com/raamonfr/renova-terra.git)

**2. Entre na pasta do projeto**
```bash
cd renova-terra

**3. Instale as dependências Isso vai baixar a pasta node_modules necessária para o projeto rodar:**
```bash
npm install

***4. Configure as Variáveis de Ambiente O projeto precisa de chaves de acesso para conectar ao banco de dados (Supabase).*
- Crie um arquivo chamado .env.local na raiz do projeto.

- Copie o conteúdo do arquivo .env.example e cole no seu .env.local.

- Peça as chaves reais (NEXT_PUBLIC_SUPABASE_URL e ANON_KEY) ao proprietário do projeto e preencha no arquivo.

NEXT_PUBLIC_SUPABASE_URL=[https://sua-url-aqui.supabase.co](https://sua-url-aqui.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui

**5. Rode o projeto Agora inicie o servidor de desenvolvimento:**
```bash
npm run dev

**6. Acesse no navegador O terminal vai mostrar o link de acesso: http://localhost:3000**