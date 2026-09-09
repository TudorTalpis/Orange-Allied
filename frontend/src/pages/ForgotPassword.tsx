import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InlineError } from "@/components/common/error-state";
import { authApi } from "@/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Linkul de resetare nu a putut fi trimis.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-success-border bg-success-muted">
          <MailCheck className="size-5 text-success" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Verifică e-mailul</h1>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            If an account exists for{" "}
            <span className="text-foreground">{email}</span>, un link de resetare este
            pe drum. Linkul expiră în 30 de minute.
          </p>
        </div>
        <div className="space-y-2">
          <Button variant="secondary" className="w-full" onClick={() => setSent(false)}>
            Folosește alt e-mail
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link to="/login">
              <ArrowLeft />
              Înapoi la autentificare
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Resetează parola</h1>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Introdu e-mailul cu care te-ai înregistrat și îți trimitem un link
          pentru alegerea unei parole noi.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <InlineError message={error} />}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(error) || undefined}
            placeholder="tu@companie.ro"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={submitting}
        >
          Trimite linkul de resetare
        </Button>
      </form>

      <Button variant="ghost" asChild className="w-full">
        <Link to="/login">
          <ArrowLeft />
          Înapoi la autentificare
        </Link>
      </Button>
    </div>
  );
}
