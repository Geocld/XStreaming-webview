import React from 'react'
import SVG from 'react-inlinesvg'
import './GamepadIcon.scss'

import view from '../assets/gamepad/view.svg'
import menu from '../assets/gamepad/menu.svg'

const icons = {
  view,
  menu
}

const GamepadIcon = ({ name, width = 48, height = 48, onPressStart, onPressEnd }) => {
  const handleTouchStart = (e: any) => {
    onPressStart && onPressStart(e)
  }

  const handleTouchEnd = (e) => {
    onPressEnd && onPressEnd(e)
  }

  return (
    <SVG
      src={icons[name]}
      width={width}
      height={height}
      className="gamepad-btn"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    />
  )
}

export default GamepadIcon