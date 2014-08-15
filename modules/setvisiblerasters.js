//Raster display logic. Respects time boundaries, cognizant of the legend and any raster-specific tools
//(both identify and profile tool in this case)
//You need only pass in the NEW oids which get spliced into the visible rasters queried from the raster layer
//It only accepts an array as the first argument (to ensure the function is called with the same
// types of arguments for performance). To add a single raster, just call the add method and it will
// be managed as part of a reusable array.

define(["modules/settoolvisibility"],function(setToolVisibility){
  var reusableArray =[];

  //shared variables
  var map
    , rasterLayer
    , touch
    , phasingTools
    , legend
    , insideTimeBoundary
    ;

  function setVisibleRasters(newOIDs, fromCheck){
    if(!map.layerIds[2]){ //if the raster has not been added, add it.
      map.addLayer(rasterLayer);
      if(!touch){
        legend.node.src = "images/leg.png";
        legend.show();
      }
    }
    var rL = rasterLayer,
      visibleRasterOIDs = rL.visibleLayers,
      i,
      j = visibleRasterOIDs.length,
      splicedIfPresent,
      rasterIndex;
    if(newOIDs.length>1){
      //add the newOIDS to the already visible rasters if they aren't already there
      (function(){
        for(var i = 0, j = newOIDs.length;i<j;i++){
          if(insideTimeBoundary[newOIDs[i]]&&visibleRasterOIDs.indexOf(newOIDs[i]-1)===-1)
            visibleRasterOIDs.push(newOIDs[i]-1);
        }
      })();
    }
    if(newOIDs.length === 1&&newOIDs[0]!==-1){
      rasterIndex = newOIDs[0]-1;
      while(j--){
        //splice this number out of visible layers if it is there
        if(rasterIndex === visibleRasterOIDs[j]&&fromCheck){
          splicedIfPresent = visibleRasterOIDs.splice(j, 1)[0]; 
          break;
        }
      }
      if(rasterIndex!== splicedIfPresent)
        visibleRasterOIDs.push(rasterIndex)
    }

    if(newOIDs.length === 0){
      visibleRasterOIDs =[-1];
    }

    rL.setVisibleLayers(visibleRasterOIDs);

    if(rL.suspended){                     
      rL.resume();
      if(!touch) legend.show();
    }

    if(visibleRasterOIDs.length === 1){
      rL.suspend();
      if(!touch)legend.hide();
    }
    //if there are no rasters showing and tools are on, turn them off and vice versa.
    setToolVisibility(phasingTools,visibleRasterOIDs.length <= 1);
  }



  setVisibleRasters.clear = function(){
    reusableArray.length = 0;
  };

  setVisibleRasters.add = function(oid){
    reusableArray[0] = oid;
  };

  setVisibleRasters.run = function(fromCheck){
    setVisibleRasters(reusableArray,fromCheck)
  };

  //each module shares the same variables, rather than creating a new closure
  //Can force an update by calling again with different arguments
  return function(ma,ra,to,ph,le,ins){
    if(ma){
      map = ma;
      rasterLayer = ra;
      touch = to;
      phasingTools = ph;
      legend = le;
      insideTimeBoundary = ins;
    }
    return setVisibleRasters;
  }
});
