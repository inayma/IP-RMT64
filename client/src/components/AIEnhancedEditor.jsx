import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getContentSuggestions } from "../redux/slices/aiSlice";
import { debounce } from "lodash";

function AIEnhancedEditor({
  value,
  onChange,
  placeholder = "Start typing your content...",
  enableSuggestions = true,
  postId = "temp",
}) {
  const dispatch = useDispatch();
  const { suggestions, isLoading } = useSelector((state) => state.ai);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Debounced function to get suggestions
  const debouncedGetSuggestions = useCallback(
    debounce((content) => {
      if (content.length > 20 && enableSuggestions) {
        dispatch(
          getContentSuggestions({
            partialContent: content,
            postId,
          })
        );
      }
    }, 1000),
    [dispatch, postId, enableSuggestions]
  );

  useEffect(() => {
    if (value && value.length > 20) {
      debouncedGetSuggestions(value);
    }
  }, [value, debouncedGetSuggestions]);

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    setCursorPosition(e.target.selectionStart);
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    const newValue = value + " " + suggestion;
    onChange(newValue);
    setShowSuggestions(false);
  };

  const currentSuggestions = suggestions[postId]?.suggestions || [];

  return (
    <div className="ai-enhanced-editor position-relative">
      <div className="form-floating">
        <textarea
          className="form-control"
          id="aiEnhancedTextarea"
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          style={{ minHeight: "200px", resize: "vertical" }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <label htmlFor="aiEnhancedTextarea">Content</label>
      </div>

      {/* AI Suggestions */}
      {showSuggestions && currentSuggestions.length > 0 && (
        <div
          className="card position-absolute mt-2 shadow-sm"
          style={{
            zIndex: 1050,
            width: "100%",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          <div className="card-header py-2">
            <div className="d-flex align-items-center">
              <i className="bi bi-lightbulb me-2 text-warning"></i>
              <small className="text-muted">AI Suggestions</small>
              {isLoading.suggestions && (
                <div
                  className="spinner-border spinner-border-sm ms-2"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
            </div>
          </div>
          <div className="card-body p-0">
            {currentSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="btn btn-link text-start w-100 px-3 py-2 border-0"
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  borderRadius: 0,
                  whiteSpace: "normal",
                  textAlign: "left",
                  fontSize: "0.9rem",
                }}
              >
                <i className="bi bi-plus-circle me-2 text-primary"></i>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Character count and AI indicator */}
      <div className="d-flex justify-content-between mt-2">
        <small className="text-muted">
          {value.length} characters
          {enableSuggestions && (
            <span className="ms-2">
              <i className="bi bi-robot text-primary"></i> AI-assisted
            </span>
          )}
        </small>
        <small className="text-muted">
          {value.length > 20 && enableSuggestions && (
            <span className="text-success">
              <i className="bi bi-check-circle"></i> AI suggestions available
            </span>
          )}
        </small>
      </div>
    </div>
  );
}

export default AIEnhancedEditor;
