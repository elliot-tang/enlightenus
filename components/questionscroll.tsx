import React, { useState } from 'react';
import {Button, Text, TextInput, View, FlatList, TouchableOpacity, ScrollView} from 'react-native';
import { TallyCard } from './questioncard';

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

export type QnPropsFuncs = QnProps & {updateFunc: (str:string) => void, enumerate: number};

/*TO DO: progressbar that updates based on whether a question is attempted*/


export function QnScroll(props: QnPropsFuncs) {
  if (props.mcq == false) {
      const [ansState,setAns] = useState("");
      return (
          <View style={{borderRadius:10, borderColor:"black", borderWidth:2, backgroundColor:"#CAE1CB"}}>
            <Text style={{fontSize:20}}>Q{props.enumerate}: {props.quizstmt}</Text>
            <View style={{height:15}}/>
            <TextInput
              style={{
                height: 40,
                borderColor: 'green',
                borderWidth: 1,
                backgroundColor: "white",
                borderRadius: 10
              }}
              placeholder="Type Answer Here"
              onChangeText={text => {setAns(text);props.updateFunc(text)}}
              value={ansState}
            />
            </View>
          );
      }

    else{
      const [ansState,setAns] = useState("");
      const [randomiser,setRan] = useState(true);
      const [optState,setOpt] = useState(Array<string>);
      const [seed, setSeed] = useState(0);
      var temp = Array.from(props.wrongs) /*this function permutes the array of wrong answers */
      function fYS(arr: Array<string>){
        for (let i = arr.length -1; i>0;i--) {
          const j = Math.floor(Math.random() * (i+1));
          [arr[i],arr[j]]=[arr[j],arr[i]]
        }
        return arr
      }
      
      if (randomiser == true) {
        const seed = Math.floor(Math.random() * props.corrans.length);
        setSeed(seed);
        temp = fYS(temp);
        if (props.noOption > temp.length) {
          temp.push(props.corrans[seed]);
          temp = fYS(temp)
        }
        else {
          temp[Math.floor(Math.random() * (props.noOption))] = props.corrans[seed];
        }
        const options: string[] = temp.slice(0,Math.min(props.noOption));
        setOpt(options);
        setRan(false)
      } 
      /*the block above is so that once the question is initialised/displayed, we permute only once
      and not every time the user interacts with the options 
      (there is probs a better way to do this.....)*/
      

      type ItemProps = {
        item: string;
        onPress: () => void;
        backgroundColor: string;
        textColor: string;
      };
      const Item = ({item, onPress, backgroundColor, textColor}: ItemProps) => (
        <TouchableOpacity onPress={onPress} style={{backgroundColor, borderRadius:10}}>
          <Text style={{color: textColor, textAlign : 'center', fontSize:15}}>{item}</Text>
        </TouchableOpacity>
      );
      
      const renderOps = ({item}: {item: string}) => {
        const backgroundColor = (item === ansState ? '#2d93e4' : '#d4f1f6');
        const color = (item === ansState ? 'white' : 'black'); /*can decide on a different style later; */

        return (
          <Item
            item={item}
            onPress={() => {setAns(item);props.updateFunc(item)}}
            backgroundColor={backgroundColor}
            textColor={color}
          />
        );
      };

      return (
        <View style={{borderRadius:10, borderColor:"black", borderWidth:2, backgroundColor:"#CAE1CB"}}>
            <Text style={{fontSize:20}}>Q{props.enumerate}: {props.quizstmt}</Text>
            <View style={{height:15}}/>
            <FlatList
            data={optState}
            renderItem={renderOps}
            extraData={ansState}
            ItemSeparatorComponent={
          (() => (
            <View
              style={{height: 7}}
            />
          ))
        }
          />
        </View>
      )

    }
  }
export type QnPropsVerify = QnProps & {ans:string}
export function AnsScroll(props:QnPropsVerify) {
    return (
    <Text style = {{fontWeight : "bold"}} >Explanation: {props.explainText}             
            </Text>
    )}

/*above defines a modified version of question component, below initialises a quiz component based on QnProps data */

export function quizScroll(questions : Array<QnProps>, exitScreen: () => void) {
  const totalQn = questions.length;
  const [subState,setSub] = useState(false);
  const [qAnswers, setqAns] = useState(Array(totalQn));
  const [save,setSave] = useState(Array<string>);
  const [reportstring,setReportstring] = useState("");
  const [currentReportQn, setCurrentQ] = useState("");
  const [currentReportid, setCurrentI] = useState("");
  const [pageNo, setPage]= useState(0)
  /*function callBack*/
  function updateAns(qst : QnProps){
    return function(answer:string) {
      const index = questions.indexOf(qst);
      var temp = Array.from(qAnswers);
      temp[index] = answer;
      setqAns(temp);
      setSub(false);
    }
  }

  if (pageNo === 0 ){
  if (subState == false || qAnswers.includes(undefined)){
    return (<ScrollView>
      <FlatList
        ItemSeparatorComponent={
          (() => (
            <View
              style={{height: 16}}
            />
          ))
        }
        data={questions}
        renderItem={({item}) => <QnScroll
        id={item.id}
        mcq={item.mcq} 
        maxAttempt={item.maxAttempt}
        quizstmt={item.quizstmt} 
        corrans = {item.corrans}
        wrongs={item.wrongs} 
        noOption={item.noOption}
        explainText={item.explainText}
        enumerate={questions.indexOf(item)+1}
        updateFunc={updateAns(item)}/>}
        
      />
      <Button
        title = "Submit All"
        onPress={() => {
            setSub(true);}}
            disabled={qAnswers.includes(undefined)} /*dont allow submit when not all qn attempted*/ 
            />
    </ScrollView>
    )
  }
  else {
    var score = 0;
    const tally = Array(questions.length).fill(false); 
    for (var i =0; i < questions.length; i++) {
      if (questions[i].corrans.includes(qAnswers[i])) {
        score +=1;
        tally[i] = true;
        };
      }

    const toShow = Array.from({ length: questions.length}, (_, i) => [questions[i], tally[i], qAnswers[i]])
    
    /*here we display the score, and tally up which qn is correct or wrong*/
    return (
      <View style = {{flex: 1}}>
        <View style ={{flex: 2}}>
          <Text style={{fontSize:18}}>Your score is {score}/{questions.length}. Listed below is a breakdown.</Text>
        </View>
        
        <ScrollView style={{ flex: 11, gap :10 }}>
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
            renderItem={({item}) => 
            <View>
              <TallyCard
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
            />
            <AnsScroll 
              {...item[0]}
             />
            </View>
            
            } 
          />
        </ScrollView>
        <View style={{flex:1}}>
          <Button title="Return to Home" onPress={exitScreen}/>
        </View>
      </View>
    )
  }
}

else{
  return(
    <View style={{gap:5, paddingTop:20}}>
    <Text style={{textAlign: "left"}}>Report Question: {currentReportQn} </Text>
    <TextInput
      style={{height: 50,
        paddingHorizontal: 20,
        borderColor: "green",
        borderWidth: 1,
        borderRadius: 7}}
      multiline={true}
      placeholder="Enter Text Here..."
      onChangeText={setReportstring}
      value={reportstring}
    />
    <View style={{ justifyContent:"flex-end", flexDirection:"row"}}>
    <Button title="Submit" onPress={()=>{alert("Something should go to database here"); setPage(0)}} />
    </View>
    <View style={{height: 10}}/>
    <View>
    <Text> Note for reports, please follow the general guidelines for what is reportable content. Blah blah.</Text>
    </View>
  </View>
  )
}

}