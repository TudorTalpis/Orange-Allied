import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InlineError } from "@/components/common/error-state";
import { DynamicIcon } from "@/components/common/icon";
import { categoryColors, categoryIcons } from "@/data/mockCategories";
import type { CreateCategoryPayload, DocumentCategory } from "@/types";
import { cn } from "@/lib/utils";

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing; absent when creating. */
  category?: DocumentCategory | null;
  onSubmit: (payload: CreateCategoryPayload) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(categoryIcons[0]);
  const [color, setColor] = useState(categoryColors[0]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
    setIcon(category?.icon ?? categoryIcons[0]);
    setColor(category?.color ?? categoryColors[0]);
    setError(null);
  }, [open, category]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSubmit({ name, description, icon, color });
      onOpenChange(false);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Categoria nu a putut fi salvată.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {category ? "Editează categoria" : "Creează o categorie"}
            </DialogTitle>
            <DialogDescription>
              Categoriile grupează documentele pentru navigare și îi dau
              asistentului o modalitate de a-și restrânge căutarea.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-3">
            {error && <InlineError message={error} />}

            <div className="space-y-1.5">
              <Label htmlFor="category-name">Nume</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Comenzi de achiziție"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-description">Descriere</Label>
              <Textarea
                id="category-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ce documente aparțin acestei categorii?"
                rows={2}
              />
            </div>

            <fieldset className="space-y-1.5">
              <legend className="text-[13px] font-medium">Pictogramă</legend>
              <div className="flex flex-wrap gap-1.5">
                {categoryIcons.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setIcon(option)}
                    aria-label={`Pictograma ${option}`}
                    aria-pressed={icon === option}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg border transition-colors",
                      icon === option
                        ? "border-primary bg-primary-subtle text-brand-bright"
                        : "border-border bg-surface-raised text-muted-foreground hover:border-border-strong",
                    )}
                  >
                    <DynamicIcon name={option} className="size-4" />
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-1.5">
              <legend className="text-[13px] font-medium">Culoare</legend>
              <div className="flex flex-wrap gap-1.5">
                {categoryColors.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setColor(option)}
                    aria-label={`Culoarea ${option}`}
                    aria-pressed={color === option}
                    className={cn(
                      "size-8 rounded-lg border-2 transition-transform",
                      color === option
                        ? "border-foreground scale-105"
                        : "border-transparent hover:scale-105",
                    )}
                    style={{ backgroundColor: option }}
                  />
                ))}
              </div>
            </fieldset>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Anulează
            </Button>
            <Button type="submit" variant="primary" loading={busy}>
              {category ? "Salvează modificările" : "Creează categoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
