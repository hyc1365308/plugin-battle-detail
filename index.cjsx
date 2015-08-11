Promise = require 'bluebird'
async = Promise.coroutine
request = Promise.promisifyAll require('request')
{relative, join} = require 'path-extra'
path = require 'path-extra'
fs = require 'fs-extra'
{_, $, $$, React, ReactBootstrap, ROOT, resolveTime, layout, toggleModal} = window
{Table, ProgressBar, Grid, Input, Col, Alert, Button} = ReactBootstrap
{APPDATA_PATH, SERVER_HOSTNAME} = window
i18n = require './node_modules/i18n'
{__} = i18n

i18n.configure
  locales: ['en_US', 'ja_JP', 'zh_CN']
  defaultLocale: 'en_US'
  directory: path.join(__dirname, 'assets', 'i18n')
  updateFiles: false
  indent: '\t'
  extension: '.json'
i18n.setLocale(window.language)

window.addEventListener 'layout.change', (e) ->
  {layout} = e.detail

getCondStyle = (cond) ->
  if window.theme.indexOf('dark') != -1 or window.theme == 'slate' or window.theme == 'superhero'
    if cond > 49
      color: '#FFFF00'
    else if cond < 20
      color: '#DD514C'
    else if cond < 30
      color: '#F37B1D'
    else if cond < 40
      color: '#FFC880'
    else
      null
  else
    if cond > 49
      'text-shadow': '0 0 3px #FFFF00'
    else if cond < 20
      'text-shadow': '0 0 3px #DD514C'
    else if cond < 30
      'text-shadow': '0 0 3px #F37B1D'
    else if cond < 40
      'text-shadow': '0 0 3px #FFC880'
    else
      null

getHpStyle = (percent) ->
  if percent <= 25
    'danger'
  else if percent <= 50
    'warning'
  else if percent <= 75
    'info'
  else
    'success'

formation = [
  __("Unknown Formation"),
  __("Line Ahead"),
  __("Double Line"),
  __("Diamond"),
  __("Echelon"),
  __("Line Abreast"),
  __("Cruising Formation 1"),
  __("Cruising Formation 2"),
  __("Cruising Formation 3"),
  __("Cruising Formation 4")
]

intercept = [
  __("Unknown Engagement"),
  __("Parallel Engagement"),
  __("Head-on Engagement"),
  __("Crossing the T (Advantage)"),
  __("Crossing the T (Disadvantage)")
]

dropCount = [
  0, 1, 1, 2, 2, 3, 4
]

enemyPath = join(APPDATA_PATH, 'enemyinfo.json')
db = null
try
  db = fs.readJsonSync enemyPath
catch e
  false
enemyInformation = {}
if db?
  enemyInformation = db
# Sync from SERVER
sync = async ->
  [response, body] = yield request.getAsync "http://#{SERVER_HOSTNAME}/api/prophet/sync",
    json: true
  if response.statusCode == 200
    enemyInformation = _.extend enemyInformation, body.data
sync()

jsonId = null
jsonContent = {}

getTyku = (ship, slot) ->
  totalTyku = 0
  {$slotitems, $ships} = window
  for tmp, i in ship
    continue if tmp == -1
    for t, j in $ships[tmp].api_maxeq
      continue if t == 0
      continue if slot[i][j] == -1
      item = $slotitems[slot[i][j]]
      if item.api_type[3] in [6, 7, 8]
        totalTyku += Math.floor(Math.sqrt(t) * item.api_tyku)
      else if item.api_type[3] == 10 && item.api_type[2] == 11
        totalTyku += Math.floor(Math.sqrt(t) * item.api_tyku)
  totalTyku

updateJson = async (jsonId, jsonContent) ->
  if jsonContent?
    enemyInformation[jsonId] = Object.clone jsonContent
    fs.writeFileSync enemyPath, JSON.stringify(enemyInformation), 'utf8'
    try
      yield request.postAsync "http://#{SERVER_HOSTNAME}/api/prophet/#{jsonId}/update",
        form:
          data: JSON.stringify(jsonContent)
    catch e
      console.error e
  null

getMapEnemy = (shipName, shipLv, maxHp, nowHp, enemyFormation, enemyTyku, enemyInfo) ->
  {$ships, _ships} = window
  for tmp, i in enemyInfo.ship
    continue if tmp == -1
    maxHp[i + 6] = enemyInfo.hp[i]
    shipLv[i + 6] = enemyInfo.lv[i]
    nowHp[i + 6] = maxHp[i + 6]
    if $ships[tmp].api_yomi != "-"
      shipName[i + 6] = $ships[tmp].api_name + $ships[tmp].api_yomi
    else
      shipName[i + 6] = $ships[tmp].api_name
  enemyFormation = enemyInfo.formation
  enemyTyku = enemyInfo.totalTyku
  [shipName, shipLv, maxHp, nowHp, enemyFormation, enemyTyku]

getInfo = (shipName, shipLv, friend, enemy, enemyLv, exerciseFlag) ->
  {$ships, _ships} = window
  for shipId, i in friend
    continue if shipId == -1
    shipName[i] = $ships[_ships[shipId].api_ship_id].api_name
    shipLv[i] = _ships[shipId].api_lv
  for shipId, i in enemy
    continue if shipId == -1
    shipLv[i + 5] = enemyLv[i]
    if $ships[shipId].api_yomi == "-"
      shipName[i + 5] = $ships[shipId].api_name
    else
      if exerciseFlag == 0
        shipName[i + 5] = $ships[shipId].api_name + $ships[shipId].api_yomi
      else
        shipName[i + 5] = $ships[shipId].api_name
  [shipName, shipLv]

getCombinedInfo = (shipName, shipLv, friend) ->
  {$ships, _ships} = window
  for shipId, i in friend
    continue if shipId == -1
    shipName[i] = $ships[_ships[shipId].api_ship_id].api_name
    shipLv[i] = _ships[shipId].api_lv
  [shipName, shipLv]

getHp = (maxHp, nowHp, maxHps, nowHps) ->
  for tmp, i in maxHps
    continue if i == 0
    maxHp[i - 1] = tmp
    nowHp[i - 1] = nowHps[i]
  [maxHp, nowHp]

getResult = (damageHp, nowHp) ->
  friendDamage = 0.0
  enemyDamage = 0.0
  friendDrop = 0
  enemyDrop = 0
  enemyCount = 0
  friendHp = 0.0
  enemyHp = 0.0
  for tmp, i in nowHp
    continue if tmp == -1
    if i < 6
      enemyDamage += damageHp[i]
      friendHp += tmp
    else
      enemyCount += 1
      enemyHp += tmp
      if nowHp[i] - damageHp[i] <= 0
        enemyDrop += 1
      friendDamage += Math.min(nowHp[i], damageHp[i])
  tmpResult = "不明"
  tmp = (friendDamage / enemyHp) / (enemyDamage / friendHp)
  if enemyDrop == enemyCount
    tmpResult = "S"
  else if enemyDrop >= dropCount[enemyCount]
    tmpResult = "A"
  else if (nowHp[6] - damageHp[6] <= 0 || friendDamage / enemyHp >= 2.5 * enemyDamage / friendHp) && friendDamage != 0
    tmpResult = "B"
  else if (friendDamage / enemyHp >= 1 * enemyDamage / friendHp && friendDamage / enemyHp <= 2.5 * enemyDamage / friendHp) &&friendDamage != 0
    tmpResult = "C"
  else
    tmpResult = "D"
  tmpResult

koukuAttack = (afterHp, kouku) ->
  if kouku.api_edam?
    for damage, i in kouku.api_edam
      damage = Math.floor(damage)
      continue if damage <= 0
      afterHp[i + 5] -= damage
  if kouku.api_fdam?
    for damage, i in kouku.api_fdam
      damage = Math.floor(damage)
      continue if damage <= 0
      afterHp[i - 1] -= damage
  afterHp

openAttack = (afterHp, openingAttack) ->
  if openingAttack.api_edam?
    for damage, i in openingAttack.api_edam
      damage = Math.floor(damage)
      continue if damage <= 0
      afterHp[i + 5] -= damage
  if openingAttack.api_fdam?
    for damage, i in openingAttack.api_fdam
      damage = Math.floor(damage)
      continue if damage <= 0
      afterHp[i - 1] -= damage
  afterHp
combinedOpenAttack = (combinedAfterHp, afterHp, openingAttack) ->
  if openingAttack.api_edam?
    for damage, i in openingAttack.api_edam
      damage = Math.floor(damage)
      continue if damage <= 0
      afterHp[i + 5] -= damage
  if openingAttack.api_fdam?
    for damage, i in openingAttack.api_fdam
      damage = Math.floor(damage)
      continue if damage <= 0
      combinedAfterHp[i - 1] -= damage
  [combinedAfterHp, afterHp]

hougekiAttack = (afterHp, hougeki) ->
  for damageFrom, i in hougeki.api_at_list
    continue if damageFrom == -1
    for damage, j in hougeki.api_damage[i]
      damage = Math.floor(damage)
      damageTo = hougeki.api_df_list[i][j]
      continue if damage <= 0
      afterHp[damageTo - 1] -= damage
  afterHp
combinedHougekiAttack = (combinedAfterHp, afterHp, hougeki) ->
  for damageFrom, i in hougeki.api_at_list
    continue if damageFrom == -1
    for damage, j in hougeki.api_damage[i]
      damage = Math.floor(damage)
      damageTo = hougeki.api_df_list[i][j]
      continue if damage <= 0
      if damageTo - 1 < 6
        combinedAfterHp[damageTo - 1] -= damage
      else
        afterHp[damageTo - 1] -= damage
  [combinedAfterHp, afterHp]

raigekiAttack = (afterHp, raigeki) ->
  if raigeki.api_edam?
    for damage, i in raigeki.api_edam
      damage = Math.floor(damage)
      continue if damage <= 0
      afterHp[i + 5] -= damage
  if raigeki.api_fdam?
    for damage, i in raigeki.api_fdam
      damage = Math.floor(damage)
      continue if damage <= 0
      afterHp[i - 1] -= damage
  afterHp

combinedRaigekiAttack = (combinedAfterHp, afterHp, raigeki) ->
  if raigeki.api_edam?
    for damage, i in raigeki.api_edam
      damage = Math.floor(damage)
      continue if damage <= 0
      afterHp[i + 5] -= damage
  if raigeki.api_fdam?
    for damage, i in raigeki.api_fdam
      damage = Math.floor(damage)
      continue if damage <= 0
      combinedAfterHp[i - 1] -= damage
  [combinedAfterHp, afterHp]

getDamage = (damageHp, nowHp, afterHp, minHp) ->
  for tmp, i in afterHp
    damageHp[i] = nowHp[i] - afterHp[i]
    afterHp[i] = Math.max(tmp, minHp)
  damageHp

supportAttack = (afterHp, damages) ->
  console.log damages
  for damage, i in damages
    damage = Math.floor(damage)
    continue if damage <= 0
    continue if i > 6
    afterHp[i + 5] -= damage
  afterHp

formationFlag = false

module.exports =
  name: 'prophet'
  priority: 1
  displayName: <span><FontAwesome key={0} name='compass' />{' ' + __("Prophet")}</span>
  description: __ "Sortie Prophet"
  version: '2.0.0'
  author: 'Chiba'
  link: 'https://github.com/Chibaheit'
  reactClass: React.createClass
    getInitialState: ->
      afterHp: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      nowHp: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      maxHp: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      damageHp: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      shipName: ["空", "空", "空", "空", "空", "空", "空", "空", "空", "空", "空", "空"]
      shipLv: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
      enemyInfo: null
      getShip: null
      enemyFormation: 0
      enemyTyku: 0
      enemyIntercept: 0
      enemyName: __("Enemy Vessel")
      result: __("Unknown")
      shipCond: [0, 0, 0, 0, 0, 0]
      deckId: 0
      enableProphetDamaged: config.get 'plugin.prophet.notify.damaged', true
      prophetCondShow: config.get 'plugin.prophet.show.cond', true
      combinedFlag: 0
      combinedName: ["空", "空", "空", "空", "空", "空"]
      combinedLv: [-1, -1, -1, -1, -1, -1]
      combinedNowHp: [0, 0, 0, 0, 0, 0]
      combinedMaxHp: [0, 0, 0, 0, 0, 0]
      combinedAfterHp: [0, 0, 0, 0, 0, 0]
      combinedDamageHp: [0, 0, 0, 0, 0, 0]
    handleResponse: (e) ->
      {method, path, body, postBody} = e.detail
      {afterHp, nowHp, maxHp, damageHp, shipName, shipLv, enemyInfo, getShip, enemyFormation, enemyTyku, enemyIntercept, enemyName, result, shipCond, deckId, enableProphetDamaged, prophetCondShow, combinedFlag, combinedName, combinedLv, combinedNowHp, combinedMaxHp, combinedAfterHp, combinedDamageHp} = @state
      enableProphetDamaged = config.get 'plugin.prophet.notify.damaged', true
      prophetCondShow = config.get 'plugin.prophet.show.cond', true
      if path == '/kcsapi/api_req_map/start' || formationFlag
        @setState
          enemyFormation: 0
          enemyInformation: 0
          enemyTyku: 0
          enemyIntercept: 0
          enemyName: __("Enemy Vessel")
          result: __("Unknown")
        formationFlag = false
      flag = false
      switch path
        when '/kcsapi/api_req_map/start'
          jsonId = null
          flag = true
          shipLv[i] = -1 for i in [0..11]
          if combinedFlag != 0
            combinedLv[i] = -1 for i in [0..5]
          _deck = window._decks[postBody.api_deck_id - 1]
          {_ships} = window
          for shipId, i in _deck.api_ship
            continue if shipId == -1
            shipName[i] = _ships[shipId].api_name
            shipLv[i] = _ships[shipId].api_lv
            maxHp[i] = _ships[shipId].api_maxhp
            nowHp[i] = _ships[shipId].api_nowhp
            deckId = postBody.api_deck_id - 1
          for tmp, i in shipLv
            damageHp[i] = 0
          getShip = null
          if body.api_enemy?
            if enemyInformation[body.api_enemy.api_enemy_id]?
              [shipName, shipLv, maxHp, nowHp, enemyFormation, enemyTyku] = getMapEnemy shipName, shipLv, maxHp, nowHp, enemyFormation, enemyTyku, enemyInformation[body.api_enemy.api_enemy_id]
            else
              jsonId = body.api_enemy.api_enemy_id
          afterHp = Object.clone nowHp

        when '/kcsapi/api_req_map/next'
          jsonId = null
          flag = true
          for tmp, i in shipLv
            damageHp[i] = 0
          getShip = null
          shipLv[i] = -1 for i in [6..11]
          if combinedFlag != 0
            combinedLv[i] = -1 for i in [0..5]
          nowHp = Object.clone afterHp
          if body.api_enemy?
            if enemyInformation[body.api_enemy.api_enemy_id]?
              [shipName, shipLv, maxHp, nowHp, enemyFormation, enemyTyku] = getMapEnemy shipName, shipLv, maxHp, nowHp, enemyFormation, enemyTyku, enemyInformation[body.api_enemy.api_enemy_id]
            else
              jsonId = body.api_enemy.api_enemy_id

        when "/kcsapi/api_req_combined_battle/airbattle"
          for tmp, i in shipLv
            shipLv[i] = -1
          for tmp, i in combinedLv
            combinedLv[i] = -1
          {_decks} = window
          flag = true
          getShip = null
          [shipName, shipLv] = getInfo shipName, shipLv, _decks[0].api_ship, body.api_ship_ke, body.api_ship_lv, 0
          [combinedName, combinedLv] = getCombinedInfo combinedName, combinedLv, _decks[1].api_ship
          [maxHp, nowHp] = getHp maxHp, nowHp, body.api_maxhps, body.api_nowhps
          [combinedMaxHp, combinedNowHp] = getHp combinedMaxHp, combinedNowHp, body.api_maxhps_combined, body.api_nowhps_combined
          afterHp = Object.clone nowHp
          combinedAfterHp = Object.clone combinedNowHp
          if body.api_formation?
            enemyFormation = body.api_formation[1]
            enemyIntercept = body.api_formation[2]
          if body.api_kouku? && body.api_kouku.api_stage3?
            afterHp = koukuAttack afterHp, body.api_kouku.api_stage3
          if body.api_kouku? && body.api_kouku.api_stage3_combined?
            combinedAfterHp = koukuAttack combinedAfterHp, body.api_kouku.api_stage3_combined
          if body.api_kouku2? && body.api_kouku2.api_stage3?
            afterHp = koukuAttack afterHp, body.api_kouku2.api_stage3
          if body.api_kouku2? && body.api_kouku2.api_stage3_combined?
            combinedAfterHp = koukuAttack combinedAfterHp, body.api_kouku2.api_stage3_combined
          damageHp = getDamage damageHp, nowHp, afterHp, 0
          combinedDamageHp = getDamage combinedDamageHp, combinedNowHp, combinedAfterHp, 0
          nowHp = Object.clone afterHp
          combinedNowHp = Object.clone combinedAfterHp
        when "/kcsapi/api_req_combined_battle/battle"
          for tmp, i in shipLv
            shipLv[i] = -1
          for tmp, i in combinedLv
            combinedLv[i] = -1
          {_decks} = window
          flag = true
          getShip = null
          [shipName, shipLv] = getInfo shipName, shipLv, _decks[0].api_ship, body.api_ship_ke, body.api_ship_lv, 0
          [combinedName, combinedLv] = getCombinedInfo combinedName, combinedLv, _decks[1].api_ship
          [maxHp, nowHp] = getHp maxHp, nowHp, body.api_maxhps, body.api_nowhps
          [combinedMaxHp, combinedNowHp] = getHp combinedMaxHp, combinedNowHp, body.api_maxhps_combined, body.api_nowhps_combined
          afterHp = Object.clone nowHp
          combinedAfterHp = Object.clone combinedNowHp
          if body.api_formation?
            enemyFormation = body.api_formation[1]
            enemyIntercept = body.api_formation[2]
          if body.api_kouku.api_stage3?
            afterHp = koukuAttack afterHp, body.api_kouku.api_stage3
          if body.api_kouku? && body.api_kouku.api_stage3_combined?
            combinedAfterHp = koukuAttack combinedAfterHp, body.api_kouku.api_stage3_combined
          if body.api_opening_atack?
            [combinedAfterHp, afterHp] = combinedOpenAttack combinedAfterHp, afterHp, body.api_opening_atack
          if body.api_hougeki1?
            [combinedAfterHp, afterHp] = combinedHougekiAttack combinedAfterHp, afterHp, body.api_hougeki1
          if body.api_hougeki2?
            afterHp = hougekiAttack afterHp, body.api_hougeki2
          if body.api_hougeki3?
            afterHp = hougekiAttack afterHp, body.api_hougeki3
          if body.api_raigeki?
            [combinedAfterHp, afterHp] = combinedRaigekiAttack combinedAfterHp, afterHp, body.api_raigeki
          if body.api_support_info?
            if body.api_support_info.api_support_airatack?
              afterHp = supportAttack afterHp, body.api_support_info.api_support_airatack.api_stage3.api_edam
            else if body.api_support_info.api_support_hourai?
              afterHp = supportAttack afterHp, body.api_support_info.api_support_hourai.api_damage
            else
              afterHp = supportAttack afterHp, body.api_support_info.api_damage
          damageHp = getDamage damageHp, nowHp, afterHp, 0
          combinedDamageHp = getDamage combinedDamageHp, combinedNowHp, combinedAfterHp, 0
          nowHp = Object.clone afterHp
          combinedNowHp = Object.clone combinedAfterHp
        when "/kcsapi/api_req_combined_battle/midnight_battle"
          for tmp, i in shipLv
            shipLv[i] = -1
          for tmp, i in combinedLv
            combinedLv[i] = -1
          {_decks} = window
          flag = true
          getShip = null
          [shipName, shipLv] = getInfo shipName, shipLv, _decks[0].api_ship, body.api_ship_ke, body.api_ship_lv, 0
          [combinedName, combinedLv] = getCombinedInfo combinedName, combinedLv, _decks[1].api_ship
          [maxHp, nowHp] = getHp maxHp, nowHp, body.api_maxhps, body.api_nowhps
          [combinedMaxHp, combinedNowHp] = getHp combinedMaxHp, combinedNowHp, body.api_maxhps_combined, body.api_nowhps_combined
          afterHp = Object.clone nowHp
          combinedAfterHp = Object.clone combinedNowHp
          if body.api_formation?
            enemyFormation = body.api_formation[1]
            enemyIntercept = body.api_formation[2]
          if body.api_hougeki?
            [combinedAfterHp, afterHp] = combinedHougekiAttack combinedAfterHp, afterHp, body.api_hougeki
          damageHp = getDamage damageHp, nowHp, afterHp, 0
          combinedDamageHp = getDamage combinedDamageHp, combinedNowHp, combinedAfterHp, 0
          nowHp = Object.clone afterHp
          combinedNowHp = Object.clone combinedAfterHp
        when "/kcsapi/api_req_combined_battle/sp_midnight"
          for tmp, i in shipLv
            shipLv[i] = -1
          for tmp, i in combinedLv
            combinedLv[i] = -1
          {_decks} = window
          flag = true
          getShip = null
          [shipName, shipLv] = getInfo shipName, shipLv, _decks[0].api_ship, body.api_ship_ke, body.api_ship_lv, 0
          [combinedName, combinedLv] = getCombinedInfo combinedName, combinedLv, _decks[1].api_ship
          [maxHp, nowHp] = getHp maxHp, nowHp, body.api_maxhps, body.api_nowhps
          [combinedMaxHp, combinedNowHp] = getHp combinedMaxHp, combinedNowHp, body.api_maxhps_combined, body.api_nowhps_combined
          afterHp = Object.clone nowHp
          combinedAfterHp = Object.clone combinedNowHp
          if body.api_formation?
            enemyFormation = body.api_formation[1]
            enemyIntercept = body.api_formation[2]
          if body.api_hougeki?
            [combinedAfterHp, afterHp] = combinedHougekiAttack combinedAfterHp, afterHp, body.api_hougeki
          damageHp = getDamage damageHp, nowHp, afterHp, 0
          combinedDamageHp = getDamage combinedDamageHp, combinedNowHp, combinedAfterHp, 0
          nowHp = Object.clone afterHp
          combinedNowHp = Object.clone combinedAfterHp
        when "/kcsapi/api_req_combined_battle/battle_water"
          for tmp, i in shipLv
            shipLv[i] = -1
          for tmp, i in combinedLv
            combinedLv[i] = -1
          {_decks} = window
          flag = true
          getShip = null
          [shipName, shipLv] = getInfo shipName, shipLv, _decks[0].api_ship, body.api_ship_ke, body.api_ship_lv, 0
          [combinedName, combinedLv] = getCombinedInfo combinedName, combinedLv, _decks[1].api_ship
          [maxHp, nowHp] = getHp maxHp, nowHp, body.api_maxhps, body.api_nowhps
          [combinedMaxHp, combinedNowHp] = getHp combinedMaxHp, combinedNowHp, body.api_maxhps_combined, body.api_nowhps_combined
          afterHp = Object.clone nowHp
          combinedAfterHp = Object.clone combinedNowHp
          if body.api_formation?
            enemyFormation = body.api_formation[1]
            enemyIntercept = body.api_formation[2]
          if body.api_kouku.api_stage3?
            afterHp = koukuAttack afterHp, body.api_kouku.api_stage3
          if body.api_kouku? && body.api_kouku.api_stage3_combined?
            combinedAfterHp = koukuAttack combinedAfterHp, body.api_kouku.api_stage3_combined
          if body.api_opening_atack?
            [combinedAfterHp, afterHp] = combinedOpenAttack combinedAfterHp, afterHp, body.api_opening_atack
          if body.api_hougeki1?
            afterHp = hougekiAttack afterHp, body.api_hougeki1
          if body.api_hougeki2?
            afterHp = hougekiAttack afterHp, body.api_hougeki2
          if body.api_hougeki3?
            [combinedAfterHp, afterHp] = combinedHougekiAttack combinedAfterHp, afterHp, body.api_hougeki3
          if body.api_raigeki?
            [combinedAfterHp, afterHp] = combinedRaigekiAttack combinedAfterHp, afterHp, body.api_raigeki
          if body.api_support_info?
            if body.api_support_info.api_support_airatack?
              afterHp = supportAttack afterHp, body.api_support_info.api_support_airatack.api_stage3.api_edam
            else if body.api_support_info.api_support_hourai?
              afterHp = supportAttack afterHp, body.api_support_info.api_support_hourai.api_damage
            else
              afterHp = supportAttack afterHp, body.api_support_info.api_damage
          damageHp = getDamage damageHp, nowHp, afterHp, 0
          combinedDamageHp = getDamage combinedDamageHp, combinedNowHp, combinedAfterHp, 0
          nowHp = Object.clone afterHp
          combinedNowHp = Object.clone combinedAfterHp
        when "/kcsapi/api_req_combined_battle/battleresult"
          flag = true
          tmpShip = " "
          for tmpHp, i in nowHp
            if i < 6 && tmpHp < (maxHp[i] * 0.2500001)
              tmpShip = tmpShip + " " + shipName[i]
          for tmpHp, i in combinedNowHp
            if tmpHp < (combinedMaxHp[i] * 0.2500001)
              tmpShip = tmpShip + " " + combinedName[i]
          if tmpShip != " "
            notify "#{tmpShip} " + __("Heavily damaged"),
              type: 'damaged'
              icon: join(ROOT, 'views', 'components', 'ship', 'assets', 'img', 'state', '4.png')
          if body.api_get_ship?
            enemyInfo = body.api_enemy_info
            getShip = body.api_get_ship
          else
            enemyInfo = null
            getShip = null
          formationFlag = true
          result = body.api_win_rank
        when '/kcsapi/api_req_sortie/battle'
          for tmp, i in shipLv
            shipLv[i] = -1
          {_decks} = window
          flag = true
          [shipName, shipLv] = getInfo shipName, shipLv, _decks[body.api_dock_id - 1].api_ship, body.api_ship_ke, body.api_ship_lv, 0
          [maxHp, nowHp] = getHp maxHp, nowHp, body.api_maxhps, body.api_nowhps
          afterHp = Object.clone nowHp
          getShip = null
          if body.api_formation?
            enemyFormation = body.api_formation[1]
            enemyIntercept = body.api_formation[2]
          if jsonId?
            jsonContent.ship = Object.clone body.api_ship_ke
            jsonContent.ship.splice 0, 1
            jsonContent.lv = Object.clone body.api_ship_lv
            jsonContent.lv.splice 0, 1
            jsonContent.formation = body.api_formation[1]
            jsonContent.totalTyku = getTyku jsonContent.ship, body.api_eSlot
            jsonContent.hp = Object.clone maxHp
            jsonContent.hp.splice 0, 6
            enemyFormation = jsonContent.formation
            enemyTyku = jsonContent.totalTyku
          if body.api_kouku.api_stage3?
            afterHp = koukuAttack afterHp, body.api_kouku.api_stage3
          if body.api_kouku? && body.api_kouku.api_stage3_combined?
            combinedAfterHp = koukuAttack combinedAfterHp, body.api_kouku.api_stage3_combined
          if body.api_opening_atack?
            afterHp = openAttack afterHp, body.api_opening_atack
          if body.api_hougeki1?
            afterHp = hougekiAttack afterHp, body.api_hougeki1
          if body.api_hougeki2?
            afterHp = hougekiAttack afterHp, body.api_hougeki2
          if body.api_hougeki3?
            afterHp = hougekiAttack afterHp, body.api_hougeki3
          if body.api_raigeki?
            afterHp = raigekiAttack afterHp, body.api_raigeki
          if body.api_support_info?
            if body.api_support_info.api_support_airatack?
              afterHp = supportAttack afterHp, body.api_support_info.api_support_airatack.api_stage3.api_edam
            else if body.api_support_info.api_support_hourai?
              afterHp = supportAttack afterHp, body.api_support_info.api_support_hourai.api_damage
            else
              afterHp = supportAttack afterHp, body.api_support_info.api_damage
          damageHp = getDamage damageHp, nowHp, afterHp, 0
          result = getResult damageHp, nowHp
          nowHp = Object.clone afterHp

        when '/kcsapi/api_req_battle_midnight/sp_midnight'
          for tmp, i in shipLv
            shipLv[i] = -1
          {_decks} = window
          flag = true
          getShip = null
          [shipName, shipLv] = getInfo shipName, shipLv, _decks[body.api_deck_id - 1].api_ship, body.api_ship_ke, body.api_ship_lv, 0
          [maxHp, nowHp] = getHp maxHp, nowHp, body.api_maxhps, body.api_nowhps
          afterHp = Object.clone nowHp
          if body.api_formation?
            enemyFormation = body.api_formation[1]
            enemyIntercept = body.api_formation[2]
          if jsonId?
            jsonContent.ship = Object.clone body.api_ship_ke
            jsonContent.ship.splice 0, 1
            jsonContent.lv = Object.clone body.api_ship_lv
            jsonContent.lv.splice 0, 1
            jsonContent.formation = body.api_formation[1]
            jsonContent.totalTyku = getTyku jsonContent.ship, body.api_eSlot
            jsonContent.hp = Object.clone maxHp
            jsonContent.hp.splice 0, 6
            enemyFormation = jsonContent.formation
            enemyTyku = jsonContent.totalTyku
          if body.api_hougeki?
            afterHp = hougekiAttack afterHp, body.api_hougeki
          damageHp = getDamage damageHp, nowHp, afterHp, 0
          result = getResult damageHp, nowHp
          nowHp = Object.clone afterHp

        when '/kcsapi/api_req_sortie/airbattle'
          for tmp, i in shipLv
            shipLv[i] = -1
          {_decks} = window
          flag = true
          getShip = null
          [shipName, shipLv] = getInfo shipName, shipLv, _decks[body.api_dock_id - 1].api_ship, body.api_ship_ke, body.api_ship_lv, 0
          [maxHp, nowHp] = getHp maxHp, nowHp, body.api_maxhps, body.api_nowhps
          afterHp = Object.clone nowHp
          if body.api_formation?
            enemyFormation = body.api_formation[1]
            enemyIntercept = body.api_formation[2]
          if jsonId?
            jsonContent.ship = Object.clone body.api_ship_ke
            jsonContent.ship.splice 0, 1
            jsonContent.lv = Object.clone body.api_ship_lv
            jsonContent.lv.splice 0, 1
            jsonContent.formation = body.api_formation[1]
            jsonContent.totalTyku = getTyku jsonContent.ship, body.api_eSlot
            jsonContent.hp = Object.clone maxHp
            jsonContent.hp.splice 0, 6
            enemyFormation = jsonContent.formation
            enemyTyku = jsonContent.totalTyku
          if body.api_kouku? && body.api_kouku.api_stage3?
            afterHp = koukuAttack afterHp, body.api_kouku.api_stage3
          if body.api_kouku2? && body.api_kouku2.api_stage3?
            afterHp = koukuAttack afterHp, body.api_kouku2.api_stage3
          damageHp = getDamage damageHp, nowHp, afterHp, 0
          result = getResult damageHp, nowHp
          nowHp = Object.clone afterHp

        when '/kcsapi/api_req_battle_midnight/battle'
          flag = true
          nowHp = Object.clone afterHp
          if body.api_hougeki?
            afterHp = hougekiAttack afterHp, body.api_hougeki
          damageHp = getDamage damageHp, nowHp, afterHp, 0
          nowHp = Object.clone afterHp

        when '/kcsapi/api_req_practice/battle'
          for tmp, i in shipLv
            shipLv[i] = -1
          {_decks} = window
          flag = true
          getShip = null
          enemyName = __("PvP")
          [shipName, shipLv] = getInfo shipName, shipLv, _decks[body.api_dock_id - 1].api_ship, body.api_ship_ke, body.api_ship_lv, 1
          [maxHp, nowHp] = getHp maxHp, nowHp, body.api_maxhps, body.api_nowhps
          if body.api_formation?
            enemyFormation = body.api_formation[1]
            enemyIntercept = body.api_formation[2]
          afterHp = Object.clone nowHp
          if body.api_kouku.api_stage3?
            afterHp = koukuAttack afterHp, body.api_kouku.api_stage3
          if body.api_opening_atack?
            afterHp = openAttack afterHp, body.api_opening_atack
          if body.api_hougeki1?
            afterHp = hougekiAttack afterHp, body.api_hougeki1
          if body.api_hougeki2?
            afterHp = hougekiAttack afterHp, body.api_hougeki2
          if body.api_hougeki3?
            afterHp = hougekiAttack afterHp, body.api_hougeki3
          if body.api_raigeki?
            afterHp = raigekiAttack afterHp, body.api_raigeki
          damageHp = getDamage damageHp, nowHp, afterHp, 1
          result = getResult damageHp, nowHp
          nowHp = Object.clone afterHp

        when '/kcsapi/api_req_practice/midnight_battle'
          flag = true
          nowHp = Object.clone afterHp
          if body.api_hougeki?
            afterHp = hougekiAttack afterHp, body.api_hougeki
          damageHp = getDamage damageHp, nowHp, afterHp, 1
          nowHp = Object.clone afterHp

        when '/kcsapi/api_req_practice/battle_result'
          flag = true
          result = body.api_win_rank

        when '/kcsapi/api_req_sortie/battleresult'
          flag = true
          tmpShip = " "
          for tmpHp, i in nowHp
            if i < 6 && tmpHp < (maxHp[i] * 0.2500001)
              tmpShip = tmpShip + " " + shipName[i]
          if tmpShip != " "
            notify "#{tmpShip} " + __("Heavily damaged"),
              type: 'damaged'
              icon: join(ROOT, 'views', 'components', 'ship', 'assets', 'img', 'state', '4.png')
          if jsonId?
            updateJson jsonId, jsonContent
          if body.api_get_ship?
            enemyInfo = body.api_enemy_info
            getShip = body.api_get_ship
          else
            enemyInfo = null
            getShip = null
          formationFlag = true
          result = body.api_win_rank
        when '/kcsapi/api_port/port'
          flag = true
          combinedFlag = body.api_combined_flag
          {_ships} = window
          enemyFormation = 0
          shipLv[i] = -1 for i in [0..11]
          if combinedFlag != 0
            for shipId, i in window._decks[0].api_ship
              continue if shipId == -1
              shipName[i] = _ships[shipId].api_name
              shipLv[i] = _ships[shipId].api_lv
              maxHp[i] = _ships[shipId].api_maxhp
              nowHp[i] = _ships[shipId].api_nowhp
              damageHp[i] = 0
            for shipId, i in window._decks[1].api_ship
              continue if shipId == -1
              combinedName[i] = _ships[shipId].api_name
              combinedLv[i] = _ships[shipId].api_lv
              combinedMaxHp[i] = _ships[shipId].api_maxhp
              combinedNowHp[i] = _ships[shipId].api_nowhp
          else
            _deck = window._decks[deckId]

            shipLv[i] = -1 for i in [0..11]
            for shipId, i in _deck.api_ship
              continue if shipId == -1
              shipName[i] = _ships[shipId].api_name
              shipLv[i] = _ships[shipId].api_lv
              maxHp[i] = _ships[shipId].api_maxhp
              nowHp[i] = _ships[shipId].api_nowhp
              damageHp[i] = 0
              shipCond[i] = _ships[shipId].api_cond
          shipLv[i] = -1 for i in [6..11]
      return unless flag
      @setState
        afterHp: afterHp
        nowHp: nowHp
        maxHp: maxHp
        shipName: shipName
        shipLv: shipLv
        enemyInfo: enemyInfo
        getShip: getShip
        enemyFormation: enemyFormation
        enemyTyku: enemyTyku
        enemyIntercept: enemyIntercept
        enemyName: enemyName
        result: result
        shipCond: shipCond
        deckId: deckId
        enableProphetDamaged: enableProphetDamaged
        prophetCondShow: prophetCondShow
        combinedFlag: combinedFlag
        combinedName: combinedName
        combinedLv: combinedLv
        combinedNowHp: combinedNowHp
        combinedMaxHp: combinedMaxHp
        combinedAfterHp: combinedAfterHp
        combinedDamageHp: combinedDamageHp

    componentDidMount: ->
      window.addEventListener 'game.response', @handleResponse

    render: ->
      if layout == 'horizonal' || window.doubleTabbed
        <div>
          <link rel="stylesheet" href={join(relative(ROOT, __dirname), 'assets', 'prophet.css')} />
          <Alert>
            {
              if @state.combinedFlag == 0
                <Grid>
                  <Col xs={6}>{__("Sortie Fleet")}</Col>
                  <Col xs={6}>{__("HP")}</Col>
                </Grid>
              else
                <Grid>
                  <Col xs={3}>{__("Sortie Fleet")}</Col>
                  <Col xs={3}>{__("HP")}</Col>
                  <Col xs={3}>{__("Sortie Fleet")}</Col>
                  <Col xs={3}>{__("HP")}</Col>
                </Grid>
            }
          </Alert>
          <Table>
            <tbody>
            {
              for tmpName, i in @state.shipName
                continue unless @state.shipLv[i] != -1
                continue unless i < 6
                if @state.combinedFlag == 0
                  <tr key={i + 1}>
                    <td>
                      Lv. {@state.shipLv[i]} - {tmpName}
                      {
                        if @state.prophetCondShow && @state.combinedFlag == 0
                          <span  style={getCondStyle @state.shipCond[i]}>
                            <FontAwesome key={1} name='star' />{@state.shipCond[i]}
                          </span>
                      }
                    </td>
                    <td className="hp-progress">
                      <ProgressBar bsStyle={getHpStyle @state.nowHp[i] / @state.maxHp[i] * 100}
                        now={@state.nowHp[i] / @state.maxHp[i] * 100}
                        label={if @state.damageHp[i] > 0 then "#{@state.nowHp[i]} / #{@state.maxHp[i]} (-#{@state.damageHp[i]})" else "#{@state.nowHp[i]} / #{@state.maxHp[i]}"} />
                    </td>
                  </tr>
                else
                  <tr key={i + 1}>
                    <td>
                      Lv. {@state.shipLv[i]} - {tmpName}
                      {
                        if @state.prophetCondShow && @state.combinedFlag == 0
                          <span  style={getCondStyle @state.shipCond[i]}>
                            <FontAwesome key={1} name='star' />{@state.shipCond[i]}
                          </span>
                      }
                    </td>
                    <td className="hp-progress">
                      <ProgressBar bsStyle={getHpStyle @state.nowHp[i] / @state.maxHp[i] * 100}
                        now={@state.nowHp[i] / @state.maxHp[i] * 100}
                        label={if @state.damageHp[i] > 0 then "#{@state.nowHp[i]} / #{@state.maxHp[i]} (-#{@state.damageHp[i]})" else "#{@state.nowHp[i]} / #{@state.maxHp[i]}"} />
                    </td>
                    <td>
                      Lv. {@state.combinedLv[i]} - {@state.combinedName[i]}
                    </td>
                    <td className="hp-progress">
                      <ProgressBar bsStyle={getHpStyle @state.combinedNowHp[i] / @state.combinedMaxHp[i] * 100}
                        now={@state.combinedNowHp[i] / @state.combinedMaxHp[i] * 100}
                        label={if @state.combinedDamageHp[i] > 0 then "#{@state.combinedNowHp[i]} / #{@state.combinedMaxHp[i]} (-#{@state.combinedDamageHp[i]})" else "#{@state.combinedNowHp[i]} / #{@state.combinedMaxHp[i]}"} />
                    </td>
                  </tr>
            }
            </tbody>
          </Table>
          <Alert>
            <Grid>
              <Col xs={6}>{@state.enemyName}</Col>
              <Col xs={6}>{__("HP")}</Col>
            </Grid>
          </Alert>
          <Table>
            <tbody>
            {
              for tmpName, i in @state.shipName
                continue unless @state.shipLv[i] != -1
                continue unless i >= 6
                <tr key={i}>
                  <td>Lv. {@state.shipLv[i]} - {tmpName}</td>
                  <td className="hp-progress">
                    <ProgressBar bsStyle={getHpStyle @state.nowHp[i] / @state.maxHp[i] * 100}
                      now={@state.nowHp[i] / @state.maxHp[i] * 100}
                      label={if @state.damageHp[i] > 0 then "#{@state.nowHp[i]} / #{@state.maxHp[i]} (-#{@state.damageHp[i]})" else "#{@state.nowHp[i]} / #{@state.maxHp[i]}"} />
                  </td>
                </tr>
            }
            </tbody>
          </Table>
          {
            if @state.getShip? && @state.enemyInfo?
              <Alert>
                {__("Admiral") + " #{@state.getShip.api_ship_type}「#{@state.getShip.api_ship_name}」" + __("Join fleet")}
              </Alert>
            else if @state.enemyFormation != 0
              <Alert>
                {__("Admiral") + " 「#{formation[@state.enemyFormation]}」「#{intercept[@state.enemyIntercept]} | #{@state.result}」"}
              </Alert>
          }
        </div>
      else
        <div>
          <link rel="stylesheet" href={join(relative(ROOT, __dirname), 'assets', 'prophet.css')} />
          <Alert>
            {
              if @state.combinedFlag == 0
                <Grid>
                  <Col xs={3}>{__("Sortie Fleet")}</Col>
                  <Col xs={3}>{__("HP")}</Col>
                  <Col xs={3}>{@state.enemyName}</Col>
                  <Col xs={3}>{__("HP")}</Col>
                </Grid>
              else
                <Grid>
                  <Col xs={2}>{__("Sortie Fleet")}</Col>
                  <Col xs={2}>{__("HP")}</Col>
                  <Col xs={2}>{__("Sortie Fleet")}</Col>
                  <Col xs={2}>{__("HP")}</Col>
                  <Col xs={2}>{@state.enemyName}</Col>
                  <Col xs={2}>{__("HP")}</Col>
                </Grid>
            }
          </Alert>
          <Table>
            <tbody>
            {
              for tmpName, i in @state.shipName
                continue if (@state.shipLv[i] == -1 && @state.shipLv[i + 6] == -1)
                continue if i >= 6
                list = []
                if @state.shipLv[i] == -1
                  for j in [0..1]
                    list.push <td>　</td>
                else
                  list.push <td>
                    Lv. {@state.shipLv[i]} - {tmpName}
                    {
                      if @state.prophetCondShow && @state.combinedFlag == 0
                        <span style={getCondStyle @state.shipCond[i]}>
                          <FontAwesome key={1} name='star' />{@state.shipCond[i]}
                        </span>
                    }
                  </td>
                  list.push <td className="hp-progress"><ProgressBar bsStyle={getHpStyle @state.nowHp[i] / @state.maxHp[i] * 100} now={@state.nowHp[i] / @state.maxHp[i] * 100} label={if @state.damageHp[i] > 0 then "#{@state.nowHp[i]} / #{@state.maxHp[i]} (-#{@state.damageHp[i]})" else "#{@state.nowHp[i]} / #{@state.maxHp[i]}"} /></td>
                  if @state.combinedFlag != 0
                    list.push <td>
                      Lv. {@state.combinedLv[i]} - {@state.combinedName[i]}
                    </td>
                    list.push <td className="hp-progress">
                      <ProgressBar bsStyle={getHpStyle @state.combinedNowHp[i] / @state.combinedMaxHp[i] * 100}
                        now={@state.combinedNowHp[i] / @state.combinedMaxHp[i] * 100}
                        label={if @state.combinedDamageHp[i] > 0 then "#{@state.combinedNowHp[i]} / #{@state.combinedMaxHp[i]} (-#{@state.combinedDamageHp[i]})" else "#{@state.combinedNowHp[i]} / #{@state.combinedMaxHp[i]}"} />
                    </td>
                if @state.shipLv[i + 6] == -1
                  for j in [0..1]
                    list.push <td>　</td>
                else
                  list.push <td>Lv. {@state.shipLv[i + 6]} - {@state.shipName[i + 6]}</td>
                  list.push <td className="hp-progress"><ProgressBar bsStyle={getHpStyle @state.nowHp[i + 6] / @state.maxHp[i + 6] * 100} now={@state.nowHp[i + 6] / @state.maxHp[i + 6] * 100} label={if @state.damageHp[i + 6] > 0 then "#{@state.nowHp[i + 6]} / #{@state.maxHp[i + 6]} (-#{@state.damageHp[i + 6]})" else "#{@state.nowHp[i + 6]} / #{@state.maxHp[i + 6]}"} /></td>
                continue if (@state.shipLv[i] == -1 && @state.shipLv[i + 6] == -1)
                <tr key={i}>
                  {list}
                </tr>
            }
            </tbody>
          </Table>
          {
            if @state.getShip? && @state.enemyInfo?
              <Alert>
                {__("Admiral") + " #{@state.getShip.api_ship_type}「#{@state.getShip.api_ship_name}」" + __("Join fleet")}
              </Alert>
            else if @state.enemyFormation != 0
              <Alert>
                {__("Admiral") + " 「#{formation[@state.enemyFormation]}」「#{intercept[@state.enemyIntercept]} | #{@state.result}」"}
              </Alert>
          }
        </div>
  settingsClass: React.createClass
    getInitialState: ->
      enableProphetDamaged: config.get 'plugin.prophet.notify.damaged'
      prophetCondShow: config.get 'plugin.prophet.show.cond'
    handleSetProphetDamaged: ->
      enabled = @state.enableProphetDamaged
      config.set 'plugin.prophet.notify.damaged', !enabled
      @setState
        enableProphetDamaged: !enabled
    handleSetProphetCond: ->
      enabled = @state.prophetCondShow
      config.set 'plugin.prophet.show.cond', !enabled
      @setState
        prophetCondShow: !enabled
    render: ->
      <div className="form-group">
        <Divider text="未卜先知" />
        <Grid>
          <Col xs={6}>
            <Button bsStyle={if @state.enableProphetDamaged then 'success' else 'danger'} onClick={@handleSetProphetDamaged} style={width: '100%'}>
              {if @state.enableProphetDamaged then '√ ' else ''}开启大破通知
            </Button>
          </Col>
          <Col xs={6}>
            <Button bsStyle={if @state.prophetCondShow then 'success' else 'danger'} onClick={@handleSetProphetCond} style={width: '100%'}>
              {if @state.prophetCondShow then '√ ' else ''}开启Cond显示
            </Button>
          </Col>
        </Grid>
      </div>
