'use client'

import { useState, useEffect } from 'react'
import { updateSubscriptionPlan } from '../actions'
import { 
  ArrowLeft, 
  Check, 
  Crown, 
  Sparkles, 
  Building, 
  X,
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface SubscriptionClientProps {
  slug: string
  clinicName: string
  currentPlan: 'free' | 'standard' | 'business'
  role: string
}

export default function SubscriptionClient({ slug, clinicName, currentPlan, role }: SubscriptionClientProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [plan, setPlan] = useState<'free' | 'standard' | 'business'>(currentPlan)

  // Precios editables persistidos en localStorage
  const [prices, setPrices] = useState({
    free: 0,
    standard: 29,
    standardAnnual: 23,
    business: 79,
    businessAnnual: 63
  })

  const [editPrices, setEditPrices] = useState({
    free: 0,
    standard: 29,
    standardAnnual: 23,
    business: 79,
    businessAnnual: 63
  })

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly')
  const [activeBillingPeriod, setActiveBillingPeriod] = useState<'monthly' | 'annually'>('monthly')

  // Cargar precios de localStorage en el montaje
  useEffect(() => {
    const fPrice = localStorage.getItem('pricing_free')
    const sPrice = localStorage.getItem('pricing_standard')
    const sPriceAnnual = localStorage.getItem('pricing_standard_annual')
    const bPrice = localStorage.getItem('pricing_business')
    const bPriceAnnual = localStorage.getItem('pricing_business_annual')

    const storedPeriod = localStorage.getItem(`billing_period_${slug}`)

    const loadedPrices = {
      free: fPrice !== null ? Number(fPrice) : 0,
      standard: sPrice !== null ? Number(sPrice) : 29,
      standardAnnual: sPriceAnnual !== null ? Number(sPriceAnnual) : 23,
      business: bPrice !== null ? Number(bPrice) : 79,
      businessAnnual: bPriceAnnual !== null ? Number(bPriceAnnual) : 63
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrices(loadedPrices)
    setEditPrices(loadedPrices)

    if (storedPeriod === 'annually' || storedPeriod === 'monthly') {
      setActiveBillingPeriod(storedPeriod)
      setBillingPeriod(storedPeriod)
    }
  }, [slug])

  const savePricesToLocal = () => {
    localStorage.setItem('pricing_free', String(editPrices.free))
    localStorage.setItem('pricing_standard', String(editPrices.standard))
    localStorage.setItem('pricing_standard_annual', String(editPrices.standardAnnual))
    localStorage.setItem('pricing_business', String(editPrices.business))
    localStorage.setItem('pricing_business_annual', String(editPrices.businessAnnual))
    
    setPrices(editPrices)
    setSuccessMsg('¡Tarifas de suscripción actualizadas exitosamente en el panel!')
    
    // Auto-clean success message
    setTimeout(() => {
      setSuccessMsg(null)
    }, 4000)
  }

  const handlePlanChange = async (targetPlan: 'free' | 'standard' | 'business', period: 'monthly' | 'annually') => {
    const isCurrent = targetPlan === plan && period === activeBillingPeriod
    if (isCurrent) return
    
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await updateSubscriptionPlan(slug, targetPlan)
      if (res && 'error' in res && res.error) {
        setError(res.error)
      } else {
        setPlan(targetPlan)
        localStorage.setItem(`billing_period_${slug}`, period)
        setActiveBillingPeriod(period)
        setBillingPeriod(period)
        setSuccessMsg(`¡Tu suscripción se actualizó con éxito al Plan ${
          targetPlan === 'business' ? 'Business' : targetPlan === 'standard' ? 'Standard' : 'Gratis'
        } (${period === 'annually' ? 'Anual' : 'Mensual'})!`)
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al actualizar el plan.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const freeFeatures = [
    { text: 'Admisión y citas básicas', included: true },
    { text: 'Fichas de pacientes (hasta 50)', included: true },
    { text: 'Odontograma básico', included: true },
    { text: 'Soporte por comunidad', included: true },
    { text: 'Gestión de equipo y roles', included: false },
    { text: 'Enfermería avanzada', included: false }
  ]

  const standardFeatures = [
    { text: 'Todo lo del Plan Gratis', included: true },
    { text: 'Fichas de pacientes ilimitadas', included: true },
    { text: 'Odontograma completo e interactivo', included: true },
    { text: 'Formulario oficial MSP 033', included: true },
    { text: 'Soporte técnico por email', included: true },
    { text: 'Gestión de equipo y roles', included: false },
    { text: 'Enfermería avanzada', included: false }
  ]

  const businessFeatures = [
    { text: 'Todo lo del Plan Standard', included: true },
    { text: 'Gestión de equipo y roles ilimitados', included: true },
    { text: 'Módulo de enfermería avanzada', included: true },
    { text: 'Clínicas multi-sucursales', included: true },
    { text: 'Soporte prioritario 24/7', included: true },
    { text: 'Capacitación del equipo', included: true }
  ]

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 md:px-0">
        <Link href={`/${slug}/settings/profile`} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors border border-gray-100 bg-white shadow-sm flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Suscripción</h2>
          <p className="text-gray-500 font-medium mt-0.5">Administrá el plan y facturación de la clínica <span className="font-extrabold text-blue-600">{clinicName}</span></p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert alert-error shadow-md rounded-2xl max-w-4xl mx-auto flex gap-3 text-sm font-bold">
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success shadow-md rounded-2xl max-w-4xl mx-auto flex gap-3 text-sm font-bold">
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tarifas Editor - Exclusivo para Admin */}
      {role === 'admin' && (
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Panel de Administración de Tarifas</h3>
              <p className="text-xs text-gray-500">Como administrador supremo, podés configurar el valor de cada plan.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Gratis ($/mes)</label>
              <input
                type="number"
                min="0"
                value={editPrices.free}
                onChange={(e) => setEditPrices({ ...editPrices, free: Math.max(0, Number(e.target.value)) })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Standard ($/mes)</label>
              <input
                type="number"
                min="0"
                value={editPrices.standard}
                onChange={(e) => setEditPrices({ ...editPrices, standard: Math.max(0, Number(e.target.value)) })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Standard Anual ($/mes)</label>
              <input
                type="number"
                min="0"
                value={editPrices.standardAnnual}
                onChange={(e) => setEditPrices({ ...editPrices, standardAnnual: Math.max(0, Number(e.target.value)) })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Business ($/mes)</label>
              <input
                type="number"
                min="0"
                value={editPrices.business}
                onChange={(e) => setEditPrices({ ...editPrices, business: Math.max(0, Number(e.target.value)) })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Business Anual ($/mes)</label>
              <input
                type="number"
                min="0"
                value={editPrices.businessAnnual}
                onChange={(e) => setEditPrices({ ...editPrices, businessAnnual: Math.max(0, Number(e.target.value)) })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none font-bold"
              />
            </div>
          </div>
          <button
            onClick={savePricesToLocal}
            className="mt-4 w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors active:scale-95 shadow-md shadow-indigo-500/10"
          >
            Guardar Tarifas
          </button>
        </div>
      )}

      {/* Selector de Período de Facturación */}
      <div className="flex items-center justify-center gap-4 max-w-5xl mx-auto pt-4">
        <span className={`text-sm font-semibold ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
          Facturación Mensual
        </span>
        <button
          onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annually' : 'monthly')}
          className="w-14 h-8 bg-blue-100 hover:bg-blue-200 rounded-full p-1 transition-colors duration-200 focus:outline-none relative"
          aria-label="Alternar período de facturación"
        >
          <div
            className={`w-6 h-6 bg-blue-600 rounded-full transition-transform duration-200 ${
              billingPeriod === 'monthly' ? 'translate-x-0' : 'translate-x-6'
            }`}
          />
        </button>
        <span className={`text-sm font-semibold flex items-center gap-1.5 ${billingPeriod === 'annually' ? 'text-gray-900' : 'text-gray-500'}`}>
          Facturación Anual
          <span className="badge badge-success text-white font-bold text-xs py-1 px-2">Ahorrá 20%</span>
        </span>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto pt-4 items-stretch">
        
        {/* Free Plan Card */}
        <div className={`relative overflow-hidden bg-white border rounded-[36px] p-8 flex flex-col justify-between transition-all duration-300 shadow-md ${
          plan === 'free' 
            ? 'border-green-500 ring-4 ring-green-500/10' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
        }`}>
          {plan === 'free' && (
            <div className="absolute top-0 right-0 bg-green-500 text-white font-black text-[10px] tracking-widest uppercase px-6 py-2 rounded-bl-3xl shadow-sm">
              Plan Activo
            </div>
          )}
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Gratis</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Comienzo Simple</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1 my-6">
              <span className="text-5xl font-black text-gray-900">${prices.free}</span>
              <span className="text-gray-500 font-bold text-lg">/mes</span>
            </div>

            <p className="text-gray-500 text-sm font-medium mb-8 min-h-[60px]">
              Ideal para profesionales independientes o consultorios pequeños que recién empiezan en la digitalización.
            </p>

            <div className="border-t border-gray-100 my-6" />

            <ul className="space-y-4">
              {freeFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  {feat.included ? (
                    <div className="p-0.5 bg-green-50 rounded-full text-green-600 mt-0.5 shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-0.5 bg-gray-50 rounded-full text-gray-300 mt-0.5 shrink-0">
                      <X className="w-4 h-4" />
                    </div>
                  )}
                  <span className={`text-sm font-semibold ${feat.included ? 'text-gray-600' : 'text-gray-400 line-through'}`}>{feat.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            {plan === 'free' ? (
              <button 
                disabled
                className="w-full h-14 bg-gray-100 text-gray-400 font-black rounded-2xl tracking-wide uppercase text-sm border-2 border-dashed border-gray-200 cursor-not-allowed"
              >
                Plan Actual
              </button>
            ) : (
              <button 
                onClick={() => handlePlanChange('free', 'monthly')}
                disabled={loading}
                className="w-full h-14 bg-white border-2 border-gray-200 hover:border-green-500 hover:text-green-600 text-gray-700 font-black rounded-2xl transition-all tracking-wide uppercase text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : 'Activar Plan Gratis'}
              </button>
            )}
          </div>
        </div>

        {/* Standard Plan Card */}
        <div className={`relative overflow-hidden bg-white border rounded-[36px] p-8 flex flex-col justify-between transition-all duration-300 shadow-md ${
          plan === 'standard' && activeBillingPeriod === billingPeriod
            ? 'border-blue-500 ring-4 ring-blue-500/10' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
        }`}>
          {plan === 'standard' && activeBillingPeriod === billingPeriod && (
            <div className="absolute top-0 right-0 bg-blue-500 text-white font-black text-[10px] tracking-widest uppercase px-6 py-2 rounded-bl-3xl shadow-sm">
              Plan Activo
            </div>
          )}
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Standard</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Uso Personal</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1 my-6 flex-wrap">
              <span className="text-5xl font-black text-gray-900">
                ${billingPeriod === 'monthly' ? prices.standard : prices.standardAnnual}
              </span>
              <span className="text-gray-500 font-bold text-lg">/mes</span>
              {billingPeriod === 'annually' && (
                <span className="text-[10px] text-green-600 font-black bg-green-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-full mt-1">
                  Facturado anualmente
                </span>
              )}
            </div>

            <p className="text-gray-500 text-sm font-medium mb-8 min-h-[60px]">
              Para consultorios en crecimiento que manejan su propia agenda y requieren pacientes ilimitados y Formulario 033.
            </p>

            <div className="border-t border-gray-100 my-6" />

            <ul className="space-y-4">
              {standardFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  {feat.included ? (
                    <div className="p-0.5 bg-blue-50 rounded-full text-blue-600 mt-0.5 shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-0.5 bg-gray-50 rounded-full text-gray-300 mt-0.5 shrink-0">
                      <X className="w-4 h-4" />
                    </div>
                  )}
                  <span className={`text-sm font-semibold ${feat.included ? 'text-gray-600' : 'text-gray-400 line-through'}`}>{feat.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            {plan === 'standard' && activeBillingPeriod === billingPeriod ? (
              <button 
                disabled
                className="w-full h-14 bg-gray-100 text-gray-400 font-black rounded-2xl tracking-wide uppercase text-sm border-2 border-dashed border-gray-200 cursor-not-allowed"
              >
                Plan Actual
              </button>
            ) : (
              <button 
                onClick={() => handlePlanChange('standard', billingPeriod)}
                disabled={loading}
                className="w-full h-14 bg-white border-2 border-gray-200 hover:border-blue-500 hover:text-green-600 text-gray-700 font-black rounded-2xl transition-all tracking-wide uppercase text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : (
                  plan === 'standard'
                    ? `Cambiar a Anual`
                    : 'Activar Standard'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Business Plan Card */}
        <div className={`relative overflow-hidden bg-gradient-to-b from-gray-950 to-gray-900 border rounded-[36px] p-8 flex flex-col justify-between transition-all duration-300 shadow-xl ${
          plan === 'business' && activeBillingPeriod === billingPeriod
            ? 'border-purple-500 ring-4 ring-purple-500/20' 
            : 'border-gray-800 hover:border-gray-700 hover:shadow-2xl'
        }`}>
          {plan === 'business' && activeBillingPeriod === billingPeriod && (
            <div className="absolute top-0 right-0 bg-purple-600 text-white font-black text-[10px] tracking-widest uppercase px-6 py-2 rounded-bl-3xl shadow-sm flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 fill-current" /> Plan Activo
            </div>
          )}

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-white">Business</h3>
                  <span className="badge badge-purple bg-purple-500/20 border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5">Popular</span>
                </div>
                <p className="text-xs font-bold text-purple-400/70 uppercase tracking-widest mt-0.5">Centros Médicos</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1 my-6 flex-wrap">
              <span className="text-5xl font-black text-white">
                ${billingPeriod === 'monthly' ? prices.business : prices.businessAnnual}
              </span>
              <span className="text-purple-300/60 font-bold text-lg">/mes</span>
              {billingPeriod === 'annually' && (
                <span className="text-[10px] text-purple-300 font-black bg-purple-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider block w-full mt-1">
                  Facturado anualmente
                </span>
              )}
            </div>

            <p className="text-gray-400 text-sm font-medium mb-8 min-h-[60px]">
              La solución definitiva para clínicas de múltiples odontólogos. Desbloquea enfermería avanzada, gestión de equipo y permisos.
            </p>

            <div className="border-t border-white/10 my-6" />

            <ul className="space-y-4">
              {businessFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  {feat.included ? (
                    <div className="p-0.5 bg-purple-500/10 rounded-full text-purple-400 mt-0.5 shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-0.5 bg-gray-50 rounded-full text-gray-300 mt-0.5 shrink-0">
                      <X className="w-4 h-4" />
                    </div>
                  )}
                  <span className={`text-sm font-semibold ${feat.included ? 'text-gray-300' : 'text-gray-500 line-through'}`}>{feat.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            {plan === 'business' && activeBillingPeriod === billingPeriod ? (
              <button 
                disabled
                className="w-full h-14 bg-purple-950/20 text-purple-300/40 font-black rounded-2xl tracking-wide uppercase text-sm border-2 border-dashed border-purple-500/20 cursor-not-allowed"
              >
                Plan Actual
              </button>
            ) : (
              <button 
                onClick={() => handlePlanChange('business', billingPeriod)}
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-black rounded-2xl transition-all tracking-wide uppercase text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : (
                  plan === 'business'
                    ? `Cambiar a Anual`
                    : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        MEJORAR A BUSINESS
                      </>
                    )
                )}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Feature Breakdown Table / Visual List */}
      <div className="max-w-5xl mx-auto mt-12 bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-sm space-y-8">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Preguntas Frecuentes sobre los Planes</h3>
          <p className="text-gray-500 text-sm font-medium mt-1">Todo lo que necesitás saber sobre la actualización y características de DentiApp Online</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="font-extrabold text-gray-900 text-base">¿Cómo funciona la enfermería avanzada en el plan Business?</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              El plan Business habilita el acceso completo a los módulos de enfermería donde tu personal asistente o de enfermería puede tomar signos vitales y realizar el examen estomatognático del paciente antes de la consulta odontológica.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-extrabold text-gray-900 text-base">¿Puedo cambiar de plan en cualquier momento?</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Sí, podés subir o bajar de plan en cualquier momento al instante. Al subir a Business tendrás acceso inmediato a todo tu equipo y módulos avanzados. Al bajar a Standard o Gratis, se limitará el acceso a vistas compartidas de equipo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
