import { View, Text, Button, TouchableOpacity, TextInput, FlatList } from "react-native"
import { HomeStackParamList } from "@app/App"
import { useState } from "react"
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuizCard from "@app/components/quizcardonsearch";
import { returnUser } from '@app/context/AuthContext';
import axios from 'axios';

type PlayProps = NativeStackScreenProps<HomeStackParamList, "Play">

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

type FetchedQuizProps = {
  _id: string,
  title: string, 
  topic: string, 
  questions: Array<FetchedQuestionForQuiz>,
  author: string,
  rating: number,
  timesRated: number,
  timesTaken: number,
  isVerified?: boolean,
  dateCreated: string,
  __v: number
}

export default function PlayScreen({ route, navigation }: PlayProps) {
  const topic = ((route.params === undefined) || (route.params.topic === "Uncategorised" || route.params.topic === "")) ? "Uncategorised" : route.params.topic;
  const [searchFrom, setSearchFrom] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const user = returnUser();

  const fetchSavedQuizzes : () => Promise<Array<FetchedQuizProps>> = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchSavedQuizzes`, { params: { username: user } });
      return response.data.quizzes;
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

  const fetchCreatedQuizzes : () => Promise<Array<FetchedQuizProps>> = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchCreatedQuizzes`, { params: { username: user } });
      return response.data.quizzes;
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

  const fetchAllQuizzes : () => Promise<Array<FetchedQuizProps>> = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchAllQuizzes`);
      return response.data.quizzes;
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

  return (
    <View style={{ gap: 15 }}>
      <Text style={{ fontSize: 22 }}>Search quizzes in {topic} from? </Text>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={() => setSearchFrom("Saved")}
          style={{
            flex: 1,
            backgroundColor: searchFrom === "Saved" ? '#079A04' : '#D3ECD3', height: 50, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 10, borderBottomLeftRadius: 10
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
            backgroundColor: searchFrom === "Mine" ? '#079A04' : '#D3ECD3', height: 50, justifyContent: 'center', alignItems: 'center', borderTopEndRadius: 10, borderEndEndRadius: 10
          }}
        >
          <Text style={{ fontSize: 24, color: searchFrom === "Mine" ? 'white' : 'black', textAlign: 'center' }}>
            My Quizzes
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ gap: 25 }} />
      {searchFrom === "Mine" && <Text>*Note: You can only playtest your own quizzes and the scores will not be reflected in the leaderboards</Text>}
      <View style={{ flexDirection: "row", backgroundColor: 'white' }}>
        <TextInput
          style={{ flex: 10 }}
          placeholder="Search..."
          onChangeText={setSearchText}
          value={searchText}
        />
        <TouchableOpacity style={{ justifyContent: "center", flex: 1 }} onPress={ async () => {
          // Pull questions
          var response : Array<FetchedQuizProps> ;
          if (searchFrom === 'Saved') {
            response = await fetchSavedQuizzes();
          } else if (searchFrom === 'Mine') {
            response = await fetchCreatedQuizzes();
          } else {
            response = await fetchAllQuizzes();
          }

          // Maps response to quiz card props
          const finalQuizzes = response.map(quiz => {
            const id = quiz._id;
            const title = quiz.title;
            const topic = quiz.topic;
            const oneByOne = false;
            const authorid = quiz.author;
            const questions = quiz.questions.map(question => {
              const id = question._id;
              const mcq = question.questionType === 'MCQ';
              const quizstmt = question.questionBody;
              const corrans = mcq ? question.options.filter(opt => opt.isCorrect).map(opt => opt.answer) : question.correctOptions;
              const wrongs = mcq ? question.options.filter(opt => !opt.isCorrect).map(opt => opt.answer) : [];
              const noOption = question.noOptions;
              const maxAttempt = question.questionAttempts;
              const explainText = question.explainText;
              return { id, mcq, quizstmt, corrans, wrongs, noOption, maxAttempt, explainText };
            });
            return { id, title, topic, oneByOne, authorid, questions };
          });
          setQuizzes(finalQuizzes);
        }}>
          <MaterialIcons name="search" size={24} color="gray" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={quizzes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <QuizCard
          {...item}
          onPress={() => navigation.navigate("DisplayPlay", { qzprop: item })}
        />}
        ItemSeparatorComponent={(() => (
          <View
            style={{ height: 10 }}
          />
        ))} />
      <Button title="Go back" onPress={() => navigation.goBack()} />
    </View>
  )
};