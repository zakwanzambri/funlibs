import type {ReactNode} from 'react';

type Props = {headers: string[]; children: ReactNode};

export default function Table({headers, children}: Props) {
  return (
    <table className="min-w-full border">
      <thead>
        <tr>{headers.map(h => <th key={h} className="p-2 border-b text-left">{h}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
