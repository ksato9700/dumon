(function() {
  var Ball, MyGame,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  enchant();

  Ball = (function(_super) {

    __extends(Ball, _super);

    function Ball(game) {
      this.game = game;
      Ball.__super__.constructor.call(this, 64, 64);
      this.x = 32;
      this.y = 32;
      this.velocity = {
        'x': 0,
        'y': 0
      };
      this.image = this.game.assets['/img/sp.png'];
      console.log(this);
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

    Ball.prototype.update = function(xmax, ymax) {
      return this.moveTo(Math.max(0, Math.min(this.x + this.velocity.x, xmax - 64)), (Math.max(0, this.y + this.velocity.y)) % ymax);
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
        this.i = 0;
        this.ball = new Ball(this);
        this.ball.down(5);
        this.release = false;
        this.addEventListener('rightbuttondown', function(e) {
          this.release = false;
          this.direction = true;
          if (this.ball.velocity.x > 0) {
            return this.ball.velocity.x = Math.max(this.ball.velocity.x / 2, 10);
          } else {
            return this.ball.velocity.x = 15;
          }
        });
        this.addEventListener('rightbuttonup', function(e) {
          return this.release = true;
        });
        this.addEventListener('leftbuttondown', function(e) {
          this.direction = false;
          this.release = false;
          if (this.ball.velocity.x < 0) {
            return this.ball.velocity.x = Math.min(this.ball.velocity.x / 2, -10);
          } else {
            return this.ball.velocity.x = -15;
          }
        });
        this.addEventListener('leftbuttonup', function(e) {
          return this.release = true;
        });
        this.ball.addEventListener('enterframe', function(e) {
          if (this.game.release) {
            this.velocity.x *= 0.75;
            this.velocity.x = Math[this.velocity.x > 0 ? "floor" : "ceil"](this.velocity.x);
          }
          this.update(width, height);
          if (this.game.direction) {
            this.game.i--;
          } else {
            this.game.i++;
          }
          return this.frame = this.game.i % 24;
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
        this.ball.velocity.x = acg.x * 15;
        if (acg.x > 0) {
          this.direction = true;
        } else {
          this.direction = false;
        }
        return this.label_x.text = "" + this.direction;
      }
    };

    return MyGame;

  })(Game);

  window.onload = function() {
    var game;
    return game = new MyGame(320, 240);
  };

}).call(this);
