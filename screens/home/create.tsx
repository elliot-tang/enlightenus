import * as React from 'react';
import { Button, Text, View, Switch, FlatList, SafeAreaView, ScrollView, TextInput, TouchableWithoutFeedback, Keyboard, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { useState } from 'react';
import { HomeStackParamList, styles, UnfinishedQuizCreationData } from '@app/App';
import { QnProps } from '@app/components/question1by1';
import { QuestionCard } from '@app/components/questioncard';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { returnUser } from '@app/context/AuthContext';
import axios from 'axios';

const {height,width} = Dimensions.get("window")

type CreateProps = NativeStackScreenProps<HomeStackParamList,"Create">

interface FetchedQuestion {
  _id: string; 
  questionBody: string;
  __v: number; 
  correctOptions?: string[]; 
  author: string; 
  explainText: string; 
  dateCreated: string; 
  questionType: string; 
  options?: {answer: string, isCorrect?:boolean}[];
}

type MCQOptionProps = {
  answer: string,
  isCorrect?: boolean,
}

type MCQProps = {
  questionBody: string,
  options: Array<MCQOptionProps>,
  author: string,
  explainText?: string,
}

type OEQProps = {
  questionBody: string,
  correctOptions: Array<string>,
  author: string,
  explainText?: string,
}

function AnswerEdittorBox(props: {
  text: string;
  deletePress: () => void;
  setCorrectPress: () => void;
  deselectCorrectPress: () => void;
  isCorrect: boolean;
}) {
  return (
    <View
      style={{ backgroundColor: "#bdfbf9", flexDirection: "row", width: width * 0.9 }}
    >
      <Text style={{ flex: 1, fontSize:18 }}>{props.text}</Text>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        {props.isCorrect ? (
          <TouchableOpacity onPress={props.deselectCorrectPress}>
            <MaterialIcons name="check" size={25} color="green" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={props.setCorrectPress}>
            <MaterialIcons name="close" size={25} color="red" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={props.deletePress}>
          <MaterialIcons name="delete" size={25} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// the search feature fetches an array of datatype jasons

//note the id created here is a local id, it SHOULD NOT be passed into mongobongo in page 4

//the newqnlocal determines which of the created questions need to be pushed to database, which are pre-fetched so no need to push. it stores the corresponding local id.

const deleteQuestion = (questionProps: Array<QnProps>, questionId :string) => {
  // Filter the questionProps array to exclude the question with the matching id
  return questionProps.filter((question) => question.id !== questionId);
};

const Create= ({route,navigation} : CreateProps) => {
  const passedunfinished = React.useContext(UnfinishedQuizCreationData)
  const topic = ((route.params === undefined) || (route.params.topic === "Uncategorised"||route.params.topic ===""))? "Uncategorised": route.params.topic;
  const [is1b1Enabled, setIs1b1Enabled] = useState(false);
  const [renderstate,setRender] =useState(0);
  const [questions,setQuestions] = useState(passedunfinished.data); 
  const [quiztitle,setTitle] = useState("");
  const [saveorall, setSaveorall] = useState("Saved");
  const [searchText, setSearchText] = useState("");
  const [newQnsLocalID, setNew] = useState(passedunfinished.save);
  const [selectionRender, setSelection] = useState<FetchedQuestion[]>([]);
  const [oldQnsmongoIDs, setMongo] = useState(passedunfinished.mongo)

  //pingpong bad design

  const [mcq,setMcq] = useState(false);
  const [maxAttempt,setMax] = useState(1);
  const [quizstmt,setQuizstmt] = useState("");
  const [corrans,setCorrans] = useState<string[]>([])
  const [wrongs,setWrongs] = useState<string[]>([]) 
  const [noOption,setNoOpt] = useState(1);
  const [explainText,setExp] = useState("");
  const [anyAns, setAnyAns]= useState("");
  const user = returnUser();

  var dataFlatlist = [...corrans,...wrongs];

  const fetchSavedQuestions : () => Promise<FetchedQuestion> = async () => {
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

  const fetchCreatedQuestions : () => Promise<FetchedQuestion> = async () => {
    try {
      console.log(user);
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

  const fetchAllQuestions : () => Promise<FetchedQuestion> = async () => {
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

   const pushMCQ : (qn : MCQProps) => Promise<string> = async (qn : MCQProps) => {
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/createMCQ`, qn);
      return response.data.questionId;
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
    const pushOEQ : (qn : OEQProps) => Promise<string> = async (qn: OEQProps) => {
      try {
        const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/createOEQ`, qn);
        return response.data.questionId;
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
  
  if (renderstate ==0) {
    return (
      <ScrollView>
        <View style={{height: height*0.1}}/>
        <Text style={styles.header}>Create New Quiz ({topic})</Text>

        <View style={styles.buttonContainer}>
          <Button color='#6cac48' title="Add question from scratch" onPress={()=> setRender(1)}/>
          <Button color='#6cac48' title="Add question from AI" onPress={()=> setRender(2)}/>
          <Button color='#6cac48' title="Add question from database" onPress={()=> setRender(3)}/>
          {questions.length > 0 ? ( 
            <FlatList
              data={questions}
              keyExtractor={item => item.id} 
              renderItem={({item}) => <QuestionCard
            {...item}
            editQn={()=>{
              setMcq(item.mcq);
              setMax(item.maxAttempt);
              setQuizstmt(item.quizstmt);
              setCorrans(item.corrans);
              setWrongs(item.wrongs) ;
              setNoOpt(item.noOption);
              setExp(item.explainText);
              const temp = deleteQuestion(questions, item.id);
              setQuestions(temp);
              setRender(1.5);
            }} 
            deleteQn={()=> {
              const temp = deleteQuestion(questions, item.id);
              setQuestions(temp);
              const tempnew = newQnsLocalID.filter((localid)=> localid !== item.id);
              setNew(tempnew);
            }}
            notpushed = {newQnsLocalID.includes(item.id)}
            pushQn = { async () => {
              const tempnew = newQnsLocalID.filter((localid)=> localid !== item.id); 
              setNew(tempnew); 
              var mongoID;
              if (item.mcq == true) {
                const allOptions = [
                  ...item.corrans.map((answer) => ({ answer: answer, isCorrect: true })),
                  ...item.wrongs.map((answer) => ({ answer: answer})),
                ];
                mongoID = await pushMCQ({
                  questionBody: item.quizstmt,
                  options: allOptions,
                  author: user,
                  explainText: item.explainText? item.explainText: undefined
                });
              } else {
                mongoID = await pushOEQ({
                  questionBody: item.quizstmt,
                  correctOptions: item.corrans,
                  author: user,
                  explainText: item.explainText? item.explainText: undefined
                });
              }
              const temp = {localID: item.id, mongoID: mongoID}
              setMongo((prevArray) => [...prevArray, temp])
            }}
            />} 
            />
          ): <Text style ={{textAlign : "center"}}> No questions add yet.....</Text>
          }
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Finalise new quiz" onPress={()=> setRender(4)} disabled = {questions.length==0}/>
          <Button title="Save and Go Back Home" onPress={() => {
            navigation.goBack();
            passedunfinished.setData(questions);
            passedunfinished.setSaved(newQnsLocalID)
            passedunfinished.setMongo(oldQnsmongoIDs)
          }} />
        </View>
        
      </ScrollView>)}

{/* edit or save question triggers a "new" flag*/}  

  if (renderstate == 1 || renderstate == 1.5) {

    return(
      <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()} style={styles.buttonContainer}>
          <SafeAreaView>
          <KeyboardAwareScrollView>
          <View style={{height: height*0.04}}/>
      {renderstate == 1? <Text style={styles.header}>Create a new question</Text>:<Text style={styles.header}>Edit Question</Text>}
      <View style={{height: 10}}/>
      {/* Input for ID */}
      <TextInput
        style={styles.input}
        placeholder="Question statement"
        value={quizstmt}
        onChangeText={(text) => setQuizstmt(text)}
      />
      <View style={{height: 10}}/>
      {/* Switch for MCQ */}
      <View style={{ flexDirection: 'row', gap:10 }}>
        <Text>Multiple Choice:</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={mcq ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={(value) => setMcq(value)}
          value={mcq}
        />
      </View>
      <View style={{height: 10}}/>
      {/* Input for Max Attempts */}
      <Text> Maximum Attempts
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Maximum Attempts"
        inputMode="numeric"
        value={maxAttempt.toString()}
        onChangeText={(text) => {if (text) 
          {
            setMax(parseInt(text))}
          else {
            setMax(0)}}}
      />

      <View style={{height: 5}}/>
      {/* Input for Correct Answers */}
      <View style={{flexDirection:"row"}}>
      <TextInput 
        style={[styles.input, {flex:5}]}
        placeholder="Type an answer here"
        value={anyAns}
        onChangeText={(text) => setAnyAns(text)}
        onSubmitEditing={()=>{
        if (dataFlatlist.includes(anyAns.trim())){
          alert("Repeat answers are not allowed")
          return
        }
        if (!anyAns){
          alert("Answer field cannot be empty")
        }
        else
        {setWrongs((prevArray) => [...prevArray, anyAns.trim()]); setAnyAns("");}}}
      />
      </View>
      
      {mcq && <View>
      <Text> No of options
      </Text>
      <TextInput
        style={styles.input}
        placeholder="No of Options"
        keyboardType="numeric"
        value={noOption.toString()}
        onChangeText={(text) => {if (text) 
          {
            setNoOpt(parseInt(text))}
          else {
            setNoOpt(0)}}}
      />
      </View>}

      <View style={{height: 10}}/>
      <TextInput
        style={styles.input}
        placeholder="Explanation Text"
        multiline={true}
        value={explainText}
        onChangeText={(text) => setExp(text)}
      />
      <View style={{height: 10}}/>
      <View style={{ gap: 10 }}>
        <FlatList
          data={[...corrans, ...wrongs]}
          renderItem={({ item }) => (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <AnswerEdittorBox
                text={item}
                deletePress={() => {
                  const updatedCorrans = corrans.filter((el) => el !== item);
                  const updatedWrongs = wrongs.filter((el) => el !== item);
                  setCorrans(updatedCorrans);
                  setWrongs(updatedWrongs);
                }}
                deselectCorrectPress={() => {
                  const updatedCorrans = corrans.filter((el) => el !== item);
                  setCorrans(updatedCorrans);
                  setWrongs((prevArray) => [...prevArray, item]);
                }}
                setCorrectPress={() => {
                  const updatedWrongs = wrongs.filter((el) => el !== item);
                  setWrongs(updatedWrongs);
                  setCorrans((prevArray) => [...prevArray, item]);
                }}
                isCorrect={corrans.includes(item)}
              />
            </View>
          )}
        />
      </View>
      <View style={{height: 10}}/>
{/* bunch of checks so that we actually get valid question props*/}
      <Button title="Save Question" onPress={() => {
        if (!quizstmt){
          alert("What is the question?!")
        }
        else{
          if (maxAttempt == 0){
            alert("Max. Attempts must at least be 1")
          }
          else{
            if ((noOption == 1 || noOption == 0) && (mcq == true)) {
              alert("No of Options for an MCQ must at least be 2")
            }

            else{
              if (corrans.length==0) {
                alert("Question must have at least 1 correct answer")
              }

              else{
                if ((noOption > 1 + wrongs.length) && (mcq ==true)){
                  alert("Too many options to be populated by not enough wrong answers")
                }

                else{
                    if ((wrongs.length == 0) && (mcq == true)) {
                      alert("MCQs must have at least 1 wrong option")
                    }
                    else{
                      if ((corrans.length > 1) && (mcq == true)) {
                        alert("You have entered multiple answers for an MCQ. The options will be randomised and exactly one of these options will be chosen as the correct answer on each playthrough")
                      }
                      setRender(0); 
                      var localid = Math.random().toString();
                      while (questions.map((ele)=>ele.id).includes(localid)) {
                        localid = Math.random().toString();
                      }
                      const temp = {
                        id: localid, 
                        mcq: mcq,
                        maxAttempt: maxAttempt,
                        quizstmt: quizstmt,
                        corrans: corrans, 
                        wrongs: wrongs, 
                        noOption: noOption,
                        explainText: explainText
                      }
                      var getquestions = Array.from(questions);
                      getquestions.push(temp);
                      var getnew = Array.from(newQnsLocalID);
                      getnew.push(temp.id);
                      setNew(getnew);
                      setQuestions(getquestions);
                      setMcq(false);
                      setMax(1);
                      setQuizstmt("");
                      setCorrans([])
                      setWrongs([]) 
                      setNoOpt(1);
                      setExp("");
                    }
                  } 
                }
              }
            }
          }
        }
      }/>
    <View style={{height: 10}}/>
    {(renderstate == 1) && <Button title="Back" onPress={()=>setRender(0)}/>}
    </KeyboardAwareScrollView>
    </SafeAreaView>
    </TouchableWithoutFeedback>)}
  
  if (renderstate == 2) {
    return(
      <View>
        <Text>ChatGPT goes here </Text>
        <Button title="Go back" onPress={()=>setRender(0)}/>
      </View>
      )
    }


  /*questions retrieved from database wouldnt have a new flag, so append to questions but not to newLocalID*/
  if (renderstate == 3) {
    return(
        <SafeAreaView style={{gap:15, flex:1}}>
        <View style={{height: height*0.04}}/>
        <Text style={{ fontSize: 24}}> Search questions from? </Text> 
  <View style={{ flexDirection: "row"}}>
    <TouchableOpacity
      onPress={() => setSaveorall("Saved")}
      style={{ flex:1, backgroundColor: saveorall === "Saved" ? '#079A04' : '#D3ECD3' , height:50, justifyContent: 'center', alignItems: 'center',borderTopLeftRadius:10 , borderBottomLeftRadius:10}}
    >
      <Text style={{ fontSize: 24, color: saveorall === "Saved" ? 'white' : 'black', textAlign: 'center' }}>
        Saved Only
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setSaveorall("Create")}
      style={{ flex:1, backgroundColor: saveorall === "Create" ? '#079A04' : '#D3ECD3' , height:50, justifyContent: 'center', alignItems: 'center'}}
    >
      <Text style={{ fontSize: 24, color: saveorall === "Create" ? 'white' : 'black', textAlign: 'center' }}>
        Created Questions
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setSaveorall("All")}
      style={{flex:1, backgroundColor: saveorall === "All" ? '#079A04' : '#D3ECD3',height:50 , justifyContent: 'center', alignItems: 'center', borderTopEndRadius:10, borderEndEndRadius:10}}
    >
      <Text style={{ fontSize: 24, color: saveorall === "All" ? 'white' : 'black', textAlign: 'center' }}>
        All
      </Text>
    </TouchableOpacity>
  </View>
  <View style={{flexDirection:"row",backgroundColor:'white'}}>
      <TextInput
        style={{flex:5}}
        placeholder="Search..."
        onChangeText={setSearchText}
        value={searchText}
      />
      <TouchableOpacity 
        style={{justifyContent:"center", flex:1}} 
        onPress={async () => {
          var fetched;
          if (saveorall == "Saved") {
            fetched = await fetchSavedQuestions();
          } else if (saveorall == "Create") {
            fetched = await fetchCreatedQuestions();
          } else {
            fetched = await fetchAllQuestions();
          }
          setSelection(fetched);
        }}>
        <MaterialIcons name="search" size={24} color="gray" />
      </TouchableOpacity>
    </View>
      <ScrollView style={{ flex: 10 }}>
      <FlatList
        data={selectionRender}
        keyExtractor={item => item._id} 
        renderItem={({item}) => 
          <TouchableOpacity style = {{backgroundColor: '#cdefff',
            padding: 15,
            borderRadius: 10,}} onPress={()=>
            {
              var localid = Math.random().toString();
              while (questions.map((ele)=>ele.id).includes(localid)) {
                localid = Math.random().toString();
              };
              const corrects = (item.questionType==="MCQ"? item.options.filter((ele)=>ele.isCorrect).map((ele)=>ele.answer): []);
              const temp = {
                id: localid, 
                mcq: item.questionType==="MCQ",
                maxAttempt: 1,
                quizstmt: item.questionBody,
                corrans: item.questionType==="MCQ"? corrects:item.correctOptions, 
                wrongs: item.questionType==="MCQ"? item.options.filter((ele)=>ele.isCorrect===undefined).map((ele)=>ele.answer):[], 
                noOption: 10,
                explainText: item.explainText
              };
              var getquestions = Array.from(questions);
              getquestions.push(temp);
              setQuestions(getquestions);
              setRender(0);
              return;
              
            }
            }>
            <Text>{item.questionType}: {item.questionBody} by {item.author}</Text>
          </TouchableOpacity> } 
        ItemSeparatorComponent={(() => (
          <View
            style={{height: 10}}
          />
        ))}
      />
    </ScrollView>
        <Button title="Go back" onPress={()=>setRender(0)}/>
        <View style={{height: 20}}/>
      </SafeAreaView>
      )
    }
  if (renderstate == 4) {
    return(
      <SafeAreaView>
  <View style={{ height: height * 0.05 }} />
  <View style={{ gap: 10 }}>
    <Text style={{ fontWeight: "bold", fontSize: 22 }}>Finalise and Publish Quiz</Text>
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Text>
        Questions one by one:
      </Text>
      <Switch
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={is1b1Enabled ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={() => setIs1b1Enabled(previousState => !previousState)}
        value={is1b1Enabled}
      />
      {is1b1Enabled && <Text>
        (Yes)
      </Text>}
    </View>
    <Text>Give your ({topic}) quiz a title</Text>
    <TextInput
      style={styles.input}
      placeholder="Your Quiz will be searchable by its title"
      value={quiztitle}
      onChangeText={(text) => setTitle(text)}
    />

    <View>
      <Button title="Back" onPress={() => setRender(0)} />
      <Button title="Publish Quiz" onPress={() => {
        alert("here should be the final pushing, first the questions to get their id, then feed those ids into the quiz and push the quiz");
        navigation.goBack();
        passedunfinished.setData([]);
        passedunfinished.setSaved([]);
      }} />
    </View>
  </View>
</SafeAreaView>)
  }
}

export default Create