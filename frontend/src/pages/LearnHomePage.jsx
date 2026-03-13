import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { moduleCatalog, textbookMapNodes } from '../data/modules';
import StepModal from '../components/StepModal';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';

function LearnHomePage() {
  const { user } = useAuth();
  const { completedModules, progressPercent } = useProgress();
  const [selectedStep, setSelectedStep] = useState(null);

  const recommendedNext = useMemo(
    () => moduleCatalog.find((moduleInfo) => !completedModules.includes(moduleInfo.id)),
    [completedModules],
  );

  return (
    <div className="learn-home">
      <header className="hero-panel">
        <p className="hero-eyebrow">Introduction</p>
        <h2>Fundamental Steps in Digital Image Processing</h2>
        <p>
          This map follows a standard DIP workflow: acquisition and enhancement feed a knowledge base,
          then modules produce images or image attributes for analysis and recognition.
        </p>
        {user ? (
          <div className="inline-progress">
            <span>{progressPercent}% explored</span>
            <span>
              {completedModules.length}/{moduleCatalog.length} modules completed
            </span>
          </div>
        ) : (
          <p className="tiny-note">Sign up from sidebar to save personal progress.</p>
        )}
      </header>

      <section className="textbook-map">
        <p className="map-top-label">Fundamental Steps Involved in Digital Image Processing</p>

        <div className="map-grid">
          {textbookMapNodes.map((node) => (
            <button
              key={node.key}
              className={`map-box ${node.zone}`}
              onClick={() => setSelectedStep(node)}
              title={`${node.chapter} - ${node.title}`}
            >
              <span>{node.chapter}</span>
              <strong>{node.title}</strong>
            </button>
          ))}

          <div className="knowledge-base">Knowledge base</div>
       
        </div>
      </section>

      {recommendedNext && (
        <section className="next-step-card">
          <p className="section-title">Suggested Next Module</p>
          <h3>{recommendedNext.title}</h3>
          <p>{recommendedNext.overview}</p>
          <br />
          <Link className="primary-btn" to={`/learn/module/${recommendedNext.id}`}>
            Continue Learning
          </Link>
        </section>
      )}

      <StepModal step={selectedStep} onClose={() => setSelectedStep(null)} />
    </div>
  );
}

export default LearnHomePage;
