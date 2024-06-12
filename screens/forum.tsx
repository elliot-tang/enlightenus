import * as React from 'react';
import { Button, Text, View, Switch, FlatList, SafeAreaView, StyleSheet, TextInput, ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ForumCard } from '../components/forumpostcard';
import { styles } from '../App';
import { useState } from 'react';
import CustomPicker from '../components/mypicker';

const options = [
  { value: 'General', label: 'General' },
  { value: 'Programming', label: 'Programming' },
  { value: 'Math', label: 'Math' },
]

type ForumStackNavigationParamList = {
  main: undefined,
  individual: {postid: string}|undefined,
  create: undefined
}

const Stack = createNativeStackNavigator<ForumStackNavigationParamList>();

interface ForumScreenProps extends NativeStackScreenProps<ForumStackNavigationParamList>{}

type IndividualProps = NativeStackScreenProps<ForumStackNavigationParamList,"individual">

export default function ForumScreen() {
  return (
    <Stack.Navigator initialRouteName="main">
      <Stack.Screen name="main" component={MainForum} options={{ headerShown: false }}/>
      <Stack.Screen name="individual" component={Individual} />
      <Stack.Screen name="create" component={CreatePost}/>
    </Stack.Navigator>
  );
}


function MainForum({navigation}: ForumScreenProps){

  const data = testData; //from database instead
  return (
    <View style={{ flex: 1 }}>
      <Button title = "Create New Forum Discussion!" onPress={()=>navigation.navigate("create")}/>
      <View style={{ height: 25 }} />
      <ScrollView style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={item => item.id} 
        renderItem={({item}) => <ForumCard
        {...item}
        goToInd = {()=>navigation.navigate("individual", {postid: item.id})}/>} 
        ItemSeparatorComponent={(() => (
          <View
            style={{height: 10}}
          />
        ))}
      />
    </ScrollView>
    </View>
  )
}

function Individual({route,navigation}: IndividualProps){
  const [replyText, setReply] = useState("")
  var temp: string
  if (!(route.params.postid == undefined)) {
    temp = route.params.postid;
  }
  const toDisplay = testData.find((item) => item.id === temp);
  
  return (
    <SafeAreaView>
    <View style={{ 
      backgroundColor: 'cdefff', borderColor: 'black', borderWidth: 2.5, borderRadius: 10 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 17 }}>
      {toDisplay.author}: {toDisplay.title}
      </Text>
      <Text style ={{fontSize : 15}}>
      {toDisplay.body}
      </Text>
    </View>
    <View>
      <View>
      <TextInput style={styles.input}
        placeholder="What do you have to say?"
        multiline={true}
        value={replyText}
        onChangeText={setReply}/>
      </View>
      <Button title="Reply"/> 
    </View>
    
    <FlatList
      data={toDisplay.replies}
      keyExtractor={item => item.id} 
      renderItem={({item}) => 
      <View style = {{backgroundColor: '#cdeeee',
            padding: 10,
            borderRadius: 10,}}>
        <Text style ={{fontSize: 12}}>
        {item.author}: {item.body} 
        </Text>
      </View>}
      ItemSeparatorComponent={(() => (
        <View
          style={{height: 10}}
        />
      ))}
    />
    </SafeAreaView>
  )
}

function CreatePost({navigation}: ForumScreenProps){
  const [postText, setPost] = useState("")
  const [title, setTitle] = useState("")
  const [postTopic,setTopic] = useState("General")
  return(
    <View style = {{padding: 10}}>
      <View style = {{flex:1}}>
        <Text>What topic do you want to discuss?
        </Text>
        <CustomPicker
          options={options}
          selectedValue={postTopic}
          onValueChange={setTopic}
          label="Select an option:"
        />
      </View>
      <TextInput style={styles.input}
        placeholder="Give your post a title"
        value={title}
        onChangeText={setTitle}/>
      <TextInput style={styles.input}
        placeholder="What do you have to say?"
        multiline={true}
        value={postText}
        onChangeText={setPost}/>
      <Button title ="Post" onPress={()=> navigation.goBack()}/>
    </View>
  )
}

const testData = [
  {
    id: "dsdhsbdsjndskjds",
  title: "filler",
  topic: "Misc",
  body: "blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah wordswordswords blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah wordswordsword",
  votes: 0,
  author: "User1",
  replies: [{id: "fjnjdfnd",
  author: "User2",
  body: "ithinkuwrong"},{id: "nfjk",
  author: "User3",
  body: "okbye"}]
  },

  {
    id: 'someotherrandomstring',
    title: "Astrology",
  topic: "Misc",
  body: "doesanyone actually believe in that stuff?. I dont know can someone answer me please please please nasjfnjaknfkjmsfjksnfjsnjsnfkjsbhfjsknf shfbshfsjfnfsfnjsnfhsjfbsbfjs fsjfsk nskjnfjk kkfnjsknfjsnfjkn sjfnsjkn fsjknfkjsnfkjsnfjksn skfnsjknfjjodso",
  votes: 0,
  author: "User4",
  replies: []
  },

  ];