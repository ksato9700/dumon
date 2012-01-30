(function() {
  var Answer, Ball, MyGame, Timer, Wall, config, touch_init_velocity,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  enchant();

  config = {
    key_init_acceleration: 2.5,
    key_init_velocity: 10,
    key_release_decay: 1.0,
    touch_init_velocity: 5,
    area_decay: 0.4,
    bouncing_decay: 1,
    opacity_decay: 0.8
  };

  touch_init_velocity = function(x) {
    if (x > 0) {
      return config.touch_init_velocity;
    } else {
      return -config.touch_init_velocity;
    }
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

    function Answer(game, idx, x, y, w, h) {
      this.game = game;
      this.idx = idx;
      this.x = x;
      this.y = y;
      Answer.__super__.constructor.call(this, w, h);
      this.moveTo(x, y);
      this._element.className = "circle";
    }

    Answer.prototype.set_text = function(text) {
      return this._element.innerHTML = text;
    };

    return Answer;

  })(Sprite);

  Ball = (function(_super) {

    __extends(Ball, _super);

    function Ball(game, label) {
      this.game = game;
      if (label == null) label = "";
      Ball.__super__.constructor.call(this, 64, 64);
      this.label = new Label(label);
      this.label.id = "ball_label";
      this.label.ball = this;
      this.label_offset = {
        x: this.width / 2 - 150,
        y: this.height / 8
      };
      this.image = this.game.assets['img/sp.png'];
      this.full_reset();
    }

    Ball.prototype.full_reset = function() {
      this.reset();
      return this.moveTo((this.game.width - this.width) / 2, (this.game.height - this.height) / 2 + 16);
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
      this.opacity = 1.0;
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

    Ball.prototype.touch = function(event, type) {
      var frames;
      if (type === 'start') {
        return this.touch_start = {
          x: event.x,
          y: event.y,
          frame: this.game.frame
        };
      } else {
        frames = this.game.frame - this.touch_start.frame + 1;
        this.velocity.x = (event.x - this.touch_start.x) / frames;
        this.velocity.y = (event.y - this.touch_start.y) / frames;
        this.velocity.x += touch_init_velocity(this.velocity.x);
        this.velocity.y += touch_init_velocity(this.velocity.y);
        this.wrong_answer = false;
        return this.in_escape = true;
      }
    };

    Ball.prototype.in_area = function(area) {
      if (this.x === area.x && this.y === area.y) {
        if (this.game.check(area.idx)) {
          this.velocity.x = 0;
          this.velocity.y = 0;
          return this.opacity = 0.99;
        } else {
          this.velocity.x = 1;
          this.velocity.y = 1;
          return this.wrong_answer = true;
        }
      } else {
        this.velocity.x = this.velocity.x * config.area_decay + (area.x - this.x);
        return this.velocity.y = this.velocity.y * config.area_decay + (area.y - this.y);
      }
    };

    Ball.prototype.update = function() {
      var area, new_x, new_y, still_in_area, _i, _len, _ref;
      this.game.label_t.text = "" + (this.game.timer.lap());
      this.frame = (this.direction ? this.frame - 1 : this.frame + 1) % this.game.fps;
      if (this.opacity < 1.0) {
        this.opacity *= config.opacity_decay;
        if (this.opacity < 0.01) {
          this.game.next();
          this.full_reset();
        }
        return;
      }
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
      if (this.wrong_answer) {
        this.velocity.x = -this.velocity.x;
        this.velocity.y = -this.velocity.y;
      } else if (this.release) {
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        still_in_area = false;
        _ref = this.game.answers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          area = _ref[_i];
          if (this.within(area, 32)) {
            if (!this.in_escape) this.in_area(area);
            still_in_area = true;
          }
        }
        if (!still_in_area) this.in_escape = false;
        this.velocity.x *= config.key_release_decay;
        this.velocity.y *= config.key_release_decay;
        this.velocity.x = Math[this.velocity.x > 0 ? "floor" : "ceil"](this.velocity.x);
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
      Sound.enabledInMobileSafari = true;
      MyGame.__super__.constructor.call(this, width, height);
      this.timer = new Timer();
      this.fps = 24;
      this.preload('img/sp.png');
      this.scene = 0;
      this.onload = function() {
        var answer, id, _i, _len, _ref,
          _this = this;
        this.ball = new Ball(this, "");
        this.answers = [new Answer(this, 0, this.width / 2 - 32, 32, 64, 64), new Answer(this, 1, 32, this.height - 96, 64, 64), new Answer(this, 2, this.width - 96, this.height - 96, 64, 64)];
        this.wall_l = new Wall(this, 0, 0, 5, height, "wall_side");
        this.wall_r = new Wall(this, width - 5, 0, 5, height, "wall_side");
        this.wall_t = new Wall(this, 0, 0, width, 5, "wall_side");
        this.wall_b = new Wall(this, 0, height - 5, width, 5, "wall_side");
        _ref = this.answers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          answer = _ref[_i];
          this.rootScene.addChild(answer);
        }
        this.rootScene.addChild(this.ball);
        this.rootScene.addChild(this.ball.label);
        this.rootScene.addChild(this.wall_l);
        this.rootScene.addChild(this.wall_r);
        this.rootScene.addChild(this.wall_t);
        this.rootScene.addChild(this.wall_b);
        this.addEventListener('rightbuttondown', function(e) {
          this.ball.wrong_answer = false;
          return this.ball.right();
        });
        this.addEventListener('rightbuttonup', function(e) {
          this.ball.release = true;
          return this.ball.in_escape = true;
        });
        this.addEventListener('leftbuttondown', function(e) {
          this.ball.wrong_answer = false;
          return this.ball.left();
        });
        this.addEventListener('leftbuttonup', function(e) {
          this.ball.release = true;
          return this.ball.in_escape = true;
        });
        this.addEventListener('upbuttondown', function(e) {
          this.ball.wrong_answer = false;
          return this.ball.up();
        });
        this.addEventListener('upbuttonup', function(e) {
          this.ball.release = true;
          return this.ball.in_escape = true;
        });
        this.addEventListener('downbuttondown', function(e) {
          this.ball.wrong_answer = false;
          return this.ball.down();
        });
        this.addEventListener('downbuttonup', function(e) {
          this.ball.release = true;
          return this.ball.in_escape = true;
        });
        this.ball.addEventListener('enterframe', function(e) {
          return this.update();
        });
        this.ball.label.addEventListener('touchstart', function(e) {
          return this.ball.touch(e, 'start');
        });
        this.ball.label.addEventListener('touchend', function(e) {
          return this.ball.touch(e, 'end');
        });
        this.ball.addEventListener('touchstart', function(e) {
          return this.touch(e, 'start');
        });
        this.ball.addEventListener('touchend', function(e) {
          return this.touch(e, 'end');
        });
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

    MyGame.prototype.check = function(answer) {
      return answer === this.answer;
    };

    MyGame.prototype.next = function() {
      var i, s;
      s = this.scenes[this.scene];
      if (s === void 0) {
        return this.stop();
      } else {
        for (i = 0; i <= 2; i++) {
          this.answers[i].set_text(s.answers[i]);
        }
        this.answer = s.answer;
        this.ball.label.text = s.question;
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
