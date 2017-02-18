import KeepAwake from 'react-native-keep-awake';
import {Navigator, Alert} from 'react-native';
import CacheStore from 'react-native-cache-store';


var qs = require('qs') ;

var HOSPITAL_ID = "1565" ;
var PROVINCE_ID = '12' ;
var PART_ID = "5720" ;    
var BIG_PART_ID ="5" ;

// 儿科 -> 小儿科
//var PART_ID = "5722" ;
//var BIG_PART_ID = "80" ;


var URL_LOGIN = 'http://www.yihu.com/User/doLogin/' ;
var URL_MEMBER = 'http://www.yihu.com/Ucenter/accountMemberList.shtml' ;
var URL_DOC_LIST_1 = 'http://www.yihu.com/DoctorArrange/doGetDoctorList.shtml?hospitalId=' +
                                         HOSPITAL_ID + '&bigPartId=' + BIG_PART_ID + '&partId=' + PART_ID + '&page=1' ;
var URL_DOC_LIST_2 = 'http://www.yihu.com/DoctorArrange/doGetDoctorList.shtml?hospitalId=' +
                                          HOSPITAL_ID + '&bigPartId=' + BIG_PART_ID + '&partId=' + PART_ID + '&page=2' ;
var URL_DOC_STATUS = 'http://www.yihu.com/DoctorArrange/doGetAllRegListBySns' ;
var URL_ORDER = 'http://www.yihu.com/RegAndArrange/doAddOrder' ;



var config = {

      
    patient : {}, // patient ¶ÔÏó
    hour_ary : [],

   debug : function(msg) {
      console.log(msg) ;
      //Alert.alert('debug', msg) ;
    },

  yihu_get : function(url) {
    return fetch(url)
        .then((res) => res.text())        
  },

 yihu_post : function(url, param) {
    var header = new Headers() ;
    header.append("Accept", "*/*") ;
    header.append("Accept-Language", 'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4,zh-TW;q=0.2,gl;q=0.2,fr;q=0.2') ;
    header.append("Connection", "keep-alive") ;
    header.append('Content-Type', 'application/x-www-form-urlencoded') ;
    header.append('Origin', 'http://www.yihu.com/') ;
    header.append('Referer', 'http://www.yihu.com') ;
    header.append('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36') ;
    header.append('X-Requested-With', 'XMLHttpRequest') ;
    
    var option = { method: 'POST', headers: header, body : qs.stringify(param)} ;

    return fetch(url, option)
                    .then((res) => { return res.text() })
                    .then((r) => {
                      return new Promise(function (resolve, reject) {
                          r == '' ? reject({message : '服务器返回为空,也许我们刷得太频繁了.'}) : resolve(JSON.parse(r))
                          }) ;
                    })
                    
},

do_loop : function(patient, strategy, doc_list) {
    return     this.query_doc_status(doc_list)
                  .then((ret) => this.process_doc_status(ret))
                  .then((doc_status) => this.apply_strategy(doc_status, strategy))
                  .then((target) => this.query_day_detail(target))
                  .then((html) => this.process_day_detail(html))
                  .then((hour_ary) => this.order(patient, hour_ary))
                  .then((ret) => this.process_order_result(ret))                  
},

  conf_query_doc : function() {
      return  this.query_doc_list().then((doc_list_html) => this.process_doc_list(doc_list_html))
        
  },

  login_query_patient : function(name, password) {       
        return  this.try_login(name, password)
                    .then(() => this.query_member())
                    .then((mem_ret) => this.process_member_ret(mem_ret))
  },

try_login : function(name, password) {
    var auth = {
              loginid: name,
              pwd: password,
              isAutoLogin:1,
    } ;

    return  this.do_login(auth)
                .then((ret) => this.process_login_ret(ret))                
},

do_login : function(auth) {
    return this.yihu_post(URL_LOGIN, auth) ;
},

process_login_ret : function(ret) {
    this.debug(ret) ;
    return new Promise(function (resolve, reject) {
        ret.Code == 10000 ? resolve() : reject() ;
    }) ;
},

query_member : function() {
    return this.yihu_get(URL_MEMBER) ;
},

process_member_ret : function(mem_html) {
    return new Promise(function(resolve, reject) {
        let mem_list = mem_html.match(/<tr style="height:110px;">.*?<div/g).map(function(v) {
            return {
                  name :  v.match(/<td>(.*?)<\/td>/)[1], 
                  sn : v.match(/setDefaultMember\('(.*?)'\)/)[1],
            }
        }) ;
//        this.debug(mem_list) ;
        resolve(mem_list) ;
    }.bind(this))
},

query_doc_list : function(mem_html) {
    return Promise.all([this.yihu_get(URL_DOC_LIST_1), this.yihu_get(URL_DOC_LIST_2)]) ;
},

process_doc_list : function(doc_list_html) {
    return new Promise(function(resolve, reject) {
        var html = doc_list_html.join('\r\n') ;
        var name_list = html.match(/alt=".*?"/g).map((v) => v.match(/alt="(.*?)"/)[1] ) ;
        var sn_list = html.match(/data-sn=".*?"/g).map((v) => v.match(/data-sn="(.*?)"/)[1]) ;

        var doc_list = name_list.map(function(v, idx) {
            return {name : v, sn : sn_list[idx]} ;
        })
        
        //this.debug(this.doc_list) ;
        resolve(doc_list) ;        
    }.bind(this)) ;
},

query_doc_status : function(doc_list) {
    console.log('query_doc_status') ;
    var param = {            
            sns :  doc_list.map((v) => v.sn).join(','),
            hospital_id : HOSPITAL_ID,
    } ;

     return this.yihu_post(URL_DOC_STATUS, param) ;
},

process_doc_status : function(ret) {
    return new Promise(function(resolve, reject) {
        if (ret.Code == -10000)  {
            reject({message : '因每分钟访问次数过多，IP已被服务器加入黑名单. (请参考帮助页面)'}) ; return ;
          }

         let doc_status = ret.map(function(e) {

              var html = e.html.replace(/\r\n/g, '') ;

              var time = html.match(/<em class="c-f12">.*?<\/em>/g).map(function(e) { 
                      return e.match(/\((.*?)\)/)[1].trim() ; 
              }) ;
              
              var date = html.match(/<em class="c-f16">.*?<\/em>/g).map(function(e) {
                  return e.match(/<em class="c-f16">(.*?)<\/em>/)[1] ;
              }) ;

              var status = html.match(/<span class="doc-schedule-stat">.*?<\/span>/g).map(function(e) {
                  return e.match(/<span class="doc-schedule-stat">(.*?)<\/span>/)[1] ;
              }) ;

              var arrange = html.match(/data-arrangeid='\d+'/g).map(function(e) {
                  return e.match(/data-arrangeid='(\d+)'/)[1] ;
              })

              var apm_ary = [] ;
              time.forEach(function(v, idx) {
                    apm_ary.push({time : time[idx], date : date[idx], status : status[idx], arrange : arrange[idx] }) ;
              }) ;

              return {sn : e.sn , apm : apm_ary} ;
          }) ;  
        
        console.log(doc_status) ;
        resolve(doc_status) ;
        //}else {
            //reject(new Date() + 'Ã»ÓÐÔ¤Ô¼µ½') ;
        //}
        
    }.bind(this))
},

//[ { sn: '710408426',
//  apm: [ { time: 'ÉÏÎç', date: '02/07', status: 'Ô¤Ô¼', arrange: '76559805' } ] } ]

apply_strategy : function(doc_status, stra) {

    console.log('apply_strategy') ;
    return new Promise(function(resolve, reject) {
        for (var i = 0; i < stra.length; ++i) {
            let strategy = stra[i] ;

            for(var j=0; j<doc_status.length; ++j) {
                    let doc = doc_status[j] ;

                   if (strategy.doc_sn != '0' && strategy.doc_sn != doc.sn)
                        continue ;

                    let r = doc.apm.filter((v) => v.status == '预约') ;
                    if (r.length == 0) 
                        continue ;

                    let apm = (strategy.date == '任意' ? r[0] : 
                            r.find((day) => day.date == strategy.date) ) ;
                    if (apm == undefined)
                        continue ;
                    
                    this.target = {doc : doc.sn, apm : apm} ;
                    resolve(this.target) ;
                    return ;
            }
        }

        reject({message : '没有可预约的医生'}) ;
    }.bind(this)) ;
},

query_day_detail : function(target) {
    console.log('query_day_detail') ;
    var url = 'http://www.yihu.com/registration/getOrderNumber/arrangeId/' + 
                        target.apm.arrange + '/doctorSn/' + target.doc + '.shtml' ;
    return this.yihu_get(url) ;
},

process_day_detail : function(html) {
    console.log('process_day_detail') ;
     var hour_ary =  html.match(/\{"NumberSN".*?\}/g).map((v) => JSON.parse(v)) ;
     this.debug(hour_ary) ; 

     return hour_ary ;
},

order : function(patient, hour_ary) {
    console.log('order') ;
    var arg = hour_ary[0] ;

    arg.ArrangeID = this.target.apm.arrange ;
    arg.member_sn = patient.sn ;
    arg.dept_id =  PART_ID ;
    arg.doc_sn = this.target.doc ;
    arg.hosp_id = HOSPITAL_ID ;
    arg.province_id = PROVINCE_ID ;

    // 调试后门
    if (patient.name == '周耀' || patient.name == '年娜' || patient.name == '汤启兰')
        arg = null ;

    return this.yihu_post(URL_ORDER, arg) ;
},

process_order_result : function(ret) {
    console.log(ret) ;
    return new Promise(function (resolve, reject) {
        ret.Code == 10000 ? resolve() : reject() ;
    }) ;
},

} ;

module.exports = config ;

