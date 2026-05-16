import { useMemo, useState } from 'react'
import './App.css'

const demoMeals = [
  { name: 'Chicken rice bowl', calories: 640, protein: 48, carbs: 62, fat: 18 },
  { name: 'Steak tacos', calories: 720, protein: 44, carbs: 68, fat: 28 },
  { name: 'Protein pancakes', calories: 510, protein: 36, carbs: 54, fat: 14 },
  { name: 'Salmon avocado plate', calories: 690, protein: 42, carbs: 34, fat: 38 },
]

function App() {
  const [goal, setGoal] = useState('cut')
  const [targets, setTargets] = useState({ calories: 2200, protein: 160 })
  const [preview, setPreview] = useState('')
  const [currentMeal, setCurrentMeal] = useState(demoMeals[0])
  const [meals, setMeals] = useState([])
  const [message, setMessage] = useState('Upload a meal photo or use the review form manually.')

  const totals = useMemo(() => {
    return meals.reduce(
      (sum, meal) => ({
        calories: sum.calories + Number(meal.calories),
        protein: sum.protein + Number(meal.protein),
        carbs: sum.carbs + Number(meal.carbs),
        fat: sum.fat + Number(meal.fat),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
  }, [meals])

  const calorieProgress = Math.min((totals.calories / targets.calories) * 100, 100)
  const proteinProgress = Math.min((totals.protein / targets.protein) * 100, 100)

  function handlePhoto(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
    setMessage('Photo loaded. Press Analyze to generate an estimate.')
  }

  function analyzeMeal() {
    const meal = demoMeals[Math.floor(Math.random() * demoMeals.length)]
    setCurrentMeal(meal)
    setMessage('Estimate ready. Review the numbers before saving.')
  }

  function saveMeal(event) {
    event.preventDefault()
    setMeals((current) => [{ ...currentMeal, id: crypto.randomUUID() }, ...current])
    setMessage('Meal saved to today dashboard.')
  }

  function deleteMeal(id) {
    setMeals((current) => current.filter((meal) => meal.id !== id))
  }

  function applyGoal(type) {
    setGoal(type)
    if (type === 'cut') setTargets({ calories: 1900, protein: 170 })
    if (type === 'maintain') setTargets({ calories: 2300, protein: 160 })
    if (type === 'bulk') setTargets({ calories: 2800, protein: 180 })
  }

  const coach =
    meals.length === 0
      ? 'Log your first meal to unlock coaching.'
      : totals.protein < targets.protein
        ? `You need ${targets.protein - totals.protein}g more protein today. Choose lean meat, Greek yogurt, eggs, or a protein shake.`
        : totals.calories > targets.calories
          ? 'You passed your calorie target. Keep dinner lighter and prioritize protein and vegetables.'
          : 'Great pace. Your protein is strong and your calories are still under control.'

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <strong className="logo">Bodycount<span>AI</span></strong>
          <p>AI-style nutrition tracking for cutting, maintaining, or bulking.</p>
        </div>
        <a href="#scan" className="pill">Scan meal</a>
      </header>

      <section className="hero">
        <div>
          <p className="tag">Scan • Review • Save • Improve</p>
          <h1>Track meals like a premium fitness app.</h1>
          <p className="lead">
            Upload food, get a smart estimate, edit the macros, and save meals to your daily dashboard.
          </p>
          <div className="goal-buttons">
            {['cut', 'maintain', 'bulk'].map((type) => (
              <button className={goal === type ? 'active' : ''} onClick={() => applyGoal(type)} key={type}>
                {type === 'cut' ? 'Cut fat' : type === 'bulk' ? 'Build muscle' : 'Maintain'}
              </button>
            ))}
          </div>
        </div>

        <div className="summary-card">
          <span>Today</span>
          <h2>{totals.calories}<small> / {targets.calories} kcal</small></h2>
          <div className="bar"><div style={{ width: `${calorieProgress}%` }} /></div>
          <div className="macro-line"><b>Protein</b><span>{totals.protein}g / {targets.protein}g</span></div>
          <div className="bar small"><div style={{ width: `${proteinProgress}%` }} /></div>
          <div className="macros">
            <span>Carbs <b>{totals.carbs}g</b></span>
            <span>Fat <b>{totals.fat}g</b></span>
          </div>
        </div>
      </section>

      <nav className="tabs">
        <a href="#scan">1 Scan</a>
        <a href="#review">2 Review</a>
        <a href="#dashboard">3 Dashboard</a>
        <a href="#coach">4 Coach</a>
      </nav>

      <section id="scan" className="card">
        <div className="section-title"><span>01</span><div><h2>Scan or upload food</h2><p>Use your camera or upload a meal photo. This demo estimates common meals.</p></div></div>
        <label className="upload">
          <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} />
          <b>📸 Open camera or choose photo</b>
          <small>Then press Analyze.</small>
        </label>
        {preview && <img className="preview" src={preview} alt="Meal preview" />}
        <button onClick={analyzeMeal}>Analyze photo estimate</button>
        <p className="message">{message}</p>
      </section>

      <section id="review" className="card">
        <div className="section-title"><span>02</span><div><h2>Review before saving</h2><p>AI estimates can be wrong. Edit every value before adding it to your day.</p></div></div>
        <form className="form" onSubmit={saveMeal}>
          <label>Food name<input value={currentMeal.name} onChange={(e) => setCurrentMeal({ ...currentMeal, name: e.target.value })} /></label>
          <div className="form-grid">
            <label>Calories<input type="number" value={currentMeal.calories} onChange={(e) => setCurrentMeal({ ...currentMeal, calories: e.target.value })} /></label>
            <label>Protein (g)<input type="number" value={currentMeal.protein} onChange={(e) => setCurrentMeal({ ...currentMeal, protein: e.target.value })} /></label>
            <label>Carbs (g)<input type="number" value={currentMeal.carbs} onChange={(e) => setCurrentMeal({ ...currentMeal, carbs: e.target.value })} /></label>
            <label>Fat (g)<input type="number" value={currentMeal.fat} onChange={(e) => setCurrentMeal({ ...currentMeal, fat: e.target.value })} /></label>
          </div>
          <button type="submit">Save this meal</button>
        </form>
      </section>

      <section id="dashboard" className="card">
        <div className="section-title"><span>03</span><div><h2>Today dashboard</h2><p>Live totals, progress bars, and meal history.</p></div></div>
        <div className="stats">
          <div><small>Calories eaten</small><b>{totals.calories}</b></div>
          <div><small>Protein</small><b>{totals.protein}g</b></div>
          <div><small>Carbs</small><b>{totals.carbs}g</b></div>
          <div><small>Fat</small><b>{totals.fat}g</b></div>
        </div>
        <div className="history">
          {meals.length === 0 ? <p className="empty">No meals yet. Scan or save your first meal.</p> : meals.map((meal) => (
            <article className="meal" key={meal.id}>
              <div><h3>{meal.name}</h3><p>{meal.calories} kcal • {meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat</p></div>
              <button className="danger" onClick={() => deleteMeal(meal.id)}>Delete</button>
            </article>
          ))}
        </div>
      </section>

      <section id="coach" className="card coach-card">
        <div className="section-title"><span>AI</span><div><h2>Coach</h2><p>Simple recommendations based on your targets.</p></div></div>
        <p>{coach}</p>
      </section>
    </main>
  )
}

export default App
