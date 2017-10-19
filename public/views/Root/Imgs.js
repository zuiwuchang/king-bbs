function NewPageContent(params) {
	"use strict";
	/***	import	***/
	var strings = king.strings;

	/***	初始化 參數	***/
	params = params || {};
	var Lange = params.Lange || {};
	//當前檔案夾 位置
	var Id = params.Id;

	//等待操作完成
	var waitAction = false;

	//返回當前時間
	var getNowString = function(){
		return strings.FormatDate(new Date(),"yyyy-MM-dd hh:mm:ss");
	};
	var getFmtDate = function(d){
		return strings.FormatDate(new Date(d),"yyyy-MM-dd hh:mm:ss");
	};
	//返回 大小 可讀 字符串
	var getSizeString = function(size){
		var KB = 1024;
		var MB = 1024 * 1024;
		var GB = 1024 * 1024 * 1024;

		if(size == 0){
			return "-"
		}
		if (size >= GB) {
			var gb = parseInt(size / GB);
			var mod = parseInt(parseFloat(size%GB) / GB * 100)
			if (mod > 0) {
				if(mod < 10){
					mod = "0" + mod;
				}
				return gb + "." + mod + " gb";
			}
			return gb + " gb";
		} else if (size >= MB) {
			var mb = parseInt(size / MB);
			var mod = parseInt(parseFloat(size%MB) / MB * 100);
			if (mod > 0) {
				if(mod < 10){
					mod = "0" + mod;
				}
				return mb + "." + mod + " mb";
			}
			return mb + " mb";
		} else if (size >= KB) {
			var kb = parseInt(size / KB);
			var mod = parseInt(parseFloat(size%KB) / KB * 100);
			if(mod > 0){
				if(mod < 10){
					mod = "0" + mod;
				}
				return kb + "." + mod + " kb";
			}
			return kb + " kb";
		}
		
		return size + " b";
	};

	var msgId = 0;
	//消息對話框
	var msgBox = kui.NewMsg({
		Id: msgId++,
	});

	//打開 項目
	var OpenItems = function(items){
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			window.open("/Root/Preview/Imgs/" + item.Id);
		}
	};
	
	//新建檔案夾
	(function () {
		var onFolderSure = function(ctx){
			ctx.Hide();

			if (waitAction) {
				return;
			}

			var val = ctx.GetVal();
			val = $.trim(val)
			if (!val) {
				//alert("need name")
				return;
			}

			waitAction = true;
			var pid = Id;
			$.ajax({
				url: '/Root/NewImgsFolder',
				type: 'POST',
				dataType: 'json',
				data: { pid: pid, name: val },
			}).done(function (result) {
				if (result.Code) {
					//失敗
					msgBox.Show({
						Title: Lange["e.title"],
						Val: strings.HtmlEncode(result.Emsg),
					});
				} else {
					if(Id == pid){
						_list.Insert({
							Id:result.Val,
							Style:0,
							Size:"-",
							Name:val,
							Create:getNowString(),
							Status:1,
						});
						//alert("yes")
					}
				}
			}).fail(function (e) {
				if(500 == e.status){
					msgBox.Show({
						Title: Lange["e.title"],
						Val: strings.HtmlEncode(e.responseJSON.description),
					});
				}else{
					msgBox.Show({
						Title: Lange["e.title"],
						Val: Lange["e.net"],
					});
				}
			}).always(function () {
				waitAction = false;
			});
		};
		var msgFolder = kui.NewInputMsg({
			Id: msgId++,
			Btns: [
				{
					Name: Lange["Sure"],
					Callback: function () {
						onFolderSure(this);
					},
				},
				{
					Name: Lange["Cancel"],
				},
			]
		});
		msgFolder.Jq().keydown(function(e) {
			if(e.keyCode != 13){
				return;
			}
			onFolderSure(msgFolder);
		});
		$("#idANewFolder").click(function () {
			if (waitAction) {
				return;
			}

			msgFolder.Show({
				Title: Lange["NewFloder"],
				Val: Lange["NewFloderName"],
			});
		});
	})();

	//更新 當前 路徑
	var UpdateId = function(id,popstate){
		if (waitAction) {
			return;
		}
		var ctx = _pathList;
		waitAction = true;
		$.ajax({
			url: '/Root/FindImgs',
			type: 'POST',
			dataType: 'json',
			data: {id: id},
		})
		.done(function(result) {
			if (result.Code) {
				//失敗
				msgBox.Show({
					Title: Lange["e.title"],
					Val: strings.HtmlEncode(result.Emsg),
				});
			} else {
				//更新當前位置
				if(Id != id){
					if(!window.history.state && window.history.state != 0){
						window.history.replaceState(Id, null, "/Root/Imgs/" + Id);
					}
					Id = id;
					ctx.Init(result.Paths);

					//更新 上傳 位置
					_uploader.SetPid(id);

					//更新地址
					if(!popstate){
						window.history.pushState(Id, null, "/Root/Imgs/" + Id);
					}
				}
				//更新列表 或刷新列表
				var items = result.Childs;
				if(items){
					for (var i = 0; i < items.length; i++) {
						items[i].Size = getSizeString(items[i].Size);
						items[i].Create = getFmtDate(items[i].Create);
					}
				}
				_list.Init(items);
			}
		})
		.fail(function(e) {
			if(500 == e.status){
				msgBox.Show({
					Title: Lange["e.title"],
					Val: strings.HtmlEncode(e.responseJSON.description),
				});
			}else{
				msgBox.Show({
					Title: Lange["e.title"],
					Val: Lange["e.net"],
				});
			}
		})
		.always(function() {
			waitAction = false;
		});
	};

	window.addEventListener("popstate", function(e) {
		//state 爲 pushState 傳入的 第一個參數
		var id = e.state;
		if(!window.history.state && window.history.state != 0){
			return
		}

		//更新 ajax 內容
		UpdateId(id,true);
	});
	
	//目錄樹
	var _tree = null;
	(function(){
		var requestMove = function(folder/*轉到的檔案夾 id*/,obj){
			if(waitAction){
				return;
			}
			waitAction = true;
			//obj.Id 原檔案夾
			//obj.Items 要移動的檔案
			//alert(obj.Items.join(","));
			$.ajax({
				url: '/Root/ImgsMoveTo',
				type: 'POST',
				dataType: 'json',
				data: {
					folder:folder,
					files:obj.Items.join(","),
				},
			})
			.done(function(result) {
				if(result.Code){
					msgBox.Show({
						Title: Lange["e.title"],
						Val: strings.HtmlEncode(result.Emsg),
					});
				}else{
					if(obj.Id == Id){
						//刪除 節點
						_list.Remove(obj.Items);
					}
				}
			})
			.fail(function(e) {
				if(500 == e.status){
					msgBox.Show({
						Title: Lange["e.title"],
						Val: strings.HtmlEncode(e.responseJSON.description),
					});
				}else{
					msgBox.Show({
						Title: Lange["e.title"],
						Val: Lange["e.net"],
					});
				}
			})
			.always(function() {
				waitAction = false;
			});
		};
		_tree = my.NewPathTree({
			Lange:Lange,
			Btns:[
				{
					Name: Lange["Sure"],
					Callback: function (obj) {
						this.Hide();

						var folder = this.GetVal();

						if(folder == null || folder != obj.Id){
							return;
						}
						requestMove(folder,obj);
					},
				},
				{
					Name: Lange["Cancel"],
				},
			]			
		});
	})();

	//路徑
	var _pathList;
	(function(){
		_pathList = my.NewPathList({
			Jq:$("#idPathList"),
			Items:params.Paths,
			Callback:function(id){
				UpdateId(id);
			},
		});
	})();

	//檔案 列表視圖
	var _list = null;
	(function(){
		var getFmtNumberStr = function(n,i){
			var max = (n - 1).toString();
			i = i.toString();
			while(i.length < max.length){
				i = "0" + i;
			}
			return i;
		};
		var onNameSure = function(ctx){
			ctx.Hide();

			if (waitAction) {
				return;
			}

			var val = ctx.GetVal();
			val = $.trim(val)
			if (!val) {
				//alert("need name")
				return;
			}
			var params = ctx.CallParams();
			var items = params.Items;
			if(items.length == 1){
				items[0].Name = val;
			}else{
				if(params.Style == 0){
					for (var i = 0; i < items.length; i++) {
						items[i].Name = val;
					}
				}else /*if(params.Style == 1)*/{
					var x = 0;
					for (var i = 0; i < items.length; i++) {
						items[i].Name = val + getFmtNumberStr(items.length,x);
						++x;
					}
				}
			}

			waitAction = true;
			var pid = Id;
			$.ajax({
				url: '/Root/RenameImgs',
				type: 'POST',
				dataType: 'json',
				data: { str: JSON.stringify(items)},
			}).done(function (result) {
				if (result.Code) {
					//失敗
					msgBox.Show({
						Title: Lange["e.title"],
						Val: strings.HtmlEncode(result.Emsg),
					});
				} else {
					if(Id == pid){
						_list.Rename(items)
					}
				}
			}).fail(function (e) {
				if(500 == e.status){
					msgBox.Show({
						Title: Lange["e.title"],
						Val: strings.HtmlEncode(e.responseJSON.description),
					});
				}else{
					msgBox.Show({
						Title: Lange["e.title"],
						Val: Lange["e.net"],
					});
				}
			}).always(function () {
				waitAction = false;
			});
		};
		var msgName = kui.NewInputMsg({
			Id: msgId++,
			Btns: [
				{
					Name: Lange["Sure"],
					Callback: function () {
						onNameSure(this);
					},
				},
				{
					Name: Lange["Cancel"],
				},
			]
		});
		msgName.Jq().keydown(function(e) {
			if(e.keyCode != 13){
				return;
			}
			onNameSure(msgName);
		});

		var list = my.NewSourceList({
			Selector:"#idViewList",
			Lange:Lange,
			Btns:{
				"Open": {name: Lange["Open"], icon: "add"},
				"sep0": "---------",
				"Rename": {name: Lange["Rename"], icon: "edit"},
				"RenameNumber": {name: Lange["RenameNumber"], icon: "edit"},
				"sep1": "---------",
				"Move": {name: Lange["Move"], icon: "cut"},
				"sep2": "---------",
				"Remove": {name: Lange["Remove"], icon: "quit"},
			},
			Callback:function(key){
				//返回選中節點
				var items = this.GetSelects();
				if(!items){
					return;
				}

				if(key == "Open"){
					var arrs = [];
					for (var i = 0; i < items.length; i++) {
						if(items[i].Style == 0){
							UpdateId(items[i].Id)
							return;
						}
						arrs.push(items[i]);
					}
					if(arrs.length < 0 ){
						return;
					}

					OpenItems(arrs);
				}else if(key == "Rename"){
					var name = items[0].Name;
					var arrs = [];
					for(var i=0;i<items.length;++i){
						arrs.push({
							Id:items[i].Id,
							Name:items[i].Name,
						});
					}
					msgName.Show({
						Title: Lange["Rename"],
						Val: name,
						CallParams:{
							Style:0,
							Items:arrs,
						},
					});
				}else if(key == "RenameNumber"){
					var name = items[0].Name;
					var arrs = [];
					for(var i=0;i<items.length;++i){
						arrs.push({
							Id:items[i].Id,
							Name:items[i].Name,
						});
					}
					msgName.Show({
						Title: Lange["RenameNumber"],
						Val: name,
						CallParams:{
							Style:1,
							Items:arrs,
						},
					});
				}else if(key == "Move"){
					var arrs = [];
					for(var i=0;i<items.length;++i){
						arrs.push(items[i].Id);
					}
					_tree.Show({
						CallParams:{
							Items:arrs,
							Id:Id,
						},
					});
				}else if(key == "Remove"){
					if(waitAction){
						return;
					}

					var ids = [];

					for(var i=0;i<items.length;++i){
						ids.push(items[i].Id)
					}

					var ctx = this;
					waitAction = true;
					$.ajax({
						url: '/Root/RemoveImgs',
						type: 'POST',
						dataType: 'json',
						data: {ids: ids.join(",")},
					})
					.done(function(result) {
						if(result.Code){
							//失敗
							msgBox.Show({
								Title: Lange["e.title"],
								Val: strings.HtmlEncode(result.Emsg),
							});
						}else{
							ctx.Remove(items);
						}
					})
					.fail(function(e) {
						if(500 == e.status){
							msgBox.Show({
								Title: Lange["e.title"],
								Val: strings.HtmlEncode(e.responseJSON.description),
							});
						}else{
							msgBox.Show({
								Title: Lange["e.title"],
								Val: Lange["e.net"],
							});
						}
					})
					.always(function() {
						waitAction = false;
					});
				}
			},
		});
		_list = list;
		//初始化 原始節點
		list.Init(params.Items);

		//排序按鈕
		var jqBtnView = $("#idViewBtnSort");
		$("#idBtnSort").click(function(){
			if(list.SortToggle()){
				jqBtnView.removeClass('glyphicon-arrow-up').addClass('glyphicon-arrow-down');
			}else{
				jqBtnView.removeClass('glyphicon-arrow-down').addClass('glyphicon-arrow-up');
			}
		});
	})();

	//檔案上傳
	var _uploader = null;
	(function(){
		//創建上傳 窗口
		var jq = $("#idDialogUpload");
		jq.dialog({
			autoOpen: false,
			closeOnEscape:true,
			closeText:Lange["Hide"],
			show: {
				effect: "bounce",
				duration: 1000
			},
			hide: {
				effect: "fade",
				duration: 500
			},
			width:400,
		});
		$("#idANewFile").on( "click", function() {
			jq.dialog( "open" );
		});

		//初始化上傳 組件
		var uploader = my.NewUpload({
			//拖放
			JqView:$("#idViewUpload"),
			Dnd:"#idDialogUpload",
			//服務器地址
			Server:"/Root/NewFileChunk",
			//同時允許最多上傳檔案 數量
			Works:3,

			//當前檔案夾
			Pid:Id,

			//檔案類型
			Style:1,

			//允許上傳的檔案 類型
			Accept: {
				title: 'Images',
				extensions: 'gif,jpg,jpeg,bmp,png',
				mimeTypes: 'image/*'
			},

			//檔案上傳成功
			OnFileOk:function(pid/*父目錄id*/,sid/*source id*/,id/*檔案 唯一標識*/,name/*檔案名稱*/,size/*檔案大小*/){
				if(pid != Id){
					return;
				}
				_list.Insert({
					Id:id,
					Style:1,
					Size:getSizeString(size),
					Name:name,
					Create:getNowString(),
					Status:1,
					Sid:sid,
				});
			},
		});
		_uploader = uploader;

		var inputFiles = $("#idInputFiles");
		inputFiles.on("change",function(e){
			//增加檔案 到上傳列表
			var files = this.files;
			for(var i=0;i<files.length;++i){
				uploader.Insert(files[i]);
			}
			//重置檔案選擇
			$(this).val(null);
		});
		$("#idBtnFiles").on("click",function(){
			inputFiles.click();
		});
		$("#idBtnUpload").on("click",function(){
			uploader.Upload();
		});
		$("#idBtnPause").on("click",function(){
			uploader.Pause();
		});
		$("#idBtnClear").on("click",function(){
			uploader.Clear();
		});

	})();
	
	
	//爲手機 創建工具欄
	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) { 
		//alert("phone");
	}
}