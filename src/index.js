import React from "react";
import ReactDOM from "react-dom/client";
import "./app.css";
import Timeline from "./components/Timeline/Timeline.jsx";
import items from "./data/timelineItems.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Timeline initialItems={items} />);
