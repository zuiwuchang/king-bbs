(function (g) {
	"use strict";
	g.my = g.my || {};
	var namespace = g.my;

	namespace.NewPathTree = namespace.NewPathTree || function (initObj) {
		var newObj;

		var jqElement = initObj.Element || $("body");
		var id = initObj.Id || "0";
		var btns = initObj.Btns;
		var Lange = initObj.Lange;

		var id = "kingui-tree-" + id;
		var html = "<div>" + 
			"<button class='btn btn-default' data-toggle='modal' data-target='#" + id + "' style='display: none;'></button>" +
			"<div id='" + id + "' class='modal fade' role='dialog'>" +
			"<div class='modal-dialog'>" +
				"<div class='modal-content'>" +
					"<div class='modal-header'>" +
					"<button class='close' data-dismiss='modal'>&times;</button>" +
					"<h4 class='modal-title'>" + Lange["MoveTo"] + "</h4>" +
					"</div>" +

					"<div class='modal-body'>" +
						"<p><img src='/public/img/throbber.gif'> <button class='btn btn-default' style='display:none;'>" + Lange["RefreshFolder"] + "</button><p>" + 
						"<p class='my-tree-e'></p>"
						"<p style='display:none'></p>" +
					"</div>";
		if(btns && btns.length > 0){
			html += "<div class='modal-footer'>";
			for (var i = 0; i < btns.length; i++) {
				var btn = btns[i];
				html += "<button class='btn btn-default kingui-btn-" + i + "'>" + btn.Name + "</button>";
			}
			html += "</div>";
		}	
		html +=	"</div>" +	//modal-dialog
			"</div>" +
			"</div>" +
		"</div>";

		//jq
		var jq = $(html);
		var jqBtnShow = jq.find('button:first');
		var jqBody = jq.find('.modal-body:first');
		var jqEmsg = jqBody.children('.my-tree-e:first');
		var jqStatus = jqBody.children('p:first');
		var jqWait = jqStatus.children('img:first');
		var jqRefresh = jqStatus.children('button:first');
		var jqView =  jqBody.children('p:last');

		var jqFooter = jq.find('.modal-footer:first');
		var jqBtnCancel = jq.find('.close:last');

		jqElement.append(jq);
		var _callparam = null;

		//是否已經 初始化
		var _tree = null;
		//是否正在 等待異步完成
		var _waitAjax = false;

		//創建 目錄樹
		var _refreshTree = function(items){
			jqView.jstree({
				plugins : [
					"conditionalselect",
					"sort",
				],
				checkbox : {
					three_state : false,	//對子項的選擇 不影響 祖先
				},
				core:{
					//允許 check_callback 否則一些api不能調用(這些api需要使用 此功能)
					//如 create_node 動態 創建 節點
					check_callback : true,
					//禁止多選
					multiple : false,
					//設置 初始 節點
					data:items,
				},
			}).on('ready.jstree', function (e, data) {
				var tree = $(this).jstree();

				jqWait.hide('fast');
				jqRefresh.show('fast');
				jqView.show('fast',function(){
					_tree = tree;
					_waitAjax = false;
				});
			}).on('select_node.jstree', function (e, data) {
				if(data.selected.length > 0){
					var tree = data.instance;
					var node = tree.get_node(data.selected[0]);
					if(!tree.is_leaf(node) && tree.is_closed(node)){
						tree.open_node(node);
					}
				}
			}).off("keydown");
		};
		var _updateError = function(emsg){
			jqWait.hide('fast');
			jqRefresh.show('fast');
			jqEmsg.show('fast').text(emsg);
			_waitAjax = false;
		};
		//向服務器 請求檔案樹
		var _requestRefresh = function(){
			_waitAjax = true;

			$.ajax({
				url: '/Root/FoldersImgs',
				type: 'GET',
				dataType: 'json',
			})
			.done(function(result) {
				if(result.Code){
					_updateError(result.Emsg);
				}else{
					var items = [
						{
							id:"0",
							parent:"#",
							text:"ROOT",
							state:{
								opened:true,
							},
						},
					];
					for (var i = 0; i < result.Folders.length; i++) {
						var node = result.Folders[i];
						items.push({
							id:node.Id,
							parent:node.Pid,
							text:node.Name,
						});
					}
					_refreshTree(items);
				}
			})
			.fail(function(e) {
				if(500 == e.status){
					_updateError(e.responseJSON.description);
				}else{
					_updateError(Lange["e.net"]);
				}
			});
		};
		//刷新頁面
		var _refresh = function() {
			if(_waitAjax){
				return;
			}

			//已經初始化過
			if(_tree){
				//銷毀過期節點
				_tree.destroy();
			}

			//切換 ui 顯示
			jqView.hide('fast');
			jqRefresh.hide('fast');
			jqEmsg.hide('fast');
			jqWait.show('fast',function(argument) {
				_requestRefresh();
			});
		};
		newObj = {
			GetVal:function(){
				if(!_tree){
					return null;
				}

				return _tree.get_top_selected();
			},
			Show:function(obj){
				//沒有初始化
				if(!_tree){
					_refresh();	//初始化
				}

				_callparam = obj.CallParams;

				jqBtnShow.click();
			},
			Hide:function(){
				jqBtnCancel.click();
			},
			Jq:function(){
				return jq;
			},
			CallParams:function(){
				return _callparam;
			},
		};
		jqRefresh.click(function(event) {
			_refresh();
		});
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