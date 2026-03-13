import { useState, useEffect } from "react";
import EntryGate from "./EntryGate";
import TripDashboard from "./TripDashboard";

const Index = () => {
  const [entered, setEntered] = useState(() => {
    try {
      return localStorage.getItem("trip-gate-agreed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (entered) {
      try { localStorage.setItem("trip-gate-agreed", "true"); } catch { /* private browsing */ }
    }
  }, [entered]);

  if (!entered) {
    return <EntryGate onEnter={() => setEntered(true)} />;
  }

  return <TripDashboard />;
};

export default Index;
