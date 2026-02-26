import React from "react";

export default function Toast({ visible, message, type = "success" }) {
  if (!message && !visible) return null;

  return (
    <div className={`toast ${type} ${visible ? "show" : ""}`}>
      {message}
    </div>
  );
}
