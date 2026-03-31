import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserCircle, FaEnvelope, FaPenNib, FaRegEdit, FaSave, FaTimes } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";

export default function AccountInfo({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    username: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "N/A",
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });

  useEffect(() => {
    if (user) {
      const newProfile = {
        username: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        memberSince: new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };
      setProfile(newProfile);
      setTempProfile(newProfile);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setTempProfile({ ...profile });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.patch(`/users/${user.id}`, {
        user: {
          name: tempProfile.username,
          bio: tempProfile.bio
        }
      });

      if (response.status === 200) {
        setProfile({ ...tempProfile });
        setIsEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert(error.response?.data?.message || "Update failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Account Information</h2>
        {isEditing ? (
          <div style={styles.headerBtnGroup}>
            <button onClick={handleSave} style={styles.saveBtn} disabled={loading}>
              <FaSave style={styles.btnIcon} /> {loading ? "Saving..." : "Save"}
            </button>
            <button onClick={handleCancel} style={styles.cancelBtn} disabled={loading}>
              <FaTimes style={styles.btnIcon} /> Cancel
            </button>
          </div>
        ) : (
          <button onClick={handleEdit} style={styles.editBtn}>
            <FaRegEdit style={styles.btnIcon} /> Edit Profile
          </button>
        )}
      </div>

      <div style={styles.infoContainer}>
        <div style={styles.avatarRow}>
          <FaUserCircle style={styles.avatarIcon} />
          <div>
            {isEditing ? (
              <input
                style={styles.inputUsername}
                name="username"
                value={tempProfile.username}
                onChange={handleChange}
                placeholder="Username"
              />
            ) : (
              <p style={styles.valueUsername}>{profile.username}</p>
            )}
            <p style={styles.joinDate}>
              <MdOutlineDateRange style={styles.smallIcon} /> Joined {profile.memberSince}
            </p>
          </div>
        </div>

        <hr style={styles.divider} />

        <div style={styles.fieldRow}>
          <div style={styles.iconColumn}>
            <FaEnvelope style={styles.fieldIcon} />
          </div>
          <div style={styles.contentColumn}>
            <label style={styles.label}>Email Address</label>
            <p style={styles.value}>{profile.email}</p>
          </div>
        </div>

        <div style={styles.fieldRow}>
          <div style={styles.iconColumn}>
            <FaPenNib style={styles.fieldIcon} />
          </div>
          <div style={styles.contentColumn}>
            <label style={styles.label}>Bio</label>
            {isEditing ? (
              <textarea
                style={{ ...styles.input, height: "100px", resize: "none" }}
                name="bio"
                value={tempProfile.bio}
                onChange={handleChange}
              />
            ) : (
              <p style={styles.valueBio}>{profile.bio || "No bio yet."}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: "30px",
    maxWidth: "800px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    borderBottom: "1px solid #eee",
    paddingBottom: "15px",
  },
  title: {
    fontSize: "24px",
    margin: 0,
    color: "#333",
    fontWeight: "600",
  },
  infoContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  avatarRow: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  avatarIcon: {
    fontSize: "70px",
    color: "#ccc",
  },
  valueUsername: {
    fontSize: "22px",
    fontWeight: "bold",
    margin: "0 0 5px 0",
    color: "#1a1a1a",
  },
  inputUsername: {
    fontSize: "20px",
    fontWeight: "bold",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "250px",
  },
  joinDate: {
    fontSize: "14px",
    color: "#888",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  divider: {
    border: "0.5px solid #eee",
    margin: "10px 0",
  },
  fieldRow: {
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
  },
  iconColumn: {
    width: "40px",
    display: "flex",
    justifyContent: "center",
    paddingTop: "5px", 
  },
  fieldIcon: {
    fontSize: "20px",
    color: "#702082", 
  },
  contentColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  value: {
    fontSize: "16px",
    color: "#333",
    margin: 0,
    padding: "5px 0",
  },
  valueBio: {
    fontSize: "15px",
    color: "#555",
    margin: 0,
    lineHeight: "1.6",
    fontStyle: profile => (profile.bio ? "normal" : "italic"),
  },
  smallIcon: {
    fontSize: "16px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    outline: "none",
    transition: "border-color 0.2s",
    "&:focus": {
      borderColor: "#702082",
    },
  },
  headerBtnGroup: {
    display: "flex",
    gap: "10px",
  },
  btnIcon: {
    marginRight: "7px",
  },
  editBtn: {
    padding: "8px 16px",
    backgroundColor: "white",
    color: "#702082",
    border: "1px solid #702082",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
  },
  saveBtn: {
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
  },
  cancelBtn: {
    padding: "8px 16px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
  },
};