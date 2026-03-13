import { useRef } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { moduleMap } from '../data/modules';
import { chapterDetailMap } from '../data/modules/chapterDetails';
import Visualizer from '../components/Visualizer';
import { useProgress } from '../context/ProgressContext';

function renderListOrText(content) {
  if (Array.isArray(content)) {
    return (
      <ul className="lesson-points">
        {content.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    );
  }
  return <p>{content}</p>;
}

function renderStructuredLesson(item, moduleTitle) {
  const figureSrc = item.figure?.src || (item.figure?.svg ? `data:image/svg+xml;base64,${btoa(item.figure.svg)}` : '');
  return (
    <article className="lesson-card lesson-structured" key={item.topic}>
      <h4>{item.topic}</h4>

      {item.figure && (
        <figure className="lesson-topic-figure">
          {figureSrc ? <img src={figureSrc} alt={item.figure.alt || `${item.topic} figure`} className="chapter-figure" /> : null}
          {item.figure.caption ? <figcaption>{item.figure.caption}</figcaption> : null}
        </figure>
      )}

      <section className="lesson-section">
        <h5>1. Concept Overview</h5>
        {renderListOrText(item.conceptOverview)}
      </section>

      <section className="lesson-section">
        <h5>2. Intuition</h5>
        {renderListOrText(item.intuition)}
      </section>

      <section className="lesson-section">
        <h5>3. Mathematical Model</h5>
        {renderListOrText(item.mathematicalModel)}
      </section>

      <section className="lesson-section">
        <h5>4. Algorithm Explanation</h5>
        {renderListOrText(item.algorithmExplanation)}
      </section>

      <section className="lesson-section">
        <h5>5. Example</h5>
        {renderListOrText(item.example)}
      </section>

      <section className="lesson-section">
        <h5>6. Practical Notes</h5>
        {renderListOrText(item.practicalNotes)}
      </section>

      <section className="lesson-section">
        <h5>7. Try in Visualizer</h5>
        {renderListOrText(item.visualizerExperiments)}
      </section>

      {item.code && (
        <SyntaxHighlighter language="python" style={oneLight} customStyle={{ borderRadius: '10px' }}>
          {item.code}
        </SyntaxHighlighter>
      )}
    </article>
  );
}

function ModulePage({ forcedModuleId = null, chapterContext = '', extraSection = null }) {
  const params = useParams();
  const moduleId = forcedModuleId || params.moduleId;
  const moduleInfo = moduleMap[moduleId];
  const chapterDetail = chapterDetailMap[moduleId];
  const { completedModules, markCompleted, unmarkCompleted } = useProgress();
  const visualizerRef = useRef(null);

  if (!moduleInfo) {
    return <Navigate to="/learn" replace />;
  }

  const isCompleted = completedModules.includes(moduleInfo.id);

  return (
    <article className="module-page">
      <header className="module-header">
        <p>{moduleInfo.chapter}</p>
        <h2>{moduleInfo.routeTitle}</h2>
        <p>{moduleInfo.overview}</p>
        {chapterContext && <p className="chapter-context">{chapterContext}</p>}
        <div className="module-header-actions">
          <button
            className={isCompleted ? 'ghost-btn' : 'primary-btn'}
            onClick={() => (isCompleted ? unmarkCompleted(moduleInfo.id) : markCompleted(moduleInfo.id))}
          >
            {isCompleted ? 'Mark as Unread' : 'Mark as Read'}
          </button>
          <button
            className="ghost-btn"
            type="button"
            onClick={() => visualizerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            Go to Visualizer
          </button>
        </div>
      </header>

      <section className="module-block">
        <div className="lesson-grid">
          {moduleInfo.lessons.map((item) =>
            item.conceptOverview
              ? renderStructuredLesson(item, moduleInfo.title)
              : (
                <article className="lesson-card" key={item.topic}>
                  <h4>{item.topic}</h4>
                  <p>
                    <strong>Simple idea:</strong> {item.simple}
                  </p>
                  <p>
                    <strong>Example:</strong> {item.example}
                  </p>
                  <p>
                    <strong>Try in visualizer:</strong> {item.visualTask}
                  </p>
                  <SyntaxHighlighter language="python" style={oneLight} customStyle={{ borderRadius: '10px' }}>
                    {item.code}
                  </SyntaxHighlighter>
                </article>
              ),
          )}
        </div>
      </section>

      {chapterDetail && (
        <section className="module-block">
          <div className="lesson-grid">
            {chapterDetail.deepDive.map((item) => (
              <article className="lesson-card" key={item.title}>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
                <SyntaxHighlighter language="python" style={oneLight} customStyle={{ borderRadius: '10px' }}>
                  {item.code}
                </SyntaxHighlighter>
              </article>
            ))}
          </div>
          <article className="lesson-card">
            <h4>{chapterDetail.figure.title}</h4>
            <img
              src={`data:image/svg+xml;base64,${btoa(chapterDetail.figure.svg)}`}
              alt={`${moduleInfo.title} conceptual figure`}
              className="chapter-figure"
            />
          </article>
        </section>
      )}

      {!moduleInfo.hideReferenceCode && (
        <section className="module-block">
          <h3>Python Reference Code</h3>
          <SyntaxHighlighter language="python" style={oneLight} customStyle={{ borderRadius: '12px' }}>
            {moduleInfo.codeSnippet}
          </SyntaxHighlighter>
        </section>
      )}

      {extraSection}

      <section ref={visualizerRef}>
        <Visualizer labConfig={moduleInfo.lab} title={moduleInfo.title} />
      </section>
    </article>
  );
}

export default ModulePage;
