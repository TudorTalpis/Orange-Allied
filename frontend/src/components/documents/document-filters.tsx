import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { documentsApi } from "@/api";
import type { DocumentCategory, DocumentFilters } from "@/types";
import { cn } from "@/lib/utils";

const documentTypes = [
  { value: "all", label: "Toate tipurile" },
  { value: "invoice", label: "Factură" }, { value: "contract", label: "Contract" }, { value: "receipt", label: "Chitanță" },
  { value: "tax_document", label: "Document fiscal" }, { value: "insurance_policy", label: "Poliță de asigurare" },
  { value: "employment_contract", label: "Contract de muncă" }, { value: "bank_statement", label: "Extras de cont" },
  { value: "identity_document", label: "Act de identitate" }, { value: "report", label: "Raport" },
];

const statuses = [
  { value: "all", label: "Orice stare" }, { value: "processed", label: "Procesat" },
  { value: "processing", label: "Se procesează" }, { value: "queued", label: "În așteptare" },
  { value: "needs_review", label: "Necesită verificare" }, { value: "failed", label: "Eșuat" },
];

const fileTypes = [
  { value: "all", label: "Toate formatele" },
  { value: "pdf", label: "Doar PDF" },
  { value: "image", label: "Doar imagini" },
  { value: "docx", label: "Doar Word" },
];

interface FiltersProps {
  filters: DocumentFilters;
  activeCount: number;
  onChange: (patch: Partial<DocumentFilters>) => void;
  onReset: () => void;
}

/** The filter controls, shared by the inline desktop row and the mobile sheet. */
function FilterFields({ filters, onChange }: Omit<FiltersProps, "activeCount" | "onReset">) {
  const [facets, setFacets] = useState<{
    companies: string[];
    currencies: string[];
    categories: DocumentCategory[];
  }>({ companies: [], currencies: [], categories: [] });

  useEffect(() => {
    documentsApi.facets().then(setFacets).catch(() => undefined);
  }, []);

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="filter-doctype">Tip document</Label>
        <Select
          value={filters.documentType ?? "all"}
          onValueChange={(value) =>
            onChange({ documentType: value as DocumentFilters["documentType"] })
          }
        >
          <SelectTrigger id="filter-doctype">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {documentTypes.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-category">Categorie</Label>
        <Select
          value={filters.categoryId ?? "all"}
          onValueChange={(value) => onChange({ categoryId: value })}
        >
          <SelectTrigger id="filter-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate categoriile</SelectItem>
            {facets.categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-status">Stare</Label>
        <Select
          value={filters.status ?? "all"}
          onValueChange={(value) =>
            onChange({ status: value as DocumentFilters["status"] })
          }
        >
          <SelectTrigger id="filter-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-company">Companie</Label>
        <Select
          value={filters.company ?? "all"}
          onValueChange={(value) => onChange({ company: value })}
        >
          <SelectTrigger id="filter-company">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Orice companie</SelectItem>
            {facets.companies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-currency">Monedă</Label>
        <Select
          value={filters.currency ?? "all"}
          onValueChange={(value) => onChange({ currency: value })}
        >
          <SelectTrigger id="filter-currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Orice monedă</SelectItem>
            {facets.currencies.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-filetype">Tip fișier</Label>
        <Select
          value={filters.type ?? "all"}
          onValueChange={(value) =>
            onChange({ type: value as DocumentFilters["type"] })
          }
        >
          <SelectTrigger id="filter-filetype">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fileTypes.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="filter-amount-min">Sumă de la</Label>
          <Input
            id="filter-amount-min"
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={filters.amountMin ?? ""}
            onChange={(event) =>
              onChange({
                amountMin: event.target.value ? Number(event.target.value) : undefined,
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-amount-max">Sumă până la</Label>
          <Input
            id="filter-amount-max"
            type="number"
            inputMode="decimal"
            placeholder="Orice valoare"
            value={filters.amountMax ?? ""}
            onChange={(event) =>
              onChange({
                amountMax: event.target.value ? Number(event.target.value) : undefined,
              })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="filter-date-from">Dată de la</Label>
          <Input
            id="filter-date-from"
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(event) =>
              onChange({ dateFrom: event.target.value || undefined })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-date-to">Dată până la</Label>
          <Input
            id="filter-date-to"
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(event) => onChange({ dateTo: event.target.value || undefined })}
          />
        </div>
      </div>
    </>
  );
}

export function DocumentFiltersBar({
  filters,
  activeCount,
  onChange,
  onReset,
  trailing,
}: FiltersProps & { trailing?: React.ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <label htmlFor="documents-search" className="sr-only">
            Caută documente
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle-foreground"
            aria-hidden
          />
          <Input
            id="documents-search"
            type="search"
            value={filters.query ?? ""}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="Caută după nume, companie sau număr de factură…"
            className="pl-9"
          />
        </div>

        {/* Desktop: expands an inline filter panel. Mobile: opens a drawer. */}
        <Button
          variant={activeCount > 0 ? "subtle" : "secondary"}
          onClick={() => setPanelOpen((open) => !open)}
          className="hidden sm:inline-flex"
          aria-expanded={panelOpen}
          aria-controls="documents-filter-panel"
        >
          <SlidersHorizontal />
          Filtre
          {activeCount > 0 && (
            <Badge variant="primary" className="ml-0.5 px-1.5">
              {activeCount}
            </Badge>
          )}
        </Button>

        <Button
          variant={activeCount > 0 ? "subtle" : "secondary"}
          size="icon"
          onClick={() => setSheetOpen(true)}
          className="sm:hidden"
          aria-label={`Filtre${activeCount > 0 ? `, ${activeCount} active` : ""}`}
        >
          <SlidersHorizontal />
        </Button>

        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X />
            Resetează
          </Button>
        )}

        {trailing && <div className="ml-auto flex items-center gap-2">{trailing}</div>}
      </div>

      {panelOpen && (
        <div
          id="documents-filter-panel"
          className={cn(
            "hidden gap-4 rounded-card border border-border bg-surface p-4 sm:grid",
            "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          )}
        >
          <FilterFields filters={filters} onChange={onChange} />
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="p-4">
          <SheetTitle className="mb-4 text-base font-semibold">Filtre</SheetTitle>
          <div className="grid gap-4 pb-2">
            <FilterFields filters={filters} onChange={onChange} />
          </div>
          <div className="sticky bottom-0 -mx-4 mt-2 flex gap-2 border-t border-border bg-surface px-4 pt-3">
            <Button variant="ghost" className="flex-1" onClick={onReset}>
              Resetează tot
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => setSheetOpen(false)}
            >
              Arată rezultatele
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
