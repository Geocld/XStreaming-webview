import { useState } from 'react'

const PadButton: React.FC<{ btnId: string; btnName: string, onPressStart?: any, onPressEnd?: any }> = ({ btnId, btnName, onPressStart, onPressEnd }) => {
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = (e: any) => {
    setIsPressed(true)
    onPressStart && onPressStart(e)
  }

  const handleTouchEnd = (e) => {
    setIsPressed(false)
    onPressEnd && onPressEnd(e)
  }

  return (
    <button 
      id={btnId} 
      name={btnName}
      className={isPressed ? 'pressed' : ''}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    ></button>
  )
}

export default PadButton