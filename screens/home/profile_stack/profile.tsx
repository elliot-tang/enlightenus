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
  { value: 'All', label: 'All' },
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
  data: Array<{ count: number, topic: string }>
  onPress: () => void
  displayString: string
}

function BarCard(props: BarCardProps) {
  console.log(props.data);
  const colors = ['#FF5733', '#33FFD4', '#C685FD', '#FD85DE', "#B8B6B7"];
  function Bar(props: { ratio: number, color: string }) {
    return (
      <View
        style={{
          width: props.ratio * width * 0.8,
          height: 15,
          backgroundColor: props.color,
        }}
      />
    )
  }

  try {
    const sortedTopics = props.data.sort((x, y) => y.count - x.count);
    const totalQuizzes = props.data.reduce((x, y) => x + y.count, 0);
    const toDisplay = sortedTopics.slice(0, 3);
    if (props.data.length > 3) {
      var remaining = 0;
      for (var i = 3; i < props.data.length; i++) {
        remaining += props.data[i].count;
      }
      toDisplay.push({ count: remaining, topic: 'Others' });
    };

    return (
      <TouchableOpacity style={styles.touchable} onPress={props.onPress}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>{props.displayString}:</Text>
          <Text>{totalQuizzes}</Text>
        </View>
        <View style={{ height: 15 }} />
        <View style={{ flexDirection: "row", justifyContent: 'center' }}>
          {toDisplay.map((item) => (
            <Bar key={item.topic} ratio={item.count / totalQuizzes} color={colors[toDisplay.indexOf(item)]} />
          )
          )}
        </View>
        <View style={{ height: 15 }} />
        <View style={{ justifyContent: 'space-around' }}>
          {toDisplay.map((item) => (
            <View style={{ flexDirection: "row", alignItems: "center" }} key={item.topic}>
              <View style={{ height: 10, width: 10, backgroundColor: colors[toDisplay.indexOf(item)] }} />
              <Text> : {item.topic.charAt(0).toUpperCase() + item.topic.slice(1)}</Text>
            </View>
          )
          )}
        </View>
      </TouchableOpacity>)
  } catch (error) {
    console.error(error);
  }




  // // TODO: CHANGE
  // const barList = countOccurrences(props.data.map((item) => item.topic.toLowerCase()));
  // const total = props.data.length;
  // const toDisplayList = barList.slice(0, 4);
  // //adds in a final others column if too many unique topics
  // if (barList.length > 4) {
  //   toDisplayList.push(["others", total - toDisplayList.map((item) => item[1]).reduce((accumulator, currentValue) => accumulator + currentValue, 0)])
  // }
}

const placeholderCountQuizzes = [
  [{ count: 1, topic: 'Uncategorised' }],
  [{ count: 1, topic: 'Uncategorised' }],
  [{ count: 1, topic: 'Uncategorised' }],
  [{ count: 1, topic: 'Uncategorised' }]
];

const placeholderTakenScoreQuizzes = [
  {
    best: {
      avgScore: 100,
      topic: 'Uncategorised'
    },
    worst: {
      avgScore: 100,
      topic: 'Uncategorised'
    },
    avg: 100
  },
  {
    best: {
      avgScore: 100,
      topic: 'Uncategorised'
    },
    worst: {
      avgScore: 100,
      topic: 'Uncategorised'
    },
    avg: 100
  },
  {
    best: {
      avgScore: 100,
      topic: 'Uncategorised'
    },
    worst: {
      avgScore: 100,
      topic: 'Uncategorised'
    },
    avg: 100
  },
  {
    best: {
      avgScore: 100,
      topic: 'Uncategorised'
    },
    worst: {
      avgScore: 100,
      topic: 'Uncategorised'
    },
    avg: 100
  },
];


export const ProfileScreen = ({ navigation }: ProfileProps) => {
  const [fetchLimit, setFetchLimit] = useState<string | number>(null);
  const [quizStatsCreate, setQuizStatsCreate] = useState(placeholderCountQuizzes);
  const [quizStatsPlayed, setQuizStatsPlayed] = useState(placeholderCountQuizzes);
  const [quizStatsSaved, setQuizStatsSaved] = useState(placeholderCountQuizzes);
  const [quizStatsTakenScore, setQuizStatsTakenScore] = useState(placeholderTakenScoreQuizzes);
  const [quizStatsCreatedScore, setQuizStatsCreatedScore] = useState([0, 0, 0, 0]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const user = returnUser();

  useFocusEffect(
    React.useCallback(() => {
      async function loadQuizzes() {
        try {
          const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/getAnalytics`, { params: { username: user } });
          const { created, saved, taken, takenScores, createdScores } = response.data;
          setQuizStatsCreate(created);
          setQuizStatsSaved(saved);
          setQuizStatsPlayed(taken);
          setQuizStatsTakenScore(takenScores);
          setQuizStatsCreatedScore(createdScores);
          setLoaded(true);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const errorMessage: string = error.response?.data.message;
            alert(`Axios Error: ${errorMessage}`);
            console.error('Axios error:', error.message);
            console.error('Error response:', error.response?.data);
          } else {
            alert(`Unexpected error has occurred! Try again later \n \n Error: ${error.message}`);
            console.error('Unexpected error:', error);
          }
          setQuizStatsCreate([]);
          setQuizStatsSaved([]);
          setQuizStatsPlayed([]);
          setQuizStatsTakenScore([]);
          setLoaded(true);
        }
      }
      loadQuizzes();
    }, [])
  );

  var toDisplayCreate: Array<{ count: number, topic: string }> = quizStatsCreate[3];
  var toDisplaySaved: Array<{ count: number, topic: string }> = quizStatsSaved[3];
  var toDisplayTaken: Array<{ count: number, topic: string }> = quizStatsPlayed[3];
  var toDisplayTakenScore: { best: { avgScore: number, topic: string }, worst: { avgScore: number, topic: string }, avg: number } = quizStatsTakenScore[3];
  var toDisplayCreatedScore: number = quizStatsCreatedScore[3];
  switch (fetchLimit) {
    case 5:
      toDisplayCreate = quizStatsCreate[0];
      toDisplaySaved = quizStatsSaved[0];
      toDisplayTaken = quizStatsPlayed[0];
      toDisplayTakenScore = quizStatsTakenScore[0];
      toDisplayCreatedScore = quizStatsCreatedScore[0];
      break;

    case 10:
      toDisplayCreate = quizStatsCreate[1];
      toDisplaySaved = quizStatsSaved[1];
      toDisplayTaken = quizStatsPlayed[1];
      toDisplayTakenScore = quizStatsTakenScore[1];
      toDisplayCreatedScore = quizStatsCreatedScore[1];
      break;

    case 25:
      toDisplayCreate = quizStatsCreate[2];
      toDisplaySaved = quizStatsSaved[2];
      toDisplayTaken = quizStatsPlayed[2];
      toDisplayTakenScore = quizStatsTakenScore[2];
      toDisplayCreatedScore = quizStatsCreatedScore[2];
      break;

    case 'All':
      toDisplayCreate = quizStatsCreate[3];
      toDisplaySaved = quizStatsSaved[3];
      toDisplayTaken = quizStatsPlayed[3];
      toDisplayTakenScore = quizStatsTakenScore[3];
      toDisplayCreatedScore = quizStatsCreatedScore[3];
  }

  // TO DO ELLIOT: fetch actual quiz saved and quiz played

  if (loaded) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ height: 15, backgroundColor: "white" }} />
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
          <BarCard data={toDisplayCreate} onPress={() => navigation.navigate("Pquizcreated")} displayString={"Number of Quizzes Created"} />
          <View style={{ height: 15 }} />
          <BarCard data={toDisplayTaken} onPress={() => navigation.navigate("HomeTabs", { screen: "QuizHistory" })} displayString={"Number of Quizzes Played"} />
          <View style={{ height: 15 }} />
          <BarCard data={toDisplaySaved} onPress={() => navigation.navigate("Pquizsaved")} displayString={"Number of Quizzes Saved"} />
          <View style={{ height: 30 }} />
          <Text>Some statistics at a glance</Text>
          <View style={{ justifyContent: "center", alignItems: "center", gap: 5 }}>
            <View style={{ height: 15 }} />
            <Text>Your best performing topic is {toDisplayTakenScore.best.topic} with a score of {Math.round(toDisplayTakenScore.best.avgScore * 100) / 100}%</Text>
            <Text>Your worst performing topic is {toDisplayTakenScore.worst.topic} with a score of {Math.round(toDisplayTakenScore.worst.avgScore * 100) / 100}%</Text>
            <Text>On average, you scored {Math.round(toDisplayTakenScore.avg * 100) / 100}%</Text>
            <Text>On average, others scored {Math.round(toDisplayCreatedScore * 100) / 100}% on quizzes you made</Text>
          </View>
          <View style={{ height: 15 }} />
          <Button onPress={() => navigation.navigate("HomeTabs")} title={"Back Home"} />
        </ScrollView>
      </SafeAreaView>

      //TO DO ELLIOT: fetch actual stuff and put into data
    )
  } else {
    return (
      <View>
        <Text>
          Quizzes loading!
        </Text>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  touchable: {
    backgroundColor: '#99ff99',
    padding: 15,
    borderRadius: 10,
  },
});

//remark please pass another navigation in your invidicual screens with the stupids like QuestionCSreenProps etc etc.