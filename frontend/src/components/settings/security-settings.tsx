import { useState } from "react";
import { toast } from "sonner";
import { Laptop, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { settingsApi } from "@/api";
import { useAsync } from "@/hooks/useAsync";
import { LoadingBlock } from "@/components/common/loading-state";
import type { ConnectedService, SecuritySettings } from "@/types";
import { DynamicIcon } from "@/components/common/icon";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { SettingRow, SettingsSection } from "./settings-section";

export function SecuritySettingsSection({
  value,
  onChange,
}: {
  value: SecuritySettings;
  onChange: (patch: Partial<SecuritySettings>) => void;
}) {
  const sessions = useAsync(() => settingsApi.sessions(), []);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await settingsApi.changePassword(current, next);
      toast.success("Parola a fost actualizată");
      setCurrent("");
      setNext("");
      onChange({ passwordUpdatedAt: new Date().toISOString() });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsSection
      title="Securitate"
      description="Parolă, autentificare în doi pași și dispozitivele conectate la acest spațiu de lucru."
    >
      <form onSubmit={changePassword} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="current-password" className="text-[13px] font-medium">
              Parola curentă
            </label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="text-[13px] font-medium">
              Parola nouă
            </label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              required
              minLength={8}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11.5px] text-subtle-foreground">
            Modificată ultima dată la {formatDate(value.passwordUpdatedAt, "long")}
          </p>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            loading={saving}
            disabled={!current || next.length < 8}
          >
            Schimbă parola
          </Button>
        </div>
      </form>

      <div className="border-t border-border pt-4">
        <SettingRow
          label="Autentificare în doi pași"
          description="Cere un al doilea factor dintr-o aplicație de autentificare la conectare."
          htmlFor="twofactor"
          control={
            <div className="flex items-center gap-2 sm:justify-end">
              {value.twoFactorEnabled && (
                <Badge variant="success">
                  <Shield className="size-3" aria-hidden />
                  Activă
                </Badge>
              )}
              <Switch
                id="twofactor"
                checked={value.twoFactorEnabled}
                onCheckedChange={(checked) => onChange({ twoFactorEnabled: checked })}
              />
            </div>
          }
        />
      </div>

      <div className="space-y-2.5 border-t border-border pt-4">
        <h3 className="text-[13px] font-medium">Sesiuni active</h3>
        {sessions.loading && <LoadingBlock />}
        {sessions.data && (
          <ul className="space-y-1.5">
            {sessions.data.map((session) => (
              <li
                key={session.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-3 py-2.5"
              >
                <span className="text-muted-foreground" aria-hidden>
                  {session.device.toLowerCase().includes("iphone") ? (
                    <Smartphone className="size-4" />
                  ) : (
                    <Laptop className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[13px] font-medium">
                    <span className="truncate">{session.device}</span>
                    {session.current && <Badge variant="primary">Acest dispozitiv</Badge>}
                  </p>
                  <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                    {session.browser} · {session.location} · activ{" "}
                    {formatRelativeTime(session.lastActiveAt)}
                  </p>
                </div>
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await settingsApi.revokeSession(session.id);
                      toast.success("Sesiune revocată");
                      sessions.reload();
                    }}
                  >
                    Revocă
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </SettingsSection>
  );
}

export function ConnectedServicesSection({
  services,
  onToggle,
}: {
  services: ConnectedService[];
  onToggle: (id: string, connected: boolean) => void;
}) {
  return (
    <SettingsSection
      title="Servicii conectate"
      description="Surse din care se pot importa documente și runtime-uri pe care fluxul le poate accesa."
    >
      <ul className="space-y-2">
        {services.map((service) => (
          <li
            key={service.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-3 py-3"
          >
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground"
              aria-hidden
            >
              <DynamicIcon name={service.icon} className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium">{service.name}</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                {service.description}
                {service.connected && service.lastSyncedAt && (
                  <> · sincronizat {formatRelativeTime(service.lastSyncedAt)}</>
                )}
              </p>
            </div>
            <Button
              variant={service.connected ? "ghost" : "secondary"}
              size="sm"
              onClick={() => onToggle(service.id, !service.connected)}
            >
              {service.connected ? "Deconectează" : "Conectează"}
            </Button>
          </li>
        ))}
      </ul>
    </SettingsSection>
  );
}
