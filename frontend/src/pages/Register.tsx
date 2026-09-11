import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InlineError } from "@/components/common/error-state";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

interface Rule {
  label: string;
  test: (value: string) => boolean;
}

const rules: Rule[] = [
  { label: "Cel puțin 8 caractere", test: (value) => value.length >= 8 },
  { label: "O cifră", test: (value) => /\d/.test(value) },
  { label: "O literă mare", test: (value) => /[A-Z]/.test(value) },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const satisfied = useMemo(
    () => rules.map((rule) => rule.test(password)),
    [password],
  );
  const passwordsMatch = confirm.length > 0 && password === confirm;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!satisfied.every(Boolean)) {
      setError("Parola nu îndeplinește încă toate cerințele.");
      return;
    }
    if (!passwordsMatch) {
      setError("Cele două parole nu coincid.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ fullName, email, password });
      navigate("/dashboard", { replace: true });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Contul nu a putut fi creat.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Creează spațiul tău de lucru</h1>
        <p className="text-[13px] text-muted-foreground">
          Începe procesarea documentelor în doar câteva minute.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <InlineError message={error} />}

        <div className="space-y-1.5">
          <Label htmlFor="fullName">Nume complet</Label>
          <Input
            id="fullName"
            autoComplete="name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Ada Lovelace"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail de serviciu</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@companie.ro"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Parolă</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby="password-rules"
          />
          <ul id="password-rules" className="grid gap-1 pt-1 sm:grid-cols-2">
            {rules.map((rule, index) => (
              <li
                key={rule.label}
                className={cn(
                  "flex items-center gap-1.5 text-[11px] transition-colors",
                  satisfied[index] ? "text-success" : "text-subtle-foreground",
                )}
              >
                <Check
                  className={cn(
                    "size-3 shrink-0",
                    satisfied[index] ? "opacity-100" : "opacity-40",
                  )}
                  aria-hidden
                />
                {rule.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirmă parola</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            aria-invalid={confirm.length > 0 && !passwordsMatch}
          />
          {confirm.length > 0 && !passwordsMatch && (
            <p className="text-[11px] text-danger">Parolele nu coincid.</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={submitting}
        >
          Creează contul
          {!submitting && <ArrowRight />}
        </Button>
      </form>

      <p className="text-[13px] text-muted-foreground">
        Ai deja un cont?{" "}
        <Link
          to="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Autentificare
        </Link>
      </p>
    </div>
  );
}
