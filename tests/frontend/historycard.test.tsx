import React from 'react';
import { View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import HistoryCard, { HistoryCard2, HistoryCard3 } from '../../components/historycard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from '../../context/AuthContext';

// Ensure server is running before running save/unsave quiz tests
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

  beforeAll(async () => {
    await AsyncStorage.setItem('user', 'Mock User');
    await AsyncStorage.setItem('token', 'Mock Token');
  });

  it('renders correctly with text fields', () => {
    const { getByText } = render(
      <AuthProvider>
        <HistoryCard {...defaultProps} />
      </AuthProvider>
    );

    expect(getByText('Quiz Topic: Quiz Title')).toBeTruthy();
    expect(getByText('0/1')).toBeTruthy();
  });

  it('renders correctly with unsave button', () => {
    const { UNSAFE_getByProps } = render(<HistoryCard {...defaultProps} />);

    expect(UNSAFE_getByProps({ name: 'save', color: 'green' })).toBeTruthy();
  });

  it('renders correctly with save button', () => {
    const unsavedProps = { ...defaultProps, hasSaved: false }
    const { UNSAFE_getByProps } = render(<HistoryCard {...defaultProps} />);

    expect(UNSAFE_getByProps({ name: 'save', color: 'red' })).toBeTruthy();
  });
});