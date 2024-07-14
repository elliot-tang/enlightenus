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
import { HistoryTallyCard2 } from '@app/components/questioncard';

const { height, width } = Dimensions.get("window");

type ProfileQzCProps = NativeStackScreenProps<HomeStackParamList, "Pquestioncreated">

export const IndivCreateScreen = ({ route, navigation }: ProfileQzCProps) => {
    const quizId = route.params.quiz_id;
    //somehow axios will need to take the topic, title, questions based on just the id
    const toShow = {topic:"placeholder", title: "placeholder", questions: []}
    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: height * 0.07 }} />
            <Text style={{ fontSize: 21, fontWeight: "bold" }}>{toShow.topic} : {toShow.title}</Text>
            <View style={{ height: 0.05 * height, flexDirection: "row" }} />
            <ScrollView style={{ height: height * 0.67, gap: 10 }}>
                {toShow.questions.map((item) => <View style={{ paddingTop: 10 }}>
                    <HistoryTallyCard2
                        {...item}
                    />
                </View>)}
            </ScrollView>
            <Button title="Go Back" onPress={() => navigation.goBack()} />
            <Button title="Delete this Quiz" onPress={() => alert("Elliot helps")} />
        </View>
    )
}