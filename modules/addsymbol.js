define(["esri/graphic"],function(Graphic){
  return function (map, geom, sy, trackingArr){
    var sym=new Graphic(geom, sy);
    map.graphics.add(sym);
    trackingArr.push(sym);
    return sym;
  }
});
