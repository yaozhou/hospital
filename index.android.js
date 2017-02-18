// to
// fetch cookie  处理

import React, { Component } from 'react';
import {AppRegistry, StyleSheet, Text, View, Alert, DrawerLayoutAndroid, Navigator, AppState} from 'react-native';
import { Container, Header, Title, Content , Button , Icon, List, ListItem, InputGroup, Input} from 'native-base'; 
import ModalDropdown from 'react-native-modal-dropdown' ;
import Moment from 'moment' ;
import Range from 'range'
import Options from './components/Options.js'
import Appointment from './components/Appointment'
import Main from './components/Main'
import yihu from './yihu'
import CacheStore from 'react-native-cache-store';
//import codePush from "react-native-code-push";
import config from './config.json' ;


// am start -n com.hospital/.MainActivity
 // am startservice -a com.hospital.headless -e jobKey yao
 // adb logcat hospital:V | egrep "hospital|ReactNativeJS|PowerManagerFlow"

class yuyue extends Component {
    constructor (props) {
        super(props);      
    }

   render() {
            
            return (
                    <Navigator
                      initialRoute={{ name: 'Main', component: Main }}
                      configureScene={(route) => {
                        return Navigator.SceneConfigs.PushFromRight ;
                      }}
                      renderScene={(route, navigator) => {
                        let Component = route.component ;
                        return <Component {...route.params} navigator={navigator} />
                      }} />
            );
    }
}

//hospital = codePush({deploymentKey : config.staging_key})(hospital) ;

AppRegistry.registerComponent('yuyue', () => yuyue);

module.exports = yuyue ;