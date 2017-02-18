import React, { Component } from 'react';
import {Navigator} from 'react-native';
import { Container, Content, List, ListItem, Text, Header, Button, Icon, Title } from 'native-base';

var HELP_TEXT=' 小乐预约助手使用方法:\n  1.进入账号配置,设置好健康之路(www.yihu.com)的账号密码.\n  2.进入预约配置,选择要挂号的人，选择要挂号的医生和日期，目前可支持最多3种方案，自动挂号时会按照方案顺序依次匹配，按照第一个能匹配上的方案执行.\n如: 第一方案想挂A医生固定某一天的号,如果没有的话挂B医生某一天的号，如果都没有，就随便一个医生任意一天.\n  3.回到主界面,点击开始,程序会每分钟挂号一次，直到成功或者主动停止.\n\n 挂号时请停留在主界面，否则程序会暂停，运行时手机将保持常亮状态，建议连接充电器\n\n 自动挂号时请耐心等待，如果随机医生和时间的话,一般几个小时内就可以挂到. \n\n 预约设置中可以设置查询时间间隔，表示每隔多长时间执行一次查询，设置过高的频率可能会被网站加入黑名单,IP被加入黑名单可以通过重启路由器获得一个新的IP地址解决,并且服务器会在一段时间后撤销黑名单' ;

export default class Help extends Component {

    render() {
        return (
            <Container>
                <Header>
                       <Button transparent onPress={ () => this.props.navigator.pop() }>
                            <Icon name='ios-arrow-back' />
                        </Button>                        
                        <Title>帮助</Title>
                    </Header>
                <Content>
                    <Text>{HELP_TEXT}</Text>

                </Content>
            </Container>
        );
    }
}