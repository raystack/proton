# Proton

This repository contains the original interface definitions of all APIs that support both REST and gRPC protocols. Reading the original interface definitions can provide a better understanding of APIs and help you to utilize them more efficiently. You can also use these definitions with open source tools to generate client libraries, documentation, and other artifacts.

## Overview

The APIs are typically deployed as API services that are hosted under different DNS names. One API service may implement multiple APIs and multiple versions of the same API.

The APIs use [Protocol Buffers](https://github.com/google/protobuf) version 3 (proto3) as their Interface Definition Language (IDL) to define the API interface and the structure of the payload messages. The same interface definition is used for both REST and RPC versions of the API, which can be accessed over different wire protocols.

There are several ways of accessing the APIs:

1.  JSON over HTTP: You can access all APIs directly using JSON over HTTP, using any API client libraries.
2.  Protocol Buffers over gRPC: You can access APIs published in this repository through [GRPC](https://github.com/grpc), which is a high-performance binary RPC protocol over HTTP/2. It offers many useful features, including request/response multiplex and full-duplex streaming.

## Structure

This repository uses a directory hierarchy that reflects the API product structure. In general, every API has its own root directory, and each major version of the API has its own subdirectory. The proto package names exactly match the directory: this makes it easy to locate the proto definitions and ensures that the generated client libraries have idiomatic namespaces in most programming languages.

## Usage

Proton does not provide compiled language specific proto files or the descriptor sets for the respective protos. It is upto the users to pull these protos and use `protoc` or `buf` for language specific compiled files and have dependencies/imports in their code.

<p align="center"><img src="./docs/assets/usage.svg" /></p>

## Guide

To generate gRPC source code for Google APIs in this repository, you first need to install buf on your local machine.

### Generating go code using buf

**_This guide is last tried on buf version `1.5.0`._**

Add this `buf.gen.yaml` at the root folder.

```yaml
version: v1beta1
plugins:
  - name: go
    out: dst
    opt: paths=source_relative
```

Run below command to generate your proto to `/dst` folder.

```
$ buf generate
```

Use below command if you just want to target specific package/folder

```
$ buf generate --path gotocompany/assets
```

## Contribute

<details>
  <summary>Prerequisites:</summary>
  
- [Buf](https://docs.buf.build/installation)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

</details>

You can run following command for linting protobuf files

```sh
$ buf lint
```

You can add proto files when you need to introduce proto for all projects. If you need to modify proto files, you need to ensure backward compatibility. To ensure the backward compatibility of your changes, you can run

```
$ buf breaking --against '.git#branch=master'
```

## License

Proton is [Apache 2.0](LICENSE) licensed.
