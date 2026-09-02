import { NextResponse } from "next/server";

import {
  deleteTodo,
  getTodo,
  todoIdSchema,
  updateTodo,
  updateTodoSchema,
} from "@/lib/todos";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Wystąpił nieznany błąd.";
}

async function parseId(context: RouteContext) {
  const { id } = await context.params;
  return todoIdSchema.safeParse(id);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const id = await parseId(context);

    if (!id.success) {
      return NextResponse.json(
        { error: id.error.issues[0]?.message },
        { status: 400 },
      );
    }

    const todo = await getTodo(id.data);

    if (!todo) {
      return NextResponse.json(
        { error: "Nie znaleziono elementu Todo." },
        { status: 404 },
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Nie udało się pobrać Todo:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const id = await parseId(context);

    if (!id.success) {
      return NextResponse.json(
        { error: id.error.issues[0]?.message },
        { status: 400 },
      );
    }

    const input = updateTodoSchema.safeParse(await request.json());

    if (!input.success) {
      return NextResponse.json(
        { error: input.error.issues[0]?.message ?? "Niepoprawne dane." },
        { status: 400 },
      );
    }

    const todo = await updateTodo(id.data, input.data);

    if (!todo) {
      return NextResponse.json(
        { error: "Nie znaleziono elementu Todo." },
        { status: 404 },
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Treść żądania musi być poprawnym JSON-em." },
        { status: 400 },
      );
    }

    console.error("Nie udało się zaktualizować Todo:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const id = await parseId(context);

    if (!id.success) {
      return NextResponse.json(
        { error: id.error.issues[0]?.message },
        { status: 400 },
      );
    }

    if (!(await deleteTodo(id.data))) {
      return NextResponse.json(
        { error: "Nie znaleziono elementu Todo." },
        { status: 404 },
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Nie udało się usunąć Todo:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
