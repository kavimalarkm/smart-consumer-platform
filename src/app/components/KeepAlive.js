"use client";
import { useEffect } from "react";

export default function KeepAlive() {
  useEffect(() => {
    function ping() {
      fetch("https://smart-consumer-backend.onrender.com")
        .catch(() => {});
    }
    ping();
    const interval = setInterval(ping, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return null;
}