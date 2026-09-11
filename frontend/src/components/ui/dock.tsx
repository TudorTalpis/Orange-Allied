import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from "framer-motion";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * A magnifying dock, adapted to this project.
 *
 * Changes from the original snippet, all deliberate:
 * - Colours come from the design tokens instead of hard-coded Tailwind greys.
 * - Items render as real links or buttons, so middle-click, Ctrl+click and
 *   screen readers behave correctly; the original used a div with role="button"
 *   and never used the href it was given.
 * - Child props travel through a typed context rather than `cloneElement`,
 *   which is both type-safe and lets consumers nest freely.
 * - Magnification is disabled under `prefers-reduced-motion`.
 */

const DEFAULT_MAGNIFICATION = 68;
const DEFAULT_DISTANCE = 140;
const DEFAULT_PANEL_HEIGHT = 56;
const DEFAULT_ITEM_SIZE = 40;

interface DockContextValue {
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  magnification: number;
  distance: number;
  itemSize: number;
  reduceMotion: boolean;
}

const DockContext = createContext<DockContextValue | null>(null);

function useDock(): DockContextValue {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error("Componentele Dock trebuie folosite în interiorul unui <Dock>.");
  }
  return context;
}

interface DockItemContextValue {
  width: MotionValue<number>;
  isHovered: MotionValue<number>;
}

const DockItemContext = createContext<DockItemContextValue | null>(null);

function useDockItem(): DockItemContextValue {
  const context = useContext(DockItemContext);
  if (!context) {
    throw new Error("DockIcon și DockLabel trebuie folosite în interiorul unui <DockItem>.");
  }
  return context;
}

export interface DockProps {
  children: ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  itemSize?: number;
  spring?: SpringOptions;
  /** Accessible name for the toolbar. */
  label?: string;
  /**
   * Whether the container grows as items magnify. A floating dock should; one
   * placed inside a fixed-height bar must not, or the bar jumps on hover.
   */
  animateHeight?: boolean;
}

export function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
  itemSize = DEFAULT_ITEM_SIZE,
  label = "Acțiuni rapide",
  animateHeight = true,
}: DockProps) {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const isHovered = useMotionValue(0);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const maxHeight = useMemo(
    () => Math.max(panelHeight, magnification + 20),
    [magnification, panelHeight],
  );

  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{ height: reduceMotion || !animateHeight ? panelHeight : height }}
      className={cn(
        "flex max-w-full justify-center",
        animateHeight ? "items-end" : "items-center",
      )}
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Number.POSITIVE_INFINITY);
        }}
        className={cn(
          "mx-auto flex w-fit gap-2 rounded-2xl border border-border bg-surface-overlay/90 px-2.5 backdrop-blur-md",
          animateHeight ? "items-end" : "items-center",
          "shadow-[0_20px_50px_-25px_rgba(0,0,0,1)]",
          className,
        )}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label={label}
      >
        <DockContext.Provider
          value={{ mouseX, spring, distance, magnification, itemSize, reduceMotion }}
        >
          {children}
        </DockContext.Provider>
      </motion.div>
    </motion.div>
  );
}

export interface DockItemProps {
  children: ReactNode;
  className?: string;
  /** Internal route — renders a react-router link. */
  to?: string;
  /** Same-page anchor — renders a plain link, so the hash is not routed. */
  href?: string;
  /** Click handler — renders a button instead. */
  onClick?: () => void;
  /** Marks the current page for assistive technology and styling. */
  active?: boolean;
}

export function DockItem({
  children,
  className,
  to,
  href,
  onClick,
  active,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { distance, magnification, mouseX, spring, itemSize, reduceMotion } = useDock();
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return value - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [itemSize, magnification, itemSize],
  );
  const width = useSpring(widthTransform, spring);
  const staticWidth = useMotionValue(itemSize);

  const inner = (
    <span
      className={cn(
        "flex size-full items-center justify-center rounded-xl border transition-colors",
        active
          ? "border-primary-border bg-primary-subtle text-brand-bright"
          : "border-border bg-surface-raised text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {children}
    </span>
  );

  return (
    <motion.div
      ref={ref}
      style={{ width: reduceMotion ? staticWidth : width }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      className={cn("relative aspect-square shrink-0", className)}
    >
      <DockItemContext.Provider value={{ width, isHovered }}>
        {to ? (
          <Link
            to={to}
            aria-current={active ? "page" : undefined}
            className="block size-full rounded-xl"
          >
            {inner}
          </Link>
        ) : href ? (
          <a
            href={href}
            aria-current={active ? "true" : undefined}
            className="block size-full rounded-xl"
          >
            {inner}
          </a>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className="block size-full rounded-xl"
          >
            {inner}
          </button>
        )}
      </DockItemContext.Provider>
    </motion.div>
  );
}

export function DockLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isHovered } = useDockItem();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on("change", (latest) => setVisible(latest === 1));
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: -8 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.16 }}
          className={cn(
            "pointer-events-none absolute -top-7 left-1/2 w-fit whitespace-pre rounded-md border border-border bg-surface-overlay px-2 py-0.5 text-[11px] text-foreground shadow-xl",
            className,
          )}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function DockIcon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { width } = useDockItem();
  const { reduceMotion, itemSize } = useDock();
  const iconWidth = useTransform(width, (value) => value / 2.4);
  const staticWidth = useMotionValue(itemSize / 2.4);

  return (
    <motion.span
      style={{ width: reduceMotion ? staticWidth : iconWidth }}
      className={cn("flex items-center justify-center", className)}
    >
      {children}
    </motion.span>
  );
}
