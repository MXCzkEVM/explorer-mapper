import { BigNumber } from 'ethers'
import geojson2h3 from 'geojson2h3'
import {
  // latLngToCell,
  // gridDisk,
  // cellToBoundary,
  cellToLatLng,
  getResolution,
  // getBaseCellNumber,
  // h3IndexToSplitLong,
} from 'h3-js'
import { getMep1002HexagonName } from './StogeUtils'

export function int2hex(num_string: string) {
  const decimalNum = BigNumber.from(num_string)
  const hexNum = decimalNum.toHexString()
  const hexId = hexNum.replace('0x', '')
  return hexId
}

export function getGeoHex(vertexFeatures: any[]) {
  const vertex = vertexFeatures.map((item) => {
    const hexId = int2hex(item.tokenId)
    const data: any = geojson2h3.h3ToFeature(hexId)
    data.properties.color = '#10c469'
    data.properties.weight = 1
    data.transactionHash = item.transactionHash
    return data
  })
  return vertex
}

export function buildCenterFeatureSimple(hexId: any, name: string) {
  const geocoord = cellToLatLng(hexId)
  const coordinates = [geocoord[1], geocoord[0]]
  return {
    id: hexId,
    name,
    coordinates,
  }
}

export function buildCenterFeature(hexId: any, name: string) {
  const geocoord = cellToLatLng(hexId)
  const resolution = getResolution(hexId)
  const coordinates = [geocoord[1], geocoord[0]]
  return {
    type: 'Feature',
    id: hexId,
    name,
    geometry: {
      type: 'Point',
      coordinates,
    },
    properties: {
      title: ((hexId >> 24) & 0xFF).toString(16).toUpperCase(),
      resolution,
    },
  }
}

export async function getDataMap() {
  const hexagonsName: any = await getMep1002HexagonName(true)

  const ens2loc: any = {}
  const hexId2loc: any = {}
  const name2hexId: any = {}
  const hexId2name: any = {}

  hexagonsName.forEach((item: any) => {
    const coord = item.geometry.coordinates
    ens2loc[item.name] = [coord[1], coord[0]]
    hexId2loc[item.id] = [coord[1], coord[0]]
    name2hexId[item.name] = item.id
    hexId2name[item.id] = item.name
  })
  return {
    ens2loc,
    hexId2loc,
    name2hexId,
    hexId2name,
  }
}
