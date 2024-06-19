import * as React from 'react';
import { LineChart, PieChart } from 'react-native-chart-kit'
import { Button, Text, View, Switch, FlatList, SafeAreaView, StyleSheet, TextInput, ScrollView } from 'react-native';
import { styles } from '../App';
import { Dimensions } from "react-native";
import { useState } from 'react';
import CustomPicker from '../components/mypicker';
import HistoryCard, { HistoryProps } from '../components/historycard';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { TallyCard } from '../components/questioncard';

const {height,width} = Dimensions.get("window");

type HistoryStackNavigationParamList = {
  main: undefined,
  individual: {indivProps: HistoryProps}|undefined,
}

const Stack = createNativeStackNavigator<HistoryStackNavigationParamList>();

interface HistoryScreenProps extends NativeStackScreenProps<HistoryStackNavigationParamList>{}

type IndividualProps = NativeStackScreenProps<HistoryStackNavigationParamList,"individual">


export default function PlayHist() {
  return (
    <Stack.Navigator initialRouteName="main">
      <Stack.Screen name="main" component={MainHistory} options={{ headerShown: false }}/>
      <Stack.Screen name="individual" component={Individual} />
    </Stack.Navigator>
  );
}

function MainHistory({navigation}:HistoryScreenProps) {
  const [topic,setTopic] = useState("Uncategorised");
  const toShowData = (topic==="Uncategorised" || topic ==="")? testData: testData.filter(ele=>ele.topic === topic);
  return (
    <View style={{flex:1, paddingTop:20}}>
    <View style ={{zIndex:1}}>
      <CustomPicker
        options={options}
        selectedValue={topic}
        onValueChange={setTopic}
        label="View past quizzes by topic:"
      />
    </View>
    <ScrollView style={{ flex: 1, }}>
      <FlatList
        data={toShowData}
        keyExtractor={item => item.id} 
        renderItem={({item}) => <HistoryCard
        {...item}
        goToInd = {()=>navigation.navigate("individual", {indivProps: item})}/>} 
        ItemSeparatorComponent={()=><View style={{ height: 10 }} />}
      />
    </ScrollView>
    </View>
  )
}

function Individual({route,navigation}: IndividualProps){
  const toShowProps = (route.params === undefined)? {id:"",title:"", topic:"", questions: [], tally: []}: route.params.indivProps
  const toShow = Array.from({ length: toShowProps.questions.length}, (_, i) => [toShowProps.questions[i], toShowProps.tally[i]])
  return (
    <View style={{flex:1, paddingTop:20}}>
      <Text style={{fontSize:18, fontWeight:"bold"}}>{toShowProps.topic} : {toShowProps.title}</Text>
      <View style={{height: 0.05*height, flexDirection: "row"}}/>
      <ScrollView style={{ flex: 11, gap :10 }}>
          <FlatList
            ItemSeparatorComponent={
          (() => (
            <View
              style={{marginTop: 16}}
            />
          ))
        }
            data={toShow}
            keyExtractor={item => item[0].id} 
            renderItem={({item}) => <TallyCard
            {...item[0]}
            saved = {true}
            correct={item[1]}
            reportQn={1}
            saveQn={1}
            unsaveQn={1}
            />} 
          />
        </ScrollView>
      <Button title="Go Back" onPress={()=>navigation.goBack()}/>
    </View>
    
  )
  
}

const options = [
  { value: 'Uncategorised', label: 'Uncategorised' },
  { value: 'Coding', label: 'Coding' },
  { value: 'Math', label: 'Math' },
  { value: 'NUS Modules', label: 'NUS Modules' },
]

const testData = [
  {id: "hsbfhbfj", title: "myquiz", topic: "Coding", questions: [{id: "jddjs", mcq: false, maxAttempt: 1, quizstmt: "questio hcshcjkn", corrans: ["dhsbdh","dhsdh"], wrongs:[], noOption:2, explainText:"hdbsh"},{id: "jddjs2", mcq: false, maxAttempt: 1, quizstmt: "questio hcshcjkn", corrans: ["dhsbdh","dhsdh"], wrongs:[], noOption:2, explainText:"hdbsh"}], tally: [false,true], hasSaved: true},
  {id: "hsbfbfj", title: "myquiz2", topic: "Math", questions: [], tally: [], hasSaved: true}, 
  {id: "hsdjiofj", title: "myquiz3", topic: "Coding", questions: [], tally: [], hasSaved: false}
]


