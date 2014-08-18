  define(['dojo/dom-class', "dojo/on", "dojo/query"], function(domClass, on, dquery){
    return function(){
      var self
        , W = window
        , DOC = document
        , BS = DOC.body.style
        , popupHandlers = []
        , popUp
        , popStyle
        , popHeader
        , headStyle
        , popContainer
        , conStyle
        , popSplitterV
        , splitStyleV
        , popSplitterH
        , splitStyleH
        , popClose
        , popHeight = 400
        , popWidth = 600
        , edges ={left:60, right:660, top:100, bottom:500}
        , px = "px"
        , innerWidth = W.innerWidth
        , innerHeight = W.innerHeight
        , docked ={width:null, height:null}
        , ie9 =(DOC.all&&DOC.addEventListener&&!window.atob)?true:false
        , selectableNodes
        , minSize = 120
        , offsetX
        , offsetY
        , moveReady = 1

      , place = function(){
          popUp = DOC.createElement('div');
          popUp.id ='popUp';
          popUp.innerHTML = '<div id = "popHeader"class = "panehead"> <span id = "popTitle">Profile Tool</span> <div id = "popClose"class = "closebox"></div> </div> <div id = "popContainer"></div> <div id = "popSplitterV"> <div id = "popLineV"></div> </div> <div id = "popSplitterH"> <div id = "popLineH"></div> </div>';
          DOC.body.appendChild(popUp);                  
        }
      , init = function(){
          place();
          popStyle = popUp.style;
          popHeader = DOC.getElementById("popHeader");
          headStyle = popHeader.style;
          popContainer = DOC.getElementById("popContainer");
          conStyle = popContainer.style;
          popSplitterV = DOC.getElementById("popSplitterV");
          splitStyleV = popSplitterV.style;
          popSplitterH = DOC.getElementById("popSplitterH");
          splitStyleH = popSplitterH.style;
          popClose = DOC.getElementById("popClose");
          conStyle.width = "593px";
          self = this;
      }
      , show = function(){
          if(!popUp){
            init();
          }
          if(ie9){
            popStyle.left = edges.left+px;
            popStyle.top = edges.top+px;
          }else{
            popStyle["transform"] = "translate3d("+edges.left+"px,"+edges.top+"px, 0)";
            popStyle["-webkit-transform"] = "translate3d("+edges.left+"px,"+edges.top+"px, 0)";
          } 
          attachHandlers();
        }

      , hide = function(){
        if(ie9){
          popStyle.left = "10000px"
          popStyle.top = "10000px"
        }else{
          popStyle["transform"] = "translate3d(10000px, 10000px, 0)";
          popStyle["-webkit-transform"] = "translate3d(10000px, 10000px, 0)";
        }
        removeHandlers();
      }

      , attachHandlers = function(){
          if(!popupHandlers[0]){
            popupHandlers =[
            on(popHeader,"mousedown", move),             //e, dim, pageDim, max, otherSplitStyle, edgeTracker, oppositeEdge
            on(popSplitterV,"mousedown", function(e){self.resize(e,"width","pageX", innerWidth, edges.left,"right")}),
            on(popSplitterH,"mousedown", function(e){self.resize(e,"height","pageY", innerHeight, edges.top,"bottom")})
            ];
          }
        }

      , removeHandlers = function(){
          for(var i = 0, j = popupHandlers.length; i<j; i++){
            popupHandlers[i].remove();
          }
          popupHandlers.length = 0;
        }

      , freezeSelectable = function(selectable){
          if(selectable.length){
            for(var i = 0;i<selectable.length;i++)
              domClass.replace(selectable[i],"unselectable","selectable");
          }
        }

      , unfreezeSelectable = function(selectable){
          if(selectable.length){
            for(var i = 0;i<selectable.length;i++)
              domClass.replace(selectable[i],"selectable","unselectable");
          }
        }

      , triggerMove = function(e){
            if(moveReady){
              W.requestAnimationFrame(function(){movePopup(e)});//<1ms to run on chrome
              moveReady = 0; //debounce mousemove
            }
        }

      , movePopup= function(e){
          var newLeftEdge = e.pageX-offsetX, newRightEdge = newLeftEdge+popWidth,
            newTopEdge = e.pageY-offsetY, newBottomEdge = newTopEdge+popHeight, nWid, nHei;

          if(newLeftEdge<0){       //left width shrink setup and docking
            newLeftEdge = 0;
            offsetX = e.pageX;
            if(!docked.width)
              docked.width = popWidth;
          }else if(newRightEdge>innerWidth){ //right width shrink setup and docking
            newRightEdge = innerWidth;
            if(!docked.width)
              docked.width = popWidth;
          }

          if(docked.width){                                     
            if(newRightEdge<innerWidth-newLeftEdge){     //left width growth setup
              nWid = newRightEdge;
              newLeftEdge = 0;
              offsetX = e.pageX;
            }else{                               //right width growth setup
              newRightEdge = innerWidth;
              nWid = newRightEdge-newLeftEdge;
            }
            if(nWid>= docked.width){       //undocking width
              nWid = docked.width;
              docked.width = null;
            }
          }          

          if(newTopEdge<0){                //top height shrink setup and docking
            newTopEdge = 0;
            if(!docked.height)
              docked.height = popHeight;
          }else if(newBottomEdge>innerHeight){ //bottom height shrink setup and docking
            newBottomEdge = innerHeight;
            if(!docked.height)
              docked.height = popHeight;
          }

          if(docked.height){
            if(newBottomEdge<innerHeight-newTopEdge){           //top height growth setup
              newTopEdge = 0;
              nHei = newBottomEdge;
            }else{                                      //bottom height growth setup
              newBottomEdge = innerHeight;
              nHei = newBottomEdge-newTopEdge;
            }
            if(nHei>= docked.height){                  //undocking height
              nHei = docked.height;
              docked.height = null;
            }
          }

          if(popWidth!== nWid&&nWid>= minSize){    //actual width shrinking/growing
            popStyle.width = nWid+px;
            conStyle.width = nWid-7+px;
            popWidth = nWid;
          }

          if(popHeight!== nHei&&nHei>= minSize){  //actual height shrinking/growing limited to 120
            popStyle.height = nHei+px;
            conStyle.height = nHei-34+px;
            popHeight = nHei; 
          }

          if(newTopEdge>innerHeight-minSize)newTopEdge = innerHeight-minSize; //limit translate to
          if(newLeftEdge>innerWidth-minSize)newLeftEdge = innerWidth-minSize; //minSize from edge
          //move via translate3d then update edges

          if(ie9){
            popStyle.left = newLeftEdge+px;
            popStyle.top = newTopEdge+px;
          }else{
            popStyle["transform"] = "translate3d("+newLeftEdge+"px,"+newTopEdge+"px, 0)";
            popStyle["-webkit-transform"] = "translate3d("+newLeftEdge+"px,"+newTopEdge+"px, 0)";
          }

          edges.left = newLeftEdge;
          edges.right = newRightEdge;
          edges.top = newTopEdge;
          edges.bottom = newBottomEdge;
          moveReady = 1;
        }

      , move = function(e){//adjustable graph popup
          var et = e.target;

          offsetX = e.offsetX||e.layerX;
          offsetY = e.offsetY||e.layerY;

          BS["-webkit-user-select"] = "none";//when the width is collapsed, the offset changes according to the
          BS["-moz-user-select"] = "none";  //the direction of collapse
          conStyle.display = "none";
          popStyle.boxShadow = "0 0 0";
          popStyle.opacity = "0.7";
          splitStyleH.display = "none";
          splitStyleV.display = "none";
          headStyle.boxShadow = "0 0 0";
          if(et.id!== "popHeader")
            offsetX+= et.offsetLeft, offsetY+= et.offsetTop; //adjust offset if on title div

          selectableNodes=dquery('.selectable');
          freezeSelectable(selectableNodes);

          var mM = on(W,"mousemove", triggerMove);

          on.once(W,"mouseup", function(e){
            mM.remove();
            BS["-webkit-user-select"] = "text";
            BS["-moz-user-select"] = "text";
            popStyle.opacity = "1";
            popStyle.boxShadow = "0 1px 2px 1px #a5b6e0, 0px 0px 2px 0 #a5b6e0";
            headStyle.boxShadow = "0px 2px 2px -1px #a5b6e0";
            conStyle.display = "block";
            splitStyleV.display = "block";
            splitStyleH.display = "block";
            unfreezeSelectable(selectableNodes);
          });
        }

      , resize = function(e, dim, pageDim, max, edgeTracker, oppositeEdge){
          BS["-webkit-user-select"] = "none";
          BS["-moz-user-select"] = "none";  
          var popconDiff =(dim === "width"?7:34), resizeReady = 1, min = 120,
            mM = on(W,"mousemove", triggerResize);

            on.once(W,"mouseup", function(e){
              mM.remove();
              if(docked[dim])
                docked[dim] =(dim === "width"?popWidth:popHeight);
              BS["-webkit-user-select"] = "text";
              BS["-moz-user-select"] = "text";
            });

          function resizePopup(e){
            var moveLocation = e[pageDim], newDim;
            if(moveLocation<= max){
              newDim = moveLocation-edgeTracker;
              if(newDim>= 120){
                popStyle[dim] = newDim+px;
                conStyle[dim] = newDim-popconDiff+px;
                dim === "width"?popWidth = newDim:popHeight = newDim;
                edges[oppositeEdge] = moveLocation;
              }
            }
            resizeReady = 1;
          };
          function triggerResize(e){
            if(resizeReady){
              W.requestAnimationFrame(function(){resizePopup(e)});
              resizeReady = 0;
            }
          } 
        }

        , getContainer = function(){
            return popContainer;
          }

        , getClose = function(){
            return popClose;
          }
        ;

      return{
        init:init,
        show:show,
        hide:hide,
        move:move,
        resize:resize,
        getContainer:getContainer,
        getClose:getClose
      }
    };
});