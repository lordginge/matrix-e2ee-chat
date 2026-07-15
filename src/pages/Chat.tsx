import { useState } from "react";
import { ShieldCheck, LogOut, MessageSquare, Wifi, WifiOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMatrix } from "@/hooks/useMatrixClient";
import { useRooms } from "@/hooks/useRooms";
import { useTimeline } from "@/hooks/useTimeline";
import RoomList from "@/components/chat/RoomList";
import MessageList from "@/components/chat/MessageList";
import Composer from "@/components/chat/Composer";
import NewChatDialog from "@/components/chat/NewChatDialog";

export default function Chat() {
  const { client, status, logout } = useMatrix();
  const rooms = useRooms(client);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const { events, canLoadMore, loadingMore, loadMore } = useTimeline(
    client,
    activeRoomId,
  );

  if (!client) return null;

  const activeRoom = activeRoomId ? client.getRoom(activeRoomId) : null;
  const encrypted = activeRoom?.hasEncryptionStateEvent() ?? false;

  const acceptInvite = async (roomId: string) => {
    await client.joinRoom(roomId);
    setActiveRoomId(roomId);
  };

  const rejectInvite = async (roomId: string) => {
    await client.leave(roomId);
  };

  return (
    <div className="h-screen flex bg-slate-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`w-full md:w-80 shrink-0 border-r border-slate-800 flex-col bg-slate-900/40 ${
          activeRoom ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-3 border-b border-slate-800 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">E2EE Chat</p>
            <p className="text-xs text-slate-400 truncate">{client.getUserId()}</p>
          </div>
          <NewChatDialog client={client} onCreated={setActiveRoomId} />
          <Button
            size="icon"
            variant="ghost"
            onClick={logout}
            className="text-slate-400 hover:text-white shrink-0"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-3 py-1.5 border-b border-slate-800/60 flex items-center gap-1.5 text-xs">
          {status === "ready" ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Connected &amp; syncing</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400">Connecting…</span>
            </>
          )}
        </div>

        <RoomList
          rooms={rooms}
          activeRoomId={activeRoomId}
          onSelect={setActiveRoomId}
          onAcceptInvite={acceptInvite}
          onRejectInvite={rejectInvite}
        />
      </aside>

      {/* Main panel */}
      <main
        className={`flex-1 flex-col min-w-0 ${
          activeRoom ? "flex" : "hidden md:flex"
        }`}
      >
        {activeRoom ? (
          <>
            <header className="h-14 border-b border-slate-800 flex items-center gap-3 px-4 shrink-0 bg-slate-900/40">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setActiveRoomId(null)}
                className="text-slate-400 hover:text-white shrink-0 md:hidden"
                title="Back to conversations"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold">
                {activeRoom.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold truncate">{activeRoom.name}</h2>
                <p className="text-xs text-slate-400">
                  {activeRoom.getJoinedMemberCount()} member(s)
                </p>
              </div>
              {encrypted ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1">
                  <ShieldCheck className="w-3 h-3" /> End-to-end encrypted
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-amber-400 border-amber-500/30"
                >
                  Not encrypted
                </Badge>
              )}
            </header>

            <MessageList
              client={client}
              room={activeRoom}
              events={events}
              canLoadMore={canLoadMore}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
            />

            <Composer
              client={client}
              roomId={activeRoom.roomId}
              encrypted={encrypted}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-slate-500 p-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-300 font-medium">Select a conversation</p>
              <p className="text-sm max-w-xs mt-1">
                Choose a chat from the sidebar, or start a new end-to-end
                encrypted conversation with the + button.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
