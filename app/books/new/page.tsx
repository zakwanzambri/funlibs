'use client';
import Form from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import {useRouter} from 'next/navigation';

export default function NewBook() {
  const router = useRouter();
  const onSubmit = async (data:any) => {
    await fetch('/api/books', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
    router.push('/books');
  };
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">New Book</h1>
      <Form onSubmit={onSubmit}>
        {(register:any) => (
          <>
            <input {...register('title')} placeholder="Title" className="border p-2 w-full" />
            <input {...register('author')} placeholder="Author" className="border p-2 w-full" />
            <textarea {...register('description')} placeholder="Description" className="border p-2 w-full" />
            <Button type="submit">Save</Button>
          </>
        )}
      </Form>
    </div>
  );
}
