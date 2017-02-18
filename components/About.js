import React, { Component } from 'react';
import {Navigator} from 'react-native';
import { Container, Content, List, ListItem, Text, Header, Button, Icon, Title } from 'native-base';
import info from 'react-native-device-info' ;
import config from '../config.json'

var ABOUT_TEXT = ' 关于小乐预约助手(安医科大二院)version\n\n感谢我的老婆，把小乐(主界面中的小男孩)带给我，希望小乐能健康成长,希望老婆能早日恢复,我好感激能有你们陪伴着我,我爱你们.\n\n 使用本软件中遇到任何问题或有任何想法，欢迎发送邮件至yaozhou.wuhu@gmail.com\n\n祝您宝宝健康成长，母子平安' ;

export default class About extends Component {
    constructor (props) {
        super(props) ; 

        console.log(`brand : ${info.getBrand()}, Model : ${info.getModel()}, system version :  ${info.getSystemVersion()}`) ;
    }

    render() {
        var text = ABOUT_TEXT.replace('version', `${info.getVersion()}.${config.min_ver}`) ;

        return (
            <Container>
                <Header>
                       <Button transparent onPress={ () => this.props.navigator.pop() }>
                            <Icon name='ios-arrow-back' />
                        </Button>
                        <Title>关于</Title>
                    </Header>
                <Content>
                    <Text>{text}</Text>
                </Content>
            </Container>
        );
    }
}