#yuyue

安装
npm install 

react-native run-android   编译开发板并安装
cd android && ./gradlew assembleRelease 编译release版

cp config.json.tmplate config.json
如果要发布还需要设置签名文件，android/app/yuyue.keystore


todo : 
修改科室适配还需处理医生页数问题
定时重新登陆,刷新cookie
预约配置中的时间并不是医生的可预约时间
某些机型modal-dialog显示有问题
账号密码错没提示

log server
npm install log-server
nohup log-server -p 22222 -d /home/yao/develop/app_log &











