import { useState } from 'react'

const DpadButton: React.FC<{ btnId: string; btnName: string, className: string, onPressStart?: any, onPressEnd?: any }> = ({ btnId, btnName, className, onPressStart, onPressEnd }) => {
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
      className={`${className} ${isPressed ? 'hover' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    ></button>
  )
}

export default DpadButton