import _ from 'lodash'
import React from 'react'
import { Panel, Grid, Row, Col } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'

import { getShipName } from './utils'
import { equipIsAircraft } from 'views/utils/game-utils'
import { SlotitemIcon } from 'views/components/etc/icon'

import { EngagementTable, ShipInfo, DamageInfo, getStageName } from './detail-area'

import { FABar, HPBar } from './bar'

const { ROOT, getStore } = window
const { __ } = window.i18n["poi-plugin-unexpected-damage-test"]

var _sim_kcsim = require('../lib/sim/kcsim')
var _sim_kcships = require('../lib/sim/kcships')
var _sim_kcshipdata = require('../lib/sim/kcSHIPDATA')

import {
  StageType, AttackType, HitType, ShipOwner,
  AirControl, Engagement, FormationMap, Detection,
  DayAttackTypeMap, NightAttackTypeMap
} from '../lib/battle'

const ShipClass = {
	1: _sim_kcships.DE,
	2: _sim_kcships.DD,
	3: _sim_kcships.CL,
	4: _sim_kcships.CLT,
	5: _sim_kcships.CA,
	6: _sim_kcships.CAV,
	7: _sim_kcships.CVL,
	8: _sim_kcships.FBB,
	9: _sim_kcships.BB,
	10: _sim_kcships.BBV,
	11: _sim_kcships.CV,
	13: _sim_kcships.SS,
	14: _sim_kcships.SSV,
    15: _sim_kcships.AO,  // Enemy AO process as normal AO
	16: _sim_kcships.AV,
	17: _sim_kcships.LHA,
	18: _sim_kcships.CVB,
	19: _sim_kcships.AR,
	20: _sim_kcships.AS,
	21: _sim_kcships.CT,
	22: _sim_kcships.AO,
};

const EngagementMod = {
    [Engagement.Parallel]: 1,
    [Engagement.Headon]: 0.8,
    [Engagement.TAdvantage]: 1.2,
    [Engagement.TDisadvantage]: 0.6,
}

const OwnerCode = {
    OURS: 0,
    ENEMY: 1,
}

const CHECK_THRES = 1.03 // data will be listed in unexpected damage area if bonusMin > CHECK_THRES

function findKey (obj, value, compare = (a, b) => a === b) {
    return Object.keys(obj).find(k => compare(obj[k], value))
}


class UnexpectedDamageRow extends React.PureComponent {
    render() {
      const {attackerHP, attack, damageIndex, bonusMin, bonusMax} = this.props
      var fromShip = attack.fromShip
      var toShip = attack.toShip
      var toShipFromHP = attack.fromHP
      for (let index = 0; index < damageIndex; index ++) toShipFromHP -= attack.damage[index]
      var toShipToHP = toShipFromHP - attack.damage[damageIndex]

      
      var fromShipStatus = attackerHP / fromShip.maxHP
      var fromShipClass = null
      if (fromShipStatus <= 0.25) {
          fromShipClass = "heavily-damaged"
      } else if (fromShipStatus <= 0.50) {
          fromShipClass = "moderately-damaged"
      } else if (fromShipStatus <= 0.75) {
          fromShipClass = "slightly-damaged"
      } else fromShipClass = "healthy"
      return (
        <Row className={"unexpected-damage-row"}>
          <span><ShipInfo ship={fromShip} className={fromShipClass}/></span>
          <span>x{bonusMin.toFixed(3)}-x{bonusMax.toFixed(3)}</span>
          <span><DamageInfo type={attack.actualAttackType} damage={[attack.damage[damageIndex]]} hit={[attack.hit[damageIndex]]} /></span>
          <span><FontAwesome name='long-arrow-right' /></span>
          <span><ShipInfo ship={toShip} /></span>
          <span><HPBar max={toShip.maxHP} from={toShipFromHP} to={toShipToHP} damage={[attack.damage[damageIndex]]} /></span>
        </Row>
      )
    }
}

class UnexpectedDamageExecutor {
    constructor(simulator) {
        this.simulator = simulator
        this.nowHP = null  // record now hp during simulation
        this.fleet = null  // our fleet
        this.enemyFleet = null // enemy fleet
    }

    generateShip = (shipInfo) => {
        var mid = shipInfo.id
        var apiShipInfo = window.getStore(['const', '$ships', mid])
        if (shipInfo.owner == ShipOwner.Enemy) {
            var karyoku = shipInfo.finalParam[0]
            var raisou = shipInfo.finalParam[1]
            var taiku = shipInfo.finalParam[2]
            var soukou = shipInfo.finalParam[3]
            var shipObj = new ShipClass[apiShipInfo.api_stype](  // ignore unused params for enemy ship
                mid, apiShipInfo.api_name, OwnerCode.ENEMY, shipInfo.raw.api_lv,
                shipInfo.initHP, karyoku, raisou, taiku, soukou
            )
            _sim_kcshipdata.SHIPDATA[mid]
        } else {
            var shipObj = new ShipClass[apiShipInfo.api_stype](
                mid, apiShipInfo.api_name, OwnerCode.OURS, shipInfo.raw.api_lv,
                shipInfo.raw.api_nowhp, shipInfo.raw.api_karyoku[0], shipInfo.raw.api_raisou[0], shipInfo.raw.api_taiku[0],
                shipInfo.raw.api_soukou[0], shipInfo.raw.api_kaihi[0], shipInfo.raw.api_taisen[0], shipInfo.raw.api_sakuteki[0],
                shipInfo.raw.api_lucky[0], shipInfo.raw.api_leng, shipInfo.raw.api_onslot
            )
            shipObj.maxHP = shipInfo.maxHP
            shipObj.ammoleft = shipInfo.api_bull * 10 / shipObj.ammo  // 0 - 10 
        }

        var equip_ids = []; var levels = []; var profs = [];
        for (let index=0; index < shipInfo.raw.poi_slot.length; index ++) {
            var equip = shipInfo.raw.poi_slot[index]
            if (equip == null || equip == undefined) continue;
            equip_ids.push(equip.api_slotitem_id)
            levels.push(equip.api_level)
            profs.push(equip.api_alv)
        }
        if (shipInfo.raw.poi_slot_ex) {
            equip_ids.push(shipInfo.raw.poi_slot_ex.api_slotitem_id)
            levels.push(shipInfo.raw.poi_slot_ex.api_level)
            profs.push(null)
        }
        if (equip_ids.length >= 1) {
            shipObj.loadEquips(equip_ids, levels, profs, false)
        }
        return shipObj
    }

    initFleet = () => {
        var mainShip = []
        for(let index=0; index < this.simulator.mainFleet.length; index ++) {
            var shipInfo = this.simulator.mainFleet[index]
            if (shipInfo) mainShip.push(this.generateShip(shipInfo))
        }
        var mainFleet = new _sim_kcships.Fleet(OwnerCode.OURS)
        mainFleet.loadShips(mainShip)

        var enemyShip = []
        for(let index=0; index < this.simulator.enemyFleet.length; index ++) {
            var shipInfo = this.simulator.enemyFleet[index]
            if (shipInfo) enemyShip.push(this.generateShip(shipInfo))
        }
        var enemyFleet = new _sim_kcships.Fleet(OwnerCode.ENEMY)
        enemyFleet.loadShips(enemyShip)

        if (this.simulator.escortFleet) {
            var escortShip= []
            for(let index=0; index < this.simulator.escortFleet.length; index ++) {
                var shipInfo = this.simulator.escortFleet[index]
                if (shipInfo) escortShip.push(this.generateShip(shipInfo))
            }
            var escortFleet = new _sim_kcships.Fleet(mainFleet.side, mainFleet)
            escortFleet.loadShips(escortShip)
        }

        if (this.simulator.enemyEscort) {
            var enemyEscortShip = []
            for(let index=0; index < this.simulator.enemyEscort.length; index ++) {
                var shipInfo = this.simulator.enemyEscort[index]
                if (shipInfo) enemyEscortShip.push(this.generateShip(shipInfo))
            }
            var enemyEscortFleet = new _sim_kcships.Fleet(enemyFleet.side, enemyFleet)
            enemyEscortFleet.loadShips(enemyEscortShip)
        }
        this.fleet = mainFleet
        this.enemyFleet = enemyFleet
    }

    getShip = (owner, pos) => {
        var fleet = (owner==ShipOwner.Ours)? this.fleet: this.enemyFleet
        if (owner==ShipOwner.Ours) pos -= 1 // our: 1 - 12, enemy: 0 - 11 
        if (pos >= fleet.ships.length) {
            fleet = fleet.combinedWith
            pos -= fleet.ships.length
        }
        return fleet.ships[pos]
    }

    getAttackTarget = (attack) => { return this.getShip(attack.toShip.owner, attack.toShip.pos) }

    getAttacker = (attack) => { return this.getShip(attack.fromShip.owner, attack.fromShip.pos) }

    doDamage = (target, damage) => {
        if (damage == 0) return
        target.HP -= damage
    }

    parseEngagementStage = (stageInfo) => {
        this.fFormation = findKey(FormationMap, stageInfo.engagement.fFormation)
        this.engagement = stageInfo.engagement
        this.fleet.setFormation(this.fFormation, this.simulator.fleetType)
    }

    parseShellStage = (stageInfo) => {
        for(let index=0; index < stageInfo.attacks.length; index ++) {
            for (let subIndex=0; subIndex < stageInfo.attacks[index].damage.length; subIndex ++) {
                var attack = stageInfo.attacks[index]
                var damage = attack.damage[subIndex]
                if (damage == 0) continue;

                var attackTargetShip = this.getAttackTarget(attack)
                if (attack.fromShip.owner == ShipOwner.Friend) {  // Todo: supply friend fleet
                    this.doDamage(attackTargetShip, damage)
                    continue
                }


                var attackerShip = this.getAttacker(attack)
                if (!_sim_kcsim.isScratchDamage(attackTargetShip.HP, damage) && attackTargetShip.side == OwnerCode.ENEMY) {
                    var siList = attack.siList.map(equip_id => { return (equip_id == -1)? equip_id: getStore(['const', '$equips', equip_id])})

                    var critStatus = attack.hit[subIndex]
                    if (attackTargetShip.isPT) continue;
                    if (attackerShip.CVshelltype && critStatus == 2) continue; // plane rank bonus too difficulte

                    var theoreticalPower = 0
                    var engagementMod = EngagementMod[this.engagement.engagement]
                    if (attackTargetShip.isSub) {
                        var attackType = findKey(DayAttackTypeMap, attack.type)
                        var actualAttackType = _sim_kcsim.getActualAttackType(attackType, siList)
                        attack.actualAttackType = DayAttackTypeMap[actualAttackType]
                        theoreticalPower = _sim_kcsim.theoreticalASWPower(
                            attackerShip, attackTargetShip, engagementMod, critStatus, stageInfo.subtype
                        )
                    } else if (stageInfo.subtype != StageType.Night) {
                        var attackType = findKey(DayAttackTypeMap, attack.type)
                        var actualAttackType = _sim_kcsim.getActualAttackType(attackType, siList)
                        attack.actualAttackType = DayAttackTypeMap[actualAttackType]
                        theoreticalPower = _sim_kcsim.theoreticalShellPower(
                            attackerShip, attackTargetShip, actualAttackType, engagementMod, critStatus
                        )
                    } else if (stageInfo.subtype == StageType.Night) {
                        var attackType = findKey(NightAttackTypeMap, attack.type)
                        var actualAttackType = _sim_kcsim.getActualNBAttackType(attackType, siList)
                        attack.actualAttackType = NightAttackTypeMap[actualAttackType]
                        // console.log("actualAttackType", actualAttackType)
                        theoreticalPower = _sim_kcsim.theoreticalNBPower(
                            attackerShip, attackTargetShip, actualAttackType, engagementMod, critStatus, (stageInfo.engagement)? stageInfo.engagement.fContact: 0
                        )
                    } else {
                        // console.log("unknown shell stage ", stage)
                    }
                    
                    var bonusMin = (damage / ((attackerShip.ammoleft <= 5)? attackerShip.ammoleft * 0.2: 1) + 0.7 * attackTargetShip.AR) / theoreticalPower
                    var bonusMax = ((damage + 0.999) / ((attackerShip.ammoleft <= 5)? attackerShip.ammoleft * 0.2: 1) - 0.6 + 1.3 * attackTargetShip.AR) / theoreticalPower
                    if (bonusMin > CHECK_THRES) {
                        stageInfo.unexpectedDamageList.push({
                            attackerHP: attackerShip.HP,
                            attack: attack,
                            damageIndex: subIndex,
                            bonusMin: bonusMin,
                            bonusMax: bonusMax,
                        })
                    }
                }
                this.doDamage(attackTargetShip, damage)
            }
        }
    }

    parseTorpedoStage = (stageInfo) => {
        for(let index=0; index < stageInfo.attacks.length; index ++) {
            for (let subIndex=0; subIndex < stageInfo.attacks[index].damage.length; subIndex ++) {
                var attack = stageInfo.attacks[index]
                var damage = attack.damage[subIndex]
                var attackTargetShip = this.getAttackTarget(attack)
                this.doDamage(attackTargetShip, damage)
            }
        }
    }

    parseStageWithoutCalc = (stageInfo) => { // only apply damage
        for(let index=0; index < stageInfo.attacks.length; index ++) {
            for (let subIndex=0; subIndex < stageInfo.attacks[index].damage.length; subIndex ++) {
                var attack = stageInfo.attacks[index]
                var damage = attack.damage[subIndex]
                var attackTargetShip = this.getAttackTarget(attack)
                this.doDamage(attackTargetShip, damage)
            }
        }
    }

    parseStage = () => {
        var stages = this.simulator.stages
        for(let index=0; index < stages.length; index ++) {
            var stageInfo = stages[index]
            if (stageInfo == undefined) continue;
            stageInfo.unexpectedDamageList = []

            switch (stageInfo.type) {
                case StageType.Engagement:
                    this.parseEngagementStage(stageInfo)
                    break
                case StageType.Aerial:
                case StageType.LandBase:
                    this.parseStageWithoutCalc(stageInfo)
                    break
                case StageType.Torpedo:
                    this.parseTorpedoStage(stageInfo) // Todo: calc
                    break
                case StageType.Shelling:
                    this.parseShellStage(stageInfo)
                    break
            }
        }
    }

    init = () => {
        this.initFleet()
        this.combineType = this.simulator.fleetType  // 0, 1, 2, 3
    }
    
    generateResult = () => {
        var filteredStages = this.simulator.stages.filter(stage => {return stage && (stage.unexpectedDamageList.length >= 1)})
        var tables = filteredStages.map((stage) => {
            return (
                <div className={"stage-table"}>
                  <div className={"stage-title"}>{getStageName(stage)}</div>
                    {stage.unexpectedDamageList.map((damageInfo, i) => 
                    <UnexpectedDamageRow key={i} attackerHP={damageInfo.attackerHP} attack={damageInfo.attack} damageIndex={damageInfo.damageIndex}
                     bonusMin={damageInfo.bonusMin} bonusMax={damageInfo.bonusMax}/>)}
                  <hr />
                </div>
            )
        })
        return tables
    }
}


const DEFAULT_EXPANDED = false
class UnexpectedDamageArea extends React.PureComponent {

  render() {
    const { simulator } = this.props
    var executor = new UnexpectedDamageExecutor(simulator)
    // console.log(simulator)
    executor.init()
    // console.log(executor.fleet)
    // console.log(executor.enemyFleet)
    executor.parseStage()

    // console.log('result')
    // console.log(executor.simulator)
    // console.log(executor.fleet, executor.enemyFleet)
    

    return (
      <div id="detail-area">
        <Panel
          collapsible defaultExpanded={DEFAULT_EXPANDED}
        >
        <Panel.Heading>
          <Panel.Title toggle>
            <span>{__("Unexpected Damage")} <FontAwesome name='caret-down' /></span>
          </Panel.Title>
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>
            <div className={"stage-table"}>
              <div className={"stage-title"}></div>
                <EngagementTable engagement={executor.engagement} />
              <hr />
            </div>
            { executor.generateResult() }
          </Panel.Body>
        </Panel.Collapse>
        </Panel>
      </div>
    )
  }
}

export default UnexpectedDamageArea
