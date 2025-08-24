import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  generatePostSummary,
  generate5W1H,
  generateComparison,
  generateAllAnalyses,
} from "../redux/slices/aiSlice";

function AIAnalysisTabs({ postId, postTitle }) {
  const dispatch = useDispatch();
  const { summaries, analyses, comparisons, isLoading, error, aiFeatures } =
    useSelector((state) => state.ai);

  const [activeTab, setActiveTab] = useState("summary");

  const handleTabClick = async (tabType) => {
    setActiveTab(tabType);

    // If data already exists, don't refetch
    if (getAIData(tabType)) return;

    switch (tabType) {
      case "summary":
        if (aiFeatures.summarization) {
          dispatch(generatePostSummary({ postId }));
        }
        break;
      case "analysis":
        if (aiFeatures.analysis5W1H) {
          dispatch(generate5W1H({ postId }));
        }
        break;
      case "comparison":
        if (aiFeatures.marketComparison) {
          dispatch(generateComparison({ postId }));
        }
        break;
    }
  };

  const getAIData = (tabType) => {
    switch (tabType) {
      case "summary":
        return summaries[postId];
      case "analysis":
        return analyses[postId];
      case "comparison":
        return comparisons[postId];
      default:
        return null;
    }
  };

  const handleGenerateAll = () => {
    if (aiFeatures.allAnalyses) {
      dispatch(generateAllAnalyses({ postId }));
    }
  };

  const renderContent = () => {
    const currentLoading = isLoading[activeTab];
    const currentData = getAIData(activeTab);

    if (currentLoading) {
      return (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "200px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-3">Generating AI analysis...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger" role="alert">
          <h6 className="alert-heading">Analysis Failed</h6>
          <p className="mb-0">{error}</p>
          <hr />
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => handleTabClick(activeTab)}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!currentData) {
      return (
        <div
          className="text-center"
          style={{ minHeight: "200px", paddingTop: "80px" }}
        >
          <i className="bi bi-robot fs-1 text-muted"></i>
          <p className="text-muted mt-3">Click to generate AI analysis</p>
        </div>
      );
    }

    return (
      <div className="ai-analysis-content">
        <div
          className="analysis-text"
          style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}
        >
          {activeTab === "summary"
            ? currentData.summary
            : activeTab === "analysis"
            ? currentData.analysis
            : activeTab === "comparison"
            ? currentData.comparison
            : "No data available"}
        </div>
      </div>
    );
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <i className="bi bi-robot me-2 text-primary"></i>
            <h5 className="mb-0">AI Analysis for "{postTitle}"</h5>
          </div>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={handleGenerateAll}
            disabled={isLoading.allAnalyses}
          >
            {isLoading.allAnalyses ? (
              <>
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></div>
                Generating All...
              </>
            ) : (
              <>
                <i className="bi bi-lightning me-2"></i>
                Generate All
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="card-body p-0">
        <ul className="nav nav-tabs nav-fill" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "summary" ? "active" : ""}`}
              type="button"
              onClick={() => handleTabClick("summary")}
            >
              <i className="bi bi-file-text me-2"></i>
              AI Summary
              {isLoading.summary && (
                <div
                  className="spinner-border spinner-border-sm ms-2"
                  role="status"
                ></div>
              )}
            </button>
          </li>

          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "analysis" ? "active" : ""}`}
              type="button"
              onClick={() => handleTabClick("analysis")}
            >
              <i className="bi bi-question-circle me-2"></i>
              5W1H Analysis
              {isLoading.analysis && (
                <div
                  className="spinner-border spinner-border-sm ms-2"
                  role="status"
                ></div>
              )}
            </button>
          </li>

          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${
                activeTab === "comparison" ? "active" : ""
              }`}
              type="button"
              onClick={() => handleTabClick("comparison")}
            >
              <i className="bi bi-bar-chart me-2"></i>
              Market Comparison
              {isLoading.comparison && (
                <div
                  className="spinner-border spinner-border-sm ms-2"
                  role="status"
                ></div>
              )}
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content p-4">
          <div className="tab-pane fade show active">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default AIAnalysisTabs;
