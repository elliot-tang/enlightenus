import React from 'react';
import { createContext } from "react";
import {
  Button,
  Text,
  View,
  Image,
  FlatList,
  SafeAreaView,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useState } from 'react';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LineChart } from 'react-native-chart-kit';
import { HomeScreenProps, styles } from '@app/App';
import { returnUser } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

// Attribution for icons:
// - Math: https://www.flaticon.com/free-icons/math
// - Knowledge (book): https://www.flaticon.com/free-icons/books
// - Coding: https://www.flaticon.com/free-icons/html
// - All/No Category: https://www.flaticon.com/free-icons/forbidden

const { width, height } = Dimensions.get("window");

// const user_id = "Demo User"; // To retrieve from database instead

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
  const user : string = returnUser();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  }

  const [topic, setSel] = useState("");

  const toShowdata =
    topic === "Uncategorised" || topic === ""
      ? testData
      : testData.filter((ele) => ele.topic === topic);

  const data = {
    labels: Array(toShowdata.length).fill(""),
    datasets: [
      {
        data: toShowdata.map((ele) => ele.percent * 100),
        color: (opacity = 1) => `rgba(21, 114, 219, 0.8, ${opacity})`, // optional
        strokeWidth: 2, // optional
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          height: 0.1 * height,
          flexDirection: "row",
          backgroundColor: "#73deff",
          alignItems: "center",
          gap: 16,
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Text style={{ textAlign: 'center', fontSize: 24 }}>
          Welcome back {user}!
        </Text>
        <Button title="Logout" color="black" onPress={handleLogout}/>
      </View>
      <Image
        style={{ height: 0.15 * height, width: width }}
        source={require("../assets/banner.png")}
      />
      <View style={{ height: 0.05 * height, flexDirection: "row" }}>
        <Text style={{ fontSize: 30, textAlign: "left" }}>
          {topic ? topic : "Select a Category"}
        </Text>
      </View>
      <View style={{ flexDirection: "row", width: 0.73 * width, height: 0.15 * height }}>
        <ScrollView horizontal={true}>
          <TouchableOpacity style={styles.imagecontainer} onPress={() => setSel("Uncategorised")}>
            {/* <Image source={require("./traffic-signal.png")} style={styles.image} /> */}
            <Image source={require("../assets/logo.png")} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={{ color: "white" }}>All</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imagecontainer} onPress={() => setSel("NUS Modules")}>
            {/* <Image source={require("./nuslogo.png")} style={styles.image} /> */}
            <Image source={require("../assets/logo.png")} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={{ color: "white" }}>NUS Modules</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imagecontainer} onPress={() => setSel("Coding")}>
            {/* <Image source={require("./browser.png")} style={styles.image} /> */}
            <Image source={require("../assets/logo.png")} style={styles.image} />
            <View style={styles.textContainer}>
            <Text style={{color :"white"}}>Coding</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imagecontainer} onPress={()=>setSel("Math")}>
          {/* <Image source={require("./math.png")} style={styles.image} /> */}
          <Image source={require("../assets/logo.png")} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={{color :"white"}}>Math</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imagecontainer} onPress={()=>setSel("General Knowledge")}>
          {/* <Image source={require("./open-book.png")} style={styles.image} /> */}
          <Image source={require("../assets/logo.png")} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={{color :"white"}}>General Knowledge</Text>
          </View>
        </TouchableOpacity>
        </ScrollView>
    <View style={{ height: 0.03 * height }} />
  </View>
  <View style={{ height: 0.14 * height, flexDirection: "row", gap: 10 }}>
    <TouchableOpacity style={styles.icon}>
      <MaterialIcons name="search" size={74} color="black" />
      <Text> Search </Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate("Create")}>
      <MaterialIcons name="add" size={74} color="black" />
      <Text> Add </Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate("Create")}>
      <MaterialIcons name="delete" size={74} color="black" />
      <Text> Delete </Text>
    </TouchableOpacity>
  </View>
  <View style={{ height: 0.03 * height }} />
  <Text style={{ textAlign: "left", fontSize: 19 }}>
    Your recent performance in {topic === "Uncategorised" || topic === "" ? "everything" : topic}
  </Text>
  <View style={{ height: 0.01 * height }} />
  <View>
    <LineChart
      data={data}
      width={0.8 * width}
      height={0.2 * height}
      chartConfig={chartConfig}
      yAxisSuffix="%"
    />
  </View>
</SafeAreaView>
);
}

const testData = [
  { quizid: "sfnjsnfs", percent: 0.8, topic: "NUS Modules" },
  { quizid: "fnk", percent: 0.95, topic: "NUS Modules" },
  { quizid: "notmsynfjsk", percent: 0.5, topic: "Math" },
  { quizid: "mmmdjq", percent: 0.8, topic: "Math" },
  { quizid: "sfsfsfsf", percent: 0.7, topic: "Coding" },
  { quizid: "snkoss", percent: 0.76, topic: "Coding" },
  { quizid: "etiewof", percent: 0.81, topic: "Coding" },
  { quizid: "doug", percent: 0.32, topic: "General Knowledge" },
  { quizid: "fjsfsl", percent: 0.89, topic: "General Knowledge" },
]; /* To retrieve from database instead */

export default StartScreen;