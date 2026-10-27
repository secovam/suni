import { cn } from "@suni/ui/lib/utils";
import type { AriaAttributes, Ref } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import type { CreatableProps } from "react-select/creatable";
import type { ClassNamesConfig, GroupBase, Props, SelectInstance } from "react-select";

function isInvalid(value: AriaAttributes["aria-invalid"]) {
  return value !== undefined && value !== false && value !== "false";
}

export const selectClassNames = {
  control: (state) =>
    cn(
      // Mirrors Input so selects line up with text fields; min-h needs ! to beat react-select's base minHeight of 38px.
      "min-h-8! rounded-lg border border-input bg-transparent px-2.5 text-base transition-colors md:text-sm dark:bg-input/30",
      state.isFocused && "border-ring ring-3 ring-ring/50",
      // aria-invalid sits on the inner input, so Input's aria-invalid: variants can't reach this box.
      isInvalid(state.selectProps["aria-invalid"]) &&
        "border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
      // Matches Input's read-only look, since disabled is how the form makes a select read-only.
      state.isDisabled && "cursor-default bg-muted/60"
    ),
  valueContainer: () => "gap-1",
  placeholder: () => "text-muted-foreground",
  singleValue: () => "text-foreground",
  input: () => "text-foreground",
  indicatorsContainer: () => "gap-1",
  indicatorSeparator: () => "hidden",
  dropdownIndicator: (state) =>
    cn("text-muted-foreground", state.isDisabled && "opacity-30"),
  clearIndicator: () => "text-muted-foreground hover:text-foreground",
  menu: () =>
    "z-50 mt-1 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
  option: (state) =>
    cn(
      "cursor-pointer rounded-sm px-2 py-1.5 text-base md:text-sm",
      state.isFocused && "bg-accent text-accent-foreground",
      state.isSelected && "bg-primary text-primary-foreground",
      state.isDisabled && "opacity-50"
    ),
  noOptionsMessage: () => "px-2 py-1.5 text-muted-foreground text-sm",
  multiValue: () => "gap-1 rounded-sm bg-muted px-1.5 py-0.5",
  multiValueLabel: () => "text-foreground text-sm",
  multiValueRemove: () => "rounded-sm hover:bg-destructive/10 hover:text-destructive",
} satisfies ClassNamesConfig<unknown, boolean, GroupBase<unknown>>;

type ReactSelectProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
> = Props<Option, IsMulti, Group> & {
  ref?: Ref<SelectInstance<Option, IsMulti, Group>>;
  "aria-describedby"?: string;
};

type ReactCreatableSelectProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
> = CreatableProps<Option, IsMulti, Group> &
  ReactSelectProps<Option, IsMulti, Group>;

function withSharedProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>({
  classNames,
  id,
  inputId,
  "aria-describedby": describedBy,
  ...props
}: ReactSelectProps<Option, IsMulti, Group>) {
  return {
    classNames: {
      ...(selectClassNames as unknown as ClassNamesConfig<Option, IsMulti, Group>),
      ...classNames,
    },
    // FormControl passes id/aria-describedby; react-select needs them on the inner input so labels and errors link up.
    "aria-errormessage": props["aria-invalid"] ? describedBy : undefined,
    inputId: inputId ?? id,
    unstyled: true,
    ...props,
  } as const;
}

export function ReactSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: ReactSelectProps<Option, IsMulti, Group>) {
  return (
    <div className="notranslate" translate="no">
      <Select<Option, IsMulti, Group> {...withSharedProps(props)} />
    </div>
  );
}

export function ReactCreatableSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: ReactCreatableSelectProps<Option, IsMulti, Group>) {
  return (
    <div className="notranslate" translate="no">
      <CreatableSelect<Option, IsMulti, Group> {...withSharedProps(props)} />
    </div>
  );
}

export default ReactSelect;