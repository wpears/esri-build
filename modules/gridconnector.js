//Instantiates grid and binds grid logic with map logic.

define( ["dgrid/Grid"
        ,"dgrid/editor"

        ,"dojo/query"
        ,"dojo/dom-class"
        ,"dojo/on"

        ,"modules/gridcategory"
        ,"modules/gridsorter"
        ,"modules/setvisiblerasters"
        ,"modules/splice"
        ],
function( Grid
        , Editor

        , dquery
        , domClass
        , on

        , gridCategory
        , GridSorter
        , SetVisibleRasters
        , splice
        ){
  return function( gridData
                 , gridNode
                 , gridPane
                 , spl
                 , rasterLayer
                 , insideTimeBoundary
                 , rastersShowing
                 , oidToGraphic
                 , placeMap
                 , map
                 ){
    var W = window
      , headerNodes
      , gridContent
      , scroller
      , toggleCount = 0
      , gridLength = gridData.length + 1
      , lastNodePos =new Array(gridLength)
      , oidArray = new Array(gridLength - 1)
      , gridSorter
      , setVisibleRasters
      ;



    grid = new Grid({bufferRows:Infinity,
        columns:{
          Project:{label:"Project", sortable:false},
          Date:{label:"Date", sortable:false},
          OBJECTID:{label:"OBJECTID"},
          Editor:Editor({field: "Image", sortable:false}, "checkbox"),
          __Date:{label:"_Date"}
        },
        cellNavigation:0
        },
      gridNode
    );




    //add collapsing row tab to data
    gridData.unshift({"__Date":1315008000000,Date:"Various",Project:"Soil Sedimentation",OBJECTID:gridData.length+1});
    
    grid.renderArray(gridData);

    headerNodes = document.getElementById("gridNode-header").firstChild.children;
    gridContent = dquery(".dgrid-content")[0];
    scroller = dquery(".dgrid-scroller")[0];

    headerNodes[0].title = "Sort by Name"; //maybe pass these into constructor
    headerNodes[1].title = "Sort by Date";         
    headerNodes[3].title = "Turn images on or off";
    scroller.style.overflowY="scroll";
    


    //lastNodePos tracks objectIds when sorting the grid
    //oidArray is simply an array of the objectIds
    for(var i = 0, j=gridLength-1; i<j; i++){
      var i1 = i+1;
      lastNodePos[i] = i1;
      oidArray[i] = i1;
    }
    lastNodePos[j]=0;




    // initialize other modules
    sedToggle = gridCategory(grid, gridData, "Project","Soil Sed.", gridNode, lastNodePos);
    toggleCount++;

    gridSorter = GridSorter(renderSort);
    
    //already passed arguments in BathCat.js, just get a reference to the function
    setVisibleRasters = SetVisibleRasters();



    //O(1) object id lookup
    function oidToRow(oid){
      return gridContent.children[lastNodePos[oid-1]];
    }


    //Show appropriate row when a graphic is clicked on the map
    function scrollToRow(oid){
      var row = oidToRow(oid);
      var offset = row.offsetTop;
      if (!offset&&(domClass.contains(row,"hiddenRow")||domClass.contains(row,"hiddenGridToggle")))
        return;
      var scrollTop = scroller.scrollTop;
      if(offset>scroller.clientHeight+scrollTop-55||offset<scrollTop)
          scroller.scrollTop = offset-95;
    }



    //Apply the sorting algorithm returned from the gridsorter to the grid.
    //Mainly this is to allow for performance improvements and for the embedded tab toggle
    function renderSort(sorter){
      var currentNodes = gridContent.children
        , nodeIndex
        , newContent
        , frag = document.createDocumentFragment()
        , toggleRow = gridData.shift()
        ; 
         
      gridData.sort(sorter);
      gridData.unshift(toggleRow);

      for(var i = 0; i<gridLength; i++){
        nodeIndex = gridData[i].OBJECTID-1;
        frag.appendChild(currentNodes[lastNodePos[nodeIndex]].cloneNode(true));
        lastNodePos[nodeIndex] = i;
      }
      newContent = gridContent.cloneNode(false);
      newContent.appendChild(frag);
      gridContent.parentNode.replaceChild(newContent, gridContent);
      gridContent = newContent;
      frag = null;
      sedToggle.setNode();
    }



//Updates the map based on the time extent. This includes both grid and graphics
//This might make more sense as its own module, but fits okay here as well
    function timeUpdate(timeExtent){
      var currOID
        , shape
        , rawGraphic
        , currRow
        , currTime
        , startTime = +timeExtent.startTime
        , endTime = +timeExtent.endTime
        , currentRasters = rasterLayer.visibleLayers
        , oidRasterIndex
        , toBeHidden = timeUpdate.toBeHidden
        , rastersAsOIDs = timeUpdate.rastersAsOIDs
        ;

      //Hide grid rows outside of the current time extent, propagate this change to the map layers
      for(var i = toggleCount; i<gridLength; i++){
        currOID = gridData[i].OBJECTID;
        if(currOID === gridLength) continue;

        shape = oidToGraphic(currOID)._shape;
        if(shape) rawGraphic = shape.rawNode;

        currRow = oidToRow(currOID);
        currTime =+gridData[i].__Date;

        if(currTime<startTime||currTime>endTime){
          domClass.add(currRow, "hiddenRow");
          insideTimeBoundary[currOID] = 0;

          if(map.layerIds[2]){
            oidRasterIndex = currOID-1;
            toBeHidden.push(currOID);

            //remove any rasters that are out of the current time extent
            for(var k = 1;k<currentRasters.length;k++){
              if(currentRasters[k] === oidRasterIndex){
                splice(currentRasters, k);
                k--;
              }
            }
          }

          //setting the class on the svg shape is much faster than redrawing with esri methods
          if(shape){
            rawGraphic.setAttribute("class","hiddenPath")
          }
        }else{
          if(insideTimeBoundary[currOID] === 0){
            domClass.remove(currRow, "hiddenRow");
            insideTimeBoundary[currOID] = 1;
            if(shape)
              rawGraphic.setAttribute("class","")
          }
        }
      }

      if(map.layerIds[2]){
        uncheckImageInputs(toBeHidden);
        for(var i = 1;i<currentRasters.length;i++){
          rastersAsOIDs.push(currentRasters[i]+1);
        }
        setVisibleRasters(rastersAsOIDs, 0);
      }

      rastersAsOIDs.length = 0;
      toBeHidden.length = 0;
    }

    timeUpdate.rastersAsOIDs =[];
    timeUpdate.toBeHidden =[];



//mass image display/clear when Image header is clicked
    function showAllImages(){
      var someChecked = 0;
      for(var i = 1; i<gridLength; i++){
        if(rastersShowing[i]){
          someChecked = 1;
          break;
        }
      }
      if(someChecked){
        setVisibleRasters.clear();
        setVisibleRasters.run(0);
        clearImageInputs();
      }else{
        setVisibleRasters(oidArray, 0);
        checkImageInputs(oidArray);
      }
    }



  //Zooms to a graphic's extent, called when showing an image and not currently zoomed
    function makeViewable(oid, level, center){
      var mapX=center.x;
      var mapY=center.y;
      var ex1=oidToGraphic(oid)._extent;

      if(ex1.xmax>= mapX&&ex1.xmin<= mapX&&ex1.ymin<= mapY&&ex1.ymax>= mapY&&level>=14) return;
      
      var ex=ex1.expand(1.3);
      if(ex.xmax-ex.xmin > makeViewable.xcutoff || ex.ymax-ex.ymin > makeViewable.ycutoff){
        map.setExtent(ex);
      }else{
        map.setLevel(15);
        map.centerAt(ex1.getCenter());
      }
    }
    makeViewable.xcutoff=6500;
    makeViewable.ycutoff=4500;






    function getInputBox(oid){
      return oidToRow(oid).firstChild.firstChild.children[3].firstChild;
    }



    function checkImageInputs(oidArr){
      var curr;
      for(var i = 0, j = oidArr.length;i<j;i++){
        if(insideTimeBoundary[oidArr[i]]){
          curr = getInputBox(oidArr[i]);
          curr.checked = true;
          rastersShowing[oidArr[i]] = 1;
        }
      }
    }



    function uncheckImageInputs(oidArr){
      var curr;
      for(var i = 0, j = oidArr.length;i<j;i++){
          curr = getInputBox(oidArr[i]);
          curr.checked = false;
          rastersShowing[oidArr[i]] = 0;
        }
    }



    function clearImageInputs(){
      var inputArr = dquery(".dgrid-input", gridNode);
        for(var i = 0, j = inputArr.length;i<j;i++){
          inputArr[i].checked = false;
          rastersShowing[i+1] = 0;
        }
    }



    var triggerExpand = function(){
      var expandReady = 1;

      function expand(e){
        gridPane.style.width = e.x+"px";
        placeMap();
        expandReady = 1;
      }
    
      return function (e){
        if(expandReady){
          W.requestAnimationFrame(function(){expand(e)});
          expandReady = 0;
        }
      }
    }()



    on(grid,".dgrid-input:change", function(e){
        var oid =+e.target.parentNode.parentNode.children[2].innerHTML;
        if(rastersShowing[oid]){
          rastersShowing[oid] = 0;
        }else{
          rastersShowing[oid] = 1;
          makeViewable(oid,map.getLevel(),map.extent.getCenter());
        }       
        setVisibleRasters.add(oid);
        setVisibleRasters.run(1);
    });


    on(headerNodes[3],"mousedown", showAllImages);

    on(spl, "mousedown", function(e){               //expand left pane
      gridPane.style.minWidth = 0;
      var mM = on(W, "mousemove", triggerExpand);
      on.once(W,"mouseup", function(evt){
        map.resize();
        mM.remove();
      });
    });

    return { grid: grid
           , gridSorter: gridSorter
           , timeUpdate:timeUpdate
           , oidToRow:oidToRow
           , getInputBox:getInputBox
           , scrollToRow:scrollToRow
           , checkImageInputs:checkImageInputs
           , expand:triggerExpand
           , sedToggle:sedToggle
           };
  }
});