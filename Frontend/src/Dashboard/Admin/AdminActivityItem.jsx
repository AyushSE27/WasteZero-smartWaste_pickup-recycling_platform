import {
  FaBell,
  FaClipboardList,
  FaRecycle,
  FaUserEdit,
  FaUserShield,
} from "react-icons/fa";

const iconByType = {
  pickup_created: FaClipboardList,
  pickup_completed: FaRecycle,
  pickup_assigned: FaClipboardList,
  pickup_status_updated: FaClipboardList,
  user_edited: FaUserEdit,
  user_blocked: FaUserShield,
  user_unblocked: FaUserShield,
  user_suspended: FaUserShield,
  user_unsuspended: FaUserShield,
};

const AdminActivityItem = ({ activity }) => {
  const Icon = iconByType[activity.type] || FaBell;

  return (
    <article className="activity-item">
      <div className="activity-icon-shell">
        <Icon />
      </div>
      <div className="activity-main">
        <div className="activity-desc">{activity.description}</div>
        <div className="activity-meta">
          <span className="activity-user">{activity.userName || "System"}</span>
          {activity.requestId ? (
            <span className="activity-req">Request: {activity.requestId}</span>
          ) : null}
        </div>
      </div>
      <time className="activity-time">
        {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ""}
      </time>
    </article>
  );
};

export default AdminActivityItem;