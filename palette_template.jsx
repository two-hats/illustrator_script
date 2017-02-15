#target illustrator
//実際にイラストレーターのプラグインとして使用する場合は、ターゲットエンジンを指定します。
//#targetengine palette_template

//実際にイラストレーターのプラグインとして使用する場合は、Window.findを復活させvar palette = nullをコメントアウトします。
//var palette = Window.find("palette","palette_temp");
var palette = null;
if(!palette){
  
  //BridgeTalkをイラストレーター内で呼び出す関数。
  //引数1のfuncにはメインで実行させたい関数を直接記述します。
  //引数2にはメイン関数に引渡したい引数を配列で指定します。
  //引数3はメイン関数の処理が終わった後におこなうコールバック関数を直接記述します。
  function selfTalk(func, args, cb){
    var bt = new BridgeTalk();
    bt.target = BridgeTalk.appName;
    args = (args !== undefined) ? args.toSource().toString().slice(1, -1) : "";
    bt.body = func.toSource()+"("+ args +");";
    bt.onResult = function(res){
      if(cb !== undefined) cb(res.body);
    };
    bt.send();
  };

  //パレットの生成と、パレット内の要素の登録
  palette = new Window("palette", "title");
  var btn = palette.add("button", undefined, "ボタン");

  //ボタンの動作
  btn.onClick = function(){
    selfTalk(function(argument1, argument2, argument3){
      /* BridgeTalk内では二重線コメントアウトは使えません"
      
      /* メインの関数 */
      var sel = app.activeDocument.selection;
      alert("今選択されているオブジェクトは" + sel.length + "個です。BridgeTalkを使うと今選択されているオブジェクトをリアルタイムで認識できます。");
      
      alert("引数1は" + argument1 + "です。データ型は" + typeof argument1 + "です。");
      alert("引数2は" + argument2 + "です。データ型は" + typeof argument2 + "です。");
      alert("引数3は" + argument3 + "です。データ型は" + typeof argument3 + "です。");
      
      argument3 = argument3.replace(/(\u)([0-9A-F]{4})/g, function(match,p1,p2){
        return String.fromCharCode(parseInt(p2, 16));
      });
      alert("正規表現で入れ替えてあげると日本語も使えます。引数3は" + argument3 + "です。データ型は" + typeof argument3 + "です。");
      
      return "コールバック関数へ引き渡す文字は日本語もOK";
    },
    [123, "ABC", "イラストレーター"],
    function(body){
      /* コールバック関数 */
      alert("メイン関数の処理が終わると実行されるコールバック関数です。" + body);
    });
  };
 }

//実行
palette.show();