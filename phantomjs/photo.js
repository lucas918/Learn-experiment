var page = require("webpage").create(),
    system = require("system"),
    store_id = null,
    //good_id = null,
    iid = null,
    path;

if (system.args.length == 1)
{
    console.log("Args error");
    phantom.exit();
}

iid = system.args[1];

page.settings.userAgent = "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.116 Safari/537.36";    // 指定HTTP请求的userAgent头信息
page.viewportSize = {width:950, height:900};	// 指定浏览器窗口的大小

var url = 'http://item.taobao.com/item.htm?id='+iid;

page.open(url, function(status){
	if (status !== "success")
	{
		console.log('Fail to load the address:'+url);
        phantom.exit();
	}
	console.log("Loading "+url);

    page.includeJs("http://libs.baidu.com/jquery/2.0.0/jquery.min.js", function(){

		console.log("includeJs");
		phantom.exit();
        
        window.setTimeout(function(){
            var win_height = '';
            var t1 = 0; // 统计第一个interval次数
            
            var timer1 = window.setInterval(function(){
                // 获取页面参数
                var params = page.evaluate(function(){
                    var info = {};
                    
                    var h_nav = $("#J_SiteNav").height();
                    var h_head = $("#J_Header").height()+parseInt($("#J_Header .tb-header-content").css("margin-top"));
                    var h_dc = $("#J_DcHead").height()+parseInt($("#J_DcHead").css("margin-top"))+parseInt($("#J_DcHead").css("margin-bottom"));
                    var h_detail = $("#detail").height()+parseInt($("#content .tb-detail-bd").css("margin-bottom"));
                    
                    info.top = parseInt(h_nav+h_head+h_dc+h_detail);
                    
                    info.bar_height = $("#J_TabBarWrap").height()+parseInt($("#J_TabBarWrap").css("margin-bottom"));
                    info.left = parseInt($("#J_MainWrap").css("margin-left"));
                    
                    info.width = $("#J_SubWrap").width();
                    info.height = $("#J_SubWrap").height();
                    
					console.log("info");
                    return info;
                });
                
                console.log("top:"+params.top+"; left:"+params.left+"; width:"+params.width+"; height:"+params.height+"; bar_height:"+params.bar_height);
                
                t1++;
                
                if ((win_height == '' && t1 < 10) || win_height != params.height) {
                    win_height = params.height;
                    
                    if (params.top != '') {
                        // 页面滚动
                        page.scrollPosition = {top:params.top, left:0};
                    }
                    
                    return;
                }
                
                // 750宽度
                if (params.left != '')
                    params.left = 275;
                
                // 终止循环查询
                window.clearInterval(timer1);
                
                /************** 开始截图 ****************/
                // 截取图片范围
                var _height = parseInt(900-params.bar_height);
                page.clipRect = {top:params.bar_height, left:params.left, width:params.width, height:_height};
                
                // 页面滚动
				var scroll_top = params.top;
                page.scrollPosition = {top:scroll_top, left:0};
                
                console.log("creating images");
                
                var t2 = 1;
                var timer2 = window.setInterval(function(){
					if (parseInt(t2) < 10 ) {
						t2 = "0"+t2;
					}
                    
                    console.log(t2);
                    page.render(iid+"/"+t2+".jpeg");
                    
                    if (params.height <= _height*t2) {
                        window.clearInterval(timer2);
                        
                        phantom.exit();
                        
                    } else if (parseInt(params.height-_height) < _height*t2) {
                        page.clipRect = {top:params.bar_height, left:params.left, width:params.width, height:parseInt(params.height-_height*t2-params.bar_height)};
                    }
                    
                    // 页面滚动
					if (parseInt(t2) < 2) {
						// 针对第一次滚动效果不同做出调整，J_TabBarWrap定位首次变成fixed
						scroll_top = params.top+_height*t2-params.bar_height;
					} else {
						scroll_top = params.top+_height*t2;
					}

                    page.scrollPosition = {
                        top: parseInt(scroll_top),
                        left: 0
                    };
                    
                    t2++;
                    
                }, 1000);
            }, 1000);
        }, 100);
    });
});

page.onError = function(msg, trace) {

	var msgStack = ['ERROR: ' + msg];

	if (trace && trace.length) {
		msgStack.push('TRACE:');
		trace.forEach(function(t) {
			msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
		});
	}

	console.error(msgStack.join('\n'));
};


// 错误
phantom.onError = function(msg, trace) {
	var msgStack = ['PHANTOM ERROR: ' + msg];

	if (trace && trace.length) {
		msgStack.push('TRACE:');
		trace.forEach(function(t) {
			msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
		});
	}

	console.error(msgStack.join('\n'));

	phantom.exit(1);
};