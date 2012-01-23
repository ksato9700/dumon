(function() {
  var Answer, Ball, MyGame, Timer, Wall, config,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  enchant();

  config = {
    key_init_x_acceleration: 2.5,
    key_init_x_velocity: 2,
    key_release_decay: 0.75,
    init_y_velocity: 3,
    init_y_acceleration: 0.1,
    last_y_acceleration: 0.9,
    bouncing_decay_bottom: 0.4,
    bouncing_decay_side: 0.8,
    device_acc_multiplier: 2
  };

  Timer = (function() {

    function Timer() {
      this.reset();
    }

    Timer.prototype.reset = function() {
      return this.start = new Date();
    };

    Timer.prototype.lap = function() {
      var elapsed, mil, min, sec;
      elapsed = new Date(new Date() - this.start);
      min = elapsed.getMinutes();
      if (min < 10) min = "0" + min.toString();
      sec = elapsed.getSeconds();
      if (sec < 10) sec = "0" + sec.toString();
      mil = elapsed.getMilliseconds();
      if (mil < 10) {
        mil = "00" + mil.toString();
      } else if (mil < 100) {
        mil = "0" + mil.toString();
      }
      return "" + min + ":" + sec + "." + mil;
    };

    return Timer;

  })();

  Wall = (function(_super) {

    __extends(Wall, _super);

    function Wall(game, x, y, w, h, klass) {
      this.game = game;
      Wall.__super__.constructor.call(this, w, h);
      this.moveTo(x, y);
      this._element.className = klass;
    }

    return Wall;

  })(Sprite);

  Answer = (function(_super) {

    __extends(Answer, _super);

    function Answer(game, x, y, klass) {
      this.game = game;
      Answer.__super__.constructor.call(this, "");
      x = x - 150 + 32;
      this.moveTo(x, y);
      this._element.className = klass;
    }

    return Answer;

  })(Label);

  Ball = (function(_super) {

    __extends(Ball, _super);

    function Ball(game, label) {
      this.game = game;
      if (label == null) label = "";
      Ball.__super__.constructor.call(this, 64, 64);
      this.label = new Label(label);
      this.label.id = "ball_label";
      this.label_offset = {
        x: this.width / 2 - 150,
        y: this.width / 4
      };
      this.image = this.game.assets['img/sp.png'];
      this.full_reset();
      this.xmax = this.game.width;
      this.ymax = this.game.height;
    }

    Ball.prototype.full_reset = function() {
      this.reset();
      return this.moveTo((this.game.width - this.width) / 2, -this.height);
    };

    Ball.prototype.reset = function() {
      this.direction = true;
      this.velocity = {
        'x': 0,
        'y': config.init_y_velocity
      };
      this.acceleration = {
        'x': 0,
        'y': config.init_y_acceleration
      };
      this.release = true;
      return this.bouncing = false;
    };

    Ball.prototype.moveTo = function(x, y) {
      Ball.__super__.moveTo.call(this, x, y);
      return this.label.moveTo(x + this.label_offset.x, y + this.label_offset.y);
    };

    Ball.prototype.right = function() {
      this.release = false;
      this.direction = true;
      if (this.acceleration.x > 0) {
        return this.acceleration.x = Math.floor(this.acceleration.x / 2);
      } else {
        this.velocity.x += config.key_init_x_velocity;
        return this.acceleration.x = config.key_init_x_acceleration;
      }
    };

    Ball.prototype.left = function() {
      this.release = false;
      this.direction = false;
      if (this.acceleration.x < 0) {
        return this.acceleration.x = Math.ceil(this.acceleration.x / 2);
      } else {
        this.velocity.x -= config.key_init_x_velocity;
        return this.acceleration.x = -config.key_init_x_acceleration;
      }
    };

    Ball.prototype.update = function() {
      var new_x, new_y, target, wall_b, withins, _ref, _ref2;
      this.game.label_t.text = "" + (this.game.timer.lap());
      this.frame = (this.direction ? this.frame - 1 : this.frame + 1) % this.game.fps;
      if (this.intersect(this.game.wall_l)) {
        if (this.velocity.x < 0) {
          this.velocity.x = -this.velocity.x * config.bouncing_decay_side;
        }
      } else if (this.intersect(this.game.wall_r)) {
        if (this.velocity.x > 0) {
          this.velocity.x = -this.velocity.x * config.bouncing_decay_side;
        }
      }
      if (this.release) {
        this.acceleration.x = 0;
        this.velocity.x *= config.key_release_decay;
        this.velocity.x = Math[this.velocity.x > 0 ? "floor" : "ceil"](this.velocity.x);
        this.label._element.className = "";
      } else {
        this.velocity.x += this.acceleration.x;
      }
      withins = (function() {
        var _i, _len, _ref, _results;
        _ref = this.game.wall_bs;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          wall_b = _ref[_i];
          _results.push(this.within(wall_b));
        }
        return _results;
      }).call(this);
      if (withins.reduce(function(x, y) {
        return x || y;
      })) {
        this.label._element.className = "bang";
        this.bouncing = true;
        this.velocity.y = -this.velocity.y * config.bouncing_decay_bottom;
        this.acceleration.y = config.last_y_acceleration;
        if ((0 < (_ref = this.x) && _ref <= 80)) {
          target = 32;
        } else if ((80 < (_ref2 = this.x) && _ref2 <= 176)) {
          target = 128;
        } else {
          target = 224;
        }
        this.velocity.x = (target - this.x) / 3.0;
        this.velocity.x = Math[this.velocity.x > 0 ? "ceil" : "floor"](this.velocity.x);
      } else {
        this.velocity.y += this.acceleration.y;
      }
      this.velocity.y = Math.min(this.velocity.y, 20);
      new_y = this.y + this.velocity.y;
      if (new_y >= this.ymax) {
        if (this.game.check((this.x - 32) / 96)) {
          this.full_reset();
          return this.game.next();
        } else {
          this.reset();
          this.velocity.y = -13;
          return this.acceleration.y = 0.3;
        }
      } else {
        new_x = Math.round(this.x + this.velocity.x);
        return this.moveTo(new_x, new_y);
      }
    };

    return Ball;

  })(Sprite);

  MyGame = (function(_super) {

    __extends(MyGame, _super);

    function MyGame(width, height) {
      this.onMotion = __bind(this.onMotion, this);      Sound.enabledInMobileSafari = true;
      MyGame.__super__.constructor.call(this, width, height);
      this.timer = new Timer();
      this.fps = 24;
      addEventListener('devicemotion', this.onMotion, false);
      this.preload('img/sp.png');
      this.scene = 0;
      this.onload = function() {
        var answer, id, wall_b, x, _i, _j, _len, _len2, _ref, _ref2,
          _this = this;
        this.ball = new Ball(this, "");
        this.wall_bs = (function() {
          var _results;
          _results = [];
          for (x = 0; x <= 3; x++) {
            _results.push(new Wall(this, x * 96, height - 32, 32, 32, "wall_bottom"));
          }
          return _results;
        }).call(this);
        this.wall_l = new Wall(this, 0, 0, 5, height - 32, "wall_side");
        this.wall_r = new Wall(this, width - 5, 0, 5, height - 32, "wall_side");
        this.answers = (function() {
          var _results;
          _results = [];
          for (x = 0; x <= 2; x++) {
            _results.push(new Answer(this, x * 96 + 32, height - 32, "answers"));
          }
          return _results;
        }).call(this);
        this.addEventListener('rightbuttondown', function(e) {
          return this.ball.right();
        });
        this.addEventListener('rightbuttonup', function(e) {
          return this.ball.release = true;
        });
        this.addEventListener('leftbuttondown', function(e) {
          return this.ball.left();
        });
        this.addEventListener('leftbuttonup', function(e) {
          return this.ball.release = true;
        });
        this.ball.addEventListener('enterframe', function(e) {
          return this.update();
        });
        this.rootScene.addChild(this.ball);
        this.rootScene.addChild(this.ball.label);
        _ref = this.wall_bs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          wall_b = _ref[_i];
          this.rootScene.addChild(wall_b);
        }
        this.rootScene.addChild(this.wall_l);
        this.rootScene.addChild(this.wall_r);
        _ref2 = this.answers;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          answer = _ref2[_j];
          this.rootScene.addChild(answer);
        }
        this.label_p = new Label("Progress");
        this.label_p.x = 20;
        this.rootScene.addChild(this.label_p);
        this.label_t = new Label("Time");
        this.label_t.x = 60;
        this.rootScene.addChild(this.label_t);
        this.rootScene.backgroundColor = 'AliceBlue';
        id = location.hash.replace("#", "");
        console.log(id);
        return Stages.ajaxFetch({
          success: function() {
            var model;
            model = Stages.get(id);
            return model.getDetails({
              success: function(model, resp) {
                _this.scenes = model.scenes;
                return _this.next();
              }
            });
          }
        });
      };
      this.start();
    }

    MyGame.prototype.onMotion = function(event) {
      var acc, acg, itv, rot;
      if (event) {
        acc = event.acceleration;
        acg = event.accelerationIncludingGravity;
        rot = event.rotationRate;
        itv = event.interval;
        if (!this.ball.bouncing) {
          this.ball.velocity.x = acg.x * config.device_acc_multiplier;
          if (acg.x > 0) {
            return this.ball.direction = true;
          } else {
            return this.ball.direction = false;
          }
        }
      }
    };

    MyGame.prototype.check = function(answer) {
      return answer === this.answer;
    };

    MyGame.prototype.next = function() {
      var i, s;
      s = this.scenes[this.scene];
      if (s === void 0) {
        return this.stop();
      } else {
        this.ball.label.text = s.question;
        for (i = 0; i <= 2; i++) {
          this.answers[i].text = s.answers[i];
        }
        this.answer = s.answer;
        this.scene += 1;
        this.label_p.text = "" + this.scene + "/" + this.scenes.length;
        return false;
      }
    };

    return MyGame;

  })(Game);

  window.onload = function() {
    var game;
    return game = new MyGame(320, 320);
  };

}).call(this);
