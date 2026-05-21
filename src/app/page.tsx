'use client'

import { motion, useInView } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Users,
  CalendarDays,
  FileText,
  HeartPulse,
  Check,
  ArrowRight,
  Sparkles,
  Shield,
  Stethoscope,
  X,
} from 'lucide-react'
import { Tooth } from '@/components/ui/ToothIcon'

// Floating element component
function FloatingElement({
  children,
  delay = 0,
  duration = 6,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}

// Animated counter component
function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const count = useCount(isInView ? end : 0)

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  )
}

// Custom hook for counting animation
function useCount(target: number) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) return
    let start = 0
    const duration = 2000
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target])

  return count
}

// Scroll reveal wrapper
function ScrollReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// Feature card component
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType
  title: string
  description: string
  delay?: number
}) {
  return (
    <ScrollReveal delay={delay}>
      <motion.div
        className="card bg-white border border-gray-200 shadow-md hover:shadow-xl transition-shadow duration-300"
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="card-body items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="card-title text-xl text-gray-900">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </motion.div>
    </ScrollReveal>
  )
}

// Hero section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300/10 rounded-full blur-2xl"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Floating elements */}
      <FloatingElement delay={0} duration={8} className="top-20 left-10 opacity-20">
        <Tooth className="w-16 h-16 text-white" />
      </FloatingElement>
      <FloatingElement delay={1} duration={6} className="top-32 right-20 opacity-15">
        <CalendarDays className="w-12 h-12 text-white" />
      </FloatingElement>
      <FloatingElement delay={2} duration={7} className="bottom-32 left-20 opacity-20">
        <FileText className="w-14 h-14 text-white" />
      </FloatingElement>
      <FloatingElement delay={0.5} duration={9} className="bottom-20 right-10 opacity-15">
        <HeartPulse className="w-10 h-10 text-white" />
      </FloatingElement>
      <FloatingElement delay={1.5} duration={5} className="top-1/2 left-5 opacity-10">
        <Sparkles className="w-8 h-8 text-white" />
      </FloatingElement>

      {/* Hero content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-8"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Tooth className="w-10 h-10" />
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            DentiApp{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">
              Online
            </span>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          >
            El panel administrativo completo para tu clínica dental.
            Admisión, enfermería, odontología y el Formulario 033 oficial del MSP Ecuador.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          >
            <Link
              href="/register"
              className="btn btn-lg bg-white text-blue-600 border-none hover:bg-blue-50 hover:scale-105 transition-transform"
            >
              Empezar Gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/login"
              className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/20 hover:border-white/50"
            >
              Iniciar Sesión
            </Link>
          </motion.div>

          <motion.p
            className="mt-6 text-sm text-blue-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            30 días gratis • Sin tarjeta de crédito • Hasta 50 pacientes
          </motion.p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  )
}

// Features section
function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: 'Admisión Inteligente',
      description:
        'Gestión completa de pacientes, citas y facturación. Todo el flujo de recepción en un solo lugar.',
    },
    {
      icon: Stethoscope,
      title: 'Enfermería Digital',
      description:
        'Signos vitales, examen estomatognático y notas de enfermería. Historial clínico al instante.',
    },
    {
      icon: Tooth,
      title: 'Odontología Completa',
      description:
        'Odontograma interactivo, Formulario 033 oficial del MSP, planes de tratamiento y más.',
    },
    {
      icon: CalendarDays,
      title: 'Agenda de Turnos',
      description:
        'Calendario inteligente con gestión de citas, confirmaciones y recordatorios automáticos.',
    },
    {
      icon: FileText,
      title: 'Formulario 033 MSP',
      description:
        'Generación automática del formulario oficial del Ministerio de Salud Pública del Ecuador.',
    },
    {
      icon: Shield,
      title: 'Multi-Sucursal',
      description:
        'Gestiona varias clínicas desde un solo lugar. Cada sucursal con sus roles y permisos.',
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.span
              className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              ✨ Todo en un solo lugar
            </motion.span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Diseñado para el flujo real de tu clínica
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tres módulos que trabajan juntos para brindarte la mejor experiencia
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Stats section
function StatsSection() {
  const stats = [
    { value: 500, suffix: '+', label: 'Clínicas activas' },
    { value: 50000, suffix: '+', label: 'Pacientes gestionados' },
    { value: 99, suffix: '%', label: 'Uptime garantizado' },
    { value: 24, suffix: '/7', label: 'Soporte técnico' },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <ScrollReveal key={index} delay={index * 0.15}>
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-600 text-lg">{stat.label}</div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// Pricing section
function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly')

  const plans = [
    {
      id: 'free',
      name: 'Plan Gratis',
      description: 'Ideal para profesionales independientes o consultorios pequeños que recién empiezan.',
      price: { monthly: 0, annually: 0 },
      features: [
        { text: 'Admisión y citas básicas', included: true },
        { text: 'Fichas de pacientes (hasta 50)', included: true },
        { text: 'Odontograma básico', included: true },
        { text: 'Soporte por comunidad', included: true },
        { text: 'Gestión de equipo y roles', included: false },
        { text: 'Enfermería avanzada', included: false },
      ],
      popular: false,
      buttonText: 'Empezar Gratis',
      buttonClass: 'btn-outline border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
    },
    {
      id: 'standard',
      name: 'Plan Standard',
      description: 'Para consultorios en crecimiento que necesitan gestión ilimitada de pacientes.',
      price: { monthly: 29, annually: 23 },
      features: [
        { text: 'Todo lo del Plan Gratis', included: true },
        { text: 'Fichas de pacientes ilimitadas', included: true },
        { text: 'Odontograma completo e interactivo', included: true },
        { text: 'Formulario oficial MSP 033', included: true },
        { text: 'Soporte técnico por email', included: true },
        { text: 'Gestión de equipo y roles', included: false },
        { text: 'Enfermería avanzada', included: false },
      ],
      popular: true,
      buttonText: 'Adquirir Standard',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white border-none',
    },
    {
      id: 'business',
      name: 'Plan Business',
      description: 'Para centros médicos y clínicas completas con personal multidisciplinario.',
      price: { monthly: 79, annually: 63 },
      features: [
        { text: 'Todo lo del Plan Standard', included: true },
        { text: 'Gestión de equipo y roles ilimitados', included: true },
        { text: 'Módulo de enfermería avanzada', included: true },
        { text: 'Clínicas multi-sucursales', included: true },
        { text: 'Soporte prioritario 24/7', included: true },
        { text: 'Capacitación del equipo', included: true },
      ],
      popular: false,
      buttonText: 'Adquirir Business',
      buttonClass: 'btn-outline border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white',
    },
  ]

  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4">
              🏷️ Tarifas Transparentes
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Planes simples a tu medida
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Elegí el plan que mejor se adapte a tus necesidades. Podés cambiar de plan en cualquier momento.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-semibold ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Facturación Mensual
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annually' : 'monthly')}
                className="w-14 h-8 bg-blue-100 hover:bg-blue-200 rounded-full p-1 transition-colors duration-200 focus:outline-none relative"
                aria-label="Alternar período de facturación"
              >
                <motion.div
                  className="w-6 h-6 bg-blue-600 rounded-full"
                  animate={{ x: billingPeriod === 'monthly' ? 0 : 24 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm font-semibold flex items-center gap-1.5 ${billingPeriod === 'annually' ? 'text-gray-900' : 'text-gray-500'}`}>
                Facturación Anual
                <span className="badge badge-success text-white font-bold text-xs py-1 px-2">Ahorrá 20%</span>
              </span>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <ScrollReveal key={plan.id} delay={index * 0.1}>
              <motion.div
                className={`flex flex-col h-full rounded-3xl p-8 bg-white border transition-all duration-300 relative ${
                  plan.popular
                    ? 'border-blue-600 shadow-xl scale-100 lg:scale-105 z-10'
                    : 'border-gray-200 shadow-md hover:shadow-xl'
                }`}
                whileHover={{ y: -8 }}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md">
                    Recomendado
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-500 text-sm min-h-[48px]">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-extrabold text-gray-900">
                    ${billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annually}
                  </span>
                  <span className="text-gray-500 text-sm">/ mes</span>
                  {billingPeriod === 'annually' && plan.price.monthly > 0 && (
                    <span className="text-xs text-green-600 font-semibold ml-2">
                      (Facturado anualmente)
                    </span>
                  )}
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?plan=${plan.id}`}
                  className={`btn btn-block py-3 rounded-xl font-semibold transition-all duration-200 ${plan.buttonClass}`}
                >
                  {plan.buttonText}
                </Link>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA section
function CTASection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <motion.div
            className="card bg-blue-600 text-white shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="card-body py-16">
              <motion.h2
                className="card-title text-4xl sm:text-5xl font-bold justify-center mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                ¿Listo para digitalizar tu clínica?
              </motion.h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                Unite a cientos de clínicas que ya confían en DentiApp Online para gestionar su día a día
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="btn btn-lg bg-white text-blue-600 border-none hover:bg-blue-50 hover:scale-105 transition-transform"
                >
                  Crear cuenta gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/login"
                  className="btn btn-lg btn-outline border-white/50 text-white hover:bg-white/20"
                >
                  Ya tengo cuenta
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-blue-200">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> Sin tarjeta de crédito
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> Plan Gratis disponible
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> Soporte continuo
                </span>
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-600 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Tooth className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-lg text-gray-900">DentiApp Online</span>
            </div>
            <p className="text-sm">
              El panel administrativo completo para tu clínica dental.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Producto</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#features" className="hover:text-blue-600 transition-colors">Funcionalidades</Link></li>
              <li><Link href="#pricing" className="hover:text-blue-600 transition-colors">Precios</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Demo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Documentación</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Contacto</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Privacidad</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Términos</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="divider my-8"></div>
        <div className="text-center text-sm">
          © {new Date().getFullYear()} DentiApp Online. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}

// Main page component
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}
