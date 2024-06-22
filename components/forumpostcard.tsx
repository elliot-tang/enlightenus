import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export type ReplyProps = {
  id: string,
  author: string,
  body: string,
}

export type ForumProps = {
  id: string,
  title: string,
  topic: string,
  body: string,
  author: string,
  replies: Array<ReplyProps> //to change to array of reply strings
  attached: Array<{id:string, single: boolean}>
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