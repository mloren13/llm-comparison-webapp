import { useState, useMemo } from 'react'

// Benchmark descriptions
const benchmarkDescriptions = {
  MMLU: "Massive Multitask Language Understanding - Tests knowledge across subjects like math, history, law, and medicine. Higher = smarter general knowledge.",
  HellaSwag: "Tests commonsense reasoning - understanding what happens next in everyday situations. Like a 'common sense' quiz for AI. Higher = better understanding of how the world works.",
  HumanEval: "Measures coding ability - can the AI write working code? Tests on real programming problems. Higher = better at writing code.",
  GPQA: "Graduate-Level Google-Proof Q&A - Very hard science questions (graduate level). Tests expert-level knowledge. Higher = more expert-level understanding."
}

// Model comparison data with qualitative info
const models = [
  { 
    id: 1, name: 'Google Gemini 3 Flash', mmlu: 71.4, hellaswag: 85.4, humaneval: 71.8, gpqa: 46.5, inputCost: 0.075, outputCost: 0.30, openSource: false,
    pros: "Fast, excellent vision capabilities, low cost, good for real-time apps",
    cons: "Smaller context window than Pro version",
    bestFor: "Image analysis, fast reasoning, cost-effective tasks, frontend development"
  },
  { 
    id: 2, name: 'Google Gemini 3 Pro', mmlu: 73.6, hellaswag: 87.0, humaneval: 74.4, gpqa: 48.0, inputCost: 1.25, outputCost: 5.00, openSource: false,
    pros: "Excellent reasoning, large context window (1M+ tokens), vision support, strong performance",
    cons: "Higher cost than Flash version",
    bestFor: "Complex reasoning, long documents, vision tasks, research, detailed analysis"
  },
  { 
    id: 3, name: 'DeepSeek V3.2', mmlu: 77.8, hellaswag: 88.5, humaneval: 78.9, gpqa: 50.8, inputCost: 0.14, outputCost: 0.28, openSource: false,
    pros: "Excellent value, strong reasoning, very low output cost, high benchmarks",
    cons: "May have rate limits, Chinese-developed (consider data privacy)",
    bestFor: "High-volume tasks, cost-sensitive projects, complex reasoning, budget-conscious teams"
  },
  { 
    id: 4, name: 'Qwen3 Coder', mmlu: 75.2, hellaswag: 86.8, humaneval: 80.5, gpqa: 47.8, inputCost: 0.07, outputCost: 0.28, openSource: false,
    pros: "Excellent coding performance, very low cost, good reasoning abilities",
    cons: "Smaller model, may struggle with very complex multi-step reasoning",
    bestFor: "Code generation, debugging, refactoring, cost-effective coding tasks"
  },
  { 
    id: 5, name: 'Mistral Devstral 25.12', mmlu: 76.3, hellaswag: 87.8, humaneval: 78.4, gpqa: 49.2, inputCost: 0.30, outputCost: 0.90, openSource: false,
    pros: "Strong coding abilities, good reasoning, European-developed (GDPR friendly)",
    cons: "Lesser-known in Western markets, fewer community resources",
    bestFor: "Code generation, development tasks, European compliance needs, balanced workloads"
  },
  { 
    id: 6, name: 'Mistral Codestral 25.08', mmlu: 74.1, hellaswag: 86.5, humaneval: 81.2, gpqa: 46.8, inputCost: 0.25, outputCost: 0.75, openSource: false,
    pros: "Code-specialized, excellent code generation, good documentation",
    cons: "Less versatile for non-coding tasks",
    bestFor: "Code generation, refactoring, code review, technical documentation"
  },
  { 
    id: 7, name: 'Moonshot AI Kimi K2.5', mmlu: 78.5, hellaswag: 88.2, humaneval: 76.3, gpqa: 50.1, inputCost: 0.50, outputCost: 1.00, openSource: false,
    pros: "Good reasoning, cost-effective, strong coding abilities, competitive benchmarks",
    cons: "Lesser-known in Western markets, fewer integrations",
    bestFor: "Coding tasks, general reasoning, cost-sensitive projects, Asian market focus"
  },
  { 
    id: 8, name: 'Claude 3.5 Haiku', mmlu: 75.4, hellaswag: 86.9, humaneval: 73.8, gpqa: 47.5, inputCost: 0.25, outputCost: 1.25, openSource: false,
    pros: "Fast, Anthropic quality, good for quick tasks, reliable outputs",
    cons: "Higher output cost ratio, may be pricier for long conversations",
    bestFor: "Quick queries, conversation, image analysis, fast turnaround tasks"
  },
  { 
    id: 9, name: 'xAI Grok 4.1 Fast', mmlu: 73.2, hellaswag: 86.1, humaneval: 72.5, gpqa: 47.1, inputCost: 0.15, outputCost: 0.60, openSource: false,
    pros: "Good performance, xAI ecosystem integration, fast responses",
    cons: "Less established, smaller community and resources",
    bestFor: "xAI ecosystem projects, fast reasoning, Elon Musk ecosystem enthusiasts"
  },
  { 
    id: 10, name: 'Meta Llama 4 Maverick', mmlu: 74.8, hellaswag: 87.1, humaneval: 72.9, gpqa: 48.3, inputCost: 0.20, outputCost: 0.60, openSource: true,
    pros: "Open-source, good balance of cost and performance, can self-host",
    cons: "Less polished than commercial alternatives, requires technical setup",
    bestFor: "Open-source projects, self-hosting, customization needs, privacy-focused"
  },
  { 
    id: 11, name: 'Meta Llama 4 Scout', mmlu: 71.5, hellaswag: 84.6, humaneval: 68.2, gpqa: 44.7, inputCost: 0.10, outputCost: 0.30, openSource: true,
    pros: "Lightweight, fast, very low cost, open-source, good for simple tasks",
    cons: "Lower performance on benchmarks, not suitable for complex reasoning",
    bestFor: "Simple tasks, high-volume low-complexity workloads, learning, hobby projects"
  },
  { 
    id: 12, name: 'Qwen3 Thinking 30B', mmlu: 72.1, hellaswag: 85.9, humaneval: 68.4, gpqa: 45.2, inputCost: 0.10, outputCost: 0.40, openSource: false,
    pros: "Reasoning-focused, good for step-by-step problems, low cost",
    cons: "Smaller model, may be slower due to thinking time",
    bestFor: "Math problems, logical reasoning, step-by-step analysis, educational use"
  },
  { 
    id: 13, name: 'MiniMax M2.1', mmlu: 76.8, hellaswag: 87.2, humaneval: 77.5, gpqa: 49.5, inputCost: 0, outputCost: 0, openSource: false,
    pros: "Free tier available, strong reasoning, our primary model for development",
    cons: "May have usage limits, newer model with less track record",
    bestFor: "Primary conversation, coding, reasoning, cost-free tasks, personal projects"
  },
  { 
    id: 14, name: 'MiniMax M2.1 Lightning', mmlu: 74.2, hellaswag: 85.8, humaneval: 74.1, gpqa: 46.2, inputCost: 0, outputCost: 0, openSource: false,
    pros: "Very fast, free tier, good for simple quick tasks",
    cons: "Lower performance than standard M2.1",
    bestFor: "Quick tasks, high-volume simple queries, fast prototyping, testing ideas"
  },
]

function BenchmarkTooltip({ benchmark }) {
  return (
    <span className="benchmark-tooltip">
      {benchmark}
      <span className="tooltip-text">{benchmarkDescriptions[benchmark]}</span>
    </span>
  )
}

function App() {
  const [sortBy, setSortBy] = useState('mmlu')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterFree, setFilterFree] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [costScenario, setCostScenario] = useState({ input: 1000000, output: 5000000 })

  // Calculate cost
  const calculateCost = (model, inputs, outputs) => {
    return (inputs * model.inputCost / 1000000) + (outputs * model.outputCost / 1000000)
  }

  // Filter and sort models
  const filteredModels = useMemo(() => {
    let result = models.filter(model => {
      if (filterFree && !model.openSource) return false
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
      openSourceModels: filteredModels.filter(m => m.openSource).length,
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
    <div className="app">
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
          <h3>{totals.openSourceModels}</h3>
          <p>Open Source</p>
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
            Show Open Source Only
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

      {/* Table 1: Metrics & Costs */}
      <div className="table-section">
        <h2>📊 Performance Metrics & Costs</h2>
        <p className="table-description">Click any benchmark header to learn what it tests. Hover to see detailed explanations.</p>
        
        <div className="table-container">
          <table className="model-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>
                  Model {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('mmlu')}>
                  <BenchmarkTooltip benchmark="MMLU" /> {sortBy === 'mmlu' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('hellaswag')}>
                  <BenchmarkTooltip benchmark="HellaSwag" /> {sortBy === 'hellaswag' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('humaneval')}>
                  <BenchmarkTooltip benchmark="HumanEval" /> {sortBy === 'humaneval' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('gpqa')}>
                  <BenchmarkTooltip benchmark="GPQA" /> {sortBy === 'gpqa' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                const isBestValue = model.openSource || (model.mmlu > 75 && cost < 1)
                
                return (
                  <tr key={model.id}>
                    <td>
                      <strong>{model.name}</strong>
                      {model.openSource && <span style={{ marginLeft: '10px', background: '#9b59b6', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8em' }}>OPEN SOURCE</span>}
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
      </div>

      {/* Table 2: Qualitative Analysis */}
      <div className="table-section">
        <h2>📋 Qualitative Analysis</h2>
        <p className="table-description">Pros, cons, and recommended use cases for each model.</p>
        
        <div className="table-container">
          <table className="model-table qualitative-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Model</th>
                <th style={{ width: '25%' }}>✅ Pros</th>
                <th style={{ width: '25%' }}>❌ Cons</th>
                <th style={{ width: '25%' }}>🎯 Best For</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map(model => (
                <tr key={model.id}>
                  <td>
                    <strong>{model.name}</strong>
                    {model.openSource && <span style={{ marginLeft: '8px', background: '#9b59b6', color: 'white', padding: '1px 6px', borderRadius: '8px', fontSize: '0.75em' }}>OPEN SOURCE</span>}
                  </td>
                  <td>{model.pros}</td>
                  <td>{model.cons}</td>
                  <td>{model.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
