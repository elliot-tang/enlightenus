import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export type ReplyProps = {
  id: string,
  author: string,
  body: string,
}

export type AttachmentProps = {
  _id?: string,
  attachmentType: string,
  attachmentName: string,
  attachmentId: AttachmentQuizProps | AttachmentQuestionProps
}

type AttachmentQuizQuestionProps = {
  _id: string,
  questionBody: string,
  options?: Array<AttachmentMCQOptionProps>,
  correctOptions?: Array<string>,
  author: string,
  dateCreated: string,
  __v: number
  questionType: string,
  questionAttempts: number,
  noOptions: number
}

type AttachmentQuizProps = {
  _id: string,
  title: string,
  topic: string,
  questions: Array<AttachmentQuizQuestionProps>,
  author: string,
  rating: number,
  timesRated: number,
  timesTaken: number,
  isVerified?: boolean,
  dateCreated: string,
  __v: number
}

type AttachmentQuestionProps = {
  _id: string,
  questionBody: string,
  options?: Array<AttachmentMCQOptionProps>,
  correctOptions?: Array<string>,
  author: string,
  dateCreated: string,
  __v: number
  questionType: string
}

type AttachmentMCQOptionProps = {
  answer: string,
  isCorrect?: boolean
  _id?: string
}

export type ForumProps = {
  id: string,
  title: string,
  topic: string,
  body: string,
  author: string,
  attached: Array<AttachmentProps>
}

export type ForumPropsDisplay = ForumProps & { goToInd: () => void};

export const ForumCard = (fprops: ForumPropsDisplay) =>{
  return(<TouchableOpacity style = {styles.touchable} onPress={fprops.goToInd}>
    <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{fprops.author}:  {fprops.title} </Text>
    <Text numberOfLines={4} ellipsizeMode="tail">
      {fprops.body}
    </Text>
    {fprops.attached.length !=0 && <Text style={{ fontWeight: '100', fontSize: 11 }}>Has Attachments </Text>}
  </TouchableOpacity>)
}

const styles = StyleSheet.create({

  touchable: {
    backgroundColor: '#cdefff',
    padding: 15,
    borderRadius: 10,
  },
});