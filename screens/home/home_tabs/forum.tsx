import * as React from 'react';
import { Button, Text, View, Switch, FlatList, SafeAreaView, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ForumCard } from '@app/components/forumpostcard';
import { styles } from '@app/App';
import { useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type ForumStackNavigationParamList = {
  main: undefined,
  individual: {postid: string}|undefined, // alternative: you may want to pass the whole post props over to the next screen.... (see in history)
  create: undefined,
  report: {reportid: string,contenttype: string}|undefined
}

const Stack = createNativeStackNavigator<ForumStackNavigationParamList>();

interface ForumScreenProps extends NativeStackScreenProps<ForumStackNavigationParamList>{}

type IndividualProps = NativeStackScreenProps<ForumStackNavigationParamList,"individual">

type ReportProps = NativeStackScreenProps<ForumStackNavigationParamList,"report">

type Attachments = {
  id: string,
  single: boolean
}

export default function ForumScreen() {
  return (
    <Stack.Navigator initialRouteName="main">
      <Stack.Screen name="main" component={MainForum} options={{ headerShown: false }}/>
      <Stack.Screen name="individual" component={Individual} />
      <Stack.Screen name="create" component={CreatePost}/>
      <Stack.Screen name="report" component={Report}/>
    </Stack.Navigator>
  );
}


function MainForum({navigation}: ForumScreenProps){

  const data = testData; //from database instead
  return (
    <View style={{ flex: 1 , paddingTop:70}}>
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
    <SafeAreaView style={{ paddingTop: 20 }}>
    <View style={{ 
      backgroundColor: 'cdefff', borderColor: 'black', borderWidth: 2.5, borderRadius: 10 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 17 }}>
      {toDisplay.author}: {toDisplay.title}
      </Text>
      <Text style ={{fontSize : 15}}>
      {toDisplay.body}
      </Text>
      {(toDisplay.attached.length != 0) &&
      <View>
        <View style={{height: 10}}/>
        <Text style ={{fontWeight:"bold"}}>Attachments: </Text>
        <FlatList
              data={toDisplay.attached}
              keyExtractor={item => item.id} 
              renderItem={({item}) => {
              const obj = item.single? mockqndatabase.find((ele)=>item.id == ele.id): mockqzdatabase.find((ele)=> item.id === ele.id);
              return (<Text style={styles.link} onPress={()=>alert("This should be saved, logic goes here")}>Save { item.single? "Question":"Quiz"}: {obj.title} </Text>)
              }}/>
      </View>}
      <View style={{height: 10}}/>
      <View style={{justifyContent:"flex-end"}}>
      <Button title="Report" onPress={()=>{
        const id = toDisplay.id;
        const contenttype = "post";
        navigation.navigate("report", {reportid: id, contenttype: contenttype});
      }}/>
      </View>
    </View>
    <View style={{ flexDirection:"row", justifyContent: 'center', width: "100%"}}>
      <TextInput style={[styles.input,{width:"80%"}]}
        placeholder="What do you have to say?"
        multiline={true}
        value={replyText}
        onChangeText={setReply}/>
      <Button title="Reply"/> 
    </View>
    {/*instead of passing whole replies, should pass in only reply id string perhaps*/}
    <FlatList
      data={toDisplay.replies}
      keyExtractor={item => item.id} 
      renderItem={({item}) => 
        <View style = {{backgroundColor: '#cdeeee',
              padding: 10,
              borderRadius: 10,flexDirection:"row", flex:1}}>
          <Text style ={{fontSize: 12, flex:4}}>
          {item.author}: {item.body} 
          </Text>
          <View style={{flex:1}}>
          <Button title="Report" onPress = {()=>{
            const id = item.id;
            const contenttype = "reply";
            navigation.navigate("report", {reportid: id, contenttype: contenttype})
          }}/>
          </View>
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

/* the report screen is not stylised yet btw*/

function Report({route,navigation}: ReportProps){

  var tempid: string;
  var temptype: string;

  if (!(route.params.reportid == undefined)){
    tempid = route.params.reportid;
    temptype = route.params.contenttype;
  }
  
  const [reportText, setReport] = useState('');
  return(
    <View style={{gap:5, paddingTop:20}}>
      <Text style={{textAlign: "left"}}>Report a {temptype} </Text>
      <TextInput
        style={styles.input}
        multiline={true}
        placeholder="Enter Text Here..."
        onChangeText={setReport}
        value={reportText}
      />
      <View style={{ justifyContent:"flex-end", flexDirection:"row"}}>
      <Button title="Submit" onPress={()=>{alert("Something should go to database here"); navigation.goBack()}} />
      </View>
      <View style={{height: 10}}/>
      <View>
      <Text> Note for reports, please follow the general guidelines for what is reportable content. Blah blah.</Text>
      </View>
    </View>
  )

}


function CreatePost({navigation}: ForumScreenProps){
  const [postText, setPost] = useState("");
  const [title, setTitle] = useState("");
  const [render, setRender] = useState(0);
  const [attachments, setAttach] = useState<Attachments[]>([]);
  // const [attachments, setAttach] = useState(Array<{id:string,single:boolean}>);
  const [single,setSingle]=useState(true);
  const [saved,setSaved]=useState(true); 
  const [searchText, setSearchText] = useState('');

  if (render ===0){
  return(
      <View style = {{padding: 20, flex:1, gap: 10}}>
      <TextInput style={styles.input}
        placeholder="Give your post a title"
        value={title}
        onChangeText={setTitle}/>
      <TextInput style={styles.input}
        placeholder="What do you have to say?"
        multiline={true}
        value={postText}
        onChangeText={setPost}/>
      {attachments.length != 0 && <View>
        <FlatList
              data={attachments}
              keyExtractor={item => item.id} 
              renderItem={({item}) => {
              const obj = item.single? mockqndatabase.find((ele)=>item.id == ele.id): mockqzdatabase.find((ele)=> item.id === ele.id);
              return (<View style={{flexDirection:"row", gap:10}}>
                <Text>{ item.single? "question":"quiz"}: {obj.title} </Text>
                <TouchableOpacity onPress={()=>{
                  const temp = attachments.filter((ele)=> !(ele.id === item.id && ele.single === item.single));
                  setAttach(temp);
                }}> <MaterialIcons name="remove" size={15} color= "red"/></TouchableOpacity>
                </View>)
              }}/>
      </View>}
      <Button title ="Add attachment" onPress={()=> setRender(1)}/>
      <Button title ="Post" onPress={()=> navigation.goBack()}/>
    </View>
  )
    }

    else{
      return(
        <View style={{gap:15}}>
        <Text style={{ fontSize: 24}}> Choose type of attachment </Text> 
  <View style={{ flexDirection: "row" ,flex:1}}>
    <TouchableOpacity
      onPress={() => setSingle(true)}
      style={{ flex:1, backgroundColor: single === true ? '#6e3b6e' : '#f9c2ff' , height:50, justifyContent: 'center', alignItems: 'center' }}
    >
      <Text style={{ fontSize: 24, color: single === true ? 'white' : 'black', textAlign: 'center' }}>
        Questions
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setSingle(false)}
      style={{flex:1, backgroundColor: single === false ? '#6e3b6e' : '#f9c2ff',height:50 , justifyContent: 'center', alignItems: 'center'}}
    >
      <Text style={{ fontSize: 24, color: single === false ? 'white' : 'black', textAlign: 'center' }}>
        Quizzes
      </Text>
    </TouchableOpacity>
  </View>
  <View style={{ flexDirection: "row" ,flex:1}}>
    <TouchableOpacity
      onPress={() => setSaved(true)}
      style={{ flex:1, backgroundColor: saved === true ? '#6e3b6e' : '#f9c2ff' , height:50, justifyContent: 'center', alignItems: 'center' }}
    >
      <Text style={{ fontSize: 24, color: saved === true ? 'white' : 'black', textAlign: 'center' }}>
        Saved Only
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setSaved(false)}
      style={{flex:1, backgroundColor: saved === false ? '#6e3b6e' : '#f9c2ff',height:50 , justifyContent: 'center', alignItems: 'center'}}
    >
      <Text style={{ fontSize: 24, color: saved === false ? 'white' : 'black', textAlign: 'center' }}>
        All
      </Text>
    </TouchableOpacity>
  </View>

  <View style={{flexDirection:"row",backgroundColor:'white', flex:1}}>
      <TextInput
        style={{flex:10}}
        placeholder="Search..."
        onChangeText={setSearchText}
        value={searchText}
      />
      <TouchableOpacity style={{justifyContent:"center", flex:1}} onPress={() => alert("Some thing happens to trigger the render below to change")}>
        <MaterialIcons name="search" size={24} color="gray" />
      </TouchableOpacity>
    </View>
    <Button title="placeholder for test" onPress={()=>{
      // var temp = attachments;
      // temp.push({id: "quizid1", single: false});
      // setAttach(temp);
      
      // TODO: Jerrell fix this
      setRender(0);
    }}/>
  </View>
      )
    }
    
}
const testData = [
  {
    id: "dsdhsbdsjndskjds",
  title: "My nuts",
  topic: "Misc",
  body: "My nuts is a common term for balls or ballsack. I dont know can someone answer me please please please",
  votes: 0,
  author: "User1",
  replies: [{id: "fjnjdfnd",
  author: "User2",
  body: "ithinkuwrong"},{id: "nfjk",
  author: "User3",
  body: "okbye"}],
  attached: [{id:"quizid1", single: false}]
  },

  {
    id: 'someotherrandomstring',
    title: "His nuts",
  topic: "Misc",
  body: "Your nuts is a common term for balls or ballsack. I dont know can someone answer me please please please nasjfnjaknfkjmsfjksnfjsnjsnfkjsbhfjsknf shfbshfsjfnfsfnjsnfhsjfbsbfjs fsjfsk nskjnfjk kkfnjsknfjsnfjkn sjfnsjkn fsjknfkjsnfkjsnfjksn skfnsjknfjjodso",
  votes: 0,
  author: "User4",
  replies: [],
  attached: [{id:"quizid1", single: false}]
  },

  {
    id: "dsdhsbdsjnds",
  title: "My nuts",
  topic: "Misc",
  body: "My nuts is a common term for balls or ballsack. I dont know can someone answer me please please please",
  votes: 0,
  author: "User1",
  replies: [{id: "fjnjdfnd",
  author: "User2",
  body: "ithinkuwrong"},{id: "nfjk",
  author: "User3",
  body: "okbye"}],
  attached: [{id:"quizid2", single: false},{id: "qnid1",single: true}]
  },

  {
    id: "dsdh78ndskjds",
  title: "My nuts",
  topic: "Misc",
  body: "My nuts is a common term for balls or ballsack. I dont know can someone answer me please please please",
  votes: 0,
  author: "User1",
  replies: [{id: "fjnjdfnd",
  author: "User2",
  body: "ithinkuwrong"},{id: "nfjk",
  author: "User3",
  body: "okbye"}],
  attached:[]
  },

  {
    id: "dsyghbhjjds",
  title: "My nuts",
  topic: "Misc",
  body: "My nuts is a common term for balls or ballsack. I dont know can someone answer me please please please",
  votes: 0,
  author: "User1",
  replies: [{id: "fjnjdfnd",
  author: "User2",
  body: "ithinkuwrong"},{id: "nfjk",
  author: "User3",
  body: "okbye"}],
  attached:[]
  },

  {
    id: "74667ds",
  title: "My nuts",
  topic: "Misc",
  body: "My nuts is a common term for balls or ballsack. I dont know can someone answer me please please please",
  votes: 0,
  author: "User1",
  replies: [{id: "fjnjdfnd",
  author: "User2",
  body: "ithinkuwrong"},{id: "nfjk",
  author: "User3",
  body: "okbye"}],
  attached:[]
  },

  {
    id: "dsdhsbdsjndskjds",
  title: "My nuts",
  topic: "Misc",
  body: "My nuts is a common term for balls or ballsack. I dont know can someone answer me please please please",
  votes: 0,
  author: "User1",
  replies: [{id: "fjnjdfnd",
  author: "User2",
  body: "ithinkuwrong"},{id: "nfjk",
  author: "User3",
  body: "okbye"}],
  attached:[]
  },

  ];

  const mockqndatabase = [{id: "qnid1", title: "Question fun"}]
  const mockqzdatabase = [{id: "quizid1", title: "Quiz funner"}, {id: "quizid2", title: "Quiz funner2"}]