import {View,Text, Button, TouchableOpacity, TextInput} from "react-native"
import {styles, HomeScreenProps} from "../App"
import { useState } from "react"
import MaterialIcons from "@expo/vector-icons/MaterialIcons";


function playScreenCard(){} 

export default function PlayScreen({ navigation }: HomeScreenProps) {
  const [searchFrom, setSearchFrom] = useState("All");
  const [searchText, setSearchText] = useState("")
    return (
      <View style={{gap:15}}>
        <Text style={{ fontSize: 24}}> Search questions from? </Text> 
  <View style={{ flexDirection: "row" ,flex:1}}>
    <TouchableOpacity
      onPress={() => setSearchFrom("Saved")}
      style={{ flex:1, backgroundColor: searchFrom === "Saved" ? '#6e3b6e' : '#f9c2ff' , height:50, justifyContent: 'center', alignItems: 'center' }}
    >
      <Text style={{ fontSize: 24, color: searchFrom === "Saved" ? 'white' : 'black', textAlign: 'center' }}>
        Saved Only
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setSearchFrom("All")}
      style={{flex:1, backgroundColor: searchFrom === "All" ? '#6e3b6e' : '#f9c2ff',height:50 , justifyContent: 'center', alignItems: 'center'}}
    >
      <Text style={{ fontSize: 24, color: searchFrom === "All" ? 'white' : 'black', textAlign: 'center' }}>
        All
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setSearchFrom("Mine")}
      style={{flex:1, backgroundColor: searchFrom === "Mine" ? '#6e3b6e' : '#f9c2ff',height:50 , justifyContent: 'center', alignItems: 'center'}}
    >
      <Text style={{ fontSize: 24, color: searchFrom === "Mine" ? 'white' : 'black', textAlign: 'center' }}>
        My Quizzes
      </Text>
    </TouchableOpacity>
  </View>
  {searchFrom === "Mine" && <Text>*Note: You can only playtest your own quizzes and the scores will not be reflected in the leaderboards</Text>}
  <View style={{flexDirection:"row",backgroundColor:'white', flex:1}}>
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
        <Button title="Go back" onPress={()=>navigation.goBack()}/>
  </View>
    )};

