import { CategoryStatus } from './CategoryStatus'
import { useCategories } from './useCategories'

const creationDate = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' })

export function CategoryCatalog() {
  const result = useCategories()
  const { catalog } = result

  return (
    <section aria-labelledby="categories-heading" className="grid gap-4">
      <h1 id="categories-heading" className="text-2xl font-bold">Categorías de soporte</h1>
      <CategoryStatus {...result} />
      {catalog.status === 'ready' && catalog.categories.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {catalog.categories.map(({ id, nombre, descripcion, creadoEn }) => (
            <li key={id} className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 wrap-anywhere">
              <h2 className="text-lg font-semibold">{nombre}</h2>
              <p className="mt-2 text-slate-700">{descripcion || 'Sin descripción'}</p>
              <dl className="mt-4 space-y-2 text-sm text-slate-600">
                <div>
                  <dt className="font-semibold">Creación</dt>
                  <dd><time dateTime={creadoEn}>{creationDate.format(new Date(creadoEn))}</time></dd>
                </div>
                <div>
                  <dt className="font-semibold">ID</dt>
                  <dd>{id}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
