import React, { Component } from 'react';
import {Navigator, Alert} from 'react-native';
import { Container, Content, List, ListItem, Text, Header, Button, Icon, Title, InputGroup, Input } from 'native-base';
import yihu from '../yihu'
import store from 'react-native-cache-store';

export default class Account extends Component {
    constructor (props) {
        super(props) ;
        this.state = {
            name : this.props.name,
            password : this.props.password,
        }
    }

    on_ok() {
        console.log(`name : ${this.state.name} , password : ${this.state.password}`) ;
        
        store.set('name', this.state.name) ;
        store.set('password', this.state.password) ;
        this.props.navigator.pop() ;
    }

    render() {
        return (
            <Container>
                <Header>
                       <Button transparent onPress={ () => this.props.navigator.pop() }>
                            <Icon name='ios-arrow-back' />
                        </Button>                        
                        <Title>账号</Title>                        
                    </Header>
                <Content>
                        <List>
                        <ListItem>
                            <InputGroup>
                                <Icon name='ios-person' />
                                <Input 
                                    onChangeText={ (text) => this.setState({name : text}) }
                                    placeholder='账号'
                                    value={this.state.name}
                                    />
                            </InputGroup>
                        </ListItem>
                    
                        <ListItem>
                            <InputGroup>
                                <Icon name='ios-unlock' />
                                <Input 
                                        onChangeText={ (text) => this.setState({password : text}) }
                                        placeholder='密码' 
                                        secureTextEntry={true}
                                        value = {this.state.password}
                                        />
                            </InputGroup>
                        </ListItem>

                    </List>

                    <Button block onPress={this.on_ok.bind(this)}> 确定 </Button>
                </Content>
            </Container>
        );
    }
}