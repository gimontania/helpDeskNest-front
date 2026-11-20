import type { ComponentProps } from "react";
import { CategoryStatus } from "./CategoryStatus";
import { useCategories } from "./useCategories";

type Props = Omit<ComponentProps<"select">, "children" | "multiple"> & {
  label?: string;
};

export function CategorySelect({
  label = "Categoría de soporte",
  name = "categoriaId",
  disabled,
  ...props
}: Props) {
  const result = useCategories();
  const categories =
    result.catalog.status === "ready" ? result.catalog.categories : [];

  return (
    <div className="grid gap-2">
      <label className="grid gap-1.5">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <select
          className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 aria-[invalid=true]:border-rose-500 disabled:opacity-60 [&>option]:bg-slate-800"
          {...props}
          name={name}
          disabled={disabled || categories.length === 0}
        >
          <option value="">Selecciona una categoría</option>
          {categories.map(({ id, nombre }) => (
            <option key={id} value={id}>
              {nombre}
            </option>
          ))}
        </select>
      </label>
      <CategoryStatus {...result} />
    </div>
  );
}
