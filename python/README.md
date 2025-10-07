# Raystack Proton Python

Python client library for Raystack services, generated from Protocol Buffer definitions.

## Installation

```bash
pip install raystack-proton
```

## Usage

### Using Frontier Admin Service

```python
from connectrpc.client import ConnectClient
from raystack.frontier.v1beta1 import admin_connect, admin_pb2

# Create the client
client = ConnectClient(
    base_url="https://your-frontier-api.com",
    headers={"Authorization": "Bearer YOUR_TOKEN"}  # Optional auth
)

# Create the admin service client
admin_client = admin_connect.AdminServiceClient(client)

# Check federated resource permission
request = admin_pb2.CheckFederatedResourcePermissionRequest(
    resource="resource_id",
    permission="permission_name",
    subject="user_id"
)
response = admin_client.check_federated_resource_permission(request)

print(f"Allowed: {response.status}")
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
