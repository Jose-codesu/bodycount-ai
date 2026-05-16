import { useEffect, useMemo, useState } from 'react'
import './App.css'

const demoMeals = [
  { name: 'Chicken rice bowl', calories: 640, protein: 48, carbs: 62, fat: 18, confidence: 91 },
  { name: 'Steak tacos', calories: 720, protein: 44, carbs: 68, fat: 28, confidence: 86 },
  { name: 'Protein pancakes', calories: 510, protein: 36, carbs: 54, fat: 14, confidence: 89 },
]

const savedMeals = JSON.parse(localStorage.getItem('bodycount-meals') || '[]')

function App() {
  const [meals, setMeals] = useState(savedMeals)
  const [meal, setMeal] = useState(demoMeals[0])
  const [preview, setPreview] = useState('')
  const [status, setStatus] = useState('Choose a photo or use demo scan.')

  useEffect(() => localStorage.setItem('bodycount-meals', JSON.stringify(meals)), [meals])

  const targets = { calories: 2200, protein: 160 }
  const totals = useMemo(() => meals.reduce((t, m) => ({
    calories: t.calories + Number(m.calories),
    protein: t.protein + Number(m.protein),
    carbs: t.carbs + Number(m.carbs),
    fat: t.fat + Number(m.fat),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 }), [meals])

  const caloriesLeft = Math.max(targets.calories - totals.calories, 0)
  const caloriePercent = Math.min((totals.calories / targets.calories) * 100, 100)
  const proteinPercent = Math.min((totals.protein / targets.protein) * 100, 100)

  function uploadPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
    setStatus('Photo ready. Analyze it, then review the estimate.')
  }

  function analyze() {
    const next = demoMeals[Math.floor(Math.random() * demoMeals.length)]
    setMeal(next)
    setStatus(`Estimate ready • ${next.confidence}% confidence`)
  }

  function saveMeal(e) {
    e.preventDefault()
    setMeals([{ ...meal, id: crypto.randomUUID(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...meals])
    setStatus('Meal saved to today.')
  }

  function removeMeal(id) {
    setMeals(meals.filter((item) => item.id !== id))
  }

  const coach = meals.length === 0
    ? 'Start with one meal. Scan it, review the macros, then save it.'
    : totals.protein < targets.protein
      ? `You still need ${targets.protein - totals.protein}g protein. Choose a lean protein next.`
      : `Good pace. You have ${caloriesLeft} calories left today.`

  return (
    <main className="layout">
      <aside className="sidebar">
        <div className="logo">Bodycount<span>AI</span></div>
        <a href="#overview">Overview</a>
        <a href="#scan">Scan</a>
        <a href="#review">Review</a>
        <a href="#history">Meals</a>
      </aside>

      <section className="content">
        <header className="hero" id="overview">
          <div>
            <p className="eyebrow">AI calorie tracker</p>
            <h1>Track your food without chaos.</h1>
            <p>One clean flow: scan a meal, review the estimate, save it, and follow your daily macro progress.</p>
          </div>
          <div className="today-card">
            <span>Today</span>
            <strong>{totals.calories}</strong>
            <small>of {targets.calories} calories</small>
            <div className="progress"><div style={{ width: `${caloriePercent}%` }} /></div>
          </div>
        </header>

        <section className="dashboard-grid">
          <div className="stat"><span>Calories left</span><b>{caloriesLeft}</b></div>
          <div className="stat"><span>Protein</span><b>{totals.protein}g / {targets.protein}g</b><div className="progress small"><div style={{ width: `${proteinPercent}%` }} /></div></div>
          <div className="stat"><span>Carbs</span><b>{totals.carbs}g</b></div>
          <div className="stat"><span>Fat</span><b>{totals.fat}g</b></div>
        </section>

        <section className="main-grid">
          <div className="card" id="scan">
            <div className="card-title"><span>1</span><div><h2>Scan meal</h2><p>Upload a photo or run a demo scan.</p></div></div>
            <label className="upload"><input type="file" accept="image/*" capture="environment" onChange={uploadPhoto} />📸 Choose photo</label>
            {preview && <img className="preview" src={preview} alt="Meal preview" />}
            <button onClick={analyze}>Analyze estimate</button>
            <p className="status">{status}</p>
          </div>

          <div className="card" id="review">
            <div className="card-title"><span>2</span><div><h2>Review macros</h2><p>Edit numbers before saving.</p></div></div>
            <form className="form" onSubmit={saveMeal}>
              <label>Meal name<input value={meal.name} onChange={(e) => setMeal({ ...meal, name: e.target.value })} /></label>
              <div className="form-grid">
                <label>Calories<input type="number" value={meal.calories} onChange={(e) => setMeal({ ...meal, calories: e.target.value })} /></label>
                <label>Protein<input type="number" value={meal.protein} onChange={(e) => setMeal({ ...meal, protein: e.target.value })} /></label>
                <label>Carbs<input type="number" value={meal.carbs} onChange={(e) => setMeal({ ...meal, carbs: e.target.value })} /></label>
                <label>Fat<input type="number" value={meal.fat} onChange={(e) => setMeal({ ...meal, fat: e.target.value })} /></label>
              </div>
              <button type="submit">Save meal</button>
            </form>
          </div>
        </section>

        <section className="card coach">
          <h2>Coach</h2>
          <p>{coach}</p>
        </section>

        <section className="card" id="history">
          <div className="card-title"><span>3</span><div><h2>Meal history</h2><p>Saved meals for today.</p></div></div>
          <div className="meal-list">
            {meals.length === 0 ? <p className="empty">No meals saved yet.</p> : meals.map((item) => (
              <article className="meal" key={item.id}>
                <div><h3>{item.name}</h3><p>{item.time} • {item.calories} kcal • {item.protein}g protein</p></div>
                <button className="danger" onClick={() => removeMeal(item.id)}>Delete</button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
