-- ===========================================
-- Script 003: Sistema de Recompensas e Lojas
-- ===========================================

-- Criar tabela de lojas parceiras
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  neighborhood text NOT NULL,
  city text NOT NULL DEFAULT 'Recife',
  state text NOT NULL DEFAULT 'PE',
  cep text,
  phone text,
  created_at timestamp DEFAULT now()
);

-- Criar tabela de produtos disponíveis nas lojas
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  points_cost integer NOT NULL,
  image_url text,
  category text,
  stock integer DEFAULT 100,
  created_at timestamp DEFAULT now()
);

-- Criar tabela de resgates de recompensas
CREATE TABLE IF NOT EXISTS public.redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  points_spent integer NOT NULL,
  redeemed_at timestamp DEFAULT now(),
  status text DEFAULT 'pending'
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lojas (todos podem visualizar)
CREATE POLICY "Anyone can view stores"
  ON public.stores FOR SELECT
  USING (true);

-- Políticas RLS para produtos (todos podem visualizar)
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

-- Políticas RLS para resgates
CREATE POLICY "Users can view their redemptions"
  ON public.redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create redemptions"
  ON public.redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para atualizar pontos do usuário
CREATE POLICY "Users can update their points"
  ON public.user_points FOR UPDATE
  USING (auth.uid() = user_id);

-- Atualizar trigger para novos usuários começarem com 1250 pontos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  
  -- Novos usuários começam com 1250 pontos
  INSERT INTO public.user_points (user_id, points)
  VALUES (new.id, 1250)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Inserir lojas parceiras em Pernambuco
INSERT INTO public.stores (name, address, neighborhood, city, state, cep, phone) VALUES
('EcoJardim Recife', 'Rua do Hospício, 150', 'Boa Vista', 'Recife', 'PE', '50050-050', '(81) 3222-1100'),
('Verde Vida Garden Center', 'Av. Conselheiro Aguiar, 2500', 'Boa Viagem', 'Recife', 'PE', '51020-020', '(81) 3325-4500'),
('Sementes do Agreste', 'Rua Siqueira Campos, 80', 'Centro', 'Caruaru', 'PE', '55004-040', '(81) 3721-8900'),
('Flora Nordeste', 'Av. Dantas Barreto, 1200', 'Santo Antônio', 'Recife', 'PE', '50010-000', '(81) 3224-3300'),
('Horta Urbana PE', 'Rua Real da Torre, 450', 'Madalena', 'Recife', 'PE', '50610-000', '(81) 3227-6600'),
('Raízes do Sertão', 'Av. Agamenon Magalhães, 3000', 'Derby', 'Recife', 'PE', '52010-000', '(81) 3421-1500'),
('Natureza Viva', 'Rua do Giriquiti, 100', 'Afogados', 'Recife', 'PE', '50770-360', '(81) 3252-8800')
ON CONFLICT DO NOTHING;

TRUNCATE TABLE public.products CASCADE;

-- Inserir produtos variados nas lojas
-- Loja 1: EcoJardim Recife
INSERT INTO public.products (store_id, name, description, points_cost, image_url, category) 
SELECT id, 'Kit de Jardinagem Completo', 'Conjunto com pá, rastelo, luvas e regador para iniciar sua horta', 80, '/gardening-tools-kit.jpg', 'Ferramentas'
FROM public.stores WHERE name = 'EcoJardim Recife';

INSERT INTO public.products (store_id, name, description, points_cost, image_url, category) 
SELECT id, 'Pacote de Sementes Orgânicas', '10 variedades de sementes de hortaliças orgânicas', 50, '/organic-seeds-packets.jpg', 'Sementes'
FROM public.stores WHERE name = 'EcoJardim Recife';

-- Loja 2: Verde Vida Garden Center
INSERT INTO public.products (store_id, name, description, points_cost, image_url, category) 
SELECT id, 'Muda de Ipê Amarelo', 'Muda de árvore nativa, símbolo do Brasil', 120, '/tree-sapling-pot.jpg', 'Mudas'
FROM public.stores WHERE name = 'Verde Vida Garden Center';

INSERT INTO public.products (store_id, name, description, points_cost, image_url, category) 
SELECT id, 'Composteira Doméstica', 'Sistema completo para compostagem caseira de 50L', 150, '/home-composting-bin.jpg', 'Compostagem'
FROM public.stores WHERE name = 'Verde Vida Garden Center';

-- Loja 3: Sementes do Agreste
INSERT INTO public.products (store_id, name, description, points_cost, image_url, category) 
SELECT id, 'Kit de Mudas de Temperos', '5 mudas de temperos: manjericão, alecrim, hortelã, salsinha e cebolinha', 60, '/herb-seedlings-kit.jpg', 'Mudas'
FROM public.stores WHERE name = 'Sementes do Agreste';

INSERT INTO public.products (store_id, name, description, points_cost, image_url, category) 
SELECT id, 'Sementes de Girassol', 'Pacote com 100 sementes de girassol gigante', 35, '/organic-seeds-packets.jpg', 'Sementes'
FROM public.stores WHERE name = 'Sementes do Agreste';

-- Loja 4: Flora Nordeste
INSERT INTO public.products (store_id, name, description, points_cost, image_url, category) 
SELECT id, 'Livro de Permacultura', 'Guia completo de práticas sustentáveis para o Nordeste', 70, '/permaculture-book.jpg', 'Educação'
FROM public.stores WHERE name = 'Flora Nordeste';

INSERT INTO public.products (store_id, name, description, points_cost, image_url, category) 
SELECT id, 'Muda de Pau-Brasil', 'Muda de árvore símbolo nacional, espécie protegida', 200, '/tree-sapling-pot.jpg', 'Mudas'
FROM public.stores WHERE name = 'Flora Nordeste';

-- Loja 5: Horta Urbana PE
INSERT INTO public.products (store_id, name, description, points_cost, image_url, category) 
SELECT id, 'Sistema de Irrigação por Gotejamento', 'Kit completo para irrigação automática de até 20 vasos', 90, '/automatic-watering-system.jpg', 'Ferramentas'
FROM public.stores WHERE name = 'Horta Urbana PE';

INSERT INTO public.products (store_id, name, description, points_cost, image_url, category) 
SELECT id, 'Kit de Análise de Solo', 'Teste completo de pH e nutrientes do solo', 100, '/soil-testing-kit.jpg', 'Ferramentas'
FROM public.stores WHERE name = 'Horta Urbana PE';

-- Loja 6: Raízes do Sertão
INSERT INTO public.products (store_id, name, description, points_cost, image_url, category) 
SELECT id, 'Camiseta RenovaTerra', 'Camiseta 100% algodão orgânico com estampa exclusiva', 40, '/green-eco-tshirt.jpg', 'Vestuário'
FROM public.stores WHERE name = 'Raízes do Sertão';

INSERT INTO public.products (store_id, name, description, points_cost, image_url, category) 
SELECT id, 'Adubo Orgânico 5kg', 'Adubo 100% orgânico para hortas e jardins', 45, '/gardening-tools-kit.jpg', 'Insumos'
FROM public.stores WHERE name = 'Raízes do Sertão';

-- Loja 7: Natureza Viva
INSERT INTO public.products (store_id, name, description, points_cost, image_url, category) 
SELECT id, 'Vaso de Fibra de Coco', 'Vaso biodegradável de 30cm, ideal para mudas', 30, '/tree-sapling-pot.jpg', 'Acessórios'
FROM public.stores WHERE name = 'Natureza Viva';

INSERT INTO public.products (store_id, name, description, points_cost, image_url, category) 
SELECT id, 'Kit Horta Vertical', 'Estrutura para montar horta vertical com 6 vasos', 180, '/gardening-tools-kit.jpg', 'Ferramentas'
FROM public.stores WHERE name = 'Natureza Viva';

-- Atualizar usuários existentes para terem 1250 pontos (para desenvolvimento)
UPDATE public.user_points SET points = 1250, updated_at = now();
