'use client';
import {useRouter, useParams} from 'next/navigation';
import {useEffect, useState} from 'react';
import Form from '@/components/ui/Form';
import Button from '@/components/ui/Button';

export default function EditBook() {
  const router = useRouter();
  const params = useParams();
  const [book, setBook] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/books/${params.id}`).then(res => res.json()).then(setBook);
  }, [params.id]);

  const onSubmit = async (data:any) => {
    await fetch(`/api/books/${params.id}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
    router.push('/books');
  };

  if (!book) return <div className="p-4">Loading...</div>;
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Edit Book</h1>
      <Form onSubmit={onSubmit}>
        {(register:any) => (
          <>
            <input defaultValue={book.title} {...register('title')} className="border p-2 w-full" />
            <input defaultValue={book.author} {...register('author')} className="border p-2 w-full" />
            <textarea defaultValue={book.description} {...register('description')} className="border p-2 w-full" />
            <Button type="submit">Update</Button>
          </>
        )}
      </Form>
    </div>
  );
}
