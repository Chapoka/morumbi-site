import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import { z } from 'zod'
import {
  Shield,
  ShieldCheck,
  CodeXml,
  Workflow,
  Plug,
  Layers,
  Bot,
  Megaphone,
  PanelsTopLeft,
  CircleCheckBig,
  Send,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  ArrowRight,
  LoaderCircle,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input, Textarea } from '../components/ui/input'
import { useToast } from '../components/ui/use-toast'
import { fetchCertProducts, type Product } from '../lib/products'

/* ---------------------------------- Nav ---------------------------------- */

const navLinks = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Certificados', href: '#certificados' },
  { label: 'Soluções', href: '#solucoes' },
  { label: 'Contato', href: '#contato' },
]

function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#" className="font-heading text-xl font-bold tracking-tight">
          <span className="gradient-text">Morumbi</span>
          <span className="text-foreground"> Solutions</span>
        </a>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((r) => (
            <a key={r.label} href={r.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              {r.label}
            </a>
          ))}
          <Link to="/checkout">
            <Button variant="hero" size="sm">
              Comprar Certificado
            </Button>
          </Link>
        </div>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-border/50"
          >
            <div className="flex flex-col p-4 gap-3">
              {navLinks.map((r) => (
                <a
                  key={r.label}
                  href={r.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                >
                  {r.label}
                </a>
              ))}
              <Link to="/checkout" onClick={() => setOpen(false)}>
                <Button variant="hero" size="sm" className="w-full">
                  Comprar Certificado
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

/* --------------------------------- Hero ---------------------------------- */

function Hero() {
  const stats = [
    { value: '500+', label: 'Clientes' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Suporte' },
  ]
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 grid-pattern opacity-40"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-neon-purple/10 blur-[120px]"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Tecnologia que transforma negócios</span>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-heading font-bold leading-tight mb-6"
          >
            Soluções digitais <span className="gradient-text neon-text">inteligentes</span>
            <br />
            para sua empresa
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Certificados digitais, APIs, automações e integrações que impulsionam a transformação digital do seu negócio.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/checkout">
              <Button variant="hero" size="lg" className="text-base px-8">
                Comprar Certificado Digital
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="#contato">
              <Button variant="hero-outline" size="lg" className="text-base px-8">
                Solicitar Serviço
              </Button>
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-3 gap-8 mt-20 max-w-lg mx-auto"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-heading font-bold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------- Serviços -------------------------------- */

const services = [
  { icon: ShieldCheck, title: 'Certificados Digitais', desc: 'e-CNPJ e e-CPF A1/A3 com emissão 100% online e suporte humano.', href: '#certificados' },
  { icon: CodeXml, title: 'APIs', desc: 'APIs RESTful seguras, documentadas e monitoradas em tempo real.', href: '#solucoes' },
  { icon: Workflow, title: 'Automações', desc: 'Fluxos automáticos que eliminam tarefas manuais e reduzem erros.', href: '#solucoes' },
  { icon: Plug, title: 'Integrações', desc: 'ERP, CRM, e-commerce, bancos e pagamentos conversando entre si.', href: '#solucoes' },
  { icon: Layers, title: 'SaaS', desc: 'Plataformas sob assinatura, multi-tenant e escaláveis na nuvem.', href: '#solucoes' },
  { icon: Bot, title: 'Chatbots Inteligentes', desc: 'Atendimento com IA no WhatsApp e site, 24 horas por dia.', href: '#solucoes' },
  { icon: Megaphone, title: 'Divulgação Digital', desc: 'Presença online e tráfego para pequenos negócios venderem mais.', href: '#solucoes' },
  { icon: PanelsTopLeft, title: 'Sites e Landing Pages', desc: 'Páginas rápidas, responsivas e prontas para converter.', href: '#contato' },
]

function Services() {
  return (
    <section id="servicos" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Nossos serviços</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            Tudo o que seu negócio precisa, <span className="gradient-text">em um só lugar</span>
          </h2>
          <p className="text-muted-foreground">
            Da emissão do certificado digital à automação completa dos seus processos e à divulgação do seu negócio: a
            Morumbi Solutions cuida da sua operação digital de ponta a ponta.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, index) => (
            <motion.a
              key={service.title}
              href={service.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="glass rounded-2xl p-6 hover:neon-glow transition-all duration-500 group"
            >
              <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <service.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground">{service.desc}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ Certificados ------------------------------ */

const CAROUSEL_MAX = 6

function Certificados() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true })

  useEffect(() => {
    ;(async () => {
      try {
        const data = await fetchCertProducts()
        const list = [...data].sort((a, b) => Number(b.is_popular) - Number(a.is_popular)).slice(0, CAROUSEL_MAX)
        setProducts(list)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()

  return (
    <section id="certificados" className="py-24 relative">
      <div className="absolute inset-0 dot-pattern opacity-30"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Certificação Digital</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            Certificados <span className="gradient-text">Digitais</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Adquira seu certificado digital com segurança e praticidade. Emissão rápida e suporte especializado.
          </p>
        </motion.div>
        {loading ? (
          <div className="flex justify-center py-12">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-8">
            <div className="relative w-full" role="region" aria-roledescription="carousel" ref={emblaRef}>
              <div className="overflow-hidden">
                <div className="flex -ml-4">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      role="group"
                      aria-roledescription="slide"
                      className="min-w-0 shrink-0 grow-0 basis-full pl-4 md:basis-1/2 lg:basis-1/3"
                    >
                      <div
                        className={`glass rounded-2xl p-6 flex flex-col relative h-full ${
                          p.is_popular ? 'neon-glow border-primary/50' : ''
                        }`}
                      >
                        {p.is_popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                            MAIS POPULAR
                          </div>
                        )}
                        <h3 className="text-xl font-heading font-bold mb-2">{p.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.description}</p>
                        <div className="text-3xl font-heading font-bold text-primary mb-6">
                          R$ {p.price.toFixed(2).replace('.', ',')}
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                          {p.features.slice(0, 3).map((f) => (
                            <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CircleCheckBig className="w-4 h-4 text-primary shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <Link to={`/checkout?product=${p.id}`}>
                          <Button variant={p.is_popular ? 'hero' : 'hero-outline'} className="w-full">
                            Comprar agora
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="absolute -left-12 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border-border/50 bg-secondary/50 hover:bg-secondary"
                onClick={scrollPrev}
              >
                <span className="sr-only">Previous slide</span>
                <ArrowRight className="h-4 w-4 rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute -right-12 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border-border/50 bg-secondary/50 hover:bg-secondary"
                onClick={scrollNext}
              >
                <span className="sr-only">Next slide</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center mt-8">
              <Link to="/checkout">
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-primary">
                  Ver todos os certificados no checkout
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* -------------------------------- Soluções -------------------------------- */

const solutions = [
  {
    id: 'apis',
    icon: CodeXml,
    title: 'APIs',
    headline: 'APIs prontas para escalar',
    desc: 'Construímos e publicamos APIs REST seguras, documentadas e monitoradas.',
    bullets: ['Autenticação e rate limit', 'Documentação OpenAPI', 'Monitoramento e alertas'],
  },
  {
    id: 'automacoes',
    icon: Workflow,
    title: 'Automações',
    headline: 'Menos tarefa manual, mais resultado',
    desc: 'Fluxos que executam sozinhos as rotinas que hoje consomem seu time.',
    bullets: ['Rotinas financeiras e fiscais', 'Disparos por e-mail e WhatsApp', 'Regras e aprovações'],
  },
  {
    id: 'integracoes',
    icon: Plug,
    title: 'Integrações',
    headline: 'Seus sistemas conversando',
    desc: 'ERP, CRM, e-commerce, bancos e meios de pagamento em um só fluxo de dados.',
    bullets: ['ERP e CRM', 'Marketplaces e e-commerce', 'Bancos e pagamentos'],
  },
  {
    id: 'saas',
    icon: Layers,
    title: 'SaaS',
    headline: 'Plataformas sob assinatura',
    desc: 'Produtos multi-tenant na nuvem, do MVP à operação com milhares de usuários.',
    bullets: ['Multi-tenant e planos', 'Painel e métricas', 'Infra escalável'],
  },
  {
    id: 'chatbots',
    icon: Bot,
    title: 'Chatbots',
    headline: 'Atendimento com IA 24/7',
    desc: 'Bots no WhatsApp e no site que respondem, qualificam e encaminham.',
    bullets: ['WhatsApp e site', 'Respostas com IA', 'Handoff para humano'],
  },
  {
    id: 'divulgacao',
    icon: Megaphone,
    title: 'Divulgação',
    headline: 'Presença digital que vende',
    desc: 'Sites, landing pages e tráfego para pequenos negócios aparecerem e converterem.',
    bullets: ['Site ou landing page', 'Google e redes sociais', 'Relatórios simples'],
  },
]

function Solucoes() {
  const [active, setActive] = useState(solutions[0].id)
  const current = solutions.find((s) => s.id === active)!
  return (
    <section id="solucoes" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">
            Como <span className="gradient-text">trabalhamos</span>
          </h2>
          <p className="text-muted-foreground">Escolha o serviço e veja o essencial — sem enrolação.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {solutions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${
                active === s.id
                  ? 'border-primary bg-primary/10 text-foreground neon-glow'
                  : 'border-border/50 bg-secondary/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              <s.icon className="w-4 h-4" />
              {s.title}
            </button>
          ))}
        </div>
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 md:p-8 max-w-3xl mx-auto"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <current.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-xl font-bold mb-1">{current.headline}</h3>
              <p className="text-sm text-muted-foreground mb-5">{current.desc}</p>
              <ul className="grid sm:grid-cols-3 gap-3">
                {current.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CircleCheckBig className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
              <Button variant="hero" size="sm" className="mt-6" asChild>
                <a href="#contato">Solicitar {current.title}</a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* -------------------------------- Contato --------------------------------- */

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100),
  email: z.string().trim().email('Email inválido').max(255),
  phone: z.string().trim().min(1, 'Telefone é obrigatório').max(20),
  service: z.string().trim().min(1, 'Selecione um serviço').max(100),
  message: z.string().trim().min(1, 'Mensagem é obrigatória').max(2000),
})

const serviceOptions = ['Certificado Digital', 'Desenvolvimento de API', 'Automação de Processos', 'Integração de Sistemas', 'Outro']

function Contato() {
  const { toast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = contactSchema.safeParse(form)
    if (!parsed.success) {
      toast({ title: 'Erro', description: parsed.error.errors[0].message, variant: 'destructive' })
      return
    }
    toast({ title: 'Enviado!', description: 'Entraremos em contato em breve.' })
    setForm({ name: '', email: '', phone: '', service: '', message: '' })
  }

  const contactCards = [
    { icon: Mail, label: 'Email', value: 'contato@morumbisolutions.com.br' },
    { icon: Phone, label: 'Telefone', value: '(11) 99999-9999' },
    { icon: MapPin, label: 'Endereço', value: 'São Paulo, SP - Brasil' },
  ]

  return (
    <section id="contato" className="py-24 relative">
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            Vamos <span className="gradient-text">conversar</span>?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Solicite um orçamento ou tire suas dúvidas. Nossa equipe está pronta para ajudar.
          </p>
        </motion.div>
        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={onSubmit}
            className="lg:col-span-3 glass rounded-2xl p-6 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                placeholder="Seu nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-secondary/50 border-border/50"
              />
              <Input
                placeholder="Seu email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                placeholder="Telefone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="bg-secondary/50 border-border/50"
              />
              <select
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                className="flex h-10 w-full rounded-md border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="" className="bg-card">
                  Selecione o serviço
                </option>
                {serviceOptions.map((s) => (
                  <option key={s} value={s} className="bg-card">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <Textarea
              placeholder="Descreva sua necessidade..."
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-secondary/50 border-border/50"
            />
            <Button variant="hero" size="lg" className="w-full" type="submit">
              Enviar Solicitação
              <Send className="ml-2 w-4 h-4" />
            </Button>
          </motion.form>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            {contactCards.map((c) => (
              <div key={c.label} className="glass rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <c.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-heading font-semibold text-sm mb-1">{c.label}</div>
                  <div className="text-sm text-muted-foreground">{c.value}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------- Footer -------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-border/50 py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-heading font-bold">
          <span className="gradient-text">Morumbi</span> Solutions
        </div>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Morumbi Solutions. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}

/* ---------------------------------- Page --------------------------------- */

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <Services />
      <Certificados />
      <Solucoes />
      <Contato />
      <Footer />
    </div>
  )
}
