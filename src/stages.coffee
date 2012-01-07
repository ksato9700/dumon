#
# Copyright 2012 Kenichi Sato <ksato9700@gmail.com>
#
class window.Stage extends Backbone.Model
  initialize: ->

  clear: ->
    @destory()
    @view.remove()

class window.StageList extends Backbone.Collection
  model: Stage
  localStorage: new Store "stages"
  url: '/api/stages'

  comparator: (stage)->
    stage.get "id"

  ajaxFetch: (options)->
    @sync = Backbone.ajaxSync

    success = options.success
    error   = options.error

    options.success = (model, resp, xhr)=>
      @sync = Backbone.sync
      model.save() for model in @models
      success model, resp, xhr if success

    options.error = (model, resp, xhr)=>
      @sync = Backbone.sync
      error model, resp, xhr if error

    @fetch options

window.Stages = new StageList

Stages.ajaxFetch
  success: (connection, status)->
    console.log 'Success', connection, status

    Stages.fetch
      success: (connection, status)->
        console.log 'L:Success', connection, status
      error: (connection, status)->
        console.log 'L:Error', connection, status

  error: (connection, status)->
    console.log 'Error', connection, status




