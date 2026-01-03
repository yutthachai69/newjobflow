import { prisma } from "@/lib/prisma";
import { createSite } from "@/app/actions";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  searchParams: Promise<{ clientId?: string }>;
}

export default async function NewSitePage({ searchParams }: Props) {
  const { clientId } = await searchParams;

  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
  });

  if (!clientId && clients.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Link 
            href="/locations" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 group transition-all duration-200"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span className="font-medium">กลับ</span>
          </Link>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">ยังไม่มีลูกค้าในระบบ</h2>
            <p className="text-gray-600 mb-8">ต้องมีลูกค้าก่อนจึงจะสามารถสร้างสาขาได้</p>
            <Link
              href="/locations/clients/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:shadow-xl hover:scale-105 font-semibold transition-all duration-300"
            >
              <span>+</span>
              <span>เพิ่มลูกค้าใหม่</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link 
          href="/locations" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 group transition-all duration-200"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
          <span className="font-medium">กลับ</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">📍</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
              เพิ่มสาขา/สถานที่ใหม่
            </h1>
          </div>
          <p className="text-gray-600 ml-15">สร้างสาขาหรือสถานที่ใหม่สำหรับลูกค้า</p>
        </div>

        {/* Form */}
        <form action={createSite} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ลูกค้า <span className="text-red-500">*</span>
              </label>
              <select
                name="clientId"
                required
                defaultValue={clientId || ""}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
              >
                <option value="">-- เลือกลูกค้า --</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                🏢 เลือกองค์กรลูกค้าที่สาขานี้สังกัด
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ชื่อสาขา/สถานที่ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
                placeholder="เช่น สาขาสุขุมวิท, โรงงาน A, สำนักงานใหญ่"
              />
              <p className="mt-2 text-xs text-gray-500">
                💡 ระบุชื่อที่บ่งบอกที่ตั้งหรือลักษณะของสถานที่
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ที่อยู่
              </label>
              <textarea
                name="address"
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white resize-none"
                placeholder="ที่อยู่เต็ม รวมถึงเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
              />
              <p className="mt-2 text-xs text-gray-500">
                📍 ที่อยู่สำหรับการติดต่อและประสานงาน (ไม่บังคับ)
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">ℹ️</span>
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-1">หลังจากสร้างสาขาแล้ว</p>
                  <p className="text-gray-600">คุณสามารถเพิ่มอาคาร (Buildings), ชั้น (Floors), และห้อง (Rooms) ภายในสาขานี้ได้</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>บันทึก</span>
              </button>
              <Link
                href="/locations"
                className="sm:flex-none px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-medium text-center transition-all duration-200 text-gray-700"
              >
                ยกเลิก
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}