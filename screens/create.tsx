import * as React from 'react';
import { Button, Text, View, Switch, FlatList, SafeAreaView, ScrollView, TextInput, TouchableWithoutFeedback, Keyboard} from 'react-native';
import { useState } from 'react';
import { HomeScreenProps, styles, UnfinishedQuizCreationData } from '../App';
import { QnProps } from '../components/question1by1';
import { QuestionCard } from '../components/questioncard';
import CustomPicker from '../components/mypicker';

const options = [
  { value: 'General', label: 'General' },
  { value: 'Programming', label: 'Programming' },
  { value: 'Math', label: 'Math' },
]

const deleteQuestion = (questionProps: Array<QnProps>, questionId :string) => {
  // Filter the questionProps array to exclude the question with the matching id
  return questionProps.filter((question) => question.id !== questionId);
};

const CreateScreen = ({navigation} : HomeScreenProps ) => {
  const passedunfinished = React.useContext(UnfinishedQuizCreationData)
  const [isEnabled, setIsEnabled] = useState(false);
  const [renderstate,setRender] =useState(0);
  const [questions,setQuestions] = useState(passedunfinished.data); 
  const [quiztitle,setTitle] = useState("");
  const [quiztopic,setTopic] = useState("General");

  //pingpong bad design

  const [mcq,setMcq] = useState(false);
  const [maxAttempt,setMax] = useState(1);
  const [quizstmt,setQuizstmt] = useState("");
  const [corrans,setCorrans] = useState("")
  const [wrongs,setWrongs] = useState("") //use string.split
  const [noOption,setNoOpt] = useState(1);
  const [explainText,setExp] = useState("");
  
  if (renderstate ==0) {
    return (
      <ScrollView>
        <Text style={styles.header}>Create New Quiz</Text>

        <View style={styles.buttonContainer}>
          <Button color='#6cac48' title="Add question from scratch" onPress={()=> setRender(1)}/>
          <Button color='#6cac48' title="Add question from AI" onPress={()=> setRender(2)}/>
          <Button color='#6cac48' title="Add question from database" onPress={()=> setRender(3)}/>
          {questions.length > 0 ? ( 
            <FlatList
              data={questions}
              keyExtractor={item => item.id} 
              renderItem={({item}) => <QuestionCard
            id={item.id}
            mcq={item.mcq} 
            maxAttempt={item.maxAttempt}
            quizstmt={item.quizstmt} 
            corrans = {item.corrans}
            wrongs={item.wrongs} 
            noOption={item.noOption}
            explainText={item.explainText}
            editQn={()=>{
              setMcq(item.mcq);
              setMax(item.maxAttempt);
              setQuizstmt(item.quizstmt);
              setCorrans(item.corrans.join(","));
              setWrongs(item.wrongs.join(",")) ;
              setNoOpt(item.noOption);
              setExp(item.explainText);
              const temp = deleteQuestion(questions, item.id);
              setQuestions(temp);
              setRender(1.5);
            }} 
            deleteQn={()=> {
              const temp = deleteQuestion(questions, item.id);
              setQuestions(temp);
            }}  />} 
            />
          ): <Text style ={{textAlign : "center"}}> No questions add yet.....</Text>
          }
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Finalise new quiz" onPress={()=> setRender(4)} disabled = {questions.length==0}/>
          <Button title="Save and Go Back Home" onPress={() => {
            navigation.goBack();
            passedunfinished.setData(questions)
          }} />
        </View>
        
      </ScrollView>)}

{/* to edit a question, we will create a new question id, this might cause problem later*/}  

  if (renderstate == 1 || renderstate == 1.5) {

    return(
      <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
          <SafeAreaView  style={styles.buttonContainer}>
      {renderstate == 1? <Text style={styles.header}>Create a new question</Text>:<Text style={styles.header}>Edit Question</Text>}

      {/* Input for ID */}
      <TextInput
        style={styles.input}
        placeholder="Question statement"
        value={quizstmt}
        onChangeText={(text) => setQuizstmt(text)}
      />

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


      {/* Input for Correct Answers */}
      <TextInput 
        style={styles.input}
        placeholder="Correct Answers (comma-separated)"
        value={corrans}
        onChangeText={(text) => setCorrans(text)}
      />

      {/* Input for Wrong Answers */}
      <TextInput
        style={styles.input}
        placeholder="Wrong Answers (comma-separated)"
        value={wrongs}
        onChangeText={(text) => setWrongs(text)}
      />

      {/* Dropdown for Number of Options */}
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


      <TextInput
        style={styles.input}
        placeholder="Explanation Text"
        multiline={true}
        value={explainText}
        onChangeText={(text) => setExp(text)}
      />
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
              if (!corrans) {
                alert("Question must have at least 1 correct answer")
              }

              else{
                if (corrans.split(",").length >1 && (mcq == true)){
                  alert("MCQs can only have 1 correct answer")
                }

                else{
                  if (corrans.split(",").filter(value => wrongs.split(",").includes(value)).length >0){
                    alert("Wrong answer and Correct Answer cannot be the same")
                  }
                  
                  else{
                    if ((!wrongs) && (mcq == true)) {
                      alert("MCQs should have at least 1 wrong option")
                    }
                    setRender(0);
                    const temp = {
                      id: Math.random().toString(),
                      mcq: mcq,
                      maxAttempt: maxAttempt,
                      quizstmt: quizstmt,
                      corrans: corrans.split(","), 
                      wrongs: wrongs.split(","), 
                      noOption: noOption,
                      explainText: explainText
                    }
                    var getquestions = questions;
                    getquestions.push(temp);
                    setQuestions(getquestions);
                    setMcq(false);
                    setMax(1);
                    setQuizstmt("");
                    setCorrans("")
                    setWrongs("") 
                    setNoOpt(1);
                    setExp("");
                  }
                }
              }
            }
          }
        }
      }}/>
    {(renderstate == 1) && <Button title="Back" onPress={()=>setRender(0)}/>}
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

  if (renderstate == 3) {
    return(
      <View>
        <Text>Database screen goes here </Text>
        <Button title="Go back" onPress={()=>setRender(0)}/>
      </View>
      )
    }
  if (renderstate == 4) {
    return(
      <SafeAreaView style={{gap : 10, flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-end'}}>
        <View style ={{flex:1}}>
          <Text style={{fontWeight:"bold", fontSize:18}}>Finalise and Publish Quiz
              </Text>
          <View style ={{flexDirection :'row', gap :10}}>
              <Text>
                  Questions one by one:
                </Text>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => setIsEnabled(previousState => !previousState)}
                  value={isEnabled}
                />
                {isEnabled && <Text>
                  (Yes)
                </Text>}
            </View>
            <Text> Give your quiz a title
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Your Quiz will be searchable by its title"
              value={quiztitle}
              onChangeText={(text) => setTitle(text)}
            />
            
            <CustomPicker
              options={options}
              selectedValue={quiztopic}
              onValueChange={setTopic}
              label="Select an option:"
            />
        </View>
        
        <View style={styles.bottombuttonContainer}>
          <Button title="Back" onPress={()=>setRender(0)}/>
          <Button title="Publish Quiz" onPress={()=> {navigation.goBack(); passedunfinished.setData([])}}/>
        </View>
        
      </SafeAreaView>
    )
  }
}

export default CreateScreen
