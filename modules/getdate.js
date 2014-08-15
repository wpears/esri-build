define([],function(){
     return function (date){
        var dte = new Date(date);
        var dst = dte.toUTCString();
        dst = dst.charAt(6)=== " "?dst.substring(0, 5)+"0"+dst.substring(5):dst; //ieFix
        return dst.slice(12, 16)+"-"+((1+dte.getUTCMonth())<10?"0"+(1+dte.getUTCMonth()):(1+dte.getUTCMonth()))+"-"+dst.slice(5, 7);
      }
});