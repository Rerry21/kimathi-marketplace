import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchConversations, fetchThread, sendMessage } from "../services/messages";
import { useIsMobile } from "../hooks/useIsMobile";
import { colors, fonts, radius } from "../theme";

function getStyles(isMobile) {
  return {
    container: {
      maxWidth: "1000px",
      margin: "0 auto",
      padding: isMobile ? "1.25rem" : "2.5rem",
      display: isMobile ? "block" : "grid",
      gridTemplateColumns: isMobile ? undefined : "280px 1fr",
      gap: isMobile ? 0 : "1.5rem",
      minHeight: "500px",
    },
    threadList: {
      borderRight: isMobile ? "none" : `1px solid ${colors.border}`,
      paddingRight: isMobile ? 0 : "1.25rem",
    },
    threadItem: (active) => ({
      padding: "0.85rem",
      borderRadius: radius.sm,
      backgroundColor: active ? colors.accentMuted : "transparent",
      cursor: "pointer",
      marginBottom: "0.4rem",
    }),
    threadName: {
      fontFamily: fonts.body,
      fontWeight: 600,
      fontSize: "0.92rem",
      color: colors.text,
    },
    threadListing: {
      fontFamily: fonts.body,
      fontSize: "0.78rem",
      color: colors.textMuted,
      marginTop: "0.15rem",
    },
    chatPanel: {
      display: "flex",
      flexDirection: "column",
    },
    backBtn: {
      display: "flex",
      alignItems: "center",
      gap: "0.4rem",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: fonts.body,
      fontSize: "0.9rem",
      color: colors.accent,
      marginBottom: "1rem",
      padding: 0,
    },
    chatHeader: {
      fontFamily: fonts.body,
      fontWeight: 600,
      fontSize: "1rem",
      color: colors.text,
      marginBottom: "1rem",
    },
    messageList: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "0.6rem",
      maxHeight: isMobile ? "60vh" : "420px",
      overflowY: "auto",
      paddingRight: "0.25rem",
    },
    messageGroup: (mine) => ({
      display: "flex",
      flexDirection: "column",
      alignItems: mine ? "flex-end" : "flex-start",
    }),
    bubble: (mine) => ({
      backgroundColor: mine ? colors.accent : colors.surface,
      color: mine ? "#FFFFFF" : colors.text,
      border: mine ? "none" : `1px solid ${colors.border}`,
      padding: "0.6rem 0.9rem",
      borderRadius: radius.md,
      fontFamily: fonts.body,
      fontSize: "0.9rem",
      maxWidth: isMobile ? "85%" : "70%",
    }),
    timestamp: {
      fontFamily: fonts.body,
      fontSize: "0.7rem",
      color: colors.textMuted,
      marginTop: "0.2rem",
      padding: "0 0.2rem",
    },
    inputRow: {
      display: "flex",
      gap: "0.6rem",
      marginTop: "1rem",
    },
    input: {
      flex: 1,
      padding: "0.65rem 0.9rem",
      borderRadius: radius.sm,
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.surface,
      color: colors.text,
      fontFamily: fonts.body,
      fontSize: "0.9rem",
    },
    sendBtn: (disabled) => ({
      padding: "0.65rem 1.1rem",
      borderRadius: radius.sm,
      backgroundColor: disabled ? colors.border : colors.accent,
      color: disabled ? colors.textMuted : "#FFFFFF",
      border: "none",
      fontFamily: fonts.body,
      fontSize: "0.9rem",
      cursor: disabled ? "not-allowed" : "pointer",
    }),
    errorText: {
      fontFamily: fonts.body,
      fontSize: "0.82rem",
      color: colors.danger,
      marginTop: "0.5rem",
    },
    empty: {
      fontFamily: fonts.body,
      color: colors.textMuted,
      padding: "2.5rem",
      textAlign: "center",
    },
  };
}

function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (isToday) return time;

  const isThisYear = date.getFullYear() === now.getFullYear();
  const dateLabel = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: isThisYear ? undefined : "numeric",
  });

  return `${dateLabel}, ${time}`;
}

function Messages() {
  const { user, token } = useAuth();
  const isMobile = useIsMobile();
  const styles = getStyles(isMobile);

  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [mobileView, setMobileView] = useState("list");
  const messageListRef = useRef(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchConversations(token)
      .then((data) => {
        setConversations(data);
        if (data.length > 0 && !isMobile) setActive(data[0]);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!active || !token) return;

    function loadThread() {
      fetchThread(active.listing_id, active.other_user_id, token).then(setThread);
    }

    loadThread();
    const interval = setInterval(loadThread, 4000);
    return () => clearInterval(interval);
  }, [active, token]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [thread]);

  function openConversation(conv) {
    setActive(conv);
    setMobileView("chat");
  }

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !active || sending) return;

    setSending(true);
    setSendError("");
    try {
      const newMessage = await sendMessage(
        {
          listing_id: active.listing_id,
          receiver_id: active.other_user_id,
          body: trimmed,
        },
        token
      );
      setThread((prev) => [...prev, newMessage]);
      setDraft("");
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (!user) {
    return <p style={styles.empty}>Please log in to see your messages.</p>;
  }

  if (loading) {
    return <p style={styles.empty}>Loading conversations...</p>;
  }

  if (conversations.length === 0) {
    return (
      <p style={styles.empty}>
        No conversations yet. Message a seller from a listing to start one.
      </p>
    );
  }

  const canSend = draft.trim().length > 0 && !sending;
  const showList = !isMobile || mobileView === "list";
  const showChat = !isMobile || mobileView === "chat";

  return (
    <div style={styles.container}>
      {showList && (
        <div style={styles.threadList}>
          {conversations.map((conv) => (
            <div
              key={`${conv.listing_id}-${conv.other_user_id}`}
              style={styles.threadItem(
                active &&
                  active.listing_id === conv.listing_id &&
                  active.other_user_id === conv.other_user_id &&
                  !isMobile
              )}
              onClick={() => openConversation(conv)}
            >
              <p style={styles.threadName}>{conv.other_user_name}</p>
              <p style={styles.threadListing}>{conv.listing_title}</p>
            </div>
          ))}
        </div>
      )}

      {showChat && active && (
        <div style={styles.chatPanel}>
          {isMobile && (
            <button style={styles.backBtn} onClick={() => setMobileView("list")}>
              ← Back to conversations
            </button>
          )}
          <p style={styles.chatHeader}>
            {active.other_user_name} · {active.listing_title}
          </p>
          <div style={styles.messageList} ref={messageListRef}>
            {thread.map((msg) => {
              const mine = msg.sender_id === user.id;
              return (
                <div key={msg.id} style={styles.messageGroup(mine)}>
                  <div style={styles.bubble(mine)}>{msg.body}</div>
                  <span style={styles.timestamp}>{formatTime(msg.created_at)}</span>
                </div>
              );
            })}
          </div>
          <form style={styles.inputRow} onSubmit={handleSend}>
            <input
              style={styles.input}
              type="text"
              placeholder="Type a message"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" style={styles.sendBtn(!canSend)} disabled={!canSend}>
              {sending ? "..." : "Send"}
            </button>
          </form>
          {sendError && <p style={styles.errorText}>{sendError}</p>}
        </div>
      )}
    </div>
  );
}

export default Messages;