import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.location.hash = '';
  window.scrollTo = jest.fn();
  global.fetch = jest.fn(() => new Promise(() => {}));
});

test('renders zehaoshangou home page', () => {
  render(<App />);
  expect(screen.getAllByText(/zehaoshangou/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/lose yourself/i)).toBeInTheDocument();
});

test('category navigation displays the selected product listing', () => {
  render(<App />);
  fireEvent.click(screen.getAllByRole('button', { name: /^games$/i })[0]);

  expect(screen.getByRole('heading', { name: /^games$/i })).toBeInTheDocument();
  expect(screen.getAllByText(/nebula protocol/i).length).toBeGreaterThan(0);
});

test('search displays the matching product', () => {
  render(<App />);
  const search = screen.getByLabelText(/search products/i);

  fireEvent.change(search, { target: { value: 'Nebula' } });
  fireEvent.submit(search.closest('form'));

  expect(screen.getByRole('heading', { name: /results for "nebula"/i })).toBeInTheDocument();
  expect(screen.getAllByText(/nebula protocol/i).length).toBeGreaterThan(0);
});

test('a product can be opened and added to the cart feedback', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /explore nebula protocol/i }));

  expect(screen.getByRole('heading', { name: /nebula protocol/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^add to cart$/i }));
  expect(screen.getByText(/nebula protocol added to cart/i)).toBeInTheDocument();
});

test('login fields require a valid email and an eight-character password', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /my account/i }));

  const email = screen.getByLabelText(/email address/i);
  const password = screen.getByLabelText(/^password$/i);

  expect(email).toBeRequired();
  expect(email).toHaveAttribute('type', 'email');
  expect(password).toBeRequired();
  expect(password).toHaveAttribute('minlength', '8');
});

test('registration displays a clear message when passwords do not match', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /my account/i }));
  fireEvent.click(screen.getByRole('button', { name: /register a new account/i }));

  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
  fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different123' } });
  fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));

  expect(screen.getByRole('alert')).toHaveTextContent(/passwords do not match/i);
});

test('demo products remain available when the backend API is offline', async () => {
  global.fetch = jest.fn(() => Promise.reject(new Error('Backend offline')));
  render(<App />);

  expect(await screen.findByText(/using demo products because the storedb product api is unavailable/i)).toBeInTheDocument();
  expect(screen.getByText(/nebula protocol/i)).toBeInTheDocument();
});
