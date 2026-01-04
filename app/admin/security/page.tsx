import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSecurityEvents } from "@/lib/security"
import SecurityDashboard from "./SecurityDashboard"

export default async function SecurityPage() {
  const user = await getCurrentUser()

  // Only ADMIN can access security dashboard
  if (!user || user.role !== 'ADMIN') {
    redirect('/')
  }

  const events = getSecurityEvents(200)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Security Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor security events and suspicious activities
          </p>
        </div>

        <SecurityDashboard events={events} />
      </div>
    </div>
  )
}

