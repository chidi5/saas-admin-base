import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
/**
 * Create a QueryClient configured with the application's default options.
 *
 * The client sets query `staleTime` to 30 seconds and dehydrates queries when the
 * library's default predicate is satisfied or when a query's state status is
 * `"pending"`.
 *
 * @returns A new QueryClient instance configured with the described defaults
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        // serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        // deserializeData: superjson.deserialize,
      },
    },
  });
}