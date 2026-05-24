# Como criar um novo site a partir deste template

Siga exatamente essa ordem. Tempo estimado: 15 a 20 minutos.

---

## PASSO 1 — Clonar o template

No terminal:

```bash
git clone https://github.com/omateuspereira/bolsas-template nome-do-seu-site
cd nome-do-seu-site
npm install
```

> Troque `nome-do-seu-site` pelo nome do projeto (sem espaços, ex: `curso-forex`).

---

## PASSO 2 — Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **New project**
2. Escolha nome, senha do banco e região → **Create project**
3. Aguarde inicializar (1-2 min)
4. Vá em **Settings → API** e copie:
   - **Project URL** → ex: `https://xxxxxxxx.supabase.co`
   - **anon public** → começa com `eyJ...`
   - **service_role secret** → começa com `eyJ...` (nunca compartilhe essa)

---

## PASSO 3 — Preencher o frontend com as chaves do Supabase

Abra o arquivo `js/supabase-client.js` e substitua as duas linhas:

```js
const SUPABASE_URL = 'https://xxxxxxxx.supabase.co'       // ← sua Project URL
const SUPABASE_ANON_KEY = 'eyJ...'                         // ← sua anon public key
```

---

## PASSO 4 — Criar o arquivo .env

Na pasta do projeto, crie um arquivo chamado `.env` com esse conteúdo:

```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PAYT_TOKEN=a548c5a0272f879044a671fe84b5209d
SITE_URL=http://localhost:3000
```

> O `PAYT_TOKEN` é sempre o mesmo (sua Chave Única da Payt).
> O `SITE_URL` você atualiza depois do deploy.

---

## PASSO 5 — Configurar URLs de autenticação no Supabase

No Supabase → **Authentication → URL Configuration**:

| Campo | Valor (por enquanto) |
|---|---|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/definir-senha.html` |

> Você vai atualizar esses dois valores depois do deploy na Vercel.

---

## PASSO 6 — Fazer deploy na Vercel

No terminal:

```bash
npx vercel --prod
```

Na primeira vez vai fazer perguntas — responda assim:
- **Set up and deploy?** → `y`
- **Which scope?** → enter
- **Link to existing project?** → `n`
- **Project name?** → enter (ou coloque o nome que quiser)
- **In which directory?** → `.`
- **Customize settings?** → `n`

Ao final aparece a URL de produção, ex: `https://curso-forex.vercel.app`

**Guarde essa URL.**

---

## PASSO 7 — Configurar variáveis de ambiente na Vercel

1. Acesse [vercel.com](https://vercel.com) → seu projeto → **Settings → Environment Variables**
2. Clique em **Add** → **Import .env** → selecione o arquivo `.env` da pasta do projeto
   - Se não aparecer: pressione **Cmd + Shift + .** no seletor de arquivo para mostrar arquivos ocultos
3. Salve

Depois edite o `SITE_URL` para a URL real do deploy:
- Clique nos três pontinhos ao lado de `SITE_URL` → **Edit** → coloque `https://sua-url.vercel.app` → salva

---

## PASSO 8 — Atualizar URLs no Supabase com a URL de produção

No Supabase → **Authentication → URL Configuration**, atualize:

| Campo | Valor |
|---|---|
| Site URL | `https://sua-url.vercel.app` |
| Redirect URLs | `https://sua-url.vercel.app/definir-senha.html` |

---

## PASSO 9 — Configurar email (Resend)

No Supabase → **Project Settings → Authentication → SMTP Settings**:

- Ative **Enable Custom SMTP**
- Preencha:

| Campo | Valor |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | sua API Key do Resend (começa com `re_`) |
| Sender email | `noreply@rendacombolsas.online` |
| Sender name | Nome do seu produto |

> A API Key do Resend é sempre a mesma. O Sender email usa sempre `rendacombolsas.online`.
> Se quiser um remetente diferente por produto (ex: `noreply@cursoforex.com`), você precisa verificar esse domínio no Resend também.

---

## PASSO 10 — Fazer deploy final (com as variáveis atualizadas)

```bash
npx vercel --prod
```

---

## PASSO 11 — Configurar o postback na Payt

No painel da Payt → **Postbacks → Novo Postback**:

| Campo | Valor |
|---|---|
| Status | Ativo |
| Eventos | Venda |
| Produtos | selecione seu produto |
| URL | `https://sua-url.vercel.app/api/webhook-payt` |
| Eventos (checkboxes) | ✅ Finalizada/Aprovada ✅ Cancelada - Chargeback ✅ Cancelada - Reembolsada |

> A **Chave Única** da Payt (`a548c5a0272f879044a671fe84b5209d`) já está configurada no `.env` como `PAYT_TOKEN`. Se a Payt gerar uma chave diferente por postback, atualize o `PAYT_TOKEN` na Vercel e refaça o deploy.

---

## PASSO 12 — Testar

1. Na tela do postback na Payt, clique em **Testar URL**
2. Deve retornar **200** (não 401, não 500)
3. Crie um usuário de teste no Supabase → **Authentication → Users → Invite user** com seu email
4. Receba o email, clique no link, defina a senha, acesse o treinamento

---

## Checklist final

- [ ] `js/supabase-client.js` preenchido com URL e anon key do novo projeto
- [ ] `.env` criado com as 5 variáveis
- [ ] Supabase Auth URLs atualizadas com a URL de produção
- [ ] Variáveis de ambiente na Vercel configuradas
- [ ] SMTP do Resend configurado no Supabase
- [ ] Postback configurado na Payt com a URL correta
- [ ] Teste do webhook retornando 200

---

## Arquivos que você vai modificar em cada novo projeto

| Arquivo | O que mudar |
|---|---|
| `js/supabase-client.js` | URL e anon key do Supabase |
| `.env` | Todas as chaves do novo projeto |
| `treinamento.html` | Conteúdo do treinamento (módulos, vídeos, etc.) |
| `css/style.css` | Design, cores, fontes |
| `index.html` | Nome/logo do produto |

---

## Credenciais fixas (as mesmas em todos os projetos)

| O que | Onde fica |
|---|---|
| Chave Única Payt | `a548c5a0272f879044a671fe84b5209d` |
| API Key Resend | no seu painel do Resend |
| Domínio remetente | `rendacombolsas.online` (ou verificar novo domínio no Resend) |
