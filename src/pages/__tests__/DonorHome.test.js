import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DonorHome from '../DonorHome';

beforeEach(() => {
  localStorage.clear();
});

test('renders DonorHome and shows donor name and total donations', () => {
  localStorage.setItem('userData', JSON.stringify({ name: 'Test Donor', email: 'test@example.com', totalDonations: 123 }));
  localStorage.setItem('donations', JSON.stringify([
    { id: 1, campaignTitle: 'Help A', amount: 50, date: new Date().toISOString(), status: 'Completed' }
  ]));

  render(
    <MemoryRouter>
      <DonorHome />
    </MemoryRouter>
  );

  expect(screen.getByText(/Welcome, Test Donor/i)).toBeInTheDocument();
  expect(screen.getByText(/Total Donations/i)).toBeInTheDocument();
  expect(screen.getByText(/\$123/)).toBeInTheDocument();
  expect(screen.getByText(/Recent Donations/i)).toBeInTheDocument();
});
