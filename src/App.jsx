import { useState, useMemo } from 'react'

// Benchmark descriptions
const benchmarkDescriptions = {
  MMLU: "Massive Multitask Language Understanding - Tests knowledge across subjects. Higher = smarter general knowledge.",
  HellaSwag: "Tests commonsense reasoning - understanding everyday situations. Higher = better commonsense.",
  HumanEval: "Measures coding ability - can the AI write working code? Higher = better at coding.",
  GPQA: "Graduate-Level Google-Proof Q&A - Very hard science questions. Higher = more expert-level understanding."
}

// Category/tier classifications with colors
const categoryOptions = {
  "Flagship": { color: '#e74c3c' },
  "Balanced": { color: '#3498db' },
  "Budget": { color: '#27ae60' },
  "Specialized Coding": { color: '#9b59b6' },
  "Reasoning Focus": { color: '#f39c12' },
  "Conversational": { color: '#1abc9c' },
  "Open Source": { color: '#e91e63' },
  "Free Tier": { color: '#00bcd4' }
}

// All models (enabled + notable/disabled)
const allModels = [
  // === ENABLED MODELS ===
  { id: 1, name: 'Google Gemini 3 Flash', mmlu: 82.4, hellaswag: 89.2, humaneval: 74.6, gpqa: 49.2, inputCost: 0.075, outputCost: 0.30, context: "1M", category: "Balanced", enabled: true,
    pros: "Excellent value, large context, fast inference, strong vision",
    cons: "Rate limits, smaller than Pro, less creative",
    bestFor: "Production apps, image analysis, cost-sensitive projects" },
  { id: 2, name: 'Google Gemini 3 Pro', mmlu: 86.8, hellaswag: 91.5, humaneval: 78.4, gpqa: 54.8, inputCost: 1.25, outputCost: 5.00, context: "2M", category: "Flagship", enabled: true,
    pros: "Best-in-class, massive 2M context, top vision, excellent reasoning",
    cons: "Expensive, rate limits, overkill for simple tasks",
    bestFor: "Research, complex analysis, long documents, enterprise" },
  { id: 3, name: 'DeepSeek V3.2', mmlu: 85.2, hellaswag: 90.8, humaneval: 82.6, gpqa: 52.4, inputCost: 0.14, outputCost: 0.28, context: "128K", category: "Budget", enabled: true,
    pros: "Lowest cost, strong coding, excellent reasoning, open API",
    cons: "Rate limits, data privacy concerns, inconsistent availability",
    bestFor: "Coding-heavy, budget-conscious, high-volume apps" },
  { id: 4, name: 'Qwen3 Coder', mmlu: 83.6, hellaswag: 89.8, humaneval: 85.2, gpqa: 48.6, inputCost: 0.07, outputCost: 0.28, context: "32K", category: "Specialized Coding", enabled: true,
    pros: "Highest HumanEval, excellent code generation, very low cost",
    cons: "Smaller model, weaker non-coding, less reasoning depth",
    bestFor: "Code generation, refactoring, debugging" },
  { id: 5, name: 'Mistral Devstral 25.12', mmlu: 84.2, hellaswag: 90.2, humaneval: 80.4, gpqa: 51.8, inputCost: 0.30, outputCost: 0.90, context: "128K", category: "Balanced", enabled: true,
    pros: "Strong balanced, GDPR compliant, good reasoning",
    cons: "Less brand recognition, fewer integrations",
    bestFor: "European projects, GDPR-sensitive apps" },
  { id: 6, name: 'Mistral Codestral 25.08', mmlu: 82.8, hellaswag: 89.4, humaneval: 84.8, gpqa: 49.4, inputCost: 0.25, outputCost: 0.75, context: "64K", category: "Specialized Coding", enabled: true,
    pros: "Code-specialized, excellent code quality, good docs",
    cons: "Less versatile, weaker reasoning, no vision",
    bestFor: "Code generation, refactoring, code review" },
  { id: 7, name: 'Moonshot AI Kimi K2.5', mmlu: 85.8, hellaswag: 91.2, humaneval: 79.4, gpqa: 53.2, inputCost: 0.50, outputCost: 1.00, context: "200K", category: "Balanced", enabled: true,
    pros: "Strong all-around, excellent reasoning, competitive coding",
    cons: "Asian market focus, less Western support",
    bestFor: "General-purpose, multilingual, Asian market" },
  { id: 8, name: 'Claude 3.5 Haiku', mmlu: 84.6, hellaswag: 90.4, humaneval: 76.8, gpqa: 51.2, inputCost: 0.25, outputCost: 1.25, context: "200K", category: "Conversational", enabled: true,
    pros: "Anthropic quality, fast responses, reliable outputs",
    cons: "Higher output costs, no free tier, may be verbose",
    bestFor: "Chatbots, conversation, quick queries" },
  { id: 9, name: 'xAI Grok 4.1 Fast', mmlu: 83.4, hellaswag: 89.6, humaneval: 75.4, gpqa: 50.4, inputCost: 0.15, outputCost: 0.60, context: "131K", category: "Balanced", enabled: true,
    pros: "Good performance, xAI ecosystem, X integration",
    cons: "Less established, smaller community",
    bestFor: "xAI ecosystem, Twitter/X integration" },
  { id: 10, name: 'Meta Llama 4 Maverick', mmlu: 82.6, hellaswag: 88.8, humaneval: 74.8, gpqa: 48.8, inputCost: 0.20, outputCost: 0.60, context: "128K", category: "Open Source", enabled: true,
    pros: "Fully open-source, self-hostable, customizable, privacy-focused",
    cons: "Requires setup, self-hosting costs, less polished",
    bestFor: "Self-hosting, privacy apps, customization" },
  { id: 11, name: 'Meta Llama 4 Scout', mmlu: 78.4, hellaswag: 86.2, humaneval: 68.4, gpqa: 45.6, inputCost: 0.10, outputCost: 0.30, context: "32K", category: "Open Source", enabled: true,
    pros: "Lightweight, fastest inference, lowest commercial cost",
    cons: "Lower performance, not for complex reasoning",
    bestFor: "Edge deployment, simple tasks, learning" },
  { id: 12, name: 'Qwen3 Thinking 30B', mmlu: 80.6, hellaswag: 88.4, humaneval: 71.2, gpqa: 47.8, inputCost: 0.10, outputCost: 0.40, context: "32K", category: "Reasoning Focus", enabled: true,
    pros: "Step-by-step thinking, low cost, good for math/logic",
    cons: "Smaller model, slower due to thinking process",
    bestFor: "Math, logical reasoning, tutoring" },
  { id: 13, name: 'MiniMax M2.1 (Free)', mmlu: 84.8, hellaswag: 90.6, humaneval: 80.2, gpqa: 52.6, inputCost: 0, outputCost: 0, context: "200K", category: "Free Tier", enabled: true,
    pros: "Completely free, excellent all-around, great for dev",
    cons: "Usage limits, rate limits, no commercial SLA",
    bestFor: "Personal projects, development, testing, learning" },
  { id: 14, name: 'MiniMax M2.1 (Paid)', mmlu: 84.8, hellaswag: 90.6, humaneval: 80.2, gpqa: 52.6, inputCost: 0.50, outputCost: 1.00, context: "200K", category: "Balanced", enabled: true,
    pros: "Same as free, unlimited usage, commercial allowed",
    cons: "Newer, less established",
    bestFor: "Production apps, commercial use, unlimited needs" },
  { id: 15, name: 'MiniMax Lightning', mmlu: 82.2, hellaswag: 88.8, humaneval: 76.4, gpqa: 49.8, inputCost: 0, outputCost: 0, context: "64K", category: "Free Tier", enabled: true,
    pros: "Fastest free option, good for simple tasks",
    cons: "Lower performance than M2.1",
    bestFor: "Quick queries, high-volume simple tasks" },
  
  // === DISABLED / NOTABLE MODELS ===
  { id: 16, name: 'Claude 3.7 Sonnet', provider: 'Anthropic', mmlu: 88.4, hellaswag: 92.6, humaneval: 85.2, gpqa: 58.4, inputCost: 3.00, outputCost: 15.00, context: "200K", category: "Flagship", enabled: false,
    pros: "Anthropic's top model, excellent complex reasoning and coding",
    cons: "Very expensive, rate limits, no vision",
    bestFor: "Enterprise research, complex analysis, coding at scale" },
  { id: 17, name: 'Claude 3.5 Sonnet', provider: 'Anthropic', mmlu: 87.2, hellaswag: 92.1, humaneval: 83.6, gpqa: 56.8, inputCost: 3.00, outputCost: 15.00, context: "200K", category: "Flagship", enabled: false,
    pros: "Excellent balance of capability and speed, strong reasoning",
    cons: "Still expensive compared to alternatives",
    bestFor: "General-purpose enterprise, complex tasks" },
  { id: 18, name: 'GPT-4 Turbo', provider: 'OpenAI', mmlu: 89.2, hellaswag: 93.4, humaneval: 86.4, gpqa: 59.2, inputCost: 10.00, outputCost: 30.00, context: "128K", category: "Flagship", enabled: false,
    pros: "OpenAI's top model, excellent reasoning and tool use",
    cons: "Very expensive, rate limits, complex pricing",
    bestFor: "Enterprise, complex reasoning, tool integration" },
  { id: 19, name: 'GPT-4o', provider: 'OpenAI', mmlu: 88.6, hellaswag: 92.8, humaneval: 84.8, gpqa: 57.6, inputCost: 5.00, outputCost: 15.00, context: "128K", category: "Flagship", enabled: false,
    pros: "Omni model with excellent vision and audio",
    cons: "Expensive for high-volume",
    bestFor: "Multimodal, vision + text tasks" },
  { id: 20, name: 'GPT-3.5 Turbo', provider: 'OpenAI', mmlu: 71.2, hellaswag: 84.6, humaneval: 68.4, gpqa: 44.2, inputCost: 0.50, outputCost: 1.50, context: "16K", category: "Budget", enabled: false,
    pros: "Inexpensive, fast, good for simple tasks",
    cons: "Weaker reasoning, limited context",
    bestFor: "High-volume simple tasks, cost-sensitive" },
  { id: 21, name: 'DeepSeek Chat', provider: 'DeepSeek', mmlu: 84.8, hellaswag: 90.2, humaneval: 80.6, gpqa: 51.8, inputCost: 0.14, outputCost: 0.28, context: "128K", category: "Budget", enabled: false,
    pros: "Chat-focused, great value, similar to V3.2",
    cons: "Rate limits",
    bestFor: "Conversational AI on a budget" },
  { id: 22, name: 'Qwen 2.5', provider: 'Alibaba', mmlu: 82.4, hellaswag: 89.4, humaneval: 76.2, gpqa: 49.4, inputCost: 0.07, outputCost: 0.14, context: "128K", category: "Budget", enabled: false,
    pros: "Extremely low cost, good for simple tasks",
    cons: "Less capable for complex reasoning",
    bestFor: "Simple chatbots, high-volume low-complexity" },
  { id: 23, name: 'CodeLlama 70B', provider: 'Meta', mmlu: 80.2, hellaswag: 88.4, humaneval: 84.6, gpqa: 46.8, inputCost: 0, outputCost: 0, context: "128K", category: "Specialized Coding", enabled: false,
    pros: "Meta's code model, fully open-source, large parameters",
    cons: "Requires resources to run, slower inference",
    bestFor: "Self-hosted code generation, research" },
  { id: 24, name: 'StarCoder 2', provider: 'BigCode', mmlu: 74.6, hellaswag: 84.2, humaneval: 78.4, gpqa: 42.6, inputCost: 0, outputCost: 0, context: "16K", category: "Specialized Coding", enabled: false,
    pros: "Open-source, 300+ languages, well-documented",
    cons: "Small context, less capable",
    bestFor: "Open-source code projects" },
  { id: 25, name: 'WizardMath', provider: 'Microsoft', mmlu: 72.4, hellaswag: 82.6, humaneval: 64.8, gpqa: 48.2, inputCost: 0, outputCost: 0, context: "8K", category: "Reasoning Focus", enabled: false,
    pros: "Math-specialized open-source, excellent arithmetic",
    cons: "Very small context, math-focused only",
    bestFor: "Mathematical computations, education" },
  { id: 26, name: 'Llama 3.1 Instruct', provider: 'Meta', mmlu: 86.4, hellaswag: 91.2, humaneval: 78.4, gpqa: 54.2, inputCost: 0, outputCost: 0, context: "128K", category: "Conversational", enabled: false,
    pros: "Meta's instruction-tuned, excellent chat, open-source",
    cons: "Less polished than commercial",
    bestFor: "Self-hosted chatbots" },
  { id: 27, name: 'Gemma 2', provider: 'Google', mmlu: 84.2, hellaswag: 89.8, humaneval: 74.6, gpqa: 50.8, inputCost: 0, outputCost: 0, context: "128K", category: "Conversational", enabled: false,
    pros: "Google's lightweight open-source, efficient inference",
    cons: "Less capable than larger models",
    bestFor: "Edge deployment, efficient open-source" },
  { id: 28, name: 'Command R+', provider: 'Cohere', mmlu: 85.6, hellaswag: 90.8, humaneval: 78.2, gpqa: 53.6, inputCost: 0.50, outputCost: 2.00, context: "128K", category: "Flagship", enabled: false,
    pros: "Enterprise-focused, excellent RAG, strong retrieval",
    cons: "Less brand recognition, requires Cohere ecosystem",
    bestFor: "Enterprise RAG, knowledge management" },
  { id: 29, name: 'Azure AI', provider: 'Microsoft', mmlu: 86.8, hellaswag: 91.4, humaneval: 79.6, gpqa: 55.2, inputCost: 0, outputCost: 0, context: "128K", category: "Flagship", enabled: false,
    pros: "Enterprise deployment, Microsoft integration, compliance-ready",
    cons: "Complex pricing, Azure ecosystem required",
    bestFor: "Microsoft enterprise, compliance" },
  { id: 30, name: 'Amazon Titan', provider: 'AWS', mmlu: 85.4, hellaswag: 90.6, humaneval: 77.8, gpqa: 52.8, inputCost: 0, outputCost: 0, context: "128K", category: "Flagship", enabled: false,
    pros: "AWS integration, seamless S3/EC2",
    cons: "AWS pricing, vendor lock-in",
    bestFor: "AWS-native, AWS ecosystem" },
]

function Tooltip({ text, children }) {
  return <span className="tooltip-container" title={text}>{children}</span>
}

function ComparisonTable({ models }) {
  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id || null)
  const [showDisabled, setShowDisabled] = useState(false)
  const selectedModel = models.find(m => m.id === Number(selectedModelId)) || models[0]
  
  const calculatePercentage = (model, selected, metric) => {
    const val1 = model[metric]
    const val2 = selected[metric]
    if (val2 === 0) return 0
    return (val1 / val2) * 100
  }
  
  const getPctClass = (pct) => {
    if (pct >= 100) return 'positive-diff'
    if (pct >= 95) return 'neutral-diff'
    return 'negative-diff'
  }
  
  const getCategoryColor = (cat) => categoryOptions[cat]?.color || '#888'
  
  const displayModels = useMemo(() => {
    let result = showDisabled ? models : models.filter(m => m.enabled)
    return result
  }, [models, showDisabled])
  
  const calculateCost = (model, inputs, outputs) => {
    return (inputs * model.inputCost / 1000000) + (outputs * model.outputCost / 1000000)
  }
  
  const baselineCost = selectedModel ? calculateCost(selectedModel, 1000000, 5000000) : 0
  
  return (
    <div className="table-section">
      <h2>📊 Model Comparison</h2>
      <p className="table-description">Benchmarks, costs, and specs. Select a baseline to see % comparison. Toggle to show disabled models.</p>
      
      <div style={{ padding: '0 15px', marginBottom: '15px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label>
          <strong>Baseline:</strong>
          <select value={selectedModelId || ''} onChange={(e) => setSelectedModelId(Number(e.target.value))} style={{ marginLeft: '8px', padding: '8px 12px', borderRadius: '8px', border: '2px solid #667eea', background: '#fff', color: '#1a1a2e', fontWeight: '600' }}>
            {models.filter(m => m.enabled).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
        <label style={{ cursor: 'pointer' }}>
          <input type="checkbox" checked={showDisabled} onChange={(e) => setShowDisabled(e.target.checked)} style={{ marginRight: '6px' }} />
          Show disabled models ({models.filter(m => !m.enabled).length})
        </label>
      </div>
      
      <div className="table-container">
        <table className="model-table">
          <thead>
            <tr>
              <th style={{ width: '16%' }}>Model</th>
              <th><Tooltip text={benchmarkDescriptions.MMLU}>MMLU</Tooltip></th>
              <th><Tooltip text={benchmarkDescriptions.HellaSwag}>HellaSwag</Tooltip></th>
              <th><Tooltip text={benchmarkDescriptions.HumanEval}>HumanEval</Tooltip></th>
              <th><Tooltip text={benchmarkDescriptions.GPQA}>GPQA</Tooltip></th>
              <th><Tooltip text="Token context window">Ctx</Tooltip></th>
              <th><Tooltip text="Category tier">Cat</Tooltip></th>
              <th><Tooltip text="Cost per 1M input + 5M output tokens">Est. Cost</Tooltip></th>
              <th><Tooltip text="Cost as % of baseline">Cost %</Tooltip></th>
            </tr>
          </thead>
          <tbody>
            {displayModels.map(model => {
              const isSelected = model.id === selectedModel?.id
              const mmluPct = selectedModel ? calculatePercentage(model, selectedModel, 'mmlu') : 0
              const cost = selectedModel ? calculateCost(model, 1000000, 5000000) : 0
              const costPct = selectedModel && baselineCost > 0 ? (cost / baselineCost) * 100 : 0
              
              return (
                <tr key={model.id} style={{ opacity: model.enabled ? 1 : 0.55, background: isSelected ? 'rgba(103, 126, 234, 0.15)' : undefined }}>
                  <td>
                    <strong>{model.name}</strong>
                    {model.provider && <span style={{ fontSize: '0.8em', color: '#888', display: 'block' }}>{model.provider}</span>}
                    {!model.enabled && <span style={{ fontSize: '0.7em', background: '#666', color: '#fff', padding: '1px 5px', borderRadius: '4px', marginTop: '2px', display: 'inline-block' }}>DISABLED</span>}
                    {model.free && <span style={{ marginLeft: '4px', background: '#11998e', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontSize: '0.7em' }}>FREE</span>}
                    {model.openSource && !model.free && <span style={{ marginLeft: '4px', background: '#9b59b6', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontSize: '0.7em' }}>OSS</span>}
                  </td>
                  <td>
                    <span>{model.mmlu}%</span>
                    {selectedModel && !isSelected && <span className={getPctClass(mmluPct)} style={{ marginLeft: '6px', fontSize: '0.8em', fontWeight: '600' }}>{mmluPct.toFixed(0)}%</span>}
                  </td>
                  <td>{model.hellaswag}%</td>
                  <td>{model.humaneval}%</td>
                  <td>{model.gpqa}%</td>
                  <td style={{ color: '#f1c40f', fontWeight: '500' }}>{model.context}</td>
                  <td><span style={{ background: getCategoryColor(model.category), color: '#fff', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7em', fontWeight: '600' }}>{model.category}</span></td>
                  <td style={{ fontWeight: '600' }}>{model.free ? 'FREE' : `$${cost.toFixed(2)}`}</td>
                  <td>
                    {selectedModel && !isSelected ? (
                      <span className={costPct <= 100 ? 'positive-diff' : 'negative-diff'} style={{ fontWeight: '600' }}>
                        {model.free ? 'FREE' : `${costPct.toFixed(0)}%`}
                      </span>
                    ) : <span style={{ color: '#888' }}>-</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function QualitativeTable({ models }) {
  const [showDisabled, setShowDisabled] = useState(false)
  
  const displayModels = useMemo(() => {
    let result = showDisabled ? models : models.filter(m => m.enabled)
    return result
  }, [models, showDisabled])
  
  const getCategoryColor = (cat) => categoryOptions[cat]?.color || '#888'
  
  return (
    <div className="table-section">
      <h2>📋 Qualitative Analysis</h2>
      <p className="table-description">Pros, cons, and recommended use cases for all models.</p>
      
      <div style={{ padding: '0 15px', marginBottom: '15px' }}>
        <label style={{ cursor: 'pointer' }}>
          <input type="checkbox" checked={showDisabled} onChange={(e) => setShowDisabled(e.target.checked)} style={{ marginRight: '6px' }} />
          Show disabled models
        </label>
      </div>
      
      <div className="table-container">
        <table className="model-table qualitative-table">
          <thead>
            <tr>
              <th style={{ width: '18%' }}>Model</th>
              <th style={{ width: '10%' }}>Cat</th>
              <th style={{ width: '24%' }}>✅ Pros</th>
              <th style={{ width: '24%' }}>❌ Cons</th>
              <th style={{ width: '24%' }}>🎯 Best For</th>
            </tr>
          </thead>
          <tbody>
            {displayModels.map(model => (
              <tr key={model.id} style={{ opacity: model.enabled ? 1 : 0.55 }}>
                <td>
                  <strong>{model.name}</strong>
                  {model.provider && <span style={{ fontSize: '0.8em', color: '#888', display: 'block' }}>{model.provider}</span>}
                  {!model.enabled && <span style={{ fontSize: '0.7em', background: '#666', color: '#fff', padding: '1px 5px', borderRadius: '4px', marginTop: '2px', display: 'inline-block' }}>DISABLED</span>}
                </td>
                <td><span style={{ background: getCategoryColor(model.category), color: '#fff', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7em' }}>{model.category}</span></td>
                <td style={{ fontSize: '0.85em' }}>{model.pros}</td>
                <td style={{ fontSize: '0.85em' }}>{model.cons}</td>
                <td style={{ fontSize: '0.85em' }}>{model.bestFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFree, setFilterFree] = useState(false)
  
  const filteredModels = useMemo(() => {
    let result = allModels.filter(model => {
      if (filterFree && !model.free && !model.openSource) return false
      if (searchTerm && !model.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
    return result
  }, [filterFree, searchTerm])
  
  const totals = useMemo(() => ({
    allModels: allModels.length,
    enabled: allModels.filter(m => m.enabled).length,
    free: allModels.filter(m => m.free).length,
    openSource: allModels.filter(m => m.openSource).length,
    avgMmlu: (allModels.filter(m => m.enabled).reduce((sum, m) => sum + m.mmlu, 0) / allModels.filter(m => m.enabled).length).toFixed(1),
  }), [])
  
  return (
    <div className="app">
      <header className="header">
        <h1>🤖 LLM Model Comparison</h1>
        <p>Compare AI models across benchmarks, costs, and use cases</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card"><h3>{totals.enabled}/{totals.allModels}</h3><p>Models (enabled/total)</p></div>
        <div className="stat-card"><h3>{totals.free}</h3><p>Free Options</p></div>
        <div className="stat-card"><h3>{totals.openSource}</h3><p>Open Source</p></div>
        <div className="stat-card"><h3>{totals.avgMmlu}%</h3><p>Avg MMLU (enabled)</p></div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>🔍 Search Models</label>
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-group">
          <label><input type="checkbox" checked={filterFree} onChange={(e) => setFilterFree(e.target.checked)} style={{ marginRight: '8px' }} />Free & Open Source Only</label>
        </div>
      </div>

      <ComparisonTable models={filteredModels} />
      <QualitativeTable models={filteredModels} />

      <footer className="footer">
        <p>Built with React + Vite | <a href="https://github.com/mloren13/llm-comparison-webapp" target="_blank">View on GitHub</a></p>
      </footer>
    </div>
  )
}

export default App
