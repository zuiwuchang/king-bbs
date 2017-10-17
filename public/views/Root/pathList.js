(function (g) {
	"use strict";
	g.my = g.my || {};
	var namespace = g.my;
	/*
	item = {
		Id:int64,       //唯一標識
		Name:string,    //顯示名稱
		Style:int,      //種族
		Status:int,     //狀態
	};
	*/
	namespace.NewPathList = namespace.NewPathList || function (obj) {
		var newObj;
		var _jq = obj.Jq;
		var _items = null;
		var _callback = obj.Callback;
		var _getItemName = function(item){
			if(item.Id == 0){
				return "ROOT"
			}
			return item.Name;
		};
		var _init = function(items){
			_items = items;

			var html = "";
			for (var i = 0; i < items.length; i++) {
				var pos = items.length - 1 - i;
				var item = items[pos];
				item._pos = pos;
				html += "<li><a href='#" + pos + "'>" + _getItemName(item) + "</a></li>"
			}

			var jqItems = $(html);
			jqItems.find("a").click(function(){
				var pos = $(this).attr('href');
				pos = parseInt(pos.substring(1));
				var id = _items[pos].Id;
				if(_callback){
					_callback.bind(newObj)(id);
				}
				return false;
			});
			_jq.html(jqItems);
		};
		_init(obj.Items);


		newObj = {
			Init:function(items){
				_init(items);
			},
		};
		return newObj;
	};
})(this);