#
# Copyright 2012 Kenichi Sato <ksato9700@gmail.com>
#

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