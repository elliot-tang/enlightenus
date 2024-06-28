import React, { useState, useEffect } from 'react';
import { LineChart, PieChart } from 'react-native-chart-kit'
import { Button, Text, View, Switch, FlatList, SafeAreaView, StyleSheet, TextInput, ScrollView } from 'react-native';
import { styles } from '@app/App';
import { Dimensions } from "react-native";
import CustomPicker from '@app/components/mypicker';
import HistoryCard, { HistoryProps, QuestionPropsForHistory } from '@app/components/historycard';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { HistoryTallyCard } from '@app/components/questioncard';
import { returnUser } from '@app/context/AuthContext';
import axios from 'axios';

const { height, width } = Dimensions.get("window");

type HistoryStackNavigationParamList = {
  main: undefined,
  individual: { indivProps: HistoryProps } | undefined,
}

const Stack = createNativeStackNavigator<HistoryStackNavigationParamList>();

interface HistoryScreenProps extends NativeStackScreenProps<HistoryStackNavigationParamList> { }

type IndividualProps = NativeStackScreenProps<HistoryStackNavigationParamList, "individual">

function capitalizeFLetter(tochange: string) {
  return (tochange[0].toUpperCase() +
    tochange.slice(1));
}


export default function PlayHist() {
  return (
    <Stack.Navigator initialRouteName="main">
      <Stack.Screen name="main" component={MainHistory} options={{ headerShown: false }} />
      <Stack.Screen name="individual" component={Individual} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function MainHistory({ navigation }: HistoryScreenProps) {
  const [topic, setTopic] = useState("Uncategorised");
  const [quizStats, setQuizStats] = useState([]);
  const user = returnUser();

  // Loads 20 most recently taken quizzes into graph
  useEffect(() => {
    async function loadQuizzes() {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchTakenQuizzes`, { params: { username: user } });
      const quizzes = response.data.quizzes;
      console.log(quizzes);
      const data = quizzes.map(quiz => {
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
        return { id, title, topic, hasSaved, questions, score };
      });
      console.log(data);
      setQuizStats(data);
    }
    loadQuizzes();
  }, []);

  const toShowData = (topic === "Uncategorised" || topic === "") ? quizStats : quizStats.filter(ele => ele.topic === topic);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: height * 0.07 }} />
      <Text style={{ fontSize: 23, fontWeight: "bold" }}>
        View Previous Quizzes Here
      </Text>
      <View style={{ zIndex: 1 }}>
        <CustomPicker
          options={options}
          selectedValue={topic}
          onValueChange={setTopic}
          label="Topic:"
        />
      </View>
      <ScrollView style={{ flex: 1 }}>
        {toShowData.map((item) => <View style={{paddingTop:10}}>
          <HistoryCard
            key={item.id}
            {...item}
            goToInd={() => navigation.navigate("individual", { indivProps: item })} />
        </View>)}
      </ScrollView>
    </View>
  )
}

function Individual({ route, navigation }: IndividualProps) {
  const toShowProps = (route.params === undefined) ? { id: "", title: "", topic: "", questions: Array<QuestionPropsForHistory>(), score: 0 } : route.params.indivProps
  const toShow = toShowProps.questions
  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: height * 0.07 }} />
      <Text style={{ fontSize: 21, fontWeight: "bold" }}>{capitalizeFLetter(toShowProps.topic)} : {toShowProps.title}</Text>
      <View style={{ height: 0.05 * height, flexDirection: "row" }} />
      <ScrollView style={{ height: height * 0.67, gap: 10 }}>
        {toShow.map((item) => <View style={{paddingTop:10}}>
          <HistoryTallyCard
            {...item}
            saved={true}
            reportQn={() => alert('Currently under development!')}
            saveQn={() => alert('Currently under development!')}
            unsaveQn={() => alert('Currently under development!')}
          />
          </View>)}
      </ScrollView>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
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
  {
    id: "hsbfhbfj",
    title: "myquiz",
    topic: "Coding",
    questions: [
      {
        id: "jddjs",
        mcq: false,
        maxAttempt: 1,
        quizstmt: "questio hcshcjkn",
        corrans: ["dhsbdh", "dhsdh"],
        wrongs: [],
        noOption: 2,
        explainText: "hdbsh",
        responses: ['dhsdh'],
        isCorrect: true,
        noAttempts: 1
      },
      {
        id: "jddjs2",
        mcq: false,
        maxAttempt: 1,
        quizstmt: "questio hcshcjkn",
        corrans: ["dhsbdh", "dhsdh"],
        wrongs: [],
        noOption: 2,
        explainText: "hdbsh",
        responses: ['wrjhfe', 'effj'],
        isCorrect: false,
        noAttempts: 1
      }
    ],
    hasSaved: true,
    score: 1
  },
  { id: "hsbfbfj", title: "myquiz2", topic: "Math", questions: [], hasSaved: true, score: 0 },
  { id: "hsdjiofj", title: "myquiz3", topic: "Coding", questions: [], hasSaved: false, score: 0 }
]