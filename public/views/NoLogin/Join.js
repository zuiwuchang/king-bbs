function NewPageContent(params){
	"use strict";
	/***	初始化 參數	***/
	params = params || {};
	var lange = params.lange || {};
	
	/***	頁面ui	***/
	//自定義 ui
	var uis = [];
	var newUiInput = function(obj){
		/***	緩存 jquery 元素	***/
		var jqView = obj.jqView;
		var jqVal = obj.jqVal;
		var jqFlag = obj.jqFlag;
		var url = obj.url;
		var valError = obj.valError;
		var valExists = obj.valExists;
		var match = obj.Match;
		var noTrim = obj.NoTrim;

		//存儲合法 值
		var _val = "";
		//存儲最後 驗證值
		var _last = "";

		//初始化 jquery ui
		jqFlag.tooltip();

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
			showPopover();
		});
		jqVal.focusout(function(){
			popover.Hide();

			//返回數據
			var val = jqVal.val();
			if(!noTrim){
				val = $.trim(val);
			}

			//如果 剛剛 驗證過 直接返回 避免重複驗證
			if(_last == val){
				return;
			}
			//更新最後 驗證值
			_last = val;

			//重置狀態
			jqFlag.removeClass('glyphicon-ok-sign');
			jqFlag.removeClass('glyphicon-remove-sign');
			jqFlag.removeClass('glyphicon-question-sign');
			jqFlag.attr('title','');

			//驗證 格式
			if(!match(val)){
				jqFlag.attr('title', valError);
				jqFlag.addClass('glyphicon-remove-sign');
				return;
			}

			//驗證 重複
			if(!url){
				jqFlag.addClass('glyphicon-ok-sign');
				//更新 合法值
				_val = val;
				return;
			}
			$.ajax({
				"url": url,
				"type": 'GET',
				"dataType": 'json',
				"data": {"val":val},
			})
			.done(function(rs) {
				if(!(rs instanceof Object)){
					jqFlag.attr('title', lange["errorNet"]);
					jqFlag.addClass('glyphicon-remove-sign');
					//未知錯誤 允許 繼續嘗試驗證 
					_last = "";
					return;
				}
				if(CODE_OK != rs.Code){
					jqFlag.attr('title', rs.Emsg);
					jqFlag.addClass('glyphicon-remove-sign');

					//錯誤 允許 繼續嘗試驗證 
					_last = "";
					return;
				}

				if(rs.Val){
					jqFlag.attr('title', valExists);
					jqFlag.addClass('glyphicon-remove-sign');
				}else{
					jqFlag.addClass('glyphicon-ok-sign');
					//更新 合法值
					_val = val;
				}
			})
			.fail(function() {
				jqFlag.attr('title', lange["errorNet"]);
				jqFlag.addClass('glyphicon-remove-sign');

				//網絡異常 允許 繼續嘗試驗證 
				_last = "";
			});
		});
		return {
			HidePopover:function(){
				popover.Hide();
			},
			GetVal:function(){
				return _val;
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
		"jqFlag":$("#idFlagName"),
		"Title":lange["name"],
		"Content":lange["nameAsk"],
		"url":"/NoLogin/CheckUser",
		"valError":lange["nameError"],
		"valExists":lange["nameExists"],
		"Match":MatchUser,
	});
	uis.push(uiName);
	var uiEmail = newUiInput({
		"jqView":$("#idViewEmail"),
		"jqVal":$("#idValEmail"),
		"jqFlag":$("#idFlagEmail"),
		"Title":lange["email"],
		"Content":lange["emailAsk"],
		"url":"/NoLogin/CheckEmail",
		"valError":lange["emailError"],
		"valExists":lange["emailExists"],
		"Match":MatchEmail,
	});
	uis.push(uiEmail);
	var uiPwd = newUiInput({
		"jqView":$("#idViewPwd"),
		"jqVal":$("#idValPwd"),
		"jqFlag":$("#idFlagPwd"),
		"Title":lange["pwd"],
		"Content":lange["pwdAsk"],
		"valError":lange["pwdError"],
		"Match":MatchPwd,
		"NoTrim":true,
	});
	uis.push(uiPwd);

	/***	綁定事件	***/
	var jqValPwdGo = $("#idValPwdGo")
	$("form").submit(function(){
		//name
		var ui = uiName;
		var name = ui.GetVal();
		if(!name){
			ui.Focus();
			return false;
		}

		//email
		ui = uiEmail;
		var email = ui.GetVal();
		if(!email){
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
		pwd = CryptoJS.SHA512(pwd).toString();
		jqValPwdGo.val(pwd);
		return true;
	});
}