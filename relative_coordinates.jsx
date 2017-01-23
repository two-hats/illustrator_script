/*
 * 相対座標.jsx v0.4
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
            if(app.activeDocument.layers[i].name == "座標"){
                specLayer = app.activeDocument.layers[i];
                break;
            }
        }
        if(specLayer == null){
            specLayer = app.activeDocument.layers.add();
            specLayer.name = "座標";
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
    function drawDistance(fromX, fromY, toX, toY){
        
        fromX = Math.round(fromX);
        toX = Math.round(toX);
        
        //Y座標は符号を反転させる
        fromY = -Math.round(fromY);
        toY = -Math.round(toY);
        
        //コントロールキーが押されていたらアートボード外に寸法線を描く
        if(keyState.ctrlKey){
            //Vertical
            var verticalGroup = specLayer.groupItems.add();
            var vLine = verticalGroup.pathItems.add();
            setPathStyle(vLine);
            var vText = verticalGroup.textFrames.add();
            vText.contents = toX - fromX;
            setTextStyle(vText);
            vText.paragraphs[0].paragraphAttributes.justification = Justification.CENTER;
            vLine.setEntirePath ([[fromX, -(fromY + lineLength)], [fromX, offset], [toX, offset], [toX, -(toY + lineLength)]]);
            vText.position = [fromX + (toX - fromX) / 2 - vText.width / 2, offset + vText.height + 2];
            
            //horizontal
            var horizontalGroup = specLayer.groupItems.add();
            var hLine = horizontalGroup.pathItems.add();
            setPathStyle(hLine);
            var hText = horizontalGroup.textFrames.add();
            hText.contents = toY - fromY;
            setTextStyle(hText);
            hLine.setEntirePath ([[fromX + lineLength, -fromY], [-offset, -fromY], [-offset, -toY], [toX + lineLength, -toY]]);
            hText.paragraphs[0].paragraphAttributes.justification = Justification.RIGHT;
            hText.position = [-offset - hText.width - 2, -(fromY + (toY - fromY) / 2 - hText.height / 2)];
        } else {
            //Vertical
            var verticalGroup = specLayer.groupItems.add();
            var vStartline = verticalGroup.pathItems.add();
            setPathStyle(vStartline);
            vStartline.setEntirePath ([[toX, -fromY], [toX + lineLength, -fromY]]);
            var vline = verticalGroup.pathItems.add();
            setPathStyle(vline);
            vline.setEntirePath ([[toX + lineLength / 2, -fromY], [toX + lineLength / 2, -toY]]);
            var vEndline = verticalGroup.pathItems.add();
            setPathStyle(vEndline);
            vEndline.setEntirePath ([[toX, -toY], [toX + lineLength, -toY]]);
            var vText = verticalGroup.textFrames.add();
            vText.contents = toY - fromY;
            setTextStyle(vText);
            vText.paragraphs[0].paragraphAttributes.justification = Justification.LEFT;
            vText.position = [toX + lineLength / 2 + 4, -(fromY + (toY - fromY - vText.width) / 2)];
            

            //horizontal
            var horizontalGroup = specLayer.groupItems.add();
            var hStartline = horizontalGroup.pathItems.add();
            setPathStyle(hStartline);
            hStartline.setEntirePath([[fromX, -toY], [fromX, -(toY + lineLength)]]);
            var hline = horizontalGroup.pathItems.add();
            setPathStyle(hline);
            hline.setEntirePath ([[fromX, -(toY + lineLength / 2)], [toX, -(toY  + lineLength / 2)]]);
            var hEndline = horizontalGroup.pathItems.add();
            setPathStyle(hEndline);
            hEndline.setEntirePath ([[toX, -toY], [toX, -(toY + lineLength)]]);
            var hText = horizontalGroup.textFrames.add();
            hText.contents = toX - fromX;
            setTextStyle(hText);
            hText.paragraphs[0].paragraphAttributes.justification = Justification.CENTER;
            hText.position = [fromX + (toX - fromX- hText.width) / 2, -(toY + lineLength / 2 + 4)];
        }
    }

    //どちらが原点に近いのかによってdrawDistanceに引き渡す順番を整理する。
    function sort(obj1, obj2){
        var fromX = 0, toX = 0, fromY = 0, toY = 0;
        
        if(obj1.geometricBounds[0] < obj2.geometricBounds[0]){
            fromX = obj1.geometricBounds[0];
            toX = obj2.geometricBounds[0];
            if(obj1.geometricBounds[2] < obj2.geometricBounds[0]){
                fromX = obj1.geometricBounds[2];
            }
        } else {
            fromX = obj2.geometricBounds[0];
            toX = obj1.geometricBounds[0];
            if(obj2.geometricBounds[2] < obj1.geometricBounds[0]){
                fromX = obj2.geometricBounds[2];
            }
        }

        if(obj1.geometricBounds[1] > obj2.geometricBounds[1]){
            fromY = obj1.geometricBounds[1];
            toY = obj2.geometricBounds[1];
            if(obj1.geometricBounds[3] > obj2.geometricBounds[1]){
                fromY = obj1.geometricBounds[3];
            }
        } else {
            fromY = obj2.geometricBounds[1];
            toY = obj1.geometricBounds[1];
            if(obj2.geometricBounds[3] > obj1.geometricBounds[1]){
                fromY = obj2.geometricBounds[3];
            }
        }

        drawDistance(fromX, fromY, toX, toY);
    }

    //main
    try {
        if (app.documents.length > 0 ) {
            var sl = app.selection.length;
            switch(sl){
                case 0:
                    throw new Error('オブジェクトを選んでから実行してください。');
                    break;
                case 1:
                    addSpecLayer();
                    drawDistance(0, 0, app.selection[0].geometricBounds[0], app.selection[0].geometricBounds[1]);
                    break;
                case 2:
                    addSpecLayer();
                    sort(app.selection[0], app.selection[1]);
                    break;
                default:
                    throw new Error('オブジェクトを選べる数は2つまでです。');
                    break;
                }
        } else {
            throw new Error('ドキュメントが開かれていません。');
        }
    }
    catch(e) {
        alert( e.message, "スクリプト警告", true);
    }
})()