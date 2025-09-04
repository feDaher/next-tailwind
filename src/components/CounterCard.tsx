'use client'
import { useState } from 'react';

type CounterCardProps = {
  title: string;
  initial?: number;
}

export default function CounterCard({ title, initial = 0 }: CounterCardProps) {
  const [count, setCount] = useState(initial);
  return (
    <div className='rounded-2xl border border-zinc-300 dark:border-zinc-800'>
      <h3 className='text-lg font-semibold mb-3'>{title}</h3>
      <p className='text-4xl fount-bold mt-3'>{count}</p>
      <div className='flex gap-x-7 m-5'>
        <button className='px-3 py-2 rounded-lg border hover:bg-zinc-100'
          onClick={() => setCount(c => c + 1)}
        >  
          +1
        </button>
        <button className='px-3 py-2 rounded-lg border hover:bg-zinc-100'
          onClick={() => setCount(c => c - 1)}
        >
          -1
        </button>
        <button className='px-3 py-2 rounded-lg border hover:bg-zinc-100'
          onClick={() => setCount(initial)}
        >
          Limpar
        </button>
      </div>
    </div>
  )
};
