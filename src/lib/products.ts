export const SUPABASE_URL = 'https://fjnzwywxjeffsojbtusc.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbnp3eXd4amVmZnNvamJ0dXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTU5MDcsImV4cCI6MjA4NzkzMTkwN30.8LZ5Et38jVhwXUQZpRWvG7cLhvvOd-PiFzzEc-JrUyw'

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  cert_type: string | null
  validity: string | null
  features: string[]
  has_token: boolean
  has_card: boolean
  has_reader: boolean
  is_popular: boolean
  is_active: boolean
  sort_order: number
}

export async function fetchCertProducts(): Promise<Product[]> {
  const url =
    SUPABASE_URL +
    '/rest/v1/products?select=*&is_active=eq.true&category=eq.certificado&order=sort_order'
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
    },
  })
  if (!res.ok) throw new Error('Erro ao buscar produtos')
  const data = await res.json()
  return (data || []).map((p: Record<string, unknown>) => ({
    ...p,
    price: Number(p.price),
    features: Array.isArray(p.features) ? p.features : [],
  })) as Product[]
}
