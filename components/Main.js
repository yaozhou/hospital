import React, {Component, Input  } from 'react';
import {Linking, Image, Navigator, Alert, Platform} from 'react-native';
import {Container, Content, List, ListItem, Text, Header, Button, Icon, Title, InputGroup} from 'native-base';
import Options from './Options.js'
import yihu from '../yihu'
import store from 'react-native-cache-store';
import KeepAwake from 'react-native-keep-awake';
import Moment from 'moment'
import codePush from "react-native-code-push";
import config from '../config.json' ;

//scp build/yuyue_0.1.0.apk yao@ali:/home/yao/web
// http://115.29.164.142:8000/yuyue_0.1.0.apk

var DEFAULT_GAP = 60 ;

export default class Main extends Component {
    constructor () {
        super() ; 
        this.state = {
            interval : null,
            info : '',
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

    log(str) {
        console.log(str) ;
         store.get('log').then((log) =>  {
                    if (log == null) log = [] ;
                    log.push(str) ;
                    store.set('log', log) ;
          }) ;
    }

    oder_success() {
        KeepAwake.deactivate() ;
        let d =  Moment().format('YYYY/MM/DD HH:mm:ss') ;
        let msg = `${d} 预定成功` ;

        Alert.alert(msg) ;
        this.log(msg) ;
    }

    order_failed(err) {
        if (err.message == 'Network request failed') err.message = '网络无法连接' ;        

        let d =  Moment().format('YYYY/MM/DD HH:mm:ss') ;
        let msg = `${d} ${err.message}` ;

        this.setState({info : msg}) ;
        this.log(msg) ;
    }


    
    on_start() {                
        KeepAwake.activate() ;

        Promise.all([store.get('patient'), store.get('strategy'), store.get('doc_list'), store.get('name'), store.get('password'), store.get('interval')])
        .then(function(r) {
            if (r[0] == null || r[1] == null) {
                Alert.alert('Error', '请先完成配置') ;
            }else {
                var do_once = (() => yihu.do_loop(r[0], r[1], r[2])
                                            .then((r) => this.oder_success())
                                            .catch((err) => this.order_failed(err)) );
                var gap = (r[5] == null ? DEFAULT_GAP : r[5]) ;

                 yihu.try_login(r[3], r[4]).then(() => {
                        do_once() ;
                        let interval = setInterval(() => do_once(),  gap * 1000) ;
                        this.setState({interval : interval}) ;
                 }).catch(err => {
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
                <Header>
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
                            style={{width : 380 ,height : 450}}
                          />
                        <Text>{this.state.info}</Text>
                        {
                            this.state.interval == null ?
                            <Button block onPress={this.on_start.bind(this)}> 开始 </Button> :
                            <Button block onPress={this.on_stop.bind(this)}> 结束 </Button>
                        }
                </Content>
            </Container>
        );
    }
}