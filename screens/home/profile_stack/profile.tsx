import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, View, FlatList, SafeAreaView, StyleSheet, TextInput, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@app/App';
import CustomPicker from '@app/components/mypicker';
import { StackedBarChart } from 'react-native-svg-charts';
import { returnUser } from '@app/context/AuthContext';
import axios from 'axios';
import { QuestionPropsForHistory } from '@app/components/historycard';

const { height, width } = Dimensions.get("window");

const options = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: 'All' },
]

type ProfileProps = NativeStackScreenProps<HomeStackParamList, "Profile">

//elliot agress with this wants an unsave and save only not too over engineer the quizsaved and quiz unsaved

//elliot agrees with average score, right wrong percentage, and (most) common wrong answers

//main has stats clickables, good clicks are quiz create (flatlist), quiz played (flatlist)
//click on one takes you to a flatlist no other clickable there :(

interface FetchedQuestionForQuiz {
  _id: string;
  questionBody: string;
  __v: number;
  correctOptions?: string[];
  author: string;
  explainText?: string;
  dateCreated: string;
  questionType: string;
  questionAttempts: number;
  noOptions: number;
  options?: { answer: string, isCorrect?: boolean, _id?: string }[];
}

export type FetchedQuizPropsProfile = {
  _id: string,
  title: string,
  topic: string,
  questions: Array<QuestionPropsForHistory>,
  author: string,
  rating: number,
  timesRated: number,
  timesTaken: number,
  isVerified?: boolean,
  dateCreated: string,
  __v: number
}

type BarCardProps = {
  data: Array<FetchedQuizPropsProfile>,
  onPress: () => void
  displayString: string
}
function BarCard(props: BarCardProps) {
  function countOccurrences(arr: string[]) {
    const counts = {};
    for (const item of arr) {
      if (counts[item]) {
        counts[item]++;
      } else {
        counts[item] = 1;
      }
    }

    const sortedCounts = [];
    for (const item in counts) {
      sortedCounts.push([item, counts[item]]);
    }

    sortedCounts.sort((a, b) => b[1] - a[1]);
    return sortedCounts;
  }

  const barList = countOccurrences(props.data.map((item) => item.topic.toLowerCase()));
  const total = props.data.length;
  const toDisplayList = barList.slice(0,4);
  //adds in a final others column if too many unique topics
  if (barList.length > 4){
    toDisplayList.push(["others", total - toDisplayList.map((item)=>item[1]).reduce((accumulator, currentValue) => accumulator + currentValue, 0)])
  }
  const colors = ['#FF5733','#33FFD4','#C685FD','#FD85DE',"#B8B6B7"]

  function truncateString(str, maxLength) {
    if (str.length <= maxLength) {
      return str; // String is already within the limit, return it as is
    }
  
    return str.slice(0, maxLength) + "..."; // Truncate the string and add ellipses
  }

  function Bar(props: {ratio:number,color:string}){
    return(
      <View
    style={{
      width: props.ratio *width*0.8,
      height: 15,
      backgroundColor: props.color,
    }}
  />
    )
  }

  return (
  <TouchableOpacity style={styles.touchable} onPress={props.onPress}>
    <View style={{flexDirection:"row", justifyContent:"space-between"}}>
      <Text>{props.displayString}:</Text>
      <Text>{total}</Text>
    </View>
    <View style={{height: 15}}/>
    <View style={{flexDirection:"row", justifyContent:'center'}}>
      {toDisplayList.map((item)=> (
        <Bar key={item[0]} ratio={item[1]/total} color={colors[toDisplayList.indexOf(item)]}/>
      )
      )}
    </View>
    <View style={{height: 15}}/>
    <View style={{flexDirection:"row", justifyContent: 'space-around'}}>
      {toDisplayList.map( (item)=> (
        <View style={{flexDirection:"row", alignItems:"center"}} key={item[0]}>
          <View style={{height: 10, width: 10, backgroundColor: colors[toDisplayList.indexOf(item)]}}/>
          <Text> :{item[0].charAt(0).toUpperCase() + truncateString(item[0],9).slice(1)}</Text>
        </View>
      )
      )}
    </View>
  </TouchableOpacity>)
}

export const ProfileScreen = ({navigation}: ProfileProps) => {
  const [fetchLimit, setFetchLimit] = useState(50);
  const [quizStatsCreate, setQuizStatsCreate] = useState([]);
  const [quizStatsPlayed, setQuizStatsPlayed] = useState([]);
  const [quizStatsSaved , setQuizStatsSaved] = useState([]);
  const user = returnUser();

  // Loads 50 most recently taken quizzes into graph
  useFocusEffect(
    React.useCallback(() => {
      async function loadQuizzes() {
        try {
          const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchTakenQuizzes`, { params: { username: user } });
          const quizzes = response.data.quizzes;
          const data = quizzes.map(quiz => {
            const takenId = quiz.takenId;
            const id = quiz._id;
            const title = quiz.title;
            const topic = quiz.topic;
            const hasSaved = false; // TODO: Fetch, set as default for now
            const score = quiz.score;
            const questions = quiz.questions.map(qn => {
              const id = qn._id;
              const mcq = qn.questionType === 'MCQ';
              const maxAttempt = qn.questionAttempts;
              const quizstmt = qn.questionBody;
              const corrans = mcq ? qn.options.filter(option => option.isCorrect).map(option => option.answer) : qn.correctOptions;
              const wrongs = mcq ? qn.options.filter(option => !option.isCorrect).map(option => option.answer) : [];
              const noOption = qn.noOptions;
              const explainText = qn.explainText;
              const responses = qn.responses;
              const isCorrect = qn.isCorrect;
              const noAttempts = qn.noAttempts;
              return { id, mcq, maxAttempt, quizstmt, corrans, wrongs, noOption, explainText, responses, isCorrect, noAttempts };
            });
            return { takenId, id, title, topic, hasSaved, questions, score };
          });
          setQuizStatsCreate(data);
        } catch (error) {
          console.error('Error loading quizzes:', error);
          setQuizStatsCreate([]);
        }
      }
      loadQuizzes();
    }, [])
  );

  //TO DO ELLIOT: fetch actual quiz saved and quiz played


  return (
    <ScrollView style={{ flex: 1}}>
      <View style={{ height: 15 , backgroundColor:"white"}} />
      <Text style={{ fontSize: 13, fontWeight: "bold" }}>
        Number of items to show
      </Text>
      <View style={{ height: 15 }} />
      <View style={{ zIndex: 1 }}>
        <CustomPicker
          options={options}
          selectedValue={fetchLimit}
          onValueChange={setFetchLimit}
          label="Limit to:"
        />
      </View>
      <View style={{ height: 15 }} />
      <BarCard data={quizStatsCreate.slice(0,fetchLimit)} onPress={()=>navigation.navigate("Pquizcreated", {fetchedQz: quizStatsCreate.slice(0,fetchLimit)})} displayString={"Number of Quizzes Created"}/>
      <View style={{ height: 15 }} />
      <BarCard data={quizStatsPlayed.slice(0,fetchLimit)} onPress={()=>navigation.navigate("HomeTabs",{screen:"QuizHistory"})} displayString={"Number of Quizzes Played"}/>
      <View style={{ height: 15 }} />
      <BarCard data={quizStatsSaved.slice(0,fetchLimit)} onPress={()=>navigation.navigate("Pquizsaved", {fetchedQz:quizStatsSaved.slice(0,fetchLimit)})} displayString={"Number of Quizzes Saved"}/>
      <View style={{ height: 30 }} />
      <Text>Some statistics at a glance</Text>
      <View style={{justifyContent:"center", alignItems:"center", gap:5}}>
        <View style={{height:15}}/>
        <Text>Your best performing topic is xxx with a score of xxx</Text>
        <Text>Your worst performing topic is xxx with a score of xxx</Text>
        <Text>On average, you scored </Text>
        <Text>On average, others scored xxx on quizzes you made</Text>
      </View>
      <View style={{height:15}}/>
      <Button onPress={()=>navigation.navigate("HomeTabs")} title={"Back Home"}/>
    </ScrollView>
    //TO DO ELLIOT: fetch actual stuff and put into data
  )
}

const styles = StyleSheet.create({

  touchable: {
    backgroundColor: '#99ff99',
    padding: 15,
    borderRadius: 10,
  },
});

//remark please pass another navigation in your invidicual screens with the stupids like QuestionCSreenProps etc etc.