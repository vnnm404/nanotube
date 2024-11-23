'use client';

import React, { useEffect, useState } from "react";

interface Server {
  ip: string;
  port: string;
  status: "active" | "inactive";
}

const HealthPage = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServerHealth = async () => {
      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to fetch server health.");
        }
        const data = await response.json();
        setServers(data.servers);
      } catch (err) {
        console.error("Error fetching server health:", err);
        setError("Failed to load server health.");
      } finally {
        setLoading(false);
      }
    };

    fetchServerHealth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Server Health</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ddd" }}>IP</th>
            <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ddd" }}>Port</th>
            <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ddd" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {servers.map((server, index) => (
            <tr key={index}>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{server.ip}</td>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{server.port}</td>
              <td
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #ddd",
                  color: server.status === "active" ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {server.status === "active" ? "Healthy" : "Unresponsive"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HealthPage;
