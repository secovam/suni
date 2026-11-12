import { useId } from "react";

interface SegmentedControlProps<T extends string> {
  legend: string;
  value: T;
  onValueChange: (value: T) => void;
  /** `count` is omitted while loading, so no option shows a false zero. */
  options: readonly { value: T; label: string; count?: number }[];
}

/** Radios styled as segments: for a few options that should stay visible instead of hiding in a select. */
export function SegmentedControl<T extends string>({
  legend,
  value,
  onValueChange,
  options,
}: SegmentedControlProps<T>) {
  const name = useId();

  return (
    <fieldset className="bg-muted inline-flex w-fit gap-0.5 rounded-lg p-0.5">
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => (
        <label
          className="text-muted-foreground hover:text-foreground has-checked:bg-background has-checked:text-foreground has-focus-visible:ring-ring inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors has-checked:shadow-sm has-focus-visible:ring-2"
          key={option.value}
        >
          <input
            checked={value === option.value}
            className="sr-only"
            name={name}
            onChange={() => onValueChange(option.value)}
            type="radio"
          />
          {option.label}
          {option.count === undefined ? null : (
            <span className="text-muted-foreground text-xs tabular-nums">
              {option.count}
            </span>
          )}
        </label>
      ))}
    </fieldset>
  );
}
