import { useState, useEffect, useRef } from 'react'
import VConsole from 'vconsole'
import xStreamingPlayer from 'xstreaming-player'
import Loading from '../../components/Loading'
import WarningModal from '../../components/WarningModal'
import FailedModal from '../../components/FailedModal'
import { useTranslation } from 'react-i18next'
import './Home.css'

console.log('xStreamingPlayer:', xStreamingPlayer)

function Home() {
  const { t } = useTranslation()

  const [loading, setLoading] = useState(true)
  const [loadingText, setLoadingText] = useState('')
  const [connectState, setConnectState] = useState('')
  const [videoFormat, setVideoFormat] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const [showFailed, setShowFailed] = useState(false)
  const [isStoped, setIsStoped] = useState(false)
  const isStopedRef = useRef(isStoped)
  const [xPlayer, setxPlayer] = useState(undefined)
  const vconsole = useRef(null)
  const timer = useRef(null)
  const keepaliveInterval = useRef(null)
  const perfInterval = useRef(null)
  const connectStateRef = useRef('')

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

      xPlayer.setConnectFailHandler(() => {
        // Not connected
        if (connectStateRef.current === '') {
          if (timer.current) {
            clearTimeout(timer.current)
          }
          setShowWarning(false)
          setShowFailed(true)
        }
      })

      const getVideoPlayerFilterStyle = (options) => {
        const filters = [];
        const usmMatrix = document.getElementById('filter-usm-matrix')
    
        const sharpness = options.sharpness || 0; // 清晰度
        if (sharpness !== 0) {
          const level = (7 - ((sharpness / 2) - 1) * 0.5).toFixed(1); // 5, 5.5, 6, 6.5, 7
          const matrix = `0 -1 0 -1 ${level} -1 0 -1 0`;
          usmMatrix.setAttributeNS(null, 'kernelMatrix', matrix);
          filters.push(`url(#filter-usm)`);
        }
    
        const saturation = options.saturation || 100; // 饱和度
        if (saturation != 100) {
          filters.push(`saturate(${saturation}%)`);
        }
    
        const contrast = options.contrast || 100; // 对比度
        if (contrast !== 100) {
          filters.push(`contrast(${contrast}%)`);
        }
    
        const brightness = options.brightness || 100; // 亮度
        if (brightness !== 100) {
          filters.push(`brightness(${brightness}%)`);
        }
    
        return filters.join(' ');
      }
    
      const refreshPlayer = (options) => {
        const videoStyle = document.getElementById('video-css')
        let filters = getVideoPlayerFilterStyle(options);
        let videoCss = '';
        if (filters) {
            videoCss += `filter: ${filters} !important;`;
        }
        let css = '';
        if (videoCss) {
            css = `#videoHolder video { ${videoCss} }`;
        }
    
        videoStyle!.textContent = css;
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
              connectStateRef.current = event.state

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
          if (type === 'refreshVideo') {
            refreshPlayer(value)
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

  if (!timer.current) {
    timer.current = setTimeout(() => {
      if (connectState !== 'connected') {
        setShowWarning(true)
      }
    }, 60 * 1000)
  }

  if (connectState === 'connected' && timer.current) {
    clearTimeout(timer.current)
  }

  // exitType = exit | timeoutExit
  const handleExit = (exitType) => {
    setLoading(true)
    setLoadingText(`${t('Disconnecting...')}`)
    setIsStoped(true)
    xPlayer && xPlayer.close()

    setTimeout(() => {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: exitType
        }));
      }
    }, 1000)
  }

  return (
    <>
      {loading && <Loading loadingText={loadingText} />}

      <FailedModal
        show={showFailed}
        onConfirm={() => {
          setShowFailed(false);
          handleExit('timeoutExit')
        }}
        onCancel={() => {
          setShowFailed(false);
          handleExit('exit')
        }}
      />

      <WarningModal
        show={showWarning}
        onConfirm={() => {
          setShowWarning(false);
          handleExit('exit')
        }}
        onCancel={() => {
          setShowWarning(false);
        }}
      />

      <div id="videoHolder" className={videoFormat}>
        {/* <video src="https://www.w3schools.com/html/mov_bbb.mp4" autoPlay muted loop playsInline></video> */}
      </div>

      <svg id="video-filters" style={{display: 'none'}}><defs><filter id="filter-usm"><feConvolveMatrix id="filter-usm-matrix" order="3"></feConvolveMatrix></filter></defs></svg>
    </>
  );
}

export default Home
