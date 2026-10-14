import { Badge } from "@suni/ui/components/badge";
import { Button } from "@suni/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
  Pencil,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { ChangeUserStatusDialog } from "@/components/users/ban-user-dialog";
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
  name: "Usuario",
  email: "Correo",
  role: "Rol",
  status: "Estado",
} satisfies Record<string, string>;

function isCurrentUser(
  userId: string | number,
  currentUserId?: string | number | null
) {
  return (
    currentUserId !== undefined &&
    currentUserId !== null &&
    String(userId) === String(currentUserId)
  );
}

function RoleBadge({ role }: { role: string }) {
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

function SelfBadge() {
  return (
    <Badge className="ml-2" variant="blue">
      Tú
    </Badge>
  );
}

function createColumns(currentUserId?: string | number | null) {
  return [
    columnHelper.accessor("name", {
      header: COLUMN_LABELS.name,
      cell: (info) => (
        <span className="flex items-center">
          {info.getValue()}
          {isCurrentUser(info.row.original.id, currentUserId) && <SelfBadge />}
        </span>
      ),
    }),
    columnHelper.accessor("email", {
      header: COLUMN_LABELS.email,
      cell: (info) => (
        <span className="text-muted-foreground">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("role", {
      header: COLUMN_LABELS.role,
      cell: (info) => {
        const role = info.getValue();

        return role ? <RoleBadge role={role} /> : <span>-</span>;
      },
    }),
    columnHelper.accessor("banned", {
      id: "status",
      header: COLUMN_LABELS.status,
      cell: (info) => <StatusBadge banned={!!info.getValue()} />,
    }),
    columnHelper.display({
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        const isSelf = isCurrentUser(user.id, currentUserId);

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
            <ChangeUserStatusDialog disabled={isSelf} user={user} />
          </div>
        );
      },
    }),
  ];
}

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
    tableBodyContent = table.getRowModel().rows.map((row) => {
      const isSelf = isCurrentUser(row.original.id, currentUserId);

      return (
        <TableRow data-state={isSelf ? "selected" : undefined} key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      );
    });
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
