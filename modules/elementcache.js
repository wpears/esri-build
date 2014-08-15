define([],function(){
  return function(element,amount){
     var cache=[]
       , pointer = 0
       , doc = document
       ;

    function get(){
      var el;
      //console.log("getting from elcache",pointer,cache,cache.length)
      if(pointer === cache.length){
        //console.log("Equal, creating anew")
        el = doc.createElement(element);
      }else{
        //console.log("Unequal",cache[pointer],"being returned")
        el = cache[pointer]
        cache[pointer] = null;
        pointer++;
        if(pointer === cache.length){
          cache.length = 0;
          pointer = 0;
        }
      }
      //console.log("returning",el,pointer,cache,cache.length)
      return el
    }

    function reclaim(el){
      //console.log("reclaiming", pointer, cache, cache.length)
      cache[cache.length] = el;
      //console.log("reclaimed",pointer,cache,cache.length)
    }

    return {
      get:get,
      reclaim:reclaim
    }
  }
});