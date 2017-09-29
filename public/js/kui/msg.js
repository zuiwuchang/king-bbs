/* 使用 bootstrap 製作的 各種 模式 對話框 */
(function (g) {
"use strict";
g.kui = g.kui || {};
var ui = g.kui;

ui.NewMsg = ui.NewMsg || function(initObj){
    var jqElement = initObj.Element || $("body");
    var id = initObj.Id || "0";
    var btns = initObj.Btns;


    var id = "kingui-msg-" + id;
    var html = "<div>" + 
            "<button class='btn btn-default' data-toggle='modal' data-target='#" + id + "' style='display: none;'></button>" +
            "<div id='" + id + "' class='modal fade' role='dialog'>" +
            "<div class='modal-dialog'>" +
                "<div class='modal-content'>" +
                    "<div class='modal-header'>" +
                    "<button class='close' data-dismiss='modal'>&times;</button>" +
                    "<h4 class='modal-title'></h4>" +
                    "</div>" +

                    "<div class='modal-body'>" +
                        "<p></p>" +
                    "</div>";
        if(btns && btns.length > 0){
            html += "<div class='modal-footer'>";
            for (var i = 0; i < btns.length; i++) {
                var btn = btns[i];
                html += "<button class='btn btn-default kingui-btn-" + i + "'>" + btn.Name + "</button>";
            }
            html += "</div>";
        }	
        html += 	"</div>" +
            "</div>" +
            "</div>" +
        "</div>";
    //jq
    var jq = $(html);
    var jqBtnShow = jq.find('button:first');
    var jqTitle = jq.find('.modal-title:first');
    var jqBody = jq.find('.modal-body:first').children('p:first');
    var jqFooter = jq.find('.modal-footer:first');
    var jqBtnCancel = jq.find('.close:last');

    jqElement.append(jq);
    var _callparam = null;
    var newObj = {
        Show:function(obj){
            _callparam = obj.CallParams;
            jqTitle.html(obj.Title);
            jqBody.html(obj.Val);

            jqBtnShow.click();
        },
        Hide:function(){
            jqBtnCancel.click();
        },
    };

    if(btns){
        $.each(btns, function(i, btn) {
            var str = '.kingui-btn-' + i;
            jqFooter.find(str).click(function(event) {
                if(btn.Callback){
                    btn.Callback.bind(newObj)(_callparam);
                }else{
                    newObj.Hide();
                }
            });	
        });
    }
    return newObj;
};

ui.NewInputMsg = ui.NewInputMsg || function(initObj){
    var jqElement = initObj.Element || $("body");
    var id = initObj.Id || "0";
    var btns = initObj.Btns;


    var id = "kingui-inputmsg-" + id;
    var idVal = id + "-val";
    var html = "<div>" + 
            "<button class='btn btn-default' data-toggle='modal' data-target='#" + id + "' style='display: none;'></button>" +
            "<div id='" + id + "' class='modal fade' role='dialog'>" +
            "<div class='modal-dialog'>" +
                "<div class='modal-content'>" +
                    "<div class='modal-header'>" +
                    "<button class='close' data-dismiss='modal'>&times;</button>" +
                    "<h4 class='modal-title'></h4>" +
                    "</div>" +

                    "<div class='modal-body'>" +
                        "<p>" +
                            "<input type='text' class='form-control' id='" + idVal + "'>" +
                        "</p>" +
                    "</div>";
        if(btns && btns.length > 0){
            html += "<div class='modal-footer'>";
            for (var i = 0; i < btns.length; i++) {
                var btn = btns[i];
                html += "<button class='btn btn-default kingui-btn-" + i + "'>" + btn.Name + "</button>";
            }
            html += "</div>";
        }	
        html += 	"</div>" +
            "</div>" +
            "</div>" +
        "</div>";
    //jq
    var jq = $(html);
    var jqBtnShow = jq.find('button:first');
    var jqTitle = jq.find('.modal-title:first');
    
    var jqVal = jq.find('#' + idVal);

    var jqFooter = jq.find('.modal-footer:first');
    var jqBtnCancel = jq.find('.close:last');

    jqElement.append(jq);
    var _callparam;
    var newObj = {
        Show:function(obj){
            _callparam = obj.CallParams;
            
            jqTitle.html(obj.Title);

            jqVal.val(obj.Val);

            jqBtnShow.click();
            setTimeout(function(){
                jqVal.select();
            },500);
        },
        Hide:function(){
            jqBtnCancel.click();
        },
        GetVal:function(){
            return jqVal.val();
        },
    };

    if(btns){
        $.each(btns, function(i, btn) {
            var str = '.kingui-btn-' + i;
            jqFooter.find(str).click(function(event) {
                if(btn.Callback){
                    btn.Callback.bind(newObj)(_callparam);
                }else{
                    newObj.Hide();
                }
            });	
        });
    }
    return newObj;
};
ui.NewInputMsg2 = ui.NewInputMsg2 || function(initObj){
    var jqElement = initObj.Element || $("body");
    var id = initObj.Id || "0";
    var btns = initObj.Btns;


    var id = "kingui-inputmsg2-" + id;
    var idVal = id + "-val";
    var idValRead = id + "-val-read";
    var html = "<div>" + 
            "<button class='btn btn-default' data-toggle='modal' data-target='#" + id + "' style='display: none;'></button>" +
            "<div id='" + id + "' class='modal fade' role='dialog'>" +
            "<div class='modal-dialog'>" +
                "<div class='modal-content'>" +
                    "<div class='modal-header'>" +
                    "<button class='close' data-dismiss='modal'>&times;</button>" +
                    "<h4 class='modal-title'></h4>" +
                    "</div>" +

                    "<div class='modal-body'>" +
                        "<p><div class='input-group'>" +
                            "<span class='input-group-addon' id='" + idValRead + "'></span>" +
                            "<input type='text' class='form-control' id='" + idVal + "'>" +
                        "</div></p>" +
                    "</div>";
        if(btns && btns.length > 0){
            html += "<div class='modal-footer'>";
            for (var i = 0; i < btns.length; i++) {
                var btn = btns[i];
                html += "<button class='btn btn-default kingui-btn-" + i + "'>" + btn.Name + "</button>";
            }
            html += "</div>";
        }	
        html += 	"</div>" +
            "</div>" +
            "</div>" +
        "</div>";
    //jq
    var jq = $(html);
    var jqBtnShow = jq.find('button:first');
    var jqTitle = jq.find('.modal-title:first');
    
    var jqVal = jq.find('#' + idVal);
    var jqValRead = jq.find('#' + idValRead);

    var jqFooter = jq.find('.modal-footer:first');
    var jqBtnCancel = jq.find('.close:last');

    jqElement.append(jq);
    var _callparam;
    var newObj = {
        Show:function(obj){
            _callparam = obj.CallParams;
            
            jqTitle.html(obj.Title);
            
            var val = obj.Val;
            var n = obj.Read;
            jqValRead.text(val.substring(0,n));
            jqVal.val(val.substring(n));

            jqBtnShow.click();
            setTimeout(function(){
                jqVal.select();
            },500);
        },
        Hide:function(){
            jqBtnCancel.click();
        },
        GetVal:function(){
            return {
                Read:jqValRead.text(),
                Write:jqVal.val(),
            };
        },
    };

    if(btns){
        $.each(btns, function(i, btn) {
            var str = '.kingui-btn-' + i;
            jqFooter.find(str).click(function(event) {
                if(btn.Callback){
                    btn.Callback.bind(newObj)(_callparam);
                }else{
                    newObj.Hide();
                }
            });	
        });
    }
    return newObj;
};

})(this);