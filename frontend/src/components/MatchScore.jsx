import './MatchScore.css'

function MatchScore({ score, analysis }) {
  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50'
    if (score >= 60) return '#ff9800'
    return '#f44336'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Fair Match'
    return 'Needs Improvement'
  }

  return (
    <div className="match-score-container">
      <div className="score-circle" style={{ borderColor: getScoreColor(score) }}>
        <div className="score-value" style={{ color: getScoreColor(score) }}>
          {score}%
        </div>
        <div className="score-label">{getScoreLabel(score)}</div>
      </div>

      {analysis && (
        <div className="analysis-details">
          <div className="analysis-section">
            <h3>🎯 Key Requirements Detected:</h3>
            <div className="tags-container">
              {analysis.requiredSkills.slice(0, 10).map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>

          <div className="analysis-section">
            <h3>🏢 Industry:</h3>
            <p className="industry-badge">{analysis.industry}</p>
          </div>

          <div className="analysis-section">
            <h3>📊 Experience Level:</h3>
            <p className="level-badge">{analysis.experienceLevel}</p>
          </div>

          {analysis.keywords && analysis.keywords.length > 0 && (
            <div className="analysis-section">
              <h3>🔑 Top Keywords:</h3>
              <div className="keywords-list">
                {analysis.keywords.slice(0, 15).map((keyword, index) => (
                  <span key={index} className="keyword-chip">{keyword}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MatchScore
