# Treinamento App

Área de membros com acesso pago via Payt. Pagamento aprovado → Supabase cria usuário e envia email de convite → usuário define senha → acessa o treinamento.

## Stack

- **Frontend:** HTML + CSS + JS puro (ES Modules via CDN)
- **Backend:** Vercel Serverless Functions (`/api`)
- **Auth + DB + Email:** Supabase
- **Gateway:** Payt

---

## 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto (plano gratuito)
2. Aguarde o projeto inicializar
3. Vá em **Settings → API** e anote:
   - **Project URL** → vai em `SUPABASE_URL`
   - **anon (public)** → vai em `SUPABASE_ANON_KEY`
   - **service_role (secret)** → vai em `SUPABASE_SERVICE_ROLE_KEY`

### 1.1 Configurar URLs de autenticação

Em **Authentication → URL Configuration**:

| Campo | Valor |
|---|---|
| Site URL | `https://SEU-DOMINIO.vercel.app` |
| Redirect URLs | `https://SEU-DOMINIO.vercel.app/definir-senha.html` |

> Isso garante que o link do email de convite redirecione para a página correta.

---

## 2. Configurar o frontend

Abra `js/supabase-client.js` e preencha:

```js
const SUPABASE_URL = 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJxxx...'
```

Essas chaves são públicas (anon key) — seguro deixar no código.

---

## 3. Variáveis de ambiente

### Desenvolvimento local

```bash
cp .env.example .env
```

Preencha o `.env`:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...           # mesma que você colocou no frontend
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...   # a chave secret do Supabase
PAYT_TOKEN=sua-chave-unica-da-payt
SITE_URL=http://localhost:3000
```

### Produção (Vercel dashboard)

1. Acesse seu projeto na [Vercel](https://vercel.com)
2. Vá em **Settings → Environment Variables**
3. Adicione cada variável do `.env.example` (exceto `SUPABASE_ANON_KEY`, que só vai no código frontend)

> **Nunca suba `.env` para o git.** O `.gitignore` já o ignora.

---

## 4. Instalar dependências e rodar localmente

```bash
npm install
npx vercel dev
```

O `vercel dev` sobe o frontend estático e as Serverless Functions em `http://localhost:3000`.

---

## 5. Deploy na Vercel

```bash
npx vercel --prod
```

Ou conecte o repositório no painel da Vercel para deploy automático a cada push.

---

## 6. Configurar webhook na Payt

1. No painel da Payt, vá em configurações de webhook/postback
2. URL do webhook: `https://SEU-DOMINIO.vercel.app/api/webhook-payt`
3. Cadastre sua **chave única** (token) — coloque o mesmo valor em `PAYT_TOKEN`
4. Ative os eventos: pagamento aprovado, cancelado/reembolsado, chargeback

---

## 7. Inspecionar o payload da Payt (primeiro teste)

Quando chegar o primeiro postback de teste da Payt, abra os logs da Vercel:

**Vercel dashboard → seu projeto → Functions → webhook-payt → Logs**

Você verá:
```
=== WEBHOOK-PAYT HEADERS === { ... }
=== WEBHOOK-PAYT BODY === { ... }
```

Com esses dados, ajuste as funções em `api/webhook-payt.js`:
- `getPaytToken(req)` — onde vem o token (header ou body)
- `getEmail(body)` — caminho do e-mail do cliente
- `getStatus(body)` — caminho do status do pagamento
- `STATUS_APROVADO` / `STATUS_REVOGAR` — valores exatos dos status

---

## Fluxo completo

```
Payt (pagamento aprovado)
  → POST /api/webhook-payt
    → valida PAYT_TOKEN
    → supabase.auth.admin.inviteUserByEmail(email, { redirectTo: /definir-senha.html })
      → Supabase envia email com link
        → usuário clica → definir-senha.html
          → define senha → redireciona para treinamento.html

Payt (cancelamento / chargeback)
  → POST /api/webhook-payt
    → valida PAYT_TOKEN
    → supabase.auth.admin.deleteUser(userId)
      → acesso revogado imediatamente
```
