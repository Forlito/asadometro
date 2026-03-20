import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { category, message, userEmail, userName } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "El mensaje es requerido" }, { status: 400 });
    }

    const timestamp = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });

    await resend.emails.send({
      from: "Asadometro Feedback <onboarding@resend.dev>",
      to: "juan.samitier077@gmail.com",
      subject: `[Asadometro Feedback] ${category || "General"}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d46211;">🔥 Nuevo Feedback - Asadometro</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Categoria</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${category || "General"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Usuario</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${userName || "Anonimo"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${userEmail || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Fecha</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${timestamp}</td>
            </tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback email error:", error);
    return NextResponse.json(
      { error: "Error al enviar feedback" },
      { status: 500 }
    );
  }
}
