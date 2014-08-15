define( ["esri/tasks/identify"
        ,"esri/tasks/IdentifyTask"
        ,"esri/tasks/IdentifyParameters"
        ],
function( ident
        , IdentifyTask
        , IdentifyParameters
         ){
  return function(url, map, layerArray, rastersShowing){
    var idT = new IdentifyTask(url)
      , idP = new IdentifyParameters()
      , noRasters = rastersShowing?0:1
      ;

    idP.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
    idP.tolerance = 1;
    idP.layerIds = layerArray;
    idP.returnGeometry = false;
    
    function parsePromise(v){
      var output = processId.output;
      output.length = 0;
      if(v.length>0){
        for(var i = 0, j = v.length;i<j;i++){
          if(rastersShowing[v[i].layerId+1]||noRasters){
            output.push(v[i]);
          }
        }      
      }
      return output;
    }

    function processId(tA, pA){
      var def = tA.execute(pA);
      return def.then(parsePromise);
    }

    processId.output =[];

    return function(geom){
      idP.geometry = geom;
      idP.mapExtent=map.extent;
      idP.height=map.height;
      idP.width=map.width;
      return processId(idT, idP);
    };
  };
});
