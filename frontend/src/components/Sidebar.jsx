import { BookOpen, History, Layers3, Sparkles } from './Icons.jsx';
export default function Sidebar({ page, onNavigate }) {
  return <aside className="sidebar">
    <button className="brand" onClick={() => onNavigate('home')} aria-label="Blueprint home"><span className="brand-mark"><Layers3 size={19}/></span><span>blueprint<span className="brand-dot">.</span><small>LLD PRACTICE STUDIO</small></span></button>
    <div className="side-label">WORKSPACE</div>
    <button className={`nav-link ${page === 'home' ? 'active' : ''}`} onClick={() => onNavigate('home')}><BookOpen size={17}/> Problem library <span className="nav-count">03</span></button>
    <button className={`nav-link ${page === 'history' ? 'active' : ''}`} onClick={() => onNavigate('history')}><History size={17}/> My attempts</button>
    <div className="sidebar-bottom"><div className="sidebar-tip-icon"><Sparkles size={17}/></div><p className="tip-title">Better designs, one attempt at a time.</p><p className="tip-copy">Practice the reasoning behind your architecture, not just the final answer.</p><button className="tip-link" onClick={() => onNavigate('home')}>Explore problems <span>↗</span></button><div className="profile"><div className="avatar">R</div><div><strong>Rimjhim</strong><small>Independent learner</small></div><span className="online-dot"/></div></div>
  </aside>;
}
