import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, View, FlatList, SafeAreaView, StyleSheet, TextInput, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@app/App';
import CustomPicker from '@app/components/mypicker';
import { StackedBarChart } from 'react-native-svg-charts';
import { returnUser } from '@app/context/AuthContext';
import axios from 'axios';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { HistoryCard3 } from '@app/components/historycard';

const { height, width } = Dimensions.get("window");

type ProfileQzSProps = NativeStackScreenProps<HomeStackParamList, "Pquizsaved">

export const QuizSavedScreen = ({ route, navigation }: ProfileQzSProps) => {
  const [toDisplayQuizzes, setToDisplay] = useState(route.params.fetchedQz)
  const [topic, setTopic] = useState("Uncategorised")
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ height: height * 0.07 }} />
      <Text style={{ fontSize: 23, fontWeight: "bold" }}>
        View Saved Quizzes Here
      </Text>
      <View style={{ flexDirection: "row", backgroundColor: 'white' }}>
        <TextInput
          style={{ flex: 5 }}
          placeholder="Search by topic..."
          onChangeText={setTopic}
          value={topic}
        />
        <TouchableOpacity
          style={{ justifyContent: "center", flex: 1 }}
          onPress={() => setToDisplay(route.params.fetchedQz.filter((ele) => ele.topic == topic))}>
          <MaterialIcons name="search" size={24} color="gray" />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {toDisplayQuizzes.map((item) => <View style={{ paddingTop: 10 }}>
          <HistoryCard3
            hasSaved={false} key={item._id}
            {...item}
            id={item._id}
            goToInd={() => navigation.navigate("Pquestionsaved", { quizprops: item })} />
        </View>)}
      </ScrollView>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  )
}