import { useState, useEffect, useRef } from 'react'
import VConsole from 'vconsole'
import xStreamingPlayer from 'xstreaming-player'
import Loading from '../../components/Loading'
import WarningModal from '../../components/WarningModal'
import { useTranslation } from 'react-i18next'
import './Home.css'

console.log('xStreamingPlayer:', xStreamingPlayer)

function Home() {
  const { t } = useTranslation()

  const [timer, setTimer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingText, setLoadingText] = useState('')
  const [connectState, setConnectState] = useState('')
  const [videoFormat, setVideoFormat] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const [isStoped, setIsStoped] = useState(false)
  const isStopedRef = useRef(isStoped)
  const [xPlayer, setxPlayer] = useState(undefined)
  const vconsole = useRef(null)
  const keepaliveInterval = useRef(null)
  const perfInterval = useRef(null)

  useEffect(() => {
    
    if (xPlayer !== undefined) {
      xPlayer.bind()

      if (!window.ReactNativeWebView) return
      // Set bitrate
      let streamSettings = window.ReactNativeWebView.injectedObjectJson()

      let streamType = 'home'

      try {
        const params = JSON.parse(streamSettings)
        streamSettings = params.settings || {}
        streamType = params.streamType || 'home'
      } catch (e) {
        streamSettings = {}
      }

      if (streamSettings.debug && !vconsole.current) {
        vconsole.current = new VConsole()
      }

      setVideoFormat(streamSettings.video_format || '')
      xPlayer.setVideoFormat(streamSettings.video_format || '')

      console.log('Starting xStreamingPlayer...')
      console.log('streamSettings:', streamSettings)
      console.log('streamType:', streamType)

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

      // Set gamepad kernal
      xPlayer.setGamepadKernal(streamSettings.gamepad_kernal)

      // Set vibration
      xPlayer.setVibration(streamSettings.vibration)
      xPlayer.setVibrationMode(streamSettings.vibration_mode)

      // Set deadzone
      xPlayer.setGamepadDeadZone(streamSettings.dead_zone)

      // Set gamepad maping
      if (streamSettings.gamepad_maping) {
        xPlayer.setGamepadMaping(streamSettings.gamepad_maping)
      }
      
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
        try {
          const data = JSON.parse(event.data);
          const { type, value } = data;

          if (type === 'startSessionEnd') {
            if (isStopedRef.current) {
              return
            }
            console.log('[startSessionEnd]:', value)

            setLoadingText(`${t('Configuration obtained successfully, initiating offer...')}`)
      
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

          if (type === 'sendSDPOfferEnd') {
            if (isStopedRef.current) {
              return
            }
            console.log('[sendSDPOfferEnd]:', value)
            xPlayer.setRemoteOffer(value.sdp)
    
            setLoadingText(`${t('Remote offer retrieved successfully...')}`)

            // Gather candidates
            const iceCandidates = xPlayer.getIceCandidates()
            const candidates = []
            for(const candidate in iceCandidates) {
              candidates.push({
                candidate: iceCandidates[candidate].candidate,
                sdpMLineIndex: iceCandidates[candidate].sdpMLineIndex,
                sdpMid: iceCandidates[candidate].sdpMid,
              })
            }
            setLoadingText(`${t('Ready to send ICE...')}`)
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: 'sendICEReady',
                message: candidates
              })
            );
          }

          if (type === 'sendIceEnd') {
            if (isStopedRef.current) {
              return
            }
            const candidates = value
            setLoadingText(`${t('Exchange ICE successfully...')}`)
            xPlayer.setIceCandidates(candidates)
    
            // Listen for connection change
            xPlayer.getEventBus().on('connectionstate', (event: any) => {
              console.log(':: Connection state updated:', event)
              setConnectState(event.state)

              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  type: 'connectionstate',
                  message: event.state
                })
              );
              
              if(event.state === 'connected') {
                  // We are connected
                  console.log(':: We are connected!')
                  
                  setLoadingText(`${t('Connected')}`)
                  setTimeout(() => {
                    setLoading(false)
                    const videoElem = document.getElementsByTagName('video')[0]
                    if (videoElem) {
                      videoElem.style.backgroundColor = 'black'
                    }

                    // Start keepalive loop
                    keepaliveInterval.current = setInterval(() => {
                      window.ReactNativeWebView.postMessage(
                        JSON.stringify({
                          type: 'sendKeepalive',
                          message: ''
                        })
                      );
                    }, 30 * 1000)

                    // Send performance to RN
                    perfInterval.current = setInterval(() => {
                      if (xPlayer) {
                        xPlayer.getStreamState && xPlayer.getStreamState().then(perf => {
                          window.ReactNativeWebView.postMessage(
                            JSON.stringify({
                              type: 'performance',
                              message: perf
                            })
                          )
                        })
                      }
                    }, 2000)
                  }, 500)
    
              } else if(event.state === 'closing') {
                  // Connection is closing
                  console.log(':: We are going to disconnect!')
    
              } else if(event.state === 'closed'){
                  // Connection has been closed. We have to cleanup here
                  console.log(':: We are disconnected!')
                  if(perfInterval.current) {
                    clearInterval(perfInterval.current)
                  }
                  setTimeout(() => {
                    window.ReactNativeWebView.postMessage(
                      JSON.stringify({
                        type: 'streamingClosed',
                        message: ''
                      })
                    );
                  }, 10 * 1000)
              }
            })
          }

          if (type === 'disconnect') {
            setLoading(true)
            setLoadingText(`${t('Disconnecting...')}`)
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

          if (type === 'gamepad') {
            globalThis.gpState = value
          }
        } catch (e) {
          console.log('error:', e)
        }
      })

      // startSession
      if (window.ReactNativeWebView) {
        setLoading(true)
        setLoadingText(`${t('Connecting...')}`)
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'xcloudReady'
        }));
      }
    } else {
      setxPlayer(new xStreamingPlayer('videoHolder', {
        ui_systemui: [],
        ui_touchenabled: false,
        input_legacykeyboard: false,
      }))
    }

    return () => {
      if(xPlayer !== undefined){
          xPlayer.close()
      }
      if (vconsole.current) {
        vconsole.current.destroy()
      }
      if (keepaliveInterval.current) {
        clearInterval(keepaliveInterval.current)
      }
      if(perfInterval.current) {
        clearInterval(perfInterval.current)
      }
    }
  }, [xPlayer, t])

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

  const handleModalAction = (key) => {
    if (key === 'exit') {
      setLoading(true)
      setLoadingText(`${t('Disconnecting...')}`)
      setIsStoped(true)
      xPlayer && xPlayer.close()

      setTimeout(() => {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'timeoutExit'
          }));
        }
      }, 1000)
      
    }
  }

  return (
    <>
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

      <div id="videoHolder" className={videoFormat}></div>
    </>
  );
}

export default Home
