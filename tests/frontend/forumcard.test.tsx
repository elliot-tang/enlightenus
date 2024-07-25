import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ForumCard } from '../../components/forumpostcard';

describe('ForumCard', () => {
  const defaultQuestion = {
    _id: 'Question ObjectId',
    questionBody: 'Sample Question Body',
    correctOptions: ['Sample Answer'],
    author: 'Sample Author',
    dateCreated: 'Sample Date',
    __v: 0,
    questionType: 'OEQ',
    questionAttempts: 0,
    noOptions: 0
  }

  const defaultQuestionAttachment = {
    _id: 'Question ObjectId',
    attachmentType: 'Question',
    attachmentName: 'Sample Question',
    attachmentId: defaultQuestion
  };

  const defaultProps = {
    id: 'ForumPost ObjectId',
    topic: 'Sample Topic',
    author: 'Sample Author',
    title: 'Sample Title',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    attached: [defaultQuestionAttachment],
    goToInd: jest.fn(),
  };

  it('renders correctly with all props', () => {
    const { getByText } = render(<ForumCard {...defaultProps} />);

    expect(getByText('Sample Author: Sample Title')).toBeTruthy();
    expect(getByText('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.')).toBeTruthy();
    expect(getByText('Has Attachments')).toBeTruthy();
  });

  it('triggers goToInd when pressed', () => {
    const { getByText } = render(<ForumCard {...defaultProps} />);
    
    const touchableElement = getByText('Sample Author: Sample Title');

    fireEvent.press(touchableElement);
    
    expect(defaultProps.goToInd).toHaveBeenCalled();
  });

  it('does not show "Has Attachments" text when there are no attachments', () => {
    const noAttachmentProps = { ...defaultProps, attached: [] };
    const { queryByText } = render(<ForumCard {...noAttachmentProps} />);

    expect(queryByText('Has Attachments')).toBeNull();
  });
});