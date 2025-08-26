import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next';

const PerfPanel = ({ xPlayer, connectState, isHorizon = true }) => {
  const { t } = useTranslation()
  const [performance, setPerformance] = useState<any>(null)
  const performanceRef = useRef(null)
  
  useEffect(() => {
    let perfInterval
    if (!perfInterval) {
      perfInterval = setInterval(() => {
        if (xPlayer && connectState === 'connected') {
          const oldPerf = performanceRef.current
          xPlayer.getStreamState && xPlayer.getStreamState().then(perf => {

            if (oldPerf) {
              if (
                (!perf.br || perf.br === '--') &&
                oldPerf.br &&
                oldPerf.br !== '--'
              ) {
                perf.br = oldPerf.br
              }
              if (
                (!perf.decode || perf.decode === '--') &&
                oldPerf.decode &&
                oldPerf.decode !== '--'
              ) {
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
            <div>{performance.resolution || ''}</div>
            <div>{t('RTT')}: {performance.rtt || ''}</div>
            <div>{t('JIT')}: {performance.jit || ''}</div>
            <div>{t('FPS')}: {performance.fps || ''}</div>
            <div>{t('FD')}: {performance.fl || ''}</div>
            <div>{t('PL')}: {performance.pl || ''}</div>
            <div>{t('Bitrate')}: {performance.br || ''}</div>
            <div>{t('DT')}: {performance.decode || ''}</div>
          </div>
      )
    } else {
      return (
        <div className='performances-h'>
          <div className='performances-wrap'>
            <span>{performance.resolution || ''} | </span>
            <span>{t('RTT')}: {performance.rtt || ''} | </span>
            <span>{t('JIT')}: {performance.jit || ''} | </span>
            <span>{t('FPS')}: {performance.fps || ''} | </span>
            <span>{t('FD')}: {performance.fl || ''} | </span>
            <span>{t('PL')}: {performance.pl || ''} | </span>
            <span>{t('Bitrate')}: {performance.br || ''} | </span>
            <span>{t('DT')}: {performance.decode || ''}</span>
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
