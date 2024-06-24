import {View,Text, Button, TouchableOpacity, TextInput, FlatList} from "react-native"
import {styles, HomeScreenProps, HomeStackParamList} from "@app/App"
import { useState } from "react"
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuizCard from "@app/components/quizcardonsearch";

type PlayProps = NativeStackScreenProps<HomeStackParamList,"Play">

export default function PlayScreen({ route, navigation }: PlayProps) {
  const topic = ((route.params === undefined) || (route.params.topic === "Uncategorised"||route.params.topic ===""))? "Uncategorised": route.params.topic;
  const [searchFrom, setSearchFrom] = useState("All");
  const [searchText, setSearchText] = useState("");
  const toShow = testData //make it a function of the search from and search text, determines which database to pull from
    return (
      <View style={{ gap: 15 }}>
  <Text style={{ fontSize: 22 }}>Search quizzes in {topic} from? </Text>
  <View style={{ flexDirection: "row" }}> 
    <TouchableOpacity
      onPress={() => setSearchFrom("Saved")}
      style={{
        flex: 1,
        backgroundColor: searchFrom === "Saved" ? '#079A04' : '#D3ECD3' , height:50, justifyContent: 'center', alignItems: 'center',borderTopLeftRadius:10 , borderBottomLeftRadius:10
      }}
    >
      <Text style={{ fontSize: 24, color: searchFrom === "Saved" ? 'white' : 'black', textAlign: 'center' }}>
        Saved Only
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setSearchFrom("All")}
      style={{
        flex: 1,
        backgroundColor: searchFrom === "All" ? '#079A04' : '#D3ECD3',

        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Text style={{ fontSize: 24, color: searchFrom === "All" ? 'white' : 'black', textAlign: 'center' }}>
        All
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setSearchFrom("Mine")}
      style={{
        flex: 1, 
        backgroundColor: searchFrom === "Mine" ? '#079A04' : '#D3ECD3',height:50 , justifyContent: 'center', alignItems: 'center', borderTopEndRadius:10, borderEndEndRadius:10
      }}
    >
      <Text style={{ fontSize: 24, color: searchFrom === "Mine" ? 'white' : 'black', textAlign: 'center' }}>
        My Quizzes
      </Text>
    </TouchableOpacity>
  </View>
  <View style={{ gap: 25 }} />
  {searchFrom === "Mine" && <Text>*Note: You can only playtest your own quizzes and the scores will not be reflected in the leaderboards</Text>}
 <View style={{flexDirection:"row",backgroundColor:'white'}}>
      <TextInput
        style={{flex:10}}
        placeholder="Search..."
        onChangeText={setSearchText}
        value={searchText}
      />
      <TouchableOpacity style={{justifyContent:"center", flex:1}} onPress={() => alert("it should fetch all the quizzes from server containing search term")}>
        <MaterialIcons name="search" size={24} color="gray" />
      </TouchableOpacity>
    </View>
    <FlatList
              data={toShow}
              keyExtractor={item => item.id} 
              renderItem={({item}) => <QuizCard 
              {...item}
              onPress={()=>navigation.navigate("DisplayPlay", {qzprop: item})}
              />}
              ItemSeparatorComponent={(() => (
          <View
            style={{height: 10}}
          />
        ))}/>
        <Button title="Go back" onPress={()=>navigation.goBack()}/>
  </View>
    )};

const testQn = [{
  id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
  mcq: false,
  quizstmt : "2+2 = ?",
  corrans: ["4"],
  wrongs: [],
  noOption: 0,
  maxAttempt: 2,
  explainText: "Open ended questions are supported with an explanation"
},
{
  id: 'someotherrandomstring',
  mcq: false,
  quizstmt : "Solve for x: (x-1)(x-2) = 0",
  corrans: ["1","1.0","2","2.0"],
  wrongs: [],
  noOption: 0,
  maxAttempt: 3,
  explainText: "Open ended questions allow multiple answers"
},
{
  id: 'indisndsk',
  mcq: true,
  quizstmt : "Press true for correct answer",
  corrans: ["True"],
  wrongs: ["False"],
  noOption: 2,
  maxAttempt: 1,
  explainText: "We support multiple choice questions"
},
{
  id: '283ehuwduweduwh9f',
  mcq: true,
  quizstmt : "What is the fundamental group of the Klien bottle?",
  corrans: ["<a,b | a^2b^-2 = e>"],
  wrongs: ["Z", "Z x Z", "<a,b,c,d | aba^-1b^-1cdc^-1d^-1 = e>", "F(2)", "F(4)"],
  noOption: 4,
  maxAttempt: 2,
  explainText: "Users can also set the number of options, and the options will be randomised"
},
{
  id: 'indisndjiooisk',
  mcq: true,
  quizstmt : "Press true",
  corrans: ["False"],
  wrongs: ["True"],
  noOption: 2,
  maxAttempt: 2,
  explainText: "Users can also customise the number of attempts"
},
{
  id: '283euweduwh9f',
  mcq: false,
  quizstmt : "Here's a hard question: What is the name of this app?",
  corrans: ["enlighteNUS"],
  wrongs: [],
  noOption: 0,
  maxAttempt: 4,
  explainText: "More features to be implemented"
},]

const testData = [{
  id:"scroll",
  title:"scrolling",
  topic: "intro",
  questions: testQn,
  oneByOne: false,
  authorid: "the creator"
} ,
{
  id:"1by1",
  title:"nonscroll",
  topic: "intro",
  questions: testQn,
  oneByOne: true,
  authorid: "the creator"
} ]