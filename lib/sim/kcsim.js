exports.__esModule = true

//------- kcEQDATA vars
var _kc_eqdata = require('./kcEQDATA')
FIGHTER = _kc_eqdata.FIGHTER
DIVEBOMBER = _kc_eqdata.DIVEBOMBER
TORPBOMBER = _kc_eqdata.TORPBOMBER
B_APSHELL = _kc_eqdata.B_APSHELL
B_RADAR = _kc_eqdata.B_RADAR
SUBRADAR = _kc_eqdata.SUBRADAR

//-------- kcSHIPDATA vars
var _kc_shipdata = require('./kcSHIPDATA')
SHIPDATA = _kc_shipdata.SHIPDATA

//-------- poi data
const { getStore } = window


var LINEAHEAD = {shellmod:1,torpmod:1,ASWmod:.6,AAmod:1, shellacc:1,torpacc:1,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:1};
var DOUBLELINE = {shellmod:.8,torpmod:.8,ASWmod:.8,AAmod:1.2, shellacc:1.2,torpacc:.8,NBacc:.9, shellev:1,torpev:1,NBev:1,ASWev:1, id:2};
var DIAMOND = {shellmod:.7,torpmod:.7,ASWmod:1.2,AAmod:1.6, shellacc:1,torpacc:.4,NBacc:.7, shellev:1.1,torpev:1.1,NBev:1,ASWev:1, id:3};
var ECHELONOLD = {shellmod:.6,torpmod:.6,ASWmod:1,AAmod:1, shellacc:1.2,torpacc:.6,NBacc:.8, shellev:1.2,torpev:1.3,NBev:1.1,ASWev:1.3, id:4};
var ECHELON = {shellmod:.75,torpmod:.6,ASWmod:1.1,AAmod:1, shellacc:1.2,torpacc:.75,NBacc:.9, shellev:1.45,torpev:1.3,NBev:1.3,ASWev:1.3, id:4};
var LINEABREAST = {shellmod:.6,torpmod:.6,ASWmod:1.3,AAmod:1, shellacc:1.2,torpacc:.3,NBacc:.8, shellev:1.3,torpev:1.4,NBev:1.2,ASWev:1.1, id:5};
var VANGUARD1 = {shellmod:0.5,torpmod:1,ASWmod:1,AAmod:1.1, shellacc:1,torpacc:1,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:6};
var VANGUARD2 = {shellmod:1,torpmod:1,ASWmod:.6,AAmod:1.1, shellacc:1,torpacc:1,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:6};

// Acc Base source: https://twitter.com/Xe_UCH/status/1172380690207215616
// Based on past 6-5 data, acc mod for 3rd formation is likely 0.7
// Guess: shellmod = shellaccmod, torpmod = torpaccmod, ASWmod = ASWaccmod
var CTFCOMBINED1M = {combineType: 1, shellmod:.8,torpmod:.7,ASWmod:1.3,AAmod:1.1, shellbonus:2,shellbonusE:10,accbase:78, shellacc:.8,torpacc:.7,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:11};
var CTFCOMBINED1E = {combineType: 1, shellmod:.8,torpmod:.7,ASWmod:1.3,AAmod:1.1, shellbonus:10,shellbonusE:5,accbase:43, shellacc:.8,torpacc:.7,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:11};
var CTFCOMBINED2M = {combineType: 1, shellmod:1,torpmod:.9,ASWmod:1.1,AAmod:1, shellbonus:2,shellbonusE:10,accbase:78, shellacc:1,torpacc:.9,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:12};
var CTFCOMBINED2E = {combineType: 1, shellmod:1,torpmod:.9,ASWmod:1.1,AAmod:1, shellbonus:10,shellbonusE:5,accbase:43, shellacc:1,torpacc:.9,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:12};
var CTFCOMBINED3M = {combineType: 1, shellmod:.7,torpmod:.6,ASWmod:1,AAmod:1.5, shellbonus:2,shellbonusE:10,accbase:78, shellacc:.7,torpacc:.6,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:13};
var CTFCOMBINED3E = {combineType: 1, shellmod:.7,torpmod:.6,ASWmod:1,AAmod:1.5, shellbonus:10,shellbonusE:5,accbase:43, shellacc:.7,torpacc:.6,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:13};
var CTFCOMBINED4M = {combineType: 1, shellmod:1.1,torpmod:1,ASWmod:.7,AAmod:1, shellbonus:2,shellbonusE:10,accbase:78, shellacc:1.1,torpacc:1,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:14};
var CTFCOMBINED4E = {combineType: 1, shellmod:1.1,torpmod:1,ASWmod:.7,AAmod:1, shellbonus:10,shellbonusE:5,accbase:43, shellacc:1.1,torpacc:1,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:14};

var STFCOMBINED1M = {combineType: 2, shellmod:.8,torpmod:.7,ASWmod:1.3,AAmod:1.1, shellbonus:10,shellbonusE:5,accbase:46, shellacc:.8,torpacc:.7,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:11};
var STFCOMBINED1E = {combineType: 2, shellmod:.8,torpmod:.7,ASWmod:1.3,AAmod:1.1, shellbonus:-5,shellbonusE:-5,accbase:70, shellacc:.8,torpacc:.7,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:11};
var STFCOMBINED2M = {combineType: 2, shellmod:1,torpmod:.9,ASWmod:1.1,AAmod:1, shellbonus:10,shellbonusE:5,accbase:46, shellacc:1,torpacc:.9,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:12};
var STFCOMBINED2E = {combineType: 2, shellmod:1,torpmod:.9,ASWmod:1.1,AAmod:1, shellbonus:-5,shellbonusE:-5,accbase:70, shellacc:1,torpacc:.9,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:12};
var STFCOMBINED3M = {combineType: 2, shellmod:.7,torpmod:.6,ASWmod:1,AAmod:1.5, shellbonus:10,shellbonusE:5,accbase:46, shellacc:.7,torpacc:.6,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:13};
var STFCOMBINED3E = {combineType: 2, shellmod:.7,torpmod:.6,ASWmod:1,AAmod:1.5, shellbonus:-5,shellbonusE:-5,accbase:70, shellacc:.7,torpacc:.6,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:13};
var STFCOMBINED4M = {combineType: 2, shellmod:1.1,torpmod:1,ASWmod:.7,AAmod:1, shellbonus:10,shellbonusE:5,accbase:46, shellacc:1.1,torpacc:1,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:14};
var STFCOMBINED4E = {combineType: 2, shellmod:1.1,torpmod:1,ASWmod:.7,AAmod:1, shellbonus:-5,shellbonusE:-5,accbase:70, shellacc:1.1,torpacc:1,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:14};

var TTFCOMBINED1M = {combineType: 3, shellmod:.8,torpmod:.7,ASWmod:1.3,AAmod:1.1, shellbonus:-5,shellbonusE:10,accbase:51, shellacc:.8,torpacc:.7,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:11};
var TTFCOMBINED1E = {combineType: 3, shellmod:.8,torpmod:.7,ASWmod:1.3,AAmod:1.1, shellbonus:10,shellbonusE:5,accbase:45, shellacc:.8,torpacc:.7,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:11};
var TTFCOMBINED2M = {combineType: 3, shellmod:1,torpmod:.9,ASWmod:1.1,AAmod:1, shellbonus:-5,shellbonusE:10,accbase:51, shellacc:1,torpacc:.9,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:12};
var TTFCOMBINED2E = {combineType: 3, shellmod:1,torpmod:.9,ASWmod:1.1,AAmod:1, shellbonus:10,shellbonusE:5,accbase:45, shellacc:1,torpacc:.9,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:12};
var TTFCOMBINED3M = {combineType: 3, shellmod:.7,torpmod:.6,ASWmod:1,AAmod:1.5, shellbonus:-5,shellbonusE:10,accbase:51, shellacc:.7,torpacc:.6,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:13};
var TTFCOMBINED3E = {combineType: 3, shellmod:.7,torpmod:.6,ASWmod:1,AAmod:1.5, shellbonus:10,shellbonusE:5,accbase:45, shellacc:.7,torpacc:.6,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:13};
var TTFCOMBINED4M = {combineType: 3, shellmod:1.1,torpmod:1,ASWmod:.7,AAmod:1, shellbonus:-5,shellbonusE:10,accbase:51, shellacc:1.1,torpacc:1,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:14};
var TTFCOMBINED4E = {combineType: 3, shellmod:1.1,torpmod:1,ASWmod:.7,AAmod:1, shellbonus:10,shellbonusE:5,accbase:45, shellacc:1.1,torpacc:1,NBacc:1, shellev:1,torpev:1,NBev:1,ASWev:1, id:14};

var ALLFORMATIONS = {1:LINEAHEAD,2:DOUBLELINE,3:DIAMOND,4:ECHELON,5:LINEABREAST,6:VANGUARD1,
    '111':CTFCOMBINED1M,'111E':CTFCOMBINED1E,'112':CTFCOMBINED2M,'112E':CTFCOMBINED2E,'113':CTFCOMBINED3M,'113E':CTFCOMBINED3E,'114':CTFCOMBINED4M,'114E':CTFCOMBINED4E,
    '211':STFCOMBINED1M,'211E':STFCOMBINED1E,'212':STFCOMBINED2M,'212E':STFCOMBINED2E,'213':STFCOMBINED3M,'213E':STFCOMBINED3E,'214':STFCOMBINED4M,'214E':STFCOMBINED4E,
    '311':TTFCOMBINED1M,'311E':TTFCOMBINED1E,'312':TTFCOMBINED2M,'312E':TTFCOMBINED2E,'313':TTFCOMBINED3M,'313E':TTFCOMBINED3E,'314':TTFCOMBINED4M,'314E':TTFCOMBINED4E,
};


var ARTILLERYSPOTDATA = {
    2: { dmgMod: 1.2, accMod: 1.1, chanceMod: 1.3, numHits: 2, name: 'DA' },
    3: { dmgMod: 1.1, accMod: 1.3, chanceMod: 1.2, name: 'Sec. CI' },
    4: { dmgMod: 1.2, accMod: 1.5, chanceMod: 1.3, name: 'Radar CI' },
    5: { dmgMod: 1.3, accMod: 1.3, chanceMod: 1.4, name: 'AP+Sec. CI' },
    6: { dmgMod: 1.5, accMod: 1.2, chanceMod: 1.5, name: 'AP CI' },
    71: { dmgMod: 1.25, accMod: 1.25, chanceMod: 1.25, id: 7, name: 'CVCI (FBA)' },   // acc data: https://twitter.com/kankenRJ/status/992626236391239680
    72: { dmgMod: 1.2, accMod: 1.2, chanceMod: 1.4, id: 7, name: 'CVCI (BBA)' },
    73: { dmgMod: 1.15, accMod: 1.15, chanceMod: 1.55, id: 7, name: 'CVCI (BA)' },
    200: { dmgMod: 1.35, accMod: 1.2, chanceMod: 1.2, name: 'Zuiun CI' },
    201: { dmgMod: 1.3, accMod: 1.2, chanceMod: 1.3, name: 'DB CI' },
}

var NBATTACKDATA = {
    1: { dmgMod: 1.2, accMod: 1.1, chanceMod: 0, numHits: 2, name: 'DA' },
    2: { dmgMod: 1.3, accMod: 1.5, chanceMod: 1.15, numHits: 2, torpedo: true, name: 'Mixed CI' },
    3: { dmgMod: 1.5, accMod: 1.65, chanceMod: 1.22, numHits: 2, torpedo: true, name: 'Torpedo CI' },
    4: { dmgMod: 1.75, accMod: 1.5, chanceMod: 1.3, name: 'Sec. Gun CI' },
    5: { dmgMod: 2, accMod: 2, chanceMod: 1.4, name: 'Main Gun CI' },
    31: { dmgMod: 1.75, accMod: 1.65, chanceMod: 1.05, id: 3, numHits: 2, torpedo: true, name: 'SSCI (TR)' },  // Chance Mod data: https://docs.google.com/spreadsheets/d/1XaP5z9_IOktGWL6mu_ZTZv5Z0TbvgRL_91fA_fsb0fc/edit#gid=0
    32: { dmgMod: 1.6, accMod: 1.65, chanceMod: 1.1, id: 3, numHits: 2, torpedo: true, name: 'SSCI (TT)' },
    61: { dmgMod: 1.25, accMod: 1.25, chanceMod: 1.05, id: 6, name: 'CVCI (1.25)' },
    62: { dmgMod: 1.2, accMod: 1.2, chanceMod: 1.15, id: 6, name: 'CVCI (1.2)' },
    63: { dmgMod: 1.18, accMod: 1.2, chanceMod: 1.25, id: 6, name: 'CVCI (1.18)' },
    64: { dmgMod: 1.2, accMod: 1.2, chanceMod: 1.15, id: 6, name: 'CVCI (1.2, suisei)' },
    7: { dmgMod: 1.3, accMod: 1.5, chanceMod: 1.15, improve: 11, improveChance: .65, torpedo: true, name: 'DDCI (GTR)' },  // data: https://twitter.com/dewydrops/status/1404966491695378433
    8: { dmgMod: 1.2, accMod: 1.65, chanceMod: 1.4, improve: 12, improveChance: .5, torpedo: true, name: 'DDCI (LTR)' },
    9: { dmgMod: 1.5, accMod: 1.65, chanceMod: 1.22, improve: 13, improveChance: .8, torpedo: true, name: 'DDCI (LTT)' },
    10: { dmgMod: 1.3, accMod: 1.65, chanceMod: 1.22, improve: 14, improveChance: .55, torpedo: true, name: 'DDCI (LTD)' },
    11: { dmgMod: 1.3, accMod: 1.5, chanceMod: 1.15, numHits: 2, torpedo: true, name: 'DDCI (GTR, double)' },
    12: { dmgMod: 1.2, accMod: 1.65, chanceMod: 1.4, numHits: 2, torpedo: true, name: 'DDCI (LTR, double)' },
    13: { dmgMod: 1.5, accMod: 1.65, chanceMod: 1.22, numHits: 2, torpedo: true, name: 'DDCI (LTT, double)' },
    14: { dmgMod: 1.3, accMod: 1.65, chanceMod: 1.22, numHits: 2, torpedo: true, name: 'DDCI (LTD, double)' },
}

var MECHANICS = {
    flagProtect: true,
    aswSynergy: true,
    artillerySpotting: true,
    OASW: true,
    APmod: true,
    AACI: true,
    fitGun: true,
    morale: true,
    fixFleetAA: true,
    newSupply: true,
    CVCI: true,
    destroyerNBCI: true,
    LBASBuff: true,
    zuiunCI: true,
    aaResist: true,
    visibleEquipBonus: false,  // default bonus contains blue bonus & equip bonus
    newVanguardMod: true,
};
var SHELLDMGCAP = 220;
var NIGHTDMGCAP = 360;
var TORPDMGCAP = 180;
var AIRSTRIKEDMGCAP = 170;
var ASWDMGCAP = 170;
var SUPPORTDMGCAP = 170;
var C = true;

function getSpecialAttackMod(ship, attackSpecial, engagementMod) {
    let mod = 1;
    if (attackSpecial == 100) {
        mod = 2;
        if (engagementMod == 0.6) mod *= 1.25;
    } else if (attackSpecial == 101) {
        mod = (ship.isflagship)? 1.4 : 1.2;
        if (ship.fleet.ships[1].mid == 276) {
            mod *= ((ship.isflagship)? 1.15 : 1.35);
        } else if (ship.fleet.ships[1].mid == 573) {
            mod *= ((ship.isflagship)? 1.2 : 1.4);
        } else if (ship.fleet.ships[1].mid == 576) {
            mod *= ((ship.isflagship)? 1.1 : 1.25);
        }
        if (ship.equiptypesB[B_APSHELL]) mod *= 1.35;
        if (ship.hasLOSRadar) mod *= 1.15;
    } else if (attackSpecial == 102) {
        mod = (ship.isflagship)? 1.4 : 1.2;
        if (ship.fleet.ships[1].mid == 541) {
            mod *= ((ship.isflagship)? 1.2 : 1.4);
        }
        if (ship.equiptypesB[B_APSHELL]) mod *= 1.35;
        if (ship.hasLOSRadar) mod *= 1.15;
    } else if (attackSpecial == 103) {
        if (ship.isflagship) {
            mod = 1.3;
            if (ship.equiptypesB[B_APSHELL]) mod *= 1.35;
            if (ship.hasLOSRadar) mod *= 1.15;
        } else if (ship.num == 2) {
            mod = 1.15;
            if ([19,88,93].indexOf(ship.sclass) != -1) mod *= 1.1;
            if (ship.equiptypesB[B_APSHELL]) mod *= 1.35;
            if (ship.hasLOSRadar) mod *= 1.15;
        } else {
            mod = 1.15;
            let ship1 = ship.fleet.ships[1];
            apiShipInfo = getStore(['const', '$ships', ship1.mid])
            if ([19,88,93].indexOf(ship.sclass) != -1) {
                mod *= 1.15;
                if ([19,88,93].indexOf(ship1.sclass) != -1) mod *= 1.1;
                if (ship1.equiptypesB[B_APSHELL] || ship1.hasLOSRadar){
                    if (ship1.equiptypesB[B_APSHELL]) mod *= 1.35;
                    if (ship1.hasLOSRadar) mod *= 1.15;
                }else{
                    if (ship.equiptypesB[B_APSHELL]) mod *= 1.35;
                    if (ship.hasLOSRadar) mod *= 1.15;
                }
            }else if (apiShipInfo.api_slot_num == 5 && ship1.equips.length == 5 && (ship1.equips[4].btype == B_APSHELL || (ship1.equips[4].btype == B_RADAR && ship1.equips[4].LOS >= 5)) && ship.equips.length > 0){
                if (ship1.equiptypesB[B_APSHELL]) mod *= 1.35;
                if (ship1.hasLOSRadar) mod *= 1.15;
                if (ship1.equips[4].btype == B_APSHELL) mod *= 1.35;
                if (ship1.equips[4].btype == B_RADAR && ship1.equips[4].LOS >= 5) mod *= 1.15;
            }
        }
    } else if (attackSpecial == 104) {
        mod = 1.9;
        if (engagementMod == 1.2) mod *= 1.25;
        else if (engagementMod == .6) mod *= .75;
    }
    return mod;
}

function isScratchDamage(hp, damage) {
    min_damage = Math.floor(hp * .06)
    max_damage = Math.floor(hp * .14)
    return damage >= min_damage && damage <= max_damage
}

function dmgSpecialTarget(dmg, ship, target){
    if (target.installtype == 3){
        dmg *= (ship.supplyPostMult || 1);
        if (ship instanceof LandBase && target.mid <= 1658) dmg += 100;
    }
    if (target.isPT) {
        dmg = 0.35 * dmg + 15;
    }
    if (target.isAnchorage) dmg *= ship.anchoragePostMult || 1;
    else if (target.isSummerBBHime) dmg *= ship.summerBBHimePostMult || 1;
    else if (target.isSummerCAHime) dmg *= ship.summerCAHimePostMult || 1;
    else if (target.isFrenchBBHime) dmg *= ship.FrenchBBHimePostMult || 1;
    return Math.floor(dmg);
}

function damage(ship, target, base, preMod, postMod, cap, plane) {
    if (typeof preMod === 'undefined') preMod = 1;
    if (typeof postMod === 'undefined') postMod = 1;
    if (C) console.log(ship, target, preMod, postMod, cap, plane)

    var dmg = base;
    if (typeof preMod === 'object'){
        dmg *= preMod[0]; 
        dmg += preMod[1]; 
        if (C) console.log('    premod:'+preMod[0].toFixed(2)+' dmg after premod:'+dmg.toFixed(1));
    }else{
        dmg *= preMod;
        if (C) console.log('    premod:'+preMod.toFixed(2)+' dmg after premod:'+dmg.toFixed(1));
    }

    if (dmg > cap) {
        dmg = cap + Math.sqrt(dmg-cap);
        if (C) console.log('    cap:'+cap+' dmg after cap:'+dmg.toFixed(1));
    }

    dmg = dmgSpecialTarget(dmg,ship,target,plane);
    if (typeof postMod === 'object'){
        dmg *= (postMod.postMod || 1);
        if (C) console.log('    postmod:'+(postMod.postMod||1).toFixed(2)+' dmg after postmod:'+dmg.toFixed(1));
        if (postMod.apMod && postMod.apMod !== 1) {
            dmg = Math.floor(dmg*postMod.apMod);
            if (C) console.log('    apmod:'+postMod.apMod.toFixed(2)+' dmg after apmod:'+dmg);
        } 
        if (postMod.critMod && postMod.critMod !== 1) {
            dmg = Math.floor(dmg*postMod.critMod);
            if (C) console.log('    critmod:'+postMod.critMod.toFixed(2)+' dmg after critmod:'+dmg);
        }
    }else{
        dmg *= postMod;
        if (C) console.log('    postmod:'+postMod.toFixed(2)+' dmg after postmod:'+dmg.toFixed(1));
    }
	if (target.isSub) dmg += (ship.aswPenetrate || 0);
    if (C) console.log('    returned:'+dmg);
    return dmg;
}

function theoreticalNBPower(ship, target, attackType, engagementMod, critStatus, nightscouts) {
    if (C) console.log("theoreticalNBPower", ship, target, attackType, engagementMod, critStatus, nightscouts)
    attackType = parseInt(attackType)
    var bonus = (nightscouts)? 5: 0

    var preMod = ship.damageMod()
    let attackData = NBATTACKDATA[attackType]
    if (attackData) {
        let dmgMod = attackData.dmgMod;
        if ([7,8,11,12].indexOf(attackType) !== -1) { //D-gun bonus
            let count = 0, count2 = 0;
            for (let equip of ship.equips) {
                if (equip.mid == 267) { count++; }
                if (equip.mid == 366) { count++; count2++; }
            }
            if (count) dmgMod *= 1.25;
            if (count >= 2) dmgMod *= 1.125;
            if (count2) dmgMod *= 1.05;
        }
        preMod *= dmgMod;
    }
    if ([100, 101, 102, 103].indexOf(attackType) != -1) preMod *= getSpecialAttackMod(ship, attackType, engagementMod)
    if (ship.getFormation() == VANGUARD1) {
        preMod *= 0.5
    }

    var postMod = 1
    if (target.isPT) {
		postMod *= (ship.ptDmgMod||1) * .6;
	}
    var critMod = (critStatus == 2)? 1.5: 1 // ignore CV critical

    var dmg = damage(
        ship, target, ship.NBPower(target, bonus), [preMod, ship.FPfit||0], 
        { postMod: postMod, critMod: critMod }, NIGHTDMGCAP
    );
    return dmg
}

function theoreticalASWPower(ship, target, engagementMod, critStatus, stageSubType) {
    // console.log("theoreticalASWPower", ship, target, attackType, engagementMod, critStatus, stageSubType)
    var preMod = preMod = (stageSubType == "Night")? 0 : ship.getFormation().ASWmod * engagementMod * ship.damageMod();
    var critMod = (critStatus == 2)? 1.5: 1 // ignore CV critical
    // console.log(ship, ship.ASWPower())
    var dmg = damage(ship, target, ship.ASWPower(), preMod, { critMod: critMod }, ASWDMGCAP);
    return dmg
}

function theoreticalShellPower(ship, target, attackType, engagementMod, critStatus) {  // power before calculate Armor
    attackType = parseInt(attackType)
    var preMod = ship.getFormation().shellmod * engagementMod * ship.damageMod();

    var postMod = 1
    if (ARTILLERYSPOTDATA[attackType]) postMod *= ARTILLERYSPOTDATA[attackType].dmgMod
    if ([100, 101, 102, 103].indexOf(attackType) != -1) postMod *= getSpecialAttackMod(ship, attackType, engagementMod)
    if (target.isPT) postMod *= (ship.ptDmgMod || 1);
    var apMod = ship.APmod(target)

    var critMod = (critStatus == 2)? 1.5: 1 // ignore CV critical

    var basePowShell = null
    if (ship.fleet.formation.id < 10) {
        basePowShell = (target.fleet.formation.id <10)? 0: 5
    } else {
        basePowShell = (target.fleet.formation.id <10)? ship.fleet.formation.shellbonus: ((ship.fleet.isescort || ship.fleet.formation.combineType == 3)? -5: 2)
    }

    var dmg = damage(
        ship, target, ship.shellPower(target, basePowShell), [preMod,ship.FPfit||0],
        { postMod:postMod, apMod:apMod, critMod:critMod }, SHELLDMGCAP
    );
    // console.log("dmg", dmg)
    return dmg
}

function theoreticalTorpPower(ship, target, engagementMod, critStatus) {
    var basePowTorp = (ship.fleet.formation.id >= 11)? 0: ((target.fleet.formation.id >= 11)? 15 : 5);
	var power = basePowTorp + ship.TP + (ship.improves.Ptorp || 0);
	power *= ship.getFormation().torpmod * engagementMod * ship.damageMod(true)
	if (power > TORPDMGCAP) power = TORPDMGCAP + Math.sqrt(power - TORPDMGCAP);

    var critMod = (critStatus == 2)? 1.5: 1
    var dmg = damage(ship, target, power, 1, { postMod:1, critMod:critMod }, 10000); // power already capped
    return dmg
}

function getActualAttackType(attackType, siList) { // poi cannot solve CVCI
    if (attackType == 7) {  // CVCI
        var diveBomberCount = 0, fighterCount = 0, torpBomberCount = 0
        for (let index=0; index < siList.length; index ++) {
            switch (siList[index].api_type[2]) {
                case FIGHTER:
                    fighterCount += 1
                    break
                case DIVEBOMBER:
                    diveBomberCount += 1
                    break
                case TORPBOMBER:
                    torpBomberCount += 1
                    break
                default:
                    console.error("unrecognized CVCI equip", siList[index])
            }
        }
        if (diveBomberCount == 1 && fighterCount == 1 && torpBomberCount == 1) return 71 // FBA CI
        if (diveBomberCount == 2 && torpBomberCount == 1) return 72 // BBA CI
        if (diveBomberCount == 1 && torpBomberCount == 1) return 73 // BA CI
        console.error("unrecognized CVCI set", diveBomberCount, fighterCount, torpBomberCount)
    }
    return attackType
}

function getActualNBAttackType(attackType, siList) {
    if (attackType == 3) {  // find SS CI
        var ssTorpedoCount = 0
        for (let index=0; index < siList.length; index ++) {
            if (siList[index].api_type[2] == SUBRADAR) return 31 //SSCI (TR)
            if ([213, 214, 383].indexOf(siList[index].api_id) != -1) {
                ssTorpedoCount += 1
            }
        }
        if (ssTorpedoCount == 2) return 32//SSCI (TT)
    }
    if (attackType == 6) {
        var suiSeiType31Count = 0
        var nightFighterCount = 0
        var nightBomberCount = 0
        var otherPlane = 0
        for (let index=0; index < siList.length; index ++) {
            if (siList[index].api_type[3] == 45) nightFighterCount += 1
            else if (siList[index].api_type[3] == 46) nightBomberCount += 1
            else if (siList[index].api_id == 320) suiSeiType31Count += 1
            else otherPlane += 1
        }
        if (nightFighterCount == 2) return 61
        if (nightFighterCount == 1 && nightBomberCount == 1) return 62
        if (nightFighterCount == 1 && suiSeiType31Count == 1) return 62
        if (nightBomberCount == 1 && suiSeiType31Count == 1) return 62
        if (nightFighterCount == 1 && otherPlane == 2) return 63
        return 6
    }
    return attackType
}

exports.ALLFORMATIONS = ALLFORMATIONS
exports.MECHANICS = MECHANICS
exports.VANGUARD1 = VANGUARD1
exports.VANGUARD2 = VANGUARD2
exports.isScratchDamage = isScratchDamage
exports.theoreticalShellPower = theoreticalShellPower
exports.theoreticalASWPower = theoreticalASWPower
exports.theoreticalNBPower = theoreticalNBPower
exports.getActualAttackType = getActualAttackType
exports.getActualNBAttackType = getActualNBAttackType
exports.theoreticalTorpPower = theoreticalTorpPower
