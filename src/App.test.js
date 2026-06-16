import { render, screen } from '@testing-library/react';
import App from './App';

test('renders zehaoshangou home page', () => {
  render(<App />);
  expect(screen.getAllByText(/zehaoshangou/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/lose yourself/i)).toBeInTheDocument();
});
