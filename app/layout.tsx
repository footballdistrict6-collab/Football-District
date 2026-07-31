import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// استدعاء المكونات الأساسية التي تظهر في جميع الصفحات
import Navbar from "@/components/Navbar";
import PromoPopup from "@/components/PromoPopup";

// إعداد الخط الأساسي للموقع
const inter = Inter({ subsets: ["latin"] });

// معلومات الـ SEO (كيف يظهر موقعك في جوجل وعند مشاركة الرابط)
export const metadata: Metadata = {
  title: "FOOTBALL DISTRICT | Premium Kits & Boots",
  description: "Lebanon's premier destination for football kits, professional boots, and premium equipment. Fast delivery and COD available.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0a0a] text-white antialiased flex flex-col min-h-screen`}>
        
        {/* شريط التنقل العلوي (يظهر دائماً) */}
        <Navbar />
        
        {/* نافذة العروض المنبثقة الذكية (تعمل مرة واحدة في الجلسة بعد 3 ثوانٍ) */}
        <PromoPopup />
        
        {/* محتوى الصفحات المتغير (الرئيسية، الكتالوج، الدفع...) */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* تذييل بسيط (Footer) لتثبيت الحقوق أسفل كل الصفحات */}
        <footer className="border-t border-[#1f1f1f] py-8 text-center text-xs text-gray-500 bg-[#0a0a0a]">
          <p>FOOTBALL DISTRICT &copy; {new Date().getFullYear()} — All Rights Reserved.</p>
          <p className="mt-1 text-[10px]">Fast Delivery Across Lebanon &bull; Cash on Delivery</p>
        </footer>

      </body>
    </html>
  );
}