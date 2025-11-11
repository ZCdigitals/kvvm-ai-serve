# KVVM AI Serve

KVVM AI Serve

## 开发

### 控制器

采用薄 `controller` 设计, 业务逻辑应在 `service` 中实现.

`controller` 中应当只有验证参数和简单流程.

### 模型

因为使用了 `typegoose`, 必须在使用 `model` 的 `controller` 或 `service` 里使用 `getModelForClass`导出模型

为了减小耦合, 应当只在 `service` 中使用模型.

如果在 `model/modelName.ts `导出, 则很可能导致运行时才能发现的循环依赖报错

### 服务

默认注册有 restful 的 crud 接口, 但是只能操作 `mongoose` 连接中注册了的模型

如果新添加了模型 A, 但是没有任何一个控制器和路由依赖它(未挂载到 `app` 的依赖链上, 未注册到 `mongoose` 里), 则无法操作

[get]/model/dict 接口返回中也不会有 A.

### Utils

utils中的函数必须是没有副作用的, 即不能改变函数作用域以外的变量, 也不能依赖当前文件和node_modules以外的东西

## 构建

### Docker image

```bash
docker build -t kvvm-ai-serve .
```
