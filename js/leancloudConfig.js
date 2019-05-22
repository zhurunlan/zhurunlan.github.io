var leanCloud = (function(){
    var APP_ID = '1xtmtjGtUgazAb15lRdFHW3Y-gzGzoHsz';
    var APP_KEY = '92CeykCDN5uU17VYVUrXBvnq';
    var className,Todo;
    var pageCounts = 2; // 每页返回条数
    if($('.leancloud_visitors').attr('data-pageNum')!= 'undefined'){
        var pageNum = parseInt($('.leancloud_visitors').attr('data-pageNum'))-1;    // 当前页码
    }

    // 初始化
    AV.init({
        appId: APP_ID,
        appKey: APP_KEY
    });

    // 新增一条 文章统计数据【仅限一条】
    var _addCount = function() {
        // 监听 新增按钮 被点击
        function addListenButton(){
            setTimeout(function(){
                console.log('start listen...');
                $('.new-post_button').click(function(){addListenInput();})
            },5000)    //考虑到服务器的带宽仅有1M，网速较慢所以将此方法延迟执行
        }
        // 监听 回车/点击确定按钮 后 执行保存
        function addListenInput(){
            var inputTitle;
            setTimeout(function(){
                $('.new-post_input').blur(function(){
                    inputTitle = $(this).val();
                })
                $('.new-post_ok').mousedown(function(){
                    var title = $('.new-post_input').val();
                    saveToLeancloud(title);
                    addListenButton();
                })
                $(document).keypress(function(e){
                    if(e.which == 13){
                        var title = inputTitle;
                        saveToLeancloud(title);
                        addListenButton();
                    }
                })
            },500)
        }

        // 保存
        function saveToLeancloud(title){
            var newData = new Todo();
            newData.save({
                title: title,
                content: '0'
            }).then(function (data) {
                console.log(data);
            })
        }
        addListenButton();
    }

    // 获取详情页的访问次数数据
    var _getDetailTime = function(title) {
        var query = new AV.Query(className);
        query.equalTo("title", title);
        return query.find();
    }

    // 获取列表页的访问次数数据
    var _getListTime = function(){
        var query = new AV.Query(className);
        query.limit(pageCounts);            // 查询数据时返回的数量-每页返回的条数
        query.skip(pageCounts*pageNum);     // 查询数据时跳过的数量-当前页码*每页返回的条数
        query.descending('createdAt');      // 按新建的时间降序排列
        return query.find();
    }

    // 更新一条 文章浏览量数据
    var _update = function(obj){
        // 第一个参数是 className，第二个参数是 objectId
        var todo = AV.Object.createWithoutData(className, obj.id);
        var count = parseInt(obj.get('content'))+1;
        // 修改属性
        todo.set('content', count.toString());
        // 保存到云端
        todo.save();
    }
    // 填充访问次数
    var _writeCount = function(data){
        if($('.post-page').length == 0){
            $('.leancloud_visitors').each(function(i,e){
                $(e).text(parseInt(data[i].get('content')));
            })
        }else{
            $('.leancloud_visitors').each(function(i,e){
                $(e).text(parseInt(data[i].get('content'))+1);
            })
        }
    }

    // 判断列表页or详情页
    var _isList = function(){
        if($('.post-page').length == 0){
            return true;
        }
    }

    var constructor = function(config){}

    // 获取浏览量数据
    constructor.prototype._getTime = function(clsName){
        className = clsName;
        Todo = AV.Object.extend(className);
        if(_isList()){
            _getListTime().then(function(data) {
                _writeCount(data);
            }, function (error) {
                // error is an instance of AVError.
                console.log(error);
            });
        }else{
            var title = $('.leancloud_visitors').attr('id');
            _getDetailTime(title).then(function(data){
                _writeCount(data);
                _update(data[0]);
            })
        }
        return this;
    }
    constructor.prototype._addCount = function(clsName){
        className = clsName;
        Todo = AV.Object.extend(className);
        _addCount();
        return this;
    }

    //返回构造函数
    return constructor;
})()
