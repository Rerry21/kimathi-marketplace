import { useState, useRef } from "react";
import { colors, fonts, radius } from "../theme";

const styles = {
  zone: (dragging) => ({
    border: `2px dashed ${dragging ? colors.accent : colors.border}`,
    borderRadius: radius.md,
    padding: "1.5rem",
    textAlign: "center",
    backgroundColor: dragging ? colors.accentMuted : colors.surface,
    cursor: "pointer",
    transition: "background-color 0.15s ease, border-color 0.15s ease",
  }),
  zoneText: {
    fontFamily: fonts.body,
    fontSize: "0.9rem",
    color: colors.textMuted,
  },
  zoneHint: {
    fontFamily: fonts.body,
    fontSize: "0.78rem",
    color: colors.textMuted,
    marginTop: "0.25rem",
  },
  hiddenInput: {
    display: "none",
  },
  previewGrid: {
    display: "flex",
    gap: "0.6rem",
    flexWrap: "wrap",
    marginTop: "0.9rem",
  },
  previewWrap: {
    position: "relative",
    width: "72px",
    height: "72px",
  },
  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
  },
  removeBtn: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: colors.danger,
    color: "#FFFFFF",
    border: "none",
    fontSize: "0.7rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
};

function PhotoDropzone({ files, onFilesChange, maxFiles = 5 }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function addFiles(newFiles) {
    const combined = [...files, ...Array.from(newFiles)].slice(0, maxFiles);
    onFilesChange(combined);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function handleInputChange(e) {
    addFiles(e.target.files);
    e.target.value = "";
  }

  function removeFile(index) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        style={styles.zone(dragging)}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <p style={styles.zoneText}>Drag photos here, or click to browse</p>
        <p style={styles.zoneHint}>
          {files.length}/{maxFiles} added
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={styles.hiddenInput}
          onChange={handleInputChange}
        />
      </div>

      {files.length > 0 && (
        <div style={styles.previewGrid}>
          {files.map((file, i) => (
            <div key={i} style={styles.previewWrap}>
              <img
                src={URL.createObjectURL(file)}
                alt={`Photo ${i + 1}`}
                style={styles.previewImg}
              />
              <button
                type="button"
                style={styles.removeBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PhotoDropzone;