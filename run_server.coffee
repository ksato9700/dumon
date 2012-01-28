#!/usr/bin/env coffee
express = require  'express'
app = express.createServer express.logger()
app.use express.static __dirname

port = process.env.PORT || 5000
app.listen port, ->
  console.log "Listening on " + port

