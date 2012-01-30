
# Copyright 2012 Kenichi Sato <ksato9700@gmail.com>
#
enchant()

config =
  key_init_acceleration: 2.5
  key_init_velocity: 10
  key_release_decay: 1.0
  touch_init_velocity: 5
  area_decay: 0.4
  bouncing_decay: 1
  opacity_decay: 0.8

touch_init_velocity = (x)->
  if x>0 then config.touch_init_velocity else -config.touch_init_velocity

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

class Answer extends Sprite
  constructor: (@game, @idx, @x, @y, w, h) ->
    super w, h
    @moveTo x, y
    @._element.className = "circle"

  set_text: (text)->
    @._element.innerHTML = text

class Ball extends Sprite
  constructor: (@game, label="") ->
    super 64,64
    @label = new Label label
    @label.id = "ball_label"
    @label.ball = @

    #label size is always (300,0)
    @label_offset =
      x: @width/2 - 150
      y: @height/8
    @image = @game.assets['img/sp.png']
    @full_reset()

  full_reset: ->
    @reset()
    @moveTo (@game.width-@width)/2, (@game.height-@height)/2+16

  reset: ->
    @direction = true
    @velocity = {'x': 0, 'y': 0}
    @acceleration = {'x': 0, 'y': 0}
    @opacity = 1.0

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

  touch: (event, type)->
    if type is 'start'
      @touch_start = {x: event.x, y: event.y, frame: @game.frame}
    else
      frames = @game.frame - @touch_start.frame + 1

      @velocity.x = (event.x - @touch_start.x)/frames
      @velocity.y = (event.y - @touch_start.y)/frames

      @velocity.x += touch_init_velocity @velocity.x
      @velocity.y += touch_init_velocity @velocity.y

      @wrong_answer = false
      @in_escape = true

  in_area: (area) ->
    if @x == area.x and @y == area.y
      if @game.check(area.idx)
        @velocity.x = 0
        @velocity.y = 0
        @opacity = 0.99
      else
        @velocity.x = 1
        @velocity.y = 1
        @wrong_answer = true
    else
      @velocity.x = @velocity.x * config.area_decay + (area.x - @x)
      @velocity.y = @velocity.y * config.area_decay + (area.y - @y)

  update: ->
    @game.label_t.text = "#{@game.timer.lap()}"
    @frame = (if @direction then @frame-1 else @frame+1) % @game.fps

    if @opacity < 1.0
      @opacity *= config.opacity_decay
      if @opacity < 0.01
        @game.next()
        @full_reset()
      return

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

    if @wrong_answer
      @velocity.x = -@velocity.x
      @velocity.y = -@velocity.y

    else if @release
      @acceleration.x = 0
      @acceleration.y = 0

      still_in_area = false
      for area in @game.answers
        if @within area, 32
          if not @in_escape
            @in_area area
          still_in_area = true

      if not still_in_area
        @in_escape = false

      @velocity.x *= config.key_release_decay
      @velocity.y *= config.key_release_decay

      @velocity.x = Math[if @velocity.x>0 then "floor" else "ceil"] @velocity.x
      @velocity.y = Math[if @velocity.y>0 then "floor" else "ceil"] @velocity.y

    else
      @velocity.x += @acceleration.x
      @velocity.y += @acceleration.y

    new_x = Math.round @x+@velocity.x
    new_y = Math.round @y+@velocity.y

    @moveTo new_x, new_y

class MyGame extends Game
  constructor: (width, height)->
    Sound.enabledInMobileSafari = true
    super width, height

    @timer = new Timer()

    @fps = 24
    @preload 'img/sp.png'

    @scene = 0

    @onload = ->
      @ball = new Ball @, ""

      @answers = [
        (new Answer @, 0, @width/2-32, 32, 64, 64),
        (new Answer @, 1, 32, @height-96, 64, 64),
        (new Answer @, 2, @width-96, @height-96, 64, 64)
      ]

      @wall_l = new Wall @, 0,       0, 5, height, "wall_side"
      @wall_r = new Wall @, width-5, 0, 5, height, "wall_side"
      @wall_t = new Wall @, 0,       0, width, 5, "wall_side"
      @wall_b = new Wall @, 0, height-5, width, 5, "wall_side"

      @rootScene.addChild answer for answer in @answers
      @rootScene.addChild @ball
      @rootScene.addChild @ball.label
      @rootScene.addChild @wall_l
      @rootScene.addChild @wall_r
      @rootScene.addChild @wall_t
      @rootScene.addChild @wall_b

      @addEventListener 'rightbuttondown', (e)->
        @ball.wrong_answer = false
        @ball.right()

      @addEventListener 'rightbuttonup', (e)->
        @ball.release = true
        @ball.in_escape = true

      @addEventListener 'leftbuttondown', (e)->
        @ball.wrong_answer = false
        @ball.left()

      @addEventListener 'leftbuttonup', (e)->
        @ball.release = true
        @ball.in_escape = true

      @addEventListener 'upbuttondown', (e)->
        @ball.wrong_answer = false
        @ball.up()

      @addEventListener 'upbuttonup', (e)->
        @ball.release = true
        @ball.in_escape = true

      @addEventListener 'downbuttondown', (e)->
        @ball.wrong_answer = false
        @ball.down()

      @addEventListener 'downbuttonup', (e)->
        @ball.release = true
        @ball.in_escape = true

      @ball.addEventListener 'enterframe', (e)->
        @update()

      @ball.label.addEventListener 'touchstart', (e)->
        @ball.touch e, 'start'

      @ball.label.addEventListener 'touchend', (e)->
        @ball.touch e, 'end'

      @ball.addEventListener 'touchstart', (e)->
        @touch e, 'start'

      @ball.addEventListener 'touchend', (e)->
        @touch e, 'end'

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

  check:(answer) ->
    answer is @answer

  next: ->
    s = @scenes[@scene]
    if s is undefined
      @stop()
    else
      @answers[i].set_text s.answers[i] for i in [0..2]
      @answer = s.answer

      @ball.label.text = s.question

      @scene += 1
      @label_p.text = "#{@scene}/#{@scenes.length}"

      return false

window.onload = ->
  game = new MyGame 320, 320
