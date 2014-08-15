// O(1) but doesn't preserve order 
define([],function(){
  return function splice(arr,index){
    var newLen = arr.length-1;
    arr[index] = arr[newLen];
    arr.length = newLen;
    return arr;
  }
});