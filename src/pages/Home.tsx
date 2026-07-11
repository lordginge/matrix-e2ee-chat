import { Loader2 } from "lucide-react";
import { useMatrix } from "@/hooks/useMatrixClient";
import Login from "./Login";
import Chat from "./Chat";

export default function Home() {
  const { client, status } = useMatrix();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-950 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-sm">Restoring your encrypted session…</p>
      </div>
    );
  }

  return client ? <Chat /> : <Login />;
}
