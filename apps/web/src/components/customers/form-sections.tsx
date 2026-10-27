import {
  ACQUISITION_CHANNELS,
  CUSTOMER_TYPES,
} from "@suni/db/schema/customer-enums";
import type { customerFormSchema } from "@suni/db/validation/customers";
import { DigitsInput } from "@suni/ui/components/digits-input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@suni/ui/components/form";
import { Input } from "@suni/ui/components/input";
import { ReactSelect } from "@suni/ui/components/react-select";
import type { z } from "zod";

type CustomerInput = z.infer<typeof customerFormSchema>;

// The acquisition select starts empty; the schema rejects "" on submit.
export type CustomerFormValues = Omit<CustomerInput, "acquisition"> & {
  acquisition: CustomerInput["acquisition"] | "";
};

const acquisitionOptions = ACQUISITION_CHANNELS.map((value) => ({
  value,
  label: value,
}));

const typeOptions = CUSTOMER_TYPES.map((value) => ({
  value,
  label: value,
}));

export function BasicInfoSection() {
  return (
    <>
      <FormField
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Razón Social<span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Razón Social SA de CV"
                type="text"
                value={field.state.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="rfc"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              RFC<span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                maxLength={13}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value.toUpperCase().replaceAll(/[^A-Z0-9Ñ&]/gu, "")
                  )
                }
                placeholder="AAA010101AAA"
                type="text"
                value={field.state.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function ContactAndMetaSection({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      <div className="flex space-x-4">
        <FormField
          name="phone"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                Teléfono<span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <DigitsInput
                  maxLength={10}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onValueChange={field.handleChange}
                  placeholder="8112341234"
                  value={field.state.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="phoneExtension"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>No. Extensión</FormLabel>
              <FormControl>
                <DigitsInput
                  maxLength={10}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onValueChange={field.handleChange}
                  placeholder="3412"
                  value={field.state.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        name="acquisition"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Medio de adquisición
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <ReactSelect
                isClearable
                onBlur={field.handleBlur}
                onChange={(option) => field.handleChange(option?.value ?? "")}
                options={acquisitionOptions}
                placeholder="Selecciona un medio..."
                value={
                  acquisitionOptions.find(
                    (opt) => opt.value === field.state.value
                  ) ?? null
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isAdmin && (
        <FormField
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tipo<span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <ReactSelect
                  onBlur={field.handleBlur}
                  onChange={(option) => {
                    if (option) {
                      field.handleChange(option.value);
                    }
                  }}
                  options={typeOptions}
                  placeholder="Selecciona un tipo..."
                  value={
                    typeOptions.find(
                      (opt) => opt.value === field.state.value
                    ) ?? null
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
