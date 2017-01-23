/*
 * 絶対座標.jsx v0.1
 * Copyright (c) 2015 Yasutsugu Sasaki
 * Released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

#target "illustrator"

(function(){
    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;   //座標の原点を各アートボードの左上にする。
    
    var specLayer = null;
    var fontSize = 11;
    var yMargin = 14;
    var posSize = 10;
    
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
    
    //main
    try {
        if (app.documents.length > 0 ) {
            var sel = app.selection;
            if(sel.length > 0){
                addSpecLayer();
                for(var i = 0, il = sel.length; i < il; i++){
                    var x = Math.round(sel[i].geometricBounds[0]);
                    var y = Math.round(sel[i].geometricBounds[1]);
                    var w = Math.ceil(sel[i].geometricBounds[2] - sel[i].geometricBounds[0]);
                    var h = -Math.ceil(sel[i].geometricBounds[3] - sel[i].geometricBounds[1]);
                    var group = specLayer.groupItems.add();

                    //座標の数値をテキストで描写
                    var propTF = group.textFrames.add();
                    propTF.textRange.characterAttributes.fillColor = setColor(255,0,0);
                    propTF.textRange.characterAttributes.size = fontSize;
                    propTF.textRange.characterAttributes.autoLeading = false;
                    propTF.textRange.characterAttributes.leading = fontSize + 2;
                    propTF.contents = "X:" + x + ", Y:" + (-y) + ", W:" + w + ", H:" + h;
                    propTF.position = [x, y + yMargin ];
                    
                    //かぎかっこ
                    var pos = group.pathItems.add();
                    pos.setEntirePath ([[x,y], [x + posSize, y], [x + posSize, y - 3],[x + 3, y - 3], [x + 3, y - posSize], [x, y - posSize]]);
                    pos.closed = true;
                    pos.filled = true;
                    pos.stroked = false;
                    pos.fillColor = setColor(255, 0, 0);
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