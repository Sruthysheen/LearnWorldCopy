import express , {Express} from "express";
// import "dotenv/config";
import dotenv from 'dotenv'
import connectDb from "../config/db";
import session, { SessionOptions,MemoryStore,SessionData } from "express-session"
import {studentRouter} from "./routes/studentRouter/studentRouter";
import {tutorRouter} from "./routes/tutorRouter/tutorRouter";
import { adminRouter } from "./routes/adminRouter/adminRouter";
import { Server,Socket } from "socket.io";
import {createAMessage} from './controller/chatController/chatController'
import http from 'http'

import cors from "cors";
import nocache from "nocache";
import path from "path";
import morgan from 'morgan'
import chatRouter from "./routes/chatRouter/chatRouter";

dotenv.config()
const app:Express = express()
const port:number = Number(process.env.PORT)
const server =http.createServer(app)

const store = new MemoryStore();
declare module 'express-session'{
    interface Session {
        otp: number | null;
        student: {
            studentname: string;
            studentemail: string;
            phone: string;
            password: string;
        }; 
        tutor: {
            tutorname: string;
            tutoremail: string;
            phone: string;
            password: string;
        };
         accessToken:string
       
    }
}

console.log(process.env.PORT,'port number in the env')
const io:Server = require('socket.io')(5001, {
    cors: { origin: "https://learnworld.online" }
  });

  let users: any = [];

  const emailToSocketIdMap = new Map();
  const socketidToEmailMap = new Map();

  io.on("connection", (socket: Socket) => {
    console.log("connection==========");
    
    console.log("USER CONNECTED", socket?.id);
    socket.on("addUser", (userId) => {
      const isUserExist = users.find((user:any) => user.userId === userId);
      console.log(isUserExist, '-----');
      
      if (isUserExist) {
          // user exists,update the socketId
          isUserExist.socketId = socket.id;
      } else {
          // user does not exist,add new user
          const user = { userId, socketId: socket.id };
          users.push(user);
      }
      
      io.to(socket.id).emit("getUsers", users);
  });
  

    socket.on(
      "sendMessage",
      async ({
        conversationId,
        senderId,
        receiverId,
        message,
        media
      }) => {

        const data={
          conversationId,
          senderId,
          receiverId,
          message,
          media
         } 
           //create  a messaage
const response=await createAMessage(data) 
if(response.status){
  const receiver = users.find((user: any) => user.userId === receiverId);
  const sender = users.find((user: any) => user.userId === senderId);
  console.log("sender :>> ", sender);
  console.log("receiver :>> ", receiver);



  if (receiver) {
   console.log('get message',response.data);
 
    io.to(receiver?.socketId)
      .to(sender?.socketId)
      .emit("receiveMessage",{data:response.data});
  } else {
    console.log(sender,'999');
    
   io.to(sender?.socketId).emit('receiveMessage',{data:response.data})
   
  }
}else{
 console.log(response.message);
 
}


        
      }
    );
  })

  

app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 60 * 60 * 1000,
    },
    store: store,
} as SessionOptions)
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "https://learnworld.online",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));

app.use(nocache());
app.use(morgan('tiny'));
connectDb.connect();

app.use('/api/student', studentRouter);
app.use('/api/tutor', tutorRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chat', chatRouter);




app.listen(port,()=>console.log(`server is ruunig at port ${port}`))