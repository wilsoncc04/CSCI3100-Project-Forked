import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlinePicture } from "react-icons/ai";
import getTimesAgo from "../../common/getTimesAgo";
import styled from "styled-components";
import { ConditionTag } from "../../common/style";

const PageContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0;
  width: 200px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: inline-block;
  margin: 10px;
  position: relative;
`;

const TimeTag = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(34, 34, 34, 0.44);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  z-index: 10;
  pointer-events: none;
`;

const ImageWrapper = styled.div`
  height: 180px;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const NoImagePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ccc;
  span {
    font-size: 0.7rem;
    margin-top: 4px;
  }
`;

const ContentBox = styled.div`
  padding: 12px 12px 16px 12px;
`;

const Title = styled.h3`
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Price = styled.p`
  color: #e60000;
  font-weight: bold;
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
`;

const TagGroup = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
`;

const StatusLabel = styled.span`
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: capitalize;
  font-weight: 600;
  background-color: ${props => {
    const s = props.$status?.toLowerCase();
    if (s === "sold") return "#e9ecef";
    if (s === "reserved") return "#fff3cd";
    return "#d4edda";
  }};
  color: ${props => {
    const s = props.$status?.toLowerCase();
    if (s === "sold") return "#6c757d";
    if (s === "reserved") return "#856404";
    return "#155724";
  }};
`;

export default function ProductCard({ id, name, price, condition, status, images, created_at }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = images && images.length > 0;

  return (
    <PageContainer>
      <TimeTag>{getTimesAgo(created_at)}</TimeTag>

      <Link to={`/product/${id}`} style={{ textDecoration: "none" }}>
        <ImageWrapper>
          {hasImage && !imgError ? (
            <StyledImage
              src={images[0]}
              alt={name}
              onError={() => setImgError(true)}
            />
          ) : (
            <NoImagePlaceholder>
              <AiOutlinePicture size={48} />
              <span>No Image</span>
            </NoImagePlaceholder>
          )}
        </ImageWrapper>
      </Link>

      <ContentBox>
        <Title title={name}>{name}</Title>
        <Price>${price} HKD</Price>

        <TagGroup>
          <StatusLabel $status={status}>{status}</StatusLabel>
          {condition ? (
            <ConditionTag
              $condition={condition}
              style={{ fontSize: "0.8rem", padding: "2px 8px", borderRadius: "4px" }}
            >
              {condition}
            </ConditionTag>
          ) : (
            <div style={{ height: "20px" }} />
          )}
        </TagGroup>
      </ContentBox>
    </PageContainer>
  );
}