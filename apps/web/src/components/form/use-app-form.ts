import { createFormHook } from "@tanstack/react-form";

import { DigitsField, SelectField, TextField } from "@/components/form/fields";
import { fieldContext, formContext } from "@/components/form/form-context";

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, DigitsField, SelectField },
  formComponents: {},
});
