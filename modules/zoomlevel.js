define([],function(){
  var previousLevel = 8;
  return {
    get:function(){return previousLevel},
    set:function(level){return previousLevel=level}
  }
})