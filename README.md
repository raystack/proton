# Proton

This repository is home for the [protocol buffer](https://developers.google.com/protocol-buffers) files which are used throughout ODPF ecosystem.

### Why a single protos repository?
Following are the considerations for going with single repository:
- This repository contains protocol buffers that have common patterns and APIs that services can reuse instead of spending effort in writing these protobufs. Each subdirectory contains details of the respective protos.
- Validation, generation, and other proto-related operations can be placed in one place. Thus, avoid duplication.
- We also see good possibility to reuse proto schema. Have it in one place make it easy to import proto.

## Usage
Proton does not provide compiled language specific proto files or the descriptor sets for the respective protos. It is upto the users to pull these protos and use `protoc` for language specific compiled files and have dependencies/imports in their code.

<p align="center"><img src="./docs/assets/usage.svg" /></p>

## Structure
Proton has flat structure where proto files are put under /odpf/proton/\<application\>/. Each application's sub directory read me provides details on how to use the respective proto.

## Guide

### Generating go code using buf

***This guide is last tried on buf version `1.5.0`.***

Add this `buf.gen.yaml` at the root folder.

```
version: v1beta1
plugins:
  - name: go
    out: dst
    opt: paths=source_relative
```

Run below command to generate your proto to `/dst` folder.

```
buf generate
```

Use below command if you just want to target specific package/folder
```
buf generate --path odpf/assets
```

## Contribute
Prerequisite: You need to have [buf](https://buf.build/) installed

You can add proto files when you need to introduce proto for ODPF projects. If you need to modify proto files, you need to ensure backward compatibility. To ensure the backward compatibility of your changes, you can run
```
buf breaking --against '.git#branch=master'
```

## License
Proton is [Apache 2.0](LICENSE) licensed.
