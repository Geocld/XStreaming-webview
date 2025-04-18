import loading from '../assets/loading.svg'

const Loading = ({ loadingText }) => {
  return (
    <div className="loading">
      <div>
        <img src={loading} alt="" />
      </div>
      <div className="loadingText">{loadingText}</div>
    </div>
  )
}

export default Loading