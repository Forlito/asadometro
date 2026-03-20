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

export const StatsCardTwitter = forwardRef<HTMLDivElement, { stats: StatsData }>(
  function StatsCardTwitter({ stats }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: 1600,
          height: 900,
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d1a0a 50%, #1a1a1a 100%)",
          display: "flex",
          alignItems: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "white",
          padding: 80,
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      >
        {/* Left side: Avatar + Name */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 400, marginRight: 80 }}>
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 32, color: "#d46211" }}>
            🔥 Asadometro
          </div>
          {stats.avatarUrl ? (
            <img
              src={stats.avatarUrl}
              alt=""
              style={{ width: 140, height: 140, borderRadius: "50%", border: "4px solid #d46211", marginBottom: 20 }}
            />
          ) : (
            <div style={{
              width: 140, height: 140, borderRadius: "50%", background: "#d46211",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 56, fontWeight: 700, marginBottom: 20,
            }}>
              {stats.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ fontSize: 32, fontWeight: 700, textAlign: "center" }}>{stats.displayName}</div>
          <div style={{ fontSize: 18, color: "#999", marginTop: 8 }}>Mis estadisticas</div>
        </div>

        {/* Right side: Stats */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
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
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #333", paddingBottom: 12 }}>
      <span style={{ fontSize: 24, color: "#ccc" }}>{label}</span>
      <span style={{ fontSize: 40, fontWeight: 800, color: "#d46211" }}>{value}</span>
    </div>
  );
}
