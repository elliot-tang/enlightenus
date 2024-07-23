import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../../screens/auth/login';
import { AuthContext } from '../../context/AuthContext';

// Creates a mock AuthProvider for the returnUser() function in HistoryCard
const mockContextValue = {
  token: 'Mock Token',
  user: 'Mock User',
  loading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
};
const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthContext.Provider value={mockContextValue}>{children}</AuthContext.Provider>;
};

describe('Login Procedure', () => {
  it('renders correctly with all props', () => {
    const { getByText, UNSAFE_getByProps, getByPlaceholderText } = render(
      <MockAuthProvider>
        <LoginScreen navigation={undefined} route={undefined} />
      </MockAuthProvider>
    );

    expect(UNSAFE_getByProps({ source: require("@app/assets/banner.png") })).toBeTruthy();
    expect(getByText('Welcome back!')).toBeTruthy();
    expect(getByPlaceholderText('Username')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(UNSAFE_getByProps({ value: false })).toBeTruthy();
    expect(getByText('Keep me signed in')).toBeTruthy();
    expect(UNSAFE_getByProps({ title: "Login", color: '#6cac48' })).toBeTruthy();
    expect(getByText(`Don't have an account?`)).toBeTruthy();
    expect(getByText('Register here!')).toBeTruthy();
  });

  it('updates text for username input', () => {
    const { getByPlaceholderText } = render(
      <MockAuthProvider>
        <LoginScreen navigation={undefined} route={undefined} />
      </MockAuthProvider>
    );
    const usernameInput = getByPlaceholderText('Username');

    fireEvent.changeText(usernameInput, 'Test Username');

    expect(usernameInput.props.value).toBe('Test Username');
  });

  it('updates text for password input', () => {
    const { getByPlaceholderText } = render(
      <MockAuthProvider>
        <LoginScreen navigation={undefined} route={undefined} />
      </MockAuthProvider>
    );
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(passwordInput, 'Test Password');

    expect(passwordInput.props.value).toBe('Test Password');
  });

  it('updates keepSignedIn state whenever switch is toggled', () => {
    const { UNSAFE_getByProps } = render(
      <MockAuthProvider>
        <LoginScreen navigation={undefined} route={undefined} />
      </MockAuthProvider>
    );
    expect(UNSAFE_getByProps({ value: false })).toBeTruthy();

    fireEvent(UNSAFE_getByProps({ value: false }), 'valueChange', true);

    expect(UNSAFE_getByProps({ value: true })).toBeTruthy();

    fireEvent(UNSAFE_getByProps({ value: true }), 'valueChange', false);

    expect(UNSAFE_getByProps({ value: false })).toBeTruthy();
  });

  it('attempts login when button is pressed', () => {
    const { UNSAFE_getByProps } = render(
      <MockAuthProvider>
        <LoginScreen navigation={undefined} route={undefined} />
      </MockAuthProvider>
    );

    fireEvent.press(UNSAFE_getByProps({ title: "Login", color: '#6cac48' }));
    expect(mockContextValue.login).toHaveBeenCalled();
  });

  // TODO: Figure out way to mock stack navigator
})