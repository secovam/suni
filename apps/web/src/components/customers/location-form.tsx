import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@suni/ui/components/form";
import { Input } from "@suni/ui/components/input";
import { ReactSelect } from "@suni/ui/components/react-select";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { usePostalCode } from "@/hooks/use-postal-code";

const onlyDigits = (value: string) => value.replaceAll(/\D/gu, "");

interface LocationFormApi {
  getFieldValue: (name: "postalCode" | "suburb") => string;
  setFieldValue: (name: "state" | "city" | "suburb", value: string) => void;
}

function StandardInputField({
  name,
  label,
  required = true,
  placeholder,
  className,
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={placeholder}
              type="text"
              value={field.state.value}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function LocationSection({ form }: { form: LocationFormApi }) {
  const [postalCode, setPostalCode] = useState(() =>
    form.getFieldValue("postalCode")
  );

  const { data, isFetching, isError } = usePostalCode(postalCode);

  const settlements = data ?? [];
  const found = settlements.length > 0;

  const suburbOptions = settlements.map((s) => ({
    value: s.d_asenta,
    label: s.d_asenta,
  }));

  let hint: string | null = null;

  if (isError) {
    hint = "No se pudo consultar el servicio. Captura los datos manualmente.";
  } else if (postalCode.length === 5 && !isFetching && !found) {
    hint =
      "No encontramos ese código postal. Puedes capturar los datos manualmente.";
  }

  useEffect(() => {
    if (!data?.length) {
      return;
    }

    form.setFieldValue("state", data[0].d_estado);
    form.setFieldValue("city", data[0].d_mnpio);

    const currentSuburb = form.getFieldValue("suburb");

    if (!data.some((s) => s.d_asenta === currentSuburb)) {
      form.setFieldValue("suburb", data.length === 1 ? data[0].d_asenta : "");
    }
  }, [data, form]);

  return (
    <>
      <FormField
        name="postalCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Código Postal<span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  inputMode="numeric"
                  maxLength={5}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const digits = onlyDigits(e.target.value);
                    field.handleChange(digits);
                    setPostalCode(digits);
                  }}
                  placeholder="64000"
                  type="text"
                  value={field.state.value}
                />
                {isFetching && (
                  <Loader2 className="absolute top-2.5 right-3 size-4 animate-spin" />
                )}
              </div>
            </FormControl>
            {hint && <p className="text-muted-foreground text-sm">{hint}</p>}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="suburb"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Colonia<span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              {found ? (
                <ReactSelect
                  onBlur={field.handleBlur}
                  onChange={(option) => field.handleChange(option?.value ?? "")}
                  options={suburbOptions}
                  placeholder="Selecciona una colonia..."
                  value={
                    suburbOptions.find((o) => o.value === field.state.value) ??
                    null
                  }
                />
              ) : (
                <Input
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="text"
                  value={field.state.value}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <StandardInputField name="city" label="Municipio" />
      <StandardInputField name="state" label="Estado" />
      <StandardInputField name="street" label="Calle" />

      <div className="flex space-x-4">
        <StandardInputField
          name="intNumber"
          label="No. Interior"
          required={false}
          placeholder="Opcional"
          className="w-full"
        />
        <StandardInputField
          name="extNumber"
          label="No. Exterior"
          placeholder="123-A"
          className="w-full"
        />
      </div>
    </>
  );
}
