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

	var msgId = 0;
	//消息對話框
	var msgBox = kui.NewMsg({
		Id: msgId++,
	});


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
						$.ajax({
							url: '/Root/NewImgsFolder',
							type: 'POST',
							dataType: 'json',
							data: { pid: Id, name: val },
						}).done(function (result) {
							if (result.Code) {
								//失敗
								msgBox.Show({
									Title: Lange["e.title"],
									Val: strings.HtmlEncode(result.Emsg),
								});
							} else {
								alert("yes")
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
					this.Remove(items);
				}
			},
		});
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

	//爲手機 創建工具欄
	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) { 
		alert("phone");
	}
}