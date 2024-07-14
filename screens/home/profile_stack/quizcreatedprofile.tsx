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
import { HistoryCard2 } from '@app/components/historycard';

const { height, width } = Dimensions.get("window");

type ProfileQzCProps = NativeStackScreenProps<HomeStackParamList, "Pquizcreated">

export const QuizCreateScreen = ({ route, navigation }: ProfileQzCProps) => {
  const [toDisplayQuizzes, setToDisplay] = useState(route.params.fetchedQz)
  const [topic, setTopic] = useState("Uncategorised")
  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: height * 0.07 }} />
      <Text style={{ fontSize: 23, fontWeight: "bold" }}>
        View Created Quizzes Here
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
          onPress={()=>setToDisplay(route.params.fetchedQz.filter((ele)=>ele.topic==topic))}>
          <MaterialIcons name="search" size={24} color="gray" />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {toDisplayQuizzes.map((item) => <View style={{ paddingTop: 10 }}>
          <HistoryCard2
            key={item.takenId}
            {...item.hprop}
            goToInd={() => navigation.navigate("Pquestioncreated", { quiz_id: item.id })} />
        </View>)}
      </ScrollView>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  )
}
