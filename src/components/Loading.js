import { Spinner } from "@nextui-org/react"
import "./Loading.css"

const Loading = ({ loadingText }) => {
  return (
    <div className="loading">
      <Spinner color="success" label={loadingText} labelColor="success" size="lg"/>
    </div>
  )
}

export default Loading