import { useCallback, useRef, useState } from "react";
import { CloudUpload, FileText, FileType2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";
import { cn, formatBytes } from "@/lib/utils";

export function UploadDropzone({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      if (disabled) return;
      onFiles(Array.from(event.dataTransfer.files));
    },
    [onFiles, disabled],
  );

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        dragDepth.current -= 1;
        if (dragDepth.current <= 0) setDragging(false);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className={cn(
        "relative overflow-hidden rounded-card border border-dashed border-border bg-surface px-6 py-12 text-center transition-colors",
        dragging && "border-primary bg-primary-subtle",
        disabled && "opacity-60",
      )}
    >
      {dragging && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(195,22,58,0.18),transparent)]"
        />
      )}

      <div className="relative flex flex-col items-center gap-3">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-xl border transition-colors",
            dragging
              ? "border-primary bg-primary-muted text-brand-bright"
              : "border-border bg-surface-raised text-muted-foreground",
          )}
          aria-hidden
        >
          <CloudUpload className="size-5" />
        </span>

        <div className="space-y-1">
          <h2 className="text-[15px] font-semibold">
            {dragging ? "Eliberează pentru a adăuga fișierele" : "Trage documentele aici"}
          </h2>
          <p className="text-[13px] text-muted-foreground">
            sau alege fișierele — poți selecta mai multe simultan
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={config.acceptedExtensions.join(",")}
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            onFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
          aria-label="Alege documentele pentru încărcare"
        />

        <Button
          variant="primary"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="mt-1"
        >
          Alege fișiere
        </Button>

        <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-subtle-foreground">
          <li className="flex items-center gap-1.5">
            <FileText className="size-3" aria-hidden />
            PDF
          </li>
          <li className="flex items-center gap-1.5">
            <ImageIcon className="size-3" aria-hidden />
            JPG · JPEG · PNG
          </li>
          <li className="flex items-center gap-1.5">
            <FileType2 className="size-3" aria-hidden />
            DOCX
          </li>
          <li>Dimensiune maximă fișier: {formatBytes(config.maxUploadBytes, 0)}</li>
        </ul>
      </div>
    </div>
  );
}
