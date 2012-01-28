(function() {
  var Answer, Area, Ball, MyGame, Timer, Wall, config,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  enchant();

  config = {
    key_init_acceleration: 2.5,
    key_init_velocity: 2,
    key_release_decay: 0.98,
    last_y_acceleration: 0.0,
    bouncing_decay: 0.8,
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

  Area = (function() {

    function Area(game, idx, x, y, width, height) {
      this.game = game;
      this.idx = idx;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }

    return Area;

  })();

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
    }

    Ball.prototype.full_reset = function() {
      this.reset();
      return this.moveTo((this.game.width - this.width) / 2, (this.game.height - this.height) / 2);
    };

    Ball.prototype.reset = function() {
      this.direction = true;
      this.velocity = {
        'x': 0,
        'y': 0
      };
      this.acceleration = {
        'x': 0,
        'y': 0
      };
      this.release = true;
      return this.bouncing = false;
    };

    Ball.prototype.moveTo = function(x, y) {
      Ball.__super__.moveTo.call(this, x, y);
      return this.label.moveTo(x + this.label_offset.x, y + this.label_offset.y);
    };

    Ball.prototype.down = function() {
      this.release = false;
      if (this.acceleration.y > 0) {
        return this.acceleration.y = Math.floor(this.acceleration.y / 2);
      } else {
        this.velocity.y += config.key_init_velocity;
        return this.acceleration.y = config.key_init_acceleration;
      }
    };

    Ball.prototype.up = function() {
      this.release = false;
      if (this.acceleration.y < 0) {
        return this.acceleration.y = Math.ceil(this.acceleration.y / 2);
      } else {
        this.velocity.y -= config.key_init_velocity;
        return this.acceleration.y = -config.key_init_acceleration;
      }
    };

    Ball.prototype.right = function() {
      this.release = false;
      this.direction = true;
      if (this.acceleration.x > 0) {
        return this.acceleration.x = Math.floor(this.acceleration.x / 2);
      } else {
        this.velocity.x += config.key_init_velocity;
        return this.acceleration.x = config.key_init_acceleration;
      }
    };

    Ball.prototype.left = function() {
      this.release = false;
      this.direction = false;
      if (this.acceleration.x < 0) {
        return this.acceleration.x = Math.ceil(this.acceleration.x / 2);
      } else {
        this.velocity.x -= config.key_init_velocity;
        return this.acceleration.x = -config.key_init_acceleration;
      }
    };

    Ball.prototype.update = function() {
      var area, new_x, new_y, _i, _len, _ref;
      this.game.label_t.text = "" + (this.game.timer.lap());
      this.frame = (this.direction ? this.frame - 1 : this.frame + 1) % this.game.fps;
      if (this.intersect(this.game.wall_l)) {
        if (this.velocity.x < 0) {
          this.velocity.x = -this.velocity.x * config.bouncing_decay;
        }
      } else if (this.intersect(this.game.wall_r)) {
        if (this.velocity.x > 0) {
          this.velocity.x = -this.velocity.x * config.bouncing_decay;
        }
      } else if (this.intersect(this.game.wall_t)) {
        if (this.velocity.y < 0) {
          this.velocity.y = -this.velocity.y * config.bouncing_decay;
        }
      } else if (this.intersect(this.game.wall_b)) {
        if (this.velocity.y > 0) {
          this.velocity.y = -this.velocity.y * config.bouncing_decay;
        }
      }
      if (this.release) {
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        _ref = this.game.areas;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          area = _ref[_i];
          if (this.within(area)) {
            this.velocity.x += (area.x - this.x) / 24;
            this.velocity.y += (area.y - this.y) / 24;
          }
        }
        this.velocity.x *= config.key_release_decay;
        this.velocity.x = Math[this.velocity.x > 0 ? "floor" : "ceil"](this.velocity.x);
        this.velocity.y *= config.key_release_decay;
        this.velocity.y = Math[this.velocity.y > 0 ? "floor" : "ceil"](this.velocity.y);
      } else {
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
      }
      new_x = Math.round(this.x + this.velocity.x);
      new_y = Math.round(this.y + this.velocity.y);
      return this.moveTo(new_x, new_y);
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
        var answer, id, x, _i, _len, _ref,
          _this = this;
        this.ball = new Ball(this, "");
        this.areas = [new Area(this, 0, this.width / 2, -80, 160, 160), new Area(this, 1, -80, this.height - 80, 160, 160), new Area(this, 2, this.width - 80, this.height - 80, 160, 160)];
        this.wall_l = new Wall(this, 0, 0, 5, height, "wall_side");
        this.wall_r = new Wall(this, width - 5, 0, 5, height, "wall_side");
        this.wall_t = new Wall(this, 0, 0, width, 5, "wall_side");
        this.wall_b = new Wall(this, 0, height - 5, width, 5, "wall_side");
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
        this.addEventListener('upbuttondown', function(e) {
          return this.ball.up();
        });
        this.addEventListener('upbuttonup', function(e) {
          return this.ball.release = true;
        });
        this.addEventListener('downbuttondown', function(e) {
          return this.ball.down();
        });
        this.addEventListener('downbuttonup', function(e) {
          return this.ball.release = true;
        });
        this.ball.addEventListener('enterframe', function(e) {
          return this.update();
        });
        this.rootScene.addChild(this.ball);
        this.rootScene.addChild(this.ball.label);
        this.rootScene.addChild(this.wall_l);
        this.rootScene.addChild(this.wall_r);
        this.rootScene.addChild(this.wall_t);
        this.rootScene.addChild(this.wall_b);
        _ref = this.answers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          answer = _ref[_i];
          this.rootScene.addChild(answer);
        }
        this.label_p = new Label("");
        this.label_p.x = 20;
        this.label_p.y = 10;
        this.rootScene.addChild(this.label_p);
        this.label_t = new Label("Time");
        this.label_t.x = 60;
        this.label_t.y = 10;
        this.rootScene.addChild(this.label_t);
        this.rootScene.backgroundColor = 'AliceBlue';
        id = location.hash.replace("#", "");
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
          this.ball.velocity.y = acg.y * config.device_acc_multiplier;
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
