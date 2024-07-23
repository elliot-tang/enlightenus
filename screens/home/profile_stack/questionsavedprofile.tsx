import React from 'react';
import { Button, Text, View, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@app/App';
import { SavedAnalyticsTallyCard } from '@app/components/questioncard';

const { height, width } = Dimensions.get("window");

type ProfileQzCProps = NativeStackScreenProps<HomeStackParamList, "Pquestionsaved">

export const IndivSavedScreen = ({ route, navigation }: ProfileQzCProps) => {
    const quizprops = route.params.quizprops;
    //somehow axios will need to take the topic, title, questions based on just the id
    const toShow = {topic:quizprops.topic, title: quizprops.title, questions: quizprops.questions}
    return (
        <SafeAreaView style={{ flex: 1,  backgroundColor:"white" }}>
            <View style={{ height: height * 0.07 }} />
            <Text style={{ fontSize: 21, fontWeight: "bold" }}>{toShow.topic} : {toShow.title}</Text>
            <View style={{ height: 0.02 * height, flexDirection: "row" }} />
            <ScrollView style={{ height: height * 0.67, gap: 10 }}>
                {toShow.questions.map((item) => <View style={{ paddingTop: 10 }}>
                    <SavedAnalyticsTallyCard
                        key={item.id}
                        {...item}
                    />
                </View>)}
            </ScrollView>
            <Button title="Go Back" onPress={() => navigation.goBack()} />
        </SafeAreaView>
    )
}