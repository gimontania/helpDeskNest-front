import type { useCategories } from "./useCategories";
import { LoadingState, ErrorState, EmptyState } from "../feedback/States";

export function CategoryStatus({
  catalog,
  retry,
}: ReturnType<typeof useCategories>) {
  if (catalog.status === "loading")
    return <LoadingState message="Cargando categorías…" />;
  if (catalog.status === "error")
    return <ErrorState message={catalog.message} onRetry={retry} />;
  if (catalog.categories.length === 0)
    return <EmptyState message="Todavía no hay categorías de soporte." />;
  return null;
}
