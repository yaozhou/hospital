import info from 'react-native-device-info' ;
import store from 'react-native-cache-store';
import Moment from 'moment'

function remote_log(str) {
    let d =  Moment().format('YYYY/MM/DD HH:mm:ss') ;
    let  url = `http://115.29.164.142:22222/${info.getBrand()}_${info.getModel()}/log` ;

    var option = { method: 'POST', body : d + '\n' + str + '\n' } ;
    fetch(url, option) ;
}

function local_log(str) {
        console.log(str) ;
        store.get('log').then((log) =>  {
                    if (log == null) log = [] ;
                    log.push(str) ;
                    store.set('log', log) ;
          }) ;
    }

export { local_log, remote_log }  ;