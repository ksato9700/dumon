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

class window.StageView extends Backbone.View
  tagName: "li"
  template: _.template $('#item-template').html()
  s_template: _.template $('#scene-template').html()

  initialize: ->
    _.bindAll @, 'render', 'close'
    @model.bind 'change', @render
    @model.view = @

  render: ->
    $(@el).html @template @model.toJSON()
    @setTitle()
    for scene in @model.scenes
      $("#scenes").append @s_template scene
    @

  close: ->
    console.log ">>close", @

  setTitle: ->
    el_title = @$('.stage-title')
    el_title.text @model.get 'value'
    el_title.attr "id", @model.id
    el_title.append $("<span/>").addClass("label success").text "New"


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

#
# utilities
#

_jpnamemap =
  "bkft": "朝"
  "lnch": "昼"
  "dinr": "晩"

window.bgname = (name)->
  ret = name.split('_')[1..].join("/")
  ret = ret.replace from,to for from, to of _jpnamemap
  ret

window.hrname = (name)->
  jname = _jpnamemap[name[0..3]]
  jname || name

window.mtname = window.hrname