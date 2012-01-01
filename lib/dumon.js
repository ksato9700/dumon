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
      this.vector = {
        'x': 0,
        'y': 0
      };
      this.image = this.game.assets['/img/sp.png'];
    }

    Ball.prototype.right = function(move) {
      if (move == null) move = 1;
      return this.vector.x += move;
    };

    Ball.prototype.left = function(move) {
      if (move == null) move = 1;
      return this.vector.x -= move;
    };

    Ball.prototype.up = function(move) {
      if (move == null) move = 1;
      return this.vector.y -= move;
    };

    Ball.prototype.down = function(move) {
      if (move == null) move = 1;
      return this.vector.y += move;
    };

    Ball.prototype.update = function(xmax, ymax) {
      this.x = Math.max(0, Math.min(this.x + this.vector.x, xmax - 64));
      return this.y = (Math.max(0, this.y + this.vector.y)) % ymax;
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
        this.direction = true;
        this.ball = new Ball(this);
        this.ball.down(5);
        this.ball.addEventListener('enterframe', function(e) {
          if (this.game.input.right) this.right();
          if (this.game.input.left) this.left();
          if (this.game.input.up) this.game.direction = true;
          if (this.game.input.down) this.game.direction = false;
          this.update(width, height);
          if (this.game.direction) {
            this.game.i++;
          } else {
            this.game.i--;
          }
          return this.frame = this.game.i % 24;
        });
        this.rootScene.addChild(this.ball);
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
        return this.ball.vector.x = acg.x * 15;
      }
    };

    return MyGame;

  })(Game);

  window.onload = function() {
    var game;
    return game = new MyGame(320, 240);
  };

}).call(this);
