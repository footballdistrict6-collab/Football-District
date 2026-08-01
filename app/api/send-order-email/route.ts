import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// المفتاح السري لخدمة Resend (موجود في ملف .env.local)
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const order = await request.json();

    // تجهيز قائمة المنتجات لعرضها في الإيميل
    const itemsHtml = Array.isArray(order.items)
      ? order.items
          .map(
            (item: any) =>
              `<li><strong>${item.quantity}x ${item.title}</strong> — $${item.price}</li>`
          )
          .join('')
      : '<li>No items details</li>';

    // إرسال الإيميل
    const data = await resend.emails.send({
      from: 'Football District Store <onboarding@resend.dev>', // الإيميل الافتراضي المجاني من Resend
      to: ['footballdistrict6@gmail.com'], // 👈 تم التعديل إلى الإيميل الجديد هنا
      subject: `🚨 NEW ORDER RECEIVED #${order.id ? order.id.slice(0, 8).toUpperCase() : 'NEW'} - $${order.total_amount}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #222;">
          <h1 style="color: #00AEEF; margin-bottom: 8px;">🚨 NEW ORDER RECEIVED!</h1>
          <p style="color: #cccccc; font-size: 14px;">You have received a new order on Football District.</p>
          
          <hr style="border: none; border-top: 1px solid #222; margin: 20px 0;" />
          
          <h3 style="color: #ffffff; margin-bottom: 12px;">👤 Customer Details:</h3>
          <p style="color: #cccccc; margin: 4px 0;"><strong>Name:</strong> ${order.first_name} ${order.last_name}</p>
          <p style="color: #cccccc; margin: 4px 0;"><strong>Phone:</strong> ${order.phone}</p>
          <p style="color: #cccccc; margin: 4px 0;"><strong>Address:</strong> ${order.address}</p>
          ${
            order.notes
              ? `<p style="color: #facc15; margin: 4px 0;"><strong>Notes:</strong> ${order.notes}</p>`
              : ''
          }

          <hr style="border: none; border-top: 1px solid #222; margin: 20px 0;" />
          
          <h3 style="color: #ffffff; margin-bottom: 12px;">🛍️ Order Items:</h3>
          <ul style="color: #cccccc; line-height: 1.6; padding-left: 20px;">
            ${itemsHtml}
          </ul>

          <hr style="border: none; border-top: 1px solid #222; margin: 20px 0;" />

          <h2 style="color: #00AEEF; margin: 0;">Total Amount (COD): $${order.total_amount}</h2>
          <p style="color: #888888; font-size: 12px; margin-top: 24px;">Football District Automated Notification System</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Email Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}