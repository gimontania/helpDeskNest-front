import type { useCategories } from './useCategories'

export function CategoryStatus({ catalog, retry }: ReturnType<typeof useCategories>) {
  if (catalog.status === 'loading') return <p role="status">Cargando categorías…</p>
  if (catalog.status === 'error') {
    return (
      <div className="grid justify-items-start gap-2">
        <p role="alert">No se pudieron cargar las categorías.</p>
        <button type="button" onClick={retry} className="rounded-md border border-slate-400 px-3 py-2">
          Reintentar
        </button>
      </div>
    )
  }
  if (catalog.status === 'ready' && catalog.categories.length === 0) {
    return <p role="status">Todavía no hay categorías de soporte.</p>
  }
  return null
}
