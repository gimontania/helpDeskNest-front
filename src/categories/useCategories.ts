import { useEffect, useState } from 'react'
import { listCategories, type Category } from '../services/categories'

type Catalog =
  | { status: 'loading' | 'error' }
  | { status: 'ready'; categories: Category[] }

export function useCategories() {
  const [catalog, setCatalog] = useState<Catalog>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const request = new AbortController()
    listCategories(request.signal).then(
      (categories) => {
        if (!request.signal.aborted) setCatalog({ status: 'ready', categories })
      },
      () => {
        if (!request.signal.aborted) setCatalog({ status: 'error' })
      },
    )
    return () => request.abort()
  }, [attempt])

  function retry() {
    setCatalog({ status: 'loading' })
    setAttempt((previous) => previous + 1)
  }

  return { catalog, retry }
}
