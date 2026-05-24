import { useEffect, useState } from 'react'

export default function ReaderWatermark({ username }) {
  const [watermarkUrl, setWatermarkUrl] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 250
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.font = '13px sans-serif'
    ctx.fillStyle = 'rgba(156, 163, 175, 0.12)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(-Math.PI / 6) // -30 degrees rotation
    ctx.fillText(username || 'ComiC WorlD Guest', 0, -10)
    ctx.fillText('Protected Content', 0, 10)

    setWatermarkUrl(canvas.toDataURL())
  }, [username])

  if (!watermarkUrl) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 select-none"
      style={{
        backgroundImage: `url(${watermarkUrl})`,
        backgroundRepeat: 'repeat',
      }}
    />
  )
}
