utl = (function () {

    var _utl = {
        exists : function(arr,val){
            for(var i= 0,len=arr.length;i<len;i++){
                if(arr[i] === val) return true;
            }
            return false;
        }
        ,
        rpad: function (arr, cnt, obj) {
            while (cnt--) {
                arr.push(obj);
            }
            return arr;
        },
        lpad: function (arr, cnt, obj) {
            while (cnt--) {
                arr.unshift(obj);
            }
            return arr;
        },
        /* 배열을 누적 배열로 만들기 */
        cmlt:function(arr){
            var cumulative = 0;
            return arr.map(function(num){
                cumulative += num;
                return cumulative;
            });
        },
        /* 두개의 오브젝트의 누적 배열로 리턴 하기 */
        cmltObj:function(objArr,expt){   //utl().cmltObj([{a:1,b:2,c:3},{a:2,b:4,c:6},{a:3,b:6,c:9}])
            var out = expt || [];
            var cumulative = {};
            return objArr.map(function(obj,idx){
                cumulative = _utl.plusObj(cumulative,obj,null,out);
                return cumulative;
            });
        }
        ,
        /* 두개의 오브젝트를 더하기 더할때 parse 함수 쓰기 */
        plusObj:function(a,b,parseFn,expt){

            var filterList = expt || [];

            var k = {};

            //k에 a,b 모든값을 만들어 넣기
            for(var x in a){ k[x] = 0;}
            for(var t in b){ k[t] = 0;}

            //k에 a,b 값을 모두 더해 만들기
            for(var x in k){
                var n = 0, m = 0;
                //반드시 체크 방법을 찾자
                try{
                    n = (!a[x]?0:a[x]);
                }catch(err) { //console.log('wraning in plusObj',1, x, err);
                    n = 0 ;
                }
                try{
                    m = (!b[x]?0:b[x]);
                }catch(err) { //console.log('wraning in plusObj',2, x, err);
                    m = 0 ;
                }
                //todo
                if(_utl.exists(filterList,x)){
                    try{ k[x] = b[x]; }
                    catch(err) { k[x] = 0; }
                }else{
                    k[x] = parseFn?( parseFn(n) + parseFn(m) ) : (n+m);
                }
            }
            return k;
        }
        ,
        /* 한쪽으로 배열 옮기기  */
        a2b:function(a,b){
            while(a.length){
                b.push(a.shift());
            }
        }
        ,
        /* 년을 주면 365만들기 */
        ry:function(y){
            var r = [] , a = moment(y+"0101", 'YYYYMMDD');
            r.push(y+"0101");
            while(y==a.add(1,'days').format('YYYYMMDD').substr(0,4)) r.push(a.format('YYYYMMDD'));
            return r;
        }
        ,
        /* 년을 주면 365만들기 */
        ryo:function(y){
            var r = {};
            k = 0;
            //토요일 6 , 일요일 0 , 월요일 1
            //토요일 _1 , 일요일 _2 , 월요일 _1
            while(true){
                var p = {} , a = moment(y+"0101", 'YYYYMMDD').add(k,'days');
                if(y!=a.format('YYYYMMDD').substr(0,4)) break;
                r[a.format('YYYYMMDD')] = {
                    "dtp" : (a.days()===6)?"1":(a.days()===0)?"2":"0"
                };
                k++;
            }
            return r;
        }
        ,
        /*
         * obj : 소스
         * gId : 그룹핑 될 key 값
         * parseFn : 더하기전 변환함수
         * */
        groupSum:function(obj,gId,parseFn){
            parseFn = parseFn || parseFloat;
            var rtn = {};
            _.each(obj,function(value,i){
                var curr = value[gId];
                rtn[curr] = utl().plusObj ( rtn[curr] ,  value , parseFn );
                rtn[curr][gId] = curr; //그룹핑 현재값은 더하지 말고 원위치 해준다
            });
            return rtn ;
        }
        ,groupSumArr:function(obj,gId,parseFn){
            return _.chain(_utl.groupSum(obj,gId,parseFn))
                .toArray()
                .sortBy(function(stooge){ return stooge[gId] })
                .value();
        }
        /*
         * fixed Float 기본 10자리로 함
         * */
        ,ff : function(num,fix){

            return parseFloat((num).toFixed(fix||10));

        }
        ,
        /*
         * utl().sRange(1,13,1,'00') -> ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
         * utl().sRange(1,25,1,'00') -> ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"]
         * */
        sRange : function (start,stop,step,pad){
            return _.map( _.range(start,stop,step) , function(val,idx){
                return pad.substring(0, pad.length - (''+val).length) + (''+val);
            });
        }
        ,
        /*
         * 12개월 배열
         * */
        mm : function(){
            return this.sRange(1,13,1,'00');
        }
        /*
         * 24시간 배열
         * */
        ,hh : function(){
            return this.sRange(1,25,1,'00');
        }
        /*
         * 날짜 배열
         * */
        ,dd : function(yyyymm){
            return this.sRange(1,(new Date(yyyymm.substr(0,4),yyyymm.substr(4,6),"")).getDate()+1,1,'00');
        }
        ,
        get8760h : function(y){

            var ymdh = [];
            _.each( _utl.ry(y) , function(ymd,idx){
                _.each( _utl.sRange(1,25,1,'00') , function(hh,idx){
                    ymdh.push(ymd+hh);
                });
            });

            return _.map(ymdh,function(val,i){
                return { m : val.substring(4,6) , d : val.substring(6,8) , h : val.substring(8,10) }
            })
        }

    };

    return _utl;
})();


/*
*  val 이 false 면 desc 를 찍는다.
*  val 은 true 그냥 통과한다.
* */

assert  = function(val,desc){
    var arg = [];
    if( arguments.length > 2 ){
        for(var i= 1,len=arguments.length;i<len;i++) arg.push(arguments[i]);
    }else{
        arg = desc;
    }
    val?val=val:console.error("fail : ",arg);
};