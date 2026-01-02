"use client";

import { useEffect, useState } from "react";
import { ConnectedClient } from "../types";
import { fetchConnectedClients } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, User, Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ConnectedClientsListProps {
  onSelectClient?: (clientId: string) => void;
  selectedClientId?: string;
}

export function ConnectedClientsList({ onSelectClient, selectedClientId }: ConnectedClientsListProps) {
  const [clients, setClients] = useState<ConnectedClient[]>([]);
  const [loading, setLoading] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    try {
      const result = await fetchConnectedClients();
      if (result.success) {
        setClients(result.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
    // Optional: Poll every 10 seconds
    const interval = setInterval(loadClients, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Clients đang kết nối ({clients.length})
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={loadClients} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {clients.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8 flex flex-col items-center gap-2">
                <Monitor className="h-8 w-8 opacity-20" />
                <p>Không có client nào đang kết nối</p>
              </div>
            ) : (
              clients.map((client) => (
                <div
                  key={client.clientId}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-md cursor-pointer transition-all",
                    selectedClientId === client.clientId 
                      ? "bg-primary/10 border-primary" 
                      : "hover:bg-accent hover:border-accent-foreground/20"
                  )}
                  onClick={() => onSelectClient?.(client.clientId)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      client.user ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    )}>
                      <User className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {client.user?.name || "Khách vãng lai"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono truncate" title={client.clientId}>
                        {client.clientId}
                      </p>
                    </div>
                  </div>
                  {client.user && <Badge variant="secondary" className="ml-2 shrink-0">User</Badge>}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
