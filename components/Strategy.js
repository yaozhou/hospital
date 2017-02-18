import React, { Component } from 'react';
import {Navigator} from 'react-native';
import { Container, Content, List, ListItem, Text, Header, Button, Icon, Title } from 'native-base';

export default class Help extends Component {
    constructor (props) {
        super(props) ; 
        console.log('', props) ;
        this.state = {
            patient_list : [],
            doc_list : [],
            date_list : [],
            patient : {},
            strategy : {},
        }
    }

    on_ok() {
    
    }

   render() {
                
        // let patient_name_list = this.state.patient_list.map((v) => v.name) ;
        // let doc_name_list = this.state.doc_list.map((v) => v.name) ;

          

        return (
            <Container>
                <Header>
                        <Button transparent onPress={ () => this.props.navigator.pop() }>
                            <Icon name='ios-arrow-back' />
                        </Button>
                        <Title>预约配置</Title>
                    </Header>
                <Content>
                      
                </Content>
            </Container>
        );
    }
}