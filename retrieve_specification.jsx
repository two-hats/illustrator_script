/*
 * 属性抽出.jsx v0.1
 * Copyright (c) 2014 Yasutsugu Sasaki
 * Released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

#target "illustrator"

(function(){
    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;   //座標の原点を各アートボードの左上にする。
    var keyState = ScriptUI.environment.keyboardState;  //キーボードイベント取得用
    var fontSize = 11;
    var diameter = 4;
    var offset = 10;
    var radius = 3;
    var diameter = radius * 2;
    
    var stages = 3; //表示要素を段違いにする段階数
    var count = 0; //段違いにするためのカウント
    
    var artboardRect = [];
    var xMiddlePoint = 0;
    var yMiddlePoint = 0;
    
    //指示表示用のレイヤーが無ければ追加
    function addSpecLayer(name){
        var layer = null;
        for(var i = 0, il = app.activeDocument.layers.length; i < il; i++){ 
            if(app.activeDocument.layers[i].name == name){
                layer = app.activeDocument.layers[i];
                break;
            }
        }
        if(layer == null){
            layer = app.activeDocument.layers.add();
            layer.name = name;
        }
        return layer;
    }


    //RGB色を設定
    function setColor(r, g, b){
        var rgbColor = new RGBColor();
        rgbColor.red = r;
        rgbColor.green = g;
        rgbColor.blue = b;
        return rgbColor;
    }

    //線のスタイルを設定
    function setPathStyle(pathItem){
        pathItem.filled = false;
        pathItem.stroked = true;
        pathItem.strokeWidth = 1;
        pathItem.strokeColor = setColor(255, 0, 0);
        pathItem.strokeCap = StrokeCap.BUTTENDCAP;
        pathItem.strokeJoin = StrokeJoin.MITERENDJOIN;
    }

    //各RGB色を16進数化する
    function componentToHex(c) {
        var hex = c.toString(16).toUpperCase();
        return hex.length == 1 ? "0" + hex : hex;
    }

    //RGBをHEXに変換する
    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    //色を文字情報にする
    function colorToString(color){
        return rgbToHex (Math.floor(color.red), Math.floor(color.green), Math.floor(color.blue));
    }

    //グラデーションの各ポイントの色を書き出す
    function eachGradientStops(gradient){
        var result = "\n     ";
        for(var i = 0, il = gradient.gradientStops.length; i < il; i++){
            var stop = gradient.gradientStops[i];
            result += Math.floor(stop.rampPoint) + "% : " +colorToString(stop.color);
            if(i != il-1) result += "\n     ";
        }
        return result;
    }

    //色のタイプ（ベタ塗り・グラデーション）を判断して書式を変える
    function detectColorFormat(color){
        var result = "";
        switch(color.typename){
            case "RGBColor":
                result = colorToString(color);
                break;
            case "GradientColor":
                result = "Gradient, ";
                result += (color.gradient.type == GradientType.LINEAR ) ? "Linear, " : "Radial, ";
                result += Math.floor(color.angle) +"deg, "
                       + eachGradientStops(color.gradient);
                break;
            default:
                throw new Error('illustratorのカラーモードをRGBにしてください。');
                break;
        }
        return result;
    }

    //線を描く
    function drawLine(tf, group, color){
        var x = tf.geometricBounds[0];
        var y = tf.geometricBounds[1];
        var w = tf.geometricBounds[2] - tf.geometricBounds[0];
        var h = tf.geometricBounds[3] - tf.geometricBounds[1];
        
        var line = group.pathItems.add();
        line.filled = false;
        line.stroked = true;
        line.strokeWidth = 2;
        line.strokeColor = color;
        line.strokeCap = StrokeCap.BUTTENDCAP;
        line.strokeJoin = StrokeJoin.MITERENDJOIN;
        
        var circle = group.pathItems.ellipse(y - radius, x + radius, diameter, diameter);
        circle.filled = true;
        circle.fillColor = color;
        circle.stroked = false;
        
        //コントロールキーが押されていたら、アートボード外に数値を描く
        if(keyState.ctrlKey){
            //4辺のどの外側に描くかを割り出す。
            var deltaA = (artboardRect[3] - artboardRect[1]) / (artboardRect[2] - artboardRect[0]);
            if(deltaA * x < y){
                if((-deltaA * x + artboardRect[3]) < y){
                    var outside = artboardRect[1] + Math.abs(tf.height * count) + offset;
                    line.setEntirePath([[x + diameter, y - diameter], [x + diameter, outside],[x + diameter + tf.width, outside]]);
                    tf.position = [x + diameter, outside + tf.height];
                }else {
                    var outside = artboardRect[2] + Math.abs(tf.width * count) + offset;
                    line.setEntirePath([[x + diameter, y - diameter], [outside, y - diameter],[outside + tf.width, y - diameter]]);
                    tf.position = [outside, y - diameter + tf.height];
                }
            }else {
                if((-deltaA * x + artboardRect[3]) < y){
                    var outside = artboardRect[0] - Math.abs(tf.width * count) - offset;
                    line.setEntirePath([[x + diameter, y - diameter], [outside, y - diameter],[outside - tf.width, y - diameter]]);
                    tf.position = [outside- tf.width, y - diameter + tf.height];
                }else {
                    var outside = artboardRect[3] - Math.abs(tf.height * (count + 1)) - offset;
                    line.setEntirePath([[x + diameter, y - diameter], [x + diameter, outside],[x + diameter + tf.width, outside]]);
                    tf.position = [x + diameter, outside + tf.height];
                }
            }
            //stagesの段階数ごとに表示要素の位置をずらすためのカウント。
            count++;
            count = count >= stages ? 0: count;
        } else {
            line.setEntirePath([[x + diameter, y - diameter], [x - h, y + h - offset], [x - h + w, y + h - offset]]);
            tf.position = [x - h, y - offset];
            //袋文字にする
            var whiteBorder = tf.duplicate(group ,ElementPlacement.PLACEATEND);
            whiteBorder.textRange.characterAttributes.fillColor = setColor(255,255,255);
            whiteBorder.textRange.characterAttributes.strokeColor = setColor(255,255,255);
            whiteBorder.textRange.characterAttributes.strokeWeight = 3;
        }
    }

    //属性を書き出す
    function drawProperties(obj){
        //スライスが切ってあるかパス・テキスト以外のオブジェクトの場合
        if(obj.sliced || (obj.typename != "PathItem" && obj.typename != "TextFrame")){
            var color = setColor(30, 50, 150);
            var specLayer = addSpecLayer("画像エリア");
            var x1 = obj.visibleBounds[0];
            var y1 = obj.visibleBounds[1];
            var x2 = obj.visibleBounds[2];
            var y2 = obj.visibleBounds[3];
            var group = specLayer.groupItems.add();
            
            if(keyState.shiftKey){
                var propTF = group.textFrames.add();
                propTF.textRange.characterAttributes.fillColor = color;
                propTF.textRange.characterAttributes.size = fontSize;
                propTF.textRange.characterAttributes.autoLeading = false;
                propTF.textRange.characterAttributes.leading = fontSize + 2;
                propTF.contents = "X: " + Math.round(x1) + ",  Y: " + Math.round(-y1) + "\n";
                propTF.contents += "W: " + Math.round(x2 - x1) + ",  H: " + Math.round(-(y2 -y1));
                propTF.position = [x1, y1];
                
                drawLine(propTF, group, color);
            }
        
            var rect = group.pathItems.rectangle(y1, x1, x2 - x1, -(y2 - y1));
            rect.fillColor = setColor(255, 0, 255);
            rect.stroked = false;
            rect.opacity = 30;
        
        //パスの場合
        } else if(obj.typename == "PathItem"){
            var color = setColor(0, 130, 60);
            var specLayer = addSpecLayer("パス属性");
            var x1 = obj.geometricBounds[0];
            var y1 = obj.geometricBounds[1];
            var x2 = obj.geometricBounds[2];
            var y2 = obj.geometricBounds[3];
            var group = specLayer.groupItems.add();
            var propTF = group.textFrames.add();
            propTF.textRange.characterAttributes.fillColor = color;
            propTF.textRange.characterAttributes.size = fontSize;
            propTF.textRange.characterAttributes.autoLeading = false;
            propTF.textRange.characterAttributes.leading = fontSize + 2;
            
            if(keyState.shiftKey){
                propTF.contents += "X: " + Math.round(x1) + ",  Y: " + Math.round(-y1);
                propTF.contents += "\n" + "W: " + Math.round(x2 - x1) + ",  H: " + Math.round(-(y2 -y1));
            }
            propTF.contents += (propTF.contents != "") ? "\n" : "";
            propTF.contents += obj.filled ? "Fill: " + detectColorFormat(obj.fillColor): "";
            propTF.contents += obj.stroked ? "\n" +"Stroke: " + obj.strokeWidth + "px, " + detectColorFormat(obj.strokeColor): "";
            propTF.contents += obj.opacity < 100 ? "\n" + "Opacity: " + obj.opacity : "";
            propTF.position = [x1, y1];
            
            drawLine(propTF, group, color);
        
        //テキストの場合
        } else if(obj.typename == "TextFrame"){
            var color = setColor(0, 140, 200);
            var specLayer = addSpecLayer("テキスト属性");
            var x1 = obj.geometricBounds[0];
            var y1 = obj.geometricBounds[1];
            var x2 = obj.geometricBounds[2];
            var y2 = obj.geometricBounds[3];
            var group = specLayer.groupItems.add();
            var propTF = group.textFrames.add();
            propTF.textRange.characterAttributes.fillColor = color;
            propTF.textRange.characterAttributes.size = fontSize;
            propTF.textRange.characterAttributes.autoLeading = false;
            propTF.textRange.characterAttributes.leading = fontSize + 2;
            
            if(keyState.shiftKey){
                propTF.contents += "X: " + Math.round(x1) + ",  Y: " + Math.round(-y1) + "\n";
                propTF.contents += "W: " + Math.round(x2 - x1) + ",  H: " + Math.round(-(y2 -y1)) + "\n";
            }
            propTF.contents += "Font: " + obj.textRange.characterAttributes.textFont.family;
            propTF.contents += " " + obj.textRange.characterAttributes.textFont.style + "\n";
            propTF.contents += "Font size: " + obj.paragraphs[0].size + "px" + "\n";
            propTF.contents += "Color: " + detectColorFormat(obj.paragraphs[0].fillColor) + "\n";
            propTF.contents += obj.opacity < 100 ? "Opacity: " + obj.opacity + "\n" : "";
            propTF.contents += "Align: " + ("" + obj.paragraphs[0].justification).replace("Justification.","");
            propTF.position = [x1, y1];
            
            drawLine(propTF, group, color);
        }
    }

    //アクティブなアートボードのサイズなどを取得
    function getAbAttribute(){
        var abIndex = app.activeDocument.artboards.getActiveArtboardIndex();
        artboardRect = app.activeDocument.artboards[abIndex].artboardRect;
        xMiddlePoint = (artboardRect[2] - artboardRect[0]) / 2;
        yMiddlePoint = (artboardRect[3] - artboardRect[1]) / 2;
    }
    
    //main
    try {
        if (app.documents.length > 0 ) {
            var sl = app.selection.length;
            if(sl > 0){
                getAbAttribute();
                for(var i = 0; i < sl; i++){
                    drawProperties(app.selection[i]);
                }
            } else {
                throw new Error('オブジェクトを選んでから実行してください。');
            }
        }
        else{
            throw new Error('ドキュメントが開かれていません。');
        }
    }
    catch(e) {
        alert( e.message, "スクリプト警告", true);
    }
})()