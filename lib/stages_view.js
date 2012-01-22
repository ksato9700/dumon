(function() {
  var _tableheads,
    __hasProp = Object.prototype.hasOwnProperty,
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

  _tableheads = {
    "clock": "<tr><th>#</th><th>背景</th><th>BGM</th><th>落ち物</th><th>箱</th></tr>",
    "multichoice": "<tr><th>#</th><th>問題</th><th>選択肢</th><th>答え</th></tr>"
  };

  window.StageView = (function(_super) {

    __extends(StageView, _super);

    function StageView() {
      StageView.__super__.constructor.apply(this, arguments);
    }

    StageView.prototype.tagName = "li";

    StageView.prototype.template = _.template($('#item-template').html());

    StageView.prototype.initialize = function() {
      _.bindAll(this, 'render', 'close');
      this.model.bind('change', this.render);
      this.model.view = this;
      return this.s_template = _.template($('#scene-template-' + ("" + this.model.attributes.format)).html());
    };

    StageView.prototype.render = function() {
      var scene, _i, _len, _ref;
      $(this.el).html(this.template(this.model.toJSON()));
      this.setTitle();
      if (this.model.scenes.length > 0) {
        $("#scenes").empty();
        $("#scenes").append($(_tableheads[this.model.attributes.format]));
        _ref = this.model.scenes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          scene = _ref[_i];
          $("#scenes").append(this.s_template(scene));
        }
      }
      return this;
    };

    StageView.prototype.close = function() {
      return console.log(">>close", this);
    };

    StageView.prototype.setTitle = function() {
      var el_title;
      el_title = this.$('.stage-title');
      el_title.text(this.model.get('title'));
      el_title.attr("id", this.model.id);
      return el_title.append($("<span/>").addClass("label success").text("New"));
    };

    return StageView;

  })(Backbone.View);

  window.AppView = (function(_super) {

    __extends(AppView, _super);

    function AppView() {
      AppView.__super__.constructor.apply(this, arguments);
    }

    AppView.prototype.el = $("#stageapp");

    AppView.prototype.events = {
      "click .stage-title": "showDetails"
    };

    AppView.prototype.showDetails = function(event) {
      var id, model;
      id = $(event.target).attr("id");
      model = Stages.get(id);
      return model.getDetails({
        success: function(model, resp) {
          return model.view.render();
        }
      });
    };

    AppView.prototype.initialize = function() {
      _.bindAll(this, 'addOne', 'addAll', 'render');
      this.input = this.$("#new-todo");
      Stages.bind('add', this.addOne);
      Stages.bind('reset', this.addAll);
      Stages.bind('all', this.render);
      return Stages.ajaxFetch();
    };

    AppView.prototype.render = function() {};

    AppView.prototype.addOne = function(stage) {
      var view;
      view = new StageView({
        model: stage
      });
      return this.$("#stage-list").append(view.render().el);
    };

    AppView.prototype.addAll = function() {
      return Stages.each(this.addOne);
    };

    return AppView;

  })(Backbone.View);

  window.App = new AppView;

}).call(this);
