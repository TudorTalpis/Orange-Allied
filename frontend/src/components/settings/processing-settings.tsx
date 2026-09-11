import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { embeddingProviders, ocrProviders } from "@/data/mockSettings";
import type {
  EmbeddingProviderId,
  OcrProviderId,
  ProcessingSettings,
} from "@/types";
import { SettingRow, SettingsSection } from "./settings-section";

const languages = [
  { code: "en", label: "Engleză" },
  { code: "ro", label: "Română" },
  { code: "de", label: "Germană" },
  { code: "fr", label: "Franceză" },
  { code: "ru", label: "Rusă" },
];

export function ProcessingSettingsSection({
  value,
  onChange,
}: {
  value: ProcessingSettings;
  onChange: (patch: Partial<ProcessingSettings>) => void;
}) {
  function toggleLanguage(code: string) {
    const next = value.ocrLanguages.includes(code)
      ? value.ocrLanguages.filter((entry) => entry !== code)
      : [...value.ocrLanguages, code];
    onChange({ ocrLanguages: next.length > 0 ? next : [code] });
  }

  const ocr = ocrProviders.find((provider) => provider.id === value.ocrProvider);
  const embedding = embeddingProviders.find(
    (provider) => provider.id === value.embeddingProvider,
  );

  return (
    <SettingsSection
      title="Procesare"
      description="Cum sunt citite, fragmentate și indexate documentele pe parcursul fluxului."
    >
      <SettingRow
        label="Furnizor OCR"
        description={ocr?.description}
        htmlFor="ocr-provider"
        control={
          <Select
            value={value.ocrProvider}
            onValueChange={(next) => onChange({ ocrProvider: next as OcrProviderId })}
          >
            <SelectTrigger id="ocr-provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ocrProviders.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <fieldset className="space-y-2">
        <legend className="text-[13px] font-medium">Limbi OCR</legend>
        <p className="text-[12px] text-muted-foreground">
          Acuratețea recunoașterii crește dacă limbile așteptate sunt declarate.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {languages.map((language) => {
            const active = value.ocrLanguages.includes(language.code);
            return (
              <button
                key={language.code}
                type="button"
                onClick={() => toggleLanguage(language.code)}
                aria-pressed={active}
                className="rounded-full transition-transform hover:scale-[1.02]"
              >
                <Badge variant={active ? "primary" : "outline"}>
                  {language.label}
                </Badge>
              </button>
            );
          })}
        </div>
      </fieldset>

      <SettingRow
        label="Furnizor de embedding-uri"
        description={embedding?.description}
        htmlFor="embedding-provider"
        control={
          <Select
            value={value.embeddingProvider}
            onValueChange={(next) =>
              onChange({ embeddingProvider: next as EmbeddingProviderId })
            }
          >
            <SelectTrigger id="embedding-provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {embeddingProviders.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="chunk-size" className="text-[13px] font-medium">
            Dimensiunea fragmentului
          </label>
          <Input
            id="chunk-size"
            type="number"
            min={200}
            max={2000}
            step={50}
            value={value.chunkSize}
            onChange={(event) => onChange({ chunkSize: Number(event.target.value) })}
          />
          <p className="text-[11px] text-subtle-foreground">
            Tokenuri per fragment vectorial.
          </p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="chunk-overlap" className="text-[13px] font-medium">
            Suprapunerea fragmentelor
          </label>
          <Input
            id="chunk-overlap"
            type="number"
            min={0}
            max={400}
            step={10}
            value={value.chunkOverlap}
            onChange={(event) =>
              onChange({ chunkOverlap: Number(event.target.value) })
            }
          />
          <p className="text-[11px] text-subtle-foreground">
            Suprapunerea evită tăierea propozițiilor la mijloc.
          </p>
        </div>
      </div>

      <SettingRow
        label="Prag de verificare"
        description="Câmpurile extrase sub această încredere sunt marcate pentru verificare umană."
        control={
          <div className="flex items-center gap-3">
            <Slider
              value={[value.requireReviewBelowConfidence]}
              min={0.4}
              max={0.95}
              step={0.05}
              onValueChange={([next]) =>
                onChange({ requireReviewBelowConfidence: next })
              }
              aria-label="Prag de verificare"
            />
            <span className="w-9 shrink-0 text-right font-mono text-[12px] tabular-nums">
              {Math.round(value.requireReviewBelowConfidence * 100)}%
            </span>
          </div>
        }
      />

      <div className="space-y-4 border-t border-border pt-4">
        <SettingRow
          label="Procesează la încărcare"
          description="Pornește fluxul imediat ce fișierul ajunge, în loc să îl pună în așteptare."
          htmlFor="auto-process"
          control={
            <div className="flex sm:justify-end">
              <Switch
                id="auto-process"
                checked={value.autoProcessOnUpload}
                onCheckedChange={(checked) =>
                  onChange({ autoProcessOnUpload: checked })
                }
              />
            </div>
          }
        />
        <SettingRow
          label="Clasifică automat"
          description="Prezice clasa documentului în loc să întrebe la fiecare încărcare."
          htmlFor="auto-classify"
          control={
            <div className="flex sm:justify-end">
              <Switch
                id="auto-classify"
                checked={value.autoClassify}
                onCheckedChange={(checked) => onChange({ autoClassify: checked })}
              />
            </div>
          }
        />
        <SettingRow
          label="Reîncearcă sarcinile eșuate"
          description="Reîncearcă automat o sarcină eșuată de până la trei ori înainte de a renunța."
          htmlFor="auto-retry"
          control={
            <div className="flex sm:justify-end">
              <Switch
                id="auto-retry"
                checked={value.retryFailedJobs}
                onCheckedChange={(checked) => onChange({ retryFailedJobs: checked })}
              />
            </div>
          }
        />
      </div>
    </SettingsSection>
  );
}
