import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Preencha com suas credenciais — Dashboard Supabase > Settings > API
// Essas chaves são públicas (anon key): é seguro tê-las no código frontend
const SUPABASE_URL = 'https://dbxbnwvcnlxkeimydfdr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieGJud3Zjbmx4a2VpbXlkZmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1ODQyNjUsImV4cCI6MjA5NTE2MDI2NX0.A84a-5pfiPiO8ad1znvzYZAHO64ZXJSwMBR0YQtHykc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
