import React, { useState } from 'react';
import { View, TextInput, Button, Text , StyleSheet, SafeAreaView, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../App';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen : React.FC<Props> = ({ navigation } : Props) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register } = useAuth();

  const handleRegister = () => {
    if (password != confirmPassword) {
      alert("Passwords don't match!");
    }
    register(email, username, password);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      
      <Image style={styles.banner} source={require("../../assets/banner.png")}></Image>
      
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Create your account!</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          placeholder="Email" 
          value={email} 
          onChangeText={setEmail} />
        <TextInput 
          style={styles.input}
          placeholder="Username" 
          value={username} 
          onChangeText={setUsername} />
        <TextInput 
          style={styles.input}
          placeholder="Password" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry />
        <TextInput 
          style={styles.input}
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChangeText={setConfirmPassword} 
          secureTextEntry />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Register" color='#6cac48' onPress={handleRegister} />
      </View>
      
      <View style={styles.redirectContainer}>
        <Text 
          style={styles.link}
          onPress={() => navigation.navigate('Login')}>
            Back to login
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  banner: {
    height: 123,
    width: 396,
  },

  headerContainer: {
    paddingTop: 30,
  },

  header: {
    fontSize: 30,
    fontWeight: 'bold',
  },

  inputContainer: {
    paddingTop: 20,
    gap: 15,
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 5
  },

  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "green",
    borderWidth: 1,
    borderRadius: 7
  },

  buttonContainer: {
    paddingTop: 20,
  },

  redirectContainer: {
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  link: {
    color: "blue",
  },
})

export default RegisterScreen;