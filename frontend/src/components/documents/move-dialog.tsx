import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DocumentCategory } from "@/types";

export function MoveDialog({
  open,
  onOpenChange,
  categories,
  count,
  onMove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: DocumentCategory[];
  count: number;
  onMove: (categoryId: string) => Promise<void>;
}) {
  const [categoryId, setCategoryId] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function handleMove() {
    if (!categoryId) return;
    setBusy(true);
    try {
      await onMove(categoryId);
      onOpenChange(false);
      setCategoryId("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mută în categorie</DialogTitle>
          <DialogDescription>
            {count === 1
              ? "Alege categoria în care aparține acest document."
              : `Alege categoria în care aparțin aceste ${count} documente.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 px-5 py-3">
          <Label htmlFor="move-category">Categorie</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="move-category">
              <SelectValue placeholder="Selectează o categorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Anulează
          </Button>
          <Button
            variant="primary"
            onClick={handleMove}
            disabled={!categoryId}
            loading={busy}
          >
            Mută
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
