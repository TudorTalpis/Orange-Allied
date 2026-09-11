import { Link } from "react-router-dom";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/layout/brand";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Brand />
      <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-surface-raised">
        <FileQuestion className="size-5 text-muted-foreground" aria-hidden />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Pagina nu a fost găsită</h1>
        <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          Această pagină nu există în spațiul de lucru. Este posibil să fi fost
          redenumită sau ca linkul să nu mai fie actual.
        </p>
      </div>
      <Button variant="primary" asChild>
        <Link to="/dashboard">
          <ArrowLeft />
          Înapoi la panoul de control
        </Link>
      </Button>
    </div>
  );
}
