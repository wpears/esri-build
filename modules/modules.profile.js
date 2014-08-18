var profile = (function(){
    var jsRe = /\.js$/i;

    var testResource = function(filename, mid){return false;}
    
    var copyOnly = function(filename, mid){
              var list = {
                "modules/package.json":          1,
                "modules/modules.profile.js":    1,
                "modules/modules.js":            1
              };
              return (mid in list);
            };

    return {
        resourceTags: {
            test: function(filename, mid){
                return testResource(filename, mid);
            },
            copyOnly: function(filename, mid){
                return copyOnly(filename, mid);
            },
            amd: function(filename, mid) {
                return jsRe.test(filename) && !copyOnly(filename, mid);
            }
        }
    };
})();