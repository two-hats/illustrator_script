/*
 * 縦横サイズ.jsx v0.3
 * Copyright (c) 2014 Yasutsugu Sasaki
 * Released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

#target "illustrator"

(function(){
    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;   //座標の原点を各アートボードの左上にする。
    var keyState = ScriptUI.environment.keyboardState;  //キーボードイベント取得用
    var specLayer = null;   //指示表示用のレイヤー
    var lineLength = 10;
    var offset = 10;
    
    //指示表示用のレイヤーが無ければ追加
    function addSpecLayer(){
        for(var i = 0, il = app.activeDocument.layers.length; i < il; i++){ 
            if(app.activeDocument.layers[i].name == "縦横サイズ"){
                specLayer = app.activeDocument.layers[i];
                break;
            }
        }
        if(specLayer == null){
            specLayer = app.activeDocument.layers.add();
            specLayer.name = "縦横サイズ";
        }
    }

    //RGB色を設定
    function setColor(r, g, b){
        var rgbColor = new RGBColor();
        rgbColor.red = r;
        rgbColor.green = g;
        rgbColor.blue = b;
        return rgbColor;
    }

    //寸法線のスタイルを設定
    function setPathStyle(pathItem){
        pathItem.filled = false;
        pathItem.stroked = true;
        pathItem.strokeWidth = 1;
        pathItem.strokeColor = setColor(255, 0, 0);
        pathItem.strokeCap = StrokeCap.BUTTENDCAP;
        pathItem.strokeJoin = StrokeJoin.MITERENDJOIN;
    }

    //数値のスタイルを設定
    function setTextStyle(textFrame){
        textFrame.textRange.characterAttributes.fillColor = setColor(255, 0, 0);
        textFrame.textRange.characterAttributes.size = 11;
    }

    //縦横サイズの寸法線を描く
    function drawSize(obj){
        var fromX = Math.round(obj.geometricBounds[0]), toX = Math.round(obj.geometricBounds[2]);
        //Y座標は符号を反転させる
        var fromY = -Math.round(obj.geometricBounds[1]), toY = -Math.round(obj.geometricBounds[3]);
        
        //Width
        var widthGroup = specLayer.groupItems.add();
        var widthLine = widthGroup.pathItems.add();
        setPathStyle(widthLine);
        var widthText = widthGroup.textFrames.add();
        widthText.contents = toX - fromX;
        setTextStyle(widthText);
        widthText.paragraphs[0].paragraphAttributes.justification = Justification.CENTER;
            
        //height
        var heightGroup = specLayer.groupItems.add();
        var heightLine = heightGroup.pathItems.add();
        setPathStyle(heightLine);
        var heightText = heightGroup.textFrames.add();
        heightText.contents = toY - fromY;
        setTextStyle(heightText);
        heightText.paragraphs[0].paragraphAttributes.justification = Justification.RIGHT;
        
        //コントロールキーが押されていたらアートボード外に寸法線を描く
        if(keyState.ctrlKey){
            //Width
            widthLine.setEntirePath ([[fromX, -(fromY + lineLength)], [fromX, offset], [toX, offset], [toX, -(fromY + lineLength)]]);
            widthText.position = [fromX + (toX - fromX) / 2 - widthText.width / 2, offset + widthText.height + 2];
            
            //height
            heightLine.setEntirePath ([[fromX + lineLength, -fromY], [-offset, -fromY], [-offset, -toY], [fromX + lineLength, -toY]]);
            heightText.position = [-offset - heightText.width - 2, -(fromY + (toY - fromY) / 2 - heightText.height / 2)];
        } else {
            //Width
            widthLine.setEntirePath ([[fromX, -(fromY + lineLength)], [fromX, -(fromY - offset)], [toX, -(fromY - offset)], [toX, -(fromY + lineLength)]]);
            widthText.position = [fromX + (toX - fromX) / 2 - widthText.width / 2, -(fromY - offset - widthText.height - 2)];
            
            //height
            heightLine.setEntirePath ([[fromX + lineLength, -fromY], [fromX - offset, -fromY], [fromX - offset, -toY], [fromX + lineLength, -toY]]);
            heightText.position = [fromX -offset - heightText.width - 2, -(fromY + (toY - fromY) / 2 - heightText.height / 2)];
        }
    }

    //main
    try {
        if (app.documents.length > 0 ) {
            var sl = app.selection.length;
            if(sl > 0){
                addSpecLayer();
                for(var i = 0; i < sl; i++){
                    drawSize(app.selection[i]);
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