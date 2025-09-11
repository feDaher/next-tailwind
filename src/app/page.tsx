'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';

type Theme = 'light' | 'dark';
type Status = 'backlog' | 'doing' | 'done';

export type Task = {
  id: string;
  title: string;
  status: Status;
  done: boolean;
  createdAt: number;
};

type Filter = 'all' | 'open' | 'done';

const STORAGE_KEY = 'taskboard:v1';

export default function Home() {
  const [theme, setTheme] = useState<Theme>('light');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Task[] = JSON.parse(raw);
        setTasks(parsed);
      } else {
        setTasks([
          { id: uuid(), title: 'Explorar requisitos', status: 'backlog', done: false, createdAt: Date.now() },
          { id: uuid(), title: 'Criar layout base', status: 'doing', done: false, createdAt: Date.now() },
          { id: uuid(), title: 'Configurar Tailwind', status: 'done', done: true, createdAt: Date.now() },
        ]);
      }
    } catch (error) { 
      throw error;
     }
  }, []);


  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  const addTask = (title: string, status: Status = 'backlog') => {
    if (!title.trim()) return;
    setTasks(prev => [
      { id: uuid(), title: title.trim(), status, done: status === 'done', createdAt: Date.now() },
      ...prev,
    ]);
  };

  const updateTask = (id: string, patch: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return tasks.filter(t => {
      const matchesQuery = !q || t.title.toLowerCase().includes(q);
      const matchesFilter =
        filter === 'all' ? true : filter === 'done' ? t.done : !t.done;
      return matchesQuery && matchesFilter;
    });
  }, [tasks, query, filter]);

  const dragTaskIdRef = useRef<string | null>(null);

  const onDragStart = (id: string) => (e: React.DragEvent) => {
    dragTaskIdRef.current = id;
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDropColumn = (status: Status) => (e: React.DragEvent) => {
    e.preventDefault();
    const id = dragTaskIdRef.current || e.dataTransfer.getData('text/plain');
    if (!id) return;
    updateTask(id, { status, done: status === 'done' });
    dragTaskIdRef.current = null;
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const Column = ({
    status,
    title,
  }: {
    status: Status;
    title: string;
  }) => {
    const items = filtered.filter(t => t.status === status);
    return (
      <section
        onDrop={onDropColumn(status)}
        onDragOver={onDragOver}
        className="flex-1 min-h-[60vh] bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-3 border border-zinc-200 dark:border-zinc-700"
      >
        <header className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {title} <span className="text-xs text-zinc-500">({items.length})</span>
          </h2>
          <button
            onClick={() => addTask(prompt(`Nova tarefa em ${title}`) || '', status)}
            className="text-sm px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            + Add
          </button>
        </header>

        <div className="space-y-2">
          {items.map(task => (
            <article
              key={task.id}
              draggable
              onDragStart={onDragStart(task.id)}
              className="group cursor-grab active:cursor-grabbing rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-sm hover:shadow"
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 size-4"
                  checked={task.done}
                  onChange={(e) =>
                    updateTask(task.id, {
                      done: e.target.checked,
                      status: e.target.checked ? 'done' : task.status === 'done' ? 'backlog' : task.status,
                    })
                  }
                  title="Marcar como concluída"
                />
                <div className="flex-1">
                  <div
                    className={`text-sm leading-5 ${
                      task.done ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => {
                        const t = prompt('Editar título', task.title);
                        if (t !== null) updateTask(task.id, { title: t });
                      }}
                      className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 dark:border-red-700"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {items.length === 0 && (
            <div className="text-sm text-zinc-500 italic py-6 text-center">
              Arraste tarefas para cá ou clique em “+ Add”.
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/60 bg-white/95 dark:bg-zinc-900/95 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <h1 className="text-lg font-semibold">Taskboard — Mini Trello</h1>
          <div className="ml-auto flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar tarefas..."
              className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 w-56"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              title="Filtro"
            >
              <option value="all">Todas</option>
              <option value="open">Abertas</option>
              <option value="done">Concluídas</option>
            </select>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              title="Alternar tema"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={() => {
                const t = prompt('Título da nova tarefa');
                if (t) addTask(t);
              }}
              className="px-3 py-2 text-sm rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20"
            >
              + Nova
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Column status="backlog" title="Backlog" />
          <Column status="doing" title="Doing" />
          <Column status="done" title="Done" />
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-8 text-xs text-zinc-500">
        Dica: arraste cartões entre colunas • clique no título para editar • use o checkbox para concluir.
      </footer>
    </div>
  );
}
