import type * as React from "react";

import { Input } from "./input";

type DigitsInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "onChange" | "inputMode" | "type"
> & {
  onValueChange: (value: string) => void;
};

// Strips non-digits on every change, including pasted text; type="number" would allow e, +, - and drop maxLength.
function DigitsInput({ onValueChange, ...props }: DigitsInputProps) {
  return (
    <Input
      inputMode="numeric"
      onChange={(e) => onValueChange(e.target.value.replaceAll(/\D/gu, ""))}
      type="text"
      {...props}
    />
  );
}

export { DigitsInput };
