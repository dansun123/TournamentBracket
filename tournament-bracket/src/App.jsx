import { useState } from 'react'
import Bracket from './components/Bracket'
import './App.css'

function App() {
  const [participants, setParticipants] = useState('')
  const [matches, setMatches] = useState([])
  const [showBracket, setShowBracket] = useState(false)
  const [selectedFont, setSelectedFont] = useState('Inter')
  const [viewMode, setViewMode] = useState('standard') // 'standard' or 'mirrored'

  // Color theme state
  const [colors, setColors] = useState({
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
  })

  const handleColorChange = (colorKey, value) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: value
    }))
  }

  const generateMatches = () => {
    const names = participants
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0)

    if (names.length < 2) {
      alert('Please enter at least 2 participants')
      return
    }

    // Calculate the next power of 2 for bracket size
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(names.length)))
    let participantsWithByes = [...names]

    // Fill remaining slots with BYE
    while (participantsWithByes.length < bracketSize) {
      participantsWithByes.push('BYE')
    }

    // Standard tournament bracket seeding
    // This ensures #1 and #2 seeds are on opposite sides and can only meet in finals
    // Uses the standard algorithm: pair each seed with (bracketSize + 1 - seed)
    const seededOrder = []

    // Generate the seeding order recursively
    const generateSeeding = (size) => {
      if (size === 1) return [1]

      const prevRound = generateSeeding(size / 2)
      const nextRound = []

      prevRound.forEach(seed => {
        nextRound.push(seed)
        nextRound.push(size + 1 - seed)
      })

      return nextRound
    }

    const seedingOrder = generateSeeding(bracketSize)

    // Apply the seeding order to participants
    seedingOrder.forEach(seed => {
      seededOrder.push(participantsWithByes[seed - 1])
    })

    participantsWithByes = seededOrder

    // Generate matches for all rounds
    const generatedMatches = []
    let matchId = 1
    const numRounds = Math.log2(bracketSize)

    // First round matches
    for (let i = 0; i < bracketSize / 2; i++) {
      const participant1 = participantsWithByes[i * 2]
      const participant2 = participantsWithByes[i * 2 + 1]

      generatedMatches.push({
        id: matchId,
        nextMatchId: Math.floor(bracketSize / 2) + Math.floor(i / 2) + 1,
        tournamentRoundText: '1',
        startTime: new Date().toISOString(),
        state: 'SCHEDULED',
        participants: [
          {
            id: `p${i * 2 + 1}`,
            resultText: null,
            isWinner: false,
            status: null,
            name: participant1,
          },
          {
            id: `p${i * 2 + 2}`,
            resultText: null,
            isWinner: false,
            status: null,
            name: participant2,
          },
        ],
      })
      matchId++
    }

    // Generate subsequent rounds
    for (let round = 2; round <= numRounds; round++) {
      const matchesInRound = Math.pow(2, numRounds - round)

      for (let i = 0; i < matchesInRound; i++) {
        generatedMatches.push({
          id: matchId,
          nextMatchId: round === numRounds ? null : matchId + matchesInRound - i,
          tournamentRoundText: round.toString(),
          startTime: new Date().toISOString(),
          state: 'SCHEDULED',
          participants: [
            {
              id: `tbd${matchId}-1`,
              resultText: null,
              isWinner: false,
              status: null,
              name: 'TBD',
            },
            {
              id: `tbd${matchId}-2`,
              resultText: null,
              isWinner: false,
              status: null,
              name: 'TBD',
            },
          ],
        })
        matchId++
      }
    }

    // Auto-advance players with byes
    generatedMatches.forEach(match => {
      if (match.tournamentRoundText === '1') {
        const participant1 = match.participants[0]
        const participant2 = match.participants[1]

        // Check if one participant has a bye
        if (participant1.name === 'BYE' && participant2.name !== 'BYE') {
          // Participant 2 wins by bye
          match.participants[1].isWinner = true

          // Advance to next match
          if (match.nextMatchId) {
            const nextMatch = generatedMatches.find(m => m.id === match.nextMatchId)
            if (nextMatch) {
              const previousMatches = generatedMatches.filter(m => m.nextMatchId === match.nextMatchId)
              const slotIndex = previousMatches.indexOf(match)
              if (slotIndex !== -1 && nextMatch.participants[slotIndex]) {
                nextMatch.participants[slotIndex].name = participant2.name
                nextMatch.participants[slotIndex].id = participant2.id
              }
            }
          }
        } else if (participant2.name === 'BYE' && participant1.name !== 'BYE') {
          // Participant 1 wins by bye
          match.participants[0].isWinner = true

          // Advance to next match
          if (match.nextMatchId) {
            const nextMatch = generatedMatches.find(m => m.id === match.nextMatchId)
            if (nextMatch) {
              const previousMatches = generatedMatches.filter(m => m.nextMatchId === match.nextMatchId)
              const slotIndex = previousMatches.indexOf(match)
              if (slotIndex !== -1 && nextMatch.participants[slotIndex]) {
                nextMatch.participants[slotIndex].name = participant1.name
                nextMatch.participants[slotIndex].id = participant1.id
              }
            }
          }
        }
      }
    })

    setMatches(generatedMatches)
    setShowBracket(true)
  }

  const handleReset = () => {
    setParticipants('')
    setMatches([])
    setShowBracket(false)
  }

  const handleWinnerSelect = (matchId, participantIndex) => {
    setMatches(prevMatches => {
      const newMatches = [...prevMatches]
      const matchIndex = newMatches.findIndex(m => m.id === matchId)

      if (matchIndex === -1) return prevMatches

      const match = newMatches[matchIndex]
      const winner = match.participants[participantIndex]

      // Mark the winner
      match.participants[participantIndex].isWinner = true
      match.participants[participantIndex === 0 ? 1 : 0].isWinner = false

      // If there's a next match, advance the winner
      if (match.nextMatchId) {
        const nextMatchIndex = newMatches.findIndex(m => m.id === match.nextMatchId)

        if (nextMatchIndex !== -1) {
          const nextMatch = newMatches[nextMatchIndex]

          // Find which participant slot to fill (top or bottom)
          // The match that comes first feeds into participant 0, the second into participant 1
          const previousMatches = newMatches.filter(m => m.nextMatchId === match.nextMatchId)
          const slotIndex = previousMatches.indexOf(match)

          if (slotIndex !== -1 && nextMatch.participants[slotIndex]) {
            nextMatch.participants[slotIndex].name = winner.name
            nextMatch.participants[slotIndex].id = winner.id
          }
        }
      }

      return newMatches
    })
  }

  const handleNameEdit = (matchId, participantIndex, newName) => {
    setMatches(prevMatches => {
      const newMatches = [...prevMatches]
      const matchIndex = newMatches.findIndex(m => m.id === matchId)

      if (matchIndex === -1) return prevMatches

      const match = newMatches[matchIndex]

      // Update the name
      match.participants[participantIndex].name = newName

      // If this participant is a winner, update their name in the next match too
      if (match.participants[participantIndex].isWinner && match.nextMatchId) {
        const nextMatchIndex = newMatches.findIndex(m => m.id === match.nextMatchId)

        if (nextMatchIndex !== -1) {
          const nextMatch = newMatches[nextMatchIndex]
          const previousMatches = newMatches.filter(m => m.nextMatchId === match.nextMatchId)
          const slotIndex = previousMatches.indexOf(match)

          if (slotIndex !== -1 && nextMatch.participants[slotIndex]) {
            nextMatch.participants[slotIndex].name = newName
          }
        }
      }

      return newMatches
    })
  }

  return (
    <div className="app">
      <h1>Tournament Bracket Generator</h1>

      {!showBracket ? (
        <div className="input-section">
          <div className="instructions">
            <h2>Enter Participants</h2>
            <p>Enter one participant name per line. Seeds will be assigned in order.</p>
          </div>

          <textarea
            className="participant-input"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            placeholder="Player 1&#10;Player 2&#10;Player 3&#10;Player 4&#10;..."
            rows={15}
          />

          <button className="generate-btn" onClick={generateMatches}>
            Generate Bracket
          </button>
        </div>
      ) : (
        <div className="bracket-section">
          <div className="controls">
            <button className="reset-btn" onClick={handleReset}>
              Start New Tournament
            </button>

            <div className="font-selector">
              <label htmlFor="font-select">Font:</label>
              <select
                id="font-select"
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="font-dropdown"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Raleway">Raleway</option>
                <option value="Oswald">Oswald</option>
                <option value="Merriweather">Merriweather</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Ubuntu">Ubuntu</option>
                <option value="Nunito">Nunito</option>
                <option value="Archivo">Archivo</option>
                <option value="Bebas Neue">Bebas Neue</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
            </div>

            <div className="view-mode-toggle">
              <button
                className={`toggle-btn ${viewMode === 'standard' ? 'active' : ''}`}
                onClick={() => setViewMode('standard')}
              >
                Standard View
              </button>
              <button
                className={`toggle-btn ${viewMode === 'mirrored' ? 'active' : ''}`}
                onClick={() => setViewMode('mirrored')}
              >
                Finals Center
              </button>
            </div>
          </div>

          <div className="color-controls">
            <h3>Color Theme</h3>
            <div className="color-grid">
              <div className="color-control">
                <label htmlFor="roundHeaderBg">Round Header Background</label>
                <input
                  type="color"
                  id="roundHeaderBg"
                  value={colors.roundHeaderBg}
                  onChange={(e) => handleColorChange('roundHeaderBg', e.target.value)}
                />
              </div>
              <div className="color-control">
                <label htmlFor="roundHeaderText">Round Header Text</label>
                <input
                  type="color"
                  id="roundHeaderText"
                  value={colors.roundHeaderText}
                  onChange={(e) => handleColorChange('roundHeaderText', e.target.value)}
                />
              </div>
              <div className="color-control">
                <label htmlFor="finalsHeaderBg">Finals Header Background</label>
                <input
                  type="color"
                  id="finalsHeaderBg"
                  value={colors.finalsHeaderBg}
                  onChange={(e) => handleColorChange('finalsHeaderBg', e.target.value)}
                />
              </div>
              <div className="color-control">
                <label htmlFor="finalsHeaderText">Finals Header Text</label>
                <input
                  type="color"
                  id="finalsHeaderText"
                  value={colors.finalsHeaderText}
                  onChange={(e) => handleColorChange('finalsHeaderText', e.target.value)}
                />
              </div>
              <div className="color-control">
                <label htmlFor="matchBg">Match Background</label>
                <input
                  type="color"
                  id="matchBg"
                  value={colors.matchBg}
                  onChange={(e) => handleColorChange('matchBg', e.target.value)}
                />
              </div>
              <div className="color-control">
                <label htmlFor="matchBorder">Match Border</label>
                <input
                  type="color"
                  id="matchBorder"
                  value={colors.matchBorder}
                  onChange={(e) => handleColorChange('matchBorder', e.target.value)}
                />
              </div>
              <div className="color-control">
                <label htmlFor="participantText">Participant Text</label>
                <input
                  type="color"
                  id="participantText"
                  value={colors.participantText}
                  onChange={(e) => handleColorChange('participantText', e.target.value)}
                />
              </div>
              <div className="color-control">
                <label htmlFor="seedBg">Seed Number Background</label>
                <input
                  type="color"
                  id="seedBg"
                  value={colors.seedBg}
                  onChange={(e) => handleColorChange('seedBg', e.target.value)}
                />
              </div>
              <div className="color-control">
                <label htmlFor="seedText">Seed Number Text</label>
                <input
                  type="color"
                  id="seedText"
                  value={colors.seedText}
                  onChange={(e) => handleColorChange('seedText', e.target.value)}
                />
              </div>
              <div className="color-control">
                <label htmlFor="connectorLine">Connector Lines</label>
                <input
                  type="color"
                  id="connectorLine"
                  value={colors.connectorLine}
                  onChange={(e) => handleColorChange('connectorLine', e.target.value)}
                />
              </div>
              <div className="color-control">
                <label htmlFor="winnerHighlight">Winner Highlight</label>
                <input
                  type="color"
                  id="winnerHighlight"
                  value={colors.winnerHighlight}
                  onChange={(e) => handleColorChange('winnerHighlight', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bracket-container">
            <Bracket
              matches={matches}
              onWinnerSelect={handleWinnerSelect}
              onNameEdit={handleNameEdit}
              fontFamily={selectedFont}
              viewMode={viewMode}
              colors={colors}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
