import React, { useState } from 'react';
import { View, TextInput, Button, Switch, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@app/App';
import { useAuth } from '@app/context/AuthContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen : React.FC<Props> = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const { login } = useAuth();

  const handleLogin = () => {
    login(username, password, keepSignedIn);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image style={styles.banner} source={require("@app/assets/banner.png")}></Image>
      
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Welcome back!</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          placeholder="Username" value={username} 
          onChangeText={setUsername} />
        <TextInput 
          style={styles.input}
          placeholder="Password" 
          value={password} 
          onChangeText={setPassword} secureTextEntry />
      </View>
      
      <View style={styles.keepSignedInContainer}>
        <Switch value={keepSignedIn} onValueChange={setKeepSignedIn} />
        <Text>Keep me signed in</Text>
      </View>

      <Button title="Login" color='#6cac48' onPress={handleLogin} />

      <View style={styles.noAccountContainer}>
        <Text>Don't have an account? </Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>Register here!</Text>
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

  keepSignedInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  noAccountContainer: {
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  link: {
    color: "blue",
  },
})

export default LoginScreen;