import { MessageCircle, Mail, Phone, ShoppingBag } from 'lucide-react'
import { useContactInfo } from '../context/ContactContext'

function InstagramIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

const USE_CASES = [
  {
    Icon: Phone,
    title: 'Soporte técnico',
    desc: '¿Tienes dudas sobre un producto, un pedido o necesitas ayuda con tu cuenta? Escríbenos y te respondemos lo antes posible.',
  },
  {
    Icon: ShoppingBag,
    title: 'Ventas al por mayor',
    desc: '¿Representas una institución educativa o deseas hacer un pedido grande? Contáctanos para conocer precios especiales y condiciones de entrega.',
  },
]

export function ContactPage() {
  const info = useContactInfo()

  const CHANNELS = [
    {
      Icon: MessageCircle,
      label: 'WhatsApp',
      value: info.whatsapp_number,
      href: info.whatsapp_link,
      color: 'bg-green-50 border-green-200 hover:border-green-400',
      iconColor: 'text-green-500',
      badge: 'Respuesta rápida',
      badgeColor: 'bg-green-100 text-green-700',
    },
    {
      Icon: InstagramIcon,
      label: 'Instagram',
      value: info.instagram_user,
      href: info.instagram_link,
      color: 'bg-pink-50 border-pink-200 hover:border-pink-400',
      iconColor: 'text-pink-500',
      badge: 'Síguenos',
      badgeColor: 'bg-pink-100 text-pink-700',
    },
    {
      Icon: Mail,
      label: 'Correo electrónico',
      value: info.email,
      href: `mailto:${info.email}`,
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
      iconColor: 'text-blue-500',
      badge: 'Formal',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">

      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-clay-500 text-[10px] font-bold uppercase tracking-widest mb-2">Contacto</p>
        <h1 className="font-display text-4xl font-extrabold text-espresso mb-4">Comunícate con nosotros</h1>
        <p className="text-warm-500 text-base leading-relaxed max-w-md mx-auto">
          Estamos disponibles para ayudarte con soporte técnico, información de productos
          o cotizaciones para compras institucionales.
        </p>
      </div>

      {/* Casos de uso */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {USE_CASES.map(({ Icon, title, desc }) => (
          <div key={title} className="bg-white border border-warm-200 rounded-xl p-6">
            <div className="w-9 h-9 bg-clay-50 rounded-lg flex items-center justify-center mb-3">
              <Icon size={17} className="text-clay-500" />
            </div>
            <p className="font-display font-bold text-espresso text-sm mb-1">{title}</p>
            <p className="text-warm-500 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Canales de contacto */}
      <div className="flex flex-col gap-3">
        {CHANNELS.map(({ Icon, label, value, href, color, iconColor, badge, badgeColor }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-5 border rounded-xl px-6 py-5 transition-all ${color} group`}
          >
            <div className={`shrink-0 ${iconColor}`}>
              <Icon size={26} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-espresso text-sm">{label}</p>
              <p className="text-warm-600 text-xs mt-0.5 truncate">{value}</p>
            </div>
            <span className={`hidden sm:inline text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badgeColor}`}>
              {badge}
            </span>
          </a>
        ))}
      </div>

      <p className="text-center text-warm-400 text-xs mt-10">
        Horario de atención: lunes a viernes, 8 a.m. – 6 p.m. · Barranquilla, Colombia
      </p>
    </div>
  )
}
