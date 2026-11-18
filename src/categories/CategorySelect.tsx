import type { ComponentProps } from 'react'
import { CategoryStatus } from './CategoryStatus'
import { useCategories } from './useCategories'

type Props = Omit<ComponentProps<'select'>, 'children' | 'multiple'> & { label?: string }

export function CategorySelect({ label = 'Categoría de soporte', name = 'categoriaId', disabled, ...props }: Props) {
  const result = useCategories()
  const categories = result.catalog.status === 'ready' ? result.catalog.categories : []

  return (
    <div className="grid gap-2">
      <label className="grid gap-1">
        {label}
        <select
          className="min-w-0 rounded-md border border-slate-400 bg-white p-2 disabled:bg-slate-100"
          {...props}
          name={name}
          disabled={disabled || categories.length === 0}
        >
          <option value="">Selecciona una categoría</option>
          {categories.map(({ id, nombre }) => <option key={id} value={id}>{nombre}</option>)}
        </select>
      </label>
      <CategoryStatus {...result} />
    </div>
  )
}
