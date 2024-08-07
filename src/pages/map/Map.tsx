import { useState, useEffect } from 'react'
import VConsole from 'vconsole'
import { Button } from "@nextui-org/react";
import { useTranslation } from 'react-i18next'
import Loading from '../../components/Loading'
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

function Map() {
  const { t } = useTranslation()
  const [maping, setMaping] = useState(JSON.parse(JSON.stringify(defaultMaping)))
  const [current, setCurrent] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [vconsole, setVconsole] = useState(undefined)

  useEffect(() => {
    document.body.style['overflow-y'] = 'auto'
    document.body.style['position'] = 'inherit'

    document.addEventListener('message', (event: any) => {
      const message = JSON.parse(event.data);
      if (message.type === 'updateGlobalVariable') {
        console.log('Global variable updated:', message);
      }
    })

    if (window.ReactNativeWebView) {
      let streamSettings = window.ReactNativeWebView.injectedObjectJson()
      try {
        streamSettings = JSON.parse(streamSettings).settings
      } catch (e) {
        streamSettings = {}
      }

      if (streamSettings.gamepad_maping) {
        setMaping(streamSettings.gamepad_maping)
      }

      if (streamSettings.debug && vconsole === undefined) {
        setVconsole(new VConsole())
      }
    }

    return () => {
      if (vconsole !== undefined) {
        vconsole.destroy()
      }
    }
  }, [vconsole])

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
    setLoading(true)
    setLoadingText(t('Saving...'))
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'saveMaping',
        message: maping
      })
    );
    setTimeout(() => {
      setLoadingText(t('Saved'))
      setLoading(false)
    }, 2000)
  }

  const handleReset = () => {
    console.log('handleReset')
    setMaping(defaultMaping)
  }

  return (
    <div className='map-page'>

      {loading && <Loading loadingText={loadingText} />}

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
          <Button color="primary" fullWidth onClick={handleSave}>
            {t('Save')}
          </Button>
          <Button color="default" fullWidth onClick={handleReset}>
            {t('Reset')}
          </Button>
        </div>
      
      </div>
      
    </div>
  )
}

export default Map
