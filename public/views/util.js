//全局輔助 函數 常量 定義
(function(ctx){
	/***	常量定義	***/
	ctx.CODE_OK = ctx.CODE_OK || 0;


	/***	函數定義	***/
	//驗證 用戶名 是否符合規範
	//4~12個英文字符數字-_.且必須以英文字符開始
	ctx.MatchUser = ctx.MatchUser || function(str){
		if(typeof(str) != "string"){
			return false;
		}
		return /^[a-zA-Z]([0-9a-zA-Z\-_\.]){3,11}$/.test(str);
	};

	//必須是6~30個字符
	ctx.MatchEmail = ctx.MatchEmail || function(str){
		if(typeof(str) != "string"){
			return false;
		}
		if(str.length < 6 || str.length > 30){
			return false;
		}
		return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(str);
	};

	//密碼至少要8個字符
	ctx.MatchPwd = ctx.MatchPwd || function(str){
		if(typeof(str) != "string"){
			return false;
		}
		return str.length > 7;
	};

})(this);