import { graphqlClient } from "util/graphql";
import { syncUpdates, syncDeletes } from "./graphqlCacheHelpers";

const getUpdateContent = (type, resp) => {
  const singleResult = resp[`update${type}`] || resp[`create${type}`];
  const result = singleResult ? singleResult[type] || singleResult[`${type}s`] : resp[`update${type}s`][`${type}s`];
  return Array.isArray(result) ? result : [result];
};

export const graphqlSyncAndRefresh = (type, queries, { sort, onUpdate, onDelete } = {} as any) => {
  if (!Array.isArray(queries)) {
    queries = [queries];
  }

  graphqlClient.subscribeMutation([
    {
      when: new RegExp(`(update|create)${type}s?`),
      run: ({ refreshActiveQueries }, resp, variables) => {
        queries.forEach(query => {
          if (onUpdate) {
            onUpdate(resp, variables, refreshActiveQueries);
          } else {
            syncUpdates(query, getUpdateContent(type, resp), `all${type}s`, `${type}s`, { sort });
          }
        });
        queries.forEach(q => refreshActiveQueries(q));
      }
    },
    {
      when: new RegExp(`delete${type}`),
      run: ({ refreshActiveQueries }, resp, variables) => {
        queries.forEach(query => {
          if (onDelete) {
            onDelete(resp, variables, refreshActiveQueries);
          } else {
            syncDeletes(query, [variables._id], `all${type}s`, `${type}s`, { sort });
          }
        });

        queries.forEach(q => refreshActiveQueries(q));
      }
    }
  ]);
};
