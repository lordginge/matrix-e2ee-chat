import { ShieldCheck, Users, Inbox } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RoomInfo } from "@/hooks/useRooms";

interface Props {
  rooms: RoomInfo[];
  activeRoomId: string | null;
  onSelect: (roomId: string) => void;
  onAcceptInvite: (roomId: string) => void;
  onRejectInvite: (roomId: string) => void;
}

function initials(name: string) {
  return name.replace(/^[@#]/, "").slice(0, 2).toUpperCase();
}

export default function RoomList({
  rooms,
  activeRoomId,
  onSelect,
  onAcceptInvite,
  onRejectInvite,
}: Props) {
  const invites = rooms.filter((r) => r.membership === "invite");
  const joined = rooms.filter((r) => r.membership === "join");

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {invites.length > 0 && (
          <>
            <p className="px-2 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-amber-400 flex items-center gap-1">
              <Inbox className="w-3 h-3" /> Invites
            </p>
            {invites.map((room) => (
              <div
                key={room.roomId}
                className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-semibold text-amber-300 shrink-0">
                    {initials(room.name)}
                  </div>
                  <span className="text-sm text-white truncate flex-1">
                    {room.name}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    className="flex-1 h-7 bg-emerald-600 hover:bg-emerald-500"
                    onClick={() => onAcceptInvite(room.roomId)}
                  >
                    Join
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 h-7 text-slate-400 hover:text-white"
                    onClick={() => onRejectInvite(room.roomId)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}

        {joined.map((room) => (
          <button
            key={room.roomId}
            onClick={() => onSelect(room.roomId)}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors",
              activeRoomId === room.roomId
                ? "bg-emerald-600/20 border border-emerald-500/30"
                : "hover:bg-slate-800/60 border border-transparent",
            )}
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-200">
                {room.isDirect ? initials(room.name) : <Users className="w-4 h-4" />}
              </div>
              {room.encrypted && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {room.name}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {room.encrypted ? "End-to-end encrypted" : "Not encrypted"}
              </p>
            </div>
            {room.encrypted && (
              <Badge
                variant="outline"
                className="border-emerald-500/40 text-emerald-400 text-[10px] shrink-0"
              >
                E2EE
              </Badge>
            )}
          </button>
        ))}

        {joined.length === 0 && invites.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-8 px-4">
            No conversations yet. Start an encrypted chat with the + button.
          </p>
        )}
      </div>
    </ScrollArea>
  );
}
