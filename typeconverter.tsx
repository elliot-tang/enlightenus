{/*the purpose of this document is defining some code that converts between the frontend type, and backend schema*/}

export function createMCQProptoSchema (quizstmt:string,corrans:[String], wrongs: [String], noOption: number, explainText: string, authorid: string){
   const allOptions = [
      ...corrans.map((answer) => ({ option: answer, iscorrect: true })),
      ...wrongs.map((answer) => ({ option: answer})),
    ];
   return({questionBody: quizstmt, options: allOptions, author: authorid, explainText:explainText})
} // what about no.options prop??

export function createOEDProptoSchema (quizstmt:string,corrans:[String], wrongs: [String], noOption: number, explainText: string, authorid: string){
    return({questionBody: quizstmt, correctOptions:corrans, author: authorid, explainText:explainText})
 }

