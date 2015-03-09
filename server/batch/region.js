//인덱스 걸었음 db.BDATA.ensureIndex({WDATE:1});

//var ymdh = '2002042012';
cysBatch = {};

cysBatch.gogo = function(){
    //cysBatch.goYear();
    //cysBatch.goMonth();
    cysBatch.goWeek();
    cysBatch.goDay();
    cysBatch.goHour();
};

cysBatch.goYear = function(){

    cysBatch.RYear('2010');
    cysBatch.RYear('2011');
    cysBatch.RYear('2012');
    cysBatch.RYear('2013');
    cysBatch.RYear('2014');


};

cysBatch.goMonth = function(){
    _.each(['2010','2011','2012','2013','2014'],function(yy){
    //_.each(['2015'],function(yy){

        _.each(utl.mm(),function(mm){
            console.log(yy+mm);
            //cysBatch.RMon(yy+mm);
            cysBatch.CMon(yy+mm);
        });
    })


};

cysBatch.goWeek = function(){

    _.each(['2014'],function(yy){

        _.each(utl.mm(),function(mm){

            _.each(utl.dd(mm),function(dd){

                cysBatch.Cweek(yy+mm+dd);

            });

        });

    })

};

cysBatch.goDay = function(){

    _.each(['2010','2011','2012','2013','2014'],function(yy){

        _.each(utl.mm(),function(mm){

            _.each(utl.dd(mm),function(dd){

                cysBatch.CDay(yy+mm+dd);


            });

        });

    })

};

cysBatch.goHour = function(){

    _.each(['2010','2011','2012','2013','2014'],function(yy){

        _.each(utl.mm(),function(mm){

            _.each(utl.dd(mm),function(dd){

                _.each(utl.sRange(0,24,1,'00'),function(hh){

                    cysBatch.RHour(yy+mm+dd+hh);
                    cysBatch.CHour(yy+mm+dd+hh);

                });

            });

        });

    })

};


//지역별 시간
//db.TEST_R_HOUR.ensureIndex({dt:1});
cysBatch.RHour = function(ymdh){

    console.log('RHour',{dt : ymdh},'삭제');

    CAT_R_HOUR.remove({dt : ymdh});

    _.each( CommonCode.findOne({_id:"L02290300"}).cd , function(obj,idx){

        var matchCondition = {WDATE : ymdh , CNSL_RGN_CD : obj.cd };

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

        CAT_R_HOUR.insert({
            dt : ymdh
            ,y : ymdh.substr(0,4)
            ,m : ymdh.substr(4,2)
            ,d : ymdh.substr(6,2)
            ,h : ymdh.substr(8,2)
            ,data : arr
            ,region : obj.cd
            ,name : obj.name
        });

    });
};

//db.TEST_R_DAY.ensureIndex({region:1,y:1,m:1,d:1});
cysBatch.RDay = function(ymd){

    console.log('RDay',{dt : ymd},'삭제');

    CAT_R_DAY.remove({dt : ymd});

    _.each( CommonCode.findOne({_id:"L02290300"}).cd , function(obj,idx){

        var matchCondition = {WDATE : { $regex : '^'+ymd } , CNSL_RGN_CD : obj.cd };

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

        CAT_R_DAY.insert({
            dt : ymd
            ,y : ymd.substr(0,4)
            ,m : ymd.substr(4,2)
            ,d : ymd.substr(6,2)
            ,data : arr
            ,region : obj.cd
            ,name : obj.name
        });

    });

    console.log({dt : ymd},'Rday 끝');

};


/* 토요일만 실행됨 */
// db.TEST_R_WEEK.ensureIndex({region:1,y:1,w:1});
cysBatch.Rweek = function(ymd){
    console.log( 'Rweek' );
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

    CAT_R_WEEK.remove({y:ymd.substr(0,4) , w : w});

    _.each( CommonCode.findOne({_id:"L02290300"}).cd , function(obj,idx){

        var matchCondition = {
            $and : [
                { WDATE : { $gt : start} },
                { WDATE : { $lt : end} }
            ],
            CNSL_RGN_CD : obj.cd
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
            ,region : obj.cd
            ,name : obj.name
        };

        var y1 = {y:( parseInt(doc.y,10) - 1 ) + '', w : doc.w , region : doc.region ,data : []};
        var y2 = {y:( parseInt(doc.y,10) - 2 ) + '', w : doc.w , region : doc.region ,data : []};
        var y3 = {y:( parseInt(doc.y,10) - 3 ) + '', w : doc.w , region : doc.region ,data : []};

        y1 = CAT_R_WEEK.findOne({y:y1.y , w : doc.w , region : doc.region }) || y1 ;//1년전 데이터
        y2 = CAT_R_WEEK.findOne({y:y2.y , w : doc.w , region : doc.region }) || y2 ;//2년전 데이터
        y3 = CAT_R_WEEK.findOne({y:y3.y , w : doc.w , region : doc.region }) || y3 ;//3년전 데이터

        //현재데이터로 과거 데이터 건수를 취하기
        _.each(doc.data,function(obj,idx){

            obj['cnt1'] =  ( _.findWhere(y1.data,{_id:obj._id}) || {cnt:undefined} ).cnt;
            obj['cnt2'] =  ( _.findWhere(y2.data,{_id:obj._id}) || {cnt:undefined} ).cnt;
            obj['cnt3'] =  ( _.findWhere(y3.data,{_id:obj._id}) || {cnt:undefined} ).cnt;

        });

        CAT_R_WEEK.insert(doc);

    });
};

//db.TEST_R_MONTH.ensureIndex({region:1,y:1,m:1});
cysBatch.RMon = function(ym){

    console.log('RMon' , {dt : ym},'삭제');

    CAT_R_MONTH.remove({dt : ym});

    _.each( CommonCode.findOne({_id:"L02290300"}).cd , function(obj,idx){

        var matchCondition = {WDATE : { $regex : '^'+ym } , CNSL_RGN_CD : obj.cd };

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
            ,region : obj.cd
            ,name : obj.name
        };

        var y1 = {y:( parseInt(doc.y,10) - 1 ) + '', m : doc.m , region : doc.region ,data : []};
        var y2 = {y:( parseInt(doc.y,10) - 2 ) + '', m : doc.m , region : doc.region ,data : []};
        var y3 = {y:( parseInt(doc.y,10) - 3 ) + '', m : doc.m , region : doc.region ,data : []};

        y1 = CAT_R_MONTH.findOne({y:y1.y  , m : doc.m , region : doc.region}) || y1 ;//1년전 데이터
        y2 = CAT_R_MONTH.findOne({y:y2.y  , m : doc.m , region : doc.region}) || y2 ;//2년전 데이터
        y3 = CAT_R_MONTH.findOne({y:y3.y  , m : doc.m , region : doc.region}) || y3 ;//3년전 데이터

        //현재데이터로 과거 데이터 건수를 취하기
        _.each(doc.data,function(obj,idx){

            obj['cnt1'] =  ( _.findWhere(y1.data,{_id:obj._id}) || {cnt:undefined} ).cnt;
            obj['cnt2'] =  ( _.findWhere(y2.data,{_id:obj._id}) || {cnt:undefined} ).cnt;
            obj['cnt3'] =  ( _.findWhere(y3.data,{_id:obj._id}) || {cnt:undefined} ).cnt;

        });

        CAT_R_MONTH.insert(doc);

    });

    console.log({dt : ym},'끝');
};

//db.TEST_R_YEAR.ensureIndex({region:1,y:1});
cysBatch.RYear = function(yyyy){

    console.log('RYear' ,{dt : yyyy},'삭제');

    CAT_R_YEAR.remove({dt : yyyy});

    _.each( CommonCode.findOne({_id:"L02290300"}).cd , function(obj,idx){

        var matchCondition = {WDATE : { $regex : '^'+yyyy } , CNSL_RGN_CD : obj.cd };

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
            ,region : obj.cd
            ,name : obj.name
        };

        var y1 = {y:( parseInt(doc.y,10) - 1 ) + '', region : doc.region ,data : []};
        var y2 = {y:( parseInt(doc.y,10) - 2 ) + '', region : doc.region ,data : []};
        var y3 = {y:( parseInt(doc.y,10) - 3 ) + '', region : doc.region ,data : []};

        y1 = CAT_R_YEAR.findOne({y:y1.y  , region : doc.region}) || y1 ;//1년전 데이터
        y2 = CAT_R_YEAR.findOne({y:y2.y  , region : doc.region}) || y2 ;//2년전 데이터
        y3 = CAT_R_YEAR.findOne({y:y3.y  , region : doc.region}) || y3 ;//3년전 데이터


        //현재데이터로 과거 데이터 건수를 취하기
        _.each(doc.data,function(obj,idx){

            obj['cnt1'] =  ( _.findWhere(y1.data,{_id:obj._id}) || {cnt:undefined} ).cnt;
            obj['cnt2'] =  ( _.findWhere(y2.data,{_id:obj._id}) || {cnt:undefined} ).cnt;
            obj['cnt3'] =  ( _.findWhere(y3.data,{_id:obj._id}) || {cnt:undefined} ).cnt;

        });

        CAT_R_YEAR.insert(doc);
    });

    console.log({dt : yyyy},'끝');

};


