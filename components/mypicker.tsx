import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const CustomPicker = ({ options, selectedValue, onValueChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePress = (itemValue) => {
    onValueChange(itemValue);
    setIsOpen(false);
  };

  const renderItem = (item) => (
    <TouchableOpacity key={item.value} onPress={() => handlePress(item.value)}>
      <Text style={styles.itemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.pickerButton} onPress={() => setIsOpen(!isOpen)}>
        <Text style={styles.buttonText}>{selectedValue}</Text>
        {isOpen && <Text style={styles.dropdownIcon}>&#8595;</Text>}
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdown}>
          {options.map(renderItem)}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    marginBottom: 5,
  },
  pickerButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    flex: 1,
  },
  dropdownIcon: {
    fontSize: 18,
  },
  dropdown: {
    position: 'absolute',
    top: 40, // Adjust based on button height
    left: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  itemText: {
    padding: 10,
  },
});

export default CustomPicker;