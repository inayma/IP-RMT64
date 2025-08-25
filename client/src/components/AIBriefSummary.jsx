import { useState, useEffect } from "react";

export default function AIBriefSummary({ summary, isDetailView = false }) {
  // Function to get the first sentence for homepage preview
  const getFirstSentence = (text) => {
    if (!text) return "";

    // Find the first sentence ending with period, exclamation, or question mark
    const firstSentenceMatch = text.match(/^[^.!?]*[.!?]/);
    if (firstSentenceMatch) {
      return firstSentenceMatch[0].trim();
    }

    // If no sentence ending found, take first 150 characters
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  // For homepage - show only first sentence as preview
  if (!isDetailView) {
    const briefText = getFirstSentence(summary);

    return (
      <p className="card-text text-muted">
        <i className="bi bi-robot me-1"></i>
        <strong>AI Summary:</strong> {briefText}
      </p>
    );
  }

  // For detail view - show full detailed AI summary
  if (!summary) return null;

  return (
    <div className="alert alert-info mb-3">
      <div className="d-flex align-items-start">
        <i className="bi bi-robot me-2 mt-1" style={{ fontSize: "1.2rem" }}></i>
        <div className="flex-grow-1">
          <h6 className="alert-heading mb-2">
            <strong>AI Analysis</strong>
          </h6>
          <div
            className="mb-0"
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
              fontSize: "0.95rem",
            }}
          >
            {summary}
          </div>
        </div>
      </div>
    </div>
  );
}
