import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { 
  FaUserCircle, FaEnvelope, FaPenNib, FaRegEdit, 
  FaSave, FaTimes, FaUniversity, FaBuilding, FaCamera 
} from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";
import { colleges } from "../../common/collegeConstants";


const Card = styled.div`
  padding: 30px;
  max-width: 800px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
`;

const Title = styled.h2`
  font-size: 24px;
  margin: 0;
  color: #333;
  font-weight: 600;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #702082;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UploadOverlay = styled.label`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 35%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const FieldRow = styled.div`
  display: flex;
  gap: 15px;
  align-items: flex-start;
`;

const IconColumn = styled.div`
  width: 40px;
  display: flex;
  justify-content: center;
  padding-top: 5px;
`;

const ContentColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  color: #666;
  font-weight: bold;
  margin-bottom: 8px;
`;

const StyledInput = styled.input`
  padding: 10px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid ${props => props.error ? "#dc3545" : "#ddd"};
  outline: none;
  &:focus {
    border-color: #702082;
  }
`;

const StyledSelect = styled.select`
  padding: 10px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid ${props => props.error ? "#dc3545" : "#ddd"};
  outline: none;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  border: none;
  transition: opacity 0.2s;
  
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }

  svg { margin-right: 7px; }
`;

const SaveBtn = styled(ActionButton)`
  background-color: #28a745;
  color: white;
`;

const EditBtn = styled(ActionButton)`
  background-color: white;
  color: #702082;
  border: 1px solid #702082;
`;

const CancelBtn = styled(ActionButton)`
  background-color: #6c757d;
  color: white;
`;


export default function AccountInfo({ user, setUser }) {
  if (!user) {
    return <Card>Loading user information...</Card>;
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
    memberSince: user?.created_at 
      ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
      : "N/A",
    avatarUrl: user?.profile_picture_url || null
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });
  const availableHalls = colleges.find(c => c.name === tempProfile.college)?.halls || [];

  // Sync state with user prop changes and force edit mode if college is missing
  useEffect(() => {
    if (user) {
      const newProfile = {
        username: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        college: user.college || "",
        hostel: user.hostel || "",
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
      if (name === "college") newState.hostel = "";
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

  // Validate required fields and send multi-part form data to backend
  const handleSave = async () => {
    if (!tempProfile.college) {
      alert("Please select your College before saving.");
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
        setPreviewUrl(null);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Header>
        <Title>Account Information</Title>
        {isEditing ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <SaveBtn onClick={handleSave} disabled={loading}>
              <FaSave /> {loading ? "Saving..." : "Save"}
            </SaveBtn>
            {profile.college && (
              <CancelBtn onClick={() => {
                setIsEditing(false);
                setTempProfile({...profile});
                setPreviewUrl(null);
              }}>
                <FaTimes /> Cancel
              </CancelBtn>
            )}
          </div>
        ) : (
          <EditBtn onClick={() => setIsEditing(true)}>
            <FaRegEdit /> Edit Profile
          </EditBtn>
        )}
      </Header>

      <InfoContainer>
        <AvatarRow>
          <AvatarWrapper>
            {previewUrl || profile.avatarUrl ? (
              <AvatarImage src={previewUrl || profile.avatarUrl} alt="Avatar" />
            ) : (
              <FaUserCircle style={{ fontSize: "80px", color: "#ccc" }} />
            )}
            {isEditing && (
              <UploadOverlay>
                <FaCamera style={{ color: "#fff", fontSize: "20px" }} />
                <input type="file" hidden onChange={handleFileChange} accept="image/*" />
              </UploadOverlay>
            )}
          </AvatarWrapper>
          <div>
            {isEditing ? (
              <StyledInput name="username" value={tempProfile.username} onChange={handleChange} placeholder="Enter name" />
            ) : (
              <h3 style={{ margin: "0 0 5px 0" }}>{profile.username}</h3>
            )}
            <p style={{ fontSize: "14px", color: "#888", display: "flex", alignItems: "center", gap: "5px", margin: 0 }}>
              <MdOutlineDateRange /> Joined {profile.memberSince}
            </p>
          </div>
        </AvatarRow>

        <hr style={{ border: "0.5px solid #eee", margin: "10px 0" }} />

        <FieldRow>
          <IconColumn><FaEnvelope style={{ color: "#702082" }} /></IconColumn>
          <ContentColumn>
            <Label>Email Address</Label>
            <p style={{ margin: 0 }}>{profile.email}</p>
          </ContentColumn>
        </FieldRow>

        <FieldRow>
          <IconColumn><FaUniversity style={{ color: "#702082" }} /></IconColumn>
          <ContentColumn>
            <Label>College</Label>
            {isEditing ? (
              <StyledSelect 
                error={!tempProfile.college}
                name="college" 
                value={tempProfile.college} 
                onChange={handleChange}
              >
                <option value="">-- Select College --</option>
                {colleges.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </StyledSelect>
            ) : (
              <p style={{ margin: 0 }}>{profile.college || "Not set"}</p>
            )}
          </ContentColumn>
        </FieldRow>

        <FieldRow>
          <IconColumn><FaBuilding style={{ color: "#702082" }} /></IconColumn>
          <ContentColumn>
            <Label>Hostel</Label>
            {isEditing ? (
              <StyledSelect 
                name="hostel" 
                value={tempProfile.hostel} 
                onChange={handleChange}
                disabled={!tempProfile.college}
              >
                <option value="">Select Hostel</option>
                {availableHalls.map(hall => <option key={hall} value={hall}>{hall}</option>)}
              </StyledSelect>
            ) : (
              <p style={{ margin: 0 }}>{profile.hostel || "Not set"}</p>
            )}
          </ContentColumn>
        </FieldRow>

        <FieldRow>
          <IconColumn><FaPenNib style={{ color: "#702082" }} /></IconColumn>
          <ContentColumn>
            <Label>Bio</Label>
            {isEditing ? (
              <StyledInput 
                as="textarea" 
                style={{ height: "80px", resize: "none" }} 
                name="bio" 
                value={tempProfile.bio} 
                onChange={handleChange} 
                placeholder="Tell us about yourself..." 
              />
            ) : (
              <p style={{ margin: 0, fontStyle: profile.bio ? "normal" : "italic" }}>
                {profile.bio || "No bio yet."}
              </p>
            )}
          </ContentColumn>
        </FieldRow>
      </InfoContainer>
    </Card>
  );
}