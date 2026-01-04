import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DeleteButton from "./DeleteButton";

interface Props {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function UsersPage({ searchParams }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // เฉพาะ ADMIN เท่านั้นที่สามารถดูหน้านี้ได้
  if (user.role !== 'ADMIN') {
    redirect('/');
  }

  const { error, success } = await searchParams;

  // ดึงข้อมูล Users ทั้งหมด
  const users = await prisma.user.findMany({
    include: {
      site: {
        include: {
          client: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'ผู้ดูแลระบบ';
      case 'TECHNICIAN':
        return 'ช่าง';
      case 'CLIENT':
        return 'ลูกค้า';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'TECHNICIAN':
        return 'bg-blue-100 text-blue-800';
      case 'CLIENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'unauthorized':
        return 'คุณไม่มีสิทธิ์ในการดำเนินการนี้';
      case 'cannot_delete_self':
        return 'ไม่สามารถลบบัญชีของตัวเองได้ กรุณาให้ผู้ดูแลระบบคนอื่นลบให้';
      case 'not_found':
        return 'ไม่พบผู้ใช้ที่ต้องการลบ';
      case 'has_job_items':
        return 'ไม่สามารถลบผู้ใช้ที่มีงานที่มอบหมายได้ กรุณาเปลี่ยนผู้รับผิดชอบงานก่อน';
      case 'server_error':
        return 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์';
      default:
        return 'เกิดข้อผิดพลาด';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Success/Error Messages */}
      {success === 'deleted' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">ลบผู้ใช้สำเร็จแล้ว</p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{getErrorMessage(error)}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👥 จัดการผู้ใช้งาน ({users.length})</h1>
          <p className="text-gray-600 mt-1">สร้างและจัดการบัญชีผู้ใช้งานในระบบ</p>
        </div>
        <Link
          href="/users/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          + เพิ่มผู้ใช้ใหม่
        </Link>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 uppercase font-medium border-b">
            <tr>
              <th className="px-6 py-3 text-gray-900">ชื่อผู้ใช้</th>
              <th className="px-6 py-3 text-gray-900">ชื่อ-นามสกุล</th>
              <th className="px-6 py-3 text-gray-900">บทบาท</th>
              <th className="px-6 py-3 text-gray-900">สถานที่ (สำหรับ CLIENT)</th>
              <th className="px-6 py-3 text-gray-900">วันที่สร้าง</th>
              <th className="px-6 py-3 text-gray-900">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{u.username}</td>
                <td className="px-6 py-4 text-gray-700">{u.fullName || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(u.role)}`}>
                    {getRoleLabel(u.role)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {u.role === 'CLIENT' && u.site ? (
                    <div>
                      <div className="font-medium">{u.site.name}</div>
                      <div className="text-xs text-gray-500">{u.site.client.name}</div>
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600 text-xs">
                  {new Date(u.createdAt).toLocaleDateString('th-TH')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/users/${u.id}/edit`}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      แก้ไข
                    </Link>
                    {u.id !== user.id ? (
                      <DeleteButton userId={u.id} username={u.username} />
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center px-3 py-1.5 bg-gray-400 text-white text-sm rounded-md cursor-not-allowed opacity-50"
                        title="ไม่สามารถลบบัญชีของตัวเองได้"
                      >
                        ลบ
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

