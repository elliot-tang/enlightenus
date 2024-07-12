import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, View, FlatList, SafeAreaView, StyleSheet, TextInput, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeScreenProps, HomeStackParamList } from '@app/App';


//look up nested navigation doc for linking behaviour directly into a different screen....

//elliot agress with this wants an unsave and save only not too over engineer the quizsaved and quiz unsaved

//elliot agrees with average score, right wrong percentage, and (most) common wrong answers

//main has stats clickables, good clicks are quiz create (flatlist), quiz played (flatlist)
//click on one takes you to a flatlist no other clickable there :(

type ProfileProps = NativeStackScreenProps<HomeStackParamList, "Profile">

type ProfileStackNavigationParamList = {
    main: undefined,
    quizcreate: undefined,
    quizplayed: undefined,
    quizsaved: undefined,
    questioncreated: { quiz_id: string },
    questionplayed: {quiz_id: string},
    questionsaved: undefined,
  }

const ProStack = createNativeStackNavigator<ProfileStackNavigationParamList>();

interface ProfileScreenProps extends NativeStackScreenProps<ProfileStackNavigationParamList> { }

type QuestionCScreenProps = NativeStackScreenProps<ProfileStackNavigationParamList, "questioncreated">

type QuestionPScreenProps = NativeStackScreenProps<ProfileStackNavigationParamList, "questionplayed">

export const ProfileScreen = ({navigation}: ProfileProps) => {

  return (
    <Text> hfuh</Text>
  );

}