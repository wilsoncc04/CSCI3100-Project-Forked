import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserCircle, FaEnvelope, FaPenNib, FaRegEdit, FaSave, FaTimes, FaUniversity, FaBuilding, FaCamera } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";
import { colleges } from "../../common/collegeConstants";

export default function AccountInfo({ user, setUser }) {
  if (!user) {
    return <div style={{ padding: "20px" }}>Loading user information...</div>;
  }
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [profile, setProfile] = useState({
    username: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    college: user?.college || "",
    hostel: user?.hostel || "",
    memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "N/A",
    avatarUrl: user?.profile_picture_url || null
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });
  const availableHalls = colleges.find(c => c.name === tempProfile.college)?.halls || [];
 useEffect(() => {
  if (user) {
    const newProfile = {
      username: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
      college: user.college || "",
      hostel: user.hostel || "",
      // 加上安全檢查：如果沒有 created_at，給予一個預設值
      memberSince: user.created_at 
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
        : "N/A",
      avatarUrl: user.profile_picture_url || null
    };
    setProfile(newProfile);
    setTempProfile(newProfile);
    if (!user.college) setIsEditing(true);
  }
}, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => {
      const newState = { ...prev, [name]: value };
      // 重點：如果更換了 College，就把原本選的 Hostel 清空，避免書院與宿舍不匹配
      if (name === "college") {
        newState.hostel = "";
      }
      return newState;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!tempProfile.college) {
      alert("Please select your College.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("user[name]", tempProfile.username);
    formData.append("user[bio]", tempProfile.bio);
    formData.append("user[college]", tempProfile.college);
    formData.append("user[hostel]", tempProfile.hostel);
    if (selectedFile) formData.append("profile_picture", selectedFile);
    
    try {
      const response = await axios.patch(`/users/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        setProfile({ ...tempProfile, avatarUrl: response.data.profile_picture_url || tempProfile.avatarUrl });
        if (setUser) setUser(response.data);
        setIsEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
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
            {profile.college && (
              <button onClick={() => setIsEditing(false)} style={styles.cancelBtn}>
                <FaTimes style={styles.btnIcon} /> Cancel
              </button>
            )}
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
            <FaRegEdit style={styles.btnIcon} /> Edit Profile
          </button>
        )}
      </div>

      <div style={styles.infoContainer}>
        <div style={styles.avatarRow}>
          <div style={{ position: "relative" }}>
            {previewUrl || profile.avatarUrl ? (
              <img src={previewUrl || profile.avatarUrl} alt="Avatar" style={styles.avatarImage} />
            ) : (
              <FaUserCircle style={styles.avatarIcon} />
            )}
            {isEditing && (
              <label style={styles.uploadOverlay}>
                <FaCamera />
                <input type="file" hidden onChange={handleFileChange} accept="image/*" />
              </label>
            )}
          </div>
          <div>
            {isEditing ? (
              <input style={styles.inputUsername} name="username" value={tempProfile.username} onChange={handleChange} />
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
          <div style={styles.iconColumn}><FaEnvelope style={styles.fieldIcon} /></div>
          <div style={styles.contentColumn}>
            <label style={styles.label}>Email Address</label>
            <p style={styles.value}>{profile.email}</p>
          </div>
        </div>

        {/* College Dropdown */}
        <div style={styles.fieldRow}>
          <div style={styles.iconColumn}><FaUniversity style={styles.fieldIcon} /></div>
          <div style={styles.contentColumn}>
            <label style={styles.label}>College (Must)</label>
            {isEditing ? (
              <select style={styles.input} name="college" value={tempProfile.college} onChange={handleChange}>
                <option value="">Select College</option>
                {colleges.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            ) : (
              <p style={styles.value}>{profile.college || "Not set"}</p>
            )}
          </div>
        </div>

        {/* Hostel Dropdown (依據 College 變動) */}
        <div style={styles.fieldRow}>
          <div style={styles.iconColumn}><FaBuilding style={styles.fieldIcon} /></div>
          <div style={styles.contentColumn}>
            <label style={styles.label}>Hostel (Optional)</label>
            {isEditing ? (
              <select 
                style={styles.input} 
                name="hostel" 
                value={tempProfile.hostel} 
                onChange={handleChange}
                disabled={!tempProfile.college} // 沒選書院前不能選宿舍
              >
                <option value="">Select Hostel</option>
                {availableHalls.map(hall => <option key={hall} value={hall}>{hall}</option>)}
              </select>
            ) : (
              <p style={styles.value}>{profile.hostel || "Not set"}</p>
            )}
          </div>
        </div>

        <div style={styles.fieldRow}>
          <div style={styles.iconColumn}><FaPenNib style={styles.fieldIcon} /></div>
            <div style={styles.contentColumn}>
             <label style={styles.label}>Bio</label>
              {isEditing ? (
               <textarea style={{ ...styles.input, height: "80px", resize: "none" }} name="bio" value={tempProfile.bio} onChange={handleChange} />
               ) : (
               <p style={{ ...styles.valueBio, fontStyle: profile.bio ? "normal" : "italic" }}>
                 {profile.bio || "No bio yet."}
               </p>
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