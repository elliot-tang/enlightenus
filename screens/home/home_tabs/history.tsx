import * as React from 'react';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Button, Text, View, Switch, FlatList, SafeAreaView, StyleSheet, TextInput } from 'react-native';
import { Dimensions } from "react-native";
import { useState } from 'react';
import CustomPicker from '../../../components/mypicker';
const screenWidth = Dimensions.get("window").width;

export default function PlayHist() {
  const [topic,setTopic] = useState("General");

  const toShowdata = topic==="General"? testData: testData.filter(ele=>ele.topic ===topic)
  const data = {
  labels: Array(toShowdata.length).fill(""),
  datasets: [
    {
      data: toShowdata.map(ele=>ele.percent),
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
      strokeWidth: 2 // optional
    }
  ],
  legend: [topic]
};
  const data2 = [

  {
    name: "Programming",
    population: testData.filter(ele => ele.topic==="Programming").length,
    color: "green",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  },
  {
    name: "Math",
    population: testData.filter(ele => ele.topic==="Math").length,
    color: "red",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  },
  {
    name: "Physics",
    population: testData.filter(ele => ele.topic==="Physics").length,
    color: "blue",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  },
  {
    name: "Uncategorised",
    population: testData.filter(ele => ele.topic==="General").length,
    color: "black",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  }
];
  return (
    <View style={{padding: 20, flex:1}}>
    <View style ={{zIndex:1}}>
      <CustomPicker
        options={options}
        selectedValue={topic}
        onValueChange={setTopic}
        label="View stats by topic:"
      />
    </View>
      <LineChart
        data={data}
        width={screenWidth}
        height={180}
        chartConfig={chartConfig}
      />
      <PieChart
        data={data2}
        width={screenWidth}
        height={180}
        chartConfig={chartConfig}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
      />
    </View>
  )
}

const chartConfig = {
  backgroundGradientFrom: "#1E2923",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#08130D",
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(0, 0, 16, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false, // optional
};

const options = [
  { value: 'General', label: 'General' },
  { value: 'Programming', label: 'Programming' },
  { value: 'Math', label: 'Math' },
  { value: 'Physics', label: 'Physics' },
]

/*get from database instead */
const testData = [
  {quizid: "sfnjsnfs",
  percent: 0.8,
  topic: "Physics"
  },
  {quizid: "fnk",
  percent: 0.95,
  topic: "Physics"
  },
  {quizid: "notmsynfjsk",
  percent: 0.5,
  topic: "Math"
  },
  {quizid: "mmmdjq",
  percent: 0.8,
  topic: "Math"
  },
  {quizid: "sfsfsfsf",
  percent: 0.7,
  topic: "Programming"
  },
  {quizid: "snkoss",
  percent: 0.76,
  topic: "Programming"
  },
  {quizid: "etiewof",
  percent: 0.81,
  topic: "Programming"
  },
  {quizid: "doug",
  percent: 0.32,
  topic: "General"
  },
  {quizid: "fjsfsl",
  percent: 0.89,
  topic: "General"
  },
]

