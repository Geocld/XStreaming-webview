import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next';

const PerfPanel = ({ xPlayer, connectState, isHorizon = true }) => {
  const { t } = useTranslation()
  const [performance, setPerformance] = useState(null)
  const performanceRef = useRef(null)
  
  useEffect(() => {
    let perfInterval
    if (!perfInterval) {
      perfInterval = setInterval(() => {
        if (xPlayer && connectState === 'connected') {
          const oldPerf = performanceRef.current
          xPlayer.getStreamState && xPlayer.getStreamState().then(perf => {

            if (oldPerf) {
              if (!perf.br && oldPerf.br) {
                perf.br = oldPerf.br
              }
              if (!perf.decode && oldPerf.decode) {
                perf.decode = oldPerf.decode
              }
            }
            
            setPerformance(perf)
            performanceRef.current = perf
          })
        }
      }, 2000)
    }

    return () => {
      if (perfInterval) {
        clearInterval(perfInterval)
      }
    }
  }, [xPlayer, connectState])

  const renderView = () => {
    if (!performance) return null
    if (connectState !== 'connected') return null

    if (!isHorizon) {
      return (
          <div className='performances-v'>
            <div>{t('Resolution')}: {performance.resolution || ''}</div>
            <div>{t('Round Trip Time')}: {performance.rtt || ''}</div>
            <div>{t('FPS')}: {performance.fps || ''}</div>
            <div>{t('Frames Dropped')}: {performance.fl || ''}</div>
            <div>{t('Packets Lost')}: {performance.pl || ''}</div>
            <div>{t('Bitrate')}: {performance.br || ''}</div>
            <div>{t('Decode time')}: {performance.decode || ''}</div>
          </div>
      )
    } else {
      return (
        <div className='performances-h'>
          <div className='performances-wrap'>
            <div>{performance.resolution || ''} | </div>
            <div>{t('RTT')}: {performance.rtt || ''} | </div>
            <div>{t('FPS')}: {performance.fps || ''} | </div>
            <div>{t('FD')}: {performance.fl || ''} | </div>
            <div>{t('PL')}: {performance.pl || ''} | </div>
            <div>{t('Bitrate')}: {performance.br || ''} | </div>
            <div>{t('DT')}: {performance.decode || ''}</div>
          </div>
        </div>
      )
        
    }
  }

  return (
    <>
      { renderView() }
    </>
  )
}

export default PerfPanel
