import { useState, useEffect } from 'react'
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import GamepadMapModal from '../../components/GamepadMapModal';
import MapItem from '../../components/MapItem';
import './Map.scss'

const defaultMaping = {
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
}

const buttonLabels = [
  "A",
  "B",
  "X",
  "Y",
  "DPadUp",
  "DPadDown",
  "DPadLeft",
  "DPadRight",
  "LeftShoulder",
  "RightShoulder",
  "LeftTrigger",
  "RightTrigger",
  "LeftThumb",
  "RightThumb",
  "View",
  "Menu",
  "Nexus",
]

const axesLabels = [
  "LX",
  "LY",
  "RX",
  "RY",
]

function Map() {
  const [maping, setMaping] = useState(JSON.parse(JSON.stringify(defaultMaping)))
  const [current, setCurrent] = useState('')

  useEffect(() => {
    // document.body.style.height = 'auto'
    document.body.style['overflow-y'] = 'auto'
    document.body.style['position'] = 'inherit'
  }, [])

  const [showModal, setShowModal] = useState(false)

  const handleMapConfirm = (name, idx) => {
    console.log(name, idx)
    setShowModal(false)
    setMaping({
      ...maping,
      [name]: idx
    })
  }

  const handleMapPress = (name) => {
    setCurrent(name)
    setShowModal(true)
  }

  const handleSave = () => {
    console.log('maping:', maping)
  }

  const handleReset = () => {
    setMaping(defaultMaping)
  }

  return (
    <div className='map-page'>

      {
        showModal && (
          <GamepadMapModal show={showModal} current={current} onConfirm={handleMapConfirm} onCancel={() => setShowModal(false)}/>
        )
      }
      
  
      <div className='maps'>
        {
          buttonLabels.map(name => {
            return (
              <div className='maps-item' key={name}>
                <MapItem name={name} value={maping[name]} onPress={handleMapPress}/>
              </div>
            )
          })
        }

        <div className="operate-btns">
          <Button color="primary" fullWidth onPress={handleSave}>
            保存
          </Button>
          <Button color="default" fullWidth onPress={handleReset}>
            恢复默认值
          </Button>
        </div>
      
      </div>
      
    </div>
  )
}

export default Map
