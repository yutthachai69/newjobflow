import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Note: bodySizeLimit is configured via environment variable or middleware
  // For Next.js 16, use experimental.serverActions.bodySizeLimit if needed
  
  // ปิด request logging (Next.js 16 ไม่มี logging option โดยตรง)
  // สามารถปิดได้โดยตั้ง environment variable: NEXT_PRIVATE_STANDALONE=true
  // หรือใช้ custom logging configuration
};

export default nextConfig;
