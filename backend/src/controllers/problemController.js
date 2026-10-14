export const listProblems = (req, res) => res.json({ problems: req.problemCatalog });
export const getProblem = (req, res) => {
  const problem = req.problemCatalog.find(p => p.id === req.params.problemId);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });
  return res.json({ problem });
};
