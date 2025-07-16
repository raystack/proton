# Proton

This repository contains the original interface definitions of Raystack APIs that support both REST and gRPC protocols. Reading the original interface definitions can provide a better understanding of Raystack APIs and help you to utilize them more efficiently. You can also use these definitions with open source tools to generate client libraries, documentation, and other artifacts.

## Overview

Raystack APIs are typically deployed as API services that are hosted under different DNS names. One API service may implement multiple APIs and multiple versions of the same API.

Raystack APIs use [Protocol Buffers](https://github.com/google/protobuf) version 3 (proto3) as their Interface Definition Language (IDL) to define the API interface and the structure of the payload messages. The same interface definition is used for both REST and RPC versions of the API, which can be accessed over different wire protocols.

There are several ways of accessing Raystack APIs:

1.  JSON over HTTP: You can access all Raystack APIs directly using JSON over HTTP, using any API client libraries.
2.  Protocol Buffers over gRPC: You can access Raystack APIs published in this repository through [GRPC](https://github.com/grpc), which is a high-performance binary RPC protocol over HTTP/2. It offers many useful features, including request/response multiplex and full-duplex streaming.

## Structure

This repository uses a directory hierarchy that reflects the Raystack API product structure. In general, every API has its own root directory, and each major version of the API has its own subdirectory.

The proto package names exactly match the directory: this makes it easy to locate the proto definitions and ensures that the generated client libraries have idiomatic namespaces in most programming languages.

## Usage

Proton does not provide compiled language specific proto files or the descriptor sets for the respective protos. It is upto the users to pull these protos and use `protoc` or `buf` for language specific compiled files and have dependencies/imports in their code.

To generate gRPC source code for Protobuf APIs in this repository, you first need to install buf on your local machine. For next step, add `buf.gen.yaml` at the root of your project.

```yaml
version: v1
plugins:
  - name: go
    out: api
    opt: paths=source_relative
```

Run below command to generate your proto to `/api` folder.

```
buf generate
```

Use below command if you just want to target specific package/folder

```
buf generate --path raystack/assets
```

Check out Compass [implementation](https://github.com/raystack/compass) for reference.

## JavaScript/TypeScript Client

A pre-built JavaScript/TypeScript client package is available for browser and Node.js environments:

### Installation

```bash
npm install @raystack/proton
```

For browser applications using TanStack Query:
```bash
npm install @raystack/proton @tanstack/react-query
```

### Usage

#### Browser Example (React)

```typescript
import { FrontierService } from '@raystack/proton/frontier';
import { createConnectTransport } from '@connectrpc/connect-web';
import { createPromiseClient } from '@connectrpc/connect';

// Create transport
const transport = createConnectTransport({
  baseUrl: 'https://api.example.com'
});

// Create client
const client = createPromiseClient(FrontierService, transport);

// Use the client
async function listUsers() {
  const response = await client.listUsers({
    pageSize: 10
  });
  return response.users;
}
```

#### With TanStack Query

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

#### Node.js Example

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
console.log(users);
```

### Available Services

The package provides exports for all Raystack services:
- `@raystack/proton/frontier` - Frontier API
- `@raystack/proton/compass` - Compass API
- `@raystack/proton/assets` - Assets API
- `@raystack/proton/guardian` - Guardian API
- And more...

Each service export includes:
- Service client (e.g., `FrontierService`)
- TanStack Query helpers (e.g., `FrontierServiceQueries`) - optional
- TypeScript types and interfaces

## Contribute

<details>
  <summary>Prerequisites:</summary>
  
- [Buf](https://docs.buf.build/installation)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

</details>

You can run following command for linting protobuf files

```sh
buf lint
```

Run following command to format protobuf files

```sh
buf format -w
```

You can run following command for formatting protobuf files

```sh
$ buf format -w
```

You can add proto files when you need to introduce proto for Raystack projects. If you need to modify proto files, you need to ensure backward compatibility. To ensure the backward compatibility of your changes, you can run

```sh
buf breaking --against '.git#branch=master'
```

## License

Proton is [Apache 2.0](LICENSE) licensed.
