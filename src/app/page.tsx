"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function LandingPage() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Icon name="local_fire_department" className="text-primary" size="lg" />
          <span className="text-xl font-extrabold tracking-tight">Asadometro</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogin}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Iniciar sesion
          </button>
          <Button
            onClick={handleLogin}
            className="rounded-lg text-sm px-5 py-2 font-semibold"
          >
            Registrarse
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Menos excusas,{" "}
              <br className="hidden md:block" />
              mas asados{" "}
              <span className="text-primary">con amigos.</span>
            </h1>

            <div className="flex gap-3 mt-6 mb-6">
              <IconBubble><Icon name="local_fire_department" className="text-primary" /></IconBubble>
              <IconBubble><Icon name="groups" className="text-[#9b59b6]" /></IconBubble>
              <IconBubble><Icon name="calendar_today" className="text-[#e74c3c]" /></IconBubble>
              <IconBubble><Icon name="emoji_events" className="text-muted-foreground" /></IconBubble>
            </div>

            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Lleva el registro de los asados con tu grupo de amigos, familia o
              companeros. Crea grupos, registra asistencia y descubri quien se
              ratea mas.
            </p>

            <Button
              onClick={handleLogin}
              size="lg"
              className="rounded-lg text-base px-8 py-6 font-semibold shadow-lg mt-8"
            >
              Registrarse
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              Gratis. Web, iPhone y Android.
            </p>
          </div>

          {/* Right - Phone mockup */}
          <div className="hidden md:flex justify-center">
            <div className="relative w-[280px]">
              <div className="bg-card rounded-[2rem] shadow-2xl border overflow-hidden">
                {/* Status bar */}
                <div className="bg-primary/5 px-6 py-3 flex justify-between items-center text-xs text-muted-foreground">
                  <span className="font-medium">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-2 bg-muted-foreground/30 rounded-sm" />
                    <div className="w-4 h-2 bg-muted-foreground/30 rounded-sm" />
                    <div className="w-6 h-2 bg-muted-foreground/30 rounded-sm" />
                  </div>
                </div>
                {/* App content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">Mis Grupos</span>
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">+</span>
                    </div>
                  </div>
                  <MockGroupCard name="Los Pibes" color="#d46211" members={8} lastAsado="Hace 3 dias" />
                  <MockGroupCard name="Familia" color="#9b59b6" members={12} lastAsado="Hace 1 semana" />
                  <MockGroupCard name="Oficina" color="#3498db" members={5} lastAsado="Hace 2 semanas" />
                </div>
                {/* Bottom nav */}
                <div className="border-t flex justify-around py-2 px-2">
                  {["Home", "Calendario", "Grupos", "Perfil"].map((t, i) => (
                    <div key={t} className={`flex flex-col items-center gap-0.5 ${i === 2 ? "text-primary" : "text-muted-foreground/50"}`}>
                      <div className="h-3 w-3 rounded-full bg-current opacity-40" />
                      <span className="text-[8px] font-medium">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="bg-gradient-to-b from-background to-secondary/30 px-6 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <FeatureSection
            color="bg-[#2c3e50]"
            textColor="text-white"
            title="Registra asistencia"
            desc="QR code o palabra secreta para que cada uno marque que fue al asado."
            icon={<Icon name="qr_code_scanner" size="lg" />}
          />
          <FeatureSection
            color="bg-primary"
            textColor="text-white"
            title="Ranking de asistencia"
            desc="Descubri quien va a mas asados y quien siempre se ratea."
            icon={<Icon name="bar_chart" size="lg" />}
          />
          <FeatureSection
            color="bg-[#1abc9c]"
            textColor="text-white"
            title="Calendario grupal"
            desc="Todos los asados de todos tus grupos en un solo calendario."
            icon={<Icon name="calendar_today" size="lg" />}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-extrabold mb-4">
          Empeza a medir tus asados
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Crea tu primer grupo gratis y empeza a trackear quien va y quien falta.
        </p>
        <Button
          onClick={handleLogin}
          size="lg"
          className="rounded-lg text-base px-8 py-6 font-semibold shadow-lg"
        >
          Registrarse gratis
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        Hecho con <Icon name="local_fire_department" className="text-primary inline text-[14px]" /> en Argentina
      </footer>
    </div>
  );
}

function IconBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-10 w-10 rounded-xl bg-card border shadow-sm flex items-center justify-center">
      {children}
    </div>
  );
}

function MockGroupCard({ name, color, members, lastAsado }: { name: string; color: string; members: number; lastAsado: string }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-background/50">
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ backgroundColor: color }}
      >
        {name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{name}</p>
        <p className="text-[10px] text-muted-foreground">{lastAsado}</p>
      </div>
      <div className="text-[10px] text-muted-foreground">{members} miembros</div>
    </div>
  );
}

function FeatureSection({
  color,
  textColor,
  title,
  desc,
  icon,
}: {
  color: string;
  textColor: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`${color} ${textColor} rounded-2xl p-8 flex flex-col gap-4`}>
      <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm opacity-90 leading-relaxed">{desc}</p>
    </div>
  );
}
