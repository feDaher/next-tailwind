'use client';

import CounterCard from "@/components/CounterCard";
import { useState, useEffect } from 'react';

type Task = {
  id: string;
  title: string;
  done: boolean;
}

type theme = 'light' | 'dark';

export default function Home() {
  const [theme, setTheme] = useState<theme>('light');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [query, setQuery] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {

  }, [tasks])

  return (
    <div>

      <div>
        <CounterCard 
          title="CONTADOR"
        />
      </div>
    </div>
  );
}
