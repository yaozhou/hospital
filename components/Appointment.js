import React, { Component } from 'react';
import {Navigator, Alert} from 'react-native';
import { Container, Content, List, ListItem, Text, Header, Button, Icon, Title, View, Input, InputGroup } from 'native-base';
import ModalDropdown from 'react-native-modal-dropdown' ;
import Moment from 'moment' ;
import Range from 'range'
import yihu from '../yihu'
import store from 'react-native-cache-store';
import Spinner from 'react-native-loading-spinner-overlay';

var STRATEGY_NUM = 3 ;
var DEFAULT_GAP = 60 ;


export default class Appointment extends Component {
      constructor (props) {
        super(props) ; 
        this.state = {
            patient_list : this.props.patient_list,
            doc_list : this.props.doc_list,
            date_list : this.props.date_list,
            patient : this.props.patient,
            interval : this.props.interval == null ? DEFAULT_GAP : this.props.interval,
            strategy : this.props.strategy == null ? [] : this.props.strategy,
        }
    }

    on_ok() {
        let  patient_idx = parseInt(this.refs.member.state.selectedIndex) ;

        if (patient_idx < 0) {
            Alert.alert('Error', '请选择要挂号的人') ; return ;
        }

        var patient = this.state.patient_list[patient_idx] ;
        store.set('patient', patient) ;
        console.log(patient) ;

        
        var gap = parseInt(this.state.interval) ;
        if (isNaN(gap)) gap = DEFAULT_GAP ;
        store.set('interval', gap) ;
        console.log("gap : " + gap) ;

        var strategy = [] ;

        for (var i=0; i<STRATEGY_NUM; ++i) {
            let doc_idx = parseInt(this.refs['strategy_doc_' + i].state.selectedIndex) ;
            let date_idx = parseInt(this.refs['strategy_date_' + i].state.selectedIndex) ;

            if (doc_idx >= 0 && date_idx >= 0) {
                strategy.push({
                    // 不能保存idx,因为日期会变更,因而序号会失效，并且医生列表也会有增加和减少
                    doc_sn : this.state.doc_list[doc_idx].sn,
                    // 保存doc_list 只是为了预约时能根据sn匹配到医生的名字，其他地方都不好保存这个列表信息
                    doc_list : this.state.doc_list,
                    date : this.state.date_list[date_idx],
                })
            }
        }

        if (strategy.length == 0) {
            Alert.alert('Error', '请至少选择一个方案') ; return ;
        }        

        store.set('strategy', strategy) ;
        console.log(strategy) ;
        this.props.navigator.pop() ;
    }

    render() {

        let patient_name_list = this.state.patient_list.map((v) => v.name) ;
        let doc_name_list = this.state.doc_list.map((v) => v.name) ;
       

        let conf = Range.range(0,STRATEGY_NUM).map( (v) => {
             let doc_idx = (v >= this.state.strategy.length ? -1 :
                                    this.state.doc_list.findIndex((e) => e.sn == this.state.strategy[v].doc_sn ) ) ;
            let date_idx = (v >= this.state.strategy.length ?  -1 :
                                           this.state.date_list.findIndex((e) => e == this.state.strategy[v].date) ) ;

            return <View key={v}>
                            <ListItem itemDivider>
                            <Text>{`第${v+1}选择`}</Text>
                            </ListItem>
                            <ListItem>
                            <ModalDropdown 
                                    ref={`strategy_doc_${v}`}
                                    defaultIndex={doc_idx}
                                    defaultValue={ doc_idx == -1 ? "选择医生" : doc_name_list[doc_idx] }
                                    options={doc_name_list}/>
                            </ListItem>
                            <ListItem>
                            <ModalDropdown 
                                    ref={`strategy_date_${v}`} 
                                    defaultIndex={date_idx}
                                    defaultValue={ date_idx == -1 ? "选择日期" : this.state.date_list[date_idx] }
                                    options={this.state.date_list}/>
                            </ListItem>
                        </View> 
        }) ;        

        var patient_idx = this.state.patient == null ? -1 : this.state.patient_list.findIndex((e) => e.sn == this.state.patient.sn ) ;

        return (
            <Container>
                <Header>
                        <Button transparent onPress={ () => this.props.navigator.pop() }>
                            <Icon name='ios-arrow-back' />
                        </Button>
                        <Title>预约配置</Title>
                    </Header>
                
                <Content>
                        <List>
                             <ListItem>
                                <ModalDropdown 
                                        ref='member'
                                        defaultIndex={ patient_idx }
                                        defaultValue= {patient_idx == -1 ? "选择成员" : patient_name_list[patient_idx] }
                                        options={patient_name_list}/>
                            </ListItem>
                            {conf}
                        </List>
                        <Button block onPress={this.on_ok.bind(this)} > 确定 </Button>
                </Content>
            </Container>
        );
    }
}