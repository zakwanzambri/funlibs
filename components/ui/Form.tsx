import {useForm} from 'react-hook-form';
import type {ReactNode} from 'react';

type Props = {onSubmit: (data:any)=>void; children: (register:any)=>ReactNode};

export default function Form({onSubmit, children}: Props) {
  const {handleSubmit, register} = useForm();
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {children(register)}
    </form>
  );
}
