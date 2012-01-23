#
# Copyright 2012 Kenichi Sato <ksato9700@gmail.com>
#
class window.Stage extends Backbone.Model
  initialize: ->
    @scenes = []

  clear: ->
    @destory()
    @view.remove()

  getDetails: (options) ->
    options || options = {}
    success = options.success
    @sync = Backbone.ajaxSync
    @fetch
      success: (model, resp)->
        @sync = Backbone.sync
        model.scenes = resp
        success model, resp if success

class window.StageList extends Backbone.Collection
  model: Stage
  localStorage: new Store "stages"
  url: '/api/stages'

  comparator: (stage)->
    stage.get "id"

  ajaxFetch: (options)->
    @sync = Backbone.ajaxSync

    options || options = {}
    success = options.success
    error   = options.error

    options.success = (collection, resp, xhr)=>
      @sync = Backbone.sync
      model.save() for model in @models
      success collection, resp, xhr if success

    options.error = (collection, resp, xhr)=>
      @sync = Backbone.sync
      error collection, resp, xhr if error

    @fetch options

window.Stages = new StageList

_tableheads =
  "clock": "<tr><th>#</th><th>背景</th><th>BGM</th><th>落ち物</th><th>箱</th></tr>"
  "multichoice": "<tr><th>#</th><th>問題</th><th>選択肢</th><th>答え</th></tr>"

class window.StageView extends Backbone.View
  tagName: "li"
  template: _.template $('#item-template').html()

  initialize: ->
    _.bindAll @, 'render', 'close'
    @model.bind 'change', @render
    @model.view = @
    @s_template = _.template $('#scene-template-' + "#{@model.get 'format'}").html()

  render: ->
    $(@el).html @template @model.toJSON()
    @setTitle()
    if @model.scenes.length > 0
      $("#scenes").empty()
      $("#scenes").append $(_tableheads[@model.get 'format'])
      for scene in @model.scenes
        $("#scenes").append @s_template scene
    @

  close: ->
    console.log ">>close", @

  setTitle: ->
    el_title = @$('.stage-title')
    el_title.text @model.get 'title'
    el_title.attr "id", @model.id
    if (@model.get 'format') is 'multichoice'
      el_title.append $("<span/>").addClass("label success").text "New"
      el_title.append ($("<span/>").addClass("label important").text "Play").click =>
        location.href = "/dumon/\##{@model.id}"

class window.AppView extends Backbone.View
  el: $("#stageapp")

  events:
    "click .stage-title": "showDetails"

  showDetails: (event)->
    id = $(event.target).attr("id")
    model = Stages.get(id)
    model.getDetails
      success: (model, resp)->
        model.view.render()

  initialize: ->
    _.bindAll(this, 'addOne', 'addAll', 'render')
    @input = @$ "#new-todo"

    Stages.bind 'add',   @addOne
    Stages.bind 'reset', @addAll
    Stages.bind 'all',   @render

    Stages.ajaxFetch()

  render: ->

  addOne: (stage)->
    view = new StageView
      model: stage
    @$("#stage-list").append view.render().el

  addAll: ->
    Stages.each @addOne

window.App = new AppView
