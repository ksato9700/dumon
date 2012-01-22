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
