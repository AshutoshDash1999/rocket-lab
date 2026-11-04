import {
  CATEGORY_LABELS,
  PART_LIST,
  type PartCategory,
  type PartId,
} from "@/lib/rocket/parts";
import { PartCard } from "./part-card";

const CATEGORY_ORDER: PartCategory[] = [
  "command",
  "nose",
  "tank",
  "engine",
  "structural",
  "utility",
];

export function PartsCatalog({
  ref,
  scrapping,
  dragging,
  onPress,
  onAdd,
}: {
  ref: React.Ref<HTMLElement>;
  /** A canvas part is being dragged over the sidebar: dropping removes it. */
  scrapping: boolean;
  /** Any drag in progress: suppresses part tooltips. */
  dragging: boolean;
  onPress: (e: React.PointerEvent<HTMLElement>, partId: PartId) => void;
  onAdd: (partId: PartId) => void;
}) {
  return (
    <aside
      ref={ref}
      aria-labelledby="parts-heading"
      className="paper relative flex h-[42dvh] shrink-0 flex-col border-t-[3px] border-pen md:h-auto md:min-h-0 md:border-t-0 md:border-r-[3px]"
    >
      <div className="px-4 pt-4 pb-2">
        <h2
          id="parts-heading"
          className="font-display text-2xl font-semibold leading-none text-pen"
        >
          Parts bin
        </h2>
        <p className="mt-1 font-hand text-xl leading-tight text-pen/70">
          drag onto the blueprint, or hit +
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pt-2 pb-8">
        {CATEGORY_ORDER.map((category) => {
          const parts = PART_LIST.filter((p) => p.category === category);
          if (parts.length === 0) return null;
          return (
            <section key={category}>
              <h3 className="font-hand text-2xl font-bold leading-none text-pen">
                {CATEGORY_LABELS[category]}
              </h3>
              <ul className="mt-2 space-y-3">
                {parts.map((part) => (
                  <li key={part.id}>
                    <PartCard
                      part={part}
                      dragging={dragging}
                      onPress={(e) => onPress(e, part.id)}
                      onAdd={() => onAdd(part.id)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {scrapping && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-2 grid place-items-center rounded-[8px] border-[3px] border-dashed border-pen bg-paper/85"
        >
          <p className="-rotate-2 font-hand text-3xl font-bold text-pen">
            drop to scrap it
          </p>
        </div>
      )}
    </aside>
  );
}
