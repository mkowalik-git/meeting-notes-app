import React, { useState } from 'react';
import { FileText, Clock, Users, Target, CheckCircle, AlertCircle, Settings, Key, Brain, Zap } from 'lucide-react';
import './App.css';

// --- Meeting Notes App ---
const MeetingNotesSummary = () => {
  // --- State ---
  const [rawNotes, setRawNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState('huggingface');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // --- Model Options ---
  const models = [
    {
      id: 'huggingface',
      name: 'Llama 3.1 70B',
      provider: 'Hugging Face',
      description: 'Free powerful model',
      apiKeyPlaceholder: 'hf_...',
      apiKeyLabel: 'Hugging Face API Key',
      free: true,
      recommended: true
    },
    {
      id: 'groq',
      name: 'Llama 3.1 8B',
      provider: 'Groq',
      description: 'Free ultra-fast inference',
      apiKeyPlaceholder: 'gsk_...',
      apiKeyLabel: 'Groq API Key',
      free: true
    },
    {
      id: 'perplexity',
      name: 'Perplexity (Free)',
      provider: 'Perplexity AI',
      description: 'Fast, free, and accurate summaries',
      apiKeyPlaceholder: 'pplx-...',
      apiKeyLabel: 'Perplexity API Key',
      free: true
    },
    {
      id: 'claude',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      description: 'Advanced reasoning and analysis',
      apiKeyPlaceholder: 'sk-ant-api03-...',
      apiKeyLabel: 'Anthropic API Key'
    },
    {
      id: 'gpt4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Versatile and creative',
      apiKeyPlaceholder: 'sk-...',
      apiKeyLabel: 'OpenAI API Key'
    },
    {
      id: 'gpt4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      description: 'Fast and multimodal',
      apiKeyPlaceholder: 'sk-...',
      apiKeyLabel: 'OpenAI API Key'
    },
    {
      id: 'gemini',
      name: 'Gemini Pro',
      provider: 'Google',
      description: 'Fast and efficient',
      apiKeyPlaceholder: 'AIza...',
      apiKeyLabel: 'Google API Key'
    }
  ];

  const getCurrentModel = () => models.find(m => m.id === selectedModel);

  // --- Summarization Handler ---
  const processMeetingNotes = async () => {
    if (!rawNotes.trim()) {
      setError('Please enter some meeting notes to summarize.');
      return;
    }
    if (!apiKey.trim()) {
      setError('Please enter your API key in the settings.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      let response;
      const prompt = `Please analyze these meeting notes and create a structured summary. Format your response as a JSON object with this structure:\n{\n  "title": "Meeting title based on content",\n  "date": "${new Date().toLocaleDateString()}",\n  "duration": "Estimated duration",\n  "attendees": ["List of attendees if mentioned"],\n  "keyPoints": ["Key discussion points"],\n  "actionItems": [{"task": "description", "assignee": "person or 'Unassigned'", "deadline": "date or 'Not specified'"}],\n  "decisions": ["Key decisions made"],\n  "nextSteps": ["Follow-up actions"]\n}\n\nMeeting notes: ${rawNotes}`;

      if (selectedModel === 'huggingface') {
        response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-70B-Instruct', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 1500,
              temperature: 0.3,
              return_full_text: false
            }
          })
        });
      } else if (selectedModel === 'groq') {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500,
            temperature: 0.3
          })
        });
      } else if (selectedModel === 'perplexity') {
        response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'pplx-70b-online',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500,
            temperature: 0.3
          })
        });
      } else if (selectedModel === 'claude') {
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1500,
            messages: [{ role: 'user', content: prompt }]
          })
        });
      } else if (selectedModel === 'gpt4' || selectedModel === 'gpt4o') {
        const model = selectedModel === 'gpt4o' ? 'gpt-4o' : 'gpt-4';
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500
          })
        });
      } else if (selectedModel === 'gemini') {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      let summaryText = '';
      if (selectedModel === 'huggingface') {
        summaryText = data[0]?.generated_text || data.generated_text || '';
      } else if (selectedModel === 'groq' || selectedModel === 'perplexity') {
        summaryText = data.choices[0].message.content;
      } else if (selectedModel === 'claude') {
        summaryText = data.content[0].text;
      } else if (selectedModel === 'gpt4' || selectedModel === 'gpt4o') {
        summaryText = data.choices[0].message.content;
      } else if (selectedModel === 'gemini') {
        summaryText = data.candidates[0].content.parts[0].text;
      }
      // Try to parse as JSON, fallback to structured text
      try {
        const parsedSummary = JSON.parse(summaryText);
        setSummary(parsedSummary);
      } catch (parseError) {
        // If JSON parsing fails, create a structured summary from the text
        const lines = summaryText.split('\n').filter(line => line.trim());
        setSummary({
          title: 'Meeting Summary',
          date: new Date().toLocaleDateString(),
          duration: 'Not specified',
          attendees: [],
          keyPoints: lines.slice(0, Math.min(5, lines.length)),
          actionItems: [],
          decisions: [],
          nextSteps: []
        });
      }
    } catch (err) {
      if (err.message.includes('401')) {
        setError('Invalid API key. Please check your API key and try again.');
      } else if (err.message.includes('429')) {
        setError('Rate limit exceeded. Please try again later.');
      } else if (err.message.includes('403')) {
        setError('Access denied. Please check your API key permissions.');
      } else {
        setError(`Failed to process meeting notes: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Summary Output ---
  const renderSummary = () => {
    if (!summary) return null;
    return (
      <div className="summary-output">
        <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#312D2A', marginBottom: 4 }}>{summary.title}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 14, color: '#6B6B6B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={16} />{summary.date}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={16} />{summary.duration}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={16} />{summary.attendees?.length || 0} attendees</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {summary.attendees && summary.attendees.length > 0 && (
            <section>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600, color: '#312D2A', marginBottom: 12 }}><Users size={20} />Attendees</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {summary.attendees.map((attendee, idx) => (
                  <span key={idx} style={{ padding: '4px 12px', background: '#f3f3f3', borderRadius: 999, fontSize: 14, color: '#312D2A' }}>{attendee}</span>
                ))}
              </div>
            </section>
          )}
          {summary.keyPoints && summary.keyPoints.length > 0 && (
            <section>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600, color: '#312D2A', marginBottom: 12 }}><FileText size={20} />Key Discussion Points</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
                {summary.keyPoints.map((point, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ width: 8, height: 8, background: '#C74634', borderRadius: '50%', marginTop: 8, flexShrink: 0, display: 'inline-block' }}></span>
                    <span style={{ color: '#312D2A' }}>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {summary.actionItems && summary.actionItems.length > 0 && (
            <section>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600, color: '#312D2A', marginBottom: 12 }}><Target size={20} />Action Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {summary.actionItems.map((item, idx) => (
                  <div key={idx} style={{ background: '#f3f3f3', borderRadius: 8, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: '#312D2A' }}>{item.task}</div>
                      <div style={{ fontSize: 14, color: '#6B6B6B', marginTop: 4 }}>Assigned to: <span style={{ fontWeight: 500 }}>{item.assignee}</span></div>
                    </div>
                    <span style={{ padding: '2px 8px', background: '#ffeaea', color: '#C74634', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>{item.deadline}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
          {summary.decisions && summary.decisions.length > 0 && (
            <section>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600, color: '#312D2A', marginBottom: 12 }}><CheckCircle size={20} />Key Decisions</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
                {summary.decisions.map((decision, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <CheckCircle size={16} style={{ color: '#2ecc40', marginTop: 2, flexShrink: 0 }} />
                    <span style={{ color: '#312D2A' }}>{decision}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {summary.nextSteps && summary.nextSteps.length > 0 && (
            <section>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600, color: '#312D2A', marginBottom: 12 }}><AlertCircle size={20} />Next Steps</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
                {summary.nextSteps.map((step, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ width: 8, height: 8, background: '#3b82f6', borderRadius: '50%', marginTop: 8, flexShrink: 0, display: 'inline-block' }}></span>
                    <span style={{ color: '#312D2A' }}>{step}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="app-bg">
      <h1 className="title">Meeting Notes Summary</h1>
      <p className="subtitle">Transform your raw meeting notes into structured, actionable summaries</p>
      {/* Settings Card */}
      <div className="card">
        <div style={{ fontWeight: 700, color: '#312D2A', fontSize: 20, marginBottom: 8 }}>
          Pick your AI Model
        </div>
        <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </button>
        {showSettings && (
          <div style={{ marginTop: 24 }}>
            <label style={{ marginBottom: 8, display: 'block' }}>
              <Brain size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              <span style={{ verticalAlign: 'middle' }}>Choose AI Model:</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              {models.map((model) => (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    border: selectedModel === model.id ? '2px solid #C74634' : '1px solid #ddd',
                    background: selectedModel === model.id ? '#fff3f0' : '#fafafa',
                    cursor: 'pointer',
                    minWidth: 180,
                    boxShadow: selectedModel === model.id ? '0 2px 8px rgba(199,70,52,0.08)' : 'none',
                    fontWeight: 500
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{model.name}</span>
                    <span style={{ display: 'flex', gap: 4 }}>
                      {model.free && <span style={{ background: '#e0f2fe', color: '#2563eb', borderRadius: 6, fontSize: 12, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 2 }}><Zap size={12} />Free</span>}
                      {model.recommended && <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 6, fontSize: 12, padding: '2px 8px' }}>Recommended</span>}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>{model.provider}</div>
                  <div style={{ fontSize: 13, color: '#555' }}>{model.description}</div>
                </div>
              ))}
            </div>
            <label htmlFor="apiKey" style={{ marginBottom: 8, display: 'block' }}>
              <Key size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              <span style={{ verticalAlign: 'middle' }}>{getCurrentModel()?.apiKeyLabel}</span>
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={getCurrentModel()?.apiKeyPlaceholder}
              autoComplete="off"
            />
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              Your API key is stored locally and never sent to our servers.
            </div>
          </div>
        )}
      </div>
      {/* Notes Input Card */}
      <div className="card">
        <label htmlFor="rawNotes" style={{ fontSize: 18, fontWeight: 600, color: '#312D2A', marginBottom: 8, display: 'block' }}>
          Raw Meeting Notes
        </label>
        <textarea
          id="rawNotes"
          value={rawNotes}
          onChange={e => setRawNotes(e.target.value)}
          placeholder={`Paste your meeting notes or transcript here...\n\nExample:\n- Sarah mentioned Q4 targets are on track\n- Mike raised concerns about budget allocation\n- Emily suggested new customer feedback process\n- Action: Sarah to follow up with vendors by Friday\n- Decision: Approved $15k for new software tools`}
        />
        {error && <div className="error-message">{error}</div>}
        <button
          className="summarize-btn"
          onClick={processMeetingNotes}
          disabled={isLoading}
        >
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ width: 20, height: 20, border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
              Processing with {getCurrentModel()?.name}...
            </span>
          ) : (
            `Summarize with ${getCurrentModel()?.name}`
          )}
        </button>
      </div>
      {/* Summary Output */}
      {renderSummary()}
    </div>
  );
};

export default MeetingNotesSummary;

// Add keyframes for spinner
const style = document.createElement('style');
style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);