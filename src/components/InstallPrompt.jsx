import { useEffect, useState } from 'react'

const DISMISS_KEY = 'medibuddy:install-dismissed'

function isInStandaloneMode() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIOS() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !/crios|fxios/i.test(navigator.userAgent) &&
    !window.MSStream
  )
}

// Shows an "Install app" button when the browser offers it (Chrome/Edge/Android),
// and a short "Add to Home Screen" hint on iOS where the install prompt is unavailable.
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [visible, setVisible] = useState(false)
  const [iosHint, setIosHint] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (isInStandaloneMode() || localStorage.getItem(DISMISS_KEY)) {
      setInstalled(true)
      return
    }

    function onBeforeInstall(e) {
      e.preventDefault()
      setDeferred(e)
      setVisible(true)
    }
    function onInstalled() {
      setInstalled(true)
      setVisible(false)
      setDeferred(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)

    let iosTimer
    if (isIOS()) {
      iosTimer = setTimeout(() => setIosHint(true), 1500)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      if (iosTimer) clearTimeout(iosTimer)
    }
  }, [])

  async function handleInstall() {
    if (!deferred) return
    deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setDeferred(null)
    setVisible(false)
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
    setIosHint(false)
  }

  if (installed) return null
  if (!visible && !iosHint) return null

  return (
    <div className="install-prompt" role="dialog" aria-label="Install MediBuddy">
      {visible ? (
        <>
          <span className="install-text">Get the MediBuddy app</span>
          <button className="install-btn" onClick={handleInstall}>Install</button>
        </>
      ) : (
        <span className="install-text">Tap Share, then "Add to Home Screen" to install</span>
      )}
      <button className="install-close" onClick={dismiss} aria-label="Dismiss install prompt">×</button>
    </div>
  )
}
