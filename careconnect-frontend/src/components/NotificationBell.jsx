import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import api from "../services/api";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const ref = useRef(null);

  const loadNotifications = async () => {
    try {
      const data = await api.notifications.getAll();

      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setEnabled(data.notificationsEnabled !== false);
      }
    } catch (error) {
      console.error("Notification load error:", error);
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const markRead = async (notification) => {
    try {
      if (!notification.read) {
        await api.notifications.markRead(notification._id);

        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id
              ? { ...item, read: true }
              : item
          )
        );

        setUnreadCount((count) => Math.max(0, count - 1));
      }

      if (notification.link) {
        setOpen(false);
        navigate(notification.link);
      }
    } catch (error) {
      console.error("Mark notification read error:", error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.notifications.markAllRead();

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all notifications error:", error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <ThemeToggle />

      <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative w-12 h-12 bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-800 transition"
      >
        <Bell size={22} />

        {enabled && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 w-96 max-w-[calc(100vw-1rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white">
                Notifications
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {enabled
                  ? `${unreadCount} unread notification${
                      unreadCount === 1 ? "" : "s"
                    }`
                  : "Notifications are turned off"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!enabled ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Turn notifications on from Settings to receive new updates.
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification._id}
                  onClick={() => markRead(notification)}
                  className={`w-full text-left px-5 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                    notification.read ? "bg-white dark:bg-slate-900" : "bg-teal-50/50 dark:bg-teal-950/30"
                  }`}
                >
                  <div className="flex gap-3">
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        notification.read
                          ? "bg-slate-300"
                          : "bg-teal-500"
                      }`}
                    />

                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-800 dark:text-white">
                        {notification.title}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {notification.message}
                      </p>

                      <p className="text-[11px] text-slate-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default NotificationBell;
