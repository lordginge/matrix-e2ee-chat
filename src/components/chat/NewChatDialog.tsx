import { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { MatrixClient, Visibility, Preset } from "matrix-js-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  client: MatrixClient;
  onCreated: (roomId: string) => void;
}

export default function NewChatDialog({ client, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    const invite = userId.trim();
    if (!invite) return;
    setBusy(true);
    setError(null);
    try {
      const res = await client.createRoom({
        visibility: Visibility.Private,
        preset: Preset.TrustedPrivateChat,
        invite: [invite],
        is_direct: true,
        initial_state: [
          {
            type: "m.room.encryption",
            state_key: "",
            content: { algorithm: "m.megolm.v1.aes-sha2" },
          },
        ],
      });
      setOpen(false);
      setUserId("");
      onCreated(res.room_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="text-slate-300 hover:text-white"
          title="New encrypted chat"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            New encrypted chat
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Start a private, end-to-end encrypted conversation. Enter the full
            Matrix ID of the person you want to invite.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="invite-user" className="text-slate-300">
            Matrix user ID
          </Label>
          <Input
            id="invite-user"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="@friend:matrix.org"
            className="bg-slate-950 border-slate-700 text-white"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            onClick={create}
            disabled={busy || !userId.trim()}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {busy ? "Creating…" : "Create encrypted room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
