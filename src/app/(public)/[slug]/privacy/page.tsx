import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, phone, email, address')
    .eq('slug', slug)
    .single()

  if (!tenant) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <Link 
          href={`/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
        >
          ← Volver a {tenant.name}
        </Link>

        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
            Política de Privacidad y Tratamiento de Datos Personales
          </h1>
          <p className="text-gray-500 font-medium">
            Última actualización: {new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <section className="space-y-4 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-black text-gray-900">1. Identificación del Responsable</h2>
          <p>
            <strong>{tenant.name}</strong>{tenant.address ? `, con domicilio en ${tenant.address}` : ''}, 
            es el responsable del tratamiento de los datos personales que usted proporciona 
            a través de nuestro sitio web y formularios de contacto.
          </p>
        </section>

        <section className="space-y-4 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-black text-gray-900">2. Datos que Recolectamos</h2>
          <p>Recolectamos los siguientes datos personales cuando usted utiliza nuestro formulario de reserva de turnos:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Nombre completo</li>
            <li>Número de teléfono / WhatsApp</li>
            <li>Correo electrónico (opcional)</li>
            <li>Fecha y motivo de la consulta</li>
          </ul>
        </section>

        <section className="space-y-4 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-black text-gray-900">3. Finalidad del Tratamiento</h2>
          <p>Sus datos personales serán utilizados exclusivamente para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Gestionar y confirmar sus turnos odontológicos</li>
            <li>Mantener su historia clínica digital</li>
            <li>Contactarlo en caso de cambios o recordatorios de citas</li>
            <li>Cumplir con obligaciones legales aplicables a servicios de salud</li>
          </ul>
        </section>

        <section className="space-y-4 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-black text-gray-900">4. Base Legal</h2>
          <p>
            El tratamiento de sus datos se fundamenta en su consentimiento explícito al momento de 
            completar el formulario de reserva, así como en la necesidad de ejecutar el servicio 
            odontológico solicitado y cumplir con las obligaciones legales del profesional de la salud.
          </p>
        </section>

        <section className="space-y-4 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-black text-gray-900">5. Conservación de Datos</h2>
          <p>
            Sus datos personales serán conservados durante el tiempo necesario para cumplir con las 
            finalidades descritas y durante el plazo legal exigido para historias clínicas (mínimo 10 años 
            según regulación sanitaria aplicable). Transcurrido dicho plazo, los datos serán eliminados 
            de forma segura.
          </p>
        </section>

        <section className="space-y-4 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-black text-gray-900">6. Medidas de Seguridad</h2>
          <p>
            {tenant.name} implementa medidas técnicas y organizativas para proteger sus datos personales 
            contra pérdida, alteración, acceso no autorizado o tratamiento indebido, incluyendo:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Cifrado de datos en tránsito y en reposo</li>
            <li>Control de acceso basado en roles</li>
            <li>Registro de auditoría de accesos</li>
            <li>Copias de seguridad periódicas</li>
          </ul>
        </section>

        <section className="space-y-4 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-black text-gray-900">7. Derechos del Titular</h2>
          <p>Usted tiene derecho a:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Acceder a sus datos personales</li>
            <li>Solicitar la rectificación de datos inexactos</li>
            <li>Solicitar la supresión de sus datos (cuando proceda legalmente)</li>
            <li>Oponerse al tratamiento de sus datos</li>
            <li>Solicitar la portabilidad de sus datos</li>
            <li>Revocar su consentimiento en cualquier momento</li>
          </ul>
          <p className="mt-4">
            Para ejercer estos derechos, contacte al responsable a través de:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            {tenant.email && <li>Email: <strong>{tenant.email}</strong></li>}
            {tenant.phone && <li>Teléfono: <strong>{tenant.phone}</strong></li>}
            {tenant.address && <li>Dirección: <strong>{tenant.address}</strong></li>}
          </ul>
        </section>

        <section className="space-y-4 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-black text-gray-900">8. Transferencia de Datos</h2>
          <p>
            {tenant.name} no transfiere sus datos personales a terceros, salvo obligación legal o 
            autorización expresa del titular. Los datos se almacenan en servidores seguros que cumplen 
            con estándares internacionales de protección de datos.
          </p>
        </section>

        <section className="space-y-4 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-black text-gray-900">9. Modificaciones</h2>
          <p>
            Esta política de privacidad puede ser actualizada periódicamente. Se recomienda revisar 
            esta página con regularidad. La fecha de última actualización se indica al inicio de este documento.
          </p>
        </section>

        <section className="space-y-4 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-black text-gray-900">10. Consentimiento</h2>
          <p>
            Al utilizar nuestro formulario de reserva de turnos y hacer clic en &quot;Confirmar mi turno&quot;, 
            usted declara haber leído y aceptado esta Política de Privacidad y otorga su consentimiento 
            para el tratamiento de sus datos personales conforme a los términos aquí establecidos.
          </p>
        </section>

        <div className="pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-400 font-medium">
            Para consultas sobre esta política, contacte a {tenant.name} 
            {tenant.email ? ` en ${tenant.email}` : ''}{tenant.phone ? ` o al ${tenant.phone}` : ''}.
          </p>
        </div>
      </div>
    </main>
  )
}
