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
	namespace.NewSourceList = namespace.NewSourceList || function (obj) {
		var newObj;
		//const 種族
		var SourceFolder = 0;
		var SourceImg = 1;
		var SourceVideo = 2;
		var SourceBinary = 3;

		//組件唯一標記
		var _id = obj.Id || "_0_";

		//保存 初始參數
		var _callback;
		var _jq = $(obj.Selector);
	    
		$.contextMenu({
			selector: obj.Selector, 
			callback: function(key, options) {
				if(_callback){
					_callback(key);
					return;
				}
				if(!obj.Callback){
					return;
				}
				_callback = obj.Callback.bind(newObj)
				_callback(key);
			},
			items: obj.Btns
		});
		var _jqHeader = _jq.find(".my-list-header:first");
		_jqHeader.on('contextmenu', function (event) {
			return false;
		});


		//是否使用 升序
		var _asc = true;

		//元素 數組
		var _items = [];
		//shift 選擇
		var _shift = -1;

		//排序 比較函數
		var compare = function (l, r) {
			if (l.Style != r.Style) {
				return l.Style < r.Style;
			}

			if (_asc) {
				return l.Name <= r.Name;
			}

			return l.Name >= r.Name;
		};
		//返回 類型 圖標
		var getStyleClass = function (style) {
			switch (style) {
			case SourceFolder:
				return "glyphicon glyphicon-folder-close";
			case SourceImg:
				return "glyphicon glyphicon-picture";
			case SourceVideo:
				return "glyphicon glyphicon-film";
			case SourceBinary:
				return "glyphicon glyphicon-file";
			}
			return "glyphicon glyphicon-alert"
		};
		//選擇 項目
		var selectNormal = function (pos) {
			_shift = pos;

			for (var i = 0; i < _items.length; ++i) {
				if (i == pos) {
					_items[i].Check = true;
				} else {
					_items[i].Check = false;
				}
			}

			_jq.find(".my-list-item").each(function (i, ctx) {
				var jq = $(ctx);
				if (i == pos) {
					jq.addClass('success');
				} else {
					jq.removeClass('success');
				}
			});
		};
		var selectItem = function (pos) {
			for (var i = 0; i < _items.length; ++i) {
				if (_items[i].Check) {
					return;
				}
			}

			if (_shift == -1) {
				_shift = pos;
			}

			var item = _items[pos];

			var jq = _jq.find("#idMyList" + _id + item.Id);
			if (!item.Check) {
				item.Check = true;
				jq.addClass('success');
			}
		};
		var selectCtrl = function (pos) {
			if (_shift == -1) {
				_shift = pos;
			}

			var item = _items[pos];

			var jq = _jq.find("#idMyList" + _id + item.Id);
			if (item.Check) {
				item.Check = false;
				jq.removeClass('success');
			} else {
				item.Check = true;
				jq.addClass('success');
			}
		};
		var selectShift = function (pos) {
			if (_shift == -1) {
				selectNormal(pos);
				return;
			}

			var min = 0;
			var max = 0;
			if(_shift < pos){
				min = _shift;
				max = pos;
			}else{
				min = pos;
				max = _shift;
			}

			for (var i = 0; i < _items.length; ++i) {
				if (i <= max && i >= min) {
					_items[i].Check = true;
				} else {
					_items[i].Check = false;
				}
			}

			_jq.find(".my-list-item").each(function (i, ctx) {
				var jq = $(ctx);
				if (i <= max && i >= min) {
					jq.addClass('success');
				} else {
					jq.removeClass('success');
				}
			});
		};
		//爲項目 綁定 事件
		var bindItemEvent = function (jq, item) {
			jq.on('contextmenu', function (event) {

				var ok = false;
				for (var i = 0; i < _items.length; ++i) {
					if (_items[i].Check) {
						ok = true;
						break;
					}
				}
				if (!ok) {
					console.log("no item select");
					return false;
				}

				//顯示 菜單
				return true;
			}).on('dblclick', function () {
				//進入 目錄
				console.log("dc");
			}).on('mousedown', function (event) {
				var find = -1;
				for (var i = 0; i < _items.length; ++i) {
					if (item.Id == _items[i].Id) {
						find = i;
						break;
					}
				}
				if (find == -1) {
					console.error("item not found");
					return;
				}

				if (event.ctrlKey) {
					selectCtrl(find);
				} else if (event.shiftKey) {
					selectShift(find);
				} else {
					if(event.button == 2){
						selectItem(find);
					}else{
						selectNormal(find);
					}
				}
			});
		};
		//插入視圖
		var insertViewItem = function (jq, item) {
			var html = "<tr id='idMyList" + _id + item.Id + "' class='my-list-item'><td>" +
				"<span class='" + getStyleClass(item.Style) + "'></span> <span class='my-list-item-name'>" + item.Name + "</span></td><td class='my-list-col-create'>" +
				item.Create + "</td><td class='my-list-col-size'>" +
				item.Size + "</td></tr>";
			var newJq = $(html);

			jq.after(newJq);

			//綁定 事件
			bindItemEvent(newJq, item);
		};
		//插入節點
		var insert = function (item) {
			var arrs = _items;

			//新增 節點
			arrs.push(item);

			//排序
			var i = arrs.length - 1; // 插入 i 之後
			for (; i > 0; --i) {
				var node = arrs[i - 1];
				if (compare(node, item)) {
					break;
				} else {
					//swap
					arrs[i - 1] = item;
					arrs[i] = node;
				}
			}

			//插入 視圖
			var jq = null;
			if (i == 0) {
				//插入 最前
				jq = _jqHeader;
			} else {
				//插入 指定 節點 之後
				jq = _jq.find("#idMyList" + _id + arrs[i - 1].Id);
			}
			insertViewItem(jq, item);
		};

		//排序節點
		var sort = function(asc,init){
			_asc = asc;

			if(!init){
				_jq.find(".my-list-item").remove();
			}
			_items.sort(function(l,r){
				return !compare(l,r);
			});

			var arrs = [];
			for(var i=0;i<_items.length;++i){
				var item = _items[i];
				if(item.Check){
					arrs.push("<tr id='idMyList" + _id + item.Id + "' class='my-list-item success'><td>" +
					"<span class='" + getStyleClass(item.Style) + "'></span> <span class='my-list-item-name'>" + item.Name + "</span></td><td class='my-list-col-create'>" +
					item.Create + "</td><td class='my-list-col-size'>" +
					item.Size + "</td></tr>");
				}else{
					arrs.push("<tr id='idMyList" + _id + item.Id + "' class='my-list-item'><td>" +
					"<span class='" + getStyleClass(item.Style) + "'></span> <span class='my-list-item-name'>" + item.Name + "<span></td><td class='my-list-col-create'>" +
					item.Create + "</td><td class='my-list-col-size'>" +
					item.Size + "</td></tr>");
				}
			}
			var html = arrs.join("");
			var jq = $(html);

			_jqHeader.after(jq);
			//綁定 事件
			_jq.find(".my-list-item").each(function(i,obj){
				bindItemEvent($(obj), _items[i]);
			});
		};

		//刪除節點
		var removeItem = function(id){
			for(var i=0;i<_items.length;++i){
				if(_items[i].Id == id){
					_items.splice(i,1);
					return true;
				}
			}
			return false;
		};
		var remove = function(obj){
			if(!obj){
				return;
			}
			var id = obj;
			if(obj instanceof Object){
				id = obj.Id;
			}

			removeItem(id);
			$("#idMyList"  + _id + id).remove();
		};
		var removeArray = function(items){
			var selecter = null;
			for(var i=0;i<items.length;++i){
				var obj = items[i];
				var id = obj;
				if(obj instanceof Object){
					id = obj.Id;
				}
				removeItem(id);

				if(!selecter){
					selecter = "#idMyList" + _id + id;
				}else{
					selecter += ",#idMyList" + _id + id;
				}
			}
	        
			if(selecter){
				_jq.find(selecter).remove();
			}
		};
		//改名
		var rename = function(obj){
			if(!obj){
				return;
			}
			var id = obj.Id;
			var name = obj.Name;
	        
			for(var i=0;i<_items.length;++i){
				if(_items[i].Id == id){
					_items[i].Name = name;
					_jq.find("#idMyList"  + _id + id).find(".my-list-item-name:first").text(name);
					return;
				}
			}
		};
		newObj = {
			//初始化節點
			Init:function(items){
				if (items instanceof Array) {
					for (var i = 0; i < items.length; ++i) {
						_items.push(items[i]);
					}
					sort(_asc,true);
				} else {
					insert(items);
				}
				return this;
			},
			//插入節點
			Insert: function (items) {
				if (items instanceof Array) {
					for (var i = 0; i < items.length; ++i) {
						insert(items[i]);
					}
				} else {
					insert(items);
				}
				return this;
			},
			//排序
			Sort:function(asc){
				if(asc == undefined){
					//返回當前排序方式
					return _asc;
				}

				if(asc){
					//升序
					if(_asc){
						return;
					}
					sort(true);
				}else{
					//降序
					if(!_asc){
						return;
					}
					sort(false);
				}
				return this;
			},
			//切換排序方式 並返回當前排序模式
			SortToggle:function(){
				sort(!_asc);
				return _asc;
			},
			//返回選中的節點
			GetSelects:function(){
				var arrs = null;

				for(var i=0;i<_items.length;++i){
					if(!_items[i].Check){
						continue;
					}
					if(arrs == null){
						arrs = [];
					}

					arrs.push(_items[i]);
				}

				return arrs;
			},
			//刪除節點
			Remove:function(items){
				if(items instanceof Array){
					if(items.length == 0){
						return;
					}else if(items.length == 1){
						remove(items[0]);
					}else{
						removeArray(items);
					}
				}else{
					remove(items);
				}
				return this;
			},
			//改名
			Rename:function(items){
				if(items instanceof Array){
					for(var i=0;i<items.length;++i){
						rename(items[i]);
					}
				}else{
					rename(items);
				}
				return this;
			}
		};
		return newObj;
	};
})(this);