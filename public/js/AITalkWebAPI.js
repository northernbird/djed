// AITalk WebAPI を扱うクラス
function AITalkWebAPI()
{
  this.URL = 'https://webapi.aitalk.jp/webapi/v2/ttsget.php';
  this.ID = 'MA2018';	// ユーザ名(接続ID)
  this.PW = 'NyXHpSHp';	// パスワード(接続パスワード)

  this.username = this.ID;
  this.password = this.PW;
  this.speaker_name 	= 'miyabi_west';		// 話者名
  this.style 			= '{"j":"1.0"}'; 	// 感情パラメータ
  this.input_type 	= ''; 			// 合成文字種別
  this.text 			= ''; 				// 合成文字
  this.volume 		= 1.0; 				// 音量（0.01-2.00）
  this.speed 			= 1.0; 				// 話速（0.50-4.00）
  this.pitch 			= 1.0; 				// ピッチ（0.50-2.00）
  this.range 			= 1.0; 				// 抑揚（0.00-2.00）
  this.output_type 	= 'sound'; 			// 出力形式
  this.ext 			= 'mp3'; 			// 出力音声形式
}

// WebAPIに送るパラメータ文字列の取得
AITalkWebAPI.prototype.getEncodedParam = function() {
  var query = {
    'username'		: this.username,
    'password'		: this.password,
    'speaker_name'	: this.speaker_name,
    'style'			: this.style,
    'input_type'	: this.input_type,
    'text'			: this.text,
    'volume'		: this.volume,
    'speed'			: this.speed,
    'pitch'			: this.pitch,
    'range'			: this.range,
    'output_type'	: this.output_type,
    'ext'			: this.ext,
  };
  // パラメータをエンコードして=で繋ぐ
  var params = [];
  for( key in query ) {
    var param = '';
    param += encodeURIComponent(key);
    param += '=';
    param += encodeURIComponent(query[key]);
    params.push(param);
  }
  // 全てのパラメータを&で繋いで半角スペースを修正
  return params.join('&').replace(/%20/g, '+');
};

AITalkWebAPI.prototype.speakOutMessage = function(speaker_name, description) {
  var aitalk = new AITalkWebAPI();

  aitalk.text = description;
  aitalk.speaker_name = speaker_name;
  // aitalk.style = '{"j":"1.0"}';

  // 合成
  aitalk.synth();
};

// 音声合成
AITalkWebAPI.prototype.synth = function() {
  var status = document.getElementById('status');
  if( ! window.XMLHttpRequest ) {
    status.innerHTML = "対応していないブラウザです。";
    return;
  }

  var req;
  req = new XMLHttpRequest();
  req.responseType = "blob";

  // WebAPIのステータスが変更されたイベントハンドラ
  req.onreadystatechange = function() {
    if( req.readyState == XMLHttpRequest.DONE ) {
      if( req.status != 200 ) {	// 合成エラー
        var err_msg = "HTTPError, Code: " + req.status;
        err_msg += ", " + req.statusText;
        status.innerHTML = err_msg;
      } else {					// 合成成功
        var audio = document.getElementById('audio');
        audio.src = window.URL.createObjectURL(req.response);
        // status.innerHTML = "合成に成功しました";
      }
    } else {						// 構成中
      // status.innerHTML = "合成を実行しています";
    }
  };

  // 通信
  req.open('POST', this.URL, true);
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  req.send(this.getEncodedParam());
}

// メイン処理
window.onload = function() {

  // (1) 合成内容設定
  var target_text = "わい名前はみやびやでぇ！";

  // (2) AITalkWebAPIを使うためのインスタンス作成
    var aitalk = new AITalkWebAPI();

  // (3) インスタンスに指定したいパラメータをセット
  aitalk.text = target_text;
  aitalk.speaker_name = 'miyabi_west';
  // aitalk.style = '{"j":"1.0"}';

  // (3) 合成
  aitalk.synth();
};
