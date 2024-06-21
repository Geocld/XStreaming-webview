import { useEffect, useCallback } from 'react'
import PadButton from './PadButton'
import DpadButton from './DpadButton'
import JoystickController from 'joystick-controller'

const Gamepad = ({ onPressButtonStart, onPressButtonEnd, onMoveJs }) => {
  
  // const [leftStick, setLeftStick] = useState(null)

  const handleMove = useCallback((id, data) => {
    if (onMoveJs) {
      onMoveJs(id, data);
    }
  }, [onMoveJs]);

  useEffect(() => {
    console.log('create')
    const leftStick = new JoystickController({
      level: 10,
      x: '10%',
      y: '40%',
      maxRange: 50,
      containerClass: 'joystick-container'
    }, (data) => {
      handleMove('lsb', data)
    })
    const rightStick = new JoystickController({
      level: 10,
      x: '70%',
      y: '30%',
      maxRange: 50,
      containerClass: 'joystick-container'
    }, (data) => {
        handleMove('rsb', data)
    })

    return () => {
      leftStick.destroy()
      rightStick.destroy()
    }
  }, [handleMove])

  const handlePressButtonStart = (value, name) => {
    onPressButtonStart && onPressButtonStart(value, name)
  }

  const handlePressButtonEnd = (value, name) => {
    onPressButtonEnd && onPressButtonEnd(value, name)
  }

  // const handleJsMove = (id, data) => {
  //   onMoveJs && onMoveJs(id, data)
  // }

  return (
    <>
      <div className="wrapper active">
        <div className="top-buttons">
          <div className="left">
            <div>
              <PadButton btnId="lt" btnName="LEFT_TRIGGER" onPressStart={() => handlePressButtonStart(0, 'LeftTrigger')} onPressEnd={() => handlePressButtonEnd(0, 'LeftTrigger')}/>
            </div>
            <div>
            <PadButton btnId="lb" btnName="LEFT_SHOULDER" onPressStart={() => handlePressButtonStart(0, 'LeftShoulder')} onPressEnd={() => handlePressButtonEnd(0, 'LeftShoulder')}/>
            </div>
          </div>
          <div className="right">
            <div>
              <PadButton btnId="rt" btnName="RIGHT_TRIGGER" onPressStart={() => handlePressButtonStart(0, 'RightTrigger')} onPressEnd={() => handlePressButtonEnd(0, 'RightTrigger')}/>
            </div>
            <div>
              <PadButton btnId="rb" btnName="RIGHT_SHOULDER" onPressStart={() => handlePressButtonStart(0, 'RightShoulder')} onPressEnd={() => handlePressButtonEnd(0, 'RightShoulder')}/>
            </div>
          </div>
        </div>
        <div className="bot-buttons">
          <div className="left">
              <div className="lsb">
                <div id="lsb"></div>
                {/* <canvas id="lsb"></canvas> */}
                <PadButton btnId="lst" btnName="LEFT_THUMB" onPressStart={() => handlePressButtonStart(0, 'LeftThumb')} onPressEnd={() => handlePressButtonEnd(0, 'LeftThumb')}/>
              </div>
              <div className="dpad">
                <div className="d-pad">
                    <DpadButton className="up" btnId="d-pad-up" btnName="DPadUp" onPressStart={() => handlePressButtonStart(0, 'DPadUp')} onPressEnd={() => handlePressButtonEnd(0, 'DPadUp')}/>
                    <DpadButton className="right" btnId="d-pad-right" btnName="DPadRight" onPressStart={() => handlePressButtonStart(0, 'DPadRight')} onPressEnd={() => handlePressButtonEnd(0, 'DPadRight')}/>
                    <DpadButton className="down" btnId="d-pad-down" btnName="DPadDown" onPressStart={() => handlePressButtonStart(0, 'DPadDown')} onPressEnd={() => handlePressButtonEnd(0, 'DPadDown')}/>
                    <DpadButton className="left" btnId="d-pad-left" btnName="DPadLeft" onPressStart={() => handlePressButtonStart(0, 'DPadLeft')} onPressEnd={() => handlePressButtonEnd(0, 'DPadLeft')}/>
                </div>
              </div>
          </div>
          <div className="center-button">
              <div className="extras">
                <PadButton btnId="view" btnName="View" onPressStart={() => handlePressButtonStart(0, 'View')} onPressEnd={() => handlePressButtonEnd(0, 'View')}/>
                <PadButton btnId="nexus" btnName="Nexus" onPressStart={() => handlePressButtonStart(0, 'Nexus')} onPressEnd={() => handlePressButtonEnd(0, 'Nexus')}/>
                <PadButton btnId="menu" btnName="Menu" onPressStart={() => handlePressButtonStart(0, 'Menu')} onPressEnd={() => handlePressButtonEnd(0, 'Menu')}/>
              </div>
          </div>
          <div className="right">
              <div className="rsb">
                {/* <canvas id="rsb"></canvas> */}
                <PadButton btnId="rst" btnName="RIGHT_THUMB" onPressStart={() => handlePressButtonStart(0, 'RightThumb')} onPressEnd={() => handlePressButtonEnd(0, 'RightThumb')}/>
              </div>
              <div className="xyab">
                <div className="y">
                  <PadButton btnId="y" btnName="Y_BUTTON" onPressStart={() => handlePressButtonStart(0, 'Y')} onPressEnd={() => handlePressButtonEnd(0, 'Y')}/>
                </div>
                <div className="xb">
                  <div className="x">
                    <PadButton btnId="x" btnName="X_BUTTON" onPressStart={() => handlePressButtonStart(0, 'X')} onPressEnd={() => handlePressButtonEnd(0, 'X')}/>
                  </div>
                  <div className="b">
                    <PadButton btnId="b" btnName="B_BUTTON" onPressStart={() => handlePressButtonStart(0, 'B')} onPressEnd={() => handlePressButtonEnd(0, 'B')}/>
                  </div>
                </div>
                <div className="a">
                  <PadButton btnId="a" btnName="A_BUTTON" onPressStart={() => handlePressButtonStart(0, 'A')} onPressEnd={() => handlePressButtonEnd(0, 'A')}/>
                </div>
              </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Gamepad