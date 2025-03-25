import React, { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MoodMonitorPanel = ({ emotionHistory, stableEmotion }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartData, setChartData] = useState([]);
  const timeSeriesRef = useRef([]);

  // Map emotions to numerical values for charting
  const emotionValueMap = {
    Happy: 5,
    Surprise: 4,
    Neutral: 3,
    Sad: 2,
    Fear: 1.5,
    Disgust: 1,
    Angry: 0.5,
  };

  // Map emotions to colors
  const emotionColorMap = {
    Happy: "#ffcc00",
    Sad: "#6495ED",
    Angry: "#ff4d4d",
    Neutral: "#aaaaaa",
    Surprise: "#66ff66",
    Disgust: "#9370DB",
    Fear: "#800080",
  };

  // Process emotion history for visualization
  useEffect(() => {
    if (emotionHistory && emotionHistory.length > 0) {
      // Add timestamp to the latest emotion
      const newEntry = {
        timestamp: new Date().getTime(),
        emotion: emotionHistory[emotionHistory.length - 1],
        value: emotionValueMap[emotionHistory[emotionHistory.length - 1]] || 3,
      };

      // Update our time series data (keep last 30 entries)
      timeSeriesRef.current = [...timeSeriesRef.current, newEntry].slice(-30);

      // Format data for chart display
      const formattedData = timeSeriesRef.current.map((entry, index) => ({
        name: formatTimestamp(entry.timestamp, index),
        value: entry.value,
        emotion: entry.emotion,
      }));

      setChartData(formattedData);
    }
  }, [emotionHistory]);

  // Format timestamp for display
  const formatTimestamp = (timestamp, index) => {
    // For chart labels, we'll use relative time (e.g., "30s ago")
    if (index === 0) {
      return "Start";
    }

    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      return `${Math.floor(seconds / 60)}m`;
    }
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: "8px",
            borderRadius: "4px",
            border: `1px solid ${emotionColorMap[data.emotion]}`,
          }}
        >
          <p style={{ margin: 0, color: "#fff" }}>{`Mood: ${data.emotion}`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="mood-monitor-panel"
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "rgba(0,0,0,0.7)",
        borderRadius: "8px",
        color: "white",
        zIndex: 1000,
        transition: "all 0.3s ease",
        maxWidth: isExpanded ? "400px" : "80px",
        overflow: "hidden",
        boxShadow: "0 0 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header and toggle */}
      <div
        style={{
          padding: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          cursor: "pointer",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 style={{ margin: 0, display: "flex", alignItems: "center" }}>
          {isExpanded ? "📊 Mood Monitor" : "📊"}
          <div
            style={{
              marginLeft: "10px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: emotionColorMap[stableEmotion],
              transition: "background-color 1s ease",
              display: isExpanded ? "block" : "none",
            }}
          />
        </h3>
        <button
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          {isExpanded ? "▼" : "▶"}
        </button>
      </div>

      {/* Panel content - only visible when expanded */}
      {isExpanded && (
        <div style={{ padding: "12px" }}>
          {/* Current mood */}
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                Current Mood:
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {stableEmotion}
              </div>
            </div>

            {/* Mood bubble */}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: emotionColorMap[stableEmotion],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                boxShadow: `0 0 15px ${emotionColorMap[stableEmotion]}`,
              }}
            >
              {stableEmotion.charAt(0)}
            </div>
          </div>

          {/* Mood history bubbles */}
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}
            >
              Recent Moods:
            </div>
            <div
              style={{
                display: "flex",
                gap: "6px",
                backgroundColor: "rgba(255,255,255,0.05)",
                padding: "8px",
                borderRadius: "4px",
              }}
            >
              {emotionHistory
                .slice()
                .reverse()
                .map((emotion, index) => (
                  <div
                    key={index}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: emotionColorMap[emotion],
                      opacity: 0.4 + (emotionHistory.length - 1 - index) * 0.15,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      color: "#fff",
                      textShadow: "0 0 2px #000",
                    }}
                    title={emotion}
                  >
                    {emotion.charAt(0)}
                  </div>
                ))}
            </div>
          </div>

          {/* Mood chart */}
          <div style={{ marginBottom: "16px", height: "150px" }}>
            <div
              style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}
            >
              Mood Timeline:
            </div>
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10 }}
                  />
                  <YAxis tick={false} domain={[0, 5.5]} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={(props) => {
                      const emotion = props.payload.emotion;
                      return (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={4}
                          fill={emotionColorMap[emotion]}
                          stroke="rgba(0,0,0,0.5)"
                          strokeWidth={1}
                        />
                      );
                    }}
                    activeDot={{ r: 6, fill: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: "4px",
                }}
              >
                Gathering data...
              </div>
            )}
          </div>

          {/* Dominant mood statistics */}
          <div>
            <div
              style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}
            >
              Session Insights:
            </div>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                padding: "8px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              {chartData.length > 0 ? (
                <>
                  <div style={{ marginBottom: "4px" }}>
                    Most frequent:{" "}
                    {getMostFrequentEmotion(timeSeriesRef.current)}
                  </div>
                  <div>
                    Most recent transition:{" "}
                    {getLastTransition(timeSeriesRef.current)}
                  </div>
                </>
              ) : (
                "Collecting mood data..."
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get most frequent emotion
const getMostFrequentEmotion = (timeSeriesData) => {
  if (!timeSeriesData || timeSeriesData.length === 0) return "None";

  const counts = {};
  timeSeriesData.forEach((entry) => {
    counts[entry.emotion] = (counts[entry.emotion] || 0) + 1;
  });

  let maxEmotion = "None";
  let maxCount = 0;

  for (const emotion in counts) {
    if (counts[emotion] > maxCount) {
      maxCount = counts[emotion];
      maxEmotion = emotion;
    }
  }

  return maxEmotion;
};

// Helper function to get last mood transition
const getLastTransition = (timeSeriesData) => {
  if (!timeSeriesData || timeSeriesData.length < 2) return "None yet";

  const lastIndex = timeSeriesData.length - 1;
  const current = timeSeriesData[lastIndex].emotion;

  // Find the last different emotion
  for (let i = lastIndex - 1; i >= 0; i--) {
    if (timeSeriesData[i].emotion !== current) {
      return `${timeSeriesData[i].emotion} → ${current}`;
    }
  }

  return "No changes";
};

export default MoodMonitorPanel;
