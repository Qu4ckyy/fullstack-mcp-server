# Todo MCP

Minimalna aplikacja Todo z interfejsem webowym, REST API i serwerem MCP.

## Uruchomienie

1. Skopiuj `.env.example` do `.env.local`.
2. Uzupełnij `MONGODB_URI` danymi połączenia z MongoDB.
3. Zainstaluj zależności i uruchom serwer:

```bash
npm run dev
```

Interfejs będzie dostępny pod adresem [http://localhost:3000](http://localhost:3000).

## Endpointy

- REST API: `/api/todos`
- MCP Streamable HTTP: `/mcp`

Serwer MCP udostępnia narzędzia:

- `list_todos`
- `get_todo`
- `create_todo`
- `update_todo`
- `delete_todo`

## Sprawdzenie

```bash
npm run lint
npm run build
```
