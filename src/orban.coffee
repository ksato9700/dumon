#
# Copyright 2012 Kenichi Sato <ksato9700@gmail.com>
#
enchant()

config =
  key_init_acceleration: 2.5
  key_init_velocity: 2
  key_release_decay: 0.98
  last_y_acceleration: 0.0
  bouncing_decay: 0.8
  device_acc_multiplier: 2

class Timer
  constructor: ->
    @reset()

  reset: ->
    @start = new Date()

  lap: ->
    elapsed = new Date (new Date() - @start)
    min = elapsed.getMinutes()
    if min<10
      min = "0" + min.toString()
    sec = elapsed.getSeconds()
    if sec<10
      sec = "0" + sec.toString()
    mil = elapsed.getMilliseconds()
    if mil<10
      mil = "00" + mil.toString()
    else if mil<100
      mil = "0" + mil.toString()
    "#{min}:#{sec}.#{mil}"

class Wall extends Sprite
  constructor: (@game, x, y, w, h, klass) ->
    super w, h
    @moveTo x, y
    @._element.className = klass

class Answer extends Label
  constructor: (@game, x, y, klass) ->
    super ""
    x = x - 150 + 32
    @moveTo x, y
    @._element.className = klass

class Area
  constructor: (@game, @idx, @x, @y, @width, @height) ->

class Ball extends Sprite
  constructor: (@game, label="") ->
    super 64,64
    @label = new Label label
    @label.id = "ball_label"

    #label size is always (300,0)
    @label_offset =
      x: @width/2 - 150
      y: @width/4
    @image = @game.assets['img/sp.png']
    @full_reset()

  full_reset: ->
    @reset()
    @moveTo (@game.width-@width)/2, (@game.height-@height)/2

  reset: ->
    @direction = true
    @velocity = {'x': 0, 'y': 0}
    @acceleration = {'x': 0, 'y': 0}

    @release = true
    @bouncing = false

  moveTo: (x,y)->
    super x,y
    @label.moveTo x+@label_offset.x, y+@label_offset.y

  down: ->
    @release = false
    if @acceleration.y > 0
      @acceleration.y = Math.floor @acceleration.y/2
    else
      @velocity.y +=  config.key_init_velocity
      @acceleration.y = config.key_init_acceleration

  up: ->
    @release = false
    if @acceleration.y < 0
      @acceleration.y = Math.ceil @acceleration.y/2
    else
      @velocity.y -=  config.key_init_velocity
      @acceleration.y = -config.key_init_acceleration

  right: ->
    @release = false
    @direction = true
    if @acceleration.x > 0
      @acceleration.x = Math.floor @acceleration.x/2
    else
      @velocity.x +=  config.key_init_velocity
      @acceleration.x = config.key_init_acceleration

  left: ->
    @release = false
    @direction = false
    if @acceleration.x < 0
      @acceleration.x = Math.ceil @acceleration.x/2
    else
      @velocity.x -=  config.key_init_velocity
      @acceleration.x = -config.key_init_acceleration

  update: ->
    @game.label_t.text = "#{@game.timer.lap()}"
    @frame = (if @direction then @frame-1 else @frame+1) % @game.fps

    if @intersect @game.wall_l
      if @velocity.x <0
        @velocity.x = - @velocity.x * config.bouncing_decay

    else if @intersect @game.wall_r
      if @velocity.x >0
        @velocity.x = - @velocity.x * config.bouncing_decay

    else if @intersect @game.wall_t
      if @velocity.y <0
        @velocity.y = - @velocity.y * config.bouncing_decay

    else if @intersect @game.wall_b
      if @velocity.y >0
        @velocity.y = - @velocity.y * config.bouncing_decay

    if @release
      @acceleration.x = 0
      @acceleration.y = 0
      for area in @game.areas
        if @within area
          @velocity.x += (area.x-@x)/24
          @velocity.y += (area.y-@y)/24

      @velocity.x *= config.key_release_decay
      @velocity.x = Math[if @velocity.x>0 then "floor" else "ceil"] @velocity.x
      @velocity.y *= config.key_release_decay
      @velocity.y = Math[if @velocity.y>0 then "floor" else "ceil"] @velocity.y

    else
      @velocity.x += @acceleration.x
      @velocity.y += @acceleration.y

    #new_x = Math.round @x+@velocity.x
    new_x = @x
    new_y = Math.round @y+@velocity.y
    @moveTo new_x, new_y


class MyGame extends Game
  constructor: (width, height)->
    Sound.enabledInMobileSafari = true
    super width, height

    @timer = new Timer()

    @fps = 24
    addEventListener 'devicemotion', @onMotion, false

    @preload 'img/sp.png'

    @scene = 0

    @onload = ->
      @ball = new Ball @, ""

      @areas = [
        (new Area @, 0, @width/2, -80, 160, 160),
        (new Area @, 1, -80, @height-80, 160, 160),
        (new Area @, 2, @width-80, @height-80, 160, 160)
      ]

      @wall_l = new Wall @, 0,       0, 5, height, "wall_side"
      @wall_r = new Wall @, width-5, 0, 5, height, "wall_side"
      @wall_t = new Wall @, 0,       0, width, 5, "wall_side"
      @wall_b = new Wall @, 0, height-5, width, 5, "wall_side"

      @answers = (new Answer @, x*96+32, height-32, "answers" for x in [0..2])

      @addEventListener 'rightbuttondown', (e)->
        @ball.right()

      @addEventListener 'rightbuttonup', (e)->
        @ball.release = true

      @addEventListener 'leftbuttondown', (e)->
        @ball.left()

      @addEventListener 'leftbuttonup', (e)->
        @ball.release = true

      @addEventListener 'upbuttondown', (e)->
        @ball.up()

      @addEventListener 'upbuttonup', (e)->
        @ball.release = true

      @addEventListener 'downbuttondown', (e)->
        @ball.down()

      @addEventListener 'downbuttonup', (e)->
        @ball.release = true

      @ball.addEventListener 'enterframe', (e)->
        @update()

      @rootScene.addChild @ball
      @rootScene.addChild @ball.label
      @rootScene.addChild @wall_l
      @rootScene.addChild @wall_r
      @rootScene.addChild @wall_t
      @rootScene.addChild @wall_b

      @rootScene.addChild answer for answer in @answers

      @label_p = new Label ""
      @label_p.x = 20
      @label_p.y = 10
      @rootScene.addChild @label_p

      @label_t = new Label "Time"
      @label_t.x = 60
      @label_t.y = 10
      @rootScene.addChild @label_t

      @rootScene.backgroundColor = 'AliceBlue'

      id=location.hash.replace("#","")
      Stages.ajaxFetch
        success: =>
          model = Stages.get id
          model.getDetails
            success: (model, resp)=>
              @scenes = model.scenes
              @next()

    @start()

  onMotion: (event)=>
    if event
      acc = event.acceleration
      acg = event.accelerationIncludingGravity
      rot = event.rotationRate
      itv = event.interval

      if not @ball.bouncing
        @ball.velocity.x = acg.x * config.device_acc_multiplier
        @ball.velocity.y = acg.y * config.device_acc_multiplier

        if acg.x > 0
          @ball.direction = true
        else
          @ball.direction = false

  check:(answer) ->
    answer is @answer

  next: ->
    s = @scenes[@scene]
    if s is undefined
      @stop()
    else
      @ball.label.text = s.question
      @answers[i].text = s.answers[i] for i in [0..2]
      @answer = s.answer

      @scene += 1
      #@label_p.text = "#{@scene}/#{@scenes.length}"

      return false

window.onload = ->
  game = new MyGame 320, 320
