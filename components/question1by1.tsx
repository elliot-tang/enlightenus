import React, { useState,} from 'react';
import {Button, Text, TextInput, View, FlatList, TouchableOpacity, ScrollView, Alert} from 'react-native';
import { TallyCard } from './questioncard';
import { styles } from '@app/App';

export type QnProps = {
  id: string
  mcq: boolean
  maxAttempt: number
  quizstmt: string
  corrans: Array<string> /*allow multiple correct answers*/ 
  wrongs: Array<string> /* allow user to put in their own red herrings*/
  noOption: number
  explainText: string
};

/*TO DO: alerts when empty enters*/

export type QnPropsFunc = QnProps & {nextPage: () => void , addPoint: () => void, toAppendAnswer: (text: string) => void}

export function Qn1b1(props: QnPropsFunc) {
  const [attemptState,setAtt] = useState(0);
  function headertext(n : number) {
    if (n == 0) {
      return "You have " + props.maxAttempt.toString()+ " tries";
    }
    else if (n == props.maxAttempt) {
      return "No more attempts ☹";
    }
    else {
      return "Wrong Answer. You have " + (props.maxAttempt - attemptState).toString() + " tries left";
    }
  } /* a function that changes propmt depending on number of attempts left*/
  if (props.mcq == false) {
      const [ansState,setAns] = useState("");
      const [submitState, setSub] = useState(false);
      if (!props.corrans.includes(ansState) || submitState == false) {
          return (
              <View>
                <Text>
                  {headertext(attemptState)}</Text>
                <Text>Question: {props.quizstmt}</Text>
                {attemptState != props.maxAttempt && <TextInput
                  style={{
                    height: 40,
                    borderColor: 'gray',
                    borderWidth: 1,
                  }}
                  placeholder="Type Answer Here"
                  onChangeText={text => {setAns(text);
                  setSub(false); /*user need to submit for answer to register, everytime type something new, 
                  becomes unsubmitted state*/
                  }}
                  value={ansState}
                  onSubmitEditing={() =>
                    {if (ansState) {setSub(true); /*put some alert here when enter nothing*/
                      setAtt(attemptState  + 1)}
                      else {alert("Nothing is entered!")} /*also cause answer to regiser when pressing enter key*/
                  }}
                />}
                <Button
                  title = "Submit"
                  onPress={() => {
                  setSub(true);
                  setAtt(attemptState  + 1)
                  }}
                  disabled={attemptState == props.maxAttempt || !ansState} /*dont allow submit when too many attempts,
                  or when nothing is entered*/ 
                />
                {attemptState == props.maxAttempt && <View>
                  <Text style ={{color:'red'}}> The answer was {props.corrans[0]}             
                  </Text>
                  <Text style = {{fontWeight : "bold"}} >Explanation: {props.explainText}             
            </Text>
                  <Button title = "Next Question" 
                  onPress={()=>{props.nextPage();props.toAppendAnswer(ansState)}}/>
                </View>}
              </View>
          );
      }

      else {
        return (
            <View>
              <Text style ={{color:'green'}}>Answer correct </Text>
              <Text style = {{fontWeight : "bold"}} >Explanation: {props.explainText}             
            </Text>
              <Button title = "Next Question"
              onPress={()=>{props.nextPage(); props.toAppendAnswer(ansState); props.addPoint()}} />
            </View>
        )
      }
  }
  else {
    const [submitState, setSub] = useState(false);
    const [ansState,setAns] = useState("");
    const [randomiser,setRan] = useState(true);
    const [optState,setOpt] = useState(Array<string>);
    
    var temp = Array.from(props.wrongs) /*this function permutes the array of wrong answers */
    function fYS(arr: Array<string>){
      for (let i = arr.length -1; i>0;i--) {
        const j = Math.floor(Math.random() * (i+1));
        [arr[i],arr[j]]=[arr[j],arr[i]]
      }
      return arr
    }
    
    if (randomiser == true) {
      temp = fYS(temp);
      if (props.noOption > temp.length) {
        temp.push(props.corrans[0]);
        temp = fYS(temp)
      }
      else {
        temp[Math.floor(Math.random() * (props.noOption))] = props.corrans[0];
      }
      const options: string[] = temp.slice(0,Math.min(props.noOption));
      setOpt(options);
      setRan(false)
    } 
    /*the block above is so that once the question is initialised/displayed, we permute only once
    and not every time the user interacts with the options 
    (there is probabs a better way to do this.....)*/
    
    type ItemProps = {
      item: string;
      onPress: () => void;
      backgroundColor: string;
      textColor: string;
    };
    const Item = ({item, onPress, backgroundColor, textColor}: ItemProps) => (
      <TouchableOpacity onPress={onPress} style={{backgroundColor}}>
        <Text style={{color: textColor, textAlign : 'center'}}>{item}</Text>
      </TouchableOpacity>
    );
    
    const renderOps = ({item}: {item: string}) => {
      const backgroundColor = (item === ansState ? '#6e3b6e' : '#f9c2ff');
      const color = (item === ansState ? 'white' : 'black'); /*can decide on a different style later; */

      return (
        <Item
          item={item}
          onPress={() => {setAns(item);
            setSub(false);}
          }
          backgroundColor={backgroundColor}
          textColor={color}
        />
      );
    };
    if (ansState != props.corrans[0] || submitState == false)
      return (
        <View>
          <Text>
                  {headertext(attemptState)}</Text>
          <Text>Question: {props.quizstmt}</Text>
          <FlatList
          data={optState}
          renderItem={renderOps}
          extraData={ansState}
        />
        <Button
          title = "Submit"
          onPress={() => {
          setSub(true);
          setAtt(attemptState  + 1)
          }} 
          disabled={attemptState == props.maxAttempt || !ansState}
          />
        
        {attemptState == props.maxAttempt && <View>
            <Text style = {{color:'red'}}>The answer was {props.corrans[0]}             
            </Text>
             <Text style = {{fontWeight : "bold"}} >Explanation: {props.explainText}             
            </Text>
            <Button title = "Next Question" 
            onPress={()=>{props.nextPage(); props.toAppendAnswer(ansState)}}/>
          </View>}

        </View>
        );
    else {
      return (
          <View>
            <Text style ={{color:'green'}}> Answer correct </Text>
            <Text style = {{fontWeight : "bold"}} >Explanation: {props.explainText}             
            </Text>
            <Button title = "Next Question" 
            onPress={()=>{props.nextPage(); props.toAppendAnswer(ansState); props.addPoint()}}/>  
          </View>)
    }

  }
};

export const quiz1b1 = (questions: Array<QnProps>, exitScreen: () => void) => {
  const [pageNo, setPage] = useState(0);
  const [point, setPoint] = useState(0);
  const [tally,setTally] = useState(Array(questions.length).fill(false));
  const [qAnswers, setqAns] = useState<string[]>([]);
  const [save,setSave] = useState(Array<string>);
  const [reportstring,setReportstring] = useState("");
  const [currentReportQn, setCurrentQ] = useState("");
  const [currentReportid, setCurrentI] = useState("");

  // function callbacks
  const nextPage = () => setPage(pageNo + 1);
  const addPoint = (qnNumber:number) => { 
    function addTally(){
      setPoint(point + 1);
      var temp = Array.from(tally);
      temp[qnNumber] = true; 
      setTally(temp);}
    return addTally
  };
  function appendAnswer(answer:string){
    var temp = Array.from(qAnswers)
    temp.push(answer)
    setqAns(temp)
  }
  {/*note: it adds the page first then runs the assignment, so this is correct; offset by -1 is wrong */}

  const renderQuestion = (question: QnProps) => (
    <View key={question.id}>
      <Text>Question {pageNo + 1}/{questions.length}</Text>
      <Qn1b1
        {...question} // Spread props from question object
        nextPage={nextPage}
        addPoint={addPoint(pageNo)}
        toAppendAnswer={appendAnswer}
      />
    </View>
  );

  if (pageNo === questions.length) {
    const toShow = Array.from({ length: questions.length}, (_, i) => [questions[i], tally[i], qAnswers[i]])
    return (
      <View style = {{flex: 1}}>
        <View style = {{paddingBottom:20}}>
          <Text style={{fontSize:18}}>Your score is {point}/{questions.length}. Listed below is a breakdown.</Text>
        </View>
        
        <ScrollView style={{ gap :10 }}>
          <FlatList
            ItemSeparatorComponent={
          (() => (
            <View
              style={{marginTop: 16}}
            />
          ))
        }
            data={toShow}
            keyExtractor={item => item[0].id} 
            renderItem={({item}) => <TallyCard
            {...item[0]}
            saved = {save.includes(item[0].id)}
            correct={item[1]}
            userAns={item[2]}
            reportQn={()=>{
              setCurrentI(item[0].id);
              setCurrentQ(item[0].quizstmt)
              setPage(-1);
            }}
            saveQn={()=>{
              var temp = Array.from(save);
              temp.push(item[0].id);
              setSave(temp)
            }}
            unsaveQn={()=>{
              var temp = save.filter(ele => ele != item[0].id)
              setSave(temp)
            }}
            />} 
          />
        </ScrollView>
        <View style={{paddingBottom:20,paddingTop:20}}>
          <Button title="Return to Home" onPress={exitScreen}/>
        </View>
      </View>
    );
  } 

  if (pageNo === -1){
    return(
      <View style={{gap:5, paddingTop:20}}>
      <Text style={{textAlign: "left"}}>Report Question: {currentReportQn} </Text>
      <TextInput
        style={styles.input}
        multiline={true}
        placeholder="Enter Text Here..."
        onChangeText={setReportstring}
        value={reportstring}
      />
      <View style={{ justifyContent:"flex-end", flexDirection:"row"}}>
      <Button title="Submit" onPress={()=>{alert("Something should go to database here"); setPage(questions.length)}} />
      </View>
      <View style={{height: 10}}/>
      <View>
      <Text> Note for reports, please follow the general guidelines for what is reportable content. Blah blah.</Text>
      </View>
    </View>
    )
  }
  else{
    return renderQuestion(questions[pageNo]);}
};