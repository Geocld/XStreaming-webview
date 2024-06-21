import { useState } from 'react'
import { useGamepads } from 'react-gamepads';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import './Map.css'

const buttonLabels = [
  "A",
  "B",
  "X",
  "Y",
  "L1",
  "R1",
  "L2",
  "R2",
  "Back",
  "Start",
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

function Map() {
  const [maping, setMaping] = useState({
    'A': 0,
    'B': 1,
    'X': 2,
    'Y': 3,
    'DPadUp': 12,
    'DPadDown': 13,
    'DPadLeft': 14,
    'DPadRight': 15,
    'LeftShoulder': 4,
    'RightShoulder': 5,
    'LeftThumb': 10,
    'RightThumb': 11,
    'LeftTrigger': 6,
    'RightTrigger': 7,
    'Menu': 9,
    'View': 8,
    'Nexus': 16,
  })

  const [gamepads, setGamepads] = useState([])
  const [showModal, setShowModal] = useState(false)

  useGamepads(_gamepads => {
    setGamepads(Object.values(_gamepads))
  })
  if (!gamepads) return ''

  if (gamepads[0]) {
    gamepads[0].buttons.forEach((b, idx) => {
      if (b.pressed) {
        console.log('press:', idx)
      }
    })
  }

  return (
    <div className='map-page'>
      <Modal isOpen={showModal}>
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">映射A按键</ModalHeader>
            <ModalBody>
              <p> 
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Nullam pulvinar risus non risus hendrerit venenatis.
                Pellentesque sit amet hendrerit risus, sed porttitor quam.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={() => setShowModal(false)}>
                Close
              </Button>
              <Button color="primary" onPress={() => setShowModal(false)}>
                Action
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
      <Button color="primary" onPress={() => { setShowModal(true) }}>
        A
      </Button>
      <div>
      {gamepads.length && gamepads.map(gp => {
        return (
          <div key={gp}>
            <div><span>ID:</span>{gp.id}</div>
            {gp.buttons.map((button, index) => {
              return (
                <div key={index}><span>{buttonLabels[index]}:</span><span>{button.value}</span></div>
              )
            })}
            {gp.axes.map((stick, index) => {
              return (
                <div key={index}><span>{axesLabels[index]}:</span><span>{stick}</span></div>
              )
            })}
          </div>
        )
      })}
      </div>
    </div>
  )
}

export default Map
