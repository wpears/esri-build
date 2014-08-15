define (["modules/splice"
        ],
function( splice
        ){
  return function(features, insideTimeBoundary, highlighter, showData){
    var graphics = features.graphics
      , featureCount = graphics.length
      , oidStore = new Array(featureCount + 1)
      , geoArr = new Array(featureCount)
      , geoBreaks = new Array(Math.ceil(featureCount/10))
      , geoBins = new Array(geoBreaks.length)

      , selectedOIDs = []
      , prevArr = []
      , currArr = []
      , binLength = geoBreaks.length
      , lastClickBin = []
      , queriedLayers = []
      , lastBin = null
      , lastIndex
      ;




    /************OID MANAGEMENT FUNCTIONS****************/




    function clearStoredOID(oid, doSplice, fromGrid){
      var oidIndex = prevArr.indexOf(oid);
      highlighter(oid,"", 1);
      if(oidStore[oid]){
        oidStore[oid] = 0;
        if(fromGrid&&oidIndex>-1)splice(prevArr, oidIndex);
        if(doSplice)
          splice(selectedOIDs, selectedOIDs.indexOf(oid));
      }
    }

    function storeOID(oid){
      if(!oidStore[oid]){
        oidStore[oid] = 1;
        selectedOIDs.push(oid);
      }
    }

    function isStored(oid){
      return oidStore[oid]
    }

    function clearAllStoredOIDs(){
      for(var i = 0, j = selectedOIDs.length;i<j;i++)
          clearStoredOID(selectedOIDs[i], 0, 0);
      selectedOIDs.length = 0;
      prevArr.length = 0;
    }

    function clearAndSetOID(oid, attributes){
      clearAllStoredOIDs();
      storeOID(oid);
      prevArr.length = 1;
      prevArr[0] = oid;
      highlighter(oid,"hi", 1);
      showData(attributes);
    }




    /*******INITIALIZE GEOGRAPHIC BINS*******/




    (function(){

      for(var i=0; i<featureCount; i++){
        var currExtent = graphics[i]._extent;

        geoArr[i] = { oid:graphics[i].attributes.OBJECTID,
                      xmin:currExtent.xmin,
                      xmax:currExtent.xmax,
                      ymin:currExtent.ymin,
                      ymax:currExtent.ymax
                    }
        oidStore[i] = 0;     
      }
      oidStore[featureCount] = 0;

      //after filling an array with objects with extent/oid information, sort by xmin
      geoArr.sort(function(a, b){return a.xmin-b.xmin})

      //define breakpoints for bins sorted by xmin, with a break for every 10 datasets.
      for(var k = 0, l = geoBreaks.length-1; k<l; k++){
        geoBreaks[k] = geoArr[k*featureCount/10>>0].xmin;
        geoBins[k] =[];
      }
      geoBreaks[l] = geoArr[featureCount-1].xmin;

      //for every feature, put it in each bin that it intersects. Since bins are defined based on
      //longitude, datasets with great east-west distances will likely fall into multiple bins.
      for(i = 0; i<featureCount; i++){
        var currGeo = geoArr[i];
        for(k=0; k<l; k++){
          if(currGeo.xmin<= geoBreaks[k+1]&&currGeo.xmax>= geoBreaks[k])
            geoBins[k].push(currGeo);
        }
      }
      
    })();




/***********GEOSEARCH****************/
//n.b. that this could be modularized to be more generally useful, q.v. the repeated code in 
//clearBin and syntheticQuery. However, currently organized for raw speed (no function call overhead)
//where possible


    function clearBin(bin,mouseDown){
      for(i = 0; i<bin.length; i++){
        curr = bin[i];
        oid = curr.oid;
        if(insideTimeBoundary[oid]){
          if(oidStore[oid]){
            //don't clear stored unless we've clicked on something new
            if(mouseDown){
              clearStoredOID(oid, 1, 0);
            }
            continue;
          }else{
            //clear mouseover highlight. Have to do whole bin since might be multiple hl
            highlighter(oid,"", 1);
          }
        }
      }
    }


    function syntheticQuery(mapX, mapY, bin){
      queriedLayers.length = 0;
      if(!bin) return queriedLayers;

      var curr
        , oid
        ;

      for(var i = 0, j = bin.length; i<j; i++){
        curr = bin[i];
        oid = curr.oid;

        //break once we have reached outside useful area of interest
        if(curr.xmin>mapX){
          break;
        }

        //leave hidden things alone
        if(insideTimeBoundary[oid]){
          //if point is within extent
          if(curr.xmax>= mapX&&curr.xmin<= mapX&&curr.ymin<= mapY&&curr.ymax>= mapY){
            queriedLayers.push(oid)
          }
        }
      }
      return queriedLayers;
    }




    function geoSearch(e, mouseDown, synthetic){//think about using two sorted arrays, one mins one maxs
      var i, j, curr, oid, temp, binTemp,
      mapX, mapY, binArr, someTargeted = 0;

      //null is passed as the first argument on mouseout
      //otherwise, the event could actually happen on the wrong bin
      if(e === null){
        binArr = lastBin;
      }else{
        mapX = e.mapPoint.x;
        mapY = e.mapPoint.y;

        //search for the right bin by comparing around geobreaks and assign to this bin
        for(i = 0, j = binLength-1; i<j; i++){
          if(mapX<geoBreaks[i+1])
            break;
        }

        binArr = geoBins[i]||geoBins[i-1];

        //with lots of data grouped together, can run into trouble with skipped bins.
        //tracy oasis covers glc3, blocking mouseouts from firing, yet and glc3/4 are close enough
        //that you can skip bins and leave things highlighted. the following corrects this
        //at a small perf penalty
        if(lastBin&&binArr!==lastBin){
          clearBin(lastBin,mouseDown)
        }
        lastBin = binArr;
      }


      if(mouseDown&&binArr!== lastClickBin){
        //we've clicked on a new set of features
        clearAllStoredOIDs();
        lastClickBin = binArr;
      }


      if (binArr)
        j = binArr.length;
      else
        j = 0;

      if(synthetic){
        return syntheticQuery(mapX,mapY,binArr)
      }

      for(i = 0; i<j; i++){
        curr = binArr[i];
        oid = curr.oid;

        //break once we have reached outside useful area of interest
        if(curr.xmin>mapX&&!mouseDown){
          break;
        }

        //leave hidden things alone
        if(insideTimeBoundary[oid]){
          //if point is within extent
          if(curr.xmax>= mapX&&curr.xmin<= mapX&&curr.ymin<= mapY&&curr.ymax>= mapY){
            someTargeted = 1;
            highlighter(oid,"hi", 1);
            if(mouseDown){
                currArr.push(oid);
                if(!oidStore[oid])
                  storeOID(oid);
            }
          }else{
            if(oidStore[oid]){
              //don't clear stored unless we've clicked on something new
              if(mouseDown)
                clearStoredOID(oid, 1, 0);
              continue;
            }else{
              //clear mouseover highlight. Have to do whole bin since might be multiple hl
              highlighter(oid,"", 1);
            }
          }
        }
      }

      
      //we've clicked on a feature. either clear it if it is already selected or 
      //save it and trigger the showData side effects
      if(mouseDown&&someTargeted){
        if(prevArr.length===currArr.length&&JSON.stringify(prevArr)=== JSON.stringify(currArr)){
          clearAllStoredOIDs();
          currArr.length = 0;
        }else{
          temp = prevArr;
          prevArr = currArr;
          temp.length = 0;
          currArr = temp;
        }
        showData(null);
      }


      //rehighlight true selections when clicking on features hidden by the timeslider
      if(!someTargeted&&mouseDown&&prevArr){
        for(i = 0; i<prevArr.length; i++){
          highlighter(prevArr[i],"hi", 1);
          if(!oidStore[prevArr[i]])
            storeOID(prevArr[i]);
        }
      }
      binArr = null;
    }

    geoSearch.clearAll = clearAllStoredOIDs;
    geoSearch.clear = clearStoredOID;
    geoSearch.clearAndSet = clearAndSetOID;
    geoSearch.store = storeOID;
    geoSearch.isStored = isStored;
    geoSearch.selected = selectedOIDs;

    return geoSearch;
  
  }
});