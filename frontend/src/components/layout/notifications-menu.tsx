import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, CircleAlert, Cpu, ShieldAlert, Sparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { notificationsApi } from "@/api";
import type { AppNotification, NotificationKind } from "@/types";
import { cn, formatRelativeTime } from "@/lib/utils";

const kindIcon: Record<NotificationKind, typeof Bell> = {
  processing: Cpu,
  system: CircleAlert,
  ai: Sparkles,
  security: ShieldAlert,
};

export function NotificationsMenu() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    notificationsApi.list().then(setNotifications).catch(() => setNotifications([]));
  }, []);

  const unread = notifications.filter((notification) => !notification.read).length;

  async function handleMarkAll() {
    await notificationsApi.markAllRead();
    setNotifications(await notificationsApi.list());
  }

  async function handleOpen(notification: AppNotification) {
    await notificationsApi.markRead(notification.id);
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item,
      ),
    );
    setOpen(false);
    if (notification.href) navigate(notification.href);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          aria-label={
            unread > 0 ? `Notificări, ${unread} necitite` : "Notificări"
          }
        >
          <Bell />
          {unread > 0 && (
            <span
              className="absolute right-1 top-1 size-1.5 rounded-full bg-brand-bright ring-2 ring-background"
              aria-hidden
            />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <h2 className="text-[13px] font-semibold">Notificări</h2>
          {unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Marchează toate ca citite
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <BellOff className="size-5 text-subtle-foreground" aria-hidden />
            <p className="text-[13px] text-muted-foreground">Ai parcurs toate notificările.</p>
          </div>
        ) : (
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = kindIcon[notification.kind];
              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => handleOpen(notification)}
                    className="flex w-full gap-3 px-3 py-3 text-left transition-colors hover:bg-surface-raised"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border",
                        notification.read
                          ? "border-border bg-surface-raised text-subtle-foreground"
                          : "border-primary-border bg-primary-subtle text-brand-bright",
                      )}
                      aria-hidden
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "truncate text-[13px]",
                            notification.read ? "text-muted-foreground" : "font-medium text-foreground",
                          )}
                        >
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <span className="size-1.5 shrink-0 rounded-full bg-brand-bright" aria-hidden />
                        )}
                      </span>
                      <span className="mt-0.5 block text-[12px] leading-relaxed text-muted-foreground">
                        {notification.body}
                      </span>
                      <span className="mt-1 block text-[11px] text-subtle-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
