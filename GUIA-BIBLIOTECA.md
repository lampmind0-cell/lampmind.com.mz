# Guia — Configurar o Painel Admin (Supabase)

Segue estes passos uma única vez. Depois disto, o admin fica pronto a usar.

## 1. Criar a tabela de materiais e a tabela de configuração

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

## 2. Criar o "bucket" de armazenamento dos ficheiros

1. Vai a **Storage** → **New bucket**
2. Nome do bucket: `materiais`
3. Marca como **Public bucket**
4. Em **Storage → materiais → Policies**, adiciona:
   - Uma policy de **SELECT** pública (`true`)
   - Uma policy de **INSERT** só para utilizadores autenticados (`auth.role() = 'authenticated'`)

## 3. Criar o teu utilizador de admin

1. Vai a **Authentication → Users → Add user**
2. Cria o teu email e uma password forte
3. Marca **"Auto Confirm User"** se aparecer essa opção
4. Esse é o login que vais usar no `admin.html`

## 4. Ligar o site ao Supabase (o passo que faltava)

1. Na página principal do teu projeto, procura o botão **"Connect"** perto do topo — é o caminho mais rápido para veres a Project URL e as chaves juntas
   - Alternativa: **Settings → Data API** (Project URL) e **Settings → API Keys** (Publishable key)
   - Alternativa rápida: a barra de endereço do browser mostra `supabase.com/dashboard/project/XXXXXXX` — a Project URL é sempre `https://XXXXXXX.supabase.co`
2. Copia a **Project URL** e a **Publishable key** (começa por `sb_publishable_...`)
3. Abre o ficheiro `supabase-config.js` no GitHub e substitui:

```js
export const SUPABASE_URL = "COLA_AQUI_A_TUA_SUPABASE_URL";
export const SUPABASE_ANON_KEY = "COLA_AQUI_A_TUA_SUPABASE_ANON_KEY";
```

pelos valores reais — por exemplo:

```js
export const SUPABASE_URL = "https://xxxxxxx.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_xxxxxxxxxxxxxxxxxxxx";
```

4. Faz commit da alteração no GitHub

## 5. Nova funcionalidade: Modo de Edição ao Vivo

Agora também dá para editar o site diretamente na página pública, sem ires ao `admin.html` — aparece um botão flutuante **"Editar Site"** no canto do ecrã. Ao tocares, pedes login; depois disso, os textos do Hero e da secção Sobre ficam editáveis ali mesmo, com um seletor de tipo de letra e das 3 cores ao lado.

Como a tua tabela `site_config` já existe, falta só adicionar uma coluna nova. Corre isto no SQL Editor:

```sql
alter table site_config add column if not exists font_display text;
```

## 6. Usar

- Para carregar um ebook ou vídeo novo: abre `https://teudominio.com/admin.html`, faz login, na aba **Materiais** preenche título/descrição/categoria, escolhe **Gratuito** ou **Pago**, escolhe o ficheiro, clica **Publicar no site**
- Se marcares **Pago**, preenche o preço e um link de pagamento (Stripe Payment Link, PayPal.me, ou um link de WhatsApp/M-Pesa) — o site mostra o preço e um botão "Comprar"
- Vídeos (.mp4, .webm) aparecem com pré-visualização direta no site
- Na aba **Personalização do Site** podes mudar as 3 cores da marca, os textos do Hero e a imagem de fundo — depois clica em **Guardar alterações no site**
- Para remover um material, usa o botão **Remover** na lista dentro do `admin.html`

## Notas de segurança

- A **Publishable key** é segura para expor publicamente — o que protege os dados são as *policies* que definimos: qualquer pessoa pode ler, só quem tem login pode publicar ou remover
- **Nunca uses a Secret key** (`sb_secret_...`) no site — essa dá acesso total à base de dados sem passar pelas regras de segurança
- Não partilhes a tua password de admin em lado nenhum, incluindo em chats — se alguma vez escreveres uma password ou uma chave secreta num chat, troca-a depois nas definições do Supabase
- O ficheiro `admin.html` tem `noindex` (o Google não o lista), mas o URL não é secreto — a segurança vem do login, não de esconder o link

## Se o login continuar a falhar

- Confirma que o `supabase-config.js` já tem os valores reais (não os textos de exemplo)
- Confirma que o utilizador aparece como "Confirmado" em Authentication → Users
- Vê se aparece alguma mensagem de erro vermelha na página de login e o que diz exatamente
