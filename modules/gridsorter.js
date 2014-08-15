define(["dojo/dom-class"],function(domClass){
  return function(renderer){

    var nameSorted = 0
      , dateSorted = 1
      , headerNodes = document.getElementById("gridNode-header").firstChild.children
      ;



    function dateSortSeq(a, b){
      return a.__Date-b.__Date
    }

    function dateSortInv(a, b){
      return b.__Date-a.__Date
    }

    function nameSortSeq(a, b){
      if(a.Project===b.Project)return dateSortSeq(a,b);
      return a.Project>b.Project?1:-1
    }

    function nameSortInv(a, b){
      if(a.Project===b.Project)return dateSortSeq(a,b);
      return a.Project>b.Project?-1:1
    }



    function nameSortEffects(){
      dateSorted = 0;
      domClass.add(headerNodes[0], "sortTarget");
      domClass.remove(headerNodes[1], "sortTarget");
    }

    function dateSortEffects(){
      nameSorted = 0;
      domClass.add(headerNodes[1], "sortTarget");
      domClass.remove(headerNodes[0], "sortTarget");
    }

   


    function ascendingName(){
      renderer(nameSortSeq);
      nameSorted = 1;
      nameSortEffects();
    }

    function runNameSort(){
      if(nameSorted>0){
        renderer(nameSortInv);
        nameSorted = -1;
      }else{
        renderer(nameSortSeq);
        nameSorted = 1;
      }
      nameSortEffects();
    }

    function runDateSort(){
      if(dateSorted>0){
        renderer(dateSortInv);
        dateSorted = -1;
      }else{
        renderer(dateSortSeq);
        dateSorted = 1;
      }
      dateSortEffects();
    }



    return {
      date:runDateSort,
      name:runNameSort,
      ascendingName:ascendingName
    }
  }
});