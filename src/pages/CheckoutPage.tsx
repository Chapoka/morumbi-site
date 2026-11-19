import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { z } from 'zod'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Sparkles,
  Video,
  Shield,
  FilePenLine,
  CreditCard,
  Package,
  User,
  Check,
  LoaderCircle,
  ShoppingCart,
  CircleCheckBig,
  Star,
  MapPin,
  Lock,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input, Label, Badge } from '../components/ui/input'
import { useToast } from '../components/ui/use-toast'
import { fetchCertProducts, type Product, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/products'

/* -------------------------------- Helpers -------------------------------- */

const unique = (arr: string[]) => Array.from(new Set(arr))

const validityOf = (name: string, validity?: string | null) =>
  validity || (/A1/i.test(name) ? '12 meses' : /A3/i.test(name) ? '36 meses' : 'Validade ICP-Brasil')

const mediaOf = (p: Product) =>
  p.has_token
    ? 'Token'
    : p.has_card
      ? 'Cartão'
      : p.has_reader
        ? 'Kit Leitora'
        : /A1/i.test(p.cert_type || p.name)
          ? 'Arquivo (A1)'
          : 'Sem mídia'

const money = (v: number) => 'R$ ' + v.toFixed(2).replace('.', ',')

const checkoutSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(200),
  email: z.string().trim().email('Email inválido').max(255),
  cpfCnpj: z.string().trim().min(11, 'CPF/CNPJ inválido').max(18),
  phone: z.string().trim().min(10, 'Celular inválido').max(20),
  postalCode: z.string().trim().min(8, 'CEP inválido').max(10),
  address: z.string().trim().min(1, 'Endereço é obrigatório'),
  addressNumber: z.string().trim().min(1, 'Número é obrigatório'),
  complement: z.string().trim().max(100).optional(),
  province: z.string().trim().min(1, 'Bairro é obrigatório'),
  city: z.string().trim().min(1, 'Cidade é obrigatória'),
  state: z.string().trim().length(2, 'Estado deve ter 2 letras'),
})

type FormValues = z.infer<typeof checkoutSchema>

const emptyForm: FormValues = {
  name: '',
  email: '',
  cpfCnpj: '',
  phone: '',
  postalCode: '',
  address: '',
  addressNumber: '',
  complement: '',
  province: '',
  city: '',
  state: '',
}

const paymentOptions = [
  { id: 'PIX', name: 'PIX', desc: 'Pagamento instantâneo' },
  { id: 'CREDIT_CARD', name: 'Cartão de Crédito', desc: 'Visa, Mastercard, Elo e mais' },
  { id: 'BOLETO', name: 'Boleto Bancário', desc: 'Vencimento em 3 dias úteis' },
]

const defaultFeatures = [
  { icon: Shield, label: 'Formato: Token – Com mídia' },
  { icon: Video, label: 'Emita via videoconferência' },
  { icon: FilePenLine, label: 'Assinatura Digital de Documentos' },
  { icon: CreditCard, label: 'Parcele em até 3x no cartão' },
]

const steps = [
  { id: 1, label: 'Produto', icon: Package },
  { id: 2, label: 'Seus dados', icon: User },
  { id: 3, label: 'Pagamento', icon: CreditCard },
]

async function fetchCep(value: string, setForm: React.Dispatch<React.SetStateAction<FormValues>>) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 8) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          address: data.logradouro || prev.address,
          province: data.bairro || prev.province,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }))
      }
    } catch {
      /* ignore */
    }
  }
}

/* ------------------------------ Step indicator ---------------------------- */

function StepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: number
  onStepClick?: (step: number) => void
}) {
  return (
    <div className="glass rounded-2xl p-4 mb-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((s, i) => {
          const Icon = s.icon
          const done = currentStep > s.id
          const active = currentStep === s.id
          const clickable = !!onStepClick && s.id < currentStep
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(s.id)}
                className={`flex flex-col items-center gap-2 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    done
                      ? 'bg-primary border-primary text-primary-foreground'
                      : active
                        ? 'border-primary text-primary neon-glow'
                        : 'border-border/50 text-muted-foreground'
                  }`}
                >
                  {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${active || done ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {s.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mt-[-20px] transition-colors ${done ? 'bg-primary' : 'bg-border/50'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------- Product image ---------------------------- */

const imageByType: Record<string, string> = {
  token: '/cert-token.png',
  cartao: '/cert-card.png',
  nuvem: '/cert-cloud.png',
}

function ProductImage({ productType, productName }: { productType: string; productName: string }) {
  const src = imageByType[productType] || '/cert-cloud.png'
  return (
    <div className="rounded-2xl border border-border/30 bg-secondary/20 flex items-center justify-center p-8 min-h-[300px]">
      <img
        src={src}
        alt={productName}
        className="max-h-[280px] object-contain drop-shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
        width={300}
        height={300}
      />
    </div>
  )
}

/* --------------------------------- Selector ------------------------------ */

function Selector({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`px-4 py-2 rounded-xl border text-sm transition-all ${
              value === o
                ? 'border-primary bg-primary/10 text-foreground neon-glow'
                : 'border-border/50 bg-secondary/30 text-muted-foreground hover:text-foreground'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ----------------------------- Product selector --------------------------- */

function ProductSelector({
  products,
  selectedId,
  onSelect,
}: {
  products: Product[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const product = products.find((p) => p.id === selectedId)
  if (!product) return null

  const installment = (product.price / 3).toFixed(2).replace('.', ',')
  const typeName = (p: Product) => p.cert_type || p.name
  const type = typeName(product)
  const typeOptions = unique(products.map(typeName))
  const sameType = products.filter((p) => typeName(p) === type)
  const media = mediaOf(product)
  const mediaOptions = unique(sameType.map(mediaOf))
  const validity = product.validity || '-'
  const validityOptions = unique(
    sameType.filter((p) => mediaOf(p) === media).map((p) => p.validity || '-'),
  )

  const pick = (t: string, m: string, v: string) => {
    const list = products.filter((p) => typeName(p) === t)
    const found =
      list.find((p) => mediaOf(p) === m && (p.validity || '-') === v) ||
      list.find((p) => mediaOf(p) === m) ||
      list[0]
    if (found) onSelect(found.id)
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Início <span className="mx-2">/</span>
        <span className="text-foreground">Certificados Digitais</span>
      </div>
      <div className="space-y-3">
        {product.is_popular && (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30 gap-1">
            <Star className="w-3 h-3 fill-primary" /> Mais vendido
          </Badge>
        )}
        <h1 className="text-2xl md:text-3xl font-heading font-bold leading-tight">{product.name}</h1>
        {product.description && <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground">Validade:</span>
          <span className="font-semibold">{validityOf(product.name, product.validity)}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground">Formato:</span>
          <span className="font-semibold">{media}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs">
          <Video className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold">100% online</span>
        </div>
      </div>
      <div className="space-y-4">
        <Selector
          label="1. Tipo de certificado"
          options={typeOptions}
          value={type}
          onChange={(v) => pick(v, media, validity)}
        />
        <Selector
          label="2. Tipo de mídia"
          options={mediaOptions}
          value={media}
          onChange={(v) => pick(type, v, validity)}
        />
        <Selector label="3. Validade" options={validityOptions} value={validity} onChange={(v) => pick(type, media, v)} />
      </div>
      <div className="rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor à vista</span>
        <div className="flex items-baseline gap-3 mt-1">
          <span className="text-3xl md:text-4xl font-heading font-bold text-primary">{money(product.price)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          ou <span className="text-foreground font-semibold">3x de R$ {installment}</span> sem juros no cartão
        </p>
      </div>
      <div className="space-y-3 pt-2">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">O que está incluso</span>
        {product.features.length > 0 ? (
          product.features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <CircleCheckBig className="w-5 h-5 text-primary shrink-0" />
              <span className="text-muted-foreground">{String(f)}</span>
            </div>
          ))
        ) : (
          defaultFeatures.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <Icon className="w-5 h-5 text-primary shrink-0" />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* --------------------------------- Form ---------------------------------- */

function CheckoutForm({
  form,
  setForm,
  payment,
  setPayment,
  total,
  loading,
  onSubmit,
  section,
}: {
  form: FormValues
  setForm: React.Dispatch<React.SetStateAction<FormValues>>
  payment: string
  setPayment: (p: string) => void
  total: number
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  section?: 'data' | 'payment'
}) {
  const set = (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value })

  const showData = !section || section === 'data'
  const showPayment = !section || section === 'payment'

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {showData && (
        <>
          <div className="glass rounded-2xl p-6">
            <h2 className="font-heading font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Informações Pessoais
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-1">
                <Label className="text-xs mb-1.5 block">CPF/CNPJ *</Label>
                <Input value={form.cpfCnpj} onChange={set('cpfCnpj')} className="bg-secondary/50 border-border/50" required />
              </div>
              <div className="sm:col-span-1">
                <Label className="text-xs mb-1.5 block">Nome / Razão Social *</Label>
                <Input value={form.name} onChange={set('name')} className="bg-secondary/50 border-border/50" required />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Email *</Label>
                <Input type="email" value={form.email} onChange={set('email')} className="bg-secondary/50 border-border/50" required />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Celular *</Label>
                <Input value={form.phone} onChange={set('phone')} className="bg-secondary/50 border-border/50" required />
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="font-heading font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Endereço
            </h2>
            <div className="grid sm:grid-cols-6 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-xs mb-1.5 block">CEP *</Label>
                <Input
                  value={form.postalCode}
                  onChange={set('postalCode')}
                  onBlur={(e) => fetchCep(e.target.value, setForm)}
                  className="bg-secondary/50 border-border/50"
                  required
                />
              </div>
              <div className="sm:col-span-4">
                <Label className="text-xs mb-1.5 block">Endereço *</Label>
                <Input value={form.address} onChange={set('address')} className="bg-secondary/50 border-border/50" required />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs mb-1.5 block">Número *</Label>
                <Input value={form.addressNumber} onChange={set('addressNumber')} className="bg-secondary/50 border-border/50" required />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs mb-1.5 block">Bairro *</Label>
                <Input value={form.province} onChange={set('province')} className="bg-secondary/50 border-border/50" required />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs mb-1.5 block">Complemento</Label>
                <Input value={form.complement} onChange={set('complement')} className="bg-secondary/50 border-border/50" />
              </div>
              <div className="sm:col-span-4">
                <Label className="text-xs mb-1.5 block">Cidade *</Label>
                <Input value={form.city} onChange={set('city')} className="bg-secondary/50 border-border/50" required />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs mb-1.5 block">Estado *</Label>
                <Input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })}
                  maxLength={2}
                  className="bg-secondary/50 border-border/50 uppercase"
                  required
                />
              </div>
            </div>
          </div>
        </>
      )}
      {showPayment && (
        <>
          <div className="glass rounded-2xl p-6">
            <h2 className="font-heading font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Forma de Pagamento
            </h2>
            <div className="grid gap-3">
              {paymentOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPayment(opt.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    payment === opt.id ? 'border-primary/50 bg-primary/5 neon-glow' : 'border-border/50 bg-secondary/30 hover:border-border'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                    {payment === opt.id && <div className="w-2.5 h-2.5 rounded-full gradient-primary" />}
                  </div>
                  <div>
                    <div className="font-heading font-semibold">{opt.name}</div>
                    <div className="text-sm text-muted-foreground">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <Button variant="hero" size="lg" className="w-full text-base gap-2" type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
            {loading ? 'Gerando cobrança...' : `Gerar Cobrança ${total > 0 ? `— R$ ${total.toFixed(2).replace('.', ',')}` : ''}`}
          </Button>
        </>
      )}
    </form>
  )
}

/* --------------------------------- Page ---------------------------------- */

interface ChargeResult {
  paymentId?: string
  invoiceUrl?: string
  bankSlipUrl?: string
  status?: string
  pix?: { payload?: string; encodedImage?: string }
}

export default function CheckoutPage() {
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [payment, setPayment] = useState('PIX')
  const [form, setForm] = useState<FormValues>(emptyForm)
  const [result, setResult] = useState<ChargeResult | null>(null)
  const [step, setStep] = useState(1)

  useEffect(() => {
    ;(async () => {
      let data: Product[] = []
      try {
        data = await fetchCertProducts()
      } catch {
        data = []
      }
      setProducts(data)
      const q = searchParams.get('product')
      if (q && data.some((p) => p.id === q)) setSelectedId(q)
      else if (data.length > 0) setSelectedId(data[0].id)
      setLoading(false)
    })()
  }, [searchParams])

  const selected = products.find((p) => p.id === selectedId)
  const total = selected?.price || 0
  const installment = (total / 3).toFixed(2).replace('.', ',')

  const validate = () => {
    const parsed = checkoutSchema.safeParse(form)
    if (!parsed.success) {
      toast({ title: 'Preencha os dados', description: parsed.error.errors[0].message, variant: 'destructive' })
      return false
    }
    return true
  }

  const handleContinue = () => {
    if (step === 1 && !selectedId) {
      toast({ title: 'Escolha um certificado', variant: 'destructive' })
      return
    }
    if (step === 2 && !validate()) return
    setStep((s) => Math.min(3, s + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCharge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    const parsed = checkoutSchema.safeParse(form)
    if (!parsed.success) {
      toast({ title: 'Erro', description: parsed.error.errors[0].message, variant: 'destructive' })
      return
    }
    setSubmitting(true)
    setResult(null)
    let res: Response
    try {
      res = await fetch(SUPABASE_URL + '/functions/v1/create-asaas-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          customer: {
            name: form.name,
            email: form.email,
            cpfCnpj: form.cpfCnpj,
            phone: form.phone,
            postalCode: form.postalCode,
            address: form.address,
            addressNumber: form.addressNumber,
            complement: form.complement || null,
            province: form.province,
            city: form.city,
            state: form.state,
          },
          billingType: payment,
          value: total,
          description: selected.name,
          externalReference: `cert-${selected.id}-${Date.now()}`,
        }),
      })
    } catch {
      toast({ title: 'Erro', description: 'Failed to send a request to the Edge Function', variant: 'destructive' })
      setSubmitting(false)
      return
    }
    try {
      if (!res.ok) {
        toast({ title: 'Erro', description: 'Edge Function returned a non-2xx status code', variant: 'destructive' })
        return
      }
      let data: Record<string, unknown> | null = null
      try {
        data = await res.json()
      } catch {
        data = null
      }
      if (!data?.success) {
        const message = (data?.error as string) || (data?.message as string) || 'Erro ao gerar cobrança'
        toast({ title: 'Erro', description: message, variant: 'destructive' })
        return
      }
      setResult({
        paymentId: data.paymentId as string,
        invoiceUrl: data.invoiceUrl as string,
        bankSlipUrl: data.bankSlipUrl as string,
        status: data.status as string,
        pix: data.pix as ChargeResult['pix'],
      })
      toast({ title: 'Cobrança gerada!', description: 'Enviamos os detalhes por e-mail e WhatsApp.' })
    } catch (err) {
      toast({ title: 'Erro', description: (err as Error).message || 'Falha ao processar', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const copyPix = () => {
    if (result?.pix?.payload) {
      navigator.clipboard.writeText(result.pix.payload)
      toast({ title: 'Copiado!', description: 'Código PIX copiado para a área de transferência.' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const productType = selected?.name.toLowerCase().includes('token')
    ? 'token'
    : selected?.name.toLowerCase().includes('cartão')
      ? 'cartao'
      : 'nuvem'

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]"></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <StepIndicator currentStep={result ? 3 : step} onStepClick={result ? undefined : setStep} />
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              {!result && step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <ProductImage
                      productType={productType}
                      productName={selected?.name || 'Certificado Digital'}
                    />
                    <ProductSelector products={products} selectedId={selectedId} onSelect={setSelectedId} />
                  </div>
                </motion.div>
              )}
              {!result && step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <CheckoutForm
                    section="data"
                    form={form}
                    setForm={setForm}
                    payment={payment}
                    setPayment={setPayment}
                    total={total}
                    loading={submitting}
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleContinue()
                    }}
                  />
                </motion.div>
              )}
              {!result && step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <CheckoutForm
                    section="payment"
                    form={form}
                    setForm={setForm}
                    payment={payment}
                    setPayment={setPayment}
                    total={total}
                    loading={submitting}
                    onSubmit={handleCharge}
                  />
                </motion.div>
              )}
              {result && (
                <div className="glass rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <CircleCheckBig className="w-8 h-8 text-primary" />
                    <div>
                      <h2 className="font-heading font-bold text-lg">Cobrança gerada com sucesso!</h2>
                      <p className="text-sm text-muted-foreground">
                        Enviamos para {form.email} e {form.phone}
                      </p>
                    </div>
                  </div>
                  {result.pix?.encodedImage && (
                    <div className="bg-white rounded-xl p-4 flex flex-col items-center gap-3">
                      <img
                        src={`data:image/png;base64,${result.pix.encodedImage}`}
                        alt="QR Code PIX"
                        className="w-56 h-56"
                      />
                      <Button variant="outline" size="sm" onClick={copyPix} className="gap-2">
                        <Copy className="w-4 h-4" /> Copiar código PIX
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild variant="hero" className="flex-1 gap-2">
                      <a href={result.invoiceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" /> Abrir fatura
                      </a>
                    </Button>
                    {result.bankSlipUrl && (
                      <Button asChild variant="outline" className="flex-1 gap-2">
                        <a href={result.bankSlipUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" /> Boleto PDF
                        </a>
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setResult(null)
                      setStep(1)
                    }}
                    className="w-full"
                  >
                    Gerar nova cobrança
                  </Button>
                </div>
              )}
              {!result && step < 3 && (
                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button variant="outline" onClick={goBack} disabled={step === 1} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </Button>
                  <Button variant="hero" onClick={handleContinue} className="gap-2">
                    Continuar <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {!result && step === 3 && (
                <div className="flex items-center justify-start pt-2">
                  <Button variant="outline" onClick={goBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </Button>
                </div>
              )}
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-2xl p-6 sticky top-8 space-y-4">
                <h2 className="font-heading font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Resumo do Pedido
                </h2>
                {selected ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Certificado</span>
                      <span className="font-semibold text-right">{selected.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor</span>
                      <span>{money(selected.price)}</span>
                    </div>
                    <div className="border-t border-border/50 pt-3 mt-3">
                      <div className="flex justify-between text-lg">
                        <span className="font-heading font-bold">Total</span>
                        <span className="font-heading font-bold text-primary">{money(total)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-right">ou 3x de R$ {installment} sem juros</p>
                    </div>
                    <div className="rounded-xl bg-secondary/40 border border-border/50 p-3 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="w-3.5 h-3.5 text-primary" />{'Pagamento: '}
                        <span className="text-foreground font-semibold">
                          {payment === 'PIX' ? 'PIX' : payment === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'Boleto'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="w-3.5 h-3.5 text-primary" />{'Compra 100% segura — dados criptografados'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Selecione um certificado para continuar.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
