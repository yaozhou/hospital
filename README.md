#yuyue

安装
npm install 

react-native run-android   编译开发板并安装
cd android && ./gradlew assembleRelease 编译release版

cp config.json.tmplate config.json
如果要发布还需要设置签名文件，android/app/yuyue.keystore


todo : 
apk地址更新 
deviceInfo 要蓝牙权限?
打包要加说明文字
挂到测试号的时候 "医生数据错误"

修改科室适配还需处理医生页数问题
tip 两台以上手机同时挂号
挂号失败会息屏 (访问次数过多时)


nohup log-server -p 22222 -d /home/yao/develop/app_log &

