import { Button } from "@suni/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@suni/ui/components/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";

import { UserForm } from "@/components/users/user-form";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button className="w-full sm:w-auto" />}>
        <Plus />
        Nuevo Usuario
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
          <DialogDescription>
            Captura los datos del nuevo usuario.
          </DialogDescription>
        </DialogHeader>
        <UserForm onCancel={close} onSuccess={close} />
      </DialogContent>
    </Dialog>
  );
}
