define(["esri/graphic","esri/symbols/TextSymbol","esri/symbols/Font"],function(Graphic,TextSymbol,Font){
  function addTextSymbol(map, text, geom, ang, color, trackingArr, handlers){
    var txtsym=new TextSymbol(text)
      , gra
      , offsetFactor = Math.pow(map.extent.getWidth(),0.1)+8
      , x = Math.sin(0.87+ang)
      , y = Math.cos(0.87+ang)
      ;
    if(color)
      txtsym.setColor(color);
    txtsym.setOffset(x*offsetFactor, y*offsetFactor);
    txtsym.setFont=addTextSymbol.font;
    gra=new Graphic(geom, txtsym);
    map.graphics.add(gra);
    trackingArr.push(gra);
    handlers.push(map.on('zoom-end',function(zoomObj){
      var offsetFactor = Math.pow(map.extent.getWidth(),0.1)+8;
      txtsym.setOffset(x*offsetFactor,y*offsetFactor)
    }));
    return txtsym;
  }
  addTextSymbol.font=new Font("14px","STYLE_NORMAL","VARIANT_NORMAL","WEIGHT_BOLDER");
  return addTextSymbol;
});