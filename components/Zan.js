import React, { Component } from 'react';
import {Image, Navigator} from 'react-native';
import { Container, Content, List, ListItem, Text, Header, Button, Icon, Title } from 'native-base';

var ABOUT_TEXT = '如果你喜欢本软件, 请打赏给我们的小乐买个尿布吧,这将支持我持续升级制作更好用的版本\n\n 微信支付 '

export default class Zan extends Component {     

    render() {
        return (
            <Container>
                <Header>
                       <Button transparent onPress={ () => this.props.navigator.pop() }>
                            <Icon name='ios-arrow-back' />
                        </Button>
                        <Title>赞赏</Title>
                    </Header>
                <Content>
                    <Text>{ABOUT_TEXT}</Text>
                             <Image                            
                                source={require('../res/money.png')}
                                style={{width : 350 ,height : 350}}
                          />
                </Content>
            </Container>
        );
    }
}