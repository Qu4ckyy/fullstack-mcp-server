import { ObjectId, type WithId } from "mongodb";
import { z } from "zod";

import { getDatabase } from "@/lib/mongodb";

export const todoIdSchema = z
  .string()
  .regex(/^[0-9a-f]{24}$/i, "Identyfikator Todo jest niepoprawny.");

export const createTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Tytuł nie może być pusty.")
    .max(200, "Tytuł może mieć maksymalnie 200 znaków."),
});

export const updateTodoSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Tytuł nie może być pusty.")
      .max(200, "Tytuł może mieć maksymalnie 200 znaków.")
      .optional(),
    completed: z.boolean().optional(),
  })
  .refine(
    ({ title, completed }) => title !== undefined || completed !== undefined,
    "Podaj przynajmniej jedno pole do zmiany.",
  );

type TodoDocument = {
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

function serializeTodo(todo: WithId<TodoDocument>): Todo {
  return {
    id: todo._id.toHexString(),
    title: todo.title,
    completed: todo.completed,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

async function getCollection() {
  const database = await getDatabase();
  return database.collection<TodoDocument>("todos");
}

export async function listTodos(): Promise<Todo[]> {
  const collection = await getCollection();
  const todos = await collection.find().sort({ createdAt: -1 }).toArray();

  return todos.map(serializeTodo);
}

export async function getTodo(id: string): Promise<Todo | null> {
  const collection = await getCollection();
  const todo = await collection.findOne({ _id: new ObjectId(id) });

  return todo ? serializeTodo(todo) : null;
}

export async function createTodo(input: z.infer<typeof createTodoSchema>) {
  const collection = await getCollection();
  const now = new Date();
  const document: TodoDocument = {
    title: input.title,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(document);

  return serializeTodo({ ...document, _id: result.insertedId });
}

export async function updateTodo(
  id: string,
  input: z.infer<typeof updateTodoSchema>,
): Promise<Todo | null> {
  const collection = await getCollection();
  const todo = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  return todo ? serializeTodo(todo) : null;
}

export async function deleteTodo(id: string): Promise<boolean> {
  const collection = await getCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });

  return result.deletedCount === 1;
}
