import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'

// Shared app header: logo + wordmark on the left, Saved link and a dark-mode
// toggle on the right. Runs once the no-flash theme script in index.html has
// already set data-theme on <html>, so the first paint matches the saved theme.
function Header() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  )

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('medibuddy:theme', next)
    } catch {
      // ignore privacy-mode errors
    }
  }

  const isDark = theme === 'dark'

  return (
    <header className="header">
      <Link to="/" className="logo-link" aria-label="MediBuddy home">
        <svg className="logo" viewBox="0 0 512 512" role="img" aria-hidden="true">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2a8bff" />
              <stop offset="1" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="512" height="512" rx="116" fill="url(#logoGrad)" />
          <g fill="#fff">
            <rect x="212" y="120" width="88" height="272" rx="22" />
            <rect x="120" y="212" width="272" height="88" rx="22" />
          </g>
        </svg>
        <span className="wordmark">
          Medi<span className="accent">Buddy</span>
        </span>
      </Link>

      <nav className="header-nav">
        <NavLink to="/saved" className="nav-link" aria-label="Saved medicines">
          <span aria-hidden="true">♥</span>
          <span className="nav-link-label">Saved</span>
        </NavLink>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={isDark}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </nav>
    </header>
  )
}

export default Header
