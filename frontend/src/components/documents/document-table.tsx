import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import { DocumentStatusBadge } from "@/components/common/status-badge";
import type {
  Document,
  DocumentCategory,
  DocumentSort,
  DocumentSortField,
} from "@/types";
import { cn, fileExtension, formatBytes, formatCurrency, formatDate } from "@/lib/utils";
import { DocumentActions, type DocumentActionHandlers } from "./document-actions";

interface DocumentTableProps {
  documents: Document[];
  categories: DocumentCategory[];
  sort: DocumentSort;
  onSort: (field: DocumentSortField) => void;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  handlers: DocumentActionHandlers;
}

const columns: Array<{
  field: DocumentSortField | null;
  label: string;
  className?: string;
}> = [
  { field: "name", label: "Nume" }, { field: null, label: "Tip", className: "hidden xl:table-cell" },
  { field: null, label: "Categorie", className: "hidden lg:table-cell" }, { field: "company", label: "Companie", className: "hidden md:table-cell" },
  { field: "uploadedAt", label: "Dată" }, { field: "amount", label: "Sumă", className: "text-right" }, { field: "status", label: "Stare" },
];

function SortIcon({ active, direction }: { active: boolean; direction: "asc" | "desc" }) {
  if (!active) return <ChevronsUpDown className="size-3 opacity-40" aria-hidden />;
  return direction === "asc" ? (
    <ArrowUp className="size-3 text-brand-bright" aria-hidden />
  ) : (
    <ArrowDown className="size-3 text-brand-bright" aria-hidden />
  );
}

export function DocumentTable({
  documents,
  categories,
  sort,
  onSort,
  selected,
  onToggleSelect,
  onToggleAll,
  handlers,
}: DocumentTableProps) {
  const allSelected = documents.length > 0 && selected.size === documents.length;
  const someSelected = selected.size > 0 && !allSelected;

  function categoryName(id?: string) {
    return categories.find((category) => category.id === id)?.name ?? "Neclasificat";
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] text-left text-[13px]">
        <caption className="sr-only">
          Documente, sortabile după nume, companie, dată, sumă și stare
        </caption>
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-wider text-subtle-foreground">
            <th scope="col" className="w-10 px-4 py-2.5">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={onToggleAll}
                aria-label="Selectează toate documentele de pe această pagină"
              />
            </th>
            {columns.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={cn("px-3 py-2.5 font-medium", column.className)}
                aria-sort={
                  column.field && sort.field === column.field
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                {column.field ? (
                  <button
                    type="button"
                    onClick={() => onSort(column.field as DocumentSortField)}
                    className={cn(
                      "flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-foreground",
                      column.className?.includes("text-right") && "ml-auto",
                    )}
                  >
                    {column.label}
                    <SortIcon
                      active={sort.field === column.field}
                      direction={sort.direction}
                    />
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
            <th scope="col" className="w-12 px-4 py-2.5">
              <span className="sr-only">Acțiuni</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {documents.map((doc) => (
            <tr
              key={doc.id}
              data-selected={selected.has(doc.id) || undefined}
              className="transition-colors hover:bg-surface-raised data-[selected]:bg-primary-subtle/60"
            >
              <td className="px-4 py-3">
                <Checkbox
                  checked={selected.has(doc.id)}
                  onCheckedChange={() => onToggleSelect(doc.id)}
                  aria-label={`Select ${doc.name}`}
                />
              </td>
              <td className="px-3 py-3">
                <Link
                  to={`/documents/${doc.id}`}
                  className="flex items-center gap-2.5 underline-offset-4 hover:underline"
                >
                  <FileTypeIcon type={doc.type} size="sm" />
                  <span className="min-w-0">
                    <span className="block max-w-64 truncate font-medium">
                      {doc.name}
                    </span>
                    <span className="block text-[11px] text-subtle-foreground">
                      {formatBytes(doc.size)}
                      {doc.pageCount ? ` · ${doc.pageCount} pages` : ""}
                    </span>
                  </span>
                </Link>
              </td>
              <td className="hidden px-3 py-3 font-mono text-[11px] text-muted-foreground xl:table-cell">
                {fileExtension(doc.name)}
              </td>
              <td className="hidden px-3 py-3 text-muted-foreground lg:table-cell">
                {categoryName(doc.categoryId)}
              </td>
              <td className="hidden px-3 py-3 text-muted-foreground md:table-cell">
                {doc.metadata?.company ?? "—"}
              </td>
              <td className="px-3 py-3 tabular-nums text-muted-foreground">
                {formatDate(doc.metadata?.date ?? doc.uploadedAt)}
              </td>
              <td className="px-3 py-3 text-right font-mono tabular-nums">
                {formatCurrency(doc.metadata?.amount, doc.metadata?.currency)}
              </td>
              <td className="px-3 py-3">
                <DocumentStatusBadge status={doc.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <DocumentActions document={doc} handlers={handlers} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
