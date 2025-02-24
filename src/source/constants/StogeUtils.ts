import { ThirdwebSDK } from '@thirdweb-dev/sdk/evm'
import { buildCenterFeature, int2hex } from 'constants/H3Utils'
import localforage from 'localforage'
import { PROCESS_ENV } from '../env'
import { ABI, CONTRACTS_MAP, dataVersion, instanceMep1004 } from './Address'

import {
  mep1002SetNameEvent,
  mep1002TransferEvent,
  mep1004InsertToMEP1002SlotEvent,
  mep1004NewLocationProofEvent,
  mep1004RemoveFromMEP1002SlotEvent,
} from './Events'
import { NETWORK } from './Network'

const filterLeverl = 90

export async function getMep1004() {
  await mep1004InsertToMEP1002SlotEvent()
  await mep1004RemoveFromMEP1002SlotEvent()
  await mep1004NewLocationProofEvent()
}

export async function getNFTMetadata(collectionId: string) {
  const sdk = new ThirdwebSDK(NETWORK)
  const contract = await sdk.getContract(
    collectionId,
    ABI.collection,
  )
  return contract
}

export async function getMep1004Miners(tatHexId: string) {
  const soltEvents: any[] = await localforage.getItem('MEP1004InsertToMEP1002Slot') || []
  const removeEvents: any[] = await localforage.getItem('MEP1004RemoveFromMEP1002Slot') || []

  // let miner: any = {}
  // soltEvents.map((item:any) => {
  //     const { MEP1004TokenId, slotIndex, SNCodeType, tokenId, transactionHash } = item
  //     const hexId = tokenId.replace('0x', '');
  //     // 1002 =>  slotType => slotIndex
  //     miner[hexId] = miner[hexId] || {}
  //     miner[hexId][SNCodeType] = miner[hexId][SNCodeType] || {}
  //     miner[hexId][SNCodeType][slotIndex] = miner[hexId][SNCodeType][slotIndex] || {}
  //     miner[hexId][SNCodeType][slotIndex] = {
  //         MEP1004TokenId,
  //         transactionHash
  //     }
  // })
  // removeEvents.map((item:any) => {
  //     const {  slotIndex, SNCodeType, tokenId } = item
  //     const hexId = tokenId.replace('0x', '');
  //     // 1002 =>  slotType => slotIndex
  //     miner[hexId] = miner[hexId] || {}
  //     miner[hexId][SNCodeType] = miner[hexId][SNCodeType] || {}
  //     miner[hexId][SNCodeType][slotIndex] = miner[hexId][SNCodeType][slotIndex] || {}
  //     delete miner[hexId][SNCodeType][slotIndex]
  // })

  const miner: any = {}
  soltEvents.forEach((item) => {
    const { MEP1004TokenId, slotIndex, SNCodeType, tokenId, transactionHash } = item
    const hexId = tokenId.replace('0x', '')
    if (hexId === tatHexId) {
      // 1002 =>  slotType => slotIndex
      miner[SNCodeType] = miner[SNCodeType] || {}
      miner[SNCodeType][slotIndex] = miner[SNCodeType][slotIndex] || {}
      miner[SNCodeType][slotIndex] = {
        MEP1004TokenId,
        transactionHash,
      }
    }
  })
  removeEvents.forEach((item) => {
    const { slotIndex, SNCodeType, tokenId } = item
    const hexId = tokenId.replace('0x', '')
    if (hexId === tatHexId) {
      // 1002 =>  slotType => slotIndex
      miner[SNCodeType] = miner[SNCodeType] || {}
      miner[SNCodeType][slotIndex] = miner[SNCodeType][slotIndex] || {}
      delete [SNCodeType][slotIndex]
    }
  })

  const miners = []
  for (const SNCodeType in miner) {
    for (const slotIndex in miner[SNCodeType]) {
      const item = miner[SNCodeType][slotIndex]
      const minerId = item.MEP1004TokenId
      const transactionHash = item.transactionHash
      let SNCode = item.SNCode
      // if (!name) {
      //     let mep1004 = await getContract(MEP1004ContractAddr, mep1004abi)
      //     name = await mep1004.tokenNames(minerId)
      //     item['name'] = name
      // }
      if (!SNCode) {
        const mep1004 = await instanceMep1004()
        SNCode = await mep1004.getSNCode(minerId)
        item.SNCode = SNCode
      }
      miners.push({
        minerId,
        // name,
        SNCode,
        transactionHash,
      })
    }
  }
  return miners
}

export async function getNFTProof(tatHexId: string) {
  const proofEvents: any = await localforage.getItem('MEP1004NewLocationProof') || []

  const nftItems: any = {}
  for (const index in proofEvents) {
    const item = proofEvents[index]
    const { tokenId, nft } = item
    const hexId = tokenId.replace('0x', '')
    if (tatHexId !== hexId) {
      continue
    }
    const spl = nft.split('-')
    if (spl.length !== 2) {
      continue
    }
    // console.log(spl)
    const collectIds = spl[0] as string
    const nftItem = spl[1]

    const collects = nftItems[collectIds] || []
    collects.push(nftItem)
    const uniqueArr = Array.from(new Set(collects))
    nftItems[collectIds] = uniqueArr
  }

  const nfts: any = []
  if (Object.keys(nftItems).length) {
    for (const collection in nftItems) {
      const collectionTokens = nftItems[collection]
      const collectionData = await getNFTMetadata(collection)

      for (const item in collectionTokens) {
        const tokenId = Number.parseInt(collectionTokens[item])
        const nft: any = await collectionData.erc721.get(collectionTokens[item])
        nfts.push({
          tokenId,
          name: nft.metadata.name,
          link: `${CONTRACTS_MAP.collectBase}/collection/${collection}/${tokenId}`,
        })
      }
    }
  }
  return nfts
}

export async function getGeoHexagon() {
  const events = await mep1002TransferEvent()
  let filterData = Object.values(events.reduce((acc: any, event: any) => {
    acc[event.tokenId] = {
      tokenId: event.tokenId,
      transactionHash: event.transactionHash,
    }
    return acc
  }, {}))

  const id2ens: any = {}
  const names: any = await localforage.getItem('MEP1002TokenUpdateName') || []
  for (const index in names) {
    const item = names[index]
    if (!item.name) {
      continue
    }
    id2ens[item.hexId] = 1
  }

  if (PROCESS_ENV.NEXT_PUBLIC_NETWORK_ID === '18686') {
    return filterData
  }

  filterData = filterData.filter((item: any) => {
    const randomNumber = Math.floor(Math.random() * 100) + 1
    const hexId = int2hex(item.tokenId)
    return randomNumber > filterLeverl || id2ens[hexId]
  })
  return filterData
}

export async function getGeoHexagonCache() {
  const events = await mep1002TransferEvent(true)
  const filterData = Object.values(events.reduce((acc: any, event: any) => {
    acc[event.tokenId] = {
      tokenId: event.tokenId,
      transactionHash: event.transactionHash,
    }
    return acc
  }, {}))

  return filterData
}

async function getMep1002(readCache = false) {
  const events = await mep1002SetNameEvent(readCache)
  let filterData = Object.values(events.reduce((acc: any, event: any) => {
    acc[event.name] = {
      hexId: event.hexId,
      name: event.name,
    }
    return acc
  }, {}))
  filterData = filterData.filter((item: any) => item.name.length)
  return filterData
}

export async function getMep1002HexagonName(readCache = false) {
  const filterData = await getMep1002(readCache)
  const hexagonsName = filterData.map((item: any) => {
    return buildCenterFeature(item.hexId, item.name)
  })
  return hexagonsName
}

export async function dataInit() {
  const version = await localforage.getItem('version')
  if (!version || version !== dataVersion) {
    await localforage.clear()
    await localforage.setItem('version', dataVersion)
  }
}
