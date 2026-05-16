import { useEffect, useMemo, useState } from 'react'
import './App.css'

const demoMeals = [
  { name: 'Chicken rice bowl', calories: 640, protein: 48, carbs: 62, fat: 18, confidence: 91 },
  { name: 'Steak tacos', calories: 720, protein: 44, carbs: 68, fat: 28, confidence: 86 },
  { name: 'Protein pancakes', calories: 510, protein: 36, carbs: 54, fat: 14, confidence: 89 },
  { name: 'Salmon avocado plate', calories: 690, protein: 42, carbs: 34, fat: 38, confidence: 84 },
]

const savedMeals = JSON.parse(localStorage.getItem('bodycount-meals') || '[]')
const savedTargets = JSON.parse(localStorage.getItem('bodycount-targets') || '{"calories":2200,"protein":160}')

function App() {
  const [goal, setGoal] = useState('cut')
  const [targets, setTargets] = useState(savedTargets)
  const [preview, setPreview] = useState('')
  const [currentMeal, setCurrentMeal] = useState(demoMeals[0])
  const [meals, setMeals] = useState(savedMeals)
  const [message, setMessage] = useState('Upload a meal photo or choose a demo scan to start.')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => localStorage.setItem('bodycount-meals', JSON.stringify(meals)), [meals])
  useEffect(() => localStorage.setItem('bodycount-targets', JSON.stringify(targets)), [targets])

  const totals = useMemo(() => meals.reduce((sum, meal) => ({
    calories: sum.calories + Number(meal.calories),
    protein: sum.protein + Number(meal.protein),
    carbs: sum.carbs + Number(meal.carbs),
    fat: sum.fat + Number(meal.fat),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 }), [meals])

  const calorieProgress = Math.min((totals.calories / targets.calories) * 100, 100)
  const proteinProgress = Math.min((totals.protein / targets.protein) * 100, 100)
  const remainingCalories = Math.max(targets.calories - totals.calories, 0)
  const streak = meals.length > 0 ? 1 : 0

  function handlePhoto(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
    setMessage('Photo loaded. Press Analyze to generate an editable estimate.')
  }

  function analyzeMeal() {
    const meal = demoMeals[Math.floor(Math.random() * demoMeals.length)]
    setCurrentMeal(meal)
    setEditingId(null)
    setMessage(`Estimate ready with ${meal.confidence}% confidence. Review before saving.`)
    document.getElementById('review')?.scrollIntoView({ behavior: 'smooth' })
  }

  function saveMeal(event) {
    event.preventDefault()
    if (editingId) {
      setMeals((current) => current.map((meal) => meal.id === editingId ? { ...currentMeal, id: editingId } : meal))
      setEditingId(null)
      setMessage('Meal updated successfully.')
      return
    }
    setMeals((current) => [{ ...currentMeal, id: crypto.randomUUID(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...current])
    setMessage('Meal saved. Dashboard updated instantly.')
  }

  function editMeal(meal) {
    setCurrentMeal(meal)
    setEditingId(meal.id)
    document.getElementById('review')?.scrollIntoView({ behavior: 'smooth' })
  }

  function repeatMeal(meal) {
    setMeals((current) => [{ ...meal, id: crypto.randomUUID(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...current])
  }

  function deleteMeal(id) {
    setMeals((current) => current.filter((meal) => meal.id !== id))
  }

  function clearDay() {
    setMeals([])
    setMessage('Today was cleared.')
  }

  function applyGoal(type) {
    setGoal(type)
    if (type === 'cut') setTargets({ calories: 1900, protein: 170 })
    if (type === 'maintain') setTargets({ calories: 2300, protein: 160 })
    if (type === 'bulk') setTargets({ calories: 2800, protein: 180 })
  }

  const coach = meals.length === 0
    ? 'Start by scanning a meal. Bodycount will help you review the estimate and build your day around your goal.'
    : totals.protein < targets.protein
      ? `Protein is the priority: ${targets.protein - totals.protein}g left. Next meal idea: grilled chicken, Greek yogurt, or tuna bowl.`
      : totals.calories > targets.calories
        ? 'You are over calories. Keep the next meal lean: protein + vegetables, low oil, low sugar drinks.'
        : `Strong day. You have ${remainingCalories} calories left. Keep protein high and avoid random snacks.`

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">Bodycount<span>AI</span></div>
        <a href="#home">Overview</a>
        <a href="#scan">Scan</a>
        <a href="#review">Review</a>
        <a href="#dashboard">Dashboard</a>
        <a href="#coach">Coach</a>
      </aside>

      <section className="app" id="home">
        <header className="topbar">
          <div>
            <p className="tag">Premium nutrition assistant</p>
            <h1>Scan food. Fix macros. Transform your body.</h1>
            <p className="lead">A clean Cal AI-inspired experience with editable meal estimates, macro goals, daily coaching, and saved history on this device.</p>
          </div>
          <div className="profile-card">
            <span>Goal mode</span>
            <strong>{goal === 'cut' ? 'Cut Fat' : goal === 'bulk' ? 'Build Muscle' : 'Maintain'}</strong>
            <small>{streak} day streak</small>
          </div>
        </header>

        <div className="goal-buttons">
          {['cut','maintain','bulk'].map((type)=><button className={goal===type?'active':''} onClick={()=>applyGoal(type)} key={type}>{type==='cut'?'🔥 Cut fat':type==='bulk'?'💪 Build muscle':'⚖️ Maintain'}</button>)}
        </div>

        <section className="hero-grid">
          <div className="phone">
            <div className="phone-top"><span>Today</span><b>{Math.round(calorieProgress)}%</b></div>
            <h2>{totals.calories}<small> / {targets.calories} kcal</small></h2>
            <div className="ring"><div style={{ height: `${calorieProgress}%` }} /></div>
            <div className="macro-card"><span>Protein</span><b>{totals.protein}g / {targets.protein}g</b><div className="bar"><div style={{width:`${proteinProgress}%`}} /></div></div>
            <div className="macro-row"><span>Carbs <b>{totals.carbs}g</b></span><span>Fat <b>{totals.fat}g</b></span></div>
          </div>

          <div className="panel quick">
            <h2>Quick actions</h2>
            <p>Use these like a real app home screen.</p>
            <a className="action" href="#scan">📸 Scan a meal</a>
            <button className="action" onClick={analyzeMeal}>✨ Demo AI estimate</button>
            <a className="action" href="#dashboard">📊 View progress</a>
            <div className="coach-preview"><span>Coach says</span><p>{coach}</p></div>
          </div>
        </section>

        <section id="scan" className="panel">
          <div className="section-title"><span>01</span><div><h2>Scan or upload food</h2><p>Take a photo, get an estimate, then review it before saving.</p></div></div>
          <label className="upload"><input type="file" accept="image/*" capture="environment" onChange={handlePhoto}/><b>📸 Open camera or choose photo</b><small>JPG, PNG, or camera photo</small></label>
          {preview&&<img className="preview" src={preview} alt="Meal preview"/>}
          <button onClick={analyzeMeal}>Analyze photo estimate</button>
          <p className="message">{message}</p>
        </section>

        <section id="review" className="panel review-panel">
          <div className="section-title"><span>02</span><div><h2>{editingId ? 'Edit saved meal' : 'Review estimate'}</h2><p>Never trust AI blindly. Adjust calories and macros before saving.</p></div></div>
          <div className="confidence">AI confidence <b>{currentMeal.confidence || 88}%</b></div>
          <form className="form" onSubmit={saveMeal}>
            <label>Food name<input value={currentMeal.name} onChange={(e)=>setCurrentMeal({...currentMeal,name:e.target.value})}/></label>
            <div className="form-grid"><label>Calories<input type="number" value={currentMeal.calories} onChange={(e)=>setCurrentMeal({...currentMeal,calories:e.target.value})}/></label><label>Protein (g)<input type="number" value={currentMeal.protein} onChange={(e)=>setCurrentMeal({...currentMeal,protein:e.target.value})}/></label><label>Carbs (g)<input type="number" value={currentMeal.carbs} onChange={(e)=>setCurrentMeal({...currentMeal,carbs:e.target.value})}/></label><label>Fat (g)<input type="number" value={currentMeal.fat} onChange={(e)=>setCurrentMeal({...currentMeal,fat:e.target.value})}/></label></div>
            <button type="submit">{editingId ? 'Update meal' : 'Save this meal'}</button>
          </form>
        </section>

        <section id="dashboard" className="panel">
          <div className="section-title"><span>03</span><div><h2>Daily dashboard</h2><p>Clear totals, calories remaining, and editable meal history.</p></div></div>
          <div className="stats"><div><small>Calories eaten</small><b>{totals.calories}</b></div><div><small>Calories left</small><b>{remainingCalories}</b></div><div><small>Protein</small><b>{totals.protein}g</b></div><div><small>Carbs / Fat</small><b>{totals.carbs}g / {totals.fat}g</b></div></div>
          <div className="history">{meals.length===0?<p className="empty">No meals yet. Scan or save your first meal.</p>:meals.map((meal)=><article className="meal" key={meal.id}><div><h3>{meal.name}</h3><p>{meal.time || 'Today'} • {meal.calories} kcal • {meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat</p></div><div className="meal-actions"><button onClick={()=>editMeal(meal)}>Edit</button><button onClick={()=>repeatMeal(meal)}>Repeat</button><button className="danger" onClick={()=>deleteMeal(meal.id)}>Delete</button></div></article>)}</div>{meals.length>0&&<button className="danger" onClick={clearDay}>Clear today</button>}
        </section>

        <section id="coach" className="panel coach-card"><div className="section-title"><span>AI</span><div><h2>Coach</h2><p>Actionable advice for the next decision.</p></div></div><p>{coach}</p><div className="suggestions"><b>Suggested next meal</b><span>Lean protein + rice/potatoes + vegetables</span><span>Water before snacks</span><span>Protein target first</span></div></section>
      </section>
    </main>
  )
}

export default App
