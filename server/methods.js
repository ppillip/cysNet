
Router.route('/batch/:methodName', function () {

    console.log('컨트롤러 : '  + this.params.methodName);

    var b = null;

    var self = this;

    Meteor.call( 'batch' , function(a,result){

        self.response.end(JSON.stringify(result));

    });

}, {where: 'server'});


//배치
batch = [
    {
        name : 'min1',
        term : later.parse.text('every 1 second'),
        doSomething : function(){
            console.log('나는 1111');
        },
        handle : null
    }
    ,{
        name : 'min2',
        term : later.parse.text('every 5 second'),
        doSomething : function(){
            console.log('나는 5555');
        },
        handle : null
    }
];

_.each(batch , function(obj,idx){
    obj.handle = new ScheduledTask(obj.term,obj.doSomething);
});




Meteor.methods({


    batch : function(name){

        _.findWhere(batch,{name:key}).doSomething();

    }
    ,startTaskThatAll : function(){
        _.each(batch , function(obj,idx){
            obj.handle.start();
        });
    }
    ,startTaskThatOne : function(){
        _.findWhere(batch,{name:key}).handle.start();
    }
    ,stopTaskThatOne : function(key){
        _.findWhere(batch,{name:key}).handle.stop();
    }
    ,nice : function(){

            console.log("method nice");

            var condition = [
                {
                    $match : {
                        C_CONTENT1_ARRAY:{$exists:true}
                        ,$and : [
                            { CSDATE : { $gt : '20020225'} }
                            ,{ CSDATE : { $lt : '20040410'} }
                        ]
                    }
                },
                {
                    $unwind : '$C_CONTENT1_ARRAY'
                },
                {
                    $project : {
                        count : "$C_CONTENT1_ARRAY.c"
                        ,word : "$C_CONTENT1_ARRAY.w"
                    }
                },
                {
                    $group : {
                        _id : '$word'
                        ,count : { $sum : '$count'}
                    }
                },
                {
                    $match : {
                        _id : {$in : ['현재','주동','학습']}
                    }

                }


            ];
        console.log('배치 스타트');
        var x = C01.aggregate(condition);
        console.log('배치 끝');
        return  {err : false,rows:x};

    }

});