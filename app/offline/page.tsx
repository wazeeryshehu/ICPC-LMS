export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        background: "#f4f7fc",
        color: "#0f1d33",
        fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 420,
          textAlign: "center",
          background: "#ffffff",
          border: "1px solid #dfe6f1",
          borderRadius: 16,
          padding: "36px 28px",
          boxShadow: "0 18px 40px -28px rgba(8, 26, 58, 0.5)",
        }}
      >
        <img
          src="/images/icpc-emblem.png"
          alt="ICPC emblem"
          width={72}
          height={72}
          style={{ margin: "0 auto 16px", display: "block" }}
        />
        <h1 style={{ fontSize: 20, margin: "0 0 8px" }}>You are offline</h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#5f7089", margin: "0 0 20px" }}>
          The ICPC Learning Portal needs an internet connection to load training records securely. Reconnect, then try
          again.
        </p>
        <a
          href="/dashboard"
          style={{
            display: "inline-block",
            background: "#16437f",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 14,
            padding: "10px 18px",
            borderRadius: 10,
          }}
        >
          Retry
        </a>
      </div>
    </main>
  );
}
