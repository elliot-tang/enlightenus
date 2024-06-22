import * as React from 'react';
import { Button, Text, View, Switch, FlatList, SafeAreaView, ScrollView, TextInput, TouchableWithoutFeedback, Keyboard, Platform, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { StackNavigationParamList, styles, UnfinishedQuizCreationData } from '../App';
import { QnProps } from '../components/question1by1';
import { QuestionCard } from '../components/questioncard';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type CreateProps = NativeStackScreenProps<StackNavigationParamList,"Create">

interface FetchedQuestion{
  _id: string; questionBody: string; __v: number; correctOptions?: string[]; author: string; explainText: string; dateCreated: string; questionType: string; options?: {option: string, isCorrect?:boolean}[];
  }
//

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
  const [saveorall, setSaveorall] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [newQnsLocalID, setNew] = useState(passedunfinished.save);
  const [selectionRender, setSelection] = useState<FetchedQuestion[]>([]);

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
              const tempnew = newQnsLocalID.filter((localid)=> localid !== item.id);
              setNew(tempnew);
            }}
            notpushed = {newQnsLocalID.includes(item.id)}
            pushQn = {()=> {const tempnew = newQnsLocalID.filter((localid)=> localid !== item.id); setNew(tempnew); alert("Pushing logic here")}}
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
          }} />
        </View>
        
      </ScrollView>)}

{/* edit or save question triggers a "new" flag*/}  

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
      {mcq && <TextInput
        style={styles.input}
        placeholder="Wrong Answers (comma-separated)"
        value={wrongs}
        onChangeText={(text) => setWrongs(text)}
      />}

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
                  if (corrans.split(",").map((ele)=>ele.trim()).filter(value => wrongs.split(",").map((ele)=>ele.trim()).includes(value)).length >0){
                    alert("Wrong answer and Correct Answer cannot be the same")
                  }
                  
                  else{
                    if ((!wrongs) && (mcq == true)) {
                      alert("MCQs should have at least 1 wrong option")
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
                      corrans: corrans.split(",").map((ele)=>ele.trim()), 
                      wrongs: wrongs.split(",").map((ele)=>ele.trim()), 
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


  /*questions retrieved from database wouldnt have a new flag, so append to questions but not to newLocalID*/
  if (renderstate == 3) {
    return(
        <View style={{gap:15, flex:1}}>
        <Text style={{ fontSize: 24}}> Search questions from? </Text> 
  <View style={{ flexDirection: "row" }}>
    <TouchableOpacity
      onPress={() => setSaveorall(true)}
      style={{ flex:1, backgroundColor: saveorall === true ? '#6e3b6e' : '#f9c2ff' , height:50, justifyContent: 'center', alignItems: 'center' }}
    >
      <Text style={{ fontSize: 24, color: saveorall === true ? 'white' : 'black', textAlign: 'center' }}>
        Saved Only
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setSaveorall(false)}
      style={{flex:1, backgroundColor: saveorall === false ? '#6e3b6e' : '#f9c2ff',height:50 , justifyContent: 'center', alignItems: 'center'}}
    >
      <Text style={{ fontSize: 24, color: saveorall === false ? 'white' : 'black', textAlign: 'center' }}>
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
      <TouchableOpacity style={{justifyContent:"center", flex:1}} onPress={() => {setSelection(dummydata)}}>
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
              const corrects = (item.questionType==="MCQ"? item.options.filter((ele)=>ele.isCorrect).map((ele)=>ele.option): []);
              const temp = {
                id: localid, 
                mcq: item.questionType==="MCQ",
                maxAttempt: 1,
                quizstmt: item.questionBody,
                corrans: item.questionType==="MCQ"? corrects:item.correctOptions, 
                wrongs: item.questionType==="MCQ"? item.options.filter((ele)=>ele.isCorrect===undefined).map((ele)=>ele.option):[], 
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
                  thumbColor={is1b1Enabled ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => setIs1b1Enabled(previousState => !previousState)}
                  value={is1b1Enabled}
                />
                {is1b1Enabled && <Text>
                  (Yes)
                </Text>}
            </View>
            <Text> Give your ({topic}) quiz a title
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Your Quiz will be searchable by its title"
              value={quiztitle}
              onChangeText={(text) => setTitle(text)}
            />
        </View>
        
        <View>
          <Button title="Back" onPress={()=>setRender(0)}/>
          <Button title="Publish Quiz" onPress={()=> {alert("here should be the final pushing, first the questions to get their id, then feed those ids into the quiz and push the quiz");navigation.goBack(); passedunfinished.setData([]); passedunfinished.setSaved([])}}/>
        </View>
        
      </SafeAreaView>
    )
  }
}


const dummydata = [
  {
    _id:"jfnsjfnsj",
    questionBody: "some oeq rubbish",
    __v: 0 ,
    correctOptions: ["here","there","everywhere"],
    author: "creator",
    explainText: "this is a quarter note, the quarter note blah blab",
    dateCreated: Date(),
    questionType: 'OEQ'
  },
  {
    _id: "jfnsjfnsjee",
    questionBody: "some mcq rubbish",
    __v: 0 ,
    options: [{option: "true", isCorrect: true},{option:"false"}],
    author: "creator",
    explainText: "im not typing that shit again",
    dateCreated: Date(),
    questionType: 'MCQ'
  },
]

export default Create