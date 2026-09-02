import { NextResponse } from "next/server";

import {
  createTodo,
  createTodoSchema,
  listTodos,
} from "@/lib/todos";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Wystąpił nieznany błąd.";
}

export async function GET() {
  try {
    return NextResponse.json(await listTodos());
  } catch (error) {
    console.error("Nie udało się pobrać Todo:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const input = createTodoSchema.safeParse(await request.json());

    if (!input.success) {
      return NextResponse.json(
        { error: input.error.issues[0]?.message ?? "Niepoprawne dane." },
        { status: 400 },
      );
    }

    return NextResponse.json(await createTodo(input.data), { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Treść żądania musi być poprawnym JSON-em." },
        { status: 400 },
      );
    }

    console.error("Nie udało się utworzyć Todo:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
