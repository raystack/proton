# Proton

This repository is home for the protocol buffer files which are used throughout ODPF ecosystem.

### Why a single protos repository?
Following are the considerations for going with single repository:
- We want to keep proto files version independent of services that use them. This is to avoid the version of the proto gets incremented along with the service despite no changes to the proto.
- Validation, generation, and other proto-related operations can be placed in one place. Thus, avoid duplication.
- We also see good possibility to reuse proto schema. Have it in one place make it easy to import proto.
## Usage
Proton may not provide all the artifacts you need. There could be cases where you want to package the proto differently. For example, you may need only a set of proto files compiled using a custom plugin like [gogo](https://github.com/gogo/protobuf). For such cases, you can pull the proto and compile it yourself.

<p align="center"><img src="./docs/assets/usage.svg" /></p>

## Structure
Proton has flat structure where proto files are put under `/src/odpf/proton/<application>/`.

## Contribute
Prerequisite: You need to have [buf](https://buf.build/) installed

You can add proto files when you need to introduce proto for ODPF projects. If you need to modify proto files, you need to ensure backward compatibility. To ensure the backward compatibility of your changes, you can run
```
buf breaking --against '.git#branch=master'
```

## License
Proton is [Apache 2.0](LICENSE) licensed.
