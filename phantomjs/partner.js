var page = require("webpage").create();

phantom.outputEncoding = "gbk";         // 输出字符编码
page.settings.resourceTimeout = 15000;  // 设置页面超时时长

page.onConsoleMessage = function(msg, lineNum, sourceId) {
    if (msg.search(/Phantom/) > -1) {
        msg = msg.replace(/Phantom:/, '');
        console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
    }
};


// 日志记录
var fs = require("fs");
var date = new Date();
var month = date.getMonth()+1;
if (parseInt(month) < 10) {
    month = "0"+month;
}

var day = date.getDate();
if (parseInt(day) < 10) {
    day = "0"+day;
}

var time = date.getFullYear().toString()+month.toString()+day.toString();

// 日志记录
function logfile(content)
{
    var file = "./logs/"+time+"/phantom.log";
    
    // 加上换行符
    if (content.search(/\\r\\n/) == '-1') {
        content += "\r\n";
    }
    
    fs.write(file, content, 'a');
}


var host = "域名",
    open_status = false;


page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];

    if (trace && trace.length) {
        msgStack.push('TRACE:');
        
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
        });
    }

    console.log(msgStack.join('\n'));
};

// 请求超时
page.onResourceTimeout = function(request) {
    logfile('Response (#' + request.id + '): ' + JSON.stringify(request));
    
    console.log("Timeout");
    open_status = false;
    return;
};

page.onLoadFinished = function(status) {
    if (status != 'success') {
        open_status = false;
        return;
    }
    
    if (page.url.search(/preg/) > -1) {
        console.log('LoadFinished:'+status);
    } else {
        console.log('LoadFinished:'+status+'; Url:'+page.url);
    }
    
    // 检测标志
    if (page.url.search(/pref/) == -1) {
        var pos = page.evaluate(function(){
            return document.body.innerHTML.search(/preg/);
        });
        
        console.log("Pos:"+pos);
        
        if (pos < 0) {
            logfile("Partner fail:"+page.url);
            
            var refer = escape(page.url);
            page.open(host+"url?refer="+refer, function(status){
                open_status = false;
            });
        } else {
            open_status = false;
        }
    }
};

// 验证合作网址
function partner()
{
    open_status = true;
    console.log("\r\nStart partner");
    
    page.open(host+"url", function(status){
        
        var match = page.content.match(/<body>([^<]*)<\/body>/);
        
        if (match === null || typeof match[1] == "undefined" || match[1] == 0) {
            console.log("No url");
            open_status = false;
            return;
        }
        
        var uri = match[1].replace(/&amp;/g, '&');
        
        console.log("Open partner url:"+uri);
        
        page.open(uri, function(status){});
    });
}

var times = 0,
    t = 0;
var timer = window.setInterval(function(){
    if (times >= 1000) {
        console.log("Phantom exit");
        window.clearInterval(timer);
        phantom.exit();
    }
    
    if (open_status == false) {
        partner();
        times++;
        t = 0;
    }
    
    if (t > 30) {
        open_status = false;
    }
    
    console.log(times);
    
    t++;
}, 2000);

