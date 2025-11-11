# Coturn

```bash
# pull image
docker pull coturn/coturn

# run container
docker run -d --name coturn-dev -p 3478:3478 -p 3478:3478/udp -p 50000-50010:50000-50010/udp -v $(pwd)/coturn/turnserver.conf:/etc/coturn/turnserver.conf coturn/coturn

# test
# 测试UDP协议
turnutils_uclient -v -u 1757774233:68c420f1131563afb295af20 -w LjDHWbvav7PBtbjXisN/MgrXeXI= test.zcdigitals.com

# 测试TCP协议
turnutils_uclient -v -t -u 1757774233:68c420f1131563afb295af20 -w LjDHWbvav7PBtbjXisN/MgrXeXI= test.zcdigitals.com

# 测试TLS协议
turnutils_uclient -v -S -u 1757774233:68c420f1131563afb295af20 -w LjDHWbvav7PBtbjXisN/MgrXeXI= test.zcdigitals.com

# 指定端口测试
turnutils_uclient -v -u 1757774233:68c420f1131563afb295af20 -w LjDHWbvav7PBtbjXisN/MgrXeXI= test.zcdigitals.com -p 3478
```
