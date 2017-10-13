//客製化的 baidu WebUploader 上傳組件
(function (g) {
	"use strict";
	g.my = g.my || {};
	var namespace = g.my;
	namespace.NewUpload = namespace.NewUpload || function (obj) {
		var newObj;

		//const
		var STATUS_HASH		= 0;	//正在計算hash
		var STATUS_NONE		= 1;	//已添加
		var STATUS_UPLOAD		= 2;	//等待上傳
		var STATUS_UPLOAD_BEGIN	= 3;	//開始上傳
		var STATUS_UPLOADING	= 4;	//上傳中
		var STATUS_OK		= 5;	//上傳完成
		var STATUS_PAUSE		= 6;	//暫停中
		var STATUS_ERROR		= 7;	//上傳錯誤
		var STATUS_REMOVE		= 100;	//已移除
		

		//保存 參數
		var _jqView = obj.JqView;
		var Works = obj.Works;
		var Server = obj.Server;
		var _pid = obj.Pid;
		var Style = obj.Style;

		//hook WebUploader
		WebUploader.Uploader.register(
			{
				'before-send-file':'beforeSendFile',
				'before-send':'beforeSend',
			},
			{
				beforeSendFile:function(file){
					//alert(file);
				},
				beforeSend: function(files) 
				{
					//console.log(files);
				}
			}
		);

		//初始化 WebUploader
		var _uploader = WebUploader.create({
			//強制使用 html5 上傳 不要使用 flash
			runtimeOrder:'html5',

			//檔案接收地址
			server: Server,

			//拖拽添加檔案
			dnd:obj.Dnd,
			disableGlobalDnd:true,

			//多線程上傳
			threads:true,

			//不創建檔案選擇按鈕
			//pick: '#idUploader',

			//不需要壓縮 jpeg 後再上傳
			resize: false,
		
			//上傳檔案類型
			accept:obj.Accept,

			//使用分片上傳
			chunked:true,
			//分片大小
			//chunkSize:1024 * 1024 * 5,
			chunkSize:1024 * 10,

			pick: '#picker'
		});

		//存儲所有 檔案
		var _items = {};

		//正在上傳 檔案數量
		var _work = 0;

		//初始話一個 上傳 任務
		var initUpload = function(item){
			//增加 工作記錄
			item.SetWork(true);


			//返回 md5
			var hash = item.Hash();
			//md5 上傳

			//服務器不存在檔案 上傳檔案
			item.StartUpload();
			
		};
		//請求啓動一個 上傳 任務
		var requestUpload = function(){
			//達到最大上傳 數 直接忽略函數調用
			if(_work >= Works){
				return;
			}

			//返回 所有 等待上傳的 檔案
			var files = _uploader.getFiles('interrupt','inited');
			for(var i=0;i<files.length;++i){
				var id = files[i].id;
				var item = _items[id];

				var status = item.Status();
				if(status == STATUS_UPLOAD){
					//開始上傳
					initUpload(item);
					return;
				}else if(status == STATUS_PAUSE){
					//恢復上傳
					item.SetUploading();

					//增加正在上傳 記錄
					item.SetWork(true);
					return;
				}
			}
		};

		//創建一個 內存節點
		var newItem = function(name,file,jq){
			var newObj = null;
			//cache jquery
			var jqStatus = jq.find(".glyphicon-refresh:first");
			var jqRemove = jq.find(".glyphicon-remove:first");
			var jqBar = jq.find(".progress-bar:first");

			//當前狀態
			var _status = STATUS_HASH;
			//檔案hash
			var _hash = "";
			var pid = _pid;

			//設置節點 工作狀態
			var _run = false;
			var setWork = function(run){
				if(run){
					//開啓工作
					if(!_run){
						_run = true;
						++_work
					}
				}else{
					//停止工作
					if(_run){
						_run = false;
						--_work;
					}
				}
			}

			//bind
			jqStatus.on("click",function(){
				switch(_status){
				case STATUS_NONE://設置狀態到 等待上傳
					//更新圖標
					jqStatus.attr("class","my-btn glyphicon glyphicon-ban-circle");
					//更新狀態
					_status = STATUS_UPLOAD;

					//請求一個上傳任務
					requestUpload();
					break;
				case STATUS_UPLOAD://重置狀態
					//更新圖標
					jqStatus.attr("class","my-btn glyphicon glyphicon-upload");
					//更新狀態
					_status = STATUS_NONE;
					break;
				case STATUS_UPLOADING://暫停上傳
					break;
				case STATUS_PAUSE: //繼續上傳
					break;
				}
			});
			jqRemove.on("click",function(){
				//從 索引中 移除
				delete _items[file.id];

				//從上傳組件中移除
				_uploader.stop(file);//暫停已經在上傳的檔案
				_uploader.removeFile(file,true);
				setWork(false);

				//從界面移除
				jq.remove();
			});

			//返回 節點 接口
			newObj = {
				//返回 檔案
				File:function(){
					return file;
				},
				//返回當前 狀態
				Status:function(){
					return _status;
				},
				//設置 正在上傳
				SetUploading:function(){
					jqStatus.attr("class","my-btn glyphicon glyphicon-ban-circle");
					_status = STATUS_UPLOADING;
				},
				//開始上傳檔案
				StartUpload:function(){
					//更新狀態
					jqStatus.attr("class","my-btn glyphicon glyphicon-ban-circle");
					_status = STATUS_UPLOAD_BEGIN;

					//向服務器 請求創建一個檔案
					$.ajax({
						url: '/Root/CreateNewFile',
						type: 'POST',
						dataType: 'json',
						data: {
							//檔案 hash
							hash: _hash,
							//檔案名稱
							name:name,
							//檔案類別
							style:Style,
							//父目錄id
							pid:pid,
						},
					})
					.done(function() {
						console.log("success");
					})
					.fail(function() {
						console.log("error");
					})
					.always(function() {
						console.log("complete");
					});
					

					//_uploader.upload(file);
				},
				//上傳出錯
				SetError:function(){
					jqStatus.attr("class","my-btn glyphicon glyphicon-remove-circle");
					_status = STATUS_ERROR
				},
				//設置工作狀態
				SetWork:function(run){
					setWork(run);
				},
				//更新進度條
				UpdateBar:function(percentage){
					var val = Math.floor(percentage * 10000) / 100 + "%";
					if(jqBar.text() != val){
						jqBar.text(val);
					}

					jqBar.css( 'width', percentage * 100 + '%' );
				},
				//返回檔案 hash
				Hash:function(){
					return _hash;
				},
			};

			//計算hash
			_uploader.md5File(file).progress(function(percentage) {
				newObj.UpdateBar(percentage);
			}).then(function(val) {
				//驗證狀態
				if(_status != STATUS_HASH){
					return;
				}
				
				//記錄hash
				_hash = val;

				//更新 狀態
				_status = STATUS_NONE;

				//更新 ui
				newObj.UpdateBar(0);
				jqBar.removeClass('progress-bar-info');
				jqStatus.attr("class","my-btn glyphicon glyphicon-upload");
			});
			return newObj;
		};
		_uploader.on('fileQueued',function(file) {//添加上傳檔案到記錄
			//增加 界面ui
			var name = file.name.substring(0,file.name.length - file.ext.length);
			if(name.length > 0 && name[name.length-1] == '.'){
				name = name.substring(0,name.length-1);
			}
			var html = "<li class='list-group-item'>"
				+ "<div>"
					+ "<span>" + name + "</span>"
					+ "<div class='my-upload-icons'>"
					+ "<span class='glyphicon glyphicon-refresh my-btn-upload'></span>"
					+ "<span class='glyphicon glyphicon-remove my-btn-upload'></span>"
					+ "</div>"
				+ "</div>"

				+ "<div class='progress my-progress'>"
					+ "<div class='progress-bar progress-bar-info progress-bar-striped active' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='10000' style='min-width: 4em;width: 0%;'>0.00%</div>"
				+ "</div>"
			+ "</li>";
			var jq = $(html);
			_jqView.append(jq);

			//創建內存 節點
			var item = newItem(name,file,jq);

			//添加到 索引
			_items[file.id] = item;
		}).on('uploadStart',function(file){//檔案上傳 前
			//更新 上傳 狀態
			var item = _items[file.id];
			if(!item){
				//檔案不存在 刪除
				_uploader.stop(file);//暫停已經在上傳的檔案
				_uploader.removeFile(file,true);

				item.SetWork(false);
				return;
			}

			//更新狀態
			item.SetUploading();
		}).on('uploadError',function(file,reason){//檔案上傳 出錯
			var item = _items[file.id];
			item.SetWork(false);
			item.SetError();
		}).on('uploadProgress',function(file,percentage){//檔案上傳中 更新進度
			var item = _items[file.id];
			item.UpdateBar(percentage);
		});

		var insert = function(file){
			_uploader.addFiles(file);
		};
		newObj = {
			//添加一個檔案到上傳列表
			Insert:function(file){
				insert(file);
			},
			//設置父目錄id
			SetPid:function(val){
				_pid = val;
			},
		};
		return newObj;
	};
})(this);