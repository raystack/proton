# Raystack Proton Python

Python client library for Raystack services, generated from Protocol Buffer definitions.

**PyPI:** https://pypi.org/project/raystack-proton/

## Installation

```bash
pip install raystack-proton
```

This will automatically install the required dependencies:
- `connect-python>=0.5.0` - Connect RPC client
- `googleapis-common-protos>=1.50.0` - Common Google API types
- `grpcio>=1.50.0` - gRPC runtime
- `protobuf>=4.21.0,<7.0.0` - Protocol Buffer runtime

## Usage

This library uses [Connect RPC](https://github.com/connectrpc/connect-python) for communication with Raystack services.

### Synchronous Client

```python
from raystack.frontier.v1beta1 import admin_connect, admin_pb2

# Create client
admin_client = admin_connect.AdminServiceClientSync("http://localhost:8082")

# Make request with authentication headers
request = admin_pb2.CheckFederatedResourcePermissionRequest(
    subject="user:<user-id>",
    resource="app/organization:<org-id>",
    permission="get"
)

response = admin_client.check_federated_resource_permission(
    request,
    headers={"Authorization": "<auth-token>"}
)
print(f"Has permission: {response.status}")
```

### Async Client

```python
import asyncio
from raystack.frontier.v1beta1 import admin_connect, admin_pb2

async def check_permission():
    admin_client = admin_connect.AdminServiceClient("http://localhost:8082")

    request = admin_pb2.CheckFederatedResourcePermissionRequest(
        subject="user:<user-id>",
        resource="app/organization:<org-id>",
        permission="get"
    )

    response = await admin_client.check_federated_resource_permission(
        request,
        headers={"Authorization": "<auth-token>"}
    )
    print(f"Has permission: {response.status}")

# Run the async function
asyncio.run(check_permission())
```

## Development

### Building

```bash
make build
```

Or using Python:

```bash
python3 build.py build
```

## License

Apache-2.0
