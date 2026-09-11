import { resolveIcon } from "./icon-registry";

/** Renders a registry icon by name; falls back to a folder when unknown. */
export function DynamicIcon({
  name,
  className,
}: {
  name: string | undefined;
  className?: string;
}) {
  const Icon = resolveIcon(name);
  return <Icon className={className} aria-hidden />;
}
