import { useState, useEffect, useRef } from 'react'
import VConsole from 'vconsole'
import VirtualGamepad from '../../components/VirtualGamepad'
import xCloudPlayer from 'xbox-xcloud-player'
import {
  Modal, ModalContent, ModalBody,
  Listbox, ListboxItem
} from "@nextui-org/react"
import Loading from '../../components/Loading'
import PerfPanel from '../../components/PerfPanel'
import WarningModal from '../../components/WarningModal'
import './Home.css'

console.log('xCloudPlayer:', xCloudPlayer)

function Home() {
  const [timer, setTimer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingText, setLoadingText] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [connectState, setConnectState] = useState('')
  const [showVirtualGamepad, setShowVirtualGamepad] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [isStoped, setIsStoped] = useState(false)
  const isStopedRef = useRef(isStoped)
  const [xPlayer, setxPlayer] = useState(undefined)
  const [vconsole, setVconsole] = useState(undefined)

  useEffect(() => {
    console.log('Starting xCloudPlayer...')

    if (vconsole === undefined) {
      setVconsole(new VConsole())
    }

    window.addEventListener("gamepadconnected", (e) => {
      const gp = navigator.getGamepads()[e.gamepad.index];
      console.log(
        "Gamepad connected at index %d: %s. %d buttons, %d axes.",
        gp.index,
        gp.id,
        gp.buttons.length,
        gp.axes.length,
      );
    });

    if (xPlayer !== undefined) {
      xPlayer.bind()

      if (!window.ReactNativeWebView) return
      // Set bitrate
      let streamSettings = window.ReactNativeWebView.injectedObjectJson()
      try {
        streamSettings = JSON.parse(streamSettings).settings
      } catch (e) {
        streamSettings = {}
      }

      console.log('streamSettings:', streamSettings)

      // Set video codec profiles
      // xPlayer.setCodecPreferences('video/H264', { profiles: ['4d'] }) // 4d = high, 42e = mid, 420 = low
      if (streamSettings.codec) {
        if (streamSettings.codec.indexOf('H264') > -1) {
          const codecArr = streamSettings.codec.split('-')
          xPlayer.setCodecPreferences(codecArr[0], { profiles: codecArr[1] ? [codecArr[1]] : [] })
        } else {
          xPlayer.setCodecPreferences(streamSettings.codec, { profiles: [] })
        }
      }

      // Set vibration
      xPlayer.setVibration(streamSettings.vibration)
      xPlayer.setVibrationMode(streamSettings.vibration_mode)
      
      
      if (streamSettings.streamType === 'xcloud') {
        if (streamSettings.xcloud_bitrate_mode === 'custom' && streamSettings.xcloud_bitrate !== 0) {
          console.log('setVideoBitrate xcloud:', streamSettings.xcloud_bitrate + 'Mbps')
          xPlayer.setVideoBitrate(streamSettings.xcloud_bitrate * 1000)
        }
      } else {
        if (streamSettings.xhome_bitrate_mode === 'custom' && streamSettings.xhome_bitrate !== 0) {
          console.log('setVideoBitrate xhome:', streamSettings.xhome_bitrate + 'Mbps')
          xPlayer.setVideoBitrate(streamSettings.xhome_bitrate * 1000)
        }
      }
      

      document.addEventListener('message', (event: any) => {
        console.log('web receive RN message:', event.data)
        try {
          const data = event.data
          if (data.type === 'stream') {
            const message = data.message
            if (message.single === 'startSessionEnd') {
              if (isStopedRef.current) {
                return
              }
              console.log('[startSessionEnd]:', message.data)
              setLoadingText('获取主机配置成功，开始发起offer...')
        
              xPlayer.createOffer().then((offer: any) => {
                window.ReactNativeWebView.postMessage(
                    JSON.stringify({
                      type: 'xcloudOfferReady',
                      message: offer
                    })
                );
              }).catch(e => {
                console.log('createOffer error:', e)
              })
            }
            if (message.single === 'sendSDPOfferEnd') {
              if (isStopedRef.current) {
                return
              }
              console.log('[sendSDPOfferEnd]:', message.data)
              xPlayer.setRemoteOffer(message.data.sdp)
      
              setLoadingText('远程offer获取成功...')
              const ices = xPlayer.getIceCandidates()
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  type: 'sendICEReady',
                  message: ices
                })
              );
            }
            if (message.single === 'sendIceEnd') {
              if (isStopedRef.current) {
                return
              }
              console.log('[sendIceEnd]:', message.data)

              setLoadingText('正在配置ICE，等待Xbox响应...')
              xPlayer.setIceCandidates(message.data)
      
              // Listen for connection change
              xPlayer.getEventBus().on('connectionstate', (event: any) => {
                console.log(':: Connection state updated:', event)
                setConnectState(event.state)
                
                if(event.state === 'connected'){ // 成功连接
                    // We are connected
                    console.log(':: We are connected!')
                    
                    setLoadingText('连接成功')
                    setTimeout(() => {
                      setLoading(false)
                    }, 500)
      
                } else if(event.state === 'closing'){ // 连接关闭中
                    // Connection is closing
                    console.log(':: We are going to disconnect!')
      
                } else if(event.state === 'closed'){
                    // Connection has been closed. We have to cleanup here
                    console.log(':: We are disconnected!')
                }
              })
            }
            if (message.single === 'disconnect') {
              xPlayer.close()
            }
          }
        } catch (e) {
          console.log('error:', e)
        }
      })

      // 通知RN开始session, postMessage必须是string
      // startSession
      if (window.ReactNativeWebView) {
        setLoading(true)
        setLoadingText('正在连接Xbox...')
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'xcloudReady'
        }));
      }
    } else {
      setxPlayer(new xCloudPlayer('videoHolder', {
        ui_systemui: [],
        ui_touchenabled: false,
        input_legacykeyboard: false,
      }))
    }

    return () => {
      if(xPlayer !== undefined){
          xPlayer.close()
      }
      if (vconsole !== undefined) {
        vconsole.destroy()
      }
    }
  }, [xPlayer, vconsole])

  if (!timer) {
    const _timer = setTimeout(() => {
      if (connectState !== 'connected') {
        setShowWarning(true)
      }
    }, 60 * 1000)
    setTimer(_timer)
  }

  if (connectState === 'connected' && timer) {
    clearTimeout(timer)
  }

  document.addEventListener('message', (event: any) => {
    const data = event.data
    if (data.type === 'action') { // 交互相关
      const message = data.message
      if (message.single === 'pageBack') { // 用户触发后退操作
        setShowModal(true)
      }
    }
  })

  // 操作按钮下压
  const handlePressButtonStart = (value, name) => {
    xPlayer.getChannelProcessor('input').pressButtonStart(value, name)
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'pressButton',
        message: {}
      })
    );
  }

  const handlePressButtonEnd = (value, name) => {
    setTimeout(() => {
      xPlayer.getChannelProcessor('input').pressButtonEnd(value, name)
    }, 60)
  }

  const handleMoveJs = (id, data) => {
    if (xPlayer && xPlayer.getChannelProcessor && xPlayer.getChannelProcessor('input')) {
      if (id === 'lsb') {
        // console.log('handleMoveJs left:', id, data)
        xPlayer.getChannelProcessor('input').moveLeftStick(0, data.leveledX / 10, data.leveledY / 10)
      } else if (id === 'rsb') {
        // console.log('handleMoveJs right:', id, data)
        xPlayer.getChannelProcessor('input').moveRightStick(0, data.leveledX / 10, data.leveledY / 10)
      }
    }
  }

  const handleModalAction = (key) => {
    if (key === 'performance') {
      setShowPerformance(!showPerformance)
    }
    if (key === 'gamepad') {
      setShowVirtualGamepad(!showVirtualGamepad)
    }
    if (key === 'exit') {
      setShowPerformance(false)
      setShowVirtualGamepad(false)
      setLoading(true)
      setLoadingText('正在断开连接...')
      setIsStoped(true)
      xPlayer && xPlayer.close()

      setTimeout(() => {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'exit'
          }));
        }
      }, 1000)
      
    }
    setShowModal(false)
  }

  return (
    <>
      {showPerformance && (
        <PerfPanel xPlayer={xPlayer} connectState={connectState} />
      )}

      {loading && <Loading loadingText={loadingText} />}

      <WarningModal
        show={showWarning}
        onConfirm={() => {
          setShowWarning(false);
          handleModalAction('exit')
        }}
        onCancel={() => {
          setShowWarning(false);
        }}
      />

      <Modal isOpen={showModal} size={"xs"} hideCloseButton={true}>
        <ModalContent>
          <>
            <ModalBody>
              <Listbox
                aria-label="Actions"
                onAction={(key) => handleModalAction(key)}
              >
                {connectState === "connected" && (
                  <ListboxItem key="performance">显示/隐藏性能信息</ListboxItem>
                )}
                {connectState === "connected" && (
                  <ListboxItem key="gamepad">显示/隐藏虚拟手柄</ListboxItem>
                )}
                <ListboxItem key="exit">断开连接</ListboxItem>
                <ListboxItem key="cancel">取消</ListboxItem>
              </Listbox>
            </ModalBody>
          </>
        </ModalContent>
      </Modal>
      <div id="videoHolder">
        {/* <video src="https://www.w3schools.com/html/mov_bbb.mp4" autoPlay muted playsInline style={{ touchAction: 'none', width: '100%', height: '100%', objectFit: 'contain',  }}></video> */}
      </div>

      {connectState === "connected" && showVirtualGamepad && (
        <div
          className="virtual-gamepad"
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
          }}
        >
          <VirtualGamepad
            onPressButtonStart={handlePressButtonStart}
            onPressButtonEnd={handlePressButtonEnd}
            onMoveJs={handleMoveJs}
          />
        </div>
      )}
    </>
  );
}

export default Home
