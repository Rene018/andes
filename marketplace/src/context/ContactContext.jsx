import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULTS = {
  whatsapp_number: '+57 300 000 0000',
  whatsapp_link:   'https://wa.me/573000000000',
  instagram_user:  '@andes3d.co',
  instagram_link:  'https://instagram.com/andes3d.co',
  email:           'contacto@andes3d.co',
}

const ContactContext = createContext(DEFAULTS)

export function ContactProvider({ children }) {
  const [info, setInfo] = useState(DEFAULTS)

  useEffect(() => {
    supabase
      .from('contact_info')
      .select('key, value')
      .then(({ data }) => {
        if (data?.length) {
          const obj = {}
          data.forEach(({ key, value }) => { obj[key] = value })
          setInfo(prev => ({ ...prev, ...obj }))
        }
      })
  }, [])

  return <ContactContext.Provider value={info}>{children}</ContactContext.Provider>
}

export function useContactInfo() {
  return useContext(ContactContext)
}
