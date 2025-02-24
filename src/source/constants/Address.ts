import { ethers } from 'ethers'
import { PROCESS_ENV } from '../env'
import mep1002 from './abi/mep/mep1002'
import mep1004 from './abi/mep/mep1004'
import collection from './abi/MXCCollectionV2Upgrade'
import { PROVIDER } from './Network'

const CHAIN_ID = PROCESS_ENV.NEXT_PUBLIC_NETWORK_ID || ''

const contracts: any = {
  18686: {
    collectBase: 'https://nft.mxc.com',

    MEP1002Token: '0x068234de9429FaeF2585A6eD9A52695cDa78aFE1',
    MEP1002BlockNumber: 340,
    MEP1002TokenUpdateNameStart: 3719,
    MEP1002TransferStart: 3719,

    MEP1004Token: '0x8Ff08F39B1F4Ad7dc42E6D63fd25AeE47EA801Ce',
    MEP1004BlockNumber: 345,
    MEP1004InsertToMEP1002SlotBlockNumber: 3719,
    MEP1004RemoveFromMEP1002SlotBlockNumber: 3719,
    MEP1004NewLocationProofBlockNumber: 3719,
  },
  5167004: {
    collectBase: 'https://geneva-nft.moonchain.com',

    MEP1002Token: '0x1964F08f56b79051fB3AE9a2C4d8D92A059b1237',
    MEP1002BlockNumber: 0,
    MEP1002TokenUpdateNameStart: 0,
    MEP1002TransferStart: 0,

    MEP1004Token: '0x0D589F5EeDF70e17F053CBb93760Db7E418603F6',
    MEP1004BlockNumber: 0,
    MEP1004InsertToMEP1002SlotBlockNumber: 0,
    MEP1004RemoveFromMEP1002SlotBlockNumber: 0,
    MEP1004NewLocationProofBlockNumber: 0,
  },
}

export const ABI = {
  mep1002,
  mep1004,
  collection,
}

export const dataVersion = 'V2'

export const CONTRACTS_MAP = contracts[CHAIN_ID]

export function instanceMep1002() {
  return new ethers.Contract(CONTRACTS_MAP.MEP1002Token, ABI.mep1002, PROVIDER)
}

export function instanceMep1004() {
  return new ethers.Contract(CONTRACTS_MAP.MEP1004Token, ABI.mep1004, PROVIDER)
}
