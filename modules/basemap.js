define([ "dojo/dom-class"
       , "dojo/on"
       , "modules/zoomlevel"],
function( domClass
        , on
        , zoomLevel){
  //basemaps is an array of objects with properties: name, layer, and anchor
  return function(basemaps, map, effects){
    var activeMap = 'topo';
    var empty = '';


    function toggleBasemaps(){
      for(var i=0; i<basemaps.length;i++){
        var bmap = basemaps[i];
        if(bmap.name === activeMap){
          bmap.layer.show();
          domClass.add(bmap.anchor,"currentbmap");
        }else{
          bmap.layer.hide();
          domClass.remove(bmap.anchor,"currentbmap");
        }
      }
      effects();
    }


    function adjustOnZoom(zoomObj){

      var ext = zoomObj.extent
        , lev = zoomObj.level
        , redraw = 0
        , previousLevel = zoomLevel.get()
        ;

      //extend topo to 18, 19 with satellite
      if(lev > 17 && previousLevel<18 &&activeMap !== 'sat'){
        activeMap = 'sat';
        toggleBasemaps();
      }
      if(previousLevel > 12 && lev < 13||previousLevel < 13 && lev > 12)
          redraw = 1;
      zoomLevel.set(lev);
      if(redraw)
        effects();
    }


    function basemapHandler(bmap){
      return function(){
        if(bmap.name===activeMap)
          activeMap = empty;
        else
          activeMap = bmap.name;
        toggleBasemaps();
      }
    }


    map.on("zoom-end", adjustOnZoom);

    for(var i=0; i<basemaps.length;i++){
      var bmap = basemaps[i];
      on(bmap.anchor,"mousedown",basemapHandler(bmap));
    }


    return function (){
      return activeMap;
    }
  }
})