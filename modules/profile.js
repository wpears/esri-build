var profile = (function(){
    return {
        resourceTags: {
            copyOnly: function(filename, mid){
              var list = {
                "modules/package.json":          1,
                "modules/profile.js":            1,
                "modules/modules.js":            1
              };
              return (mid in list);
            },
            amd: function(filename, mid) {
                return /\.js$/.test(filename);
            }
        }
    };
})();