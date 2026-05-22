import { MessageCircle } from 'lucide-react'
import { useContactInfo } from '../../context/ContactContext'

export function WhatsAppBubble() {
  const { whatsapp_link } = useContactInfo()

  return (
    <a
      href={whatsapp_link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
    >
      <MessageCircle size={26} fill="white" stroke="none" />
    </a>
  )
}
