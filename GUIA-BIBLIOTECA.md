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

- Para carregar um ebook novo: abre `https://teudominio.com/admin.html`, faz login, preenche título/descrição/categoria, escolhe o ficheiro, clica **Publicar no site**
- O ebook aparece automaticamente na secção **Biblioteca** do site principal, sem precisares de tocar em código
- Para remover, usa o botão **Remover** na lista dentro do próprio `admin.html`

## Notas de segurança

- A chave `anon key` é segura para expor publicamente (é assim que o Supabase funciona) — o que protege os dados são as *policies* (regras) que definimos: qualquer pessoa pode ler, só quem tem login pode publicar ou remover
- Não partilhes a tua password de admin nem a `service_role key` (essa nunca deve aparecer no site)
- O ficheiro `admin.html` não aparece indexado no Google (tem `noindex`), mas o URL não é secreto — só quem tem login consegue publicar
