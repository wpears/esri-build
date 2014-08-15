define(["require"], function(require){
  var WIN = window
    , DOC = document
    , fx
    , ie9 =(DOC.all&&DOC.addEventListener&&!window.atob)?true:false;

      if(ie9) fx = require("dojo/_base/fx", function(fx){return fx});

  return function whyNoClick(node, options){
        options = options||{};
        var styl = node.style
          , offsetX = options.offsetX || -110
          , offsetY = options.offsetY || 30
          , duration = options.duration || 2000
          , transition = options.transition || 100
          , opac = 'opacity ' + transition/1000+ 's ease'; 
        styl['-webkit-transition'] = opac;
        styl['-moz-transition'] = opac;
        styl['-o-transition'] = opac;
        styl['transition'] = opac;

        whyNoClick.displayTimeout = function(){node.style.display='none';};

        whyNoClick.timeout = function(){
          styl.opacity = 0; //transition from css, then display none;
          whyNoClick.currTimeouts[1] = WIN.setTimeout(whyNoClick.displayTimeout, transition);
        }

        whyNoClick.ieTimeout = function(){fx.animateProperty(
                                            { node:node
                                            , duration:transition+50
                                            , properties:{opacity:0}
                                            , onEnd:whyNoClick.displayTimeout}).play()
                                         };
        whyNoClick.currTimeouts =[];


    return function(e){
      WIN.clearTimeout(whyNoClick.currTimeouts[0]);
      var x = e.pageX - e.offsetX + offsetX +"px"
        , y = e.pageY - e.offsetY+ offsetY +"px"
        ;
      styl.display='none';
      styl.top = y;
      styl.left = x;
      styl.display='block';
      if(ie9){
        fx.animateProperty({node:node, duration:75, properties:{opacity:1}}).play();
        whyNoClick.currTimeouts[0] = WIN.setTimeout(whyNoClick.ieTimeOut, duration);
      }else{
        WIN.clearTimeout(whyNoClick.currTimeouts[1]);
        styl.opacity = 1;
        whyNoClick.currTimeouts[0] = WIN.setTimeout(whyNoClick.timeout, duration);
      }
    };
  };
});