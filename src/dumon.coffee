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
    #@game.label_vector.text = "#{@vector.x}/#{@vector.y}"
    #@x = (@x+@vector.x) % xmax
    #@y = (@y+@vector.y) % ymax
    @x = Math.max 0, Math.min @x+@vector.x, xmax-64
    @y = (Math.max 0, @y+@vector.y) % ymax

    #@y = Math.max 0, Math.min @y+@vector.y, ymax-64

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
          @game.i--
        else
          @game.i++

        @frame = @game.i % 24

      @rootScene.addChild @ball

      @label_x = new Label "X"
      # @label_y = new Label "Y"
      # @label_z = new Label "Z"
      # @label_vector = new Label "Vector"
      # @label_y.y = 30
      # @label_z.y = 60
      # @label_vector.y = 90
      @rootScene.addChild @label_x
      # @rootScene.addChild @label_y
      # @rootScene.addChild @label_z
      # @rootScene.addChild @label_vector
      @rootScene.backgroundColor = 'rgb(182, 255, 255)'

    @start()

  onMotion: (event)=>
    if event
      acc = event.acceleration
      acg = event.accelerationIncludingGravity
      rot = event.rotationRate
      itv = event.interval

      @ball.vector.x = acg.x*15
      #@ball.vector.y = -acg.y*15

      if acg.x > 0
        @direction = true
      else
        @direction = false

      @label_x.text = "#{@direction}"

      #@label_x.text = "#{acc.x}"
      #@label_y.text = "#{acc.y}"
      #@label_z.text = "#{acc.z}"

window.onload = ->
  game = new MyGame 320, 240



