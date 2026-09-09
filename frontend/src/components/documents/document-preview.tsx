import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Expand,
  FileText,
  Image as ImageIcon,
  Minimize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fileRegistry } from "@/api/documentStore";
import { Hint } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { Document } from "@/types";
import { cn, fileExtension, formatBytes } from "@/lib/utils";

const ZOOM_STEPS = [50, 75, 100, 125, 150, 200];

/**
 * The document viewer chrome: zoom, rotation, pagination and fullscreen.
 *
 * The page area is a placeholder — the real build swaps the inner surface for a
 * PDF.js canvas (or an <img> for photographed documents) using the signed URL
 * returned by GET /documents/:id/file. Everything around it stays as-is.
 */
export function DocumentPreview({
  document: doc,
  className,
  onDownload,
}: {
  document: Document;
  className?: string;
  onDownload?: () => void;
}) {
  const pageCount = doc.pageCount ?? 1;
  const [page, setPage] = useState(1);
  const [zoomIndex, setZoomIndex] = useState(2);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const zoom = ZOOM_STEPS[zoomIndex];
  // Present only for files uploaded in this browser session.
  const fileUrl = fileRegistry.get(doc.id);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-card border border-border bg-surface",
        fullscreen && "fixed inset-3 z-50 shadow-2xl",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-raised px-2 py-1.5">
        <div className="flex items-center gap-0.5">
          <Hint label="Pagina anterioară">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1}
              aria-label="Pagina anterioară"
            >
              <ChevronLeft />
            </Button>
          </Hint>
          <span className="px-1 font-mono text-[11px] tabular-nums text-muted-foreground">
            {page} / {pageCount}
          </span>
          <Hint label="Pagina următoare">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              disabled={page >= pageCount}
              aria-label="Pagina următoare"
            >
              <ChevronRight />
            </Button>
          </Hint>
        </div>

        <span className="mx-1 h-4 w-px bg-border" aria-hidden />

        <div className="flex items-center gap-0.5">
          <Hint label="Micșorează">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setZoomIndex((value) => Math.max(0, value - 1))}
              disabled={zoomIndex === 0}
              aria-label="Micșorează"
            >
              <ZoomOut />
            </Button>
          </Hint>
          <span className="w-11 text-center font-mono text-[11px] tabular-nums text-muted-foreground">
            {zoom}%
          </span>
          <Hint label="Mărește">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setZoomIndex((value) => Math.min(ZOOM_STEPS.length - 1, value + 1))
              }
              disabled={zoomIndex === ZOOM_STEPS.length - 1}
              aria-label="Mărește"
            >
              <ZoomIn />
            </Button>
          </Hint>
          <Hint label="Rotește 90°">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setRotation((value) => (value + 90) % 360)}
              aria-label="Rotește cu 90 de grade"
            >
              <RotateCw />
            </Button>
          </Hint>
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <Hint label="Descarcă originalul">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDownload}
              aria-label="Descarcă originalul"
            >
              <Download />
            </Button>
          </Hint>
          <Hint label={fullscreen ? "Ieși din ecran complet" : "Ecran complet"}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setFullscreen((value) => !value)}
              aria-label={fullscreen ? "Ieși din ecran complet" : "Treci pe ecran complet"}
            >
              {fullscreen ? <Minimize2 /> : <Expand />}
            </Button>
          </Hint>
        </div>
      </div>

      {/* Page area — the real file when we still hold it, a placeholder when
          the record came from a fixture or survived a page reload. */}
      <div className="flex flex-1 items-center justify-center overflow-auto bg-canvas p-6">
        <div
          className="shrink-0 transition-transform duration-200"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: "center",
          }}
        >
          {fileUrl && doc.type === "image" ? (
            <img
              src={fileUrl}
              alt={`Previzualizare pentru ${doc.name}`}
              className="max-h-[70vh] rounded-lg border border-border-strong shadow-2xl"
            />
          ) : fileUrl && doc.type === "pdf" ? (
            <object
              data={`${fileUrl}#page=${page}&toolbar=0&navpanes=0`}
              type="application/pdf"
              className="h-[26rem] w-[19rem] rounded-lg border border-border-strong bg-white shadow-2xl"
              aria-label={`Previzualizare PDF pentru ${doc.name}`}
            >
              <PreviewPlaceholder doc={doc} page={page} pageCount={pageCount} />
            </object>
          ) : (
            <PreviewPlaceholder doc={doc} page={page} pageCount={pageCount} />
          )}
        </div>
      </div>
    </div>
  );
}

/** Shown when there is no file to render — a fixture, or a reloaded session. */
function PreviewPlaceholder({
  doc,
  page,
  pageCount,
}: {
  doc: Document;
  page: number;
  pageCount: number;
}) {
  const Icon = doc.type === "image" ? ImageIcon : FileText;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-border-strong bg-surface-raised text-center shadow-2xl",
        doc.type === "image" ? "h-[19rem] w-[26rem]" : "h-[26rem] w-[19rem]",
      )}
      role="img"
      aria-label={`Previzualizare indisponibilă pentru ${doc.name}, pagina ${page} din ${pageCount}`}
    >
      <Icon className="size-8 text-subtle-foreground" aria-hidden />
      <div className="space-y-1 px-6">
        <p className="text-[13px] font-medium">{doc.name}</p>
        <p className="text-[11px] leading-relaxed text-subtle-foreground">
          Pagina {page} din {pageCount} · {fileExtension(doc.name)}
        </p>
        <p className="text-[11px] leading-relaxed text-subtle-foreground">
          Fișierul original nu este disponibil în această sesiune. Backendul va
          returna aici un URL semnat.
        </p>
      </div>
      <Badge variant="outline">{formatBytes(doc.size)}</Badge>
    </div>
  );
}
