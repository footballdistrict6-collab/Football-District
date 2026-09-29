import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react"; // 🚀 تمت إضافة هذا السطر

// استدعاء المكونات الأساسية التي تظهر في جميع الصفحات
import Navbar from "@/components/Navbar";
import PromoPopup from "@/components/PromoPopup";
import { FacebookPixel } from "@/lib/fbPixel";

// إعداد الخط الأساسي للموقع
const inter = Inter({ subsets: ["latin"] });

// معلومات الـ SEO
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
      <head>
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1722417688864625');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1722417688864625&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className={`${inter.className} bg-[#0a0a0a] text-white antialiased flex flex-col min-h-screen`}>
        
        {/* متابعة تغيير الصفحات (SPA Navigation) للبيكسل */}
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
        
        {/* شريط التنقل العلوي */}
        <Navbar />
        
        {/* نافذة العروض المنبثقة الذكية */}
        <Suspense fallback={null}>
          <PromoPopup />
        </Suspense>
        
        {/* محتوى الصفحات المتغير */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* تذييل بسيط (Footer) */}
        <footer className="border-t border-[#1f1f1f] py-8 text-center text-xs text-gray-500 bg-[#0a0a0a]">
          <p>FOOTBALL DISTRICT &copy; {new Date().getFullYear()} — All Rights Reserved.</p>
          <p className="mt-1 text-[10px]">Fast Delivery Across Lebanon &bull; Cash on Delivery</p>
        </footer>

      </body>
    </html>
  );
}