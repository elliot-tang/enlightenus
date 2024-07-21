import { StyleSheet, View, Text, ScrollView } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { HomeTabParamList } from './home_navigator';
import React from "react";

type Props = BottomTabScreenProps<HomeTabParamList, 'Leaderboard'>;

const InfoScreen: React.FC<Props> = ({ navigation }: Props) => {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.header}>What is EnligheNUS?</Text>
        <Text style={styles.body}>EnlighteNUS is an integrated quiz app that is tailored to help NUS students learn and have fun at the same time. The app is made to allow you, our users, to study or play in whatever way that bests suits you.
        </Text>
        <View style={{ gap: 5 }} />
        <Text style={styles.header}>Create Quizzes</Text>
        <Text style={styles.body}>On the home page, click the plus icon to add your questions. Feel free to add your original questions to the quiz. Alternatively, you may choose to add existing questions fromm other users, or have questions generated for you by AI.</Text>
        <View style={{ gap: 5 }} />
        <Text style={styles.header}>Play Quizzes</Text>
        <Text style={styles.body}>Click on the search icon to look for quizzes to play. You may choose to have questions be displayed one after another, or to be displayed all at once.</Text>
        <View style={{ gap: 5 }} />
        <Text style={styles.header}>Save Quizzes</Text>
        <Text style={styles.body}>At the end of each quiz, you may save the questions and quizzes. These will make them easier to access throghout the app.</Text>
        <View style={{ gap: 5 }} />
        <Text style={styles.header}>Profile</Text>
        <Text style={styles.body}>The profile displays statistics regarding the quizzes you created, and the quizzes you played. You can delete the quizzes you created, or unsave unwanted quizzes here.</Text>
        <View style={{ gap: 5 }} />
        <Text style={styles.header}>History</Text>
        <Text style={styles.body}>This page shows a history of the quizzes you played. Note that it may take some time to load all the quizzes so please be patient. You may also save quizzes in the history page.</Text>
        <View style={{ gap: 5 }} />
        <Text style={styles.header}>Forum</Text>
        <Text style={styles.body}>The forum allows users to discuss the contents of the quizzes or ask queries in general. To create a post, press the "Create New Post" button on the top of the screen. Users can choose to attach questions or quizzes to their post. Note that to attach an item, it must first be saved.</Text>
        <View style={{ gap: 5 }} />
        <Text style={styles.header}>Report Content</Text>
        <Text style={styles.body}>Inappropriate content will be routinely checked for and removed. Users may make a report on questions, forum posts and forum replies. Listed below are some rules around appropriate and inappropriate content:</Text>
        <Text style={styles.body}>1. Inaccurate information: Questions which accept incorrect answers and/or reject valid alternative answers can be reported. Furthermore, you may also make reports if you feel the question is too vague, contentious, or offfensive.</Text>
        <Text style={styles.body}>2. Personal information: Questions or forum posts which ask for user's personal information, or reveal personal information, are strictly forbidden</Text>
        <Text style={styles.body}>3. Bullying and Harassment: Questions or forum posts which target, mock, and harass other users are strictly forbidden</Text>
        <View style={{ gap: 15 }} />
        <Text style={styles.header}>Credits</Text>
        <Text>EnlighteNUS is jointly created by Elliot Tang and Jerrell Lim. The following icons were used with permission from flaticon.com</Text>
        <Text style={styles.body}> All/No Category: https://www.flaticon.com/free-icons/forbidden</Text>
        <Text style={styles.body}> Knowledge (book): https://www.flaticon.com/free-icons/books</Text>
        <Text style={styles.body}> Coding: https://www.flaticon.com/free-icons/html</Text>
        <Text style={styles.body}> Math: https://www.flaticon.com/free-icons/math</Text>
        <Text style={styles.body}> Custom: "https://www.flaticon.com/free-icons/custom"</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },

  header: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: "left"
  },

  body: {
    textAlign: "left"
  }
});

export default InfoScreen;