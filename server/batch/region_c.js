
//지역별 시간임
cysBatch.CHour = function(ymdh){

    console.log('CHour',{dt : ymdh},'삭제');

    CAT_C_HOUR.remove({dt : ymdh});

    var CCode = cysBatch.getCCode();

    _.each( CCode , function(obj,idx){

        var matchCondition = {WDATE : ymdh , CNSL_OGNZ_CD : obj.cd };

        console.log(ymdh,obj.cd,obj.name);

        var arr = BDATA.aggregate([
            {
                $match : matchCondition
            },
            {
                $unwind : '$CDARR'
            },
            {
                $group : {
                    _id:'$CDARR'
                    ,cnt : { $sum : 1 }
                }

            }
        ]);

        CAT_C_HOUR.insert({
            dt : ymdh
            ,y : ymdh.substr(0,4)
            ,m : ymdh.substr(4,2)
            ,d : ymdh.substr(6,2)
            ,h : ymdh.substr(8,2)
            ,data : arr
            ,region : obj.ocd
            ,region_c : obj.cd
            ,name : obj.name
        });

    });

};

cysBatch.CDay = function(ymd){


    console.log('CDay',{dt : ymd},'삭제');

    CAT_C_DAY.remove({dt : ymd});

    var CCode = cysBatch.getCCode();

    _.each( CCode , function(obj,idx){

        var matchCondition = {WDATE : { $regex : '^'+ymd } , CNSL_OGNZ_CD : obj.cd };

        var arr = BDATA.aggregate([
            {
                $match : matchCondition
            },
            {
                $unwind : '$CDARR'
            },
            {
                $group : {
                    _id:'$CDARR'
                    ,cnt : { $sum : 1 }
                }
            }
        ]);

        CAT_C_DAY.insert({
            dt : ymd
            ,y : ymd.substr(0,4)
            ,m : ymd.substr(4,2)
            ,d : ymd.substr(6,2)
            ,data : arr
            ,region : obj.ocd
            ,region_c : obj.cd
            ,name : obj.name
        });

    });

    console.log({dt : ymd},'Cday 끝');

};


/* 토요일만 실행됨 */
cysBatch.Cweek = function(ymd){
    console.log( 'Cweek' );
    var mnt = moment(ymd,'YYYYMMDD');
    var w = mnt.week();
    var wkday = mnt.weekday();//
    var end = mnt.format('YYYYMMDD');
    var start = mnt.add(-7,'days').format('YYYYMMDD');

    if(6 !== wkday){
        console.log('토요일이 아님');
        return;
    }else{
        start += '25';
        end += '25';
        console.log('토요일 맞음');
        console.log('주', w  ,'시작' , start ,'끝' , end );
    }
    //00~23

    CAT_C_WEEK.remove({y:ymd.substr(0,4) , w : w});

    var CCode = cysBatch.getCCode();

    _.each( CCode , function(obj,idx){
        var matchCondition = {
            $and : [
                { WDATE : { $gt : start} },
                { WDATE : { $lt : end} }
            ],
            CNSL_OGNZ_CD : obj.cd
        };

        var dt = ymd.substr(0,4) + ('0'+ w ).substr(-2,2);

        console.log(ymd,dt,w,obj.cd,obj.name);

        var arr = BDATA.aggregate([
            {
                $match : matchCondition
            },
            {
                $unwind : '$CDARR'
            },
            {
                $group : {
                    _id:'$CDARR'
                    ,cnt : { $sum : 1 }
                }
            }
        ]);

        var doc = {
            dt : dt
            ,y : ymd.substr(0,4)
            ,m : ymd.substr(4,2)
            ,w : w
            ,data : arr
            ,region : obj.ocd
            ,region_c : obj.cd
            ,name : obj.name
        }

        var y1 = {y:( parseInt(doc.y,10) - 1 ) + '', w : doc.w , region_c : doc.region_c , data : []};
        var y2 = {y:( parseInt(doc.y,10) - 2 ) + '', w : doc.w , region_c : doc.region_c , data : []};
        var y3 = {y:( parseInt(doc.y,10) - 3 ) + '', w : doc.w , region_c : doc.region_c , data : []};

        y1 = CAT_C_WEEK.findOne({y:y1.y , w : doc.w , region_c : doc.region_c }) || y1 ;//1년전 데이터
        y2 = CAT_C_WEEK.findOne({y:y2.y , w : doc.w , region_c : doc.region_c }) || y2 ;//2년전 데이터
        y3 = CAT_C_WEEK.findOne({y:y3.y , w : doc.w , region_c : doc.region_c }) || y3 ;//3년전 데이터

        //현재데이터로 과거 데이터 건수를 취하기
        _.each(doc.data,function(obj,idx){

            obj['cnt1'] =  ( _.findWhere(y1.data,{_id:obj._id}) || {cnt:undefined} ).cnt;
            obj['cnt2'] =  ( _.findWhere(y2.data,{_id:obj._id}) || {cnt:undefined} ).cnt;
            obj['cnt3'] =  ( _.findWhere(y3.data,{_id:obj._id}) || {cnt:undefined} ).cnt;

        });

        CAT_C_WEEK.insert(doc);

    });

};

cysBatch.CMon = function(ym){

    var CCode = cysBatch.getCCode();

    console.log('CMon' , {dt : ym},'삭제');

    CAT_C_MONTH.remove({dt : ym});

    _.each( CCode , function(obj,idx){

        var matchCondition = {WDATE : { $regex : '^'+ym } , CNSL_OGNZ_CD : obj.cd };

        var arr = BDATA.aggregate([
            {
                $match : matchCondition
            },
            {
                $unwind : '$CDARR'
            },
            {
                $group : {
                    _id:'$CDARR'
                    ,cnt : { $sum : 1 }
                }
            }
        ]);

        var doc = {
            dt : ym
            ,y : ym.substr(0,4)
            ,m : ym.substr(4,2)
            ,data : arr
            ,region : obj.ocd
            ,region_c : obj.cd
            ,name : obj.name
        };

        var y1 = {y:( parseInt(doc.y,10) - 1 ) + '', m : doc.m , region_c : doc.region_c , data : []};
        var y2 = {y:( parseInt(doc.y,10) - 2 ) + '', m : doc.m , region_c : doc.region_c , data : []};
        var y3 = {y:( parseInt(doc.y,10) - 3 ) + '', m : doc.m , region_c : doc.region_c , data : []};

        y1 = CAT_C_MONTH.findOne({y:y1.y  , m : doc.m , region_c : doc.region_c}) || y1 ;//1년전 데이터
        y2 = CAT_C_MONTH.findOne({y:y2.y  , m : doc.m , region_c : doc.region_c}) || y2 ;//2년전 데이터
        y3 = CAT_C_MONTH.findOne({y:y3.y  , m : doc.m , region_c : doc.region_c}) || y3 ;//3년전 데이터

        //현재데이터로 과거 데이터 건수를 취하기
        _.each(doc.data,function(obj,idx){

            obj['cnt1'] =  ( _.findWhere(y1.data,{_id:obj._id}) || {cnt:undefined} ).cnt;
            obj['cnt2'] =  ( _.findWhere(y2.data,{_id:obj._id}) || {cnt:undefined} ).cnt;
            obj['cnt3'] =  ( _.findWhere(y3.data,{_id:obj._id}) || {cnt:undefined} ).cnt;

        });

        CAT_C_MONTH.insert(doc);

    });

    console.log({dt : ym},'끝');

};


cysBatch.CYear = function(yyyy){

    var CCode = cysBatch.getCCode();

    console.log({dt : yyyy},'삭제');

    CAT_C_YEAR.remove({dt : yyyy});  //년도 전체 삭제

    _.each( CCode , function(obj,idx){

        var matchCondition = {WDATE : { $regex : '^'+yyyy } , CNSL_OGNZ_CD : obj.cd };

        console.log(yyyy,obj.cd,obj.name);

        var arr = BDATA.aggregate([
            {
                $match : matchCondition
            },
            {
                $unwind : '$CDARR'
            },
            {
                $group : {
                    _id:'$CDARR'
                    ,cnt : { $sum : 1 }
                }
            }
        ]);

        var doc = {
            dt : yyyy
            ,y : yyyy.substr(0,4)
            ,data : arr
            ,region : obj.ocd
            ,region_c : obj.cd
            ,name : obj.name
        };

        var y1 = {y:( parseInt(doc.y,10) - 1 ) + '', region_c : doc.region_c ,data : []};
        var y2 = {y:( parseInt(doc.y,10) - 2 ) + '', region_c : doc.region_c ,data : []};
        var y3 = {y:( parseInt(doc.y,10) - 3 ) + '', region_c : doc.region_c ,data : []};

        y1 = CAT_C_YEAR.findOne({y:y1.y  , region_c : doc.region_c}) || y1 ;//1년전 데이터
        y2 = CAT_C_YEAR.findOne({y:y2.y  , region_c : doc.region_c}) || y2 ;//2년전 데이터
        y3 = CAT_C_YEAR.findOne({y:y3.y  , region_c : doc.region_c}) || y3 ;//3년전 데이터


        //현재데이터로 과거 데이터 건수를 취하기
        _.each(doc.data,function(obj,idx){

            obj['cnt1'] =  ( _.findWhere(y1.data,{_id:obj._id}) || {cnt:undefined} ).cnt;
            obj['cnt2'] =  ( _.findWhere(y2.data,{_id:obj._id}) || {cnt:undefined} ).cnt;
            obj['cnt3'] =  ( _.findWhere(y3.data,{_id:obj._id}) || {cnt:undefined} ).cnt;

        });

        CAT_C_YEAR.insert(doc);

    });

    console.log({dt : yyyy},'끝');

};


//센터코드 구하기.
cysBatch.getCCode = function(){

    var RCode = [];

    _.each( CommonCode.findOne({_id:"L02290300"}).cd , function(obj) {

        RCode.push ( obj.cd );

    });

    var CCode = [];
    _.each( CommonCode.find({_id:{$in:RCode}}).fetch() , function(obj){

        _.each(obj.cd , function(obj2){

            obj2["ocd"] = obj._id;
            CCode.push(obj2);

        })

    });
    return CCode;

};
