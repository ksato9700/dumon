(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  window.Stage = (function(_super) {

    __extends(Stage, _super);

    function Stage() {
      Stage.__super__.constructor.apply(this, arguments);
    }

    Stage.prototype.initialize = function() {
      return this.scenes = [];
    };

    Stage.prototype.clear = function() {
      this.destory();
      return this.view.remove();
    };

    Stage.prototype.getDetails = function(options) {
      var success;
      options || (options = {});
      success = options.success;
      this.sync = Backbone.ajaxSync;
      return this.fetch({
        success: function(model, resp) {
          this.sync = Backbone.sync;
          model.scenes = resp;
          if (success) return success(model, resp);
        }
      });
    };

    return Stage;

  })(Backbone.Model);

  window.StageList = (function(_super) {

    __extends(StageList, _super);

    function StageList() {
      StageList.__super__.constructor.apply(this, arguments);
    }

    StageList.prototype.model = Stage;

    StageList.prototype.localStorage = new Store("stages");

    StageList.prototype.url = '/api/stages';

    StageList.prototype.comparator = function(stage) {
      return stage.get("id");
    };

    StageList.prototype.ajaxFetch = function(options) {
      var error, success,
        _this = this;
      this.sync = Backbone.ajaxSync;
      options || (options = {});
      success = options.success;
      error = options.error;
      options.success = function(collection, resp, xhr) {
        var model, _i, _len, _ref;
        _this.sync = Backbone.sync;
        _ref = _this.models;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          model.save();
        }
        if (success) return success(collection, resp, xhr);
      };
      options.error = function(collection, resp, xhr) {
        _this.sync = Backbone.sync;
        if (error) return error(collection, resp, xhr);
      };
      return this.fetch(options);
    };

    return StageList;

  })(Backbone.Collection);

  window.Stages = new StageList;

}).call(this);
