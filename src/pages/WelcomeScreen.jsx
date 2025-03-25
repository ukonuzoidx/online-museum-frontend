// import React from "react";
// import { useNavigate } from "react-router-dom";

// const WelcomeScreen = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="welcome-container">
//       <h1>🎭 Welcome to the Online Museum</h1>
//       <button className="enter-button" onClick={() => navigate("/museum")}>
//         🚪 Open Door to Enter
//       </button>
//     </div>
//   );
// };

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
    </div>
  );
}


export default WelcomeScreen;