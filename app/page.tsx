import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import TechnicianDashboard from "@/app/components/dashboards/TechnicianDashboard";
import ClientDashboard from "@/app/components/dashboards/ClientDashboard";
import AdminDashboard from "@/app/components/dashboards/AdminDashboard";

export async function generateMetadata(): Promise<Metadata> {
  const user = await getCurrentUser();
  
  if (!user) {
    return {
      title: "Dashboard - AirService Enterprise",
      description: "Dashboard - ระบบบริหารจัดการงานบริการแอร์",
    };
  }

  const roleTitles: Record<string, string> = {
    ADMIN: "Dashboard - ผู้ดูแลระบบ",
    TECHNICIAN: "Dashboard - ช่าง",
    CLIENT: "Dashboard - ลูกค้า",
  };

  return {
    title: `${roleTitles[user.role] || "Dashboard"} - AirService Enterprise`,
    description: `Dashboard สำหรับ ${user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : user.role === 'TECHNICIAN' ? 'ช่าง' : 'ลูกค้า'} - ระบบบริหารจัดการงานบริการแอร์`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Dashboard สำหรับ TECHNICIAN
  if (user.role === 'TECHNICIAN') {
    return <TechnicianDashboard userId={user.id} />
  }

  // Dashboard สำหรับ CLIENT
  if (user.role === 'CLIENT') {
    if (!user.siteId) {
      return (
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-amber-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลสถานที่</h1>
            <p className="text-gray-600">กรุณาติดต่อผู้ดูแลระบบเพื่อกำหนดสถานที่ให้กับบัญชีของคุณ</p>
          </div>
        </div>
      );
    }
    return <ClientDashboard siteId={user.siteId} />
  }

  // Dashboard สำหรับ ADMIN
  return <AdminDashboard />
}
