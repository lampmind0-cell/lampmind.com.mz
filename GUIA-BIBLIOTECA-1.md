# Guia — Configurar a Biblioteca de Upload (Supabase)

Segue estes passos uma única vez. Depois disto, carregar um ebook novo é só entrar no `admin.html` e enviar.

## 1. Criar o projeto Supabase

1. Vai a https://supabase.com e cria uma conta gratuita
2. Cria um novo projeto (escolhe um nome, ex. `lampmind`, e uma password para a base de dados — guarda-a)
3. Espera 1-2 minutos até o projeto ficar pronto

## 2. Criar a tabela de materiais

No painel do Supabase, vai a **SQL Editor** → **New query**, cola isto e clica em **Run**:

```sql
create table materiais (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  descricao text,
  categoria text,
  tipo text default 'Gratuito',
  preco text,
  link_pagamento text,
  url text not null,
  criado_em timestamp with time zone default now()
);

alter table materiais enable row level security;

create policy "Leitura publica" on materiais
  for select using (true);

create policy "Insercao autenticada" on materiais
  for insert with check (auth.role() = 'authenticated');

create policy "Delete autenticada" on materiais
  for delete using (auth.role() = 'authenticated');

create table site_config (
  id int primary key default 1,
  cor_electric text,
  cor_energy text,
  cor_neon text,
  hero_eyebrow text,
  hero_slogan text,
  hero_texto text,
  hero_bg_url text
);

alter table site_config enable row level security;

create policy "Leitura publica config" on site_config
  for select using (true);

create policy "Escrita autenticada config" on site_config
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

## 3. Criar o "bucket" de armazenamento dos ficheiros

1. Vai a **Storage** → **New bucket**
2. Nome do bucket: `materiais`
3. Marca como **Public bucket** (para os links de download funcionarem)
4. Depois de criado, vai a **Storage → materiais → Policies** e adiciona:
   - Uma policy de **SELECT** pública (`true`)
   - Uma policy de **INSERT** só para utilizadores autenticados (`auth.role() = 'authenticated'`)

## 4. Criar o teu utilizador de admin

1. Vai a **Authentication → Users → Add user**
2. Cria o teu email e uma password forte
3. Esse é o login que vais usar no `admin.html`

## 5. Ligar o site ao Supabase

1. Vai a **Settings → API**
2. Copia o **Project URL** e a **anon public key**
3. Abre o ficheiro `supabase-config.js` e substitui:

```js
export const SUPABASE_URL = "COLA_AQUI_A_TUA_SUPABASE_URL";
export const SUPABASE_ANON_KEY = "COLA_AQUI_A_TUA_SUPABASE_ANON_KEY";
```

pelos valores reais.

4. Sobe (`git add`, `git commit`, `git push`) os ficheiros novos/alterados para o GitHub:
   - `admin.html`
   - `supabase-config.js`
   - `index.html` (atualizado com a secção "Biblioteca")

## 6. Usar

- Para carregar um ebook ou vídeo novo: abre `https://teudominio.com/admin.html`, faz login, na aba **Materiais** preenche título/descrição/categoria, escolhe **Gratuito** ou **Pago**, escolhe o ficheiro, clica **Publicar no site**
- Se marcares **Pago**, preenche o preço e um link de pagamento (podes usar um Stripe Payment Link, PayPal.me, ou um link para uma conversa de WhatsApp/M-Pesa) — o site mostra o preço e um botão "Comprar" que leva a esse link
- Vídeos (.mp4, .webm) aparecem com pré-visualização direta no site
- Na aba **Personalização do Site** podes mudar as 3 cores da marca, os textos do topo (Hero) e a imagem de fundo do Hero — depois clica em **Guardar alterações no site**
- Para remover um material, usa o botão **Remover** na lista dentro do `admin.html`

**Nota sobre pagamentos:** o site ainda não desbloqueia ficheiros automaticamente após o pagamento — isso exigiria um servidor a verificar o pagamento (ex. webhook do Stripe), que é um projeto à parte. Por agora, o fluxo é: a pessoa vê o preço, paga através do link que colaste, e tu confirmas manualmente (por exemplo, enviando o ficheiro depois de confirmares o pagamento, ou libertando o link de download).

## Notas de segurança

- A chave `anon key` é segura para expor publicamente (é assim que o Supabase funciona) — o que protege os dados são as *policies* (regras) que definimos: qualquer pessoa pode ler, só quem tem login pode publicar ou remover
- Não partilhes a tua password de admin nem a `service_role key` (essa nunca deve aparecer no site)
- O ficheiro `admin.html` não aparece indexado no Google (tem `noindex`), mas o URL não é secreto — só quem tem login consegue publicar
