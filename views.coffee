require 'coffee-react/register'
require "#{ROOT}/views/env"

i18n = require './node_modules/i18n'
{join} = require 'path-extra'

i18n.configure
  locales: ['en-US', 'ja-JP', 'zh-CN', 'zh-TW']
  defaultLocale: 'zh-CN'
  directory: join(__dirname, 'assets', 'i18n')
  updateFiles: false
  indent: '\t'
  extension: '.json'

i18n.setLocale(window.language)
window.__ = i18n.__

require './views/index'
