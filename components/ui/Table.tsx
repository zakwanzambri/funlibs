import React from 'react';

/**
 * Generic table component that renders data rows using a render function.
 *
 * @param headers Column headers for the table.
 * @param data Array of data objects to display.
 * @param renderRow Function that returns table cells for a given row.
 */
export interface TableProps<T> {
  headers: string[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
}

export function Table<T>({ headers, data, renderRow }: TableProps<T>) {
  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table">
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          {headers.map((h) => (
            <th
              key={h}
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {data.map((item, idx) => (
          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            {renderRow(item, idx)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
