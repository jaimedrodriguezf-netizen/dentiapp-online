'use client'

import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from 'framer-motion'
import { useRef, useState } from 'react'
import Link from 'next/link'
import BookingForm from './BookingForm'
import { Tooth as ToothIcon } from '@/components/ui/ToothIcon'
import {
  Users,
  HeartPulse,
  ArrowRight,
  CalendarDays,
  QrCode,
  Sparkles,
  Star,
  Shield,
  Clock,
  MapPin,
  Phone,
  ChevronDown,
} from 'lucide-react'

interface Tenant {
  id: string
  name: string
  slug: string
  logo_url: string | null
  phone: string | null
  address: string | null
}

interface Props {
  tenant: Tenant
  clinicUrl: string
  qrSvg: string
}

function FloatingIcon({
  children,
  delay = 0,
  duration = 7,
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
        y: [0, -25, 0],
        rotate: [0, 8, -8, 0],
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
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function ServiceCard({
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
        className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm"
        whileHover={{
          y: -10,
          scale: 1.03,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.div
          className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4"
          whileHover={{ rotate: 5, scale: 1.1 }}
        >
          <Icon className="w-8 h-8 text-blue-600" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </motion.div>
    </ScrollReveal>
  )
}

export default function TenantLandingClient({ tenant, clinicUrl, qrSvg }: Props) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <motion.section
        ref={heroRef}
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"
      >
        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-60 -right-60 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.25, 1],
              rotate: [0, 120, 0],
              x: [0, -50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute -bottom-60 -left-60 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [0, -100, 0],
              x: [0, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-300/10 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.6, 1],
              x: [0, 80, 0],
              y: [0, -40, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Floating icons */}
        <FloatingIcon delay={0} duration={8} className="top-24 left-[5%] opacity-20">
          <ToothIcon className="w-14 h-14 text-white" />
        </FloatingIcon>
        <FloatingIcon delay={1.2} duration={6} className="top-32 right-[8%] opacity-15">
          <CalendarDays className="w-11 h-11 text-white" />
        </FloatingIcon>
        <FloatingIcon delay={0.7} duration={9} className="bottom-28 left-[10%] opacity-20">
          <HeartPulse className="w-12 h-12 text-white" />
        </FloatingIcon>
        <FloatingIcon delay={1.8} duration={7} className="bottom-20 right-[6%] opacity-15">
          <Star className="w-10 h-10 text-white" />
        </FloatingIcon>
        <FloatingIcon delay={0.3} duration={5} className="top-1/2 left-4 opacity-10">
          <Sparkles className="w-7 h-7 text-white" />
        </FloatingIcon>
        <FloatingIcon delay={1.5} duration={11} className="top-[60%] right-4 opacity-10">
          <Shield className="w-8 h-8 text-white" />
        </FloatingIcon>

        {/* Content */}
        <motion.div
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <div>
            {tenant.logo_url && (
              <motion.img
                src={tenant.logo_url}
                alt={tenant.name}
                className="w-24 h-24 rounded-3xl mx-auto mb-8 object-cover shadow-lg border-4 border-white/20"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            )}
            {!tenant.logo_url && (
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-8"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <ToothIcon className="w-12 h-12 text-white" />
              </motion.div>
            )}

            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            >
              {tenant.name}
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            >
              Tu clínica dental de confianza. Atención profesional y personalizada.
            </motion.p>

            {tenant.address && (
              <motion.p
                className="text-lg text-blue-200 flex items-center justify-center gap-2 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              >
                <MapPin className="w-4 h-4" />
                {tenant.address}
              </motion.p>
            )}

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            >
              <motion.a
                href="#book-appointment"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl shadow-blue-900/20 transition-colors"
                whileHover={{ scale: 1.05, backgroundColor: '#eff6ff' }}
                whileTap={{ scale: 0.98 }}
              >
                <CalendarDays className="w-5 h-5" />
                Tomar Turno
              </motion.a>
              {tenant.phone && (
                <motion.a
                  href={`tel:${tenant.phone}`}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border-2 border-white/30 px-8 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm transition-colors"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone className="w-5 h-5" />
                  {tenant.phone}
                </motion.a>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-7 h-12 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              className="w-1.5 h-4 bg-white/50 rounded-full mt-2"
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Stats bar */}
      <section className="relative -mt-14 z-20">
        <ScrollReveal>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <StatItem icon={Users} label="Pacientes Atendidos" value="+1000" />
                <StatItem icon={CalendarDays} label="Turnos Online" value="24/7" />
                <StatItem icon={Clock} label="Experiencia" value="+15 años" />
                <StatItem icon={Shield} label="Atención" value="Garantizada" />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* About */}
      <ScrollReveal>
        <section className="pt-24 pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.span
              className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              ✨ Cuidamos tu sonrisa
            </motion.span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Tecnología dental de vanguardia
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Combinamos experiencia profesional con herramientas digitales para brindarte la mejor atención odontológica, con historias clínicas completas y un odontograma interactivo para el seguimiento de tu salud dental.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <motion.span
                className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                Nuestros servicios
              </motion.span>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Todo para tu salud dental
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Servicios integrales con tecnología de última generación
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <ServiceCard
              icon={Users}
              title="Admisión Digital"
              description="Registro rápido, turnos online y gestión completa de pacientes sin papeles."
              delay={0.1}
            />
            <ServiceCard
              icon={ToothIcon}
              title="Odontología Completa"
              description="Odontograma interactivo, Formulario 033 del MSP y seguimiento profesional."
              delay={0.2}
            />
            <ServiceCard
              icon={HeartPulse}
              title="Enfermería"
              description="Signos vitales, examen estomatognático y notas clínicas integradas."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* QR + CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <motion.div
                className="card bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl rounded-3xl overflow-hidden"
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="card-body p-8 sm:p-12">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex-1 text-center lg:text-left">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 mx-auto lg:mx-0">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                        Escaneá y tomá tu turno
                      </h2>
                      <p className="text-blue-100 text-lg max-w-md">
                        Escaneá el código QR desde tu celular para acceder al formulario de turnos online
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-blue-200 text-sm">
                        <ChevronDown className="w-4 h-4 animate-bounce lg:hidden" />
                        <span className="hidden lg:inline">→</span>
                        Apuntá tu cámara al código
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <motion.div
                        animate={{ rotate: [0, 2, -2, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="bg-white p-4 rounded-2xl shadow-lg"
                        dangerouslySetInnerHTML={{ __html: qrSvg }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Booking form */}
      <section id="book-appointment" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <motion.span
                className="inline-block px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                Online 24/7
              </motion.span>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Tomá tu turno ahora
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Completá tus datos y te confirmamos el turno al instante
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="max-w-lg mx-auto">
              <BookingForm slug={tenant.slug} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <motion.div
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 sm:p-14"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
                <ToothIcon className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                ¿Sos profesional odontológico?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Digitalizá tu clínica con DentiApp y accedé a historias clínicas, odontograma y formulario 033.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
              >
                Crear mi clínica gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} {tenant.name} — Powered by DentiApp Online
          </p>
        </div>
      </footer>
    </main>
  )
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <motion.div
      className="text-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </motion.div>
  )
}
