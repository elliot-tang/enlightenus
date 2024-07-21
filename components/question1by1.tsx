import React, { useState, } from 'react';
import { Button, Text, TextInput, View, FlatList, TouchableOpacity, ScrollView, Alert, Dimensions, StyleSheet } from 'react-native';
import { TallyCard } from './questioncard';
import { returnUser } from '@app/context/AuthContext';
import axios from 'axios';

const { height, width } = Dimensions.get("window");

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

type TakenQuestionProps = {
  question: { questionId: string, questionType: string, },
  noAttempts: number,
  responses: Array<string>,
  isCorrect: boolean
}

type TakenQuizProps = {
  username: string,
  quizId: string,
  score: number,
  breakdown: Array<TakenQuestionProps>
}

/*TO DO: alerts when empty enters*/

export type QnPropsFunc = QnProps & {
  nextPage: () => void,
  addPoint: () => void,
  toAppendAnswer: (text: string) => void,
  toAddNoOfAttempts: (attempts: number) => void,
  toAddCorrect: (correct: boolean) => void,
}

export function Qn1b1(props: QnPropsFunc) {
  const [attemptState, setAtt] = useState(0);
  function headertext(n: number) {
    if (n == 0) {
      return "You have " + props.maxAttempt.toString() + " tries";
    }
    else if (n == props.maxAttempt) {
      return "No more attempts ☹";
    }
    else {
      return "Wrong Answer. You have " + (props.maxAttempt - attemptState).toString() + " tries left";
    }
  } /* a function that changes propmt depending on number of attempts left*/
  if (props.mcq == false) {
    const [ansState, setAns] = useState("");
    const [submitState, setSub] = useState(false);
    if (!props.corrans.includes(ansState) || submitState == false) {
      return (
        <View style={{ backgroundColor: "white", height: height * 0.9, width: width * 0.9 }}>
          <View style={{ backgroundColor: "#b1e2ee", borderRadius: 10, height: 200, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 22, textAlign: "center" }}>{props.quizstmt}</Text>
          </View>
          <View style={{ height: 15 }} />
          <Text>
            {headertext(attemptState)}</Text>
          {attemptState != props.maxAttempt && <TextInput
            style={{
              height: 40,
              borderColor: 'green',
              borderWidth: 1,
              borderRadius: 10
            }}
            placeholder="Type Answer Here"
            onChangeText={text => {
              setAns(text);
              setSub(false); /*user need to submit for answer to register, everytime type something new, 
                  becomes unsubmitted state*/
            }}
            value={ansState}
            onSubmitEditing={() => {
              if (ansState) {
                setSub(true); /*put some alert here when enter nothing*/
                setAtt(attemptState + 1)
              }
              else { alert("Nothing is entered!") } /*also cause answer to regiser when pressing enter key*/
            }}
          />}
          <Button
            title="Submit"
            onPress={() => {
              setSub(true);
              setAtt(attemptState + 1)
            }}
            disabled={attemptState == props.maxAttempt || !ansState} /*dont allow submit when too many attempts,
                  or when nothing is entered*/
          />
          {attemptState == props.maxAttempt && <View style={{ borderTopColor: "black", borderTopWidth: 2, paddingTop: 20 }}>
            <Text style={{ color: 'red' }}>The answer was {props.corrans[0]}
            </Text>
            <Text style={{ fontWeight: "bold" }} >Explanation: {props.explainText}
            </Text>
            <Button title="Next Question"
              onPress={() => {
                props.nextPage();
                props.toAppendAnswer(ansState);
                props.toAddCorrect(false);
                props.toAddNoOfAttempts(attemptState);
              }} />
          </View>}
        </View>
      );
    }

    else {
      return (
        <View style={{ backgroundColor: "white", height: height * 0.9, width: width * 0.9 }}>
          <View style={{ backgroundColor: "#b1e2ee", borderRadius: 10, height: 200, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 22, textAlign: "center" }}>{props.quizstmt}</Text>
          </View>
          <View style={{ height: 15 }} />
          <View style={{ borderTopColor: "black", borderTopWidth: 2, paddingTop: 20 }}>
            <Text style={{ color: 'green' }}>Answer correct: {ansState}</Text>
            {props.explainText && <Text style={{ fontWeight: "bold" }}>Explanation: {props.explainText}
            </Text>}
            <Button title="Next Question"
              onPress={() => {
                props.nextPage();
                props.toAppendAnswer(ansState);
                props.addPoint();
                props.toAddCorrect(true);
                props.toAddNoOfAttempts(attemptState);
              }} />
          </View>
        </View>
      )
    }
  }
  else {
    const [submitState, setSub] = useState(false);
    const [ansState, setAns] = useState("");
    const [randomiser, setRan] = useState(true);
    const [optState, setOpt] = useState(Array<string>);
    const [seed, setSeed] = useState(0);

    var temp = Array.from(props.wrongs) /*this function permutes the array of wrong answers */
    function fYS(arr: Array<string>) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    }

    if (randomiser == true) {
      const seed = Math.floor(Math.random() * props.corrans.length);
      setSeed(seed)
      temp = fYS(temp);
      if (props.noOption > temp.length) {
        temp.push(props.corrans[seed]);
        temp = fYS(temp)
      }
      else {
        temp[Math.floor(Math.random() * (props.noOption))] = props.corrans[seed];
      }
      const options: string[] = temp.slice(0, Math.min(props.noOption));
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
    const Item = ({ item, onPress, backgroundColor, textColor }: ItemProps) => (
      <TouchableOpacity onPress={onPress} style={{ backgroundColor, borderRadius: 10 }}>
        <Text style={{ color: textColor, textAlign: 'center', fontSize: 20 }}>{item}</Text>
      </TouchableOpacity>
    );

    const renderOps = ({ item }: { item: string }) => {
      const backgroundColor = (item === ansState ? '#2d93e4' : '#d4f1f6');
      const color = (item === ansState ? 'white' : 'black'); /*can decide on a different style later; */

      return (
        <View style={{paddingTop:8}}>
          <Item
          key={item}
          item={item}
          onPress={() => {
            setAns(item);
            setSub(false);
          }
          }
          backgroundColor={backgroundColor}
          textColor={color}
        />
        </View>  
      );
    };
    if (ansState != props.corrans[seed] || submitState == false)
      return (
        (attemptState == props.maxAttempt) ? (
          <View style={{ backgroundColor: "white", height: height * 0.9, width: width * 0.9 }}>
            <View style={{ backgroundColor: "#b1e2ee", borderRadius: 10, height: 200, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 22, textAlign: "center" }}>{props.quizstmt}</Text>
            </View>
            <View style={{ height: 15 }} />
            <View style={{ borderTopColor: "black", borderTopWidth: 2, paddingTop: 20 }}>
              <Text style={{ color: 'red' }}>The answer was {props.corrans[seed]}
              </Text>
              <Text style={{ fontWeight: "bold" }} >Explanation: {props.explainText}
              </Text>
              <Button title="Next Question"
                onPress={() => {
                  props.nextPage();
                  props.toAppendAnswer(ansState);
                  props.toAddCorrect(false);
                  props.toAddNoOfAttempts(attemptState);
                }} />
            </View>
          </View>) : (<View style={{ backgroundColor: "white", height: height * 0.9, width: width * 0.9 }}>
            <View style={{ backgroundColor: "#b1e2ee", borderRadius: 10, height: 200, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 22, textAlign: "center" }}>{props.quizstmt}</Text>
            </View>
            <View style={{ height: 15 }} />
            <View style={{ height: height * 0.3 }}>
              <ScrollView>
              {optState.map((item)=>
        renderOps({item:item}))}
              </ScrollView>
            </View>
            <View style={{ height: 15 }} />
            <Text>{headertext(attemptState)}</Text>
            <Button
              title="Submit"
              onPress={() => {
                setSub(true);
                setAtt(attemptState + 1)
              }}
              disabled={attemptState == props.maxAttempt || !ansState}
            />
          </View>)
      );
    else {
      return (
        <View style={{ backgroundColor: "white", height: height * 0.9, width: width * 0.9 }}>
          <View style={{ backgroundColor: "#b1e2ee", borderRadius: 10, height: 200, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 22, textAlign: "center" }}>{props.quizstmt}</Text>
          </View>
          <View style={{ height: 15 }} />
          <View style={{ borderTopColor: "black", borderTopWidth: 2, paddingTop: 20 }}>
            <Text style={{ color: 'green' }}>Answer correct: {ansState} </Text>
            <Text style={{ fontWeight: "bold" }} >Explanation: {props.explainText}
            </Text>
          </View>
          <Button title="Next Question"
            onPress={() => {
              props.nextPage();
              props.toAppendAnswer(ansState);
              props.addPoint()
              props.toAddCorrect(true);
              props.toAddNoOfAttempts(attemptState);
            }} />
        </View>)
    }

  }
};

function ProgressBar(props: { now: number, total: number }) {
  const rectangles = [];
  for (let i = 0; i < props.total; i++) {
    const isShaded = i < props.now;

    if (i === props.now - 1) {
      rectangles.push(
        <View key={i} style={{ backgroundColor: isShaded ? "#b6cfbb" : "white", borderRadius: 5, borderColor: "gray", borderWidth: 2, width: width * 0.9 / props.total, justifyContent: "center", alignContent: "center" }}>
          <Text style={{ textAlign: "center", fontSize: 20 }}>{props.now.toString()} </Text>
        </View>)
    }
    else {
      rectangles.push(
        <View key={i} style={{ backgroundColor: isShaded ? "#b6cfbb" : "white", borderRadius: 5, borderColor: "gray", borderWidth: 2, width: width * 0.9 / props.total }} />);
    }
  }
  return (
    <View style={{ height: height * 0.05, width: width * 0.9, flexDirection: "row" }}>
      {rectangles}
    </View>
  )
}

export const quiz1b1 = (questions: Array<QnProps>, exitScreen: () => void, quizId: string) => {
  const [pageNo, setPage] = useState(0);
  const [point, setPoint] = useState(0);
  const [tally, setTally] = useState(Array(questions.length).fill(false));
  const [qAnswers, setqAns] = useState<string[]>([]);
  const [save, setSave] = useState(Array<string>);
  const [reportstring, setReportstring] = useState("");
  const [currentReportQn, setCurrentQ] = useState("");
  const [currentReportid, setCurrentI] = useState("");
  const [isCorrects, setIsCorrects] = useState(Array<boolean>());
  const [noAttempts, setNoAttempts] = useState(Array<number>());
  const user = returnUser();

  // function callbacks
  const nextPage = () => setPage(pageNo + 1);
  const addPoint = (qnNumber: number) => {
    function addTally() {
      setPoint(point + 1);
      var temp = Array.from(tally);
      temp[qnNumber] = true;
      setTally(temp);
    }
    return addTally
  };
  function appendAnswer(answer: string) {
    var temp = Array.from(qAnswers)
    temp.push(answer)
    setqAns(temp)
  }
  function addCorrect(correct: boolean) {
    var temp = Array.from(isCorrects);
    temp.push(correct);
    setIsCorrects(temp);
  }
  function addAttempts(attempts: number) {
    var temp = Array.from(noAttempts);
    temp.push(attempts);
    setNoAttempts(temp);
  }
  {/*note: it adds the page first then runs the assignment, so this is correct; offset by -1 is wrong */ }

  const renderQuestion = (question: QnProps) => (
    <View key={question.id} style={{ backgroundColor: "white", justifyContent: "center", alignItems: "center" }}>
      <View style={{ height: 50 }} />
      <ProgressBar now={pageNo + 1} total={questions.length} />
      <View style={{ height: 15 }} />
      <Qn1b1
        {...question}
        nextPage={nextPage}
        addPoint={addPoint(pageNo)}
        toAppendAnswer={appendAnswer}
        toAddCorrect={addCorrect}
        toAddNoOfAttempts={addAttempts}
      />
    </View>
  );

  const saveQuiz: () => Promise<string> = async () => {
    try {
      const savedQuiz = {
        username: user,
        quizId: quizId,
      }
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/saveQuiz`, savedQuiz);
      console.log(`Question ID: ${quizId} saved by User ${user}`);
      return response.data.savedQuizId;
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
  };

  const reportQuestion: () => Promise<string> = async () => {
    try {
      if (reportstring.trim() === '') {
        alert('Please provide a report reason!');
        setReportstring('');
      } else {
        const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/report/reportQuestion`, { username: user, questionId: currentReportid, reportReason: reportstring });
        return response.data.reportId;
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
  };

  if (pageNo === questions.length) {
    const toShow = Array.from({ length: questions.length }, (_, i) => [questions[i], tally[i], qAnswers[i]])
    return (
      <View style={styles.container}>
        <View style={{ height: height * 0.07 }}>
          <Text style={{ fontSize: 18 }}>Your score is {point}/{questions.length}. Listed below is a breakdown.</Text>
        </View>
        <View style={{ height: height * 0.69 }}>
          <ScrollView>
            {toShow.map((item) => <View style={{ paddingBottom: 10 }}>
              <TallyCard
                key={item[0].id}
                {...item[0]}
                saved={save.includes(item[0].id)}
                correct={item[1]}
                userAns={item[2]}
                reportQn={() => {
                  setCurrentI(item[0].id);
                  setCurrentQ(item[0].quizstmt);
                  setPage(-1);
                }}
              />
            </View>)}
          </ScrollView>
        </View>
        <View style={{ height: height * 0.07, gap: 10 }}>
          <Button title="Return to Home" onPress={async () => {
            try {
              // Saves the taken quiz and user response into the database
              var breakdown: Array<TakenQuestionProps> = [];
              for (var i = 0; i < questions.length; i++) {
                const qn = {
                  question: {
                    questionId: questions[i].id,
                    questionType: questions[i].mcq ? 'MCQ' : 'OEQ'
                  },
                  noAttempts: noAttempts[i],
                  responses: [qAnswers[i]],
                  isCorrect: isCorrects[i],
                }
                breakdown.push(qn);
              }

              const TakenQuiz: TakenQuizProps = {
                username: user,
                quizId: quizId,
                score: point,
                breakdown: breakdown
              }

              const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_API}/quiz/takeQuiz`, TakenQuiz);
              console.log(`Quiz taken! TakenQuiz ID: ${response}`);
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
            } finally {
              // Resets isCorrects and noAttempts and returns to home page
              setIsCorrects([]);
              setNoAttempts([]);
              exitScreen();
            }
          }} />
          <Button title="Save quiz" onPress={async () => {
            const response = await saveQuiz();
            if (response) {
              alert("Quiz successfully saved!");
            }
          }} />
        </View>
      </View>
    );
  }

  if (pageNo === -1) {
    return (
      <View style={{ gap: 5, backgroundColor:"white" }}>
        <View style={{ height: height * 0.07 }} />
        <Text style={{fontSize:17, fontWeight:"bold"}}>Report Question: </Text>
        <Text style={{ textAlign: "left" }}>{currentReportQn} </Text>
        <TextInput
          style={{ width: '100%', borderWidth: 1, borderColor: 'green', borderRadius: 5, height: 100, textAlignVertical: "top" }}
          multiline={true}
          placeholder="Enter Text Here..."
          onChangeText={setReportstring}
          value={reportstring}
        />
        <View style={{ justifyContent: "flex-end", flexDirection: "row" }}>
          <Button title="Submit" onPress={async () => {
            const response = await reportQuestion();
            if (response) {
              alert(`Question successfully reported! Report ID: ${response}`);
              setReportstring('');
              setCurrentQ('');
              setCurrentI('');
              setPage(questions.length);
            }
          }} />
        </View>
        <View style={{ height: 10 }} />
        <View>
          <Text> Note for reports, please follow the general guidelines for what is reportable content.</Text>
        </View>
        <Button title="Go back" onPress={() => {
          setReportstring('');
          setCurrentQ('');
          setCurrentI('');
          setPage(questions.length);
        }}></Button>
      </View>
    )
  }
  else {
    return renderQuestion(questions[pageNo]);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    gap: 15,
  },
})