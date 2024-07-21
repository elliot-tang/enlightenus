import React from 'react';
import { View } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HistoryCard, { HistoryCard2, HistoryCard3 } from '../../components/historycard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Creates a mock AuthProvider for the returnUser() function in HistoryCard
const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockContextValue = {
    token: 'Mock Token',
    user: 'Mock User',
    loading: false,
    login: async (username: string, password: string, keepSignedIn: boolean) => { return },
    register: async (email: string, username: string, password: string, keepSignedIn: boolean) => { return },
    logout: async () => { return },
  };
  return <AuthContext.Provider value={mockContextValue}>{children}</AuthContext.Provider>;
};

// NOTE: Ensure server is running before running save/unsave quiz tests
describe('History Card', () => {
  const defaultProps = {
    id: 'Quiz ObjectId',
    title: 'Quiz Title',
    topic: 'Quiz Topic',
    questions: [{
      id: 'Question ObjectId',
      mcq: true,
      maxAttempt: 0,
      quizstmt: 'Question Body',
      corrans: ['Correct Answer'],
      wrongs: ['Wrong Answer'],
      noOption: 0,
      explainText: 'Explain Text',
      responses: ['Response'],
      isCorrect: true,
      noAttempts: 0
    }],
    score: 0,
    hasSaved: true,
    goToInd: jest.fn()
  }

  // Mocks MaterialIcons with a View Component with the same props
  jest.mock('@expo/vector-icons/MaterialIcons', () => {
    return (props) => <View {...props} />;
  });

  // Mocks axios for save/unsave quiz tests
  // jest.mock('axios');
  // const mockedAxios = axios as jest.Mocked<typeof axios>;

  // Stores mock data into async storage
  beforeAll(async () => {
    await AsyncStorage.setItem('user', 'Mock User');
    await AsyncStorage.setItem('token', 'Mock Token');
  });

  it('renders correctly with text fields', () => {
    const { getByText } = render(
      <MockAuthProvider>
        <HistoryCard {...defaultProps} />
      </MockAuthProvider>
    );

    expect(getByText('Quiz Topic: Quiz Title')).toBeTruthy();
    expect(getByText('0/1')).toBeTruthy();
  });

  it('renders correctly with save button', () => {
    const unsavedProps = { ...defaultProps, hasSaved: false };
    const { UNSAFE_getByProps } = render(
      <MockAuthProvider>
        <HistoryCard {...unsavedProps} />
      </MockAuthProvider>
    );

    expect(UNSAFE_getByProps({ name: 'save', color: 'red' })).toBeTruthy();
  });

  it('renders correctly with unsave button', () => {
    const { UNSAFE_getByProps } = render(
      <MockAuthProvider>
        <HistoryCard {...defaultProps} />
      </MockAuthProvider>
    );

    expect(UNSAFE_getByProps({ name: 'save', color: 'green' })).toBeTruthy();
  });

  it('triggers goToInd when pressed', () => {
    const { getByText } = render(
      <MockAuthProvider>
        <HistoryCard {...defaultProps} />
      </MockAuthProvider>
    );

    const touchableElement = getByText('Quiz Topic: Quiz Title');
    fireEvent.press(touchableElement);
    expect(defaultProps.goToInd).toHaveBeenCalled();
  });

  it('triggers saveQuiz when save button is pressed', async () => {
    var mockedAxios = new MockAdapter(axios);
    const data = { savedQuizId: 'Saved Quiz ObjectId' };
    mockedAxios.onPost(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/saveQuiz`).reply(201, data);

    const unsavedProps = { ...defaultProps, hasSaved: false };
    const { UNSAFE_getByProps } = render(
      <MockAuthProvider>
        <HistoryCard {...unsavedProps} />
      </MockAuthProvider>
    );
    
    fireEvent.press(UNSAFE_getByProps({ name: 'save', color: 'red' }));
    await waitFor(() => expect(UNSAFE_getByProps({ name: 'save', color: 'green' })).toBeTruthy());
  });

  it('triggers unsaveQuiz when unsave button is pressed', async () => {
    var mockedAxios = new MockAdapter(axios);
    const data = { message: 'Quiz unsaved successfully!' };
    mockedAxios.onPost(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/unsaveQuiz`).reply(200, data);

    const { UNSAFE_getByProps } = render(
      <MockAuthProvider>
        <HistoryCard {...defaultProps} />
      </MockAuthProvider>
    );
    
    fireEvent.press(UNSAFE_getByProps({ name: 'save', color: 'green' }));
    await waitFor(() => expect(UNSAFE_getByProps({ name: 'save', color: 'red' })).toBeTruthy());
  });
});