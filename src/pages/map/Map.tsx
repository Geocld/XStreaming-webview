import { useState } from 'react'
import './Map.css'

function Map() {
  const [gamepads, setGamepads] = useState([]);
  console.log(gamepads)
  return (
    <div style={{color: '#fff'}}>map page</div>
  )
}

export default Map
