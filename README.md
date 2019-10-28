## 简介
此package用于kakfa消息重试。consumer如果处理kafka消息失败，需要对消息按照一定策略重试。

## 安装
使用npm：
```
npm install kafka-error-retry
```

## 方法介绍
* 创建一个错误处理实例，使用`getInstance`返回一个Handler实例。
* 注：KafkaErrorHandler是单例模式，只能通过`getInstance`来获取实例。
```
const handler = KafkaErrorHandler.getInstance(options)
```

* 初始化实例。Handler只能初始化一次。
* 初始化时，会连接kafka，并按需创建topic、分区、副本
* 初始化时，同时也会连接数据库，并按需创建数据库和数据表
```
handler.initialize()
```

* 运行task，重新处理kafka消息
```
handler.runRetryTask()
```

* 外部服务调用此方法发送错误消息给handler
```
// Handler会使用此函数接收kafka错误消息
handler.pushError({
  topic: "test",  // topic是必须的
  key: "test-1",  // key一般用来唯一区分一条数据
  value: "test data",  // kafka数据
  dataId: "1" // 数据的ID，用于区分消息
})
```

* 当消息处理成功后，外部服务调用此方法通知handler数据已经处理成功
```
handler.notifySuccess({
  topic: "test", // topic是必须的
  dataId: 1 //数据的ID，用于区分消息
})
```

## 实例options参数
```
{
    // 数据库配置
    db: {
      // 数据库类型
      type: "mysql",
      // 数据库地址
      host: "localhost",
      // 数据库端口
      port: 3306,
      // 数据库用户名
      username: "test",
      // 数据库密码
      password: "test",
      // 是否需要日志
      logging: true
    },

    // kafka配置
    kafka: {
      // 服务地址，多个kakfa以逗号分隔
      brokers: "127.0.0.1:9092",
      // 分区数
      partitions: 8,
      // 副本数
      replicas: 1
    },

    // 重试策略
    policy: {
      // 最大重试次数
      retryCount: 10,
      // 是否用backoff方法
      // 如果为true，重试间隔为Math.pow(2, retryCount)秒
      // 如果为false，重试间隔为retryCount秒
      backoff: true
    },
    
    // 定时任务执行规则，使用cron风格的定时规则
    scheduleRule: "1 * * * * *",
    
    // 日志输出
    logger: console.log
  }
```

## 使用方法

* 1.在服务启动时，获取实例并初始化，然后运行定时任务重新处理错误消息
```
let handler = KafkaErrorHandler.getInstance({
    db: {
      type: "mysql",
      host: "127.0.0.1",
      port: 3306,
      username: "root",
      password: "12345678",
      // database: "kafka-error-retry",
      logging: true
    },
    kafka: {
      brokers: "127.0.0.1:9092",
      partitions: 8,
      replicas: 1
    },
    policy: {
      retryCount: 10,
      backoff: true
    },
    scheduleRule: "1 * * * * *"
  })

  await handler.initialize()
  await handler.runRetryTask()
```

* 2.外部服务处理消息错误时，将错误消息发送给实例
```
  await handler.pushError({
    topic: "test",
    key: "test-1",
    value: "test data",
    dataId: "1"
  })
```

* 3.外部服务处理消息成功时，通知实例错误消息已经处理成功
```
  await handler.notifySuccess({
    topic: "test",
    dataId: 1
  })
```