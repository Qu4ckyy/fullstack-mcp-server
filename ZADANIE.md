# Zadanie 1: Todo sterowane przez AI — własny serwer MCP

## Kontekst

Modele językowe nie muszą ograniczać się do generowania tekstu. Dzięki protokołowi **Model Context Protocol (MCP)** mogą korzystać z narzędzi udostępnionych przez zewnętrzne aplikacje.

Twoim zadaniem jest stworzenie aplikacji Todo, którą użytkownik może obsługiwać na dwa sposoby:

1. przez interfejs webowy,
2. za pomocą rozmowy z modelem AI w ChatGPT lub Claude.

Oba interfejsy muszą korzystać z tych samych danych. Zadanie zakończy się wdrożeniem aplikacji oraz serwera MCP na platformie Vercel.

## Cel zadania

Po wykonaniu zadania:

- rozumiesz rolę klienta i serwera MCP,
- potrafisz udostępnić narzędzia zgodne z MCP,
- potrafisz opisać wejście narzędzia za pomocą schematu,
- obsługujesz wywołania narzędzi pochodzące z modelu AI,
- potrafisz wdrożyć zdalny serwer MCP i podłączyć go do klienta.

## Wymagania funkcjonalne


### 1. Serwer MCP

Serwer MCP powinien być dostępny zdalnie przez HTTPS i wykorzystywać transport **Streamable HTTP**.

Serwer udostępnia następujące narzędzia:

#### `list_todos`

Zwraca wszystkie zapisane elementy Todo.

#### `get_todo`

Zwraca jeden element Todo na podstawie jego identyfikatora.

Wejście:

- `id` — identyfikator elementu.

#### `create_todo`

Tworzy nowy element Todo.

Wejście:

- `title` — niepusta treść zadania.

#### `update_todo`

Aktualizuje istniejący element Todo.

Wejście:

- `id` — identyfikator elementu,
- `title` — opcjonalna nowa treść,
- `completed` — opcjonalny nowy stan wykonania.

Wywołanie musi zawierać przynajmniej jedno pole do zmiany.

#### `delete_todo`

Usuwa element Todo.

Wejście:

- `id` — identyfikator elementu.

### 4. Wspólne dane

Interfejs webowy i narzędzia MCP muszą korzystać z tego samego źródła danych.

Przykład:

1. użytkownik tworzy zadanie w interfejsie webowym,
2. następnie pyta model AI o listę zadań,
3. model powinien otrzymać również zadanie utworzone na stronie.

Analogicznie zmiany wykonane przez MCP powinny być widoczne w aplikacji webowej.
