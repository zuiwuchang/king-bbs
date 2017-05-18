(function(g){
"use strict";
g.kui = g.kui || {};
var kui = g.kui;

kui.NewPopover = kui.NewPopover || function(obj){
	var jqTarget = obj.Target || $("body");
	var title = obj.Title || "";
	var content = obj.Content || "";
	var arrow = obj.Arrow || "";

	var html = "<div class='kui-popover " + arrow + "'>" +
			"<div class='arrow'></div>" +
			"<div class='kui-popover-title'>" + title + "</div>" +
			"<div class='kui-popover-content'>" + content + "</div>" +
		"</div>";
	var jq = $(html);

	jqTarget.append(jq);
	return {
		Jquery:function(){
			return jq;
		},
		Show:function(speed,callback){
			jq.show(speed, callback);
		},
		Hide:function(speed,callback){
			jq.hide(speed,callback);
		},
		Size:function(){
			return {
				W:jq.width(),
				H:jq.height(),
			};
		},
		Offset:function(obj){
			var style = "left:" + obj.Left + ";" +
				"top:" + obj.Top + ";";
			if(jq.is(":visible")){
				style += "display: block;"
			}
			jq.attr('style', style);
			return this;
			
		},
		IsVisible:function(){
			return jq.is(":visible");
		},
	};
};
})(this);