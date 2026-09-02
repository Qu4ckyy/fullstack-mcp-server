"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Plus, RefreshCw, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { Todo } from "@/lib/todos";

type ErrorResponse = {
  error?: string;
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorResponse;
    throw new Error(body.error ?? "Nie udało się wykonać operacji.");
  }

  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTodos() {
    setError(null);

    try {
      setTodos(await request<Todo[]>("/api/todos"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nieznany błąd.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    request<Todo[]>("/api/todos")
      .then((data) => {
        if (!cancelled) setTodos(data);
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(
            caught instanceof Error ? caught.message : "Nieznany błąd.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newTitle.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const todo = await request<Todo>("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      setTodos((current) => [todo, ...current]);
      setNewTitle("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nieznany błąd.");
    } finally {
      setSaving(false);
    }
  }

  async function updateItem(id: string, changes: Partial<Todo>) {
    setError(null);

    try {
      const updated = await request<Todo>(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      setTodos((current) =>
        current.map((todo) => (todo.id === id ? updated : todo)),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nieznany błąd.");
      throw caught;
    }
  }

  async function removeItem(id: string) {
    setError(null);

    try {
      await request<void>(`/api/todos/${id}`, { method: "DELETE" });
      setTodos((current) => current.filter((todo) => todo.id !== id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nieznany błąd.");
    }
  }

  const completed = todos.filter((todo) => todo.completed).length;

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">Moje zadania</CardTitle>
            <CardDescription>
              {todos.length === 0
                ? "Dodaj pierwsze zadanie."
                : `${completed} z ${todos.length} ukończonych`}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Odśwież listę"
            onClick={() => void loadTodos()}
          >
            <RefreshCw />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form className="flex gap-2" onSubmit={addTodo}>
          <Input
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Co jest do zrobienia?"
            maxLength={200}
            aria-label="Tytuł nowego zadania"
          />
          <Button type="submit" disabled={saving || !newTitle.trim()}>
            {saving ? <LoaderCircle className="animate-spin" /> : <Plus />}
            Dodaj
          </Button>
        </form>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-8 text-muted-foreground">
            <LoaderCircle className="animate-spin" />
          </div>
        ) : todos.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Lista jest pusta.
          </p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <TodoRow
                key={todo.id}
                todo={todo}
                onUpdate={updateItem}
                onDelete={removeItem}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

type TodoRowProps = {
  todo: Todo;
  onUpdate: (id: string, changes: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function TodoRow({ todo, onUpdate, onDelete }: TodoRowProps) {
  const [title, setTitle] = useState(todo.title);
  const [pending, setPending] = useState(false);
  const titleChanged = title.trim() !== todo.title;

  async function run(operation: () => Promise<void>) {
    setPending(true);

    try {
      await operation();
    } finally {
      setPending(false);
    }
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border bg-background p-3">
      <Checkbox
        checked={todo.completed}
        disabled={pending}
        aria-label={`Oznacz „${todo.title}” jako wykonane`}
        onCheckedChange={(checked) =>
          void run(() => onUpdate(todo.id, { completed: checked === true }))
        }
      />
      <Input
        value={title}
        disabled={pending}
        maxLength={200}
        aria-label={`Tytuł zadania „${todo.title}”`}
        className={todo.completed ? "text-muted-foreground line-through" : ""}
        onChange={(event) => setTitle(event.target.value)}
      />
      {titleChanged && (
        <Button
          variant="secondary"
          size="icon"
          disabled={pending || !title.trim()}
          aria-label="Zapisz tytuł"
          onClick={() => void run(() => onUpdate(todo.id, { title }))}
        >
          <Save />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        disabled={pending}
        aria-label={`Usuń „${todo.title}”`}
        onClick={() => void run(() => onDelete(todo.id))}
      >
        <Trash2 />
      </Button>
    </li>
  );
}
