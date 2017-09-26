function NewPageContent(params){
	"use strict";
	/***	初始化 參數	***/
	params = params || {};
	var lange = params.lange || {};
	
	//新建檔案夾
	$("#idANewFolder").click(function(){
		$.ajax({
			url: '/Root/NewImgsFolder',
			type: 'POST',
			dataType: 'json',
			data: {pid: 0,name:"new folder"},
		})
		.done(function(result) {
			if(result.Code){
				//失敗
				alert("emsg : " + result.Emsg)
			}else{
				alert("yes")
			}
		})
		.fail(function() {
			alert("net error")
		});		
	});

}