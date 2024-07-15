import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, View, Image, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from 'axios';
import { HomeScreenProps } from '@app/App';
import { returnUser, useAuth } from '@app/context/AuthContext'

// Attribution for icons:
// - Math: https://www.flaticon.com/free-icons/math
// - Knowledge (book): https://www.flaticon.com/free-icons/books
// - Coding: https://www.flaticon.com/free-icons/html
// - All/No Category: https://www.flaticon.com/free-icons/forbidden

const { width, height } = Dimensions.get("window");

const chartConfig = {
  backgroundGradientFrom: "#B3E5FF",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#FFFFFF",
  backgroundGradientToOpacity: 10,
  color: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
  strokeWidth: 2, // optional
  barPercentage: 0.5,
  useShadowColorFromDataset: false, // optional
};

function StartScreen({ navigation }: HomeScreenProps) {
  const user: string = returnUser();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  }

  const [topic, setTopic] = useState("");
  const [quizStats, setQuizStats] = useState([]);
  const [home, setHome] = useState(true);

  // Loads 10 most recently taken quizzes into graph
  useFocusEffect(
    React.useCallback(() => {
      async function loadQuizzes() {
        try {
          console.log("Loading quizzes!");
          const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchTakenQuizzes`, { params: { username: user } });
          const quizzes = response.data.quizzes;
          const data = quizzes.map(quiz => {
            const topic = quiz.topic;
            const score = quiz.score;
            const totalQuestions = quiz.questions.length;
            const quizId = quiz._id;
            return {
              quizid: quizId,
              percent: score / totalQuestions,
              topic: topic,
            }
          });
          setQuizStats(data.slice(0, 10).reverse());
        } catch (error) {
          console.error('Error loading quizzes:', error);
          alert('Error loading quizzes!');
          setQuizStats([]);
        }
      }
      loadQuizzes();
    }, [])
  )

  // Data for analytics graphs
  const toShowdata =
    topic === "Uncategorised" || topic === ""
      ? quizStats
      : quizStats.filter((ele) => ele.topic.toUpperCase() === topic.toUpperCase());

  const data = {
    labels: Array(toShowdata.length).fill(""),
    datasets: [
      {
        data: toShowdata.map((ele) => ele.percent * 100),
        color: (opacity = 0.8) => `rgba(21, 114, 219, ${opacity})`, // optional
        strokeWidth: 2, // optional
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.banner}>
        <Text style={{ textAlign: 'center', fontSize: 24 }}>
          Welcome back, {user}!
        </Text>

        <Button title="Logout" color="#6cac48" onPress={handleLogout} />
      </View>

      <Image
        style={{ height: 0.15 * height, width: width }}
        source={require("@app/assets/banner.png")}
      />

      <View style={{ height: 0.05 * height, flexDirection: "row" }}>
        <Text style={{ fontSize: 30, textAlign: "left" }}>
          {topic ? topic : "Select a Category"}
        </Text>
      </View>

      <View style={{ flexDirection: "row", width: 0.73 * width, height: 0.15 * height }}>
        <ScrollView horizontal={true} persistentScrollbar={true}>

        <TouchableOpacity style={styles.imageContainer} onPress={()=>setTopic("Custom")}>
          <Image source={require("@app/assets/creativity.png")} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={{color :"white"}}>Custom Topic</Text>
          </View>
        </TouchableOpacity>

          <TouchableOpacity style={styles.imageContainer} onPress={() => setTopic("NUS Modules")}>
            <Image source={require("@app/assets/nuslogo.jpeg")} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={{ color: "white" }}>NUS Modules</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.imageContainer} onPress={() => setTopic("Coding")}>
            <Image source={require("@app/assets/browser.png")} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={{ color: "white" }}>Coding</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.imageContainer} onPress={() => setTopic("Math")}>
            <Image source={require("@app/assets/math.png")} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={{ color: "white" }}>Math</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.imageContainer} onPress={() => setTopic("General Knowledge")}>
            <Image source={require("@app/assets/open-book.png")} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={{ color: "white" }}>General Knowledge</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.imageContainer} onPress={() => setTopic("Uncategorised")}>
            <Image source={require("@app/assets/traffic-signal.png")} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={{ color: "white" }}>All</Text>
            </View>
          </TouchableOpacity>


        </ScrollView>
      </View>

      <View style={{ height: 0.03 * height }} />

      <View style={{ height: 0.14 * height, flexDirection: "row", gap: 10 }}>
        <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate("Play", { topic: topic })}>
          <MaterialIcons name="search" size={74} color="black" />
          <Text> Play </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate("Create", { topic: topic })}>
          <MaterialIcons name="add" size={74} color="black" />
          <Text> Add </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate("Profile")}>
          <MaterialIcons name="account-box" size={74} color="black" />
          <Text> Profile </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 0.03 * height }} />

      {toShowdata.length > 0 ? (
        <>
          <Text style={{ textAlign: "left", fontSize: 19 }}>
            Your recent performance in {["Uncategorised", "","Custom"].includes(topic) ? "everything" : topic}
          </Text>
          <View style={{ height: 0.01 * height }} />
          <View>
            {quizStats.length > 0 && (
              <LineChart
                data={data}
                width={0.8 * width}
                height={0.2 * height}
                chartConfig={chartConfig}
                yAxisSuffix="%"
              />
            )}
          </View>
        </>
      ) : (
        <Text style={{ textAlign: "center", fontSize: 19 }}>
          Take some quizzes to see your statistics!
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  banner: {
    height: 0.1 * height,
    flexDirection: "row",
    backgroundColor: "#73deff",
    alignItems: "center",
    gap: 16,
    width: "100%",
    justifyContent: "center",
  },

  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#cdeeff',
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
  },

  icon: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: 'black',
  }
})

export default StartScreen;