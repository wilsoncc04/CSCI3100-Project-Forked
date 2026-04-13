import styled, { css } from "styled-components";

export const StatusBadge = styled.span`
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: capitalize;

  ${props => {
    const s = props.$status?.toLowerCase();
    if (s === 'sold') return 'background: #e9ecef; color: #6c757d;';
    if (s === 'reserved') return 'background: #fff3cd; color: #856404;';
    return 'background: #d4edda; color: #155724;'; 
  }}
`;

export const ConditionTag = styled.span`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;

  background-color: #f3f4f6;
  color: #6b7280; 
  border: 1px solid #e5e7eb; 

  text-transform: capitalize;
  white-space: nowrap;
`;

export const TimeTag = styled.div`
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

export const ResetButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s;
  margin-right: 4px;

  &:hover {
    background-color: #f3e8f5;
    color: #702082;
    transform: rotate(-30deg);
  }

  &:active {
    background-color: #e8d5eb;
  }
`;