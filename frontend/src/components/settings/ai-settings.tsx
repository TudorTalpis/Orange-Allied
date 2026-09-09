import { Cloud, Cpu, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cloudModels, localModels } from "@/data/mockSettings";
import type { AISettings, CloudProviderId } from "@/types";
import { cn } from "@/lib/utils";
import { SettingRow, SettingsSection } from "./settings-section";

const cloudProviders: Array<{ id: CloudProviderId; label: string }> = [
  { id: "openai", label: "OpenAI" },
  { id: "anthropic", label: "Anthropic" },
  { id: "google", label: "Google" },
  { id: "mistral", label: "Mistral" },
];

/**
 * Provider configuration only — no key is entered or stored here. The backend
 * holds credentials; this screen chooses which configured provider to use.
 */
export function AISettingsSection({
  value,
  onChange,
}: {
  value: AISettings;
  onChange: (patch: Partial<AISettings>) => void;
}) {
  const isLocal = value.providerKind === "local";
  const models = isLocal
    ? localModels
    : cloudModels.filter((model) => model.provider === value.cloudProvider);

  return (
    <SettingsSection
      title="Furnizor AI"
      description="Alege unde rulează inferența. Local păstrează fiecare document pe propriul hardware; cloud oferă în schimb modele mai mari."
    >
      {/* Provider kind */}
      <fieldset>
        <legend className="sr-only">Tip de furnizor</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              {
                kind: "cloud" as const,
                icon: Cloud,
                title: "Cloud",
                body: "Modele găzduite, prin API. Cea mai bună calitate, dar documentele ies din infrastructura ta.",
              },
              {
                kind: "local" as const,
                icon: Cpu,
                title: "Local",
                body: "Modele servite de Ollama pe propria mașină. Nimic nu părăsește rețeaua.",
              },
            ]
          ).map((option) => (
            <button
              key={option.kind}
              type="button"
              role="radio"
              aria-checked={value.providerKind === option.kind}
              onClick={() => onChange({ providerKind: option.kind })}
              disabled={value.keepDataLocal && option.kind === "cloud"}
              className={cn(
                "rounded-xl border p-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                value.providerKind === option.kind
                  ? "border-primary-border bg-primary-subtle"
                  : "border-border bg-surface-raised hover:border-border-strong",
              )}
            >
              <span className="flex items-center gap-2">
                <option.icon
                  className={cn(
                    "size-4",
                    value.providerKind === option.kind
                      ? "text-brand-bright"
                      : "text-muted-foreground",
                  )}
                  aria-hidden
                />
                <span className="text-[13px] font-medium">{option.title}</span>
              </span>
              <span className="mt-1 block text-[12px] leading-relaxed text-muted-foreground">
                {option.body}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {!isLocal && (
        <SettingRow
          label="Furnizor cloud"
          description="Credențialele se configurează pe backend, niciodată în browser."
          htmlFor="ai-cloud-provider"
          control={
            <Select
              value={value.cloudProvider}
              onValueChange={(next) =>
                onChange({
                  cloudProvider: next as CloudProviderId,
                  cloudModel:
                    cloudModels.find((model) => model.provider === next)?.id ??
                    value.cloudModel,
                })
              }
            >
              <SelectTrigger id="ai-cloud-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cloudProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
      )}

      {isLocal && (
        <SettingRow
          label="Adresa Ollama"
          description="Unde poate fi contactat runtime-ul local."
          htmlFor="ai-endpoint"
          control={
            <Input
              id="ai-endpoint"
              value={value.localEndpoint}
              onChange={(event) => onChange({ localEndpoint: event.target.value })}
              placeholder="http://localhost:11434"
            />
          }
        />
      )}

      <SettingRow
        label="Model"
        description="Folosit pentru clasificare, extragere și răspunsurile asistentului."
        htmlFor="ai-model"
        control={
          <Select
            value={isLocal ? value.localModel : value.cloudModel}
            onValueChange={(next) =>
              onChange(isLocal ? { localModel: next } : { cloudModel: next })
            }
          >
            <SelectTrigger id="ai-model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {/* Selected model detail */}
      {(() => {
        const selected = models.find(
          (model) => model.id === (isLocal ? value.localModel : value.cloudModel),
        );
        if (!selected) return null;
        return (
          <div className="rounded-lg border border-border bg-surface-raised p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="size-3.5 text-brand-bright" aria-hidden />
              <span className="text-[13px] font-medium">{selected.label}</span>
              {selected.recommended && <Badge variant="primary">Recomandat</Badge>}
              <span className="ml-auto font-mono text-[11px] text-subtle-foreground">
                {(selected.contextWindow / 1000).toFixed(0)}k context
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              {selected.description}
            </p>
          </div>
        );
      })()}

      <SettingRow
        label="Temperatură"
        description="Valorile mici păstrează extragerea deterministă; cele mari fac rezumatele mai variate."
        control={
          <div className="flex items-center gap-3">
            <Slider
              value={[value.temperature]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([next]) => onChange({ temperature: next })}
              aria-label="Temperatură"
            />
            <span className="w-8 shrink-0 text-right font-mono text-[12px] tabular-nums">
              {value.temperature.toFixed(1)}
            </span>
          </div>
        }
      />

      <SettingRow
        label="Număr maxim de tokenuri"
        htmlFor="ai-max-tokens"
        control={
          <Input
            id="ai-max-tokens"
            type="number"
            min={256}
            max={8192}
            step={256}
            value={value.maxTokens}
            onChange={(event) => onChange({ maxTokens: Number(event.target.value) })}
          />
        }
      />

      <div className="space-y-4 border-t border-border pt-4">
        <SettingRow
          label="Păstrează toată procesarea local"
          description="Forțează furnizorul local și dezactivează complet selecția cloud."
          htmlFor="ai-keep-local"
          control={
            <div className="flex sm:justify-end">
              <Switch
                id="ai-keep-local"
                checked={value.keepDataLocal}
                onCheckedChange={(checked) =>
                  onChange({
                    keepDataLocal: checked,
                    providerKind: checked ? "local" : value.providerKind,
                  })
                }
              />
            </div>
          }
        />
        <SettingRow
          label="Transmite răspunsul în flux"
          description="Arată răspunsul pe măsură ce este generat, nu dintr-odată."
          htmlFor="ai-stream"
          control={
            <div className="flex sm:justify-end">
              <Switch
                id="ai-stream"
                checked={value.streamResponses}
                onCheckedChange={(checked) => onChange({ streamResponses: checked })}
              />
            </div>
          }
        />
        <SettingRow
          label="Citează întotdeauna sursele"
          description="Fiecare răspuns enumeră documentele din care provine."
          htmlFor="ai-citations"
          control={
            <div className="flex sm:justify-end">
              <Switch
                id="ai-citations"
                checked={value.citationsEnabled}
                onCheckedChange={(checked) => onChange({ citationsEnabled: checked })}
              />
            </div>
          }
        />
      </div>
    </SettingsSection>
  );
}
