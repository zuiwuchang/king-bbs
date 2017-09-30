(function (g) {
    "use strict";
    g.my = g.my || {};
    var namespace = g.my;
    namespace.NewSourceList = namespace.NewSourceList || function (obj) {
        //const
        var SourceFolder = 0;
        var SourceImg = 1;
        var SourceVideo = 2;
        var SourceBinary = 3;

        //保存 初始參數
        var _jq = obj.Jq;

        //是否使用 升序
        var _asc = true;

        //元素 數組
        var _items = [];
        
        //排序 比較函數
        var compare = function (l, r) {
            if(l.Style != r.Style){
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
        //插入視圖
        var insertViewItem = function (jq, item) {
            var html = "<tr id='idMyList" + item.Id + "' class='my-list-item'><td>" +
                "<span class='" + getStyleClass(item.Style) + "'></span> " + item.Name + "</td><td>" +
                item.Create + "</td><td>" +
                item.Size + "</td></tr>";
            var newJq = $(html);

            jq.after(newJq);
           
            //綁定 事件
            newJq.click(function (event) {
                alert(1)
                /*
                if (event.ctrlKey) {
                    if (item.Check) {
                        item.Check = false;
                        newJq.removeClass('success');
                    }else{
                        item.Check = true;
                        newJq.addClass('success');
                    }
                } else if (event.shiftKey) {

                } else {
                    for (var i = 0; i < _files.length; ++i) {
                        if(_files[i].Id == item.Id){
                            _files[i].Check = true;
                        }else{
                            _files[i].Check = false;
                        }
                    }
                    for (var i = 0; i < _folders.length; ++i) {
                        if(_folders[i].Id == item.Id){
                            _folders[i].Check = true;
                        }else{
                            _folders[i].Check = false;
                        }
                    }
                    _jq.find(".my-list-item").each(function (i, ctx) {
                        var jq = $(ctx);
                        var id = jq.attr('id');
                        
                        if (id == "idMyList" + item.Id) {
                            jq.addClass('success');
                        } else {
                            jq.removeClass('success');
                        }
                    });
                }
                */
            });
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
                jq = _jq.find(".my-list-header:first");
            } else {
                //插入 指定 節點 之後
                jq = _jq.find("#idMyList" + arrs[i - 1].Id + ":first");
            }
            insertViewItem(jq, item);
        };

        return {
            //插入節點
            Insert: function (items) {
                if (items instanceof Array) {
                    for (var i = 0; i < items.length; ++i) {
                        insert(items[i]);
                    }
                } else {
                    insert(items);
                }
            },
        };
    };
})(this);