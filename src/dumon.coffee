#
# Copyright 2012 Kenichi Sato <ksato9700@gmail.com>
#
enchant()

config =
  key_init_x_acceleration: 2.5
  key_init_x_velocity: 2
  key_release_decay: 0.75
  init_y_velocity: 5
  init_y_acceleration: 0.3
  last_y_acceleration: 0.9
  bouncing_decay_bottom: 0.4
  bouncing_decay_side: 0.8
  device_acc_multiplier: 5

class Wall extends Sprite
  constructor: (@game, x, y, w, h) ->
    super w, h
    @moveTo x, y

class Ball extends Sprite
  constructor: (@game) ->
    super 64,64
    @moveTo 32, 32

    @direction = true
    @velocity = {'x': 0, 'y': config.init_y_velocity}
    @acceleration = {'x': 0, 'y': config.init_y_acceleration}
    @image = @game.assets['/img/sp.png']
    @s1 = @game.assets['/sound/s1.mp3']

    @gate = true
    @release = false

  right: ->
    @release = false
    @direction = true
    if @acceleration.x > 0
      @acceleration.x = Math.floor @acceleration.x/2
    else
      @velocity.x +=  config.key_init_x_velocity
      @acceleration.x = config.key_init_x_acceleration

  left: ->
    @release = false
    @direction = false
    if @acceleration.x < 0
      @acceleration.x = Math.ceil @acceleration.x/2
    else
      @velocity.x -=  config.key_init_x_velocity
      @acceleration.x = -config.key_init_x_acceleration

  update: ->
    @game.label_x.text = "#{@direction}"
    xmax = @game.width
    ymax = @game.height

    @frame = (if @direction then @frame-1 else @frame+1) % @game.fps

    # x-axis

    if @intersect @game.wall_l
      if @velocity.x <0
        @velocity.x = - @velocity.x * config.bouncing_decay_side

    else if @intersect @game.wall_r
      if @velocity.x >0
        @velocity.x = - @velocity.x * config.bouncing_decay_side

    if @release
      @acceleration.x = 0
      @velocity.x *= config.key_release_decay
      @velocity.x = Math[if @velocity.x>0 then "floor" else "ceil"] @velocity.x

    else
      @velocity.x += @acceleration.x

    # y-axis

    if @gate and @intersect @game.wall_b
      # s1 = @s1.clone()
      @s1.volume = 0.5
      @s1.stop()
      @s1.play()
      @velocity.y = - @velocity.y * config.bouncing_decay_bottom
      @acceleration.y = config.last_y_acceleration
      @gate = false
    else
      @velocity.y += @acceleration.y

    @velocity.y = Math.min @velocity.y, 20

    new_y = @y+@velocity.y
    if new_y > ymax
      new_y = 0
      @gate = true
      @acceleration.y = config.init_y_acceleration

    @moveTo @x+@velocity.x, new_y

class MyGame extends Game
  constructor: (width, height)->
    super width, height

    @fps = 24
    @preload '/img/sp.png'
    @preload '/sound/s1.mp3'

    addEventListener 'devicemotion', @onMotion, false

    @onload = ->
      @ball = new Ball @
      @wall_b = new Wall @, 0 , height-1, width, 1
      @wall_l = new Wall @, 0,       0, 1, height
      @wall_r = new Wall @, width-1, 0, 1, height

      @addEventListener 'rightbuttondown', (e)->
        @ball.right()

      @addEventListener 'rightbuttonup', (e)->
        @ball.release = true

      @addEventListener 'leftbuttondown', (e)->
        @ball.left()

      @addEventListener 'leftbuttonup', (e)->
        @ball.release = true

      @ball.addEventListener 'enterframe', (e)->
        @update()

      @rootScene.addChild @ball
      @rootScene.addChild @wall_b
      @rootScene.addChild @wall_l
      @rootScene.addChild @wall_r

      @label_x = new Label "X"
      @rootScene.addChild @label_x

      @rootScene.backgroundColor = 'rgb(182, 255, 255)'

    @start()

  onMotion: (event)=>
    if event
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



