# @raystack/proton

TypeScript/JavaScript client library for Raystack APIs generated from Protocol Buffer definitions.

## Installation

```bash
npm install @raystack/proton
```

For browser applications using TanStack Query:
```bash
npm install @raystack/proton @tanstack/react-query
```

## Usage

### Browser (React)

```typescript
import { FrontierService } from '@raystack/proton/frontier';
import { createConnectTransport } from '@connectrpc/connect-web';
import { createPromiseClient } from '@connectrpc/connect';

const transport = createConnectTransport({
  baseUrl: 'https://api.example.com'
});

const client = createPromiseClient(FrontierService, transport);

const users = await client.listUsers({ pageSize: 10 });
```

### Node.js

```typescript
import { FrontierService } from '@raystack/proton/frontier';
import { createConnectTransport } from '@connectrpc/connect-node';
import { createPromiseClient } from '@connectrpc/connect';

const transport = createConnectTransport({
  baseUrl: 'https://api.example.com',
  httpVersion: '2'
});

const client = createPromiseClient(FrontierService, transport);

const users = await client.listUsers({ pageSize: 10 });
```

### With TanStack Query

```typescript
import { FrontierServiceQueries } from '@raystack/proton/frontier';
import { useQuery } from '@tanstack/react-query';

function UsersList() {
  const { data, isLoading } = useQuery(
    FrontierServiceQueries.listUsers(transport, { pageSize: 10 })
  );

  if (isLoading) return <div>Loading...</div>;
  
  return (
    <ul>
      {data?.users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## Available Services

- `@raystack/proton/frontier` - Frontier API
- `@raystack/proton/compass` - Compass API  
- `@raystack/proton/assets` - Assets API
- `@raystack/proton/guardian` - Guardian API
- `@raystack/proton/entropy` - Entropy API
- `@raystack/proton/optimus` - Optimus API
- `@raystack/proton/predator` - Predator API
- `@raystack/proton/raccoon` - Raccoon API
- `@raystack/proton/siren` - Siren API
- `@raystack/proton/stencil` - Stencil API
- `@raystack/proton/common` - Common utilities

Each service export includes:
- Service client (e.g., `FrontierService`)
- TanStack Query helpers (e.g., `FrontierServiceQueries`) - optional
- TypeScript types and interfaces

## Dependencies

This package requires:
- `@bufbuild/protobuf` - Protocol Buffer runtime
- `@connectrpc/connect` - Connect RPC library
- `@connectrpc/connect-query` - Connect Query integration

Optional peer dependencies:
- `@tanstack/react-query` - For query hooks (browser only)

## Documentation

For complete API documentation, visit the [Raystack Documentation](https://raystack.org/).

## Repository

Source code and protobuf definitions: [raystack/proton](https://github.com/raystack/proton)

## License

Apache 2.0