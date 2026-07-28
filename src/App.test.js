import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import App from './App';

const MOCK_CUSTOMER = {
  id: 7,
  customerId: 101,
  name: 'Morgan Lee',
  username: 'morganlee',
  email: 'morgan.lee@example.com',
  role: 'Customer',
  paymentMethod: null,
  address: {},
};

let loginErrorMessage = '';
let orderErrorMessage = '';

function response(
  payload,
  ok = true,
  status = 200
) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(payload),
  });
}

function installFetchMock() {
  global.fetch = jest.fn((input, options = {}) => {
    const url = String(input);
    const method = String(
      options.method || 'GET'
    ).toUpperCase();

    if (url.includes('/api/inft3050/')) {
      return Promise.reject(
        new Error('Backend offline')
      );
    }

    if (url.endsWith('/session')) {
      return response({
        user: null,
      });
    }

    if (url.endsWith('/login')) {
      return loginErrorMessage
        ? response(
            {
              error: loginErrorMessage,
            },
            false,
            401
          )
        : response({
            user: MOCK_CUSTOMER,
          });
    }

    if (url.endsWith('/logout')) {
      return response({}, true, 204);
    }

    if (url.endsWith('/library')) {
      return response({
        items: [],
      });
    }

    if (
      url.endsWith('/orders') &&
      method === 'GET'
    ) {
      return response({
        orders: [],
      });
    }

    if (
      url.endsWith('/orders') &&
      method === 'POST'
    ) {
      return orderErrorMessage
        ? response(
            {
              error: orderErrorMessage,
            },
            false,
            500
          )
        : response({
            orderId: 1001,
            status: 'Paid',
            refundStatus: 'Not requested',
            total: 39.98,
            paymentMethod: 'Card **** 3456',
            createdAt:
              '2026-07-19T15:00:00.000Z',
            items: [],
          });
    }

    return response({});
  });
}

function openNebulaProduct() {
  fireEvent.click(
    screen.getByRole('button', {
      name: /explore nebula protocol/i,
    })
  );
}

function addNebulaToCart(times = 1) {
  openNebulaProduct();

  for (
    let i = 0;
    i < times;
    i += 1
  ) {
    fireEvent.click(
      screen.getByRole('button', {
        name: /^add to cart$/i,
      })
    );
  }
}

async function signIn({
  openAccountPage = true,
} = {}) {
  if (openAccountPage) {
    fireEvent.click(
      screen.getByRole('button', {
        name: /my account/i,
      })
    );
  }

  fireEvent.change(
    await screen.findByLabelText(
      /email address or username/i
    ),
    {
      target: {
        value: 'tester@example.com',
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText(/^password$/i),
    {
      target: {
        value: 'password123',
      },
    }
  );

  fireEvent.submit(
    screen
      .getByRole('button', {
        name: /^sign in$/i,
      })
      .closest('form')
  );

  await waitFor(() => {
    expect(
      within(
        screen.getByLabelText(/account menu/i)
      ).getByText(MOCK_CUSTOMER.email)
    ).toBeInTheDocument();
  });
}

function fillValidCard() {
  fireEvent.change(
    screen.getByPlaceholderText(
      /1234 5678 9012 3456/i
    ),
    {
      target: {
        value: '1234 5678 9012 3456',
      },
    }
  );

  fireEvent.change(
    screen.getByPlaceholderText(
      /morgan lee/i
    ),
    {
      target: {
        value: 'Morgan Lee',
      },
    }
  );

  fireEvent.change(
    screen.getByPlaceholderText(/mm \/ yy/i),
    {
      target: {
        value: '12 / 30',
      },
    }
  );

  fireEvent.change(
    screen.getByPlaceholderText(/^123$/i),
    {
      target: {
        value: '123',
      },
    }
  );
}

beforeEach(() => {
  window.location.hash = '';
  window.scrollTo = jest.fn();

  window.localStorage.clear();

  document.documentElement.classList.remove(
    'reduce-motion'
  );

  loginErrorMessage = '';
  orderErrorMessage = '';

  installFetchMock();
});

afterEach(() => {
  jest.clearAllMocks();
});

test(
  'renders ZeHaoShanGou home page',
  () => {
    render(<App />);

    expect(
      screen.getAllByText(
        /ZeHaoShanGou/i
      ).length
    ).toBeGreaterThan(0);

    expect(
      screen.getByText(/lose yourself/i)
    ).toBeInTheDocument();
  }
);

test(
  'category navigation displays the selected product listing',
  () => {
    render(<App />);

    fireEvent.click(
      screen.getAllByRole('button', {
        name: /^games$/i,
      })[0]
    );

    expect(
      screen.getByRole('heading', {
        name: /^games$/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(
        /nebula protocol/i
      ).length
    ).toBeGreaterThan(0);
  }
);

test(
  'search displays the matching product',
  () => {
    render(<App />);

    const search =
      screen.getByLabelText(
        /search products/i
      );

    fireEvent.change(search, {
      target: {
        value: 'Nebula',
      },
    });

    fireEvent.submit(
      search.closest('form')
    );

    expect(
      screen.getByRole('heading', {
        name: /results for "nebula"/i,
      })
    ).toBeInTheDocument();
  }
);

test(
  'a product can be opened and added to the cart',
  () => {
    render(<App />);

    openNebulaProduct();

    fireEvent.click(
      screen.getByRole('button', {
        name: /^add to cart$/i,
      })
    );

    expect(
      screen.getByText(
        /nebula protocol added to cart/i
      )
    ).toBeInTheDocument();
  }
);

test(
  'login accepts an email or username and requires a password',
  async () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /my account/i,
      })
    );

    const identifier =
      await screen.findByLabelText(
        /email address or username/i
      );

    const password =
      screen.getByLabelText(
        /^password$/i
      );

    expect(identifier).toBeRequired();

    expect(identifier).toHaveAttribute(
      'type',
      'text'
    );

    expect(identifier).toHaveAttribute(
      'autocomplete',
      'username'
    );

    expect(password).toBeRequired();

    expect(password).toHaveAttribute(
      'type',
      'password'
    );
  }
);

test(
  'account menu returns guests to wishlist after successful sign in',
  async () => {
    render(<App />);

    const accountMenu =
      screen.getByLabelText(
        /account menu/i
      );

    fireEvent.click(
      within(accountMenu).getByRole(
        'menuitem',
        {
          name: /^wishlist$/i,
        }
      )
    );

    expect(
      await screen.findByRole('heading', {
        name: /sign in to your account/i,
      })
    ).toBeInTheDocument();

    await signIn({
      openAccountPage: false,
    });

    expect(
      await screen.findByRole('heading', {
        name: /^wishlist$/i,
      })
    ).toBeInTheDocument();
  }
);

test(
  'settings are saved and applied to the library',
  async () => {
    window.location.hash = 'settings';

    render(<App />);

    await screen.findByRole('heading', {
      name: /sign in to your account/i,
    });

    await signIn({
      openAccountPage: false,
    });

    expect(
      await screen.findByRole('heading', {
        name: /^settings$/i,
      })
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText(
        /default library sort/i
      ),
      {
        target: {
          value: 'Oldest',
        },
      }
    );

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: /reduce interface motion/i,
      })
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /save changes/i,
      })
    );

    expect(
      screen.getByRole('status')
    ).toHaveTextContent(
      /preferences have been saved/i
    );

    expect(
      document.documentElement
    ).toHaveClass('reduce-motion');

    expect(
      JSON.parse(
        window.localStorage.getItem(
          'zhsg-settings'
        )
      )
    ).toMatchObject({
      librarySort: 'Oldest',
      reduceMotion: true,
    });
  }
);

test(
  'registration displays a clear message when passwords do not match',
  async () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /my account/i,
      })
    );

    await screen.findByLabelText(
      /email address or username/i
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /register a new account/i,
      })
    );

    fireEvent.change(
      screen.getByLabelText(/^password$/i),
      {
        target: {
          value: 'password123',
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(
        /confirm password/i
      ),
      {
        target: {
          value: 'different123',
        },
      }
    );

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: /create account/i,
        })
        .closest('form')
    );

    expect(
      screen.getByRole('alert')
    ).toHaveTextContent(
      /passwords do not match/i
    );
  }
);

test(
  'demo products remain available when the product API is offline',
  async () => {
    render(<App />);

    expect(
      await screen.findByText(
        /using demo products because the storedb product api is unavailable/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /nebula protocol/i
      )
    ).toBeInTheDocument();
  }
);

test(
  'cart page shows an empty-cart message',
  () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /^cart$/i,
      })
    );

    expect(
      screen.getByText(
        /your cart is empty/i
      )
    ).toBeInTheDocument();
  }
);

test(
  'duplicate add-to-cart increases quantity and total',
  () => {
    render(<App />);

    addNebulaToCart(2);

    fireEvent.click(
      screen.getByRole('button', {
        name: /^cart$/i,
      })
    );

    expect(
      screen.getByText(
        /2 items selected/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        /quantity for nebula protocol/i
      )
    ).toHaveTextContent('2');

    expect(
      screen.getAllByText(
        /\$39\.98/
      ).length
    ).toBeGreaterThan(0);
  }
);

test(
  'decreasing the final cart item restores the empty-cart state',
  () => {
    render(<App />);

    addNebulaToCart();

    fireEvent.click(
      screen.getByRole('button', {
        name: /^cart$/i,
      })
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /remove one nebula protocol/i,
      })
    );

    expect(
      screen.getByText(
        /your cart is empty/i
      )
    ).toBeInTheDocument();
  }
);

test(
  'checkout asks unauthenticated users to sign in',
  () => {
    render(<App />);

    addNebulaToCart();

    fireEvent.click(
      screen.getByRole('button', {
        name: /^cart$/i,
      })
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /sign in to checkout/i,
      })
    );

    expect(
      screen.getByRole('heading', {
        name: /sign in to your account/i,
      })
    ).toBeInTheDocument();
  }
);

test(
  'forgot password page opens from the account page',
  async () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /my account/i,
      })
    );

    await screen.findByLabelText(
      /email address or username/i
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /forgot your password/i,
      })
    );

    expect(
      screen.getByRole('heading', {
        name: /reset your password/i,
      })
    ).toBeInTheDocument();
  }
);

test(
  'signed-in checkout displays new card fields',
  async () => {
    render(<App />);

    addNebulaToCart();

    await signIn();

    fireEvent.click(
      screen.getByRole('button', {
        name: /continue to checkout/i,
      })
    );

    expect(
      await screen.findByRole('heading', {
        name: /^checkout$/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        /1234 5678 9012 3456/i
      )
    ).toBeInTheDocument();
  }
);

test(
  'order detail keeps quantity and total after payment success',
  async () => {
    render(<App />);

    addNebulaToCart(2);

    await signIn();

    fireEvent.click(
      screen.getByRole('button', {
        name: /continue to checkout/i,
      })
    );

    await screen.findByRole('heading', {
      name: /^checkout$/i,
    });

    fillValidCard();

    fireEvent.click(
      screen.getByRole('button', {
        name: /confirm payment/i,
      })
    );

    expect(
      await screen.findByRole('heading', {
        name: /payment successful/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/quantity: 2/i)
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(
        /\$39\.98/
      ).length
    ).toBeGreaterThan(0);
  }
);

test(
  'invalid backend credentials display an error message',
  async () => {
    loginErrorMessage =
      'Invalid username or password';

    render(<App />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /my account/i,
      })
    );

    fireEvent.change(
      await screen.findByLabelText(
        /email address or username/i
      ),
      {
        target: {
          value:
            'unregistered@example.com',
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/^password$/i),
      {
        target: {
          value: 'password123',
        },
      }
    );

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: /^sign in$/i,
        })
        .closest('form')
    );

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(
      /invalid username or password/i
    );
  }
);

test(
  'buy now sends an unauthenticated user to sign in',
  async () => {
    render(<App />);

    openNebulaProduct();

    fireEvent.click(
      screen.getByRole('button', {
        name: /buy now/i,
      })
    );

    expect(
      await screen.findByRole('heading', {
        name: /sign in to your account/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('alert')
    ).toHaveTextContent(
      /please sign in first/i
    );
  }
);

test(
  'payment failure displays a user-friendly StoreDB error',
  async () => {
    orderErrorMessage =
      'Database unavailable';

    render(<App />);

    addNebulaToCart();

    await signIn();

    fireEvent.click(
      screen.getByRole('button', {
        name: /continue to checkout/i,
      })
    );

    await screen.findByRole('heading', {
      name: /^checkout$/i,
    });

    fillValidCard();

    fireEvent.click(
      screen.getByRole('button', {
        name: /confirm payment/i,
      })
    );

    expect(
      await screen.findByText(
        /order could not be saved to storedb: database unavailable/i
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('heading', {
        name: /payment successful/i,
      })
    ).not.toBeInTheDocument();
  }
);

test(
  'logging out prevents access to protected account pages',
  async () => {
    render(<App />);

    await signIn();

    fireEvent.click(
      screen.getByRole('button', {
        name: /log out/i,
      })
    );

    expect(
      await screen.findByRole('heading', {
        name: /sign in to your account/i,
      })
    ).toBeInTheDocument();

    const accountMenu =
      screen.getByLabelText(
        /account menu/i
      );

    fireEvent.click(
      within(accountMenu).getByRole(
        'menuitem',
        {
          name: /^wishlist$/i,
        }
      )
    );

    expect(
      screen.getByRole('heading', {
        name: /sign in to your account/i,
      })
    ).toBeInTheDocument();
  }
);