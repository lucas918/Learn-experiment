$(function(){
    if (window.location.host.search(/reg\.taobao\.com$/) == -1) {
        // 非注册页面
        //window.location = "http://reg.taobao.com/member/new_register.jhtml";
        return;
        
    }
    else if (window.location.pathname.search(/\/member\/new_register\.jhtml/) > -1 || window.location.pathname.search(/\/member\/newRegister\.jhtml/) > -1) {
        // 删除昵称记录
        localStorage.removeItem("tb_local");
        
        // 提交时检测错误
        $("#J_BtnBasicInfoForm").bind("click", function(){
        
            console.log("click submit");
            window.setTimeout(function(){
                if ($("#J_Code ~ .msg-box").find(".msg-cnt").html() != '') {
                    console.log("code error");
                    // 考虑到验证码的自我刷新问题，下载的最新验证码一定要在刷新之后
                    //setTimeout(captureCode, 1000);
                    window.location.reload();
                }
            }, 1000);
        });
        
        // 注册页
        captureCode();
        
        createName();
        $("#J_Pwd").val("taobao123456");
        $("#J_RePwd").val("taobao123456");
        
    }
    else if (window.location.pathname.search(/\/member\/new_cellphone_reg_two\.jhtml/) > -1) {
        // 验证用户信息
        window.location.href = $(".switch-way").find("a").first().attr("href");
        
    }
    else if (window.location.pathname.search(/\/member\/new_email_reg_two\.jhtml/) > -1) {
        $("#J_Email").focus();
        var nick = localStorage.getItem('tb_local');
        if (nick == null || nick == '') {
            nick = $("#J_UserNumId").val();
        }
        
        $("#J_Email").val( "注册邮箱" );
        $("#J_Email").blur();
        // 检测手机验证
        $("#J_EmailForm").find(":submit").first().bind("click", function(){
            setTimeout(checkValid, 1000);
        });
        $("#J_PhoneForm").find(":submit").first().bind('click', function(){
            setTimeout(checkValid, 1000);
        });
        $("#J_CheckPop").find(":submit").first().bind('click', function(){
            console.log("check sms");
            //setTimeout(checkValid, 1000);
        });
        
        setTimeout(function(){
            if ($("#J_EmailTip").hasClass("msg-error")) {
                //window.location.reload();
            } else {
                $("#J_EmailForm").find(":submit")[0].click();
            }
        }, 800);
    }
    
});

// 创建用户名
var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
function createName()
{
    var rand = Math.random();
    var length = 5 + Math.round(rand * 10);
    
    var nick = '';
    for (var i=0; i<length; i++) {
        var pos = Math.round(35*Math.random());
        
        nick += chars.slice(pos, pos+1);
    }
    console.log(nick);
    
    localStorage.setItem("tb_local", nick);
    $("#J_Nick").val(nick);
    
    if ($("#J_NickSuggestList").find("li").size() > 0) {
        // 昵称已被使用
        console.log("nick");
        setTimeout(function(){/*window.location.reload();*/}, 1000);
    }
}


var cap_time = 0,
    get_time = 0;

// 抓取验证码
function captureCode()
{
    if (parseInt(cap_time) > 20) {
        //window.location.reload();
        return;
    }
    console.log("capture："+cap_time);
    
    $("#J_Code").focus();
    //$("#J_Code").click();
    cap_time++;
    if ($("#J_CheckCodeImg1").size() == 0) {
        console.log("img is display");
        setTimeout(captureCode, 200);
        return;
    }
    
    var href = $("#J_CheckCodeImg1").attr("src");
    var down_img = Date.now()+".png";
    console.log(down_img);
    
    if ($("#tb_down").size() == 0) {
        $("#J_ImgCode1").append("<a href='"+href+"' download='"+down_img+"' style='width:1px; height:1px;'><input id='tb_down' type='button' name='下载' /></a>");
    } else {
        $("#tb_down").parents("a").attr("download", down_img);
    }
    
    // 绑定事件
    $("#tb_down").bind("click", function(){
        get_time = 0;
        getCode(down_img);
    });
    
    $("#tb_down").click();
}

// 获取验证码
function getCode(imgName)
{
    if (parseInt(get_time) > 10) {
        // 直接退出
        return;
    }
    get_time++;
    console.log("getimg:"+get_time);
    
    $.get("http://test.com/uuwise/demo.php", {filename:imgName}, function(msg){
        console.log(msg);
        if (msg.search(/result:/) > -1) {
            // 成功
            msg = msg.replace(/result:/, '');
            $("#J_Code").val(msg);
            $("#J_Code").blur();
            
            register();
            return;
        }
        
        if (msg === "error: file not exists"){
            setTimeout(function(){getCode(imgName);}, 500);
            return;
        }
    });
}

// 提交注册
function register()
{
    if ($("#J_Nick").val() == '' || $("#J_Pwd").val() == '' || $("#J_RePwd").val() == '') {
        setTimeout(function(){$("#J_BtnBasicInfoForm").click();}, 1000);
        return;
    }
    
    $("#J_BtnBasicInfoForm").click();
}

// 手机验证
function checkValid()
{
    console.log($("#J_PhonePop").css("display"));
    console.log($("#J_CheckPop").css("display"));
    
    
    if ($("#J_PhonePop:visible").size() > 0) {
        $.get("http://test.com/sms/index.php", {type:'phone'}, function(msg){
            if (msg != 'empty phone') {
                $("#J_PhoneInput").val(msg);
                
                $("#J_PhoneForm").find(":submit")[0].click();
            }
        });
        
        console.log("phone check");
    }
    else if ($("#J_CheckPop:visible").size() > 0) {
        console.log("sms check");
    }
}
