import { ArrowUpRight, Clock3 } from './Icons.jsx';
const art = { 'parking-lot': 'parking-art', 'elevator-system': 'elevator-art', 'vending-machine': 'vending-art' };
const symbols = { 'parking-lot': 'P', 'elevator-system': '↕', 'vending-machine': '▦' };
export default function ProblemCard({ problem, onOpen, attempts = 0 }) {
  return <button className="problem-card" onClick={() => onOpen(problem.id)}>
    <div className={`problem-art ${art[problem.id]}`}><span className="art-symbol">{symbols[problem.id]}</span><span className="art-kicker">DESIGN CHALLENGE / 0{problem.id === 'parking-lot' ? 1 : problem.id === 'elevator-system' ? 2 : 3}</span><ArrowUpRight className="art-arrow" size={19}/></div>
    <div className="problem-card-body"><div className="card-meta"><span className={`difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span><span className="category">{problem.category}</span></div><h3>{problem.title}</h3><p>{problem.summary}</p><div className="card-footer"><span><Clock3 size={14}/>{problem.estimatedMinutes} min</span><span>{attempts ? `${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}` : 'Not started'}</span><span className="card-open">Start <ArrowUpRight size={15}/></span></div></div>
  </button>;
}
