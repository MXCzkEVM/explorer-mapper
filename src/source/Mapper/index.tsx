/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable ts/no-use-before-define */
/* eslint-disable react/no-nested-components */
import {
  Center,
  Spinner,
  useColorMode,
} from '@chakra-ui/react'
import { instanceMep1004 } from 'constants/Address'
import { getDataMap, getGeoHex } from 'constants/H3Utils'
import {
  dataInit,
  getGeoHexagon,
  getGeoHexagonCache,
  getMep1002HexagonName,
  getMep1004,
  getMep1004Miners,
  getNFTProof,
} from 'constants/StogeUtils'
import { BigNumber } from 'ethers'
import { cellToLatLng, latLngToCell } from 'h3-js'
import L from 'leaflet'
import { eventBus } from 'lib/eventBus'
import { useEffect, useState } from 'react'
import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai'
import { IoCellularOutline } from 'react-icons/io5'
import { MdOutlineSensors } from 'react-icons/md'

import {
  GeoJSON,
  MapContainer,
  TileLayer,
  useMapEvents,
  // Popup,
  // Marker,
  // Pane,
} from 'react-leaflet'
import CopyToClipboard from './CopyToClipboard'
import * as S from './style'

import 'leaflet/dist/leaflet.css'
import './index.scss'

const DarkMatter
    = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const Voyage
    = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

const timerMap: any = {}
const timoutMap: any = {}

function Mapper(props: { query?: any }) {
  const { colorMode } = useColorMode()
  const [showBox, setShowBox] = useState(false)
  const [vertex, setVertexs] = useState<any[]>([])
  const [h3WrapName, setH3WrapName] = useState<any[]>([])
  const [geoJsonKey, addToGeoJsonKey] = useState(1)
  const [geoJsonCenterKey, addToGeoCenterJsonKey] = useState(100000)
  const [showMap, setShowMap] = useState(true)

  // card data
  const [cardLoading, setCardLoading] = useState(false)
  const [hexTitle, setHexTitle] = useState('0x')
  const [hexTrans, setHexTrans] = useState('')
  const [hexMiners, setMiners] = useState<any[]>([])
  const [hexNFTs, setNFTs] = useState<any[]>([])

  const query: any = props.query || {}

  // let mep1004 = mapperUtils.mep1004Contract();
  const [mep1004Show, setMep1004Show] = useState(true)
  const [mepNftShow, setMepNftShow] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      await dataInit()
      // get hexagon bind name => mapper data

      // get hexagon data => mapper data
      const getVertex = getGeoHex(await getGeoHexagon())
      setVertexs(getVertex)
      addToGeoJsonKey(geoJsonKey + 1)
      addToGeoCenterJsonKey(geoJsonCenterKey + 1)
      initPageHexagon(getVertex)

      const hexagonsName: any = await getMep1002HexagonName()

      setH3WrapName(hexagonsName)

      // get 1004 cache
      await getMep1004()
    }

    fetchData()

    const mep1004 = instanceMep1004()
    // 监听证明事件
    mep1004.on('NewLocationProof', mep1004Listen)
    // 监听跳转事件
    eventBus.on('mapperPoint', handleMapperFly)

    return () => {
      // console.log(timoutMap, timerMap, 'clear');
      for (const item in timerMap) {
        clearInterval(timerMap[item])
      }
      for (const item in timoutMap) {
        clearTimeout(timoutMap[item])
      }
      mep1004.removeListener('NewLocationProof', mep1004Listen)
      eventBus.off('mapperPoint', handleMapperFly)
    }
  }, [])

  // useEffect(() => {
  //     // load the query, if have domain should flyto
  //     let get_hexId = query.hexid && query.hexid.toLowerCase();
  //     let get_mns = query.mns && query.mns.toLowerCase();

  //     const fetchData = async () => {
  //         let { hexId2loc, ens2loc } = await getDataMap();
  //         // console.log(get_hexId, "get_hexId");
  //         // console.log(hexId2loc, "hexId2loc");
  //         // console.log(hexId2loc[get_hexId], 999);
  //         if (Map && get_hexId && hexId2loc[get_hexId]) {
  //             Map.flyTo(hexId2loc[get_hexId], 12);
  //         }

  //         if (Map && get_mns && ens2loc[get_mns]) {
  //             Map.flyTo(ens2loc[get_mns], 12);
  //         }
  //     };

  //     fetchData();
  // }, [query]);

  function initPageHexagon(vertex: any[]) {
    if (!vertex.length || !query.hexagon)
      return
    const hexagon = query.hexagon as string
    const zHexagon = hexagon.startsWith('0') ? hexagon : hexagon
    const feature = vertex.find(v => v.id.toLowerCase() === zHexagon.toLowerCase())
    if (feature) {
      handleFeatureClick({ target: { feature } })
    }
    else {
      const [lat, lng] = cellToLatLng(hexagon)
      onClickMap({ latlng: { lat, lng } })
    }
  }

  function onClickMap(e: any) {
    const nodeName = e.originalEvent?.target?.nodeName
    if (nodeName?.toLowerCase() === 'path') {
      return
    }
    // get hexId
    setShowBox(true)
    const lat = e.latlng.lat
    const lng = e.latlng.lng
    const res = 7
    const hexId = latLngToCell(lat, lng, res)
    setCardLoading(false)
    setMiners([])
    setNFTs([])
    setHexTitle(hexId)
  }

  const handleMapperFly = async (data: any) => {
    const { ens2loc } = await getDataMap()
    if (Map && ens2loc[data]) {
      Map.flyTo(ens2loc[data], 12)
    }
  }

  const addNameToHexagon = (feature: any, latlng: any) => {
    const html
            = feature.name?.length > 8
              ? `${feature.name.slice(0, 8)}...`
              : feature.name
    return L.marker(latlng, {
      icon: L.divIcon({
        className: `marker-name `,
        html,
        iconSize: [95, 30],
      }),
    })
  }

  const mep1004Listen = async (MEP1002TokenId: any) => {
    const tokenId = MEP1002TokenId._hex
    const hexId = tokenId.replace('0x', '')

    // let { hexId2name } = await getDataMap();
    // console.log(hexId2name[hexId]);

    if (timerMap[hexId]) {
      clearInterval(timerMap[hexId])
    }
    if (timoutMap[hexId]) {
      clearTimeout(timoutMap[hexId])
    }

    const target = document.querySelector(`.leaflet-container .id_${hexId}.leaflet-interactive`)

    timerMap[hexId] = setInterval(() => {
      let weight: any = target?.getAttribute('stroke-width')
      weight = weight === 1 ? 0 : 1
      target?.setAttribute('stroke-width', weight)
    }, 1000)

    timoutMap[hexId] = setTimeout(() => {
      target?.setAttribute('stroke-width', '1')
      clearInterval(timerMap[hexId])
    }, 5 * 60 * 1000)
  }

  const toggle1004 = () => {
    setMep1004Show(!mep1004Show)
  }

  const toggleNft = () => {
    setMepNftShow(!mepNftShow)
  }

  const toggleModal = () => {
    setShowBox(!showBox)
  }

  const handleFeatureClick = async (e: any) => {
    const { hexId2name } = await getDataMap()
    const feature = e.target.feature

    // mock newlocation
    // const MEP1002TokenId = { _hex: `0x${feature.id}` };
    // mep1004Listen(MEP1002TokenId);
    // return;

    setShowBox(true)
    setCardLoading(true)

    if (hexId2name[feature.id]) {
      setHexTitle(`${hexId2name[feature.id]}.MXC`)
    }
    else {
      setHexTitle(feature.transactionHash)
    }

    // let miners = await getMep1004Miners(feature.id)
    const miners = await getMep1004Miners(feature.id)
    const nfts = await getNFTProof(feature.id)

    setMiners(miners)
    setNFTs(nfts)

    setMep1004Show(true)
    setMepNftShow(true)
    setCardLoading(false)

    let transactionHash = feature.transactionHash
    if (!feature.transactionHash) {
      const vertexFeatures: any[] = await getGeoHexagonCache()
      vertexFeatures.forEach((item) => {
        const decimalNum = BigNumber.from(item.tokenId)
        const hexNum = decimalNum.toHexString()
        const hexId = hexNum.replace('0x', '')
        if (hexId === feature.id) {
          transactionHash = item.transactionHash
        }
      })
    }
    setHexTrans(transactionHash)
  }

  const [Zoom, setZoom] = useState(12)
  let Map: any

  const MapEvents = () => {
    Map = useMapEvents({
      click: onClickMap,
      zoomstart() {
        setShowMap(false)
      },
      zoomend() {
        // zoom event (when zoom animation ended)
        const zoom = Map.getZoom() // get current Zoom of map
        setZoom(zoom)
        setShowMap(true)
      },
    })
    return <></>
  }

  const hexClick = () => {
    window.open(`/tx/${hexTrans}`, '_blank')
  }

  const minerClick = (miner: any) => {
    window.open(`/tx/${miner.transactionHash}`, '_blank')
  }

  const nftClick = (nft: any) => {
    window.open(nft.link, '_blank')
  }

  return (
    <>
      <div className={`mapWarp ${colorMode}`}>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          minZoom={3}
          maxZoom={12}
          scrollWheelZoom
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url={colorMode === 'dark' ? DarkMatter : Voyage}
          />

          <GeoJSON
            data={vertex as any}
            key={geoJsonKey}
            style={(feature: any) => {
              return {
                weight: feature.properties.weight,
                color: feature.properties.color,
                className: `id_${feature.id}`,
              }
            }}
            onEachFeature={(_, layer) => {
              layer.on('click', handleFeatureClick)
            }}
          />

          {Zoom < 12 || !showMap
            ? null
            : (
                <GeoJSON
                  data={h3WrapName as any}
                  key={geoJsonCenterKey}
                  pointToLayer={addNameToHexagon}
                  onEachFeature={(_, layer) => {
                    layer.on('click', handleFeatureClick)
                  }}
                />
              )}

          <MapEvents />
        </MapContainer>

        <div className={`hexbox ${showBox ? 'open' : ' close'}`}>
          <div className="arrow_btc" onClick={toggleModal}>
            {!showBox
              ? (
                  <AiOutlineArrowLeft />
                )
              : (
                  <AiOutlineArrowRight />
                )}
          </div>
          <S.Cursor>
            <div className="textArea">
              {hexTitle.length === 15
                ? (
                    <div className="hex_title">
                      <div className="flex_sc">
                        <div>{hexTitle}</div>
                        <CopyToClipboard
                          text={hexTitle}
                          className=""
                        />
                      </div>
                    </div>
                  )
                : (
                    <div
                      className="hex_title csp"
                      onClick={hexClick}
                    >
                      {hexTitle}
                    </div>
                  )}
            </div>
          </S.Cursor>

          {cardLoading
            ? (
                <Center h="80%">
                  <Spinner
                    thickness="4px"
                    speed="0.65s"
                    color="#25d30f"
                    size="xl"
                  />
                </Center>
              )
            : (
                <div>
                  <div className="cardboxes">
                    <div className="cardbox">
                      <div className="cardWrapper">
                        <div
                          onClick={toggle1004}
                          className="card card--secondary"
                        >
                          <span className="card__content">
                            <IoCellularOutline />
                            <span className="space_title">
                              1004
                            </span>
                          </span>
                          <span className="card__glitch"></span>
                          <span className="card__label">
                            MEP
                          </span>
                        </div>
                      </div>
                      {mep1004Show
                        ? (
                            <div className="txList">
                              {hexMiners.map(
                                (miner: any, index: number) => {
                                  return (
                                    <div
                                      onClick={() =>
                                        minerClick(
                                          miner,
                                        )}
                                      key={index}
                                      className="txItem"
                                    >
                                      {miner.name
                                        || miner.SNCode}
                                    </div>
                                  )
                                },
                              )}
                            </div>
                          )
                        : null}
                    </div>

                    <div className="cardbox">
                      <div className="cardWrapper">
                        <div
                          onClick={toggleNft}
                          className="card card--secondary"
                        >
                          <span className="card__content">
                            <MdOutlineSensors />
                            <span className="space_title">
                              721
                            </span>
                          </span>
                          <span className="card__glitch"></span>
                          <span className="card__label">
                            MEP
                          </span>
                        </div>
                      </div>
                      {mepNftShow
                        ? (
                            <div className="txList">
                              {hexNFTs.map(
                                (nft: any, index: number) => {
                                  return (
                                    <div
                                      onClick={() =>
                                        nftClick(nft)}
                                      key={index}
                                      className="txItem"
                                    >
                                      {nft.name}
                                    </div>
                                  )
                                },
                              )}
                            </div>
                          )
                        : null}
                    </div>
                  </div>
                </div>
              )}
        </div>
      </div>
    </>
  )
}
export default Mapper
