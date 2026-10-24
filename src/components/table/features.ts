import {
  columnFilteringFeature,
  columnSizingFeature,
  createFilteredRowModel,
  createSortedRowModel,
  filterFns,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from "@tanstack/react-table";

// Full built-in registries so `'auto'` sort/filter resolution matches v8 behaviour
export const features = tableFeatures({
  columnFilteringFeature,
  columnSizingFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns,
  sortFns,
});

export type Features = typeof features;
