function NewPageContent(params){
	"use strict";
	/***	初始化 參數	***/
	params = params || {};
	var lange = params.lange || {};
	var emsg = params.emsg;

	/***	頁面ui	***/
	//自定義 ui
	var uis = [];
	var newUiInput = function(obj){
		/***	緩存 jquery 元素	***/
		var jqView = obj.jqView;
		var jqVal = obj.jqVal;
		var match = obj.Match;
		var noTrim = obj.NoTrim;


		var popover = kui.NewPopover({
			"Target":jqView,
			"Title":obj.Title,
			"Content":obj.Content,
			"Arrow":"bottom",
		});
		var hideAllPopover = function(){
			for (var i = 0; i < uis.length; i++) {
				uis[i].HidePopover();
			}
		};
		var showPopover = function(){
			hideAllPopover();

			var jq = jqView;
			var pos = jq.offset();
			var size = popover.Size()
			var h = -size.H;
			h += jq.height() * 2 / 3 -  22
			
			popover.Offset({
				Top:h + "px",
				Left:"10%;",
			});

			popover.Show();
		};
		/***	綁定事件	***/
		jqVal.focusin(function(){
			//showPopover();
		});
		jqVal.focusout(function(){
			popover.Hide();
		});

		var getVal = function(){
			//返回數據
			var val = jqVal.val();
			if(!noTrim){
				val = $.trim(val);
			}

			//驗證 格式
			if(!match(val)){
				showPopover();
				return;
			}

			jqVal.val(val);
			return val;
		};
		return {
			HidePopover:function(){
				popover.Hide();
			},
			GetVal:function(){
				return getVal();
			},
			Focus:function(){
				jqVal.select();
				jqVal.focus();
			},
		};
	};
	//創建ui
	var uiName = newUiInput({
		"jqView":$("#idViewName"),
		"jqVal":$("#idValName"),
		"Title":lange["name"],
		"Content":lange["nameAsk"],
		"Match":function(val){
			if(MatchUser(val)){
				return true;
			}
			return MatchEmail(val);
		},
	});
	uis.push(uiName);

	var jqValPwd = $("#idValPwd");
	var uiPwd = newUiInput({
		"jqView":$("#idViewPwd"),
		"jqVal":jqValPwd,
		"Title":lange["pwd"],
		"Content":lange["pwdAsk"],
		"Match":MatchPwd,
	});
	uis.push(uiPwd);

	/***	綁定事件	***/
	$("form").submit(function(){
		//name
		var ui = uiName;
		var name = ui.GetVal();
		if(!name){
			ui.Focus();
			return false;
		}

		//pwd
		ui = uiPwd;
		var pwd = ui.GetVal();
		if(!pwd){
			ui.Focus();
			return false;
		}

		if(pwd.length != 128){
			pwd = CryptoJS.SHA512(pwd).toString();
		}
		jqValPwd.val(pwd);
		return true;
	});
	
	/***	錯誤處理	***/
	if(emsg){
		$( "#dialog-message" ).dialog({
			modal: true,
			position: { my: "top", at: "top-30", of: "#idViewName" },
			buttons:[
				{
					text:lange["Sure"],
					click: function() {
						$( this ).dialog( "close" );	
					}
				},
			],
			close: function( event, ui ) {
				uiPwd.Focus();
			},
		});
	}else{
		uiName.Focus();
	}
}