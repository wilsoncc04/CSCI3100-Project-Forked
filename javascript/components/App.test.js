import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import App from './App';

test('sending a message in an active chat', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Chat'));
    fireEvent.change(screen.getByPlaceholderText('Type a message...'), { target: { value: 'Is this still available?' } });
    fireEvent.click(screen.getByText('Send'));
    expect(screen.getByText('Is this still available?')).toBeInTheDocument();
});

test('seller confirms the trade', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Chat'));
    fireEvent.click(screen.getByText('Confirm Sale'));
    expect(screen.getByText('has confirmed the trade')).toBeInTheDocument();
    expect(screen.getByText('This item has been sold')).toBeInTheDocument();
});

test('buyer cancels the trade', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Chat'));
    fireEvent.click(screen.getByText('Cancel Trade'));
    expect(screen.getByText('System: Buyer has cancelled the trade')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
});