import { useState, useEffect } from 'react'
import { useGamepads } from 'react-gamepads';

const buttonLabels = [
  "A",
  "B",
  "X",
  "Y",
  "L1",
  "R1",
  "L2",
  "R2",
  "View",
  "Menu",
  "L3",
  "R3",
  "UP",
  "DOWN",
  "LEFT",
  "RIGHT",
  "XBOX",
]

const axesLabels = [
  "LX",
  "LY",
  "RX",
  "RY",
]

function Debug() {
  const [gamepads, setGamepads] = useState([]);
  useGamepads(_gamepads => {
    setGamepads(Object.values(_gamepads))
  })
  if (!gamepads) return '';

  return (
    <div style={{color: '#fff'}}>
      {gamepads.length > 0 && gamepads.map(gp => {
        return (
          <div>
            <div><span>ID:</span>{gp.id}</div>
            {gp.buttons.map((button, index) => {
              return (
                <div><span>{buttonLabels[index]}:</span><span>{button.value}</span></div>
              )
            })}
            {gp.axes.map((stick, index) => {
              return (
                <div><span>{axesLabels[index]}:</span><span>{stick}</span></div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default Debug
