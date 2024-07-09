import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, View, Switch, FlatList, SafeAreaView, StyleSheet, TextInput, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ForumCard, ForumProps, ReplyProps } from '@app/components/forumpostcard';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AttachmentProps } from '@app/components/forumpostcard';
import axios from 'axios';
import { returnUser } from '@app/context/AuthContext';

const { height, width } = Dimensions.get("window");

type ForumStackNavigationParamList = {
  main: undefined,
  individual: { post: ForumProps } | undefined,
  create: undefined,
  report: { reportid: string, contenttype: string } | undefined
}

interface FetchedQuestion {
  _id: string;
  questionBody: string;
  __v: number;
  correctOptions?: string[];
  author: string;
  explainText?: string;
  dateCreated: string;
  questionType: string;
  options?: { answer: string, isCorrect?: boolean }[];
}

interface FetchedQuestionForQuiz {
  _id: string;
  questionBody: string;
  __v: number;
  correctOptions?: string[];
  author: string;
  explainText?: string;
  dateCreated: string;
  questionType: string;
  questionAttempts: number;
  noOptions: number;
  options?: { answer: string, isCorrect?: boolean, _id?: string }[];
}

type FetchedQuizProps = {
  _id: string,
  title: string,
  topic: string,
  questions: Array<FetchedQuestionForQuiz>,
  author: string,
  rating: number,
  timesRated: number,
  timesTaken: number,
  isVerified?: boolean,
  dateCreated: string,
  __v: number
}

const Stack = createNativeStackNavigator<ForumStackNavigationParamList>();

interface ForumScreenProps extends NativeStackScreenProps<ForumStackNavigationParamList> { }

type IndividualProps = NativeStackScreenProps<ForumStackNavigationParamList, "individual">

type ReportProps = NativeStackScreenProps<ForumStackNavigationParamList, "report">

export default function ForumScreen() {
  return (
    <Stack.Navigator initialRouteName="main">
      <Stack.Screen name="main" component={MainForum} options={{ headerShown: false }} />
      <Stack.Screen name="individual" component={Individual} options={{ headerShown: false }} />
      <Stack.Screen name="create" component={CreatePost} options={{ headerShown: false }} />
      <Stack.Screen name="report" component={Report} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}


function MainForum({ navigation }: ForumScreenProps) {

  const [posts, setPosts] = useState<Array<ForumProps>>([]);

  // Loads 50 most recent forum posts
  useFocusEffect(
    React.useCallback(() => {
      async function loadForumPosts() {
        try {
          // Fetches forum posts
          const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/forum/fetchAllPosts`);
          const posts = response.data.posts;

          // Maps into forum props
          const data = posts.map(post => {
            const id = post._id;
            const title = post.postTitle;
            const topic = post.postTopic;
            const body = post.postBody;
            const author = post.userId;
            const attached = post.attachments;
            return { id, title, topic, body, author, attached };
          })

          setPosts(data.reverse());
        } catch (error) {
          console.error('Error loading forum posts:', error);
          alert('Error loading forum posts!');
          setPosts([]);
        }
      }
      loadForumPosts();
    }, [])
  );

  return (
    <View style={{ flex: 1, paddingTop: height * 0.07 }}>
      <Button title="Create New Forum Discussion!" onPress={() => navigation.navigate("create")} />
      <View style={{ height: 25 }} />
      <ScrollView style={{ flex: 1 }}>
        {posts.map((item) => <View style={{ paddingTop: 10 }}>
          <ForumCard
            {...item}
            goToInd={() => navigation.navigate("individual", { post: item })} />
        </View>)}
      </ScrollView>
    </View>
  )
}

function Individual({ route, navigation }: IndividualProps) {
  const [replyText, setReply] = useState("");
  const [replies, setReplies] = useState<Array<ReplyProps>>([]);
  const user = returnUser();

  var temp: ForumProps;
  if (!(route.params.post == undefined)) {
    temp = route.params.post;
  }
  const toDisplay = temp;

  // Loads 50 most recent forum replies
  useFocusEffect(
    React.useCallback(() => {
      async function loadForumPosts() {
        try {
          // Fetches forum replies
          const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/forum/fetchPostReplies`, { params: { postId: toDisplay.id } });
          const replies = response.data.replies;

          // Maps into forum reply props
          const data = replies.map(post => {
            const id = post.replyId;
            const author = post.user;
            const body = post.replyBody;
            return { id, author, body };
          });

          setReplies(data);
        } catch (error) {
          console.error('Error loading forum replies:', error);
          alert('Error loading forum replies!');
          setReplies([]);
        }
      }
      loadForumPosts();
    }, [])
  );

  const saveAttachment: (attachment: AttachmentProps) => Promise<string> = async (attachment: AttachmentProps) => {
    try {
      if (attachment.attachmentType === 'Quiz') {
        const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/saveQuiz`, { username: user, quizId: attachment.attachmentId._id });
        return response.data.savedQuizId;
      } else if (attachment.attachmentType === 'MCQ' || attachment.attachmentType === 'OEQ') {
        const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/saveQuestion`, { username: user, questionId: attachment.attachmentId._id });
        return response.data.savedQuestionId;
      } else {
        throw 'Invalid attachment type';
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage: string = error.response?.data.message;
        alert(`Axios Error: ${errorMessage}`);
        console.error('Axios error:', error.message);
        console.error('Error response:', error.response?.data);
      } else if (error === 'Invalid attachment type') {
        alert(`Error saving attachment: Invalid attachment type ${attachment.attachmentType}!`);
        console.log(`Error saving attachment: Invalid attachment type ${attachment.attachmentType}!`);
      } else {
        alert(`Unexpected error has occurred! Try again later \n \n Error: ${error.message}`);
        console.error('Unexpected error:', error);
      }
    }
  };

  const pushReply: () => Promise<string> = async () => {
    try {
      if (replyText.trim() === '') {
        alert('Please type something!');
        setReply('');
      } else {
        const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/forum/createForumReply`, {
          username: user,
          postId: toDisplay.id,
          replyBody: replyText,
        });
        // Pushes to local display
        var getReplies = Array.from(replies);
        getReplies.push({
          id: response.data.replyId,
          author: user,
          body: replyText
        });
        setReplies(getReplies);
        setReply('');
        return response.data.replyId;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage: string = error.response?.data.message;
        alert(`Axios Error: ${errorMessage}`);
        console.error('Axios error:', error.message);
        console.error('Error response:', error.response?.data);
      } else {
        alert(`Unexpected error has occurred! Try again later \n \n Error: ${error.message}`);
        console.error('Unexpected error:', error);
      }
    }
  }

  return (
    <SafeAreaView>
      <View style={{ height: height * 0.07 }} />
      <View style={{
        backgroundColor: 'cdefff', borderColor: 'black', borderWidth: 2.5, borderRadius: 10,
      }}>
        <Text style={{ fontWeight: 'bold', fontSize: 17 }}>
          {toDisplay.author}: {toDisplay.title}
        </Text>
        <Text style={{ fontSize: 15 }}>
          {toDisplay.body}
        </Text>
        {(toDisplay.attached.length != 0) &&
          <View>
            <View style={{ height: 10 }} />
            <Text style={{ fontWeight: "bold" }}>Attachments: </Text>
            <FlatList
              data={toDisplay.attached}
              keyExtractor={item => item._id}
              renderItem={({ item }) => {
                return (<Text style={styles.link} onPress={async () => {
                  const response = await saveAttachment(item);
                  if (response) {
                    alert(`${item.attachmentType} saved! Saved attachment ID: ${response}`);
                    console.log(`${item.attachmentType} saved by user ${user}. Saved attachment ID: ${response}`);
                  }
                }}>Save {item.attachmentType}: {item.attachmentName} </Text>)
              }} />
          </View>}
        <View style={{ height: 10 }} />
        <View style={{ justifyContent: "flex-end" }}>
          <Button title="Report" onPress={() => {
            const id = toDisplay.id;
            const contenttype = "post";
            navigation.navigate("report", { reportid: id, contenttype: contenttype });
          }} />
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: 'center', width: "100%", paddingTop: 20, paddingBottom: 20 }}>
        <TextInput style={[styles.inputReply]}
          placeholder="What do you have to say?"
          multiline={true}
          value={replyText}
          onChangeText={setReply} />
        <Button title="Reply" onPress={async () => {
          const replyId = await pushReply();
          if (replyId) {
            console.log(`Reply to Forum Post ${toDisplay.id} by user ${user} pushed: Reply ID: ${replyId}`);
          }
        }} />
      </View>
      {/*instead of passing whole replies, should pass in only reply id string perhaps*/}
      <FlatList
        data={replies}
        keyExtractor={item => item.id}
        renderItem={({ item }) =>
          <View style={{
            backgroundColor: '#cdeeee',
            padding: 10,
            borderRadius: 10, flexDirection: "row", flex: 1
          }}>
            <Text style={{ fontSize: 12, flex: 4 }}>
              {item.author}: {item.body}
            </Text>
            <View style={{ flex: 1 }}>
              <Button title="report" onPress={() => {
                const id = item.id;
                const contenttype = "reply";
                navigation.navigate("report", { reportid: id, contenttype: contenttype })
              }} />
            </View>
          </View>}
        ItemSeparatorComponent={(() => (
          <View
            style={{ height: 10 }}
          />
        ))}
      />
      <View style={{ justifyContent: "flex-end", paddingTop: 10 }}>
        <Button title="Go Back" onPress={() => {
          navigation.navigate("main");
        }} />
      </View>
    </SafeAreaView>
  )
}

function Report({ route, navigation }: ReportProps) {

  var tempid: string;
  var temptype: string;

  if (!(route.params.reportid == undefined)) {
    tempid = route.params.reportid;
    temptype = route.params.contenttype;
  }

  const [reportText, setReport] = useState('');
  return (
    <View style={{ gap: 5 }}>
      <View style={{ height: height * 0.07 }} />
      <Text style={styles.headerText}>Report a {temptype} </Text>
      <TextInput
        style={{ width: '100%', borderWidth: 1, borderColor: 'green', borderRadius: 5, height: 100, textAlignVertical: "top" }}
        multiline={true}
        placeholder="Enter Text Here..."
        onChangeText={setReport}
        value={reportText}
      />
      <View style={{ justifyContent: "flex-end", flexDirection: "row" }}>
        <Button title="Submit" onPress={() => {
          // TODO: Report forum post
          alert("Currently under development!");
          navigation.goBack()
        }} />
      </View>
      <View style={{ height: 10 }} />
      <View>
        <Text> Note for reports, please follow the general guidelines for what is reportable content.</Text>
      </View>
    </View>
  )
}

function CreatePost({ navigation }: ForumScreenProps) {
  const [postText, setPost] = useState("");
  const [title, setTitle] = useState("");
  const [postTopic, setPostTopic] = useState("");
  const [render, setRender] = useState(0);
  const [attachments, setAttach] = useState<AttachmentProps[]>([]);
  const [single, setSingle] = useState(true);
  const [attachmentType, setAttachmentType] = useState('All');
  const [searchText, setSearchText] = useState('');
  const user = returnUser();
  const [questions, setQuestions] = useState<Array<FetchedQuestion>>([]);
  const [quizzes, setQuizzes] = useState<Array<FetchedQuizProps>>([]);

  const fetchSavedQuestions: () => Promise<FetchedQuestion> = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchSavedQuestions`, { params: { username: user } });
      const questions = response.data;
      return questions.questions;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage: string = error.response?.data.message;
        alert(`Axios Error: ${errorMessage}`);
        console.error('Axios error:', error.message);
        console.error('Error response:', error.response?.data);
      } else {
        alert(`Unexpected error has occurred! Try again later \n \n Error: ${error.message}`);
        console.error('Unexpected error:', error);
      }
    }
  }

  const fetchCreatedQuestions: () => Promise<FetchedQuestion> = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchCreatedQuestions`, { params: { username: user } });
      const questions = response.data;
      return questions.questions;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage: string = error.response?.data.message;
        alert(`Axios Error: ${errorMessage}`);
        console.error('Axios error:', error.message);
        console.error('Error response:', error.response?.data);
      } else {
        alert(`Unexpected error has occurred! Try again later \n \n Error: ${error.message}`);
        console.error('Unexpected error:', error);
      }
    }
  }

  const fetchAllQuestions: () => Promise<FetchedQuestion> = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchAllQuestions`);
      const questions = response.data;
      return questions.questions;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage: string = error.response?.data.message;
        alert(`Axios Error: ${errorMessage}`);
        console.error('Axios error:', error.message);
        console.error('Error response:', error.response?.data);
      } else {
        alert(`Unexpected error has occurred! Try again later \n \n Error: ${error.message}`);
        console.error('Unexpected error:', error);
      }
    }
  }

  const fetchSavedQuizzes: () => Promise<Array<FetchedQuizProps>> = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchSavedQuizzes`, { params: { username: user } });
      return response.data.quizzes;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage: string = error.response?.data.message;
        alert(`Axios Error: ${errorMessage}`);
        console.error('Axios error:', error.message);
        console.error('Error response:', error.response?.data);
      } else {
        alert(`Unexpected error has occurred! Try again later \n \n Error: ${error.message}`);
        console.error('Unexpected error:', error);
      }
    }
  }

  const fetchCreatedQuizzes: () => Promise<Array<FetchedQuizProps>> = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchCreatedQuizzes`, { params: { username: user } });
      return response.data.quizzes;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage: string = error.response?.data.message;
        alert(`Axios Error: ${errorMessage}`);
        console.error('Axios error:', error.message);
        console.error('Error response:', error.response?.data);
      } else {
        alert(`Unexpected error has occurred! Try again later \n \n Error: ${error.message}`);
        console.error('Unexpected error:', error);
      }
    }
  }

  const fetchAllQuizzes: () => Promise<Array<FetchedQuizProps>> = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/fetchAllQuizzes`);
      return response.data.quizzes;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage: string = error.response?.data.message;
        alert(`Axios Error: ${errorMessage}`);
        console.error('Axios error:', error.message);
        console.error('Error response:', error.response?.data);
      } else {
        alert(`Unexpected error has occurred! Try again later \n \n Error: ${error.message}`);
        console.error('Unexpected error:', error);
      }
    }
  }

  const pushPost: () => Promise<string> = async () => {
    try {
      if (title.trim() === '') {
        alert('Please provide a post title!');
        setTitle('');
      } else if (postTopic.trim() === '') {
        alert('Please provide a post topic!');
        setPostTopic('');
      } else if (postText.trim() === '') {
        alert('Please provide a post body!');
        setPost('');
      } else {
        const mappedAttachments = attachments.map(attachment => {
          const attachmentType = attachment.attachmentType === 'MCQ' || attachment.attachmentType === 'OEQ'
            ? 'Question'
            : attachment.attachmentType === 'Quiz'
              ? 'Quiz'
              : 'Invalid';
          if (attachmentType === 'Invalid') {
            alert(`Invalid attachmentType ${attachment.attachmentType} for attachment ${attachment.attachmentName}, please remove it`);
          } else {
            return {
              attachmentId: attachment.attachmentId._id,
              attachmentType: attachmentType,
              attachmentName: attachment.attachmentName,
            };
          }
        });
        const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/forum/createForumPost`, {
          username: user,
          postTitle: title,
          postTopic,
          postBody: postText,
          attachments: mappedAttachments,
        });
        setTitle('');
        setPostTopic('');
        setPost('');
        setAttach([]);
        return response.data.postId;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage: string = error.response?.data.message;
        alert(`Axios Error: ${errorMessage}`);
        console.error('Axios error:', error.message);
        console.error('Error response:', error.response?.data);
      } else {
        alert(`Unexpected error has occurred! Try again later \n \n Error: ${error.message}`);
        console.error('Unexpected error:', error);
      }
    }
  }

  if (render === 0) {
    return (
      <View style={{ padding: 20, flex: 1, gap: 10 }}>
        <View style={{ height: height * 0.07 }} />
        <Text style={styles.headerText}>Add a new post!</Text>
        <TextInput style={styles.input}
          placeholder="Give your post a title"
          value={title}
          onChangeText={setTitle} />
        <TextInput style={styles.input}
          placeholder="Give your post a topic"
          multiline={true}
          value={postTopic}
          onChangeText={setPostTopic} />
        <TextInput style={styles.input}
          placeholder="What do you have to say?"
          multiline={true}
          value={postText}
          onChangeText={setPost} />

        {attachments.length != 0 && <View>
          <FlatList
            data={attachments}
            keyExtractor={item => item._id}
            renderItem={({ item }) => {
              return (
                <View style={{ flexDirection: "row" }}>
                  <View style={{ flex: 10 }}>
                    <Text>
                      Attached {item.attachmentType}: {item.attachmentName}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <TouchableOpacity
                      onPress={() => {
                        const newAttachments = attachments.filter(
                          attachment => attachment.attachmentId._id !== item.attachmentId._id
                        );
                        setAttach(newAttachments);
                      }}
                    >
                      <MaterialIcons name="remove" size={15} color="red" />
                    </TouchableOpacity>
                  </View>

                </View>
              );
            }} />
        </View>}
        <Button title="Add attachment" onPress={() => setRender(1)} />
        <Button title="Post" onPress={async () => {
          const postId = await pushPost();
          if (postId) {
            alert('Your post has been created!');
            console.log(`Forum Post ID: ${postId} created by user ${user}`);
            navigation.goBack();
          }
        }} />
        <Button title="Go Back" onPress={() => navigation.navigate('main')} />
      </View>
    )
  }

  else {
    return (
      <View style={{ gap: 15, flex: 1, backgroundColor: "white", alignItems: "center" }}>
        <View style={{ height: height * 0.07 }} />
        <Text style={{ fontSize: 24 }}> Choose type of attachment </Text>
        <View style={{ flexDirection: "row", width: width * 0.9, height: height * 0.07 }}>
          <TouchableOpacity
            onPress={() => setSingle(true)}
            style={{ flex: 1, backgroundColor: single === true ? '#079A04' : '#D3ECD3', height: height * 0.06, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }}
          >
            <Text style={{ fontSize: 24, color: single === true ? 'white' : 'black', textAlign: 'center' }}>
              Questions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSingle(false)}
            style={{ flex: 1, backgroundColor: single === false ? '#079A04' : '#D3ECD3', height: height * 0.06, justifyContent: 'center', alignItems: 'center', borderTopEndRadius: 10, borderEndEndRadius: 10 }}
          >
            <Text style={{ fontSize: 24, color: single === false ? 'white' : 'black', textAlign: 'center' }}>
              Quizzes
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", width: width * 0.9, height: height * 0.07 }}>
          <TouchableOpacity
            onPress={() => setAttachmentType('Saved')}
            style={{ flex: 1, backgroundColor: attachmentType === 'Saved' ? '#079A04' : '#D3ECD3', height: height * 0.06, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }}
          >
            <Text style={{ fontSize: 24, color: attachmentType === 'Saved' ? 'white' : 'black', textAlign: 'center' }}>
              Saved Only
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAttachmentType('Created')}
            style={{ flex: 1, backgroundColor: attachmentType === 'Created' ? '#079A04' : '#D3ECD3', height: height * 0.06, justifyContent: 'center', alignItems: 'center', }}
          >
            <Text style={{ fontSize: 24, color: attachmentType === 'Created' ? 'white' : 'black', textAlign: 'center' }}>
              Created
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAttachmentType('All')}
            style={{ flex: 1, backgroundColor: attachmentType === 'All' ? '#079A04' : '#D3ECD3', height: height * 0.06, justifyContent: 'center', alignItems: 'center', borderTopEndRadius: 10, borderEndEndRadius: 10 }}
          >
            <Text style={{ fontSize: 24, color: attachmentType === 'All' ? 'white' : 'black', textAlign: 'center' }}>
              All
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", backgroundColor: 'white', height: height * 0.05, width: width * 0.9 }}>
          <TextInput
            style={{ flex: 10 }}
            placeholder="Search..."
            onChangeText={setSearchText}
            value={searchText}
          />
          <TouchableOpacity style={{ justifyContent: "center", flex: 1 }} onPress={async () => {
            if (single) {
              var fetched;
              if (attachmentType === 'Saved') {
                fetched = await fetchSavedQuestions();
              } else if (attachmentType === 'Created') {
                fetched = await fetchCreatedQuestions();
              } else {
                fetched = await fetchAllQuestions();
              }
              setQuestions(fetched);
            } else {
              var fetched;
              if (attachmentType === 'Saved') {
                fetched = await fetchSavedQuizzes();
              } else if (attachmentType === 'Created') {
                fetched = await fetchCreatedQuizzes();
              } else {
                fetched = await fetchAllQuizzes();
              }
              setQuizzes(fetched);
            }
          }
          }>
            <MaterialIcons name="search" size={24} color="gray" />
          </TouchableOpacity>
        </View>
        {single ? (<ScrollView>
          {questions.map((item) => <View style={{ paddingTop: 10 }}>
            <TouchableOpacity style={{
              backgroundColor: '#cdefff',
              padding: 15,
              borderRadius: 10,
            }} onPress={() => {
              var getAttachments = Array.from(attachments);
              if (getAttachments.find(attachment => attachment.attachmentId._id === item._id)) {
                alert('Question has already been added as an attachment to forum post!');
              } else {
                // Map to AttachmentProps
                const attachment = {
                  attachmentId: item,
                  attachmentType: item.questionType,
                  attachmentName: item.questionBody, // TODO: Allow user to specify in Modal
                }
                getAttachments.push(attachment);
                setAttach(getAttachments);
                setRender(0);
              }
            }
            }>
              <Text>{item.questionType}: {item.questionBody}</Text>
              <Text style={{ fontSize: 10 }}>By {item.author}</Text>
            </TouchableOpacity>
          </View>)}
        </ScrollView>) : (
          <ScrollView>
            {quizzes.map(item => <View style={{ paddingTop: 10 }}>
              <TouchableOpacity style={{
                backgroundColor: '#cdefff',
                padding: 15,
                borderRadius: 10,
              }} onPress={() => {
                var getAttachments = Array.from(attachments);
                if (getAttachments.find(attachment => attachment.attachmentId._id === item._id)) {
                  alert('Quiz has already been added as an attachment to forum post!');
                } else {
                  // Map to AttachmentProps
                  const attachment = {
                    attachmentId: item,
                    attachmentType: 'Quiz',
                    attachmentName: item.title, // TODO: Allow user to specify in Modal
                  }
                  getAttachments.push(attachment);
                  setAttach(getAttachments);
                  setRender(0);
                }
              }}>
                <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{item.topic}: {item.title} </Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Created by {item.author} </Text>
              </TouchableOpacity>
            </View>)}
          </ScrollView>
        )}
        <Button title="Go Back" onPress={() => {
          setRender(0);
        }} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  inputReply: {
    flex: 1,
    height: 50,
    paddingHorizontal: 20,
    borderColor: "green",
    borderWidth: 1,
    borderRadius: 7
  },

  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "green",
    borderWidth: 1,
    borderRadius: 7
  },

  link: {
    color: "blue",
  },

  headerText: {
    fontSize: 17,
    fontWeight: "bold",
  }
})

// const testData = [
//   {
//     id: "dsdhsbdsjndskjds",
//     title: "Welcome to the Forum!",
//     topic: "Misc",
//     body: "This is a placeholder post to showcase the layout of the forum feature. Stay tuned for future developments!",
//     author: "enlighteNUS",
//     replies: [{
//       id: "fjnjdfnd",
//       author: "excitedUser1",
//       body: "Wow! I am so excited!"
//     }, {
//       id: "nfjk",
//       author: "skepticalUser2",
//       body: "Hopefully the UI gets better."
//     }],
//     attached: []
//   },

//   {
//     id: "dsdhsbdsjndskfffjds",
//     title: "This post has attachments",
//     topic: "Misc",
//     body: "Questions and quizzes can be shared via the upcoming attachment feature for users to save and share!",
//     author: "enlighteNUS",
//     replies: [{
//       id: "fjnjdfnd",
//       author: "excitedUser1",
//       body: "Yay! I can't wait to share and save questions!"
//     }, {
//       id: "nfjk",
//       author: "excitedUser2",
//       body: "Yay!"
//     }],
//     attached: [{ id: "quizid1", single: false }]
//   },

// ];

// const mockqndatabase = [{ id: "qnid1", title: "Question fun" }]
// const mockqzdatabase = [{ id: "quizid1", title: "Future Quiz" }, { id: "quizid2", title: "Quiz funner2" }]