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

	//
	var _list = null;

	//新建檔案夾
	(function () {
		var msgFolder = kui.NewInputMsg({
			Id: msgId++,
			Btns: [
				{
					Name: Lange["Sure"],
					Callback: function () {
						this.Hide();

						if (waitAction) {
							return;
						}

						var val = this.GetVal();
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

					},
				},
				{
					Name: Lange["Cancel"],
				},
			]
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

	//檔案 列表視圖
	(function(){
		var list = my.NewSourceList({
			Selector:"#idViewList",
			Lange:Lange,
			Btns:{
				"Rename": {name: Lange["Rename"], icon: "edit"},
				"RenameNumber": {name: Lange["RenameNumber"], icon: "edit"},
				"RenameAZ": {name: Lange["RenameAZ"], icon: "edit"},
				"sep0": "---------",
				"Move": {name: Lange["Move"], icon: "cut"},
				"sep1": "---------",
				"Remove": {name: Lange["Remove"], icon: "quit"},
			},
			Callback:function(key){
				//返回選中節點
				var items = this.GetSelects();
				if(!items){
					return;
				}

				if(key == "Rename"){
					for(var i=0;i<items.length;++i){
						items[i].Name = "N_" + items[i].Name; 
					}
					this.Rename(items);
				}else if(key == "RenameNumber"){
					for(var i=0;i<items.length;++i){
						items[i].Name = "09_" + items[i].Name; 
					}
					this.Rename(items);
				}else if(key == "RenameAZ"){
					for(var i=0;i<items.length;++i){
						items[i].Name = "AZ_" + items[i].Name; 
					}
					this.Rename(items);
				}else if(key == "Move"){
					alert("Move")
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
							console.error(result.Emsg);
						}else{
							ctx.Remove(items);
						}
					})
					.fail(function(e) {
						console.error("net error");
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
			OnFileOk:function(pid/*父目錄id*/,id/*檔案 唯一標識*/,name/*檔案名稱*/,size/*檔案大小*/){
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
	//更新 上傳 位置
	//_uploader.SetPid(100);
	
	//爲手機 創建工具欄
	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) { 
		alert("phone");
	}
}