import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export type ReplyProps = {
  id: string,
  author: string,
  body: string
}

export type ForumProps = {
  id: string,
  title: string,
  topic: string,
  body: string,
  votes: number,
  author: string,
  replies: Array<ReplyProps>
}

export type ForumPropsDisplay = ForumProps & { goToInd: () => void };

export const ForumCard = (fprops: ForumPropsDisplay) =>{
  return(<TouchableOpacity style = {styles.touchable} onPress={fprops.goToInd}>
    <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{fprops.author}:  {fprops.title} </Text>
    <Text numberOfLines={4} ellipsizeMode="tail">
      {fprops.body}
    </Text>
  </TouchableOpacity>)
}

const styles = StyleSheet.create({

  touchable: {
    backgroundColor: '#cdefff',
    padding: 15,
    borderRadius: 10,
  },
});