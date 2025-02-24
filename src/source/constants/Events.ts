import localforage from 'localforage'
import { CONTRACTS_MAP, instanceMep1002, instanceMep1004 } from './Address'
import { PROVIDER } from './Network'

export async function mep1004NewLocationProofEvent() {
  const saveName = 'MEP1004NewLocationProof'
  const blockName = 'MEP1004NewLocationProof__blocksNum'
  const blockStart: number = await localforage.getItem(blockName) || CONTRACTS_MAP.MEP1004NewLocationProofBlockNumber
  const mep1004 = instanceMep1004()
  const latestBlock = await PROVIDER.getBlockNumber()
  const eventFilter = mep1004.filters.NewLocationProof()
  let events: any = await mep1004.queryFilter(
    eventFilter,
    blockStart,
    latestBlock,
  )
  events = events.map((item: any) => {
    const tokenId = item.args?.MEP1002TokenId._hex
    const nft = item.args?.item
    const timestamp = item.args?.locationProof?.timestamp.toString()
    return { tokenId, nft, timestamp }
  })
  const orgEvents: any = await localforage.getItem(saveName) || []
  const newEvents = orgEvents.concat(events)
  await localforage.setItem(blockName, latestBlock)
  await localforage.setItem(saveName, newEvents)
  return newEvents
}

export async function mep1004RemoveFromMEP1002SlotEvent() {
  const saveName = 'MEP1004RemoveFromMEP1002Slot'
  const blockName = 'MEP1004RemoveFromMEP1002Slot__blocksNum'

  const blockStart: number = await localforage.getItem(blockName) || CONTRACTS_MAP.MEP1004RemoveFromMEP1002SlotBlockNumber
  const mep1004 = instanceMep1004()
  const latestBlock = await PROVIDER.getBlockNumber()
  const eventFilter = mep1004.filters.RemoveFromMEP1002Slot()
  let events: any = await mep1004.queryFilter(
    eventFilter,
    blockStart,
    latestBlock,
  )
  events = events.map((item: any) => {
    const tokenId = item.args?.MEP1002TokenId._hex
    const transactionHash = item?.args && item.transactionHash
    const MEP1004TokenId = item.args?.MEP1004TokenId.toString()
    const slotIndex = item.args?.slotIndex.toString()
    const SNCodeType = item.args?.SNCodeType.toString()
    return { tokenId, transactionHash, MEP1004TokenId, slotIndex, SNCodeType }
  })
  const orgEvents: any = await localforage.getItem(saveName) || []
  const newEvents = orgEvents.concat(events)
  await localforage.setItem(blockName, latestBlock)
  await localforage.setItem(saveName, newEvents)
  return newEvents
}

export async function mep1004InsertToMEP1002SlotEvent() {
  const saveName = 'MEP1004InsertToMEP1002Slot'
  const blockName = 'MEP1004InsertToMEP1002Slot__blocksNum'

  const blockStart: number = await localforage.getItem(blockName) || CONTRACTS_MAP.MEP1004InsertToMEP1002SlotBlockNumber
  const mep1004 = instanceMep1004()
  const latestBlock = await PROVIDER.getBlockNumber()
  const eventFilter = mep1004.filters.InsertToMEP1002Slot()
  let events: any = await mep1004.queryFilter(
    eventFilter,
    blockStart,
    latestBlock,
  )
  events = events.map((item: any) => {
    const tokenId = item.args?.MEP1002TokenId._hex
    const transactionHash = item?.args && item.transactionHash
    const MEP1004TokenId = item.args?.MEP1004TokenId.toString()
    const slotIndex = item.args?.slotIndex.toString()
    const SNCodeType = item.args?.SNCodeType.toString()
    return { tokenId, transactionHash, MEP1004TokenId, slotIndex, SNCodeType }
  })
  const orgEvents: any = await localforage.getItem(saveName) || []
  const newEvents = orgEvents.concat(events)
  await localforage.setItem(blockName, latestBlock)
  await localforage.setItem(saveName, newEvents)
  return newEvents
}

export async function mep1002TransferEvent(readCache = false) {
  const saveName = 'MEP1002Transfer'
  const blockName = 'MEP1002Transfer__blocksNum'
  if (readCache) {
    const orgEvents: any = await localforage.getItem(saveName) || []
    return orgEvents
  }

  const blockStart: number = await localforage.getItem(blockName) || CONTRACTS_MAP.MEP1002TransferStart
  const mep1002 = instanceMep1002()
  const latestBlock = await PROVIDER.getBlockNumber()
  const eventFilter = mep1002.filters.Transfer()

  let events: any = []
  if (latestBlock > blockStart) {
    events = await mep1002.queryFilter(
      eventFilter,
      blockStart,
      latestBlock,
    )
  }

  events = events.map((item: any) => {
    const tokenId = item?.args && item.args.tokenId.toString()
    const transactionHash = item?.args && item.transactionHash
    return { tokenId, transactionHash }
  })
  const orgEvents: any = await localforage.getItem(saveName) || []
  const newEvents = orgEvents.concat(events)
  await localforage.setItem(blockName, latestBlock)
  await localforage.setItem(saveName, newEvents)
  return newEvents
}

export async function mep1002SetNameEvent(readCache = false) {
  const saveName = 'MEP1002TokenUpdateName'
  const blockName = 'MEP1002TokenUpdateName__blocksNum'

  if (readCache) {
    const orgEvents: any = await localforage.getItem(saveName) || []
    return orgEvents
  }

  const blockStart: number = await localforage.getItem(blockName) || CONTRACTS_MAP.MEP1002TokenUpdateNameStart
  const mep1002 = instanceMep1002()
  const latestBlock = await PROVIDER.getBlockNumber()
  const eventFilter = mep1002.filters.MEP1002TokenUpdateName()
  let events: any = await mep1002.queryFilter(
    eventFilter,
    blockStart,
    latestBlock,
  )
  events = events.map((item: any) => {
    const tokenId = item.args?.tokenId._hex
    const hexId = tokenId.replace('0x', '')
    let name = item.args?.name
    let st = ''
    for (const i in name) {
      if (name[i].match(/[a-z0-9]/i)) {
        st = st + name[i]
      }
      else {
        st = `${st}.`
      }
    }
    if (st.length > 0) {
      if (st[0] === '.') {
        st = st.slice(1, st.length - 1)
      }
      if (st[st.length - 1] === '.') {
        st = st.slice(0, st.length - 2)
      }
    }
    name = st.replace('.mxc', '')
    return {
      hexId,
      name,
    }
  })
  const orgEvents: any = await localforage.getItem(saveName) || []
  const newEvents = orgEvents.concat(events)
  await localforage.setItem(blockName, latestBlock)
  await localforage.setItem(saveName, newEvents)
  return newEvents
}
