import { useCallback, useEffect, useMemo, useState } from 'react';

import Sidebar from './components/Sidebar.jsx';

import ProblemCard from './components/ProblemCard.jsx';

import FeedbackPanel from './components/FeedbackPanel.jsx';

import { api } from './lib/api.js';

import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Code2, Compass, FileText, History, LoaderCircle, RefreshCw, Search, Send, Sparkles, Target, TriangleAlert } from './components/Icons.jsx';



const emptyForm = { format: 'structured-text', problemUnderstanding: '', classes: '', relationships: '', designDecisions: '', codeOrDiagram: '' };

const fmtDate = value => value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Just now';



function Header({ title, subtitle, right }) { return <header className="page-header"><div><div className="breadcrumb">WORKSPACE <span>/</span> {title.toUpperCase()}</div><h1>{title}</h1><p>{subtitle}</p></div>{right}</header>; }



export default function App() {

  const [page, setPage] = useState('home');

  const [problems, setProblems] = useState([]);

  const [attempts, setAttempts] = useState([]);

  const [selectedProblem, setSelectedProblem] = useState(null);

  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [mode, setMode] = useState('ai');

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const [filter, setFilter] = useState('All levels');

  const [notice, setNotice] = useState('');



  const loadData = useCallback(async () => {

    setLoading(true); setError('');

    try {

      const [problemData, attemptData] = await Promise.all([api.problems(), api.attempts()]);

      setProblems(problemData.problems || []); setAttempts(attemptData.attempts || []);

    } catch (err) { setError(`${err.message}. Make sure the backend is running on port 8080.`); }

    finally { setLoading(false); }

  }, []);

  useEffect(() => { loadData(); }, [loadData]);



  const attemptsByProblem = useMemo(() => attempts.reduce((acc, attempt) => { acc[attempt.problemId] = (acc[attempt.problemId] || 0) + 1; return acc; }, {}), [attempts]);

  const filteredProblems = problems.filter(p => (filter === 'All levels' || p.difficulty === filter) && `${p.title} ${p.summary} ${p.category}`.toLowerCase().includes(search.toLowerCase()));

  const openProblem = async id => {

    setError(''); setNotice(''); setSelectedAttempt(null); setForm(emptyForm); setMode('ai');

    try { const data = await api.problem(id); setSelectedProblem(data.problem); setPage('practice'); }

    catch (err) { setError(err.message); }

  };

  const submit = async event => {

    event.preventDefault(); if (!selectedProblem) return;

    setSubmitting(true); setError(''); setNotice('');

    try {

      const data = await api.submit({ problemId: selectedProblem.id, submission: form, mode });

      setSelectedAttempt(data.attempt);

      const latest = await api.attempts(); setAttempts(latest.attempts || []);

      setNotice(data.attempt.status === 'completed' ? 'Your design review is ready.' : 'Your attempt was saved, but evaluation failed. You can retry it.');

    } catch (err) { setError(err.message); }

    finally { setSubmitting(false); }

  };

  const retry = async attempt => {

    setSubmitting(true); setError(''); setNotice('');

    try { const data = await api.retry(attempt._id, mode); setSelectedAttempt(data.attempt); const latest = await api.attempts(); setAttempts(latest.attempts || []); setNotice(data.attempt.status === 'completed' ? 'Evaluation completed.' : 'Evaluation failed again. Check your API key or provider status, then retry.'); }

    catch (err) { setError(err.message); }

    finally { setSubmitting(false); }

  };

  const openHistoryAttempt = async attempt => {

    setSelectedAttempt(attempt); setError('');

    const problem = problems.find(p => p.id === attempt.problemId);

    if (problem) setSelectedProblem(problem);

    setForm({ ...emptyForm, ...(attempt.submission || {}) }); setPage('review');

  };



  return <div className="app-shell"><Sidebar page={page === 'practice' || page === 'review' ? 'home' : page} onNavigate={next => { setPage(next); setSelectedAttempt(null); setError(''); setNotice(''); }}/><main className="main-content">

    <div className="mobile-brand"><span className="brand-mark"><Compass size={18}/></span> blueprint<span className="brand-dot">.</span></div>

    {error && <div className="alert error-alert"><TriangleAlert size={17}/><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}

    {notice && <div className="alert success-alert"><CheckCircle2 size={17}/><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}



    {page === 'home' && <>

      <Header title="Problem library" subtitle="Build better software designs, one thoughtful attempt at a time." right={<div className="header-pill"><span className="live-dot"/> YOUR PRACTICE SPACE</div>}/>

      <section className="hero-panel"><div className="hero-content"><div className="hero-label"><Sparkles size={14}/> THE ART OF GOOD DESIGN</div><h2>Think in objects.<br/><em>Design with intent.</em></h2><p>Practice real-world LLD problems, get feedback that explains the why, and make your next design a little better.</p><button className="primary-button" onClick={() => document.getElementById('problem-library')?.scrollIntoView({ behavior: 'smooth' })}>Explore challenges <ArrowRight size={16}/></button><div className="hero-stats"><div><strong>{problems.length.toString().padStart(2,'0')}</strong><span>Curated problems</span></div><div><strong>{attempts.length.toString().padStart(2,'0')}</strong><span>Total attempts</span></div><div><strong>{attempts.filter(a => a.status === 'completed').length.toString().padStart(2,'0')}</strong><span>Reviews completed</span></div></div></div><div className="hero-visual" aria-hidden="true"><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-core"><Code2 size={42}/></div><div className="floating-node node-a"><span>01</span> Entities</div><div className="floating-node node-b"><span>02</span> Behaviour</div><div className="floating-node node-c"><span>03</span> Patterns</div><div className="visual-caption">A GOOD DESIGN STARTS WITH A GOOD QUESTION.</div></div></section>

      <section className="library-section" id="problem-library"><div className="section-heading"><div><div className="eyebrow">THE COLLECTION</div><h2>Choose your challenge<span>.</span></h2><p>Small enough to start. Deep enough to think.</p></div><div className="library-controls"><label className="search-box"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a problem..."/></label><select aria-label="Filter by difficulty" value={filter} onChange={e => setFilter(e.target.value)}><option>All levels</option><option>Easy</option><option>Medium</option><option>Hard</option></select></div></div>

        {loading ? <div className="loading-state"><LoaderCircle className="spin"/> Loading problem library…</div> : <div className="problem-grid">{filteredProblems.map(problem => <ProblemCard key={problem.id} problem={problem} onOpen={openProblem} attempts={attemptsByProblem[problem.id] || 0}/>)}</div>}

        {!loading && !filteredProblems.length && <div className="empty-state"><Search size={25}/><strong>No matching problems</strong><span>Try a different search or difficulty.</span></div>}

      </section>

      <section className="bottom-note"><div className="note-icon"><Target size={18}/></div><div><strong>There is rarely only one right design.</strong><p>Feedback focuses on trade-offs, responsibilities, and requirements—not on matching a single reference answer.</p></div><span className="note-mark">↗</span></section>

    </>}



    {page === 'practice' && selectedProblem && <>

      <button className="back-link" onClick={() => setPage('home')}><ArrowLeft size={15}/> Back to problem library</button>

      <Header title={selectedProblem.title} subtitle={selectedProblem.summary} right={<span className={`difficulty ${selectedProblem.difficulty.toLowerCase()}`}>{selectedProblem.difficulty}</span>}/>

      <div className="practice-layout"><div className="practice-main">

        <section className="content-card problem-brief"><div className="eyebrow">THE BRIEF</div><h2>Understand the problem.</h2><p>{selectedProblem.description}</p><h3>Requirements</h3><ul className="requirements-list">{selectedProblem.requirements.map((r,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span>{r}</li>)}</ul><div className="considerations"><div className="consideration-title"><Sparkles size={15}/> Questions to think about</div>{selectedProblem.considerations.map((c,i)=><p key={i}>{c}</p>)}</div></section>

        {selectedAttempt && <section className="content-card latest-attempt"><div className="latest-heading"><div><div className="eyebrow">LATEST SUBMISSION</div><h3>Attempt status</h3></div><span className={`status-badge ${selectedAttempt.status}`}>{selectedAttempt.status}</span></div>{selectedAttempt.status === 'failed' && <div className="failure-message"><TriangleAlert size={17}/><div><strong>Evaluation couldn't complete</strong><p>{selectedAttempt.errorMessage || 'The evaluation provider did not return feedback.'} Your submission is saved; you can safely retry.</p></div></div>}{selectedAttempt.status === 'completed' && <FeedbackPanel feedback={selectedAttempt.feedback} />}{selectedAttempt.status === 'failed' && <button className="primary-button" disabled={submitting} onClick={() => retry(selectedAttempt)}>{submitting ? <LoaderCircle className="spin" size={16}/> : <RefreshCw size={15}/>} Retry evaluation</button>}</section>}

      </div><aside className="practice-aside"><div className="aside-card"><div className="aside-icon"><Clock3 size={18}/></div><h3>Make time to think.</h3><p>Estimated time: {selectedProblem.estimatedMinutes} minutes. A clear, reasoned design beats a long, unstructured answer.</p><div className="aside-divider"/><div className="aside-metric"><span>Your attempts</span><strong>{attemptsByProblem[selectedProblem.id] || 0}</strong></div></div><div className="aside-card rubric-card"><div className="eyebrow">WHAT WE LOOK FOR</div>{['Requirement coverage','Clear responsibilities','Relationships & abstractions','Extensibility','Edge cases & trade-offs'].map((x,i)=><div className="rubric-item" key={x}><span>{String(i+1).padStart(2,'0')}</span>{x}</div>)}</div></aside></div>

      <form className="content-card submission-form" onSubmit={submit}><div className="form-heading"><div><div className="eyebrow">YOUR DESIGN WORKSPACE</div><h2>Make your thinking visible<span>.</span></h2><p>Write enough that another engineer can understand the shape of your design.</p></div><div className="form-icon"><Code2 size={23}/></div></div>

        <div className="field-grid"><label className="field full-field"><span><b>01</b> Problem understanding <i>Required</i></span><textarea required minLength={10} maxLength={3000} rows={3} value={form.problemUnderstanding} onChange={e=>setForm({...form,problemUnderstanding:e.target.value})} placeholder="Who uses the system? What are the core use cases and constraints?"/></label>

        <label className="field full-field"><span><b>02</b> Classes & responsibilities <i>Required</i></span><textarea required minLength={10} maxLength={6000} rows={5} value={form.classes} onChange={e=>setForm({...form,classes:e.target.value})} placeholder={'For each class, describe its data and behaviour.\nExample: ParkingLot manages floors and delegates spot allocation to a ParkingStrategy.'}/></label>

        <label className="field"><span><b>03</b> Relationships <i>Required</i></span><textarea required minLength={5} maxLength={3000} rows={4} value={form.relationships} onChange={e=>setForm({...form,relationships:e.target.value})} placeholder="Composition, inheritance, interfaces, associations…"/></label>

        <label className="field"><span><b>04</b> Decisions & trade-offs <i>Required</i></span><textarea required minLength={5} maxLength={4000} rows={4} value={form.designDecisions} onChange={e=>setForm({...form,designDecisions:e.target.value})} placeholder="Why this design? What alternative did you consider?"/></label>

        <label className="field full-field"><span><b>05</b> Optional code or diagram notes <small>Optional</small></span><textarea maxLength={12000} rows={4} value={form.codeOrDiagram} onChange={e=>setForm({...form,codeOrDiagram:e.target.value})} placeholder="Pseudocode, class signatures, sample flow, or a text description of your UML diagram…"/></label></div>

        <div className="submit-bar"><div className="evaluator-choice"><label htmlFor="evaluation-mode">Evaluation</label><select id="evaluation-mode" value={mode} onChange={e=>setMode(e.target.value)}><option value="ai">AI design review</option><option value="rules">Quick deterministic check</option></select></div><div className="submit-actions"><span className="privacy-note"><FileText size={14}/> Your attempt is saved to history</span><button className="primary-button" type="submit" disabled={submitting}>{submitting ? <><LoaderCircle size={16} className="spin"/> Evaluating…</> : <>Submit for review <Send size={15}/></>}</button></div></div>

      </form>

    </>}



    {page === 'history' && <><Header title="My attempts" subtitle="Every iteration is progress. Review your feedback and keep improving." right={<div className="header-pill"><History size={14}/> ATTEMPT HISTORY</div>}/><div className="history-summary"><div><span>Total attempts</span><strong>{attempts.length}</strong></div><div><span>Completed reviews</span><strong>{attempts.filter(a=>a.status==='completed').length}</strong></div><div><span>Problems explored</span><strong>{new Set(attempts.map(a=>a.problemId)).size}</strong></div></div><section className="history-section"><div className="section-heading"><div><div className="eyebrow">YOUR JOURNEY</div><h2>Recent attempts<span>.</span></h2></div><button className="subtle-button" onClick={loadData}><RefreshCw size={14}/> Refresh</button></div>{loading ? <div className="loading-state"><LoaderCircle className="spin"/> Loading attempts…</div> : attempts.length ? <div className="history-table">{attempts.map(attempt=>{const problem=problems.find(p=>p.id===attempt.problemId);return <button className="history-row" key={attempt._id} onClick={()=>openHistoryAttempt(attempt)}><div className="history-file"><div className="file-icon"><FileText size={18}/></div><div><strong>{problem?.title || attempt.problemId}</strong><small>{fmtDate(attempt.createdAt)}</small></div></div><span className={`status-badge ${attempt.status}`}>{attempt.status}</span><div className="history-score">{attempt.feedback ? <><strong>{attempt.feedback.score}</strong><small>/ 100</small></> : <span className="muted-copy">No score yet</span>}</div><ArrowRight size={17} className="history-arrow"/></button>})}</div> : <div className="empty-state"><History size={26}/><strong>Your first design is waiting.</strong><span>Submit a solution to see your attempts here.</span><button className="primary-button" onClick={()=>setPage('home')}>Browse problems <ArrowRight size={15}/></button></div>}</section></>}



    {page === 'review' && selectedAttempt && <><button className="back-link" onClick={()=>setPage('history')}><ArrowLeft size={15}/> Back to attempts</button><Header title="Attempt review" subtitle={`${selectedProblem?.title || selectedAttempt.problemId} · ${fmtDate(selectedAttempt.createdAt)}`} right={<span className={`status-badge ${selectedAttempt.status}`}>{selectedAttempt.status}</span>}/><div className="review-layout"><section className="content-card review-submission"><div className="eyebrow">YOUR SUBMISSION</div><h2>Design notes</h2>{[['Problem understanding', selectedAttempt.submission?.problemUnderstanding],['Classes & responsibilities', selectedAttempt.submission?.classes],['Relationships', selectedAttempt.submission?.relationships],['Decisions & trade-offs', selectedAttempt.submission?.designDecisions],['Code / diagram notes', selectedAttempt.submission?.codeOrDiagram]].filter(([,v])=>v).map(([title,value])=><div className="review-field" key={title}><h3>{title}</h3><p>{value}</p></div>)}</section><section className="content-card review-feedback"><div className="eyebrow">EVALUATOR RESPONSE</div>{selectedAttempt.feedback ? <FeedbackPanel feedback={selectedAttempt.feedback}/> : <div className="failure-message"><TriangleAlert size={17}/><div><strong>No feedback available</strong><p>{selectedAttempt.errorMessage || 'This attempt has not been evaluated successfully yet.'}</p><button className="primary-button" disabled={submitting} onClick={()=>retry(selectedAttempt)}><RefreshCw size={15}/> Retry evaluation</button></div></div>}</section></div></>}

    <footer className="app-footer"><span>BLUEPRINT / LLD PRACTICE STUDIO</span><span>Made for thoughtful engineering <span className="footer-heart">✳</span></span></footer>

  </main></div>;

}
