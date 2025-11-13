import React, { useMemo, useState } from 'react'
import './App.css'
import stores from './data/stores.json'

export default function App() {
  const initialList = useMemo(() => {
    if (Array.isArray(stores)) {
      return stores.filter(s => s && typeof s === 'object' && s.name)
    }
    return []
  }, [])
  const [list, setList] = useState(initialList)
  const [avoidRepeat, setAvoidRepeat] = useState(true)
  const [pool, setPool] = useState(initialList)
  const [result, setResult] = useState(null)
  const [rolling, setRolling] = useState(false)
  const [displayItem, setDisplayItem] = useState(null)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [confetti, setConfetti] = useState([])
  const [confettiOn, setConfettiOn] = useState(false)
  const [imgReady, setImgReady] = useState(false)

  const pick = () => {
    if (rolling) return
    if (pool.length === 0) {
      setPool(list)
    }
    const arr = avoidRepeat ? (pool.length ? pool : list) : list
    if (arr.length === 0) {
      setResult(null)
      return
    }
    setRolling(true)
    setImgReady(false)
    const steps = 20
    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        const idx = Math.floor(Math.random() * arr.length)
        setDisplayItem(arr[idx])
      }, i * 50)
    }
    setTimeout(() => {
      const idx = Math.floor(Math.random() * arr.length)
      const chosen = arr[idx]
      setResult(chosen)
      setDisplayItem(null)
      setRolling(false)
      setHistory(prev => [chosen, ...prev].slice(0, 10))
      if (avoidRepeat) {
        const next = arr.filter((_, i) => i !== idx)
        setPool(next)
      }
      celebrate()
    }, steps * 50)
  }

  const reset = () => {
    if (rolling) return
    setResult(null)
    setDisplayItem(null)
    setPool(list)
  }

  const celebrate = () => {
    const count = 50
    const pieces = Array.from({ length: count }, (_, i) => ({
      id: i + '-' + Date.now(),
      left: Math.random() * 100,
      size: 6 + Math.random() * 10,
      color: ['#ff6b6b','#ffd93d','#6bcBff','#8bc34a','#ab47bc'][Math.floor(Math.random()*5)],
      delay: Math.random() * 0.3,
      duration: 1.2 + Math.random() * 0.8
    }))
    setConfetti(pieces)
    setConfettiOn(true)
    setTimeout(() => {
      setConfettiOn(false)
      setConfetti([])
    }, 1800)
  }

  return (
    <div className="page">
      <header className="header">
        <div className="title">今天中午吃什么</div>
        <div className="subtitle">点击随机，给你一家门店和我常点的菜</div>
      </header>

      <section className="hero">
        <div className="hero-left">
          <div className="hero-title">纠结就交给它</div>
          <div className="hero-desc">一键随机，避免重复，记录历史，吃饭不再犹豫</div>
          <div className="features">
            <span className="feature">随机抽取</span>
            <span className="feature">避免重复</span>
            <span className="feature">常点菜品</span>
            <span className="feature">历史记录</span>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-visual"></div>
        </div>
      </section>

      <div className="actions">
        <button className="btn primary" onClick={pick} disabled={rolling}>随机选择</button>
        <button className="btn" onClick={reset} disabled={rolling}>重置</button>
        <label className="checkbox">
          <input type="checkbox" checked={avoidRepeat} onChange={e => setAvoidRepeat(e.target.checked)} />
          避免重复抽取
        </label>
        <div className="count">门店数量：{list.length}</div>
        <button className="btn" onClick={() => setShowHistory(v => !v)}>{showHistory ? '收起历史' : '查看历史'}</button>
      </div>

      <div className="result">
        {result || displayItem ? (
          <div className={`card ${rolling ? 'rolling' : ''} ${!rolling && result ? 'reveal' : ''}`}>
            <div className="card-media">
              <img
                src={(displayItem || result).image || 'https://placehold.co/800x420?text=门店图片'}
                alt={(displayItem || result).name}
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x420?text=门店图片' }}
                onLoad={() => setImgReady(true)}
              />
              {!imgReady ? <div className="skeleton" /> : null}
            </div>
            <div className="card-body">
              <div className="card-title">{(displayItem || result).name}</div>
              {(displayItem || result).address ? <div className="card-address">{(displayItem || result).address}</div> : null}
              {(displayItem || result).favorites && (displayItem || result).favorites.length > 0 ? (
                <div className="chips">
                  {(displayItem || result).favorites.map((f, i) => (
                    <span className="chip pop" style={{ animationDelay: (i * 0.06) + 's' }} key={i}>{f}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="placeholder">还没选，点上面的「随机选择」试试</div>
        )}
      </div>

      {confettiOn ? (
        <div className="confetti">
          {confetti.map(p => (
            <span
              key={p.id}
              className="piece"
              style={{ left: p.left + '%', width: p.size, height: p.size, backgroundColor: p.color, animationDelay: p.delay + 's', animationDuration: p.duration + 's' }}
            />
          ))}
        </div>
      ) : null}

      <section className="preview">
        <div className="preview-title">随便看看</div>
        <div className="preview-grid">
          {list.slice(0, 6).map((s, i) => (
            <div className="preview-card" key={i}>
              <div className="preview-thumb" style={{ backgroundImage: `url(${s.image || 'https://placehold.co/400x240?text=门店'})` }}></div>
              <div className="preview-body">
                <div className="preview-name">{s.name}</div>
                {s.address ? <div className="preview-address">{s.address}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {showHistory ? (
        <section className="history">
          <div className="history-title">历史选择</div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="placeholder">暂无历史</div>
            ) : (
              history.map((h, idx) => (
                <div className="mini-card" key={idx}>
                  <div className="mini-thumb" style={{ backgroundImage: `url(${h.image || 'https://placehold.co/240x160?text=门店'})` }}></div>
                  <div className="mini-body">
                    <div className="mini-title">{h.name}</div>
                    {h.address ? <div className="mini-address">{h.address}</div> : null}
                    {h.favorites && h.favorites.length > 0 ? (
                      <div className="mini-chips">
                        {h.favorites.slice(0, 3).map((f, i) => (
                          <span className="chip" key={i}>{f}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ) : null}
    </div>
  )
}
