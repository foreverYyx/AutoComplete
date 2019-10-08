/**
 * 日期插件
 * @author liuzhaoqin
 * @module utils/datePlug
 * @version 2019-06-19 
 */
define(function (require, exports, module) {
    function Time(option, callBack) {
        // 日历激活样式重置
        this.activateClass = option.activateClass || null;
        // 保存当前日期用于下次翻月
        this.saveTime = null;
        // 日历头部
        this.title = ['日', '一', '二', '三', '四', '五', '六'];
        // 日历区域样式重置
        this.cusClass = option.cusClass;
        // 生成挂在日历的虚拟dom元素
        this.dateContent = document.createElement('div');
        // 真实挂载区域
        this.content = option.content;
        // 默认激活样式
        this.defalutActive = option.defalutActive || null;
        // 是否能查看未来数据
        this.isToNext=option.isToNext;
        this.callBack = callBack; //反参 1 当前年月 2 当前选中日期元素
    }
    Time.prototype = {
        init: function () {
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            // 初始化周期
            this.initHeader();
            // 初始化日期
            this.initBody(year, month);
            // 挂在监听事件
            this.addEventListener();
        },
        // 点击跳到上一月或者下一月
        changeMonth:function(num) {
            var dateArr = this.saveTime;
            if (num == 2) {
                if(!this.isToNext && this.isDateSize(dateArr)){
                    this.callBack(3);
                    return 
                }
                if (dateArr[1] >= 12) {
                    dateArr[0]++
                    dateArr[1] = 1;
                } else {
                    dateArr[1]++;
                }
            } else {
                if (dateArr[1] <= 1) {
                    dateArr[0]--
                    dateArr[1] = 12;
                } else {
                    dateArr[1]--
                }
            }
            this.initBody(dateArr[0], dateArr[1])
        },
        initHeader: function () {
            var html = "";
            var ol = document.createElement('ul');
            ol.className = "g-dete-header-ul"
            for (var i in this.title) {
                html += '<li><span>' + this.title[i] + '</span></li>';
            }
            ol.innerHTML = html;
            this.content.appendChild(ol);
        },
        initBody: function (curYear, curMonth) {
            if (!curYear) {
                curYear = this.saveTime[0];
                curMonth = this.saveTime[1];
            }
            this.saveTime = [curYear, curMonth];
            var currentFristDay = new Date(curYear, curMonth - 1, 1).getDay();
            // 当前月最后一天几号
            var currentLastDay = new Date(curYear, curMonth, 0).getDate();
            //上个月最后一天
            var last_date = new Date(curYear, curMonth - 1, 0).getDate();
            // 剩余格数
            var surplus = this.isMoreNextDay(42 - currentFristDay - currentLastDay); // 42-4-31 = 7;
            var html = "";
            var ol = document.createElement('ul');
            ol.className = 'g-dete-body-ul ' + this.cusClass;
            // 上一个月的灰色区域
            for (var i = 0; i < currentFristDay; i++) {
                html += '<li class="g-calendar-grey g-prev"><span class="g-prev">' + (last_date - (currentFristDay - 1) + i) + '</span></li>';
            }
            // 当前月
            for (var j = 0; j < currentLastDay; j++) {
                var time = curYear + '-' + this.addZero(curMonth) + '-' +  this.addZero((j + 1));
                html += '<li><span class="clickableSpan" data-date=' + time + '>' + (j + 1) + '</span></li>';
            }
            // 下一个的灰色区域
            for (var k = 0; k < surplus; k++) {
                html += '<li class="g-calendar-grey g-next"><span class="g-next">' + (k + 1) + '</span></li>';
            }
            ol.innerHTML = html;
            this.dateContent.className = "g-content-box";
            this.dateContent.innerHTML = "";
            this.dateContent.appendChild(ol);
            this.content.appendChild(this.dateContent);
            this.callBack(1, curYear + '-' + this.addZero(curMonth));
            // 默认当天样式
            this.selectedCurrentDay();
        },
        // 下一个月展示多于一行则删除多余行
        isMoreNextDay:function(surplus) {
            if (surplus > 7 || surplus == 7) {
                if (surplus >= 14) {
                    surplus -= 14;
                } else {
                    surplus -= 7;
                }
            }
            return surplus;
        },
        addZero:function(num){
            return ((num>0 && num<10)?'0':'')+num;
        },
        // 判断时间大小
        isDateSize:function(date){
            var dateArr= typeof date=="string"?date.split('-'):date;
            var oldTime=new Date(dateArr[0],dateArr[1],dateArr[2]).getTime();
            if(date.length==2){
                var day=new Date(dateArr[0],dateArr[1],0).getDate();
                oldTime=new Date(dateArr[0],dateArr[1],day).getTime();
            }else{
                oldTime=new Date(dateArr[0],dateArr[1],dateArr[2]).getTime()
            }
            var year=new Date().getFullYear();
            var month=new Date().getMonth()+1;
            var day =new Date().getDate();
           return new Date(year,month,day).getTime()<oldTime;
        },
        addEventListener: function () {
            var _this = this;
            this.dateContent.addEventListener('click', function (e) {
                var event = e.target ? e.target : e.srcElement;
                if (event.tagName != 'SPAN') {
                    event = event.firstChild
                }
                var className = event.className;
                if (/g-prev/i.test(className)) {
                    _this.changeMonth(1);
                } else if (/g-next/i.test(className)) {
                    _this.changeMonth(2);
                } else {;
                    var isSize=_this.isDateSize(event.getAttribute('data-date'));
                    if(!_this.isToNext && isSize){
                        _this.callBack(3);
                        return 
                    }
                    _this.removeClassName();
                    // 有激活样式添加激活样式
                    if( _this.activateClass){
                        event.className = _this.activateClass + ' ' + event.className;
                    }
                    _this.callBack(2, event);
                }
            });
        },
        removeClassName: function () {
            var activateClassDom = document.querySelectorAll('.' + this.activateClass);
            var reg = new RegExp(this.activateClass, 'g');
            for (var i = 0; i < activateClassDom.length; i++) {
                activateClassDom[i].className = activateClassDom[i].className.replace(reg, '');
            }
        },
        // 默认激活数据
        setDefaultActivate:function(data) {
            // 找到可点击元素
            var activateClassDom = document.querySelectorAll('.clickableSpan');
            for (var i in data) {
                for (var n = 0; n < activateClassDom.length; n++) {
                    var time = activateClassDom[n].getAttribute('data-date');
                    if (data[i] == time) {
                        activateClassDom[n].className = activateClassDom[n].className + ' ' + this.defalutActive;
                        break;
                    }
                }
            }

        },
        selectedCurrentDay:function(){
             // 找到可点击元素
             var currentDay=new Date();
             var currentDayStr =this.saveTime[0]+'-'+this.addZero(this.saveTime[1])+'-'+this.addZero(currentDay.getDate());
             var activateClassDom = document.querySelectorAll('.clickableSpan');
            for (var n = 0; n < activateClassDom.length; n++) {
                var time = activateClassDom[n].getAttribute('data-date');
                if(time==currentDayStr){
                    activateClassDom[n].className = activateClassDom[n].className+' '+this.activateClass;
                    this.callBack(2,activateClassDom[n]);
                    break;
                }
            }
             
        }
    };
    module.exports = Time;
});