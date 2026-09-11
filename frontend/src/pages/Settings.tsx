import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Bell,
  Bot,
  HardDrive,
  Palette,
  Plug,
  Shield,
  User,
  Workflow,
} from "lucide-react";
import { settingsApi } from "@/api";
import { useSettings } from "@/providers/settings-provider";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/error-state";
import {
  SettingRow,
  SettingsSection,
} from "@/components/settings/settings-section";
import { AISettingsSection } from "@/components/settings/ai-settings";
import { ProcessingSettingsSection } from "@/components/settings/processing-settings";
import { StorageSettingsSection } from "@/components/settings/storage-settings";
import {
  ConnectedServicesSection,
  SecuritySettingsSection,
} from "@/components/settings/security-settings";
import type { AppSettings } from "@/types";
import { initials } from "@/lib/utils";

const tabs = [
  { value: "profile", label: "Profil", icon: User },
  { value: "appearance", label: "Aspect", icon: Palette },
  { value: "ai", label: "AI", icon: Bot },
  { value: "processing", label: "Procesare", icon: Workflow },
  { value: "storage", label: "Stocare", icon: HardDrive },
  { value: "security", label: "Securitate", icon: Shield },
  { value: "notifications", label: "Notificări", icon: Bell },
  { value: "services", label: "Servicii", icon: Plug },
];

export default function SettingsPage() {
  const { settings, loading, error, save, reload } = useSettings();
  const { user, updateProfile } = useAuth();

  const [draft, setDraft] = useState<AppSettings | null>(settings);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? "");

  useEffect(() => setDraft(settings), [settings]);
  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setEmail(user?.email ?? "");
    setJobTitle(user?.jobTitle ?? "");
  }, [user]);

  const dirty =
    draft !== null && settings !== null && JSON.stringify(draft) !== JSON.stringify(settings);

  function patch<K extends keyof AppSettings>(
    section: K,
    changes: Partial<AppSettings[K]>,
  ) {
    setDraft((current) =>
      current
        ? { ...current, [section]: { ...current[section], ...changes } }
        : current,
    );
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    try {
      await save(draft);
      toast.success("Setările au fost salvate");
    } catch (cause) {
      toast.error("Setările nu au putut fi salvate", {
        description: cause instanceof Error ? cause.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleProfileSave(event: React.FormEvent) {
    event.preventDefault();
    await updateProfile({ fullName, email, jobTitle });
    toast.success("Profilul a fost actualizat");
  }

  if (loading || !draft) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <ErrorState
          title="Setările nu au putut fi încărcate"
          message={error}
          onRetry={reload}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-20">
      <PageHeader
        title="Setări"
        description="Configurează profilul, furnizorii AI și modul de procesare a documentelor."
      />

      <Tabs defaultValue="profile">
        <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <TabsList className="w-max">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                <tab.icon aria-hidden />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="profile">
          <SettingsSection
            title="Profil"
            description="Cum apari în spațiul de lucru."
            footer={
              <Button variant="primary" onClick={handleProfileSave}>
                Salvează profilul
              </Button>
            }
          >
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="text-base">
                  {initials(fullName || "DocuAI")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[13px] font-medium">Imagine de profil</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Încărcarea imaginii va fi disponibilă odată cu backendul; până atunci sunt folosite inițialele.
                </p>
                <Button variant="secondary" size="sm" className="mt-2" disabled>
                  Încarcă imagine
                </Button>
              </div>
            </div>

            <SettingRow
              label="Nume complet"
              htmlFor="profile-name"
              control={
                <Input
                  id="profile-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              }
            />
            <SettingRow
              label="Email"
              description="Folosit pentru autentificare și notificări de procesare."
              htmlFor="profile-email"
              control={
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              }
            />
            <SettingRow
              label="Funcție"
              htmlFor="profile-title"
              control={
                <Input
                  id="profile-title"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                />
              }
            />
            <SettingRow
              label="Organizație"
              description="Contactează un proprietar pentru a schimba numele spațiului de lucru."
              control={
                <Input value={user?.organisation ?? ""} readOnly disabled />
              }
            />
          </SettingsSection>
        </TabsContent>

        <TabsContent value="appearance">
          <SettingsSection
            title="Aspect"
            description="Această versiune include o singură temă întunecată, optimizată pentru sesiuni lungi de citire."
          >
            <SettingRow
              label="Temă"
              description="O temă luminoasă nu face parte din acest prototip."
              htmlFor="theme"
              control={
                <Select
                  value={draft.appearance.theme}
                  onValueChange={(value) =>
                    patch("appearance", { theme: value as "dark" | "system" })
                  }
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Întunecată</SelectItem>
                    <SelectItem value="system">La fel ca sistemul</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
            <SettingRow
              label="Densitate"
              description="Modul compact reduce spațiul dintre rânduri și în interiorul cardurilor."
              htmlFor="density"
              control={
                <Select
                  value={draft.appearance.density}
                  onValueChange={(value) =>
                    patch("appearance", {
                      density: value as "comfortable" | "compact",
                    })
                  }
                >
                  <SelectTrigger id="density">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comfortable">Confortabilă</SelectItem>
                    <SelectItem value="compact">Compactă</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
            <SettingRow
              label="Redu animațiile"
              description="Elimină tranzițiile și animația de tastare a asistentului."
              htmlFor="reduce-motion"
              control={
                <div className="flex sm:justify-end">
                  <Switch
                    id="reduce-motion"
                    checked={draft.appearance.reduceMotion}
                    onCheckedChange={(checked) =>
                      patch("appearance", { reduceMotion: checked })
                    }
                  />
                </div>
              }
            />
          </SettingsSection>
        </TabsContent>

        <TabsContent value="ai">
          <AISettingsSection
            value={draft.ai}
            onChange={(changes) => patch("ai", changes)}
          />
        </TabsContent>

        <TabsContent value="processing">
          <ProcessingSettingsSection
            value={draft.processing}
            onChange={(changes) => patch("processing", changes)}
          />
        </TabsContent>

        <TabsContent value="storage">
          <StorageSettingsSection value={draft.storage} />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettingsSection
            value={draft.security}
            onChange={(changes) => patch("security", changes)}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <SettingsSection
            title="Notificări"
            description="Despre ce ești anunțat și când."
          >
            {(
              [
                {
                  key: "processingComplete" as const,
                  label: "Procesare finalizată",
                  description: "Un document a trecut prin toate etapele fluxului.",
                },
                {
                  key: "processingFailed" as const,
                  label: "Procesare eșuată",
                  description: "O sarcină a eșuat și așteaptă o reîncercare.",
                },
                {
                  key: "weeklyDigest" as const,
                  label: "Rezumat săptămânal",
                  description: "Un rezumat de luni cu ce s-a procesat săptămâna trecută.",
                },
                {
                  key: "productUpdates" as const,
                  label: "Noutăți despre produs",
                  description: "Funcționalități noi și schimbări în fluxul de procesare.",
                },
              ]
            ).map((option) => (
              <SettingRow
                key={option.key}
                label={option.label}
                description={option.description}
                htmlFor={`notify-${option.key}`}
                control={
                  <div className="flex sm:justify-end">
                    <Switch
                      id={`notify-${option.key}`}
                      checked={draft.notifications[option.key]}
                      onCheckedChange={(checked) =>
                        patch("notifications", { [option.key]: checked })
                      }
                    />
                  </div>
                }
              />
            ))}
          </SettingsSection>
        </TabsContent>

        <TabsContent value="services">
          <ConnectedServicesSection
            services={draft.connectedServices}
            onToggle={async (id, connected) => {
              await settingsApi.toggleService(id, connected);
              toast.success(connected ? "Serviciul a fost conectat" : "Serviciul a fost deconectat");
              reload();
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Sticky save bar — settings save as one document. */}
      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-md lg:pl-64">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
            <p className="text-[13px] text-muted-foreground">
              Ai modificări nesalvate.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setDraft(settings)}>
                Renunță
              </Button>
              <Button variant="primary" onClick={handleSave} loading={saving}>
                Salvează modificările
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
