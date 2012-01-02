enchant()

class Ball extends Sprite
  constructor: (@game) ->
    super 64,64
    @x = 32
    @y = 32
    @velocity = {'x': 0, 'y': 0}
    @acceleration = {'x', 0, 'y': 0.3}
    @image = @game.assets['/img/sp.png']

    @gate = true

  right: (move=1)->
    @velocity.x += move

  left: (move=1)->
    @velocity.x -= move

  up: (move=1)->
    @velocity.y -= move

  down: (move=1)->
    @velocity.y += move

  update: (xmax,ymax) ->
    if @gate and @y >= ymax-64
      @velocity.y = - @velocity.y * 0.4
      @acceleration.y = 0.7
      @gate = false

    else
      @velocity.y += @acceleration.y

    new_y = @y+@velocity.y
    if new_y > ymax
      new_y = 0
      @gate = true
      @acceleration.y = 0.3

    @moveTo (Math.max 0, Math.min @x+@velocity.x, xmax-64), new_y


class MyGame extends Game
  constructor: (width, height)->
    super width, height

    @fps = 24
    @preload  '/img/sp.png'

    addEventListener 'devicemotion', @onMotion, false

    @onload = ->
      @i = 0
      @ball = new Ball (@)
      @ball.down(5)
      @direction = true

      @release = false
      @addEventListener 'rightbuttondown', (e)->
        @release = false
        @direction = true
        if @ball.velocity.x > 0
          @ball.velocity.x = Math.max @ball.velocity.x/2, 10
        else
          @ball.velocity.x = 15

      @addEventListener 'rightbuttonup', (e)->
        @release = true
        #@ball.velocity.x = 0

      @addEventListener 'leftbuttondown', (e)->
        @direction = false
        @release = false
        if @ball.velocity.x < 0
          @ball.velocity.x = Math.min @ball.velocity.x/2, -10
        else
          @ball.velocity.x = -15

      @addEventListener 'leftbuttonup', (e)->
        @release = true
        #@ball.velocity.x = 0

      @ball.addEventListener 'enterframe', (e)->
        if @game.release
          @velocity.x *= 0.75
          @velocity.x = Math[if @velocity.x>0 then "floor" else "ceil"] @velocity.x

        @update width, height

        @game.label_x.text = "#{@game.direction}"
        if @game.direction
          @game.i--
        else
          @game.i++

        @frame = @game.i % 24

      @rootScene.addChild @ball

      @label_x = new Label "X"
      @rootScene.addChild @label_x
      @rootScene.backgroundColor = 'rgb(182, 255, 255)'

    @start()

  onMotion: (event)=>
    if event
      @release = false
      acc = event.acceleration
      acg = event.accelerationIncludingGravity
      rot = event.rotationRate
      itv = event.interval

      @ball.velocity.x = acg.x*15

      if acg.x > 0
        @direction = true
      else
        @direction = false

window.onload = ->
  game = new MyGame 320, 240



