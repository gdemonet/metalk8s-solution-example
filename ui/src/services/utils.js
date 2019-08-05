import { createSelector } from 'reselect';
import { sortBy as sortByArray } from 'lodash';

export const sortSelector = createSelector(
  (list, sortBy, sortDirection) => {
    const sortedList = sortByArray(list, [
      item => {
        return typeof item[sortBy] === 'string'
          ? item[sortBy].toLowerCase()
          : item[sortBy];
      }
    ]);

    if (sortDirection === 'DESC') {
      sortedList.reverse();
    }
    return sortedList;
  },
  list => list
);
