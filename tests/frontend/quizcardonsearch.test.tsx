import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import QuizCard from '../../components/quizcardonsearch';

describe('Quiz Card On Search', () => {
  const defaultQuizProps = {
    id: 'Quiz ObjectId',
    title: 'Quiz Title',
    topic: 'Quiz Topic',
    questions: [],
    authorid: 'Mock User',
    onPress: jest.fn()
  }

  it('renders correctly with all props', () => {
    const { getByText } = render(<QuizCard {...defaultQuizProps} />);

    expect(getByText('Quiz Topic: Quiz Title')).toBeTruthy();
    expect(getByText('Created by Mock User')).toBeTruthy();
  });

  it('triggers onPress when pressed', () => {
    const { getByText } = render(<QuizCard {...defaultQuizProps} />);

    fireEvent.press(getByText('Quiz Topic: Quiz Title'));

    expect(defaultQuizProps.onPress).toHaveBeenCalled();
  });
})