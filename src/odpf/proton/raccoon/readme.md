This folder contains the schema of request and response used in [Raccoon](https://github.com/odpf/raccoon). Raccoon's client uses `EventRequest` to push `Event`s to Raccoon. Raccoon supports arbitrary event schema by accepting it in byte form. The response can be handled by parsing the byte returned with `EventResponse`.

### How to use
First, you need to [compile](https://developers.google.com/protocol-buffers/docs/reference/overview) the protos. Serialize events you want to send as bytes. After that, you can use the compiled proto to build the `EventRequest` and send it via Raccoon's supported protocol. For details of the schema, you can open each protos and read the field description.

For example of how to build the protos, you can see Raccoon's `Makefile`.
