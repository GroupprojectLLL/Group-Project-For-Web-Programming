import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.location.hash = '';
  window.scrollTo = jest.fn();
  window.localStorage.removeItem('zhsg-settings');
  global.fetch = jest.fn(() => new Promise(() => {}));
});

test('renders ZeHaoShanGou home page', () => {
  render(<App />);
  expect(screen.getAllByText(/ZeHaoShanGou/i).length).toBeGreaterThan(0);
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

test('account menu returns guests to their selected page after sign in', () => {
  render(<App />);
  const accountMenu = screen.getByLabelText(/account menu/i);

  fireEvent.click(within(accountMenu).getByText(/^wishlist$/i).closest('button'));
  expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent(/please sign in first/i);
  expect(screen.getByRole('alert')).toHaveClass('toast-error');

  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'tester@example.com' } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
  fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

  expect(screen.getByRole('heading', { name: /^wishlist$/i })).toBeInTheDocument();
  expect(within(accountMenu).getByText(/morgan\.lee@example\.com/i)).toBeInTheDocument();

  fireEvent.click(within(accountMenu).getByText(/^my library$/i).closest('button'));
  expect(screen.getByRole('heading', { name: /^my library$/i })).toBeInTheDocument();
});

test('settings are saved and applied to the library experience', () => {
  window.location.hash = 'settings';
  render(<App />);

  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'tester@example.com' } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
  fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

  expect(screen.getByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/default library sort/i), { target: { value: 'Oldest' } });
  fireEvent.click(screen.getByRole('checkbox', { name: /reduce interface motion/i }));
  fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

  expect(screen.getByRole('status')).toHaveTextContent(/preferences have been saved/i);
  expect(document.documentElement).toHaveClass('reduce-motion');
  expect(JSON.parse(window.localStorage.getItem('zhsg-settings'))).toMatchObject({
    librarySort: 'Oldest',
    reduceMotion: true,
  });

  const accountMenu = screen.getByLabelText(/account menu/i);
  fireEvent.click(within(accountMenu).getByText(/^my library$/i).closest('button'));
  expect(screen.getByLabelText(/library sort/i)).toHaveValue('Oldest');
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

test('cart page opens from the header and shows an empty-cart message', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /^cart$/i }));

  expect(screen.getByRole('heading', { name: /^your cart$/i, level: 1 })).toBeInTheDocument();
  expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /browse products/i })).toBeInTheDocument();
});

test('cart summary displays the selected product after add to cart', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /explore nebula protocol/i }));
  fireEvent.click(screen.getByRole('button', { name: /^add to cart$/i }));
  fireEvent.click(screen.getByRole('button', { name: /^cart$/i }));

  expect(screen.getByRole('heading', { name: /your cart/i })).toBeInTheDocument();
  expect(screen.getByText(/1 item selected/i)).toBeInTheDocument();
  expect(screen.getAllByText(/nebula protocol/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
  expect(screen.getAllByText(/\$19\.99/).length).toBeGreaterThan(0);
});

test('duplicate add-to-cart increases quantity instead of adding another row', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /explore nebula protocol/i }));
  fireEvent.click(screen.getByRole('button', { name: /^add to cart$/i }));
  fireEvent.click(screen.getByRole('button', { name: /^add to cart$/i }));
  fireEvent.click(screen.getByRole('button', { name: /^cart$/i }));

  expect(screen.getByText(/2 items selected/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/quantity for nebula protocol/i)).toHaveTextContent('2');
  expect(screen.getAllByText(/\$39\.98/).length).toBeGreaterThan(0);
});

test('checkout from cart asks unauthenticated users to sign in', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /explore nebula protocol/i }));
  fireEvent.click(screen.getByRole('button', { name: /^add to cart$/i }));
  fireEvent.click(screen.getByRole('button', { name: /^cart$/i }));
  fireEvent.click(screen.getByRole('button', { name: /sign in to checkout/i }));

  expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
  expect(screen.getByText(/secure account access/i)).toBeInTheDocument();
});

test('forgot password page can be opened from the account page', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /my account/i }));
  fireEvent.click(screen.getByRole('button', { name: /forgot your password/i }));

  expect(screen.getByRole('heading', { name: /reset your password/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
});

test('signed-in checkout displays new card payment fields', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /explore nebula protocol/i }));
  fireEvent.click(screen.getByRole('button', { name: /^add to cart$/i }));
  fireEvent.click(screen.getByRole('button', { name: /my account/i }));

  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'tester@example.com' } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
  fireEvent.submit(screen.getByRole('button', { name: /^sign in/i }).closest('form'));

  fireEvent.click(screen.getByRole('button', { name: /continue to checkout/i }));
  fireEvent.click(screen.getByLabelText(/new card/i));

  expect(screen.getByRole('heading', { name: /checkout/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/1234 5678 9012 3456/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/morgan lee/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/mm \/ yy/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/^123$/i)).toBeInTheDocument();
});

test('order detail keeps item quantity and line total after payment success', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /explore nebula protocol/i }));
  fireEvent.click(screen.getByRole('button', { name: /^add to cart$/i }));
  fireEvent.click(screen.getByRole('button', { name: /^add to cart$/i }));
  fireEvent.click(screen.getByRole('button', { name: /my account/i }));

  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'tester@example.com' } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
  fireEvent.submit(screen.getByRole('button', { name: /^sign in/i }).closest('form'));

  fireEvent.click(screen.getByRole('button', { name: /continue to checkout/i }));
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ orderId: '1001', items: [] }),
  });
  fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));

  expect(await screen.findByRole('heading', { name: /payment successful/i })).toBeInTheDocument();
  expect(screen.getByText(/quantity: 2/i)).toBeInTheDocument();
  expect(screen.getAllByText(/\$39\.98/).length).toBeGreaterThan(0);
});

test('frontend sign-in currently allows entered account details without database verification', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /explore nebula protocol/i }));
  fireEvent.click(screen.getByRole('button', { name: /^add to cart$/i }));
  fireEvent.click(screen.getByRole('button', { name: /my account/i }));

  fireEvent.change(screen.getByLabelText(/email address/i), {
    target: { value: 'unregistered@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/^password$/i), {
    target: { value: 'password123' },
  });

  fireEvent.submit(screen.getByRole('button', { name: /^sign in/i }).closest('form'));

  expect(screen.getByRole('button', { name: /continue to checkout/i })).toBeInTheDocument();
});

test('buy now starts the checkout flow for the selected product', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /explore nebula protocol/i }));
  fireEvent.click(screen.getByRole('button', { name: /buy now/i }));

  expect(screen.getByRole('heading', { name: /checkout/i })).toBeInTheDocument();
});
