'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import FarmerDashboard from '@/components/dashboard/farmer-dashboard'
import SpecialistDashboard from '@/components/dashboard/specialist-dashboard'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'farmer' | 'specialist' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      router.push('/auth/signup')
      return
    }

    setUser(user)
    
    // Get user role from user metadata
    const role = user.user_metadata?.role || 'farmer'
    setUserRole(role)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {userRole === 'specialist' ? (
          <SpecialistDashboard />
        ) : (
          <FarmerDashboard />
        )}
      </main>
      <Footer />
    </div>
  )
}


