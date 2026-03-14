import { render, screen } from '@testing-library/react';
import App from './App';

// Mock geolocation
beforeEach(() => {
  global.navigator.geolocation = {
    getCurrentPosition: jest.fn((success, error) => error(new Error('denied'))),
  };
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
  );
});

test('renders city selection controls', () => {
  render(<App />);
  expect(screen.getByLabelText(/choose a city/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/search a city/i)).toBeInTheDocument();
});
