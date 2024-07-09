import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, View, ScrollView, TextInput } from 'react-native';
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

  // Loads 50 most recently taken quizzes into graph
  useFocusEffect(
    React.useCallback(() => {
      async function loadQuizzes() {
        try {
          const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchTakenQuizzes`, { params: { username: user } });
          const quizzes = response.data.quizzes;
          const quizIds = quizzes.map(quiz => quiz._id);
          const savedResponse = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/checkSavedQuizzes`, { username: user, quizIds: quizIds });
          const saved = savedResponse.data.savedQuizzes;
          const data = quizzes.map(quiz => {
            const takenId = quiz.takenId;
            const id = quiz._id;
            const title = quiz.title;
            const topic = quiz.topic;
            const hasSaved = saved.find(quizId => quizId.quizId === id).saved;
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
          setQuizStats(data);
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
          setQuizStats([]);
        }
      }
      loadQuizzes();
    }, [])
  );

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
        {toShowData.map((item) => <View style={{ paddingTop: 10 }}>
          <HistoryCard
            key={item.takenId}
            {...item}
            goToInd={() => navigation.navigate("individual", { indivProps: item })} />
        </View>)}
      </ScrollView>
    </View>
  )
}

function Individual({ route, navigation }: IndividualProps) {
  const toShowProps = (route.params === undefined) ? { id: "", title: "", topic: "", questions: Array<QuestionPropsForHistory>(), score: 0 } : route.params.indivProps
  const toShow = toShowProps.questions;
  const [reportPage, setReportPage] = useState<string>('');
  const [currentReportQn, setCurrentReportQn] = useState<string>('');
  const [reportstring, setReportstring] = useState<string>('');
  const user = returnUser();

  // Navigates to question report page, to be passed into History Tally Card
  const navigateReport: (questionId: string, questionBody: string) => void = (questionId: string, questionBody: string) => {
    setReportPage(questionId);
    setCurrentReportQn(questionBody);
  }

  const reportQuestion: () => Promise<string> = async () => {
    try {
      if (reportstring.trim() === '') {
        alert('Please provide a report reason!');
        setReportstring('');
      } else {
        const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/report/reportQuestion`, { username: user, questionId: reportPage, reportReason: reportstring });
        return response.data.reportId;
      }
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
    }
  }

  if (reportPage === '') {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: height * 0.07 }} />
        <Text style={{ fontSize: 21, fontWeight: "bold" }}>{toShowProps.topic} : {toShowProps.title}</Text>
        <View style={{ height: 0.05 * height, flexDirection: "row" }} />
        <ScrollView style={{ height: height * 0.67, gap: 10 }}>
          {toShow.map((item) => <View style={{ paddingTop: 10 }}>
            <HistoryTallyCard
              {...item}
              reportQn={() => navigateReport(item.id, item.quizstmt)}
            />
          </View>)}
        </ScrollView>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    )
  } else {
    // return the report page
    return (
      <View style={{ gap: 5, paddingTop: 30 }}>
        <Text style={{ fontSize: 30 }}>Report Question</Text>
        <Text style={{ textAlign: "left" }}>Question: {currentReportQn} </Text>
        <Text style={{ paddingTop: 10 }}>Please enter your report reason:</Text>
        <TextInput
          style={{
            height: 50,
            paddingHorizontal: 20,
            borderColor: "green",
            borderWidth: 1,
            borderRadius: 7
          }}
          multiline={true}
          placeholder="Enter Text Here..."
          onChangeText={setReportstring}
          value={reportstring}
        />
        <View style={{ justifyContent: "flex-end", flexDirection: "row" }}>
          <Button title="Submit" onPress={async () => {
            const response = await reportQuestion();
            if (response) {
              alert(`Question successfully reported! Report ID: ${response}`);
              setReportPage('');
              setCurrentReportQn('');
              setReportstring('');
            }
          }} />
        </View>
        <View style={{ height: 10 }} />
        <View>
          <Text>Note for reports, please follow the general guidelines for what is reportable content.</Text>
        </View>
        <Button title="Go back" onPress={() => {
          setReportPage('');
          setCurrentReportQn('');
          setReportstring('');
        }}></Button>
      </View>
    )
  }
}

const options = [
  { value: 'Uncategorised', label: 'Uncategorised' },
  { value: 'Coding', label: 'Coding' },
  { value: 'Math', label: 'Math' },
  { value: 'NUS Modules', label: 'NUS Modules' },
]