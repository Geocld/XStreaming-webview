import { useState, useEffect } from 'react'

const PerfPanel = ({ xPlayer, connectState }) => {
  const [performance, setPerformance] = useState(null)

  
  useEffect(() => {
    let perfInterval
    if (!perfInterval) {
      perfInterval = setInterval(() => {
        if (xPlayer && connectState === 'connected')
          xPlayer.getStreamState && xPlayer.getStreamState().then(perf => {
          setPerformance(perf)
        })
      }, 2000)
    }

    return () => {
      if (perfInterval) {
        clearInterval(perfInterval)
      }
    }
  }, [xPlayer, connectState])

  return (
    <>
      {
        performance && (
          <div className='performances'>
            <div>Resolution: {performance.resolution || ''}</div>
            <div>Round Trip Time: {performance.rtt || ''}</div>
            <div>FPS: {performance.fps || ''}</div>
            <div>Frames Dropped: {performance.fl || ''}</div>
            <div>Packets Lost: {performance.pl || ''}</div>
            <div>Bitrate: {performance.br || ''}</div>
            <div>Decode time: {performance.decode || ''}</div>
          </div>
        )
      }
    </>
  )
}

export default PerfPanel
