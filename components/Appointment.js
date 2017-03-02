import React, { Component } from 'react';
import {Navigator, Alert} from 'react-native';
import { Container, Content, List, ListItem, Text, Header, Button, Icon, Title, View, Input, InputGroup } from 'native-base';
import ModalDropdown from 'react-native-modal-dropdown' ;
import Moment from 'moment' ;
import Range from 'range'
import yihu from '../yihu'
import store from 'react-native-cache-store';
import Spinner from 'react-native-loading-spinner-overlay';
var DialogAndroid = require('react-native-dialogs') ;


var STRATEGY_NUM = 3 ;
var DEFAULT_GAP = 60 ;


export default class Appointment extends Component {
      constructor (props) {
        super(props) ; 
        let date_list =  ['任意'].concat(Range.range(1, 11).map((v) => new Moment().add(v,'d').format("MM/DD") ) ) ;

        this.state = {
        //    name : this.props.name,
        //    password : this.props.password,
            hospital : this.props.hospital,         // name, link
            department : this.props.department,     // big_part_id, hospital_id, name, part_id
            patient : this.props.patient,
            strategy : this.props.strategy != null ? this.props.strategy : [],

            patient_list : [],
            department_list : [],
            doc_list : [],
            date_list : date_list,
        }
    }

    componentDidMount() {
        yihu.login_query_patient(this.props.name, this.props.password).then(patient_list => this.setState({patient_list : patient_list})) ;

        if (this.props.hospital != null)
             yihu.query_department_list("http://www.yihu.com" + this.props.hospital.link).then(html => yihu.process_department_list(html))
                .then(department_list => this.setState({department_list : department_list})) ;

        let department = this.props.department ;
        if (department != null) {
            yihu.conf_query_doc(department.hospital_id, department.big_part_id, department.part_id)
                    .then(doc_list => this.setState({doc_list : doc_list}) ) ;
        }
    }

    on_search() {
        yihu.query_hospital('安徽医科大学')
            .then(html => yihu.process_hospital_list(html))
            .then(function (hospital_list) {
                    let options = {
                        items : hospital_list.map((v) => v.name),
                        title : "医院列表",
                        itemsCallback : ((idx, text) => this.on_hospital_selected(hospital_list[idx])), 
                    }
                    var dialog = new DialogAndroid() ;
                    dialog.set(options) ;
                    dialog.show() ;
                    console.log(hospital_list) ;
            }.bind(this))
    }

    clear_strategy() {
        // 清空医生选择
        for (i=0; i<STRATEGY_NUM; ++i) {
            this.refs['strategy_doc_' + i].state.selectedIndex = -1 ;
            this.refs['strategy_date_' + i].state.selectedIndex = -1 ;
        }        

        this.setState({
                    //department : department,
                    doc_list : [],
                    strategy : [],
        }) ;
    }

    on_department_selected(id, text) {
        console.log("select department " + id + " " + text) ;
        let department = this.state.department_list[id] ;

        this.clear_strategy() ;
        
        yihu.conf_query_doc(department.hospital_id, department.big_part_id, department.part_id)
                    .then(doc_list => this.setState({doc_list : doc_list}) ) ;
    }

    clear_deparment() {
         this.refs.department.state.selectedIndex = -1 ;
                this.setState({                        
                        department : null,
                        department_list : [],
                //      doc_list : [],
                //        strategy : [],
               }) ;

        this.clear_strategy() ;
    }

    on_hospital_selected(hospital) {
        console.log(hospital) ;
        this.setState({hospital : hospital}) ;
        this.clear_deparment() ;

        yihu.query_department_list("http://www.yihu.com" + hospital.link)
            .then(html => yihu.process_department_list(html))
            .then(function(department_list) { 
                    this.setState({department_list : department_list}) ;
                    console.log(department_list) ;
             }.bind(this)) ;
    }


    on_ok() {
        let  patient_idx = parseInt(this.refs.member.state.selectedIndex) ;

        if (patient_idx < 0) {
            Alert.alert('Error', '请选择要挂号的人') ; return ;
        }

        var patient = this.state.patient_list[patient_idx] ;
        store.set('patient', patient) ;
        console.log(patient) ;

        // 轮询间隔
        //var gap = parseInt(this.state.interval) ;
        //if (isNaN(gap)) gap = DEFAULT_GAP ;
        //store.set('interval', gap) ;
        //console.log("gap : " + gap) ;

        // hospital
        if (this.state.hospital == null) {
            Alert.alert('Error', '请选择医院') ; return ;
        }
        store.set('hospital', this.state.hospital) ;
        console.log(this.state.hospital) ;

        // 科室
        let department_idx = this.refs.department.state.selectedIndex ;
        if (department_idx < 0) {
            Alert.alert('Error', '请选择科室') ; return ;
        }
        store.set('department', this.state.department_list[department_idx]) ;
        console.log(this.state.department_list[department_idx]) ;

        store.set('doc_list', this.state.doc_list) ;
        console.log(this.state.doc_list) ;

        // 挂号策略
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
        let department_name_list = this.state.department_list.map(v => v.name) ;
       

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
                                    defaultValue={"选择医生"}
                                    options={doc_name_list}/>
                            </ListItem>
                            <ListItem>
                            <ModalDropdown 
                                    ref={`strategy_date_${v}`} 
                                    defaultIndex={date_idx}
                                    defaultValue={"选择日期"}
                                    options={this.state.date_list}/>
                            </ListItem>
                        </View> 
        }) ;

        var patient_idx = this.state.patient == null ? -1 : this.state.patient_list.findIndex((e) => e.sn == this.state.patient.sn ) ;
        var department_idx = this.state.department == null ? -1 : 
                this.state.department_list.findIndex( e => (this.state.department.big_part_id == e.big_part_id &&  this.state.department.part_id == e.part_id) ) ;

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

                            <ListItem>
                            <InputGroup>
                                <Input 
                                    onChangeText={ (text) => this.setState({hospital_name : text}) }
                                    placeholder='选择医院'
                                    value={this.state.hospital != null ?  this.state.hospital.name : '' } />
                                <Button block onPress={this.on_search.bind(this)} > 搜索 </Button>
                            </InputGroup>
                            </ListItem>

                            <ListItem>
                                <ModalDropdown
                                        ref='department'
                                        defaultIndex={ department_idx }
                                        defaultValue= {"选择科室"}
                                        options={department_name_list}
                                        onSelect={(id, text) => this.on_department_selected(id, text)}
                                        />
                            </ListItem>

                            {conf}
                        </List>
                        <Button block onPress={this.on_ok.bind(this)} > 确定 </Button>
                </Content>
            </Container>
        );
    }
}