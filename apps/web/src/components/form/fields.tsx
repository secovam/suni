import { DigitsInput } from "@suni/ui/components/digits-input";
import { Input } from "@suni/ui/components/input";
import { Label } from "@suni/ui/components/label";
import {
  ReactCreatableSelect,
  ReactSelect,
} from "@suni/ui/components/react-select";
import type { ComponentProps, ReactNode } from "react";

import { useFieldContext } from "@/components/form/form-context";

interface FrameProps {
  label: string;
  required?: boolean;
  hint?: string | null;
}

// Owns label, required mark, hint, error and the id/aria wiring shared by every field component.
function FieldFrame({
  label,
  required = false,
  hint,
  children,
}: FrameProps & {
  children: (control: {
    "aria-describedby"?: string;
    "aria-invalid": boolean;
    "aria-required": boolean;
    id: string;
    name: string;
  }) => ReactNode;
}) {
  const field = useFieldContext<string>();
  const error = field.state.meta.errors[0]?.message;
  const errorId = `${field.name}-error`;
  const hintId = `${field.name}-hint`;

  const describedBy =
    [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children({
        "aria-describedby": describedBy,
        "aria-invalid": Boolean(error),
        "aria-required": required,
        id: field.name,
        name: field.name,
      })}
      {hint ? (
        <p
          aria-live="polite"
          className="text-muted-foreground text-sm"
          id={hintId}
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-destructive text-sm" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  required,
  hint,
  transform,
  type = "text",
  ...props
}: FrameProps &
  Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
    transform?: (value: string) => string;
    type?: "text" | "email";
  }) {
  const field = useFieldContext<string>();

  return (
    <FieldFrame hint={hint} label={label} required={required}>
      {(control) => (
        <Input
          {...control}
          {...props}
          onBlur={field.handleBlur}
          onChange={(event) =>
            field.handleChange(
              transform ? transform(event.target.value) : event.target.value
            )
          }
          type={type}
          value={field.state.value}
        />
      )}
    </FieldFrame>
  );
}

export function DigitsField({
  label,
  required,
  hint,
  ...props
}: FrameProps &
  Omit<
    ComponentProps<typeof DigitsInput>,
    "value" | "onValueChange" | "onChange"
  >) {
  const field = useFieldContext<string>();

  return (
    <FieldFrame hint={hint} label={label} required={required}>
      {(control) => (
        <DigitsInput
          {...control}
          {...props}
          onBlur={field.handleBlur}
          onValueChange={field.handleChange}
          value={field.state.value}
        />
      )}
    </FieldFrame>
  );
}

// Disabled, so it can't be picked; typing filters it out and react-select shows the "Usar" option instead.
const CREATE_HINT = {
  value: "",
  label: "¿No está en la lista? Escríbela para agregarla",
  isDisabled: true,
};

export function SelectField({
  label,
  required,
  options,
  placeholder,
  creatable = false,
  readOnly = false,
}: FrameProps & {
  options: readonly { value: string; label: string }[];
  placeholder?: string;
  creatable?: boolean;
  readOnly?: boolean;
}) {
  const field = useFieldContext<string>();
  const current = field.state.value;
  const selected = options.find((c) => c.value === current);

  const onChange = (option: { value: string } | null) => {
    if (option) {
      field.handleChange(option.value);
    }
  };

  return (
    <FieldFrame label={label} required={required}>
      {({ id, name: _name, "aria-required": _required, ...control }) =>
        creatable ? (
          <ReactCreatableSelect
            {...control}
            formatCreateLabel={(input) => `Usar "${input}"`}
            inputId={id}
            // react-select has no readOnly; disabled is the closest and keeps the value visible.
            isDisabled={readOnly}
            onBlur={field.handleBlur}
            onChange={onChange}
            options={[...options, CREATE_HINT]}
            placeholder={placeholder}
            // A stored or typed value missing from options still shows as selected.
            value={
              selected ?? (current ? { value: current, label: current } : null)
            }
          />
        ) : (
          <ReactSelect
            {...control}
            inputId={id}
            isDisabled={readOnly}
            onBlur={field.handleBlur}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            value={selected ?? null}
          />
        )
      }
    </FieldFrame>
  );
}
