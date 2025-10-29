import React, { useState } from 'react'
import './Bracket.css'

const Bracket = ({
  matches,
  onWinnerSelect,
  onNameEdit,
  matchWidth = 200,
  matchHeight = 80,
  roundGap = 80,
  fontFamily = 'Inter',
  viewMode = 'standard',
  colors = {
    roundHeaderBg: '#D8B4E2',
    roundHeaderText: '#333333',
    finalsHeaderBg: '#FFD700',
    finalsHeaderText: '#333333',
    matchBg: '#FFFFFF',
    matchBorder: '#E0E0E0',
    participantText: '#333333',
    seedBg: '#667EEA',
    seedText: '#FFFFFF',
    connectorLine: '#CED1F2',
    winnerHighlight: '#E8F5E9'
  }
}) => {
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [editingParticipant, setEditingParticipant] = useState(null)
  const [editValue, setEditValue] = useState('')
  if (!matches || matches.length === 0) return null

  // Group matches by round
  const rounds = {}
  matches.forEach(match => {
    const round = parseInt(match.tournamentRoundText)
    if (!rounds[round]) rounds[round] = []
    rounds[round].push(match)
  })

  const numRounds = Object.keys(rounds).length
  const firstRoundMatches = rounds[1]?.length || 0
  const bracketHeight = firstRoundMatches * matchHeight * 2

  // Calculate vertical spacing for each round
  const getRoundSpacing = (round) => {
    return matchHeight * Math.pow(2, round - 1)
  }

  // Calculate Y position for a match in a round
  const getMatchY = (roundNum, matchIndex) => {
    const spacing = getRoundSpacing(roundNum)
    const offset = spacing / 2
    return offset + (matchIndex * spacing)
  }

  // Handle participant click
  const handleParticipantClick = (matchId, participantIndex) => {
    const match = matches.find(m => m.id === matchId)
    if (!match) return

    // Don't allow selection if both participants are TBD
    if (match.participants[0]?.name === 'TBD' && match.participants[1]?.name === 'TBD') return

    setSelectedParticipant({ matchId, participantIndex })
  }

  // Handle checkbox click to select winner
  const handleWinnerSelect = (matchId, participantIndex) => {
    if (onWinnerSelect) {
      onWinnerSelect(matchId, participantIndex)
    }
    setSelectedParticipant(null)
  }

  // Handle double click to edit name
  const handleDoubleClick = (matchId, participantIndex, currentName) => {
    setEditingParticipant({ matchId, participantIndex })
    setEditValue(currentName)
  }

  // Handle name edit submission
  const handleNameEdit = (e, matchId, participantIndex) => {
    if (e.key === 'Enter') {
      if (onNameEdit && editValue.trim()) {
        onNameEdit(matchId, participantIndex, editValue.trim())
      }
      setEditingParticipant(null)
      setEditValue('')
    } else if (e.key === 'Escape') {
      setEditingParticipant(null)
      setEditValue('')
    }
  }

  // Render a participant row
  const renderParticipant = (match, participant, participantIndex, seedNumber) => {
    const isSelected = selectedParticipant?.matchId === match.id && selectedParticipant?.participantIndex === participantIndex
    const isEditing = editingParticipant?.matchId === match.id && editingParticipant?.participantIndex === participantIndex
    const isWinner = participant?.isWinner

    return (
      <div
        className={`match-participant ${isWinner ? 'winner' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => handleParticipantClick(match.id, participantIndex)}
        onDoubleClick={() => handleDoubleClick(match.id, participantIndex, participant?.name || 'TBD')}
        style={{
          backgroundColor: isWinner ? colors.winnerHighlight : 'transparent',
          color: colors.participantText
        }}
      >
        <span className="seed" style={{ backgroundColor: colors.seedBg, color: colors.seedText }}>{seedNumber}</span>
        {isEditing ? (
          <input
            type="text"
            className="name-edit"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => handleNameEdit(e, match.id, participantIndex)}
            onBlur={() => setEditingParticipant(null)}
            autoFocus
            style={{ color: colors.participantText }}
          />
        ) : (
          <span className="name" style={{ color: colors.participantText }}>{participant?.name || 'TBD'}</span>
        )}
        {isSelected && (
          <button
            className="winner-checkbox"
            onClick={(e) => {
              e.stopPropagation()
              handleWinnerSelect(match.id, participantIndex)
            }}
            title="Select as winner"
          >
            ✓
          </button>
        )}
      </div>
    )
  }

  if (viewMode === 'standard') {
    const totalWidth = numRounds * (matchWidth + roundGap)

    return (
      <div className="bracket-wrapper">
        <svg
          className="bracket-svg"
          width={totalWidth}
          height={bracketHeight}
          style={{ minHeight: '400px' }}
        >
          {/* Render connector lines first (so they appear behind matches) */}
          {Object.keys(rounds).map(roundNum => {
            const round = parseInt(roundNum)
            if (round >= numRounds) return null // No connectors after last round

            return rounds[round].map((match, matchIndex) => {
              const headerOffset = 40
              const x1 = (round - 1) * (matchWidth + roundGap) + matchWidth
              const y1 = getMatchY(round, matchIndex) + headerOffset + matchHeight / 2

              const x2 = round * (matchWidth + roundGap)
              const nextMatchIndex = Math.floor(matchIndex / 2)
              const y2 = getMatchY(round + 1, nextMatchIndex) + headerOffset + matchHeight / 2

              // Create L-shaped connector
              const midX = x1 + roundGap / 2

              return (
                <g key={`connector-${match.id}`}>
                  {/* Horizontal line from match */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={midX}
                    y2={y1}
                    stroke={colors.connectorLine}
                    strokeWidth="2"
                  />
                  {/* Vertical line connecting pairs */}
                  {matchIndex % 2 === 0 && rounds[round][matchIndex + 1] && (
                    <line
                      x1={midX}
                      y1={y1}
                      x2={midX}
                      y2={getMatchY(round, matchIndex + 1) + headerOffset + matchHeight / 2}
                      stroke={colors.connectorLine}
                      strokeWidth="2"
                    />
                  )}
                  {/* Horizontal line to next match (only from top match of pair) */}
                  {matchIndex % 2 === 0 && (
                    <line
                      x1={midX}
                      y1={(y1 + getMatchY(round, matchIndex + 1) + headerOffset + matchHeight / 2) / 2}
                      x2={x2}
                      y2={y2}
                      stroke={colors.connectorLine}
                      strokeWidth="2"
                    />
                  )}
                </g>
              )
            })
          })}

          {/* Render matches */}
          {Object.keys(rounds).map(roundNum => {
            const round = parseInt(roundNum)

            return (
              <g key={`round-${round}`}>
                {/* Round header */}
                <foreignObject
                  x={(round - 1) * (matchWidth + roundGap)}
                  y={0}
                  width={matchWidth}
                  height={30}
                >
                  <div className="round-header" style={{ fontFamily, backgroundColor: colors.roundHeaderBg, color: colors.roundHeaderText }}>
                    Round {round}
                  </div>
                </foreignObject>

                {/* Matches */}
                {rounds[round].map((match, matchIndex) => {
                  const x = (round - 1) * (matchWidth + roundGap)
                  const y = getMatchY(round, matchIndex)

                  return (
                    <foreignObject
                      key={match.id}
                      x={x}
                      y={y + 40} // Add offset for round header
                      width={matchWidth}
                      height={matchHeight}
                    >
                      <div className="match-container" style={{ fontFamily, backgroundColor: colors.matchBg, borderColor: colors.matchBorder }}>
                        {renderParticipant(match, match.participants[0], 0, matchIndex * 2 + 1)}
                        {renderParticipant(match, match.participants[1], 1, matchIndex * 2 + 2)}
                      </div>
                    </foreignObject>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // Mirrored view - Finals in center (NBA Playoffs style)
  const halfMatches = Math.ceil(firstRoundMatches / 2)

  // Calculate center position for finals (no extra gap)
  const leftSideWidth = (numRounds - 1) * (matchWidth + roundGap)
  const centerX = leftSideWidth
  const rightSideWidth = (numRounds - 1) * (matchWidth + roundGap) + matchWidth
  const totalWidth = leftSideWidth + matchWidth + rightSideWidth

  // Split matches into left and right brackets
  const leftBracket = {}
  const rightBracket = {}
  const finalsMatch = rounds[numRounds]?.[0]

  Object.keys(rounds).forEach(roundNum => {
    const round = parseInt(roundNum)
    if (round === numRounds) return // Skip finals for now

    leftBracket[round] = []
    rightBracket[round] = []

    const matchesInRound = rounds[round].length
    const half = Math.ceil(matchesInRound / 2)

    rounds[round].forEach((match, idx) => {
      if (idx < half) {
        leftBracket[round].push(match)
      } else {
        rightBracket[round].push(match)
      }
    })
  })

  return (
    <div className="bracket-wrapper">
      <svg
        className="bracket-svg"
        width={totalWidth}
        height={bracketHeight}
        style={{ minHeight: '400px' }}
      >
        {/* LEFT BRACKET */}
        {/* Left bracket connector lines */}
        {Object.keys(leftBracket).map(roundNum => {
          const round = parseInt(roundNum)
          if (round >= numRounds - 1) return null

          return leftBracket[round].map((match, matchIndex) => {
            const headerOffset = 40
            const x1 = (round - 1) * (matchWidth + roundGap) + matchWidth
            const y1 = getMatchY(round, matchIndex) + headerOffset + matchHeight / 2

            const x2 = round * (matchWidth + roundGap)
            const nextMatchIndex = Math.floor(matchIndex / 2)
            const y2 = getMatchY(round + 1, nextMatchIndex) + headerOffset + matchHeight / 2

            const midX = x1 + roundGap / 2

            return (
              <g key={`connector-left-${match.id}`}>
                <line x1={x1} y1={y1} x2={midX} y2={y1} stroke="#CED1F2" strokeWidth="2" />
                {matchIndex % 2 === 0 && leftBracket[round][matchIndex + 1] && (
                  <line
                    x1={midX}
                    y1={y1}
                    x2={midX}
                    y2={getMatchY(round, matchIndex + 1) + headerOffset + matchHeight / 2}
                    stroke={colors.connectorLine}
                    strokeWidth="2"
                  />
                )}
                {matchIndex % 2 === 0 && (
                  <line
                    x1={midX}
                    y1={(y1 + getMatchY(round, matchIndex + 1) + headerOffset + matchHeight / 2) / 2}
                    x2={x2}
                    y2={y2}
                    stroke={colors.connectorLine}
                    strokeWidth="2"
                  />
                )}
              </g>
            )
          })
        })}

        {/* Left bracket matches */}
        {Object.keys(leftBracket).map(roundNum => {
          const round = parseInt(roundNum)

          return (
            <g key={`round-left-${round}`}>
              <foreignObject
                x={(round - 1) * (matchWidth + roundGap)}
                y={0}
                width={matchWidth}
                height={30}
              >
                <div className="round-header" style={{ fontFamily, backgroundColor: colors.roundHeaderBg, color: colors.roundHeaderText }}>
                  Round {round}
                </div>
              </foreignObject>

              {leftBracket[round].map((match, matchIndex) => {
                const x = (round - 1) * (matchWidth + roundGap)
                const y = getMatchY(round, matchIndex)

                return (
                  <foreignObject
                    key={match.id}
                    x={x}
                    y={y + 40}
                    width={matchWidth}
                    height={matchHeight}
                  >
                    <div className="match-container" style={{ fontFamily, backgroundColor: colors.matchBg, borderColor: colors.matchBorder }}>
                      {renderParticipant(match, match.participants[0], 0, matchIndex * 2 + 1)}
                      {renderParticipant(match, match.participants[1], 1, matchIndex * 2 + 2)}
                    </div>
                  </foreignObject>
                )
              })}
            </g>
          )
        })}

        {/* RIGHT BRACKET */}
        {/* Right bracket connector lines */}
        {Object.keys(rightBracket).map(roundNum => {
          const round = parseInt(roundNum)
          if (round >= numRounds - 1) return null

          return rightBracket[round].map((match, matchIndex) => {
            const headerOffset = 40
            // Mirror round number for right side (Round 1 is furthest right)
            const mirroredRound = numRounds - round
            // Start from LEFT edge of current round match (flowing towards center)
            const x1 = centerX + mirroredRound * (matchWidth + roundGap)
            const y1 = getMatchY(round, matchIndex) + headerOffset + matchHeight / 2

            // End at RIGHT edge of next round match (closer to center)
            const x2 = centerX + (mirroredRound - 1) * (matchWidth + roundGap) + matchWidth
            const nextMatchIndex = Math.floor(matchIndex / 2)
            const y2 = getMatchY(round + 1, nextMatchIndex) + headerOffset + matchHeight / 2

            const midX = x1 - roundGap / 2

            return (
              <g key={`connector-right-${match.id}`}>
                <line x1={x1} y1={y1} x2={midX} y2={y1} stroke="#CED1F2" strokeWidth="2" />
                {matchIndex % 2 === 0 && rightBracket[round][matchIndex + 1] && (
                  <line
                    x1={midX}
                    y1={y1}
                    x2={midX}
                    y2={getMatchY(round, matchIndex + 1) + headerOffset + matchHeight / 2}
                    stroke={colors.connectorLine}
                    strokeWidth="2"
                  />
                )}
                {matchIndex % 2 === 0 && (
                  <line
                    x1={midX}
                    y1={(y1 + getMatchY(round, matchIndex + 1) + headerOffset + matchHeight / 2) / 2}
                    x2={x2}
                    y2={y2}
                    stroke={colors.connectorLine}
                    strokeWidth="2"
                  />
                )}
              </g>
            )
          })
        })}

        {/* Right bracket matches */}
        {Object.keys(rightBracket).map(roundNum => {
          const round = parseInt(roundNum)
          // Mirror round number for right side (Round 1 is furthest right)
          const mirroredRound = numRounds - round

          return (
            <g key={`round-right-${round}`}>
              <foreignObject
                x={centerX + mirroredRound * (matchWidth + roundGap)}
                y={0}
                width={matchWidth}
                height={30}
              >
                <div className="round-header" style={{ fontFamily, backgroundColor: colors.roundHeaderBg, color: colors.roundHeaderText }}>
                  Round {round}
                </div>
              </foreignObject>

              {rightBracket[round].map((match, matchIndex) => {
                const x = centerX + mirroredRound * (matchWidth + roundGap)
                const y = getMatchY(round, matchIndex)

                return (
                  <foreignObject
                    key={match.id}
                    x={x}
                    y={y + 40}
                    width={matchWidth}
                    height={matchHeight}
                  >
                    <div className="match-container" style={{ fontFamily, backgroundColor: colors.matchBg, borderColor: colors.matchBorder }}>
                      {renderParticipant(match, match.participants[0], 0, halfMatches * 2 + matchIndex * 2 + 1)}
                      {renderParticipant(match, match.participants[1], 1, halfMatches * 2 + matchIndex * 2 + 2)}
                    </div>
                  </foreignObject>
                )
              })}
            </g>
          )
        })}

        {/* FINALS - Center */}
        {finalsMatch && (
          <g key="finals-center">
            {/* Connector from left semifinal to finals */}
            {leftBracket[numRounds - 1]?.[0] && (
              <line
                x1={leftSideWidth - roundGap}
                y1={getMatchY(numRounds - 1, 0) + 40 + matchHeight / 2}
                x2={centerX}
                y2={getMatchY(numRounds - 1, 0) + 40 + matchHeight / 2}
                stroke="#CED1F2"
                strokeWidth="2"
              />
            )}

            {/* Connector from right semifinal to finals */}
            {rightBracket[numRounds - 1]?.[0] && (
              <line
                x1={centerX + matchWidth + roundGap}
                y1={getMatchY(numRounds - 1, 0) + 40 + matchHeight / 2}
                x2={centerX + matchWidth}
                y2={getMatchY(numRounds - 1, 0) + 40 + matchHeight / 2}
                stroke="#CED1F2"
                strokeWidth="2"
              />
            )}

            {/* Finals header */}
            <foreignObject
              x={centerX}
              y={0}
              width={matchWidth}
              height={30}
            >
              <div className="round-header finals-header" style={{ fontFamily, backgroundColor: colors.finalsHeaderBg, color: colors.finalsHeaderText }}>
                Finals
              </div>
            </foreignObject>

            {/* Finals match */}
            <foreignObject
              x={centerX}
              y={getMatchY(numRounds - 1, 0) + 40}
              width={matchWidth}
              height={matchHeight}
            >
              <div className="match-container" style={{ fontFamily, backgroundColor: colors.matchBg, borderColor: colors.matchBorder }}>
                {renderParticipant(finalsMatch, finalsMatch.participants[0], 0, 1)}
                {renderParticipant(finalsMatch, finalsMatch.participants[1], 1, 2)}
              </div>
            </foreignObject>
          </g>
        )}
      </svg>
    </div>
  )
}

export default Bracket
