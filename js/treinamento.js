import { getSession, signOut } from './auth.js'

async function init() {
  const session = await getSession()

  if (!session) {
    window.location.href = '/index.html'
    return
  }

  document.getElementById('user-email').textContent = session.user.email

  document.getElementById('btn-logout').addEventListener('click', async () => {
    await signOut()
    window.location.href = '/index.html'
  })
}

init()
