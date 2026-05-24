const { createClient } = require('@supabase/supabase-js')

// ─── AJUSTE AQUI quando souber o formato exato do payload da Payt ───────────

// Status que indicam pagamento aprovado → criar acesso
const STATUS_APROVADO = ['Finalizada/Aprovada', 'Finalizada', 'Aprovada', 'approved', 'paid']

// Status que indicam cancelamento → revogar acesso
const STATUS_REVOGAR = ['Cancelada - Chargeback', 'Cancelada - Reembolsada', 'Chargeback', 'Reembolsada', 'refunded', 'chargeback']

function getPaytToken(req) {
  return req.body?.integration_key
}

function getEmail(body) {
  return body?.customer?.email
}

function getStatus(body) {
  return body?.status
}

// ─────────────────────────────────────────────────────────────────────────────

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Log completo: inspecione aqui na Vercel quando chegar o primeiro POST de teste
  console.log('=== WEBHOOK-PAYT HEADERS ===', JSON.stringify(req.headers, null, 2))
  console.log('=== WEBHOOK-PAYT BODY ===', JSON.stringify(req.body, null, 2))

  // Valida o token da Payt antes de qualquer processamento
  const receivedToken = getPaytToken(req)
  if (!receivedToken || receivedToken !== process.env.PAYT_TOKEN) {
    console.warn('Token inválido ou ausente:', receivedToken)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const email = getEmail(req.body)
  const status = getStatus(req.body)

  if (!email || !status) {
    console.error('Payload sem email ou status:', req.body)
    return res.status(400).json({ error: 'Missing email or status in payload' })
  }

  // Usa a service_role key — nunca exposta no frontend
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    if (STATUS_APROVADO.includes(status)) {
      return await handleAprovado(supabase, email, res)
    }

    if (STATUS_REVOGAR.includes(status)) {
      return await handleRevogar(supabase, email, res)
    }

    // Qualquer outro status (ex: "Pendente") é ignorado silenciosamente
    console.log('Status ignorado (não mapeado):', status)
    return res.status(200).json({ ok: true, action: 'ignored', status })
  } catch (err) {
    console.error('Erro inesperado no webhook:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleAprovado(supabase, email, res) {
  const siteUrl = process.env.SITE_URL

  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/definir-senha.html`,
  })

  if (error) {
    // Supabase retorna erro se o usuário já existe — trata como sucesso (acesso já ativo)
    if (error.message?.toLowerCase().includes('already')) {
      console.log('Usuário já existe, acesso mantido:', email)
      return res.status(200).json({ ok: true, action: 'already_exists' })
    }
    throw error
  }

  console.log('Convite enviado para:', email)
  return res.status(200).json({ ok: true, action: 'invited' })
}

async function handleRevogar(supabase, email, res) {
  // Busca o usuário pelo e-mail para obter o ID
  // listUsers + filter é a abordagem padrão no Supabase Admin API v2
  // Para bases maiores (>1000 usuários), considere paginar ou usar uma tabela auxiliar
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (listError) throw listError

  const user = users.find((u) => u.email === email)

  if (!user) {
    console.warn('Usuário não encontrado para revogar (pode já ter sido removido):', email)
    return res.status(200).json({ ok: true, action: 'not_found' })
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
  if (deleteError) throw deleteError

  console.log('Acesso revogado (usuário deletado):', email)
  return res.status(200).json({ ok: true, action: 'deleted' })
}
