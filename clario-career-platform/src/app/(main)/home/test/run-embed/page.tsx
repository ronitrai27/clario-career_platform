"use client";

import { useState } from "react";

export default function EmbedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleEmbed = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/embed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Embedding completed successfully!");
      } else {
        setMessage("❌ Failed: " + data.error);
      }
    } catch (err) {
      setMessage("❌ Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <button
        onClick={handleEmbed}
        disabled={loading}
        className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Embedding..." : "Embed CareerUSA Dataset"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
