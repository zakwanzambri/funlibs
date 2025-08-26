import {getBooks} from '@/services/bookService';
import Table from '@/components/ui/Table';
import Link from 'next/link';

export default async function BooksPage() {
  const books = await getBooks();
  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Books</h1>
        <Link href="/books/new" className="text-blue-600">Add Book</Link>
      </div>
      <Table headers={['Title','Author']}>
        {books.map((b:any)=>(<tr key={b._id}><td className="p-2">{b.title}</td><td className="p-2">{b.author}</td></tr>))}
      </Table>
    </div>
  );
}
