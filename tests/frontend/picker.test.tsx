import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomPicker from '../../components/mypicker';

describe('Picker', () => {
  const pickerProps = {
    options: [{
      value: 'Value 1',
      label: 'Topic 1'
    }, {
      value: 'Value 2',
      label: 'Topic 2'
    }],
    selectedValue: 'Value 1',
    onValueChange: jest.fn(),
    label: 'Topic:'
  };

  it('renders correctly with initial props', () => {
    const { getByText } = render(<CustomPicker {...pickerProps} />);

    expect(getByText('Topic:')).toBeTruthy();
    expect(getByText('Value 1')).toBeTruthy();
  });

  it('opens dropdown menu when pressed with correct values', () => {
    const { getByText } = render(<CustomPicker {...pickerProps} />);

    fireEvent.press(getByText('Value 1'));
    
    expect(getByText('Topic 1')).toBeTruthy();
    expect(getByText('Topic 2')).toBeTruthy();
  });

  it('changes topic upon selection in dropdown menu', () => {
    const { getByText, queryByText } = render(<CustomPicker {...pickerProps} />);

    fireEvent.press(getByText('Value 1'));
    fireEvent.press(getByText('Topic 2'));
    
    expect(pickerProps.onValueChange).toHaveBeenCalled();
    expect(queryByText('Topic 1')).toBeNull();
  });
})