import { useState, useEffect, useCallback, useMemo } from 'react'
import './styles.css'

const TIMEZONES = [
  { label: 'Local', value: 'local' },
  { label: 'UTC', value: 'UTC' },
  { label: 'US/New York (EST)', value: 'America/New_York' },
  { label: 'US/Los Angeles (PST)', value: 'America/Los_Angeles' },
  { label: 'US/Chicago (CST)', value: 'America/Chicago' },
  { label: 'Europe/London (GMT)', value: 'Europe/London' },
  { label: 'Europe/Paris (CET)', value: 'Europe/Paris' },
  { label: 'Europe/Istanbul (TRT)', value: 'Europe/Istanbul' },
  { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Asia/Shanghai (CST)', value: 'Asia/Shanghai' },
  { label: 'Asia/Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'Australia/Sydney (AEDT)', value: 'Australia/Sydney' },
]

function getTimezone(tz) {
  return tz === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : tz
}

function formatDate(date, tz) {
  const timezone = getTimezone(tz)
  return {
    iso: date.toISOString(),
    utc: date.toUTCString(),
    locale: new Intl.DateTimeFormat('tr-TR', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date),
    short: new Intl.DateTimeFormat('tr-TR', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date),
    tzName: new Intl.DateTimeFormat('tr-TR', {
      timeZone: timezone,
      timeZoneName: 'long',
    }).formatToParts(date).find(p => p.type === 'timeZoneName')?.value ?? timezone,
  }
}

function getRelativeTime(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  const abs = Math.abs(diff)
  const future = diff < 0

  if (abs < 10) return 'just now'
  if (abs < 60) return `${abs} seconds ${future ? 'from now' : 'ago'}`
  if (abs < 3600) {
    const m = Math.floor(abs / 60)
    return `${m} minute${m !== 1 ? 's' : ''} ${future ? 'from now' : 'ago'}`
  }
  if (abs < 86400) {
    const h = Math.floor(abs / 3600)
    return `${h} hour${h !== 1 ? 's' : ''} ${future ? 'from now' : 'ago'}`
  }
  if (abs < 2592000) {
    const d = Math.floor(abs / 86400)
    return `${d} day${d !== 1 ? 's' : ''} ${future ? 'from now' : 'ago'}`
  }
  if (abs < 31536000) {
    const mo = Math.floor(abs / 2592000)
    return `${mo} month${mo !== 1 ? 's' : ''} ${future ? 'from now' : 'ago'}`
  }
  const y = Math.floor(abs / 31536000)
  return `${y} year${y !== 1 ? 's' : ''} ${future ? 'from now' : 'ago'}`
}

function toDatetimeLocal(date) {
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export default function App() {
  const [unixInput, setUnixInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [timezone, setTimezone] = useState('local')
  const [nowTs, setNowTs] = useState(Math.floor(Date.now() / 1000))
  const [copiedKey, setCopiedKey] = useState(null)
  const [activeSource, setActiveSource] = useState('unix') // 'unix' | 'date'

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNowTs(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  const nowDate = useMemo(() => new Date(nowTs * 1000), [nowTs])
  const nowFormatted = useMemo(() => {
    const tz = getTimezone(timezone)
    return new Intl.DateTimeFormat('tr-TR', {
      timeZone: tz,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(nowDate)
  }, [nowDate, timezone])

  // Parse result from unix input
  const unixResult = useMemo(() => {
    if (!unixInput.trim() || activeSource !== 'unix') return null
    const raw = unixInput.trim()
    let ms
    if (/^\d{13,}$/.test(raw)) {
      ms = parseInt(raw, 10)
    } else if (/^-?\d+$/.test(raw)) {
      ms = parseInt(raw, 10) * 1000
    } else {
      return { error: 'Invalid UNIX timestamp' }
    }
    const date = new Date(ms)
    if (isNaN(date.getTime())) return { error: 'Invalid timestamp value' }
    return { date, formatted: formatDate(date, timezone), relative: getRelativeTime(date) }
  }, [unixInput, timezone, activeSource])

  // Parse result from date input
  const dateResult = useMemo(() => {
    if (!dateInput || activeSource !== 'date') return null
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return { error: 'Invalid date' }
    return {
      unix: Math.floor(date.getTime() / 1000),
      unixMs: date.getTime(),
      formatted: formatDate(date, timezone),
      relative: getRelativeTime(date),
    }
  }, [dateInput, timezone, activeSource])

  const handleSetNow = useCallback(() => {
    const ts = Math.floor(Date.now() / 1000)
    setUnixInput(String(ts))
    setActiveSource('unix')
    setDateInput('')
  }, [])

  const handleUnixChange = (e) => {
    setUnixInput(e.target.value)
    setActiveSource('unix')
    setDateInput('')
  }

  const handleDateChange = (e) => {
    setDateInput(e.target.value)
    setActiveSource('date')
    setUnixInput('')
  }

  const handleSwap = useCallback(() => {
    if (activeSource === 'unix' && unixResult?.date) {
      setDateInput(toDatetimeLocal(unixResult.date))
      setUnixInput('')
      setActiveSource('date')
    } else if (activeSource === 'date' && dateResult?.unix != null) {
      setUnixInput(String(dateResult.unix))
      setDateInput('')
      setActiveSource('unix')
    }
  }, [activeSource, unixResult, dateResult])

  const copyValue = useCallback((key, value) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1600)
    })
  }, [])

  const result = activeSource === 'unix' ? unixResult : null
  const dateRes = activeSource === 'date' ? dateResult : null
  const hasResult = (result?.date) || (dateRes?.unix != null)

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <div>
              <h1 className="header-title">Timestamp Converter</h1>
              <p className="header-sub">Convert UNIX timestamps to human-readable dates</p>
            </div>
          </div>
          <div className="header-right">
            <button
              className="btn-ghost"
              onClick={() => { setUnixInput(''); setDateInput(''); setActiveSource('unix') }}
              aria-label="Clear all"
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main">

        {/* Live Clock */}
        <div className="live-clock">
          <span className="live-dot" />
          <span className="live-unix">{nowTs}</span>
          <span className="live-sep">·</span>
          <span className="live-date">{nowFormatted}</span>
        </div>

        {/* Converter Card */}
        <div className="converter-card">

          {/* UNIX Input */}
          <div className="card-section">
            <div className="section-label">
              <span>UNIX Timestamp</span>
            </div>
            <div className="input-row">
              <input
                type="text"
                className={`ts-input${result?.error ? ' error' : ''}`}
                value={unixInput}
                onChange={handleUnixChange}
                placeholder="e.g. 1693929203"
                spellCheck={false}
                autoComplete="off"
                aria-label="UNIX timestamp input"
              />
              <button className="btn-now" onClick={handleSetNow} aria-label="Use current timestamp">
                <IconClock />
                Now
              </button>
            </div>
            {result?.error && (
              <p className="error-text">
                <IconError /> {result.error}
              </p>
            )}
          </div>

          {/* Swap */}
          <div className="swap-row" style={{ height: 0, overflow: 'visible', position: 'relative', zIndex: 1 }}>
            <div className="swap-line" />
            <button className="swap-btn" onClick={handleSwap} aria-label="Swap direction" title="Swap">
              <IconSwap />
            </button>
          </div>

          {/* Date Input */}
          <div className="card-section" style={{ paddingTop: 28 }}>
            <div className="section-label">
              <span>Date & Time</span>
            </div>
            <div className="input-row">
              <input
                type="datetime-local"
                className="date-input"
                value={dateInput}
                onChange={handleDateChange}
                step="1"
                aria-label="Date and time input"
              />
            </div>
            {dateRes?.error && (
              <p className="error-text">
                <IconError /> {dateRes.error}
              </p>
            )}
          </div>

          {/* Timezone */}
          <div className="card-section" style={{ paddingTop: 12, paddingBottom: 20 }}>
            <div className="tz-row">
              <span className="tz-label">Timezone</span>
              <select
                className="tz-select"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                aria-label="Select timezone"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Output: from UNIX */}
          {result?.date && (
            <div className="card-section">
              <div className="section-label" style={{ marginBottom: 14 }}>
                <span>Converted Output</span>
              </div>

              <div className="output-grid">
                <OutputItem
                  label="ISO 8601"
                  value={result.formatted.iso}
                  copyKey="iso"
                  copiedKey={copiedKey}
                  onCopy={copyValue}
                />
                <OutputItem
                  label="UTC"
                  value={result.formatted.utc}
                  copyKey="utc"
                  copiedKey={copiedKey}
                  onCopy={copyValue}
                />
                <OutputItem
                  label="Local (Long)"
                  value={result.formatted.locale}
                  copyKey="locale"
                  copiedKey={copiedKey}
                  onCopy={copyValue}
                />
                <OutputItem
                  label="Local (Short)"
                  value={result.formatted.short}
                  copyKey="short"
                  copiedKey={copiedKey}
                  onCopy={copyValue}
                />
                <OutputItem
                  label="Milliseconds"
                  value={String(result.date.getTime())}
                  copyKey="ms"
                  copiedKey={copiedKey}
                  onCopy={copyValue}
                  accent
                />
                <OutputItem
                  label="Timezone"
                  value={result.formatted.tzName}
                  copyKey="tzname"
                  copiedKey={copiedKey}
                  onCopy={copyValue}
                />
              </div>

              <div className="relative-badge">
                <IconTime />
                {result.relative}
              </div>
            </div>
          )}

          {/* Output: from Date */}
          {dateRes?.unix != null && (
            <div className="card-section">
              <div className="section-label" style={{ marginBottom: 14 }}>
                <span>Converted Output</span>
              </div>

              <div className="output-grid">
                <OutputItem
                  label="UNIX (seconds)"
                  value={String(dateRes.unix)}
                  copyKey="unix-s"
                  copiedKey={copiedKey}
                  onCopy={copyValue}
                  accent
                />
                <OutputItem
                  label="UNIX (milliseconds)"
                  value={String(dateRes.unixMs)}
                  copyKey="unix-ms"
                  copiedKey={copiedKey}
                  onCopy={copyValue}
                  accent
                />
                <OutputItem
                  label="ISO 8601"
                  value={dateRes.formatted.iso}
                  copyKey="d-iso"
                  copiedKey={copiedKey}
                  onCopy={copyValue}
                />
                <OutputItem
                  label="UTC"
                  value={dateRes.formatted.utc}
                  copyKey="d-utc"
                  copiedKey={copiedKey}
                  onCopy={copyValue}
                />
                <OutputItem
                  label="Local (Long)"
                  value={dateRes.formatted.locale}
                  copyKey="d-locale"
                  copiedKey={copiedKey}
                  onCopy={copyValue}
                />
                <OutputItem
                  label="Timezone"
                  value={dateRes.formatted.tzName}
                  copyKey="d-tz"
                  copiedKey={copiedKey}
                  onCopy={copyValue}
                />
              </div>

              <div className="relative-badge">
                <IconTime />
                {dateRes.relative}
              </div>
            </div>
          )}

        </div>
      </main>
    <footer className="credit">
        Coded by{' '}
        <a href="https://instagram.com/berkindev" target="_blank" rel="noopener noreferrer" className="credit-link">
          berkindev
        </a>
      </footer>
    </div>
  )
}

function OutputItem({ label, value, copyKey, copiedKey, onCopy, accent }) {
  const isCopied = copiedKey === copyKey
  return (
    <div className="output-item">
      <div className="output-item-label">
        <span>{label}</span>
        <button
          className={`btn-copy${isCopied ? ' copied' : ''}`}
          onClick={() => onCopy(copyKey, value)}
          aria-label={`Copy ${label}`}
        >
          {isCopied ? <IconCheck /> : <IconCopy />}
          {isCopied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className={`output-item-value${accent ? ' accent' : ''}`}>{value}</div>
    </div>
  )
}

function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="8" cy="8" r="6.5"/>
      <path d="M8 4.5V8l2.5 2"/>
    </svg>
  )
}

function IconSwap() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3v10M4 13l-2-2M4 13l2-2"/>
      <path d="M12 13V3M12 3l-2 2M12 3l2 2"/>
    </svg>
  )
}

function IconError() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6"/>
      <line x1="8" y1="5" x2="8" y2="8.5" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="0.6" fill="currentColor"/>
    </svg>
  )
}

function IconCopy() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="4" y="4" width="8" height="8" rx="1.5"/>
      <path d="M10 4V3a1 1 0 00-1-1H3a1 1 0 00-1 1v6a1 1 0 001 1h1"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7l4 4 6-6"/>
    </svg>
  )
}

function IconTime() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="6.5"/>
      <path d="M8 5v3.5l2 1.5"/>
    </svg>
  )
}
