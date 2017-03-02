import KeepAwake from 'react-native-keep-awake';
import {Navigator, Alert} from 'react-native';
import CacheStore from 'react-native-cache-store';
import { local_log, remote_log } from './components/util'



var qs = require('qs') ;

var HOSPITAL_ID = "1565" ;
var PROVINCE_ID = '12' ;
var PART_ID = "5720" ;    
var BIG_PART_ID ="5" ;

// 儿科 -> 小儿科
//PART_ID = "5722" ;
//BIG_PART_ID = "80" ;

//var DOMAIN = "http://www.yihu.com" ;


var URL_LOGIN = 'http://www.yihu.com/User/doLogin/' ;
var URL_MEMBER = 'http://www.yihu.com/Ucenter/accountMemberList.shtml' ;
//var URL_DOC_LIST_1 = 'http://www.yihu.com/DoctorArrange/doGetDoctorList.shtml?hospitalId=' +
//                                         HOSPITAL_ID + '&bigPartId=' + BIG_PART_ID + '&partId=' + PART_ID + '&page=1' ;
//var URL_DOC_LIST_2 = 'http://www.yihu.com/DoctorArrange/doGetDoctorList.shtml?hospitalId=' +
//                                          HOSPITAL_ID + '&bigPartId=' + BIG_PART_ID + '&partId=' + PART_ID + '&page=2' ;
var URL_DOC_STATUS = 'http://www.yihu.com/DoctorArrange/doGetAllRegListBySns' ;
var URL_ORDER = 'http://www.yihu.com/RegAndArrange/doAddOrder' ;
var HOSPITAL_LIST = 'http://www.yihu.com/Search/searchKeyWord' ;



var config = {
      
    patient : {}, 
    hour_ary : [],
    hospital_id : null,
    big_part_id : null,
    part_id : null,

   
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
    
    var option = { method: 'POST', headers: header,  credentials : 'include',  body : qs.stringify(param)} ;

    return fetch(url, option)
                    .then((res) => { return res.text() })
                    .then((r) => {
                      return new Promise(function (resolve, reject) {
                          r == '' ? reject({message : '服务器返回为空,也许我们刷得太频繁了.'}) : resolve(JSON.parse(r))
                          }) ;
                    })
                    
},

query_hospital : function(name) {
    return this.yihu_post(HOSPITAL_LIST, {keyNameLike : name}) ;
},

process_hospital_list : function(html) {
    var link_ary = html.match(/data-value=\"(.*?)\"/g) ;
    var link_list = link_ary.map(function(v) {
        let t =  v.match(/data-value=\"(.*?)\"/)[1] ;   // hospital/ah/8AA4E6ECDD4D469EAED1A9B38A84483F.shtml
        let location = t.match(/hospital\/(.*?)\//)[1] ;
        return t.replace(new RegExp(location, "g"), 'guahao') ;
    })

    // 过滤name为 医院|科室的格式

    var name_ary = html.match(/class=\"header-relsearch-result\">(.*?)</g) ;
    var name_list = name_ary.map(function(v) {
          return  v.match(/class=\"header-relsearch-result\">(.*?)</)[1] ;
    })

    let ret = [] ;
    for(var i=0; i<link_list.length; ++i) {
        let name = name_list[i] ;
        if (name.indexOf('|') < 0) {
            ret.push({name : name, link : link_list[i]}) ;
        }
    }

    console.log(ret) ;
    return ret ;
},

query_department_list : function(hospital_url) {
      return this.yihu_get(hospital_url) ;
},

process_department_list : function(html) {
    //javascript:doGetDoctorList('/DoctorArrange/doGetDoctorList.shtml?hospitalId=1565&bigPartId=19&partId=5697')">肿瘤科</a>    

    var ary =html.match(/javascript:doGetDoctorList\(\'\/DoctorArrange\/doGetDoctorList.shtml\?hospitalId=(\d+)&bigPartId=(\d+)&partId=(\d+)\'\)\">(.*?)<\/a>/g) ;
    var part_list = ary.map(function(v) {
        var r = v.match(/hospitalId=(\d+)&bigPartId=(\d+)&partId=(\d+)\'\)\">(.*?)<\/a>/) ;
        return {
            hospital_id : r[1],
            big_part_id : r[2],
            part_id : r[3],
            name : r[4]
        }
    })

    console.log(part_list) ;

    return part_list ;
  },

do_loop : function(patient, hospital, department, strategy, doc_list) {
    this.patient = patient ;
    this.hospital_id = department.hospital_id ;
    this.big_part_id = department.big_part_id ;
    this.part_id = department.part_id ;

    return     this.query_doc_status(doc_list)
                  .then((ret) => this.process_doc_status(ret))
                  .then((doc_status) => this.apply_strategy(doc_status, strategy))
                  .then((target) => this.query_day_detail(target))
                  .then((html) => this.process_day_detail(html))
                  .then((hour_ary) => this.order(patient, hour_ary))
                  .then((ret) => this.process_order_result(ret))                  
},

  conf_query_doc : function(hospital_id, big_part_id, part_id) {
      this.hospital_id = hospital_id ;
      this.big_part_id = big_part_id ;
      this.part_id = part_id ;

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
        resolve(mem_list) ;
    }.bind(this))
},

query_doc_list : function(mem_html) {
  var URL_DOC_LIST_1 = 'http://www.yihu.com/DoctorArrange/doGetDoctorList.shtml?hospitalId=' +
                                         this.hospital_id + '&bigPartId=' + this.big_part_id + '&partId=' + this.part_id + '&page=1' ;
  var URL_DOC_LIST_2 = 'http://www.yihu.com/DoctorArrange/doGetDoctorList.shtml?hospitalId=' +
                                          this.hospital_id + '&bigPartId=' + this.big_part_id + '&partId=' + this.part_id + '&page=2' ;

  return Promise.all([this.yihu_get(URL_DOC_LIST_1), this.yihu_get(URL_DOC_LIST_2)]) ;
},

process_doc_list : function(doc_list_html) {
    return new Promise(function(resolve, reject) {
        var html = doc_list_html.join('\r\n') ;
        var name_html_ary = html.match(/alt=".*?"/g) ;
        var name_list = (name_html_ary == null ? [] : name_html_ary.map((v) => v.match(/alt="(.*?)"/)[1] ) ) ;

        var sn_html_ary = html.match(/data-sn=".*?"/g) ;
        var sn_list = (sn_html_ary == null ? [] : sn_html_ary.map((v) => v.match(/data-sn="(.*?)"/)[1]) ) ;

        var doc_list = name_list.map(function(v, idx) {
            return {name : v, sn : sn_list[idx]} ;
        })

        resolve(doc_list) ;
    }.bind(this)) ;
},

query_doc_status : function(doc_list) {
    this.debug = {} ;

    console.log('query_doc_status') ;
    var param = {            
            sns :  doc_list.map((v) => v.sn).join(','),
            hospital_id : HOSPITAL_ID,
    } ;

     return this.yihu_post(URL_DOC_STATUS, param) ;
},

process_doc_status : function(ret) {
    this.debug.doc_status = ret ;

    return new Promise(function(resolve, reject) {
        if (ret.Code == -10000)  {
            reject({message : '因每分钟访问次数过多，IP已被服务器加入黑名单. (请参考帮助页面)'}) ; return ;
          }

         let doc_status = ret.map(function(v) {

              var html = v.html.replace(/\r\n/g, '') ;
              
              // 预约时间
              var time_pre = html.match(/<em class="c-f12">.*?<\/em>/g) ;
              if (time_pre == null) {
                  reject({message : 'time string exception', code : 1}) ; return ;
              }

              var time = time_pre.map(function(e) {
                      let result = e.match(/\((.*?)\)/) ;       // 找 上午下午标签
                      if (result != null)
                          return result[1].trim() ;
                      else  // 上下午没找到，是新出来的 ‘排班'系统
                          return e.match(/<em class="c-f12">(.*?)<\/em>/)[1] ;
              }) ;
              time = time.filter((v) => v != '排班') ;
              
              // 预约日期
              var date_pre = html.match(/<em class="c-f16">.*?<\/em>/g) ;
              if (date_pre  == null) {
                  reject({message : 'date string exception', code : 2}) ; return ;
              }
              var date = date_pre.map(function(e) {
                  return e.match(/<em class="c-f16">(.*?)<\/em>/)[1] ;
              }) ;
              date = date.filter((v) => v != '下一个') ;

              // 预约状态
              var status_pre = html.match(/<span class="doc-schedule-stat">.*?<\/span>/g) ;
              if (status_pre == null) {
                  reject({message : 'status string exception', code : 3}) ; return ;
              }
              var status = status_pre.map(function(e) {
                  return e.match(/<span class="doc-schedule-stat">(.*?)<\/span>/)[1] ;
              }) ;
              status = status.filter((v) => v != '放号提醒') ;

              // 预约id
              var arrange_pre = html.match(/data-arrangeid='\d+'/g) ;
              var arrange = [] ;
              if (arrange_pre != null) { // 有可能只有放号提醒，没有其他日期项
                  arrange = arrange_pre.map((e) => e.match(/data-arrangeid='(\d+)'/)[1]  ) ;
              } ;

              // 预约子对象
              var apm_ary = [] ;
              time.forEach(function(v, idx) {
                        apm_ary.push({time : time[idx], date : date[idx], status : status[idx], arrange : arrange[idx] }) ;
              }) ;

              return {sn : v.sn , apm : apm_ary} ;
          }) ;  
        
        console.log(doc_status) ;
        remote_log(JSON.stringify(doc_status));

        resolve(doc_status) ;        
        
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
                    
                    // 不能直接用配置中保存的名字，因为有一个特殊选项叫"任意"
                    let doc_name = strategy.doc_list.filter((v) => v.sn == doc.sn)[0].name ;

                    this.target = {doc : doc.sn, doc_name : doc_name, apm : apm} ;
                   

                    this.debug.target = this.target ;
                    resolve(this.target) ;
                    return ;
            }
        }

       //remot_log('预约失败') ;

        reject({message : '没有可预约的医生', code : 0}) ;
    }.bind(this)) ;
},

query_day_detail : function(target) {
    var url = 'http://www.yihu.com/registration/getOrderNumber/arrangeId/' + 
                        target.apm.arrange + '/doctorSn/' + target.doc + '.shtml' ;
    return this.yihu_get(url) ;
},

process_day_detail : function(html) {
      return new Promise(function(resolve, reject) {
            this.debug.day_detail = html ;

           var ary =  html.match(/\{"NumberSN".*?\}/g) ;
           if (ary == null) {
                reject({message : '你妹,查询的时候还有号，定的时候就没了', code : 11}) ; return ;
           }
           var hour_ary = ary.map((v) => JSON.parse(v)) ;

          //'province_id':'12',
          var province_id = html.match(/\'province_id\':\'(.*?)\'/)[1] ;
          this.province_id = province_id ;
           
           resolve(hour_ary) ;
      }.bind(this)) ;

     
},

order : function(patient, hour_ary) {
  
    var arg = hour_ary[0] ;

    arg.ArrangeID = this.target.apm.arrange ;
    arg.member_sn = patient.sn ;
    arg.dept_id =  PART_ID ;
    arg.doc_sn = this.target.doc ;
    arg.hosp_id = HOSPITAL_ID ;
    //arg.province_id = PROVINCE_ID ;
    arg.province_id = this.province_id ;

    // 调试后门
    if (patient.name == '周耀') {
        return new Promise(function(resolve, reject) {
            let succ_str = `${this.target.apm.date} ${this.target.apm.time} ${this.target.doc_name} 模拟预定成功. ` ;
            reject({message : succ_str}) ;
        }.bind(this))
    }       

    return this.yihu_post(URL_ORDER, arg) ;
},

process_order_result : function(ret) {
    this.debug.order_result = ret ;
   
   let succ_str = `${this.target.apm.date} ${this.target.apm.time} ${this.target.doc_name} 预定成功. ` ;
    console.log(ret) ;
    return new Promise(function (resolve, reject) {
        ret.Code == 10000 ? resolve(succ_str) : reject( {message : ret.Message }) ;
    }) ;
},

} ;

module.exports = config ;

