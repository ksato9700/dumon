(function() {
  var Ball, MyGame, Wall, config,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  enchant();

  config = {
    key_init_x_acceleration: 2.5,
    key_init_x_velocity: 2,
    key_release_decay: 0.75,
    init_y_velocity: 5,
    init_y_acceleration: 0.3,
    last_y_acceleration: 0.9,
    bouncing_decay_bottom: 0.4,
    bouncing_decay_side: 0.8,
    device_acc_multiplier: 5
  };

  Wall = (function(_super) {

    __extends(Wall, _super);

    function Wall(game, x, y, w, h, image) {
      this.game = game;
      Wall.__super__.constructor.call(this, w, h);
      this.moveTo(x, y);
      this.image = this.game.assets[image];
    }

    return Wall;

  })(Sprite);

  Ball = (function(_super) {

    __extends(Ball, _super);

    function Ball(game) {
      this.game = game;
      Ball.__super__.constructor.call(this, 64, 64);
      this.moveTo(32, 32);
      this.direction = true;
      this.velocity = {
        'x': 0,
        'y': config.init_y_velocity
      };
      this.acceleration = {
        'x': 0,
        'y': config.init_y_acceleration
      };
      this.image = this.game.assets['/img/sp.png'];
      this.s1 = this.game.assets['/sound/s1.mp3'];
      this.release = false;
    }

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
      var new_y, wall_b, withins, xmax, ymax;
      this.game.label_x.text = "" + this.direction;
      xmax = this.game.width;
      ymax = this.game.height;
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
      console.log(withins);
      if (withins.reduce(function(x, y) {
        return x || y;
      })) {
        this.velocity.y = -this.velocity.y * config.bouncing_decay_bottom;
        this.acceleration.y = config.last_y_acceleration;
      } else {
        this.velocity.y += this.acceleration.y;
      }
      this.velocity.y = Math.min(this.velocity.y, 20);
      new_y = this.y + this.velocity.y;
      if (new_y >= ymax) {
        new_y = 0;
        this.acceleration.y = config.init_y_acceleration;
      }
      return this.moveTo(this.x + this.velocity.x, new_y);
    };

    return Ball;

  })(Sprite);

  MyGame = (function(_super) {

    __extends(MyGame, _super);

    function MyGame(width, height) {
      this.onMotion = __bind(this.onMotion, this);      MyGame.__super__.constructor.call(this, width, height);
      this.fps = 24;
      this.preload('/img/sp.png');
      this.preload('/img/sidewall.png');
      this.preload('/img/map.png');
      this.preload('/sound/s1.mp3');
      addEventListener('devicemotion', this.onMotion, false);
      this.onload = function() {
        var wall_b, x, _i, _len, _ref;
        this.ball = new Ball(this);
        this.wall_bs = (function() {
          var _i, _len, _ref, _results;
          _ref = [0, 96, 192, 288];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            x = _ref[_i];
            _results.push(new Wall(this, x, height - 16, 16, 16, '/img/map.png'));
          }
          return _results;
        }).call(this);
        this.wall_l = new Wall(this, 0, 0, 5, height, '/img/sidewall.png');
        this.wall_r = new Wall(this, width - 5, 0, 5, height, '/img/sidewall.png');
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
        _ref = this.wall_bs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          wall_b = _ref[_i];
          this.rootScene.addChild(wall_b);
        }
        this.rootScene.addChild(this.wall_l);
        this.rootScene.addChild(this.wall_r);
        this.label_x = new Label("X");
        this.label_x.x = 20;
        this.rootScene.addChild(this.label_x);
        return this.rootScene.backgroundColor = 'rgb(182, 255, 255)';
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
        this.ball.velocity.x = acg.x * config.device_acc_multiplier;
        if (acg.x > 0) {
          return this.ball.direction = true;
        } else {
          return this.ball.direction = false;
        }
      }
    };

    return MyGame;

  })(Game);

  window.onload = function() {
    var game;
    return game = new MyGame(320, 320);
  };

}).call(this);
