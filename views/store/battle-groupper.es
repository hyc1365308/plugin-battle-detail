/*

  This module deals with a sorted Array of battles and group them
  into sorties.

 */

import _ from 'lodash'
import { List } from 'immutable'

import {
  parseBattleMapAndTime,
  getFcdMapInfoFuncSelector,
} from './records'

import {
  prepareNextEdges,
} from '../browse-area/sortie-viewer/groupping'

// TODO: cargoculted from sortie-viewer selectors, to be cleaned up.
const mapCanGoFromTo = mapInfo => {
  if (_.isEmpty(mapInfo)) {
    return (_begin, _end) => false
  }

  const nextEdges = prepareNextEdges(mapInfo)
  /*
    TODO: Regarding this implementation, we can do better than relying the "5 steps assumption" described below:
    we can treat edge ids as labels and propagate them forward (though BFS, probably) along viable paths.
    This way answering whether going (directly or indirectly due to missing nodes) from edge u to edge v is possible
    is simply querying on labels attached to edge v and asking whether edge u is there - preprocessing requried but
    we can get rid of memoization.
   */
  // if it's possible to go from one edge to another
  const canGoFromToImpl = (beginEdgeId, endEdgeId) => {
    /*
       to go from one edge to another means to go from end node of 'beginEdgeId'
       to begin node of `endEdgeId`.
     */
    const [_node1, beginNode] = mapInfo.route[beginEdgeId]
    const [endNode, _node2] = mapInfo.route[endEdgeId]
    if (!beginNode || !endNode)
      return false

    /*
       let's assume that it's only possible to go from one edge to another
       if it can be done within 5 steps. The definition of a step
       is to go from one node to another one through an edge.
     */
    const search = (curNode, remainedSteps = 5) => {
      if (curNode === endNode)
        return true
      if (remainedSteps <= 0)
        return false
      const nextEdgeIds = nextEdges[curNode]
      if (!nextEdgeIds)
        return false
      for (let i=0; i<nextEdgeIds.length; ++i) {
        const nextEdgeId = nextEdgeIds[i]
        const [_node, nextNode] = mapInfo.route[nextEdgeId]
        if (search(nextNode,remainedSteps-1))
          return true
      }
      return false
    }
    return search(beginNode)
  }
  const canGoFromTo = _.memoize(
    canGoFromToImpl,
    // key resolving
    (eFrom, eTo) => `${eFrom}=>${eTo}`
  )

  return canGoFromTo
}

const groupBattleIndexes = _store => battles => {
  const battleCounts = new Map()
  battles.forEach(battle => {
    const parsed = parseBattleMapAndTime(battle.map, battle.time_)
    if (parsed === null) {
      console.warn(`cannot parse: ${battle.map}, ${battle.time_}`)
      return
    }
    const {effMapId} = parsed
    if (battleCounts.has(effMapId)) {
      battleCounts.set(effMapId, battleCounts.get(effMapId) + 1)
    } else {
      battleCounts.set(effMapId, 1)
    }
  })
  const xs = [...battleCounts.entries()]
  xs.sort((a,b) => {
    const l = a[0]
    const r = b[0]
    return l < r ? -1 : l > r ? 1 : 0
  })
  xs.forEach(([effMapId, count]) => {
    console.log(`mapId: ${effMapId}, count: ${count}`)
  })

  /*
    This is the new version of sortieIndexes that uses immutable structures
    for efficient list insertion.
   */
  let sortieIndexes = List()
  console.log(sortieIndexes)
}

export {
  groupBattleIndexes,
  mapCanGoFromTo,
}
