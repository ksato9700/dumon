enchant()

class Ball extends Sprite
  constructor: (@game) ->
    super 64,64
    @x = 32;
    @y = 32;
    @vector = {'x': 0, 'y': 0}
    @image = @game.assets['/img/sp.png']

  right: (move=1)->
    @vector.x += move

  left: (move=1)->
    @vector.x -= move

  up: (move=1)->
    @vector.y -= move

  down: (move=1)->
    @vector.y += move

  update: (xmax,ymax) ->
    @x = (@x+@vector.x) % xmax
    @y = (@y+@vector.y) % ymax

class MyGame extends Game
  constructor: (width, height)->
    super width, height

    @fps = 24
    @preload  '/img/sp.png'

    @onload = ->
      @i = 0
      @direction = true
      @ball = new Ball (@)
      @ball.down(5)
      @ball.addEventListener 'enterframe', (e)->
        if @game.input.right
          @right()
        if @game.input.left
          @left()
        if @game.input.up
          @game.direction = true
        if @game.input.down
          @game.direction = false

        @update width, height

        if @game.direction
          @game.i++
        else
          @game.i--

        @frame = @game.i % 24

      @rootScene.addChild @ball
      @rootScene.backgroundColor = 'rgb(182, 255, 255)'

    @start()

window.onload = ->
  game = new MyGame 320, 240

