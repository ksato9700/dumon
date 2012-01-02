(function() {
  var Ball, MyGame, config,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  enchant();

  config = {
    key_init_x_velocity: 15,
    key_last_x_velocity: 10,
    init_y_velocity: 5,
    init_y_acceleration: 0.3,
    last_y_acceleration: 0.9,
    release_decay: 0.75,
    bouncing_decay: 0.4,
    device_acc_multiplier: 5
  };

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
        'x': 'x',
        0: 0,
        'y': config.init_y_acceleration
      };
      this.image = this.game.assets['/img/sp.png'];
      this.gate = true;
    }

    Ball.prototype.right = function(move) {
      if (move == null) move = 1;
      return this.velocity.x += move;
    };

    Ball.prototype.left = function(move) {
      if (move == null) move = 1;
      return this.velocity.x -= move;
    };

    Ball.prototype.up = function(move) {
      if (move == null) move = 1;
      return this.velocity.y -= move;
    };

    Ball.prototype.down = function(move) {
      if (move == null) move = 1;
      return this.velocity.y += move;
    };

    Ball.prototype.update = function() {
      var new_y, xmax, ymax;
      this.game.label_x.text = "" + this.direction;
      xmax = this.game.width;
      ymax = this.game.height;
      this.frame = (this.direction ? this.frame - 1 : this.frame + 1) % this.game.fps;
      if (this.gate && this.y >= ymax - 64) {
        this.velocity.y = -this.velocity.y * config.bouncing_decay;
        this.acceleration.y = config.last_y_acceleration;
        this.gate = false;
      } else {
        this.velocity.y += this.acceleration.y;
      }
      new_y = this.y + this.velocity.y;
      if (new_y > ymax) {
        new_y = 0;
        this.gate = true;
        this.acceleration.y = config.init_y_acceleration;
      }
      return this.moveTo(Math.max(0, Math.min(this.x + this.velocity.x, xmax - 64)), new_y);
    };

    return Ball;

  })(Sprite);

  MyGame = (function(_super) {

    __extends(MyGame, _super);

    function MyGame(width, height) {
      this.onMotion = __bind(this.onMotion, this);      MyGame.__super__.constructor.call(this, width, height);
      this.fps = 24;
      this.preload('/img/sp.png');
      addEventListener('devicemotion', this.onMotion, false);
      this.onload = function() {
        this.ball = new Ball(this);
        this.release = false;
        this.addEventListener('rightbuttondown', function(e) {
          this.release = false;
          this.ball.direction = true;
          console.log(this.ball.velocity.x);
          if (this.ball.velocity.x > 0) {
            return this.ball.velocity.x = Math.max(this.ball.velocity.x / 2, config.key_last_x_velocity);
          } else {
            return this.ball.velocity.x = config.key_init_x_velocity;
          }
        });
        this.addEventListener('rightbuttonup', function(e) {
          return this.release = true;
        });
        this.addEventListener('leftbuttondown', function(e) {
          this.ball.direction = false;
          this.release = false;
          if (this.ball.velocity.x < 0) {
            return this.ball.velocity.x = Math.min(this.ball.velocity.x / 2, -config.key_last_x_velocity);
          } else {
            return this.ball.velocity.x = -config.key_init_x_velocity;
          }
        });
        this.addEventListener('leftbuttonup', function(e) {
          return this.release = true;
        });
        this.ball.addEventListener('enterframe', function(e) {
          if (this.game.release) {
            this.velocity.x *= config.release_decay;
            this.velocity.x = Math[this.velocity.x > 0 ? "floor" : "ceil"](this.velocity.x);
          }
          return this.update();
        });
        this.rootScene.addChild(this.ball);
        this.label_x = new Label("X");
        this.rootScene.addChild(this.label_x);
        return this.rootScene.backgroundColor = 'rgb(182, 255, 255)';
      };
      this.start();
    }

    MyGame.prototype.onMotion = function(event) {
      var acc, acg, itv, rot;
      if (event) {
        this.release = false;
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
    return game = new MyGame(320, 240);
  };

}).call(this);
