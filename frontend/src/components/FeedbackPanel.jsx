import { CheckCircle2, Lightbulb, TriangleAlert } from './Icons.jsx';
export default function FeedbackPanel({ feedback }) {
  if (!feedback) return null;
  return <div className="feedback-wrap">
    <div className="score-card"><div><div className="eyebrow">DESIGN REVIEW</div><h2>{feedback.score}<span>/100</span></h2><p>{feedback.summary}</p></div><div className="score-ring" style={{ '--score': `${feedback.score}%` }}><div>{feedback.score >= 75 ? 'On track' : feedback.score >= 50 ? 'Getting there' : 'Keep iterating'}</div></div></div>
    <div className="feedback-grid">
      <section className="feedback-section"><h3><CheckCircle2 size={17}/> What’s working</h3>{feedback.strengths?.length ? <ul className="feedback-list positive">{feedback.strengths.map((x,i)=><li key={i}>{x}</li>)}</ul> : <p className="muted-copy">No specific strengths identified yet. Review the criteria below.</p>}</section>
      <section className="feedback-section"><h3><TriangleAlert size={17}/> Areas to improve</h3>{feedback.issues?.length ? <ul className="issue-list">{feedback.issues.map((x,i)=><li key={i}><span className={`severity ${x.severity || 'medium'}`}>{x.severity || 'note'}</span><strong>{x.title}</strong><p>{x.explanation}</p></li>)}</ul> : <p className="muted-copy">No major issues were flagged. Check the suggestions for further improvements.</p>}</section>
      <section className="feedback-section full-span"><h3><Lightbulb size={17}/> Suggested next steps</h3><ol className="suggestion-list">{feedback.suggestions?.map((x,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span>{x}</li>)}</ol></section>
      {feedback.criteria?.length > 0 && <section className="feedback-section full-span"><h3>Evaluation criteria</h3><div className="criteria-list">{feedback.criteria.map((x,i)=><div className="criteria-row" key={i}><div><strong>{x.criterion}</strong><p>{x.reason || x.explanation}</p></div><span className="criteria-score">{x.score !== undefined ? `${x.score}/5` : x.passed ? 'Pass' : 'Review'}</span></div>)}</div></section>}
      {feedback.tradeOffs?.length > 0 && <section className="feedback-section full-span"><h3>Trade-offs to consider</h3><ul className="feedback-list">{feedback.tradeOffs.map((x,i)=><li key={i}>{x}</li>)}</ul></section>}
    </div><p className="feedback-disclaimer">{feedback.disclaimer || 'Feedback is a guide, not an absolute verdict. More than one design can be valid.'} {feedback.evaluator === 'llm' ? `Evaluated with ${feedback.model || 'AI model'}.` : 'Evaluated with deterministic checks.'}</p>
  </div>;
}
