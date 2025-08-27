'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Dropzone from 'react-dropzone';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  year: z.number().int().nonnegative(),
  status: z.enum(['available', 'checked-out']),
});

type FormData = z.infer<typeof schema>;

export default function BookForm({ book }: { book?: any }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: book || { status: 'available' }
  });

  async function onSubmit(values: FormData) {
    let coverUrl = book?.coverUrl;
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      coverUrl = data.url;
    }
    const method = book ? 'PUT' : 'POST';
    const url = book ? `/api/books/${book._id}` : '/api/books';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, coverUrl })
    });
    router.push('/books');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} placeholder="Title" />
      {errors.title && <p>{errors.title.message}</p>}
      <input {...register('author')} placeholder="Author" />
      {errors.author && <p>{errors.author.message}</p>}
      <input type="number" {...register('year', { valueAsNumber: true })} placeholder="Year" />
      {errors.year && <p>{errors.year.message}</p>}
      <select {...register('status')}>
        <option value="available">Available</option>
        <option value="checked-out">Checked Out</option>
      </select>
      <Dropzone onDrop={acceptedFiles => setFile(acceptedFiles[0])}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} style={{ border: '1px dashed #ccc', padding: '20px', marginTop: '10px' }}>
            <input {...getInputProps()} />
            {file ? file.name : 'Drag and drop cover image here'}
          </div>
        )}
      </Dropzone>
      <button type="submit">{book ? 'Update' : 'Create'} Book</button>
    </form>
  );
}
