import { forwardRef } from "react";

type StatsData = {
  displayName: string;
  avatarUrl: string | null;
  attended: number;
  hosted: number;
  grilled: number;
  attendanceRate: number;
  avgRating: number | null;
};

export const StatsCardStory = forwardRef<HTMLDivElement, { stats: StatsData }>(
  function StatsCardStory({ stats }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1920,
          background: "linear-gradient(180deg, #1a1a1a 0%, #2d1a0a 50%, #1a1a1a 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "white",
          padding: 80,
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      >
        {/* Logo */}
        <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 12, color: "#d46211" }}>
          🔥 Asadometro
        </div>
        <div style={{ fontSize: 24, color: "#999", marginBottom: 80 }}>
          Mis estadisticas
        </div>

        {/* Avatar + Name */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 80 }}>
          {stats.avatarUrl ? (
            <img
              src={stats.avatarUrl}
              alt=""
              style={{ width: 160, height: 160, borderRadius: "50%", border: "4px solid #d46211", marginBottom: 24 }}
            />
          ) : (
            <div style={{
              width: 160, height: 160, borderRadius: "50%", background: "#d46211",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 64, fontWeight: 700, marginBottom: 24,
            }}>
              {stats.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ fontSize: 42, fontWeight: 700 }}>{stats.displayName}</div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40, width: "100%" }}>
          <StatRow label="Asados asistidos" value={stats.attended.toString()} />
          <StatRow label="Veces como asador" value={stats.grilled.toString()} />
          <StatRow label="Veces como anfitrion" value={stats.hosted.toString()} />
          <StatRow label="Asistencia" value={`${stats.attendanceRate}%`} />
          {stats.avgRating !== null && (
            <StatRow label="Rating promedio" value={stats.avgRating.toFixed(1)} />
          )}
        </div>
      </div>
    );
  }
);

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #333", paddingBottom: 16 }}>
      <span style={{ fontSize: 28, color: "#ccc" }}>{label}</span>
      <span style={{ fontSize: 48, fontWeight: 800, color: "#d46211" }}>{value}</span>
    </div>
  );
}
