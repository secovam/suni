import { Button } from "@suni/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@suni/ui/components/dropdown-menu";
import { Input } from "@suni/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@suni/ui/components/table";
import { Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { PaginationState, VisibilityState } from "@tanstack/react-table";
import {
  ChevronDown,
  MonitorCheck,
  MonitorX,
  MoreHorizontal,
  Pencil,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { useUsers } from "@/hooks/use-users";

type UserRow = NonNullable<
  ReturnType<typeof useUsers>["data"]
>["items"][number];

interface UsersDataTableProps {
  currentUserId?: string;
}

const PAGE_SIZE = 20;

const columnHelper = createColumnHelper<UserRow>();

const COLUMN_LABELS = {
  name: "Nombre",
  email: "Correo",
  status: "Estatus",
  role: "Rol",
  createdAt: "Fecha de creación",
  updatedAt: "Fecha de modificación",
} satisfies Record<string, string>;

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const columns = [
  columnHelper.accessor("name", {
    header: COLUMN_LABELS.name,
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("email", {
    header: COLUMN_LABELS.email,
    cell: (info) => (
      <Link
        className="underline"
        params={{ userId: info.row.original.id }}
        to="/users/$userId/edit"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("banned", {
    id: "status",
    header: COLUMN_LABELS.status,
    cell: (info) =>
      info.getValue() ? (
        <span className="text-destructive flex items-center">
          <MonitorX className="mr-2" /> Suspendido
        </span>
      ) : (
        <span className="text-success flex items-center">
          <MonitorCheck className="mr-2" /> Activo
        </span>
      ),
  }),
  columnHelper.accessor("role", {
    header: COLUMN_LABELS.role,
    cell: (info) =>
      info.getValue() === "admin" ? (
        <span className="flex items-center">
          <Shield className="mr-2" /> Admin
        </span>
      ) : (
        <span className="flex items-center">
          <User className="mr-2" /> Usuario
        </span>
      ),
  }),
  columnHelper.accessor("createdAt", {
    header: COLUMN_LABELS.createdAt,
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.accessor("updatedAt", {
    header: COLUMN_LABELS.updatedAt,
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.display({
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={
              <Link
                className="flex items-center"
                params={{ userId: row.original.id }}
                to="/users/$userId/edit"
              />
            }
          >
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
];

const EMPTY: UserRow[] = [];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);

    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

export function UsersDataTable({ currentUserId }: UsersDataTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const users = useUsers({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    search: debouncedSearch || undefined,
  });

  const total = users.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize));

  // TanStack Table devuelve funciones no memoizables; React Compiler ya omite
  // este componente y no pasamos `table` a hijos memoizados.
  // oxlint-disable-next-line react/incompatible-library
  const table = useReactTable({
    data: users.data?.items ?? EMPTY,
    columns,
    manualPagination: true,
    pageCount,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
      columnVisibility,
    },
  });

  const columnToggles: ReactNode[] = [];

  for (const [id, label] of Object.entries(COLUMN_LABELS)) {
    const column = table.getColumn(id);

    if (column?.getCanHide()) {
      columnToggles.push(
        <DropdownMenuCheckboxItem
          checked={column.getIsVisible()}
          key={id}
          onCheckedChange={(value) => column.toggleVisibility(!!value)}
        >
          {label}
        </DropdownMenuCheckboxItem>
      );
    }
  }

  let tableBodyContent;

  if (users.isPending) {
    tableBodyContent = (
      <TableRow>
        <TableCell className="h-24 text-center" colSpan={columns.length}>
          Cargando...
        </TableCell>
      </TableRow>
    );
  } else if (users.isError) {
    tableBodyContent = (
      <TableRow>
        <TableCell className="h-24 text-center" colSpan={columns.length}>
          No se pudieron cargar los usuarios.
        </TableCell>
      </TableRow>
    );
  } else if (table.getRowModel().rows.length > 0) {
    tableBodyContent = table.getRowModel().rows.map((row) => (
      <TableRow
        data-state={row.original.id === currentUserId ? "selected" : undefined}
        key={row.id}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ));
  } else {
    tableBodyContent = (
      <TableRow>
        <TableCell className="h-24 text-center" colSpan={columns.length}>
          No se encontraron resultados.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <div className="mt-6 mb-8 w-full">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold">Usuarios</h2>
        <span className="bg-muted text-muted-foreground ml-2 rounded-full px-2 py-1 text-sm">
          {total}
        </span>
      </div>
      <div className="flex items-center py-4">
        <Input
          className="max-w-sm"
          onChange={(event) => {
            setSearch(event.target.value);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          placeholder="Buscar por nombre o correo..."
          value={search}
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button className="ml-auto" variant="outline" />}
          >
            Columnas <ChevronDown className="ml-2 h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">{columnToggles}</DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div
        className={`rounded-md border ${users.isPlaceholderData ? "opacity-60" : ""}`}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{tableBodyContent}</TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <span className="text-muted-foreground text-sm">
          Página {pagination.pageIndex + 1} de {pageCount} · {total} usuarios
        </span>
        <div className="flex items-center space-x-2">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="sm"
            variant="outline"
          >
            Anterior
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="sm"
            variant="outline"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
