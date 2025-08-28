import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Fragment, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
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
  searchCol,
  filterCols,
  expandableRows,
}: DataTableProps<TData, TValue> & {
  searchCol?: keyof TData & string;
  filterCols?: Array<keyof TData>;
  expandableRows?: (row: TData) => React.ReactNode;
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

  // Get unique values for each filter column
  const filterOptions = useMemo(() => {
    if (!filterCols) {
      return {};
    }

    const options: Record<string, string[]> = {};
    filterCols.forEach((col) => {
      const colKey = String(col);
      const uniqueValues = Array.from(
        new Set(
          data
            .map((row) => row[col])
            .filter((value) => value != null && value !== "")
            .map((value) => String(value)),
        ),
      ).sort();
      options[colKey] = uniqueValues;
    });
    return options;
  }, [data, filterCols]);

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

  const handleFilterChange = (columnId: string, value: string) => {
    const column = table.getColumn(columnId);
    if (column) {
      column.setFilterValue(value === "all" ? "" : value);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 py-4">
        {searchCol && (
          <Input
            placeholder={`Filter by ${searchCol}...`}
            value={(table?.getColumn(searchCol)?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              table?.getColumn(searchCol)?.setFilterValue(event.target.value);
            }}
            className="max-w-sm"
          />
        )}

        {filterCols && (
          <div className="ml-4 flex items-center gap-2">
            Filters:
            {filterCols.map((col) => {
              const colKey = String(col);
              const options = filterOptions[colKey] || [];
              const currentValue = (table.getColumn(colKey)?.getFilterValue() as string) || "";

              return (
                <Select
                  key={colKey}
                  value={currentValue || "all"}
                  onValueChange={(value) => handleFilterChange(colKey, value)}
                >
                  <SelectTrigger className="!h-10 w-[150px]">
                    <SelectValue placeholder={`Filter ${colKey}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {colKey}</SelectItem>
                    {options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            })}
          </div>
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
                        <TableCell className="px-1">
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
                          <div>{expandableRows(row.original)}</div>
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
