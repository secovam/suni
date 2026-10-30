import type * as React from "react";

import { Input } from "./input";

type DigitsInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "onChange" | "inputMode" | "type"
> & {
  onValueChange: (value: string) => void;
};

// Strips non-digits on every change, including pasted text; type="number" would allow e, +, - and drop maxLength.
// maxLength is applied after stripping, because the native limit would count the dashes in a pasted "55-1234-5678".
function DigitsInput({ onValueChange, maxLength, ...props }: DigitsInputProps) {
  return (
    <Input
      inputMode="numeric"
      onChange={(e) =>
        onValueChange(e.target.value.replaceAll(/\D/gu, "").slice(0, maxLength))
      }
      type="text"
      {...props}
    />
  );
}

export { DigitsInput };
