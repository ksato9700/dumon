(function() {
  var _jpnamemap;

  _jpnamemap = {
    "bkft": "朝",
    "lnch": "昼",
    "dinr": "晩"
  };

  window.bgname = function(name) {
    var from, ret, to;
    ret = name.split('_').slice(1).join("/");
    for (from in _jpnamemap) {
      to = _jpnamemap[from];
      ret = ret.replace(from, to);
    }
    return ret;
  };

  window.hrname = function(name) {
    var jname;
    jname = _jpnamemap[name.slice(0, 4)];
    return jname || name;
  };

  window.mtname = window.hrname;

}).call(this);
