import React, { useState } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import styles from "./Modal.module.css";

interface Props {
  onClose: () => void;
  onCreate: (name: string, description: string, type: string) => Promise<void>;
}

const CreateGroupModal = ({ onClose, onCreate }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState(CometChat.GROUP_TYPE.PUBLIC);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) { setError("Channel name is required"); return; }
    setLoading(true);
    setError("");
    try {
      await onCreate(name.trim(), description.trim(), type);
    } catch (e: any) {
      setError(e?.message || "Failed to create channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Create a Channel</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Channel Name *</label>
            <div className={styles.inputWithPrefix}>
              <span className={styles.inputPrefix}>#</span>
              <input
                className={styles.input}
                placeholder="e.g. general"
                value={name}
                onChange={(e) => setName(e.target.value.replace(/\s+/g, "-").toLowerCase())}
                autoFocus
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Description</label>
            <textarea
              className={styles.textarea}
              placeholder="What's this channel about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Type</label>
            <div className={styles.typeGrid}>
              <button
                className={`${styles.typeBtn} ${type === CometChat.GROUP_TYPE.PUBLIC ? styles.typeBtnActive : ""}`}
                onClick={() => setType(CometChat.GROUP_TYPE.PUBLIC)}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9 2c-1.5 2-2.5 4.5-2.5 7s1 5 2.5 7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9 2c1.5 2 2.5 4.5 2.5 7s-1 5-2.5 7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 9h14" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <div>
                  <div className={styles.typeName}>Public</div>
                  <div className={styles.typeDesc}>Anyone can join</div>
                </div>
              </button>
              <button
                className={`${styles.typeBtn} ${type === CometChat.GROUP_TYPE.PRIVATE ? styles.typeBtnActive : ""}`}
                onClick={() => setType(CometChat.GROUP_TYPE.PRIVATE)}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="3" y="8" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div>
                  <div className={styles.typeName}>Private</div>
                  <div className={styles.typeDesc}>Invite only</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className={styles.createBtn} onClick={handleCreate} disabled={loading || !name.trim()}>
            {loading ? <span className={styles.spinner} /> : "Create Channel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
