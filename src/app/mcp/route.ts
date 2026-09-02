import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

import {
  createTodo,
  createTodoSchema,
  deleteTodo,
  getTodo,
  listTodos,
  todoIdSchema,
  updateTodo,
  updateTodoSchema,
} from "@/lib/todos";

function result(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function failure(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

type ToolResponse = ReturnType<typeof result> | ReturnType<typeof failure>;

async function runTool(
  operation: () => Promise<ToolResponse>,
): Promise<ToolResponse> {
  try {
    return await operation();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Wystąpił nieznany błąd.";
    return failure(message);
  }
}

const handler = createMcpHandler((server) => {
  server.registerTool(
    "list_todos",
    {
      title: "Lista Todo",
      description: "Zwraca wszystkie elementy Todo.",
      inputSchema: z.object({}),
    },
    () => runTool(async () => result(await listTodos())),
  );

  server.registerTool(
    "get_todo",
    {
      title: "Pobierz Todo",
      description: "Zwraca jeden element Todo na podstawie identyfikatora.",
      inputSchema: z.object({ id: todoIdSchema }),
    },
    ({ id }) =>
      runTool(async () => {
        const todo = await getTodo(id);
        return todo ? result(todo) : failure("Nie znaleziono elementu Todo.");
      }),
  );

  server.registerTool(
    "create_todo",
    {
      title: "Utwórz Todo",
      description: "Tworzy nowy element Todo z podanym tytułem.",
      inputSchema: createTodoSchema,
    },
    (input) => runTool(async () => result(await createTodo(input))),
  );

  server.registerTool(
    "update_todo",
    {
      title: "Aktualizuj Todo",
      description:
        "Zmienia tytuł lub stan wykonania istniejącego elementu Todo.",
      inputSchema: updateTodoSchema.safeExtend({ id: todoIdSchema }),
    },
    ({ id, ...input }) =>
      runTool(async () => {
        const todo = await updateTodo(id, input);
        return todo ? result(todo) : failure("Nie znaleziono elementu Todo.");
      }),
  );

  server.registerTool(
    "delete_todo",
    {
      title: "Usuń Todo",
      description: "Usuwa element Todo o podanym identyfikatorze.",
      inputSchema: z.object({ id: todoIdSchema }),
    },
    ({ id }) =>
      runTool(async () => {
        return (await deleteTodo(id))
          ? result({ deleted: true, id })
          : failure("Nie znaleziono elementu Todo.");
      }),
  );
});

export { handler as GET, handler as POST };
