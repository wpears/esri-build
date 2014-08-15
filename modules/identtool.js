define(['modules/addsymbol'
       ,'modules/addtextsymbol'
       ,'modules/identify'
       ,'modules/tools'
       ,'modules/featureevents'
       ,'modules/clearnode'
       ,'modules/cleargraphics'

        ,"esri/symbols/SimpleLineSymbol"
        ,"esri/symbols/SimpleMarkerSymbol"

       ,'dojo/on'
       ,'dojo/dom-class'
       ,'dojo/_base/Color'
       ],
function( addSymbol
        , addTextSymbol
        , Identify
        , tools
        , FeatureEvents
        , clearNode
        , clearGraphics

        , SimpleLine
        , SimpleMarker

        , on
        , domClass
        , Color
        ){    
  return function( anchor, url, layerArray, options ){
      var W = window
        , DOC = document
        , map = options.map||W.esri.map||W.map
        , rastersShowing = options.rastersShowing||null
        , eventFeatures = options.eventFeatures||[]
        , names = options.names||[]
        , dates = options.dates||[]
        , toolTooltip = options.tooltip||null
        , identify = Identify(url, map, layerArray, rastersShowing)
        , mapDiv = DOC.getElementById("mapDiv")
        , solidLine = SimpleLine.STYLE_SOLID
        , lineSymbol = new SimpleLine(solidLine, new Color([0, 0, 0]), 2)
        , dataPointSymbol = new SimpleMarker({"size":6,"color":new Color([0, 0, 0])})
        , noDataPointSymbol = new SimpleMarker(SimpleMarker.STYLE_CIRCLE, 6, new SimpleLine(solidLine, new Color([180, 180, 180]), 1), new Color([140, 140, 140]))
        , noDataColor = new Color([180, 180, 180])
        , self
        , mouseDownX
        , mouseDownY
        , listeners = []
        , nodes = []
        ;

   

      function createTooltip(screenPoint){
      //nav88elev
        var d = DOC.createElement('div');
        d.className = "identDiv";
        d.style.top=(screenPoint.y-10)+'px';
        d.style.left=(screenPoint.x+10)+'px';
        return d;
      }

      function show(e){
        var sty = this.style;
        var top = (e.offsetY-10)+"px";
        var left = (e.offsetX+10)+"px";
        sty.top = top;
        sty.left = left;
        sty.display = "block";
      }

      function hide(e){
        this.style.display = "none";
      }

      function setNoData(sym){
        sym.setSymbol(noDataPointSymbol);
      }

      function renderIdent(idArr, sym, screenPoint){
          var noData = 1;
          var tooltip;
          var lastName = '';
          var label= "No Data";
        if(idArr){
          idArr.forEach(function(v, i){
            var val = v.feature.attributes["Pixel Value"]
            var id = v.layerId;
            var name = names[id];
            var rnd;

            if (val!== "NoData"){
              rnd = Math.round(val*10)/10;
              label = rnd;
              noData = 0;
            }else
              rnd = "No Data";
            if (!tooltip)
              tooltip = new createTooltip(screenPoint);

            if(name !== lastName){
              lastName = name;
              var str = DOC.createElement('strong');
              str.innerHTML = name;
              tooltip.appendChild(str);
            }

            var sp = DOC.createElement('span');
            sp.className="identEntry";
            sp.innerHTML=dates[id]+": <span class='identValue'>"+rnd+ "</span> ft";
            tooltip.appendChild(sp);
            });
        }


        if(noData){
          addTextSymbol(map, label, sym.geometry, 0, noDataColor, self.labels, self.handlers);
          setNoData(sym);
          clearNode(tooltip);
          tooltip.parentNode.removeChild(tooltip);
        }else{
          addTextSymbol(map, label, sym.geometry, 0, 0, self.labels, self.handlers);
          nodes.push(tooltip);
          listeners.push(on(sym.getNode(),"mouseover", show.bind(tooltip)));
          listeners.push(on(sym.getNode(),"mouseout", hide.bind(tooltip)));
          mapDiv.appendChild(tooltip);
        }


      }
        

      function clickCallback(e){
        var mapPoint = e.mapPoint;
        var screenPoint = e.screenPoint;
        var sym = addSymbol(map, mapPoint, dataPointSymbol, self.graphics);
        identify(mapPoint).then(function(idArr){
          renderIdent(idArr, sym, screenPoint);
        });
      }

      function addCSS(name){
        var firstScript = DOC.getElementsByTagName('script')[0]
          , css = DOC.createElement('link');
        css.rel ='stylesheet';
        css.href =name||'modules/identtool.css';
        firstScript.parentNode.insertBefore(css,firstScript);
      }

      return {
        handlers:[],
        graphics:[],
        labels:[],
        init:function(e){
          self = this;
          addCSS();
          function handleClick(e){
            if(domClass.contains(ident,"clickable"))
              return tools.toggle(e, self);
            else 
              if (toolTooltip) toolTooltip(e);
          }
          handleClick(e);
          on(ident,"mousedown", handleClick);   
        },              
        start:function(){
          this.revive();
        },
        idle:function(){
          FeatureEvents.enable(eventFeatures)
          map.setMapCursor("default");
          for(var i = 0;i < self.handlers.length;i++){
            self.handlers[i].remove();
          }
          this.handlers.length = 0;
          identOff = 1;
        },
        revive:function(){
          FeatureEvents.disable(eventFeatures)
          map.setMapCursor("help");
          this.handlers[0] = map.on("mouse-down", function(evt){mouseDownX = evt.pageX;mouseDownY = evt.pageY;});
          this.handlers[1] = map.on("mouse-up", function(e){
          if(e.pageX<mouseDownX+10&&e.pageX>mouseDownX-10&&e.pageY<mouseDownY+10&&e.pageY>mouseDownY-10)
            clickCallback(e)});
          identOff = 0;
        },
        stop:function(){
          if(DOC.getElementsByClassName("idle")[0] !== ident) this.idle();
          clearGraphics(map,this.graphics);
          clearGraphics(map,this.labels);
          listeners.forEach(function(v){
            v.remove();
          });
          nodes.forEach(function(v){
            clearNode(v);
            v.parentNode.removeChild(v);
          })
          this.graphics.length = 0;
          this.labels.length = 0;
          listeners.length = 0;
          nodes.length = 0;

          
        },
        isShowing:function(){return DOC.getElementsByClassName("activeTool")[0] === ident||DOC.getElementsByClassName("idle")[0] === ident},
      };  
    }
});