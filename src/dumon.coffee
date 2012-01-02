#
# Copyright 2012 Kenichi Sato <ksato9700@gmail.com>
#
enchant()

config =
  key_init_x_velocity: 15
  key_last_x_velocity: 10
  init_y_velocity: 5
  init_y_acceleration: 0.3
  last_y_acceleration: 0.9
  release_decay: 0.75
  bouncing_decay: 0.4
  device_acc_multiplier: 5

class Ball extends Sprite
  constructor: (@game) ->
    super 64,64
    @moveTo 32, 32

    @direction = true
    @velocity = {'x': 0, 'y': config.init_y_velocity}
    @acceleration = {'x', 0, 'y': config.init_y_acceleration}
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

  update: ->
    @game.label_x.text = "#{@direction}"
    xmax = @game.width
    ymax = @game.height

    @frame = (if @direction then @frame-1 else @frame+1) % @game.fps

    if @gate and @y >= ymax-64
      @velocity.y = - @velocity.y * config.bouncing_decay
      @acceleration.y = config.last_y_acceleration
      @gate = false

    else
      @velocity.y += @acceleration.y

    new_y = @y+@velocity.y
    if new_y > ymax
      new_y = 0
      @gate = true
      @acceleration.y = config.init_y_acceleration

    @moveTo (Math.max 0, Math.min @x+@velocity.x, xmax-64), new_y


class MyGame extends Game
  constructor: (width, height)->
    super width, height

    @fps = 24
    @preload  '/img/sp.png'

    addEventListener 'devicemotion', @onMotion, false

    @onload = ->
      @ball = new Ball (@)

      @release = false

      @addEventListener 'rightbuttondown', (e)->
        @release = false
        @ball.direction = true
        if @ball.velocity.x > 0
          @ball.velocity.x = Math.max @ball.velocity.x/2, config.key_last_x_velocity
        else
          @ball.velocity.x = config.key_init_x_velocity

      @addEventListener 'rightbuttonup', (e)->
        @release = true

      @addEventListener 'leftbuttondown', (e)->
        @ball.direction = false
        @release = false
        if @ball.velocity.x < 0
          @ball.velocity.x = Math.min @ball.velocity.x/2, -config.key_last_x_velocity
        else
          @ball.velocity.x = -config.key_init_x_velocity

      @addEventListener 'leftbuttonup', (e)->
        @release = true

      @ball.addEventListener 'enterframe', (e)->
        if @game.release
          @velocity.x *= config.release_decay
          @velocity.x = Math[if @velocity.x>0 then "floor" else "ceil"] @velocity.x

        @update()

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

      @ball.velocity.x = acg.x * config.device_acc_multiplier

      if acg.x > 0
        @ball.direction = true
      else
        @ball.direction = false

window.onload = ->
  game = new MyGame 320, 240



