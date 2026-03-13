import { Link } from 'react-router-dom';
import { moduleMap } from '../data/modules';

function StepModal({ step, onClose }) {
  if (!step) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="step-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <h3>{step.title}</h3>
        <p>{step.description || 'Open this chapter module to study simple explanations, examples, code, and visual experiments.'}</p>
        <div className="modal-actions">
          <button className="ghost-btn" onClick={onClose}>
            Close
          </button>
          <Link className="primary-btn" to={`/learn/module/${step.moduleId}`}>
            Open This Step
          </Link>
          {step.altModuleId && (
            <Link className="ghost-btn" to={`/learn/module/${step.altModuleId}`}>
              Also Open {moduleMap[step.altModuleId]?.chapter || 'Related'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default StepModal;
