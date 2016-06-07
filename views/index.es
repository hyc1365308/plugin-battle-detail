"use strict"

const {remote, React, ReactBootstrap} = window

const AppData = require('../lib/appdata')
const PacketManager = require('../lib/packet-manager')
const ModalArea = require('./modal-area')
const OptionArea = require('./option-area')
const BattleArea = require('./battle-area')

const MAX_PACKET_NUMBER = 64

function updateNonce(nonce) {
  if (typeof nonce == "number")
    return nonce += 1
  else
    return 1
}

class MainArea extends React.Component {
  constructor() {
    super()
    this.state = {
      battle: null,
      battleNonce: 0,
      battleList: [],
      battleListNonce: 0,
      shouldAutoShow: true,
    }
    this.handlePacketBinded = this.handlePacket.bind(this)
    this.showBattleWithTimestampBinded = this.showBattleWithTimestamp.bind(this)
    this.updateBattleBinded = this.updateBattle.bind(this)
  }

  componentDidMount() {
    PacketManager.addListener('packet', this.handlePacketBinded)
    ipc.register("BattleDetail", {
      showBattleWithTimestamp: this.showBattleWithTimestampBinded
    })

    setTimeout(async () => {
      let list = await AppData.listPacket()
      if (!(list && list.length > 0))
        return
      let packets = []
      for (let i = list.length - 1; i >= 0; i--) {
        let packet = await AppData.loadPacket(list[i])
        if (packet != null) {
          packets.push(packet)
        }
        if (packets.length >= MAX_PACKET_NUMBER) {
          break
        }
      }
      // Update state with loaded packets.
      let {battleList, battleListNonce, battle, battleNonce} = this.state
      battleList = battleList.concat(packets).slice(0, MAX_PACKET_NUMBER)
      this.setState({
        battle: battleList[0],
        battleNonce: updateNonce(battleNonce),
        battleList: battleList,
        battleListNonce: updateNonce(battleListNonce),
      })
    })
  }

  componentWillUnmount() {
    PacketManager.removeListener('packet', this.handlePacketBinded)
    ipc.unregisterAll("BattleDetail")
  }

  async handlePacket(newTime, newBattle) {
    let {battle, battleNonce, battleList, battleListNonce, shouldAutoShow} = this.state
    if ((battleList[0] || {}).time == newTime) {
      battleList[0] = newBattle
      battleListNonce = updateNonce(battleListNonce)
    } else {
      battleList.unshift(newBattle)
      battleListNonce = updateNonce(battleListNonce)
      while (battleList.length > MAX_PACKET_NUMBER) {
        battleList.pop()
      }
    }
    if (shouldAutoShow) {
      battle = newBattle
      battleNonce = updateNonce(battleNonce)
    }
    AppData.savePacket(PacketManager.getId(newBattle), newBattle)
    this.setState({battle, battleNonce, battleList, battleListNonce})
  }

  // API for IPC
  async showBattleWithTimestamp(timestamp, callback) {
    let message = null
    if (typeof timestamp == "number") {
      let start = timestamp - 2000
      let end = timestamp + 2000
      let list = await AppData.searchPacket(start, end)
      if (list == null) {
        message = __("Unknown error")
      } else if (list.length == 1) {
        try {
          let packet = await AppData.loadPacket(list[0])
          this.updateBattle(packet)
          remote.getCurrentWindow().show()
        } catch (err) {
          message = __("Unknown error")
          console.error(err)
        }
      } else if (list.length <= 0) {
        message = __("Battle not found")
      } else if (list.length >= 2) {
        message = __("Multiple battle found")
      }
    } else {
      message = __("Unknown error")
    }
    if (callback) {
      callback(message)
    }
  }

  // API for Component <OptionArea />
  //   battle=null: using last battle and set `shouldAutoShow` to true.
  updateBattle(battle) {
    if (battle != null) {
      this.setState({
        shouldAutoShow: false,
        battle: battle,
        battleNonce: updateNonce(this.state.battleNonce),
      })
    } else {
      this.setState({
        shouldAutoShow: true,
        battle: this.state.battleList[0],
        battleNonce: updateNonce(this.state.battleNonce),
      })
    }
  }

  render() {
    return (
      <div id="main">
        <ModalArea />
        <OptionArea
          battle={this.state.battle}
          battleNonce={this.state.battleNonce}
          battleList={this.state.battleList}
          battleListNonce={this.state.battleListNonce}
          shouldAutoShow={this.state.shouldAutoShow}
          updateBattle={this.updateBattleBinded}
          />
        <BattleArea
          battle={this.state.battle}
          nonce={this.state.battleNonce}
          />
      </div>
    )
  }
}

export default MainArea
