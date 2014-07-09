$(function(){
    // 登录页面
    if (window.location.host.search(/login\.taobao\.com$/) > -1) {
        $("#TPL_username_1").val("登录账号");
        $("#TPL_password_1").val("登录密码");
        $("#J_SubmitStatic").click();
        
        return;
    } else if (window.location.host.search(/bbs\.taobao\.com$/) == -1) {
        // 非论坛页面
        //window.location = "http://bbs.taobao.com";
        return;
    }
    
    // 未登录
    if ($("#J_LoginInfoHd").size() > 0) {
        // 登录
        $("#J_LoginInfoHd").find("a").first().html("登录").click();
        //window.location.href = $("#J_LoginInfoHd").find("a").first().attr("href");
    }
        
    // 淘宝杂谈
    if (window.location.pathname == '/' || window.location.pathname == '/index.htm') {
        window.location.href = $("#J_Subnav_zatan").find("a").first().attr("href");
    }
    
    if (window.location.href == 'http://bbs.taobao.com/catalog/424015.htm') {
        
        $(".main-wrap .post .bd").find("table").last().css("backgroundColor", "#CCC");
        
        var hrefs = new Array();
        var num = 0;
        $(".main-wrap .post .bd").find("table").last().find("tbody tr").each(function(){
            num = $(this).find("td.score em").first().html();
            
            if (num != null && num <= 5) {
                var href = $(this).find("td.subject a").first().attr("href");
                
                if (typeof href != 'undefined') {
                    hrefs.push(href);
                }
            }
        });
        
        if (hrefs.length == 0) {
            console.log(hrefs);
            window.location.reload();
            return;
        }
        
        console.log(hrefs.length);
        openUrl(hrefs);
    }
    
    // 打开论坛
    function openUrl(hrefs)
    {
        console.log("HREFS:"+hrefs.length);
        console.log(hrefs);
        
        var myWindow = window.open(hrefs.shift()/*, 'myWindow'*/);
        setTimeout(function(){
            // 避免打开窗口长期没有关闭
            //myWindow.close();
            
            if (hrefs.length > 0) {
                openUrl(hrefs);
            } else {
               /// window.location.reload();
            }
            
        }, 10000);
    }
    
    // 回帖
    if ($("#addReplyForm").size() > 0) {
        document.body.scrollTop = document.body.scrollHeight;

        
        if ($("#checkCodeInput").size() > 0) {
            $("#checkCodeInput").focus();
            
            // 抓取验证码
            captureCode();
            
            console.log("输入验证码");
        }
        
        // 错误提示
        if ($(".Reply-info .error").size() > 0) {
            console.log($(".Reply-info .error").html());
        }
    }
});

var cap_time = 0;
// 抓取验证码
function captureCode()
{
    if (parseInt(cap_time) > 20) {
        // 直接退出
        //window.close();
        return;
    }
    console.log("captureCode");
    
    $("#checkCodeInput").focus();
    cap_time++;
    if ($("#J_CheckCodeImg1").size() == 0) {
        setTimeout(captureCode, 200);
        return;
    }
    
    $("#J_CheckCodeImg1").css("border","2px solid #F00");
                
    var href = $("#J_CheckCodeImg1").attr("src");
    var down_img = Date.now()+".png";
    
    $("#J_ImgCode1").append("<a href='"+href+"' download='"+down_img+"' style='width:1px; height:1px;'><input id='tb_down' type='button' name='下载' /></a>");
    
    // 绑定事件
    $("#tb_down").bind("click", function(){
        getCode(down_img);
    });
    
    $("#tb_down").click();
}


var get_time = 0;
// 获取验证码
function getCode(imgName)
{
    if (parseInt(get_time) > 20) {
        // 直接退出
        return;
    }
    get_time++;
    
    $.get("http://test.com/uuwise/demo.php", {filename:imgName}, function(msg){
        console.log(msg+"->"+msg.search(/result:/));
        
        if (msg.search(/result:/) > -1) {
            // 成功
            msg = msg.replace(/result:/, '');
            $("#checkCodeInput").val(msg);
            
            reply();
            return;
        }
        
        console.log(msg);
        if (msg === "error: file not exists"){
            setTimeout(function(){getCode(imgName);}, 200);
            return;
        }
    });
}

// 回帖
function reply()
{
    $("#msgpost").show().html("回帖是一种美德");
    $("#anon").attr("checked", "checked");
    $("#submitBtn").click();
}