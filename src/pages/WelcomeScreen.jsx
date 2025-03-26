import React from "react";

function WelcomeScreen({ onEnter }) {
  return (
    <div className="landing-page">
      <h1>🎭 Welcome to the Virtual Museum Experience</h1>
      <button onClick={onEnter} className="enter-button">
        🚪 Open Door to Enter
      </button>
      <p>
        Discover art while we analyze your emotions and curate the perfect
        soundtrack
      </p>

      {/* 📘 Navigation Guide */}
      <div className="navigation-guide">
        <h2>🧭 How to Navigate</h2>
        <div className="guide-content">
          <div className="guide-section">
            <h3>💻 Desktop</h3>
            <ul>
              <li>
                <b>W / A / S / D</b> to walk
              </li>
              <li>
                <b>Mouse</b> to look around
              </li>
              <li>
                <b>Click</b> on doors to move between galleries
              </li>
              <li>
                To Click on each door you will have to press the
                <strong>ESC key </strong> on your keyboard or hover on the door
                and Click on your Mouse to enter
              </li>
              <li>
                Same goes for the Artwork, to view the Artwork you will have to
                press the
                <strong>ESC key </strong> on your keyboard or hover on the
                Artwork and Click on your Mouse to view the Artwork
              </li>
            </ul>
          </div>
          <div className="guide-section">
            <h3>📱 Mobile</h3>
            <ul>
              <li>
                🎮 <b>Dual joysticks</b> for movement & camera
              </li>
              <li>
                The <b>Left Joystick</b> is for movement (Walk around) and the{" "}
                <b>Right Joystick</b> is for camera movement (Look around)
              </li>
              <li>
                <b>Tap</b> on doors to move between galleries
              </li>
              <li>
                👆 To Tap on each door you will have to go a little closer to
                the door and Tap on the door to enter
              </li>
              <li>
                👆 Same goes for the Artwork, to view the Artwork you will have
                to go a little closer to the Artwork and Tap on the Artwork to
                view the Artwork
              </li>
            </ul>
          </div>
        </div>
        <p className="tip">🎧 Music adapts to your mood while exploring </p>
      </div>

      <style>{`
  .navigation-guide {
    background-color: rgba(255, 255, 255, 0.92);
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 20px;
    margin-top: 30px;
    max-width: 500px;
    width: 90%;
    text-align: left;
    font-family: 'Segoe UI', sans-serif;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  }

  .navigation-guide h2 {
    margin-bottom: 15px;
    font-size: 20px;
    color: #333;
    text-align: center;
  }

  .guide-content {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }

  .guide-section {
    flex: 1 1 45%;
    min-width: 120px;
  }

  .guide-section h3 {
    font-size: 16px;
    margin-bottom: 8px;
    color: #555;
  }

  .guide-section ul {
    list-style: none;
    padding-left: 0;
    font-size: 14px;
  }

  .guide-section li {
    margin-bottom: 6px;
  }

  .tip {
    margin-top: 12px;
    font-size: 14px;
    color: #444 !important;
    font-style: italic;
    text-align: center;
  }

  @media (max-width: 600px) {
    .guide-content {
      flex-direction: column;
      gap: 10px;
    }

    .guide-section {
      flex: 1 1 100%;
      text-align: center;
    }

    .guide-section h3 {
      font-size: 15px;
    }
  }
`}</style>
    </div>
  );
}

export default WelcomeScreen;
