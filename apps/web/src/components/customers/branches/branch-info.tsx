import { cn } from "@suni/ui/lib/utils";
import { Camera, MapPin, Phone, ZoomIn } from "lucide-react";

import type { Branch } from "./util/branch-address";
import { formatAddress } from "./util/branch-address";

const overlayButton =
  "flex size-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70";

interface BranchInfoContentProps {
  branch: Branch;
  branchImage: string;
  onImagePreview: () => void;
  onImageUpload?: () => void;
}

export function BranchInfoContent({
  branch,
  branchImage,
  onImagePreview,
  onImageUpload,
}: BranchInfoContentProps) {
  const isArchived = !!branch.archived || !!branch.customer?.archived;
  const address = formatAddress(branch);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="text-brand mb-3 text-lg font-semibold">Dirección</h3>
        <div className="text-muted-foreground flex flex-col gap-3 text-sm">
          <div className="flex items-start gap-2.5">
            <MapPin className="text-muted-foreground/70 mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col">
              <span>{address.streetLine}</span>
              <span>{address.locationLine}</span>
            </div>
          </div>

          {branch.phone ? (
            <div className="flex items-center gap-2.5">
              <Phone className="text-muted-foreground/70 size-4 shrink-0" />
              <span>{branch.phone}</span>
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <h3 className="text-brand mb-3 text-lg font-semibold">
          Imagen de fachada
        </h3>
        <div className="group relative aspect-video w-full overflow-hidden rounded-lg">
          <img
            alt={branch.name}
            className={cn(
              "size-full object-cover transition-transform duration-500 group-hover:scale-105",
              isArchived && "grayscale"
            )}
            src={branchImage}
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-transparent transition-opacity duration-200 pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100">
            <button
              aria-label="Ver imagen completa"
              className={cn(overlayButton, "absolute top-4 left-4")}
              onClick={onImagePreview}
              type="button"
            >
              <ZoomIn className="size-5" />
            </button>
            {!isArchived && onImageUpload ? (
              <button
                aria-label="Cambiar foto"
                className={cn(overlayButton, "absolute top-4 right-4")}
                onClick={onImageUpload}
                type="button"
              >
                <Camera className="size-5" />
              </button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
