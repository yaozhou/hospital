import React, { Component } from 'react';
import {Navigator} from 'react-native';
import { Container, Content, List, ListItem, Text, Header, Button, Icon, Title } from 'native-base';
import store from 'react-native-cache-store';

export default class Help extends Component {
    constructor () {
        super() ; 
        this.state = {            
            log : [],
        }
    }

    componentDidMount() {
        store.get('log').then(function(log) {
            this.setState({"log" : log == null ? [] : log}) ;
        }.bind(this))
    }

    on_clear() {
        store.set('log', []) ;
        this.setState({log : []}) ;
    }

    render() {
        return (
            <Container>
                <Header>
                       <Button transparent onPress={ () => this.props.navigator.pop() }>
                            <Icon name='ios-arrow-back' />
                        </Button>                        
                        <Title>日志</Title>
                    </Header>
                <Content>
                        <Text>
                                {this.state.log.join('\n')}
                        </Text>
                        <Button block onPress={this.on_clear.bind(this)}> 清除日志 </Button>
                </Content>
            </Container>
        );
    }
}