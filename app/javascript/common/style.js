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
  font-weight: bold;

  ${props => {
    const c = props.$condition?.toLowerCase();
    if (c === 'brand new') return 'background: #e6f2ff; color: #0066cc;';  
    if (c === 'like new') return 'background: #e0f7fa; color: #006064;';     
    if (c === 'used - good') return 'background: #fff3e0; color: #e65100;'; 
    if (c === 'heavily used') return 'background: #f3e5f5; color: #4a148c;'; 
    return 'background: #f0f0f0; color: #555;';
  }}
`;