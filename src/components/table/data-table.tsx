import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export interface ExpandableRowConfig<TData> {
  renderExpandedContent: (row: TData) => React.ReactNode;
  toggleComponent?: (isExpanded: boolean, toggle: () => void) => React.ReactNode;
}

function DefaultToggle({ isExpanded, toggle }: { isExpanded: boolean; toggle: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={toggle}>
      {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
    </Button>
  );
}

export function DataTable<TData extends object, TValue>({
  columns,
  data,
  filterCol,
  expandableRows,
}: DataTableProps<TData, TValue> & {
  filterCol?: keyof TData & string;
  expandableRows?: ExpandableRowConfig<TData>;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  return (
    <>
      <div className="flex items-center py-4">
        {filterCol && (
          <Input
            placeholder={`Filter by ${filterCol}...`}
            value={(table?.getColumn(filterCol)?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              table?.getColumn(filterCol)?.setFilterValue(event.target.value);
            }}
            className="max-w-sm"
          />
        )}
      </div>

      <div className="border-muted max-h-[70vh] overflow-x-auto overflow-y-auto rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {expandableRows && <TableHead />}
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      minWidth: header.column.columnDef.size,
                      maxWidth: header.column.columnDef.size,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isExpanded = expandedRows.has(row.id);
                return (
                  <Fragment key={row.id}>
                    <TableRow data-state={row.getIsSelected() && "selected"}>
                      {expandableRows && (
                        <TableCell>
                          <DefaultToggle isExpanded={isExpanded} toggle={() => toggleRow(row.id)} />
                        </TableCell>
                      )}
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {expandableRows && isExpanded && (
                      <TableRow>
                        <TableCell colSpan={columns.length + 1} className="bg-gray-50/50 p-0">
                          <div>{expandableRows.renderExpandedContent(row.original)}</div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (expandableRows ? 1 : 0)}
                  className="h-12 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
