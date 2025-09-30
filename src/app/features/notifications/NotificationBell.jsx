import { useEffect, useRef, useState } from "react";
import styles from "./NotificationBell.module.css";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} from "../../service/notificationsAPI";
import { typeEmoji } from "./mockNotifications";
import { useSelector } from "react-redux";

function timeAgo(iso) {
  const delta = (Date.now() - new Date(iso).getTime()) / 1000;
  if (delta < 60) return `${Math.floor(delta)}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return new Date(iso).toLocaleString();
}

export default function NotificationBell({ className }) {
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, refetch } = useGetNotificationsQuery(user?.id, {
    skip: !user?.id,
    refetchOnMountOrArgChange: true,
  });

  const [markNotificationRead] = useMarkNotificationReadMutation();

  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const notifications = data?.data || [];

  const unread = notifications.filter((n) => !n.attributes.isRead).length;

  useEffect(() => {
    const onDown = (e) => {
      if (open && panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const markAll = async () => {
    for (const n of notifications) {
      if (!n.attributes.isRead) {
        await markNotificationRead({ id: n.id });
      }
    }
    refetch();
  };

  const markRead = async (id, isRead) => {
    if (!isRead) {
      await markNotificationRead({ id });
      refetch();
    }
  };

  const sortedItems = [...notifications].sort(
    (a, b) => new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt)
  );

  return (
    <div className={`${styles.wrapper} ${className || ""}`}>
      <button
        className={styles.bell}
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 24a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 24zm6.36-6V11a6.36 6.36 0 1 0-12.72 0v7L3 19v1h18v-1l-2.64-1z"/>
        </svg>
        {unread > 0 && <span className={styles.badge}>{unread > 99 ? "99+" : unread}</span>}
      </button>

      {open && (
        <div className={styles.dropdown} ref={panelRef} role="menu" aria-label="Notifications list">
          <div className={styles.header}>
            <div className={styles.title}>Notifications</div>
            <button className={styles.link} onClick={markAll}>
              Mark all as read
            </button>
          </div>

          <ul className={styles.list}>
            {isLoading ? (
              <li className={styles.empty}>Loading...</li>
            ) : sortedItems.length === 0 ? (
              <li className={styles.empty}>No notifications</li>
            ) : (
              sortedItems.map((n) => {
                const { type, title, body, link, isRead, createdAt } = n.attributes;
                return (
                  <li
                    key={n.id}
                    className={`${styles.item} ${isRead ? "" : styles.unread}`}
                  >
                    <a
                      className={styles.body}
                      href={link || "#"}
                      onClick={async (e) => {
                        if (!isRead) {
                          e.preventDefault();
                          await markRead(n.id, isRead);
                        }
                      }}
                    >
                      <div className={styles.avatar} aria-hidden="true">
                        {typeEmoji(type)}
                      </div>

                      <div className={styles.text}>
                        <div className={styles.t}>{title}</div>
                        {body && <div className={styles.d}>{body}</div>}
                        <div className={styles.time}>{timeAgo(createdAt)}</div>
                      </div>
                    </a>

                    {!isRead && (
                      <button
                        className={styles.mark}
                        aria-label="Mark as read"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          await markRead(n.id, isRead);
                        }}
                      >
                        ✓
                      </button>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}