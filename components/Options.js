import React, { Component } from 'react';
import {Navigator, Alert} from 'react-native';
import {View, Container, Content, List, ListItem, Text, Header, Button, Icon, Title } from 'native-base';
import Account from './Account'
import Appointment from './Appointment'
import Help from './Help'
import About from './About'
import Log from './Log'
import yihu from '../yihu'
import store from 'react-native-cache-store';
import Zan from './Zan'
import Moment from 'moment' ;
import Range from 'range'
import Spinner from 'react-native-loading-spinner-overlay';


export default class Options extends Component {
     constructor (props) {
        super(props) ; 
        this.state = {
            loading : false,
        }
    }

    process_patient_list(patient_list) {
        console.log('patient list : ' + JSON.stringify(patient_list)) ;

        store.set('patient_list', patient_list) ;        
        this.setState({patient_list : patient_list}) ;
    }

    on_appointment() {
        Promise.all([
                            store.get('name'), 
                            store.get('password'), 
                            store.get('patient'),
                            store.get('hospital'), 
                            store.get('department'),
                            store.get('strategy'),
                    ])
        .then(function(r) {   
                let name = r[0] ;  let password = r[1] ; let patient = r[2] ; 
                let hospital = r[3] ; let department = r[4] ; let strategy = r[5] ;

                if (name == null|| password == null) {
                    Alert.alert('Error', '请先配置健康之路的用户名和密码') ;
                }else {
                     this.props.navigator.push({
                            name: 'Appointment',
                            component: Appointment,
                            params : {
                                    name : name,
                                    password : password,
                                    patient : patient,
                                    hospital : hospital,
                                    department : department,
                                    strategy : strategy,
                            }
                     }) ;
                }
        }.bind(this)) ;
    }

    on_account() {
        Promise.all([store.get('name'), store.get('password')]).then(function(r) {            
            this.props.navigator.push({
                    name: 'account', 
                    component: Account,
                    params : {name : r[0], password : r[1]}
                })
        }.bind(this))
    }
    
    render() {
        return ( 
            <Container>                
                <Header>
                        <Button transparent onPress={ () => this.props.navigator.pop()}>
                            <Icon name='ios-arrow-back' />
                        </Button>                        
                        <Title>配置</Title> 
                    </Header>
                <Content>
                         <List>
                            <ListItem onPress={this.on_account.bind(this) }>
                                <Text>账号</Text>
                            </ListItem>
                            <ListItem onPress={this.on_appointment.bind(this)} >
                                <Text>预约配置</Text>
                            </ListItem>
                            <ListItem onPress={() => this.props.navigator.push({name: 'Log', component: Log})} >
                                <Text>查看日志</Text>
                            </ListItem>
                            <ListItem onPress={() => this.props.navigator.push({name: 'Help', component: Help})}>
                                <Text>帮助</Text>
                            </ListItem>
                            <ListItem onPress={() => this.props.navigator.push({
                                        name: 'About', 
                                        component: About,
                                        })}>
                                <Text>关于</Text>
                            </ListItem>
                            <ListItem onPress={() => this.props.navigator.push({name: 'Zan', component: Zan})}>
                                <Text>赞赏</Text>
                            </ListItem>
                        </List>
                        <View style={{ flex: 1 }}>
                                <Spinner visible={this.state.loading} textContent={"Loading..."} textStyle={{color: '#FFF'}} />
                        </View>
                </Content>
                
            </Container>
        );
    }
}