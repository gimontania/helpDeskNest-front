
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../services/apiErrors";
import { listCategories, type Category } from "../services/categories";

type Catalog =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; categories: Category[] };

export function useCategories() {
  const [catalog, setCatalog] = useState<Catalog>({
    status: "loading",
  });

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const request = new AbortController();

    listCategories(request.signal).then(
      (categories) => {
        if (!request.signal.aborted) {
          setCatalog({ status: "ready", categories });
        }
      },
      (error: unknown) => {
        if (!request.signal.aborted) {
          setCatalog({
            status: "error",
            message: getApiErrorMessage(
              error,
              "No se pudieron cargar las categorías.",
            ),
          });
        }
      },
    );

    return () => request.abort();
  }, [attempt]);

  function retry() {
    setCatalog({ status: "loading" });
    setAttempt((previous) => previous + 1);
  }

  return { catalog, retry };
}
