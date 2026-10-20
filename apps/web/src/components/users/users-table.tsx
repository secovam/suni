import type { AppRouterOutputs } from "@suni/api/routers/index";
import { Badge } from "@suni/ui/components/badge";
import { Button } from "@suni/ui/components/button";
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
import type { PaginationState } from "@tanstack/react-table";
import { MonitorCheck, MonitorX, Pencil, Shield, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ChangeUserStatusDialog } from "@/components/users/ban-user-dialog";
import { useListUsers } from "@/hooks/use-users";

type UserRow = AppRouterOutputs["users"]["list"]["items"][number];

const PAGE_SIZE = 20;

const columnHelper = createColumnHelper<UserRow>();

function RoleBadge({ role }: { role: string | null }) {
  if (role === "admin") {
    return (
      <Badge variant="blue">
        <Shield className="size-3.5" /> Admin
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      <User className="size-3.5" /> Usuario
    </Badge>
  );
}

function StatusBadge({ banned }: { banned: boolean }) {
  if (banned) {
    return (
      <Badge variant="destructive">
        <MonitorX className="size-3.5" /> Suspendido
      </Badge>
    );
  }

  return (
    <Badge variant="success">
      <MonitorCheck className="size-3.5" /> Activo
    </Badge>
  );
}

function createColumns(currentUserId?: string) {
  return [
    columnHelper.accessor("name", {
      header: "Usuario",
      cell: (info) => (
        <span className="flex items-center">
          {info.getValue()}
          {info.row.original.id === currentUserId && (
            <Badge className="ml-2" variant="blue">
              Tú
            </Badge>
          )}
        </span>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Correo",
      cell: (info) => (
        <span className="text-muted-foreground">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("role", {
      header: "Rol",
      cell: (info) => <RoleBadge role={info.getValue()} />,
    }),
    columnHelper.accessor("banned", {
      id: "status",
      header: "Estado",
      cell: (info) => <StatusBadge banned={!!info.getValue()} />,
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              className="text-muted-foreground hover:text-foreground"
              nativeButton={false}
              render={
                <Link params={{ userId: user.id }} to="/users/$userId/edit" />
              }
              size="icon-sm"
              title="Editar usuario"
              variant="ghost"
            >
              <Pencil className="size-4" />
              <span className="sr-only">Editar</span>
            </Button>
            <ChangeUserStatusDialog
              disabled={user.id === currentUserId}
              user={user}
            />
          </div>
        );
      },
    }),
  ];
}

// Referencia estable para que TanStack Table no trate cada render como datos nuevos.
const EMPTY: UserRow[] = [];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);

    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

interface UsersDataTableProps {
  currentUserId?: string;
}

export function UsersDataTable({ currentUserId }: UsersDataTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const users = useListUsers({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    search: debouncedSearch || undefined,
  });

  const total = users.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize));

  const columns = useMemo(() => createColumns(currentUserId), [currentUserId]);

  // TanStack Table devuelve funciones no memoizables; React Compiler ya omite
  // este componente y no pasamos `table` a hijos memoizados.
  // oxlint-disable-next-line react/incompatible-library
  const table = useReactTable({
    data: users.data?.items ?? EMPTY,
    columns,
    manualPagination: true,
    pageCount,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
  });

  const { rows } = table.getRowModel();
  let statusMessage: string | undefined;

  if (users.isPending) {
    statusMessage = "Cargando...";
  } else if (users.isError) {
    statusMessage = "No se pudieron cargar los usuarios.";
  } else if (rows.length === 0) {
    statusMessage = "No se encontraron resultados.";
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
          <TableBody>
            {statusMessage ? (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  {statusMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  data-state={
                    row.original.id === currentUserId ? "selected" : undefined
                  }
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <span className="text-muted-foreground text-sm">
          Página {pagination.pageIndex + 1} de {pageCount}
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
