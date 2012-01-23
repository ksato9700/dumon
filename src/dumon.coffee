#
# Copyright 2012 Kenichi Sato <ksato9700@gmail.com>
#
enchant()

config =
  key_init_x_acceleration: 2.5
  key_init_x_velocity: 2
  key_release_decay: 0.75
  init_y_velocity: 3
  init_y_acceleration: 0.1
  last_y_acceleration: 0.9
  bouncing_decay_bottom: 0.4
  bouncing_decay_side: 0.8
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

    @xmax = @game.width
    @ymax = @game.height

  full_reset: ->
    @reset()
    @moveTo (@game.width-@width)/2, -@height

  reset: ->
    @direction = true
    @velocity = {'x': 0, 'y': config.init_y_velocity}
    @acceleration = {'x': 0, 'y': config.init_y_acceleration}

    @release = true
    @bouncing = false

  moveTo: (x,y)->
    super x,y
    @label.moveTo x+@label_offset.x, y+@label_offset.y

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
    @game.label_t.text = "#{@game.timer.lap()}"

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
      @label._element.className = ""

    else
      @velocity.x += @acceleration.x

    # y-axis

    withins = (@within wall_b for wall_b in @game.wall_bs)

    if (withins.reduce (x,y)->x or y)
      @label._element.className = "bang"
      @bouncing = true
      @velocity.y = - @velocity.y * config.bouncing_decay_bottom
      @acceleration.y = config.last_y_acceleration

      if 0 < @x <= 80
        target = 32
      else if 80 < @x <= 176
        target = 128
      else
        target = 224
      @velocity.x = (target - @x)/3.0
      @velocity.x = Math[if @velocity.x>0 then "ceil" else "floor"] @velocity.x

    else
      @velocity.y += @acceleration.y

    @velocity.y = Math.min @velocity.y, 20

    new_y = @y+@velocity.y

    if new_y >= @ymax
      if @game.check((@x-32)/96)
        @full_reset()
        @game.next()
      else
        @reset()
        @velocity.y = -13
        @acceleration.y = 0.3
    else
      new_x = Math.round @x+@velocity.x
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

      @wall_bs = (new Wall @, x*96, height-32, 32, 32, "wall_bottom" for x in [0..3])

      @wall_l = new Wall @, 0,       0, 5, height-32, "wall_side"
      @wall_r = new Wall @, width-5, 0, 5, height-32, "wall_side"

      @answers = (new Answer @, x*96+32, height-32, "answers" for x in [0..2])

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
      @rootScene.addChild @ball.label
      @rootScene.addChild wall_b for wall_b in @wall_bs
      @rootScene.addChild @wall_l
      @rootScene.addChild @wall_r
      @rootScene.addChild answer for answer in @answers

      @label_p = new Label "Progress"
      @label_p.x = 20
      @rootScene.addChild @label_p

      @label_t = new Label "Time"
      @label_t.x = 60
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
      @label_p.text = "#{@scene}/#{@scenes.length}"

      return false

window.onload = ->
  game = new MyGame 320, 320
