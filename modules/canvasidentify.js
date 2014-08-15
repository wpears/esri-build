define( ["modules/colorrampobject"
        ,"modules/elementcache"
        ,"dojo/on"
        ],
function( ramp
        , elCache
        , on
        ){
  return function(rasterLayer, map){
    var getImage=rasterLayer.getImageUrl
      , width = map.width
      , height = map.height
      , srText = "&bboxSR=102100&imageSR=102100&size="
      , prefix = rasterLayer.url+"/export?dpi=96&transparent=true&format=png8&layers=show%3A"
      , suffix = makeSuffix(width,height)
      , extent = map.extent
      , points
      , currentLayers = []
      , currentBbox = "&bbox="+extent.xmin+"%2C"+extent.ymin+"%2C"+extent.xmax+"%2C"+extent.ymax
      , lastBbox = 'last'
      , canCache = elCache('canvas')
      , imgCache = elCache('img')
      , layerCache = {}
      ;
    rasterLayer.getImageUrl = function(){  //might not need the monkey patch.. just grab the Bbox from extent on('extent-change')
      var args = Array.prototype.slice.call(arguments,0,3)
        , cb = arguments[3]
        , fn = function(){
                 var urlArr = arguments[0].split('&');
                 currentLayers = urlArr[3].slice(19).split('%2C');
                 currentBbox = '&'+urlArr[4];
                 cb.apply(this,arguments);
               }
        ;
      args.push(fn)
      getImage.apply(this,args);
    };

    on(window, 'resize', setDim)


function setDim(){
  width = map.container.clientWidth;
  height = map.container.clientHeight;
  suffix = makeSuffix(width, height);
}


function makeSuffix(width,height){
  //console.log(srText,width,srText + width + "%2C" + height + "&f=image")
  return srText + width + "%2C" + height + "&f=image"
}



function getElevation(x,y,ctx){
   var data = ctx.getImageData(x, y, 1, 1).data
    , key = (data[0]<<16)+(data[1]<<8)+data[2]
    ;
 //   console.log(data,key)
    return ramp[key];
}


function getElevations(points, ctx){
  var elevs = new Array(points.length/2);
  for(var i = 0, j = points.length; i<j; i+=2){
    elevs[i/2]=getElevation(points[i],points[i+1],ctx);
  }
  return elevs;
}

function getElevsForChart(points, ftGap, ctx){
  var elevs = new Array(points.length/2);
  for(var i = 0, j = points.length; i<j; i+=2){
    elevs[i/2]={x:ftGap*i/2,y:getElevation(points[i],points[i+1],ctx)};
  }
  return elevs;
}


function testCache(){
  if(lastBbox !== currentBbox){
    for(var key in layerCache){
      var item = layerCache[key]
        , can = item.can
        , ctx = item.ctx
        , img = item.img
        ;
//      console.log("Returning img and can to cache!");
      ctx.clearRect(0,0,can.width,can.height)
      imgCache.reclaim(img)
      canCache.reclaim(can)
      delete layerCache[key]
    }
    lastBbox = currentBbox;
}
}


function prepare(layers){
  if(this.executing&&!layers.length){this.cb(null);}
  this.prepping = 1;
  testCache();
  for(var i=0, len=layers.length; i < len; i++){
    var id=layers[i];
    this.prepared[id] = 1;
    var cachedContext = getCanvas(id, createPrepare, this)
    if(cachedContext){
      runPrep(id, cachedContext, this);
    }
  }
}


function execute(layers,pointObj,cb){ //points is a flattened array [x0,y0,x1,y1,x2,y2,...]
  this.points = pointObj.points;
  this.ftGap = pointObj.ftGap;
  this.cb = cb;
  this.executing = 1;
  testCache();
  var prep = this.prepared;
  var that = this;
 // console.log("prepped for executing",prep)
  for(var i=0, len=layers.length; i < len; i++){
    var id = layers[i];
    if(prep[id]) continue;
    getCanvas(id, createExecute, this);
  }
//  console.log("checking for layers in prep")
  for(var layer in prep){
    //console.log(layer,prep[layer])
    if(prep[layer] !== 1){
      this.results[layer] = getElevsForChart(this.points, this.ftGap, prep[layer]);
      decLayerCount(this);
    }
  }
  if(this.prepping &&!Object.keys(prep).length){cb(null);}

  /*loop through layers, if in prepared continue, else build or pull from cache. execute from prepared.
  execute others.
  */

}


function getCanvas(layer, createOnload, that){
  //console.log("Getting canvas",arguments)
  that.layerCount++;
  var cachedContext = layerCache[layer]?layerCache[layer].ctx:null;
  if(cachedContext) return cachedContext;
  createCanvas(layer, createOnload, that);
  return false;
}



/*create a canvas that, when loaded, will do the operation 
  and spit out an object {layerid:[1:-32.2,2:-28.4, etc]}
  This means currying the point/list of points on the onload.
  HOWEVER, necessarily don't know list of points on prepare
  So instead the PREPARE onloads should put the ready contexts in a stack
  the execute onloads know everything, and can be passed the curried fn

  And yet how to signal finished, AND ensure whole stack called?
  Executing flag...
  on preparing onloads.. could check and execute rather than pushing to stack
  The "pull or build" fn also increments overlapCount
  the curried fn decrements before passing to getElevs


 okay. constructor and prototype
   bbox and current layers. hm. I think I still have to disallow dragging for now.
   current layers though... NOPE.remember you are building one query for each layer.
   you need to instead 


   heyyyyyyyo. So the cache. It's done loading... I'll need to just store the context and call
   getElevsForChart on the pnt arr and context
  */


function buildQuery(layer){
//  console.log(prefix,layer,currentBbox,suffix)
  return prefix+layer+currentBbox+suffix;
}

function decLayerCount(that){
 // console.log("decrementing",that,that.layerCount,that.results)
  that.layerCount--;
  if(that.layerCount === 0){
    that.called=1;
    that.cb(that.results);
  }
}

function runPrep(layer, ctx, that){
//  console.log("runPrep", arguments,that.executing)
  if(that.executing){
      that.results[layer] = getElevsForChart(that.points, that.ftGap, ctx);
      decLayerCount(that);
  }else{
      that.prepared[layer]=ctx;
  }
}

function createPrepare(layer, ctx, img){
 // console.log("createPrep",arguments)
  return function(){
    ctx.drawImage(img,0,0);
    runPrep(layer, ctx, this);
  }
}

function createExecute(layer, ctx, img){
  return function(){
    ctx.drawImage(img,0,0);
    this.results[layer] = getElevsForChart(this.points, this.ftGap, ctx);
    decLayerCount(this);
  }
}


function createCanvas(layer, createOnload, that){
  //console.log("creating canvas", arguments)
  var can = canCache.get()  //watch garbage.. recreate canvas/img trackers
  //console.log(can)
  var img = imgCache.get()
    //console.log(img)
  var ctx  =can.getContext('2d')
  //console.log(ctx)
  var onload = createOnload(layer, ctx, img);

  //  console.log("Created",can,img,ctx,onload)
    layerCache[layer]={ctx:ctx,can:can,img:img};
    can.width = width;
    can.height = height;
    img.onload = onload.bind(that);
    img.src = buildQuery(layer);
  //  console.log("waiting for onload");
}


function release(){
  thisCtx = null;
  for(var i=0, j=canvases.length; i<j; i++){
    var thisCan=canvases[i],thisImg=images[i];
    thisCan.getContext('2d').clearRect(0,0,thisCan.width,thisCan.height)
    canCache.reclaim(canvases[i]);
    images[i].pnt = null;
    imgCache.reclaim(images[i]);
  }
  canvases.length = 0;
  images.length = 0;
}

function task(){
  this.points=null;
  this.prepping = 0;
  this.executing = 0;
  this.layerCount = 0;
  this.prepared = {};
  this.called = 0;
  this.results ={};
}


task.prototype.prepare = prepare;
task.prototype.execute = execute;


  return {
    task:task
  }
}
});

//in crosstool
// instantiate the id tool.
// get two points.
// calculate points for full line
// identify each of these points