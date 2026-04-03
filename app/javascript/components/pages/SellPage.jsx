import React, { useState } from "react";
import { goodsTypes } from "../../common/productConstants";
import { useNavigate } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import styled from "styled-components";

const PageContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
`;

const PageTitle = styled.h2`
  /* Default h2 styles */
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const UploadDropzone = styled.div`
  border: ${(props) => (props.$isDragging ? "2px dashed #0066cc" : "2px dashed #ccc")};
  background-color: ${(props) => (props.$isDragging ? "#e6f2ff" : "transparent")};
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
`;

const UploadLabel = styled.label`
  cursor: pointer;
  display: block;
  width: 100%;
  height: 100%;
`;

const UploadText = styled.span`
  color: ${(props) => (props.$isDragging ? "#0066cc" : "#444")};
  font-weight: ${(props) => (props.$isDragging ? "bold" : "normal")};
`;

const HiddenInput = styled.input`
  display: none;
`;

const SelectedCountText = styled.p`
  margin-top: 10px;
  color: #28a745;
  font-weight: bold;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 1rem;
`;

const PreviewBox = styled.div`
  position: relative;
  padding-top: 100%;
`;

const PreviewImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const FormGroup = styled.div`
  /* Wrapper for form fields */
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #444;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  outline-color: #0066cc;
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  outline-color: #0066cc;
  resize: vertical;
  min-height: ${(props) => props.$minHeight || "auto"};
`;

const DropdownWrapper = styled.div`
  position: relative;
`;

const DropdownToggle = styled.button`
  width: 100%;
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: white;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DropdownSelectedText = styled.span`
  color: ${(props) => (props.$hasSelection ? "#333" : "#888")};
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  padding-top: 5px;
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  z-index: 1000;
  max-height: 250px;
  overflow-y: auto;
`;

const DropdownOption = styled.button`
  width: 100%;
  padding: 10px 15px;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
  background-color: ${(props) => (props.$isActive ? "#e6f2ff" : "transparent")};
  color: ${(props) => (props.$isActive ? "#0066cc" : "#333")};

  &:hover {
    background-color: ${(props) => (props.$isActive ? "#e6f2ff" : "#f5f5f5")};
  }
`;

const ConditionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
`;

const ConditionOption = styled.button`
  width: 100%;
  padding: 0.8rem 0.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  text-align: center;
  border: ${(props) => (props.$isActive ? "2px solid #0066cc" : "2px solid #e0e0e0")};
  background-color: ${(props) => (props.$isActive ? "#e6f2ff" : "#fff")};
  color: ${(props) => (props.$isActive ? "#0066cc" : "#555")};
`;

const PromoSection = styled.div`
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #eee;
`;

const PromoCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  cursor: pointer;
`;

const PromoSubLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 1rem;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: #e4e4e4;
  }
`;

const ConfirmButton = styled.button`
  flex: 1;
  padding: 1rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 4px 6px rgba(0, 102, 204, 0.2);

  &:hover {
    background-color: #0052a3;
  }
`;

export default function SellPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    contact: "",
    location: "",
    category_id: "",
    condition: "Brand New",
    status: "available",
    promote_to_community: false,
    community_description: "",
  });

  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const conditionOptions = [
    { id: "brand_new", label: "Brand New" },
    { id: "like_new", label: "Like New" },
    { id: "used_good", label: "Used - Good" },
    { id: "heavily_used", label: "Heavily Used" },
  ];

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages((prevImages) => [...prevImages, ...newFiles]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setImages((prevImages) => [...prevImages, ...newFiles]);
      e.dataTransfer.clearData();
    }
  };

  const handleConditionSelect = (conditionLabel) => {
    setFormData({ ...formData, condition: conditionLabel });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append("product[name]", formData.name);
    payload.append("product[description]", formData.description);
    payload.append("product[price]", formData.price);
    payload.append("product[status]", formData.status);
    payload.append("product[condition]", formData.condition);
    payload.append("product[contact]", formData.contact);
    payload.append("product[location]", formData.location || "CUHK");
    const categoryId = goodsTypes.indexOf(formData.category_id) + 1;
    payload.append("product[category_id]", categoryId);

    if (formData.promote_to_community) {
      payload.append("promote_to_community", "true");
      payload.append("community_description", formData.community_description);
    }

    images.forEach((image, index) => {
      payload.append("images[]", image);
    });
    try {
      const response = await fetch("/products", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: payload,
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();

        if (response.ok) {
          alert("Product listed successfully!");
          setFormData({
            name: "",
            description: "",
            price: "",
            contact: "",
            location: "",
            category_id: 1,
            condition: "Brand New",
          });
          setImages([]);
        } else if (response.status === 422) {
          alert(`Validation Error: ${data.errors.join(", ")}`);
          {
            const errorData = await response.json();
          }
        } else {
          alert(`Error ${response.status}: ${data.error || "Unknown error"}`);
        }
      } else {
        const text = await response.text();
        console.error("Received non-JSON response:", text);
        alert("Server returned HTML instead of JSON. Are you logged in?");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  return (
    <PageContainer>
      <PageTitle>Sell an Item</PageTitle>
      <StyledForm onSubmit={handleSubmit}>
        <UploadDropzone
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          $isDragging={isDragging}
        >
          <UploadLabel>
            <UploadText $isDragging={isDragging}>
              {isDragging ? "Drop images here!" : "Upload Photos (Click or Drag & Drop)"}
            </UploadText>
            <HiddenInput
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
          </UploadLabel>
          {images.length > 0 && (
            <SelectedCountText>{images.length} file(s) selected</SelectedCountText>
          )}
        </UploadDropzone>

        {images.length > 0 && (
          <PreviewGrid>
            {images.map((file, index) => (
              <PreviewBox key={index}>
                <PreviewImage src={URL.createObjectURL(file)} alt={`preview-${index}`} />
                <RemoveImageButton
                  type="button"
                  onClick={() => {
                    setImages(images.filter((_, i) => i !== index));
                  }}
                >
                  <AiOutlineClose size={16} />
                </RemoveImageButton>
              </PreviewBox>
            ))}
          </PreviewGrid>
        )}

        <FormGroup>
          <FormLabel htmlFor="name">Product Name</FormLabel>
          <FormInput
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Intro to Calculus Textbook"
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Category (Optional)</FormLabel>
          <DropdownWrapper
            onMouseEnter={() => setIsCategoryOpen(true)}
            onMouseLeave={() => setIsCategoryOpen(false)}
          >
            <DropdownToggle type="button">
              <DropdownSelectedText $hasSelection={!!formData.category_id}>
                {formData.category_id || "Select a category"}
              </DropdownSelectedText>
              <span>{isCategoryOpen ? "▴" : "▾"}</span>
            </DropdownToggle>

            {isCategoryOpen && (
              <DropdownList>
                {goodsTypes.map((type) => (
                  <DropdownOption
                    key={type}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, category_id: type });
                      setIsCategoryOpen(false);
                    }}
                    $isActive={formData.category_id === type}
                  >
                    {type}
                  </DropdownOption>
                ))}
              </DropdownList>
            )}
          </DropdownWrapper>
        </FormGroup>

        <FormGroup>
          <FormLabel>Condition</FormLabel>
          <ConditionGrid>
            {conditionOptions.map((opt) => (
              <ConditionOption
                type="button"
                key={opt.id}
                onClick={() => handleConditionSelect(opt.label)}
                $isActive={formData.condition === opt.label}
              >
                {opt.label}
              </ConditionOption>
            ))}
          </ConditionGrid>
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="description">Description</FormLabel>
          <FormTextarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe the condition, features, or any flaws..."
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="price">Price (HKD) $</FormLabel>
          <FormInput
            id="price"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0"
            step="0.1"
            min="0"
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="contact">Contact Info (Phone / IG / Email)</FormLabel>
          <FormInput
            id="contact"
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="How should buyers reach you?"
            required
          />
        </FormGroup>

        <PromoSection>
          <PromoCheckboxLabel>
            <input
              type="checkbox"
              name="promote_to_community"
              checked={formData.promote_to_community}
              onChange={handleCheckboxChange}
            />
            Promote to College Community Board
          </PromoCheckboxLabel>
          {formData.promote_to_community && (
            <div style={{ marginTop: "1rem" }}>
              <PromoSubLabel htmlFor="community_description">
                Advertisement Description (visible to college members)
              </PromoSubLabel>
              <FormTextarea
                id="community_description"
                name="community_description"
                value={formData.community_description}
                onChange={handleChange}
                placeholder="Write a catchy description for your college mates!"
                required
                $minHeight="80px"
              />
            </div>
          )}
        </PromoSection>

        <ActionGroup>
          <CancelButton type="button" onClick={() => navigate("/")}>
            Cancel
          </CancelButton>
          <ConfirmButton type="submit">
            Confirm
          </ConfirmButton>
        </ActionGroup>
      </StyledForm>
    </PageContainer>
  );
}