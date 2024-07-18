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
    const quizprops = route.params.quizprops;
    return (
        <SafeAreaView style={{ flex: 1,  backgroundColor:"white" }}>
            <View style={{ height: height * 0.07 }} />
            <Text style={{ fontSize: 21, fontWeight: "bold" }}>{quizprops.topic} : {quizprops.title}</Text>
            <View style={{ height: 0.02 * height, flexDirection: "row" }} />
            <ScrollView style={{ height: height * 0.67, gap: 10 }}>
                {quizprops.questions.map((item) => <View style={{ paddingTop: 10 }}>
                    <HistoryTallyCard2
                        key={item.id}
                        {...item} percentageRight={item.numberCorrect / quizprops.timesTaken} mostCommonWrong={item.wrongAnswers}
                        />
                </View>)}
            </ScrollView>
            <Button title="Go Back" onPress={() => navigation.goBack()} />
        </SafeAreaView>
    )
}