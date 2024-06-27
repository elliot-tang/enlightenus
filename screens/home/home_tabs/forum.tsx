import * as React from 'react';
import { Button, Text, View, Switch, FlatList, SafeAreaView, StyleSheet, TextInput, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ForumCard } from '@app/components/forumpostcard';
import { styles } from '@app/App';
import { useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const {height,width} = Dimensions.get("window");

type ForumStackNavigationParamList = {
  main: undefined,
  individual: {postid: string}|undefined,
  create: undefined,
  report: {reportid: string, contenttype: string}|undefined
}

interface AttachData {
   id: string;
  single: boolean 
}

const Stack = createNativeStackNavigator<ForumStackNavigationParamList>();

interface ForumScreenProps extends NativeStackScreenProps<ForumStackNavigationParamList>{}

type IndividualProps = NativeStackScreenProps<ForumStackNavigationParamList,"individual">

type ReportProps = NativeStackScreenProps<ForumStackNavigationParamList,"report">

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
    <View style={{ flex: 1 , paddingTop: height*0.07}}>
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
      backgroundColor: 'cdefff', borderColor: 'black', borderWidth: 2.5, borderRadius: 10, paddingTop: height*0.05 }}>
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
              return (<Text style={styles.link} onPress={()=>alert("Currently under development!")}>Save { item.single? "Question":"Quiz"}: {obj.title} </Text>)
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
          <Button title="report" onPress = {()=>{
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

function Report({route,navigation}: ReportProps){

  var tempid: string;
  var temptype: string;

  if (!(route.params.reportid == undefined)){
    tempid = route.params.reportid;
    temptype = route.params.contenttype;
  }
  
  const [reportText, setReport] = useState('');
  return(
    <View style={{gap:5}}>
      <Text style={styles.input}>Report a {temptype} </Text>
      <TextInput
        style={{width: '100%', borderWidth: 1, borderColor: 'green', borderRadius: 5,}}
        multiline={true}
        placeholder="Enter Text Here..."
        onChangeText={setReport}
        value={reportText}
      />
      <View style={{ justifyContent:"flex-end", flexDirection:"row"}}>
      <Button title="Submit" onPress={()=>{
        // TODO: Report forum post
        alert("Currently under development!"); 
        navigation.goBack()}} />
      </View>
      <View style={{height: 10}}/>
      <View>
      <Text> Note for reports, please follow the general guidelines for what is reportable content.</Text>
      </View>
    </View>
  )

}


function CreatePost({navigation}: ForumScreenProps){
  const [postText, setPost] = useState("");
  const [title, setTitle] = useState("");
  const [render, setRender] = useState(0);
  const [attachments, setAttach] = useState<AttachData[]>([]);
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
              renderItem={({ item }) => {
  // Find the matching object based on item.single and item.id
  const obj = item.single
    ? mockqndatabase.find((ele) => ele.id === item.id)
    : mockqzdatabase.find((ele) => ele.id === item.id);

  
  if (!obj) {
    return <View/>; 
  }

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Text>
        {item.single ? "question" : "quiz"}: {obj.title}
      </Text>
      <TouchableOpacity
        onPress={() => {
          
          const newAttachments = attachments.filter(
            (ele) => !(ele.id === item.id && ele.single === item.single)
          );
          // Update the state with the new array
          setAttach(newAttachments);
        }}
      >
        <MaterialIcons name="remove" size={15} color="red" />
      </TouchableOpacity>
    </View>
  );

              }}/>
      </View>}
      <Button title ="Add attachment" onPress={()=> setRender(1)}/>
      <Button title ="Post" onPress={()=> {alert('Currently under development!'); navigation.goBack();}}/>
    </View>
  )
    }

    else{
      return(
        <View style={{gap:15, flex:1, backgroundColor:"white", alignItems:"center"}}>
        <Text style={{ fontSize: 24}}> Choose type of attachment </Text> 
  <View style={{ flexDirection: "row" ,width:width*0.9, height: height*0.07}}>
    <TouchableOpacity
      onPress={() => setSingle(true)}
      style={{ flex:1, backgroundColor: single === true ? '#079A04' : '#D3ECD3' , height:height*0.06, justifyContent: 'center', alignItems: 'center' , borderTopLeftRadius:10 , borderBottomLeftRadius:10}}
    >
      <Text style={{ fontSize: 24, color: single === true ? 'white' : 'black', textAlign: 'center' }}>
        Questions
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setSingle(false)}
      style={{flex:1, backgroundColor: single === false ? '#079A04' : '#D3ECD3',height:height*0.06 , justifyContent: 'center', alignItems: 'center', borderTopEndRadius:10, borderEndEndRadius:10}}
    >
      <Text style={{ fontSize: 24, color: single === false ? 'white' : 'black', textAlign: 'center' }}>
        Quizzes
      </Text>
    </TouchableOpacity>
  </View>
  <View style={{ flexDirection: "row" ,width:width*0.9, height: height*0.07}}>
    <TouchableOpacity
      onPress={() => setSaved(true)}
      style={{ flex:1, backgroundColor: saved === true ? '#079A04' : '#D3ECD3' , height:height*0.06, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius:10 , borderBottomLeftRadius:10 }}
    >
      <Text style={{ fontSize: 24, color: saved === true ? 'white' : 'black', textAlign: 'center' }}>
        Saved Only
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setSaved(false)}
      style={{flex:1, backgroundColor: saved === false ? '#079A04' : '#D3ECD3',height:height*0.06, justifyContent: 'center', alignItems: 'center', borderTopEndRadius:10, borderEndEndRadius:10}}
    >
      <Text style={{ fontSize: 24, color: saved === false ? 'white' : 'black', textAlign: 'center' }}>
        All
      </Text>
    </TouchableOpacity>
  </View>
  <View style={{flexDirection:"row",backgroundColor:'white', height: height*0.05, width:width*0.9}}>
      <TextInput
        style={{flex:10}}
        placeholder="Search..."
        onChangeText={setSearchText}
        value={searchText}
      />
      <TouchableOpacity style={{justifyContent:"center", flex:1}} onPress={() => 
        alert("Currently under development")
      }>
        <MaterialIcons name="search" size={24} color="gray" />
      </TouchableOpacity>
    </View>
    <Button title="Placeholder to Add Attachment" onPress={()=>{
      var temp = attachments;
      temp.push({id: "quizid1", single: false});
      setAttach(temp);
      setRender(0);}}/>
</View>
      )
    }
    
}

const testData = [
  {
    id: "dsdhsbdsjndskjds",
  title: "Welcome to the Forum!",
  topic: "Misc",
  body: "This is a placeholder post to showcase the layout of the forum feature. Stay tuned for future developments!",
  votes: 0,
  author: "enlighteNUS",
  replies: [{id: "fjnjdfnd",
  author: "excitedUser1",
  body: "Wow! I am so excited!"},{id: "nfjk",
  author: "skepticalUser2",
  body: "Hopefully the UI gets better."}],
  attached: []
  },

  {
    id: "dsdhsbdsjndskfffjds",
  title: "This post has attachments",
  topic: "Misc",
  body: "Questions and quizzes can be shared via the upcoming attachment feature for users to save and share!",
  votes: 0,
  author: "enlighteNUS",
  replies: [{id: "fjnjdfnd",
  author: "excitedUser1",
  body: "Yay! I can't wait to share and save questions!"},{id: "nfjk",
  author: "excitedUser2",
  body: "Yay!"}],
  attached:[{id:"quizid1", single: false}]
  },

  ];


  const mockqndatabase = [{id: "qnid1", title: "Question fun"}]
  const mockqzdatabase = [{id: "quizid1", title: "Future Quiz"}, {id: "quizid2", title: "Quiz funner2"}]