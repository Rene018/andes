import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { WhatsAppBubble } from '../ui/WhatsAppBubble'
import { ContactProvider } from '../../context/ContactContext'

export function Layout() {
  return (
    <ContactProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <WhatsAppBubble />
      </div>
    </ContactProvider>
  )
}
