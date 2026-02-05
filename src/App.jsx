import { useState, useMemo } from 'react'

// Model comparison data
const models = [
  { id: 1, name: 'Google Gemini 3 Flash', mmlu: 71.4, hellaswag: 85.4, humaneval: 71.8, gpqa: 46.5, inputCost: 0.075, outputCost: 0.30, free: false },
  { id: 2, name: 'Google Gemini 3 Pro', mmlu: 73.6, hellaswag: 87.0, humaneval: 74.4, gpqa: 48.0, inputCost: 1.25, outputCost: 5.00, free: false },
  { id: 3, name: 'DeepSeek V3.2', mmlu: 77.8, hellaswag: 88.5, humaneval: 78.9, gpqa: 50.8, inputCost: 0.14, outputCost: 0.28, free: false },
  { id: 4, name: 'Qwen3 Coder', mmlu: 75.2, hellaswag: 86.8, humaneval: 80.5, gpqa: 47.8, inputCost: 0.07, outputCost: 0.28, free: false },
  { id: 5, name: 'Mistral Devstral 25.12', mmlu: 76.3, hellaswag: 87.8, humaneval: 78.4, gpqa: 49.2, inputCost: 0.30, outputCost: 0.90, free: false },
  { id: 6, name: 'Mistral Codestral 25.08', mmlu: 74.1, hellaswag: 86.5, humaneval: 81.2, gpqa: 46.8, inputCost: 0.25, outputCost: 0.75, free: false },
  { id: 7, name: 'Moonshot AI Kimi K2.5', mmlu: 78.5, hellaswag: 88.2, humaneval: 76.3, gpqa: 50.1, inputCost: 0.50, outputCost: 1.00, free: false },
  { id: 8, name: 'Claude 3.5 Haiku', mmlu: 75.4, hellaswag: 86.9, humaneval: 73.8, gpqa: 47.5, inputCost: 0.25, outputCost: 1.25, free: false },
  { id: 9, name: 'xAI Grok 4.1 Fast', mmlu: 73.2, hellaswag: 86.1, humaneval: 72.5, gpqa: 47.1, inputCost: 0.15, outputCost: 0.60, free: false },
  { id: 10, name: 'Meta Llama 4 Maverick', mmlu: 74.8, hellaswag: 87.1, humaneval: 72.9, gpqa: 48.3, inputCost: 0.20, outputCost: 0.60, free: true },
  { id: 11, name: 'Meta Llama 4 Scout', mmlu: 71.5, hellaswag: 84.6, humaneval: 68.2, gpqa: 44.7, inputCost: 0.10, outputCost: 0.30, free: true },
  { id: 12, name: 'Qwen3 Thinking 30B', mmlu: 72.1, hellaswag: 85.9, humaneval: 68.4, gpqa: 45.2, inputCost: 0.10, outputCost: 0.40, free: false },
  { id: 13, name: 'MiniMax M2.1', mmlu: 76.8, hellaswag: 87.2, humaneval: 77.5, gpqa: 49.5, inputCost: 0, outputCost: 0, free: true },
  { id: 14, name: 'MiniMax M2.1 Lightning', mmlu: 74.2, hellaswag: 85.8, humaneval: 74.1, gpqa: 46.2, inputCost: 0, outputCost: 0, free: true },
]

function App() {
  const [sortBy, setSortBy] = useState('mmlu')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterFree, setFilterFree] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showMetrics, setShowMetrics] = useState(['mmlu', 'hellaswag', 'humaneval', 'gpqa'])
  const [costScenario, setCostScenario] = useState({ input: 1000000, output: 5000000 })

  // Calculate cost
  const calculateCost = (model, inputs, outputs) => {
    return (inputs * model.inputCost / 1000000) + (outputs * model.outputCost / 1000000)
  }

  // Filter and sort models
  const filteredModels = useMemo(() => {
    let result = models.filter(model => {
      if (filterFree && !model.free) return false
      if (searchTerm && !model.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })

    return result
  }, [sortBy, sortOrder, filterFree, searchTerm])

  // Calculate totals
  const totals = useMemo(() => {
    return {
      models: filteredModels.length,
      freeModels: filteredModels.filter(m => m.free).length,
      avgMmlu: (filteredModels.reduce((sum, m) => sum + m.mmlu, 0) / filteredModels.length).toFixed(1),
      avgCost: (filteredModels.reduce((sum, m) => calculateCost(m, costScenario.input, costScenario.output), 0) / filteredModels.length).toFixed(2)
    }
  }, [filteredModels, costScenario])

  // Toggle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>🤖 LLM Model Comparison</h1>
        <p>Compare AI models across benchmarks, costs, and features</p>
      </header>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{totals.models}</h3>
          <p>Models Compared</p>
        </div>
        <div className="stat-card">
          <h3>{totals.freeModels}</h3>
          <p>Free Models</p>
        </div>
        <div className="stat-card">
          <h3>{totals.avgMmlu}%</h3>
          <p>Avg MMLU Score</p>
        </div>
        <div className="stat-card">
          <h3>${totals.avgCost}</h3>
          <p>Avg Cost @ {costScenario.input / 1000000}M in / {costScenario.output / 1000000}M out</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>🔍 Search Models</label>
          <input 
            type="text" 
            placeholder="Type to search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>
            <input 
              type="checkbox" 
              checked={filterFree}
              onChange={(e) => setFilterFree(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            Show Free Models Only
          </label>
        </div>

        <div className="filter-group">
          <label>💰 Cost Scenario (tokens/month)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input 
              type="number" 
              placeholder="Input tokens"
              value={costScenario.input}
              onChange={(e) => setCostScenario({ ...costScenario, input: Number(e.target.value) })}
            />
            <input 
              type="number" 
              placeholder="Output tokens"
              value={costScenario.output}
              onChange={(e) => setCostScenario({ ...costScenario, output: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="model-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Model {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('mmlu')}>
                MMLU {sortBy === 'mmlu' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('hellaswag')}>
                HellaSwag {sortBy === 'hellaswag' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('humaneval')}>
                HumanEval {sortBy === 'humaneval' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('gpqa')}>
                GPQA {sortBy === 'gpqa' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('inputCost')}>
                Input ($/M) {sortBy === 'inputCost' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('outputCost')}>
                Output ($/M) {sortBy === 'outputCost' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>
                Est. Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.map(model => {
              const cost = calculateCost(model, costScenario.input, costScenario.output)
              const isBestValue = model.free || (model.mmlu > 75 && cost < 1)
              
              return (
                <tr key={model.id}>
                  <td>
                    <strong>{model.name}</strong>
                    {model.free && <span style={{ marginLeft: '10px', background: '#11998e', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8em' }}>FREE</span>}
                  </td>
                  <td>{model.mmlu}%</td>
                  <td>{model.hellaswag}%</td>
                  <td>{model.humaneval}%</td>
                  <td>{model.gpqa}%</td>
                  <td>${model.inputCost.toFixed(3)}</td>
                  <td>${model.outputCost.toFixed(2)}</td>
                  <td>
                    <span className={isBestValue ? 'best-value' : ''}>
                      ${cost.toFixed(2)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>
          Built with React + Vite | 
          <a href="https://github.com/mloren13/llm-comparison-webapp" target="_blank" rel="noopener noreferrer"> View on GitHub</a>
        </p>
      </footer>
    </div>
  )
}

export default App
