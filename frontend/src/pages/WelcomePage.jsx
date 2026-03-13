import { useNavigate } from 'react-router-dom';

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <div className="welcome-overlay" />
      <section className="welcome-card">
        <p className="welcome-tag">Digital Image Processing Lab Toolkit</p>
        <h1>Master Digital Image Processing by Exploring, Coding, and Visualizing</h1>
        <p>
          This software combines theory, Python code, and live image experiments from digital image
          processing fundamentals to color processing. Start as a guest or sign up to track your progress.
        </p>
        <button className="primary-btn large" onClick={() => navigate('/learn')}>
          Get Started
        </button>
      </section>
    </div>
  );
}

export default WelcomePage;
