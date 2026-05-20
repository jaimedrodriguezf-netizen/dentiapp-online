'use client'

import {
  motion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import BookingForm from './BookingForm'
import { Tooth as ToothIcon } from '@/components/ui/ToothIcon'
import {
  Users,
  HeartPulse,
  ArrowRight,
  CalendarDays,
  QrCode,
  Star,
  Shield,
  Clock,
  Phone,
  ChevronDown,
  MessageCircle,
} from 'lucide-react'

interface Tenant {
  id: string
  name: string
  slug: string
  logo_url: string | null
  phone: string | null
  address: string | null
}

interface OperatingHour {
  id?: string
  day_of_week: number
  is_open: boolean
  open_time: string | null
  close_time: string | null
}

interface Props {
  tenant: Tenant
  clinicUrl: string
  qrSvg: string
  whatsappLink: string | null
  operatingHours: OperatingHour[]
}

const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
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
        className="bg-white border border-gray-200 rounded-[32px] p-8 text-center shadow-sm h-full"
        whileHover={{
          y: -10,
          scale: 1.02,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.div
          className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6"
          whileHover={{ rotate: 5, scale: 1.1 }}
        >
          <Icon className="w-8 h-8 text-blue-600" />
        </motion.div>
        <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </motion.div>
    </ScrollReveal>
  )
}

export default function TenantLandingClient({ tenant, qrSvg, whatsappLink, operatingHours }: Props) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.05])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <motion.section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"
      >
        {/* Animated blobs - Simplified for mobile performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-60 -right-60 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute -bottom-60 -left-60 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Floating icons - Hidden on very small screens to avoid clutter */}
        <div className="hidden sm:block">
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
        </div>

        {/* Content */}
        <motion.div
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-6 sm:px-6 lg:px-8 text-center"
        >
          <div>
            {tenant.logo_url && (
              <motion.img
                src={tenant.logo_url}
                alt={tenant.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-[28px] mx-auto mb-8 object-cover shadow-2xl border-4 border-white/20"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            )}
            {!tenant.logo_url && (
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur-md rounded-[28px] mb-8"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <ToothIcon className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </motion.div>
            )}

            <motion.h1
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            >
              {tenant.name}
            </motion.h1>

            <motion.p
              className="text-lg sm:text-2xl text-blue-100 max-w-2xl mx-auto mb-8 font-medium leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            >
              Tu clínica dental de confianza. Atención profesional con tecnología de vanguardia.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            >
              <motion.a
                href="#book-appointment"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-[24px] font-black text-lg shadow-2xl shadow-blue-900/30 transition-all"
                whileHover={{ scale: 1.05, backgroundColor: '#f8faff' }}
                whileTap={{ scale: 0.95 }}
              >
                <CalendarDays className="w-6 h-6" />
                TOMAR TURNO
              </motion.a>
              {tenant.phone && (
                <motion.a
                  href={`tel:${tenant.phone}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/10 text-white border-2 border-white/30 px-10 py-5 rounded-[24px] font-black text-lg backdrop-blur-md transition-all"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone className="w-6 h-6" />
                  LLAMAR AHORA
                </motion.a>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
          <div className="w-7 h-12 border-2 border-white/30 rounded-full flex justify-center p-1">
            <motion.div
              className="w-1 h-3 bg-white/50 rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </motion.section>

      {/* Stats bar */}
      <section className="relative -mt-10 md:-mt-14 z-20 px-4 md:px-0">
        <ScrollReveal>
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 p-6 md:p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                <StatItem icon={Users} label="Pacientes" value="+1000" />
                <StatItem icon={CalendarDays} label="Turnos" value="24/7" />
                <StatItem icon={Clock} label="Experiencia" value="+15 años" />
                <StatItem icon={Shield} label="Atención" value="Premium" />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* About */}
      <section className="pt-24 pb-16 px-6">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-2 rounded-xl bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-6">
              ✨ Cuidamos tu sonrisa
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight uppercase tracking-tight">
              Tecnología dental de vanguardia
            </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium">
              Combinamos experiencia profesional con herramientas digitales para brindarte la mejor atención odontológica, con historias clínicas completas y un seguimiento profesional de tu salud dental.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Operating Hours */}
      {operatingHours.length > 0 && (
        <section className="py-20 bg-white px-6">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block px-4 py-2 rounded-xl bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest mb-6">
                🕐 Horarios de Atención
              </span>
              <div className="bg-gray-50 border border-gray-100 rounded-[32px] p-6 md:p-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {operatingHours.map((hour) => {
                    const dayName = DAY_NAMES_FULL[hour.day_of_week]
                    return (
                      <div
                        key={hour.day_of_week}
                        className={`flex items-center justify-between p-3 rounded-2xl ${
                          hour.is_open ? 'bg-white border border-gray-100 shadow-sm' : 'opacity-50'
                        }`}
                      >
                        <span className="text-sm font-bold text-gray-900">{dayName}</span>
                        <span className={`text-xs font-black uppercase tracking-widest ${
                          hour.is_open ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {hour.is_open && hour.open_time
                            ? `${hour.open_time.slice(0, 5)} — ${hour.close_time?.slice(0, 5)} hs`
                            : 'Cerrado'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Services */}
      <section className="py-24 bg-gray-50/50 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-xl bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-4">
                Nuestros servicios
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">
                Salud dental integral
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <ServiceCard
              icon={Users}
              title="Admisión Digital"
              description="Registro rápido, turnos online y gestión completa de pacientes sin esperas ni papeles."
              delay={0.1}
            />
            <ServiceCard
              icon={ToothIcon}
              title="Odontología Pro"
              description="Historias clínicas digitales, seguimiento profesional y diagnósticos precisos."
              delay={0.2}
            />
            <ServiceCard
              icon={HeartPulse}
              title="Seguimiento"
              description="Control continuo de tu salud dental con herramientas de última generación."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* QR + CTA */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <motion.div
              className="card bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-2xl rounded-[40px] overflow-hidden"
              whileHover={{ scale: 1.01 }}
            >
              <div className="card-body p-8 md:p-16">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                  <div className="flex-1 text-center lg:text-left">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 mx-auto lg:mx-0">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight leading-tight">
                      Escaneá y tomá tu turno
                    </h2>
                    <p className="text-blue-100 text-lg font-medium opacity-90">
                      Usá tu cámara para acceder al formulario de turnos online de forma instantánea.
                    </p>
                    <div className="mt-8 flex items-center justify-center lg:justify-start gap-3 text-blue-200 text-xs font-black uppercase tracking-widest">
                      <ChevronDown className="w-4 h-4 animate-bounce lg:hidden" />
                      <span className="hidden lg:inline">→</span>
                      Apuntá tu cámara al código
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <motion.div
                      animate={{ rotate: [0, 1, -1, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                      className="bg-white p-6 rounded-[32px] shadow-2xl border-4 border-white/20"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* Booking form */}
      <section id="book-appointment" className="py-24 bg-gray-50/50 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-xl bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest mb-4">
                Online 24/7
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 uppercase tracking-tight">
                Tomá tu turno ahora
              </h2>
              <p className="text-lg text-gray-600 font-medium">
                Completá tus datos y te confirmamos al instante
              </p>
            </div>
          </ScrollReveal>
          <div className="max-w-lg mx-auto">
            <BookingForm slug={tenant.slug} />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <motion.div
              className="bg-white rounded-[40px] shadow-2xl border-2 border-gray-50 p-10 md:p-20 text-center"
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 rounded-3xl bg-blue-100 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <ToothIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">
                ¿Sos profesional?
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-10 font-medium leading-relaxed">
                Digitalizá tu clínica hoy mismo con **DentiApp Online**.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-3 rounded-[24px] bg-blue-600 px-12 py-5 text-xl font-black text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-95"
              >
                CREAR MI CLÍNICA
                <ArrowRight className="w-6 h-6" />
              </Link>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-500 py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            DentiApp Online
          </p>
          <p className="text-sm font-medium mb-3">
            © {new Date().getFullYear()} {tenant.name} — Profesionalismo Digital
          </p>
          <a
            href={`/${tenant.slug}/privacy`}
            className="text-xs font-bold text-gray-400 hover:text-gray-300 underline underline-offset-2 transition-colors"
          >
            Política de Privacidad
          </a>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-500 text-white px-5 py-4 rounded-[24px] shadow-2xl shadow-green-500/30 hover:bg-green-600 hover:scale-105 active:scale-95 transition-all group"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle className="w-6 h-6 group-hover:animate-bounce" />
          <span className="hidden sm:inline font-black text-sm uppercase tracking-widest">
            WhatsApp
          </span>
        </a>
      )}
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
      className="text-center group"
      whileHover={{ scale: 1.05 }}
    >
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</p>
    </motion.div>
  )
}
