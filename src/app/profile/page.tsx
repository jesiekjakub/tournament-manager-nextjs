import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/utils/db'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const profile = await prisma.user.findUnique({
    where: { id: user.id }
  })

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="bg-white shadow rounded-lg p-8 border">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
            {profile?.firstName?.[0]}{profile?.lastName?.[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile?.firstName} {profile?.lastName}</h1>
            <p className="text-gray-500">{profile?.email}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">User ID: {user.id}</p>
          </div>
        </div>
        
        {/* You can add lists of tournaments organized/participated here later */}
        <div className="border-t pt-6">
           <h2 className="text-lg font-semibold mb-4">Account Details</h2>
           <p className="text-gray-600">Member since: {new Date(profile?.createdAt || '').toLocaleDateString()}</p>
        </div>
      </div>
    </main>
  )
}