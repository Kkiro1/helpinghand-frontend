import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home';

test('renders Home hero and navigation links', () => {
    render( <
        MemoryRouter >
        <
        Home / >
        <
        /MemoryRouter>
    );

    expect(screen.getByText(/Welcome to HelpingHand/i)).toBeInTheDocument();
    expect(screen.getByText(/Make a Difference, One Donation at a Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
});