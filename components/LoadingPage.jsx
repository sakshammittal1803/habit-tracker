import { useState } from 'react'

function LoadingPage() {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="loading-page">
      <div className="loading-content">
        {!imageError ? (
          <img 
            src="/notes.gif" 
            alt="Loading..." 
            className="loading-gif"
            onError={handleImageError}
          />
        ) : (
          <div className="loading-fallback">
            <div className="loading-spinner"></div>
          </div>
        )}
        <h2 className="loading-text">Loading Habit Tracker...</h2>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage