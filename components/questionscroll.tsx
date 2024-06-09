import React, { useState } from 'react';
import {Button, Text, TextInput, View, FlatList, TouchableOpacity, ScrollView} from 'react-native';


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

export type QnPropsFuncs = QnProps & {updateFunc: (str:string) => void};

/*TO DO: progressbar that updates based on whether a question is attempted*/


export function QnScroll(props: QnPropsFuncs) {
  if (props.mcq == false) {
      const [ansState,setAns] = useState("");
      return (
          <View>
            <Text>Question: {props.quizstmt}</Text>
            <TextInput
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
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
      (there is probs a better way to do this.....)*/
      

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
        const color = (item === ansState ? 'white' : 'black'); /*can decide on a different style later; i just copy this bit
        from the react native tutorial lol */

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
        <View>
            <Text> Question: {props.quizstmt}</Text>
            <FlatList
            data={optState}
            renderItem={renderOps}
            extraData={ansState}
          />
        </View>
      )

    }
  }
export type QnPropsVerify = QnProps & {ans:string}
export function AnsScroll(props:QnPropsVerify) {
  /*create a component that renders the correct or wrong screen*/
  if (props.corrans.includes(props.ans)) {
    return (
      <View>
        <Text style = {{color : 'green'}}>
      "{props.ans}" is the correct answer!
    </Text>
    <Text style = {{fontWeight : "bold"}} >Explanation: {props.explainText}             
            </Text>
      </View>
      )}
  else {
    return(
    <View>
        <Text style = {{color : 'red'}}>
      "{props.ans}" is the wrong answer!
    </Text>
    <Text style = {{fontWeight : "bold"}} >Explanation: {props.explainText}             
            </Text>
      </View>
      )
    }
  }

/*above defines a modified version of question component, below initialises a quiz component based on QnProps data */

export function quizScroll(questions : Array<QnProps>) {
  const totalQn = questions.length;
  const [subState,setSub] = useState(false);
  const [qAnswers, setqAns] = useState(Array(totalQn));
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
  if (subState == false || qAnswers.includes(undefined)){
    return (<ScrollView>
      <FlatList
        ItemSeparatorComponent={
          (() => (
            <View
              style={{marginTop: 16}}
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
    for (var i =0; i < questions.length; i++) {
      if ((questions[i].mcq == true && (questions[i].corrans[0] == qAnswers[i])) || 
      (questions[i].mcq == false && questions[i].corrans.includes(qAnswers[i]))) {
        score +=1
      }
    }
    /*here we display the score, and tally up which qn is correct or wrong*/
    return (
      <ScrollView>
        <Text> Your score is {score}/{totalQn}</Text>
        <FlatList
        ItemSeparatorComponent={
          (({highlighted}) => (
            <View
              style={{marginTop: 16}}
            />
          ))
        }
        data={questions}
        renderItem={({item}) => <AnsScroll
        id={item.id}
        mcq={item.mcq} 
        maxAttempt={item.maxAttempt}
        quizstmt={item.quizstmt} 
        corrans = {item.corrans}
        wrongs={item.wrongs} 
        noOption={item.noOption}
        explainText={item.explainText}
        ans = {qAnswers[questions.indexOf(item)]} />}
        />
      </ScrollView>
    )
  }

}