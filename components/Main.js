import React, {Component, Input  } from 'react';
import {Linking, Image, Navigator, Alert, Platform} from 'react-native';
import {View, Container, Content, List, ListItem, Text, Header, Button, Icon, Title, InputGroup} from 'native-base';
import Options from './Options.js'
import yihu from '../yihu'
import store from 'react-native-cache-store';
import KeepAwake from 'react-native-keep-awake';
import Moment from 'moment'
import codePush from "react-native-code-push";
import config from '../config.json' ;
import Spinner from 'react-native-loading-spinner-overlay';
import { remote_log, local_log } from './util'
import SmsListener from 'react-native-android-sms-listener'


var DialogAndroid = require('react-native-dialogs');

//scp build/yuyue_0.1.0.apk yao@ali:/home/yao/web
// http://115.29.164.142:8000/yuyue_0.1.0.apk

var DEFAULT_GAP = 60 ;

export default class Main extends Component {
    constructor () {
        super() ;
        this.state = {
            interval : null,
            info : '',
            loading : false,
        }
    }

    componentDidMount() {
        codePush.getCurrentPackage()
        .then((update) => {            
            console.log(update) ;

            codePush.sync({
                deploymentKey : config.staging_key,
                updateDialog: false,
                installMode: codePush.InstallMode.ON_NEXT_RESUME,
            });
        });
    }
    
    oder_success(ret) {
        KeepAwake.deactivate() ;
        let d =  Moment().format('YYYY/MM/DD HH:mm:ss') ;
        let msg = `${d}: ${ret}` ;

        
        this.on_stop() ;
        Alert.alert(msg) ;
        local_log(msg) ;
        remote_log(msg) ;
        this.setState({info : msg}) ;
    }

    order_failed(err, do_once) {
        if (err.message == 'Network request failed') err.message = '网络无法连接' ;

        let d =  Moment().format('YYYY/MM/DD HH:mm:ss') ;
        let msg = `${d} ${err.message}` ;

        this.setState({info : msg}) ;
        local_log(msg, true) ;

        // 意外失败处理
        if (err.code != 0)  {
            remote_log(err.stack + '\n' + JSON.stringify(yihu.debug)) ;
            //do_once() ;
        }else {
            remote_log(msg) ;
        }
    }
    
    on_start() {
        // SmsListener.addListener(message => {
        //     Alert.alert('info', message) ;
        //   //console.info(message)
        // })
        KeepAwake.activate() ;

        Promise.all([
                store.get('patient'), 
                store.get('hospital'),
                store.get('department'),
                store.get('strategy'), 
                store.get('doc_list'), 
                store.get('name'), 
                store.get('password')
                ])
        .then(function(r) {
            if (r[0] == null || r[1] == null) {
                Alert.alert('Error', '请先完成配置') ;
            }else {
                this.setState({loading : true}) ;

                let patient = r[0] ; let hospital = r[1] ; let department = r[2] ;
                let strategy = r[3] ; let doc_list = r[4] ; let name = r[5] ; let password = r[6] ;
                
                var do_once = (() => yihu.do_loop(patient, hospital,  department, strategy, doc_list)
                                            .then((r) => this.oder_success(r))
                                            .catch((err) => this.order_failed(err, do_once.bind(this))) );
                var gap = DEFAULT_GAP ;

                 yihu.try_login(name, password).then(() => {
                        do_once() ;
                        let interval = setInterval(() => do_once(),  gap * 1000) ;
                        this.setState({interval : interval, loading : false}) ;
                 }).catch(err => {
                    this.setState({loading : false}) ;
                    Alert.alert('Error', '登陆失败,请检查网络连接和账号密码') ;
                 })
            }
        }.bind(this))
    }

    on_stop() {
        if (this.state.interval) {
            clearInterval(this.state.interval) ;
            this.setState({interval : null}) ;
        }
    }

    render() {
        return (
            <Container>
                <Header backgroundColor="#D56F2B">
                        <Button transparent onPress={ () => this.props.navigator.push({
                                        name : 'Options', 
                                        component : Options,
                                    }) }>
                            <Icon name='ios-menu' />
                        </Button>                       
                        <Title>小乐预约助手</Title>
                    </Header>
                <Content>
                        <Image                            
                            source={require('../res/bao.png')}
                            style={{width : 380 ,height : 480}}
                          />
                        <Text>{this.state.info}</Text>
                        {
                            this.state.interval == null ?
                            <Button block warning  onPress={this.on_start.bind(this)}> 开始  (提示:挂号时不要切换出此界面，否则挂号会暂停)</Button> :
                            <Button block warning onPress={this.on_stop.bind(this)}> 结束 </Button>
                        }
                <View style={{ flex: 1 }}>
                        <Spinner visible={this.state.loading} textContent={"Loading..."} textStyle={{color: '#FFF'}} />
                </View>
                </Content>
            </Container>
        );
    }
}