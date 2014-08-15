define([],function(){  
  return function (map,arr){
    var mg = map.graphics;
    for(var i = 0, j = arr.length;i<j;i++)
      mg.remove(arr[i]);
  }
});