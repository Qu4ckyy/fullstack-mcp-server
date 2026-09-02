import { TodoApp } from "@/components/todo-app";

export default function Home() {
  return (
    <main className="min-h-screen bg-muted/40 px-4 py-12 sm:py-20">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Technischools · MCP
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Todo przez AI
          </h1>
          <p className="text-muted-foreground">
            Zarządzaj zadaniami tutaj albo połącz model AI z endpointem{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
              /mcp
            </code>
            .
          </p>
        </header>
        <TodoApp />
        <p className="text-center text-xs text-muted-foreground">
          Publiczna wersja demonstracyjna — nie zapisuj danych wrażliwych.
        </p>
      </div>
    </main>
  );
}
