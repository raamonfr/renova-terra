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
git clone https://github.com/raamonfr/renova-terra.git
```

**2. Entre na pasta do projeto**
```bash
cd renova-terra
```

**3. Instale as dependências. Isso vai baixar a pasta node_modules necessária para o projeto rodar e o mapa interativo de comitês:**
```bash
npm install
npm install leaflet
npm install -D @types/leaflet
```

**4. Configure as Variáveis de Ambiente O projeto precisa de chaves de acesso para conectar ao banco de dados (Supabase).**
- Crie um arquivo chamado .env.local na raiz do projeto.
- Copie o conteúdo do arquivo .env.example e cole no seu .env.local.

**Passo 4.1: Criar Conta / Entrar**
- Acesse o site oficial: supabase.com.
- Clique no botão verde "Start your project".
- Escolha "Continue with GitHub".

**Passo 4.2: Acessar ou Criar o Projeto**
- Clique no botão "New Project".
- Escolha sua organização (seu nome).
- Name: Dê um nome (ex: RenovaTerraDB).
- Database Password: Crie uma senha forte e ANOTE ELA (você não consegue ver depois, só resetar).
- Region: Escolha South America (São Paulo) para ficar rápido no Brasil.
- Clique em "Create new project" e espere uns minutos até o ícone ficar verde.

**Passo 4.3: Encontrar as Chaves**
- No menu lateral esquerdo (lá embaixo), clique no ícone de Engrenagem ⚙️ (Project Settings).
- No menu que abrir, clique na opção API.

**Passo 4.4: Copiar e Colar**
Project URL:
- Fica no topo.
- Copie e cole no seu .env.local onde diz NEXT_PUBLIC_SUPABASE_URL.

Project API Keys (Procure a tabela):
- Você verá duas chaves: anon e service_role.
- COPIE A CHAVE anon (public).
- Cole no seu .env.local onde diz NEXT_PUBLIC_SUPABASE_ANON_KEY.

**Seu arquivo .env.local deve ficar dessa forma**
NEXT_PUBLIC_SUPABASE_URL=https://sua-url-aqui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui

**5. Rode o projeto Agora inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

**6. Acesse no navegador O terminal vai mostrar o link de acesso: http://localhost:3000**


## 📚 Documentação e Arquitetura

O projeto possui uma documentação técnica detalhada incluindo diagramas de arquitetura, modelagem de banco de dados e decisões de infraestrutura.

📄 **[Acesse o Design Técnico Completo (PDF)](/app/docs/Sprint%204%20-%20Design%20Técnico.pdf)**