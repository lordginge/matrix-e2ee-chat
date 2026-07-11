import { useState } from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMatrix } from "@/hooks/useMatrixClient";

export default function Login() {
  const { login, error } = useMatrix();
  const [baseUrl, setBaseUrl] = useState("https://matrix.org");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(baseUrl, username, password);
    } catch {
      // error is surfaced via context
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">E2EE Chat</h1>
          <p className="text-slate-400 text-sm">
            End-to-end encrypted messaging over the Matrix protocol
          </p>
        </div>

        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur">
          <form onSubmit={onSubmit}>
            <CardHeader>
              <CardTitle className="text-white">Sign in</CardTitle>
              <CardDescription>
                Use your Matrix account on any homeserver
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="homeserver" className="text-slate-300">
                  Homeserver
                </Label>
                <Input
                  id="homeserver"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://matrix.org"
                  className="bg-slate-950 border-slate-700 text-white"
                  autoComplete="url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@you:matrix.org or you"
                  className="bg-slate-950 border-slate-700 text-white"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={busy}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {busy ? "Setting up encryption…" : "Sign in securely"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3" />
          Messages are encrypted on your device with Olm/Megolm before they
          leave your browser.
        </p>
      </div>
    </div>
  );
}
