define([],function(){
  return function clearNode(node){
  while(node&&node.hasChildNodes()){
    node.firstChild = null;
    node.removeChild(node.firstChild);
  }
}
});