import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile({
        id: data.id,
        fullName: data.full_name,
        customerType: data.customer_type,
        phone: data.phone,
        address: data.address,
        city: data.city,
        department: data.department,
        role: data.role,
      })
    }
    setLoading(false)
  }

  async function updateProfile(fields) {
    const { user } = (await supabase.auth.getSession()).data.session ?? {}
    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase.from('profiles').update({
      full_name: fields.fullName,
      customer_type: fields.customerType,
      phone: fields.phone ?? null,
      address: fields.address ?? null,
      city: fields.city ?? null,
      department: fields.department ?? null,
    }).eq('id', user.id)

    if (error) return { error: error.message }
    setProfile(prev => ({ ...prev, ...fields }))
    return { error: null }
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signUp(email, password, meta) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: meta.fullName,
          customer_type: meta.customerType ?? 'Otro',
          phone: meta.phone ?? null,
        },
      },
    })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        isAdmin: profile?.role === 'admin',
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
