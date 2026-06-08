import { FilterDropdown } from "@/components/ui/FilterDropdown";

interface ProductFilterBarProps {
  categoryValue: string;
  onCategoryChange: (v: string) => void;
  categories: string[];
}

export function ProductFilterBar({
  categoryValue,
  onCategoryChange,
  categories,
}: ProductFilterBarProps) {
  const categoryOptions = [
    { value: "", label: "All categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  return (
    <FilterDropdown
      label="Category"
      value={categoryValue}
      onChange={onCategoryChange}
      options={categoryOptions}
    />
  );
}
