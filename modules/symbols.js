define (["esri/symbols/SimpleLineSymbol"
        ,"esri/symbols/SimpleFillSymbol"
        ,"dojo/_base/Color"
        ],
function( SimpleLine
        , SimpleFill
        , Color
        ){
  var solidFill = SimpleFill.STYLE_SOLID
    , solidLine = SimpleLine.STYLE_SOLID
    , DJBlack = new Color([0, 0, 0, 0])
    ;
  return {
    topo: {
      grethin: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([18, 160, 0]), 0.5), DJBlack),
      magthin: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([221, 4, 178]), 0.5), DJBlack),
      bluthin: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([50, 84, 255]), 0.5), DJBlack),
      redthin: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([255, 0, 0]), 0.5), DJBlack),
      brothin: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([112, 84, 59]), 0.5), DJBlack),
      gre: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([18, 160, 0]), 1.5), DJBlack),
      mag: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([221, 4, 178]), 1.5), DJBlack),
      blu: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([50, 84, 255]), 1.5), DJBlack),
      red: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([255, 0, 0]), 1.5), DJBlack),
      bro: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([112, 84, 59]), 1.5), DJBlack),
      grehi: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([18, 160, 0]), 4), DJBlack),
      maghi: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([221, 4, 178]), 4), DJBlack),
      bluhi: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([50, 84, 255]), 4), DJBlack),
      redhi: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([255, 0, 0]), 4), DJBlack),
      brohi: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([112, 84, 59]), 4), DJBlack)
    },
    sat: {
      magthin: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([252, 109, 224]), 1), DJBlack),
      bluthin: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([119, 173, 255]), 1), DJBlack),
      redthin: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([243, 63, 51]), 1), DJBlack),
      grethin: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([24, 211, 48]), 1), DJBlack),
      brothin: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([169, 152, 137]), 1), DJBlack),
      mag: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([252, 109, 224]), 1.5), DJBlack),
      blu: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([119, 173, 255]), 1.5), DJBlack),
      red: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([243, 63, 51]), 1.5), DJBlack),
      gre: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([24, 211, 48]), 1.5), DJBlack),
      bro: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([169, 152, 137]), 1.5), DJBlack),
      maghi: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([252, 109, 224]), 4), DJBlack),
      bluhi: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([119, 173, 255]), 4), DJBlack),
      redhi: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([243, 63, 51]), 4), DJBlack),
      grehi: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([24, 211, 48]), 4), DJBlack),
      brohi: new SimpleFill(solidFill, new SimpleLine(solidLine, new Color([169, 152, 137]), 4), DJBlack)
    }
  }
});