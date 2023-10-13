/*
npm init -y는  -package.json을 생성해주는 명령어 
yarn add express - 서버 구동을 위한 라이브러리
*/ 
const port = 5000;
 

/* express를 세팅하는 방법 */
const express = require('express'); // require 무엇을 불러오는 것
const app = express()
const dotenv = require('dotenv');

dotenv.config();

app.set('view engine', 'ejs');
// ejs 기본세팅 (사용방법)

const {MongoClient, ObjectId} = require('mongodb');
app.use(express.static(__dirname + '/public')) //기본 세팅을 해줌

let db; 
let sample;

const url =`mongodb+srv://${process.env.MONGODB_ID}:${process.env.MONGODB_PW}@cluster0.osoimbv.mongodb.net`

new MongoClient(url).connect().then((client)=>{
   db = client.db("board");
   sample = client.db("sample_training")
   console.log("db연결 완료!")
   app.listen(process.env.SERVER_PORT, ()=>{
    console.log(`${process.env.SERVER_PORT}번호에서 서버 실행 중`)
})
// .listen(서버를 오픈할 포트번호, function(){서버 오픈 시 실행할 코드})

}).catch((error)=>{
    console.log(error)
})

/*몽고 DB 세팅방법
1. yarn add mongodb
2. yarn add ejs - ejs의 폴더는 무조건 views로 만들어야함
*/ 


app.get('/', (req,res)=>{
    // res.send("Hello World");
    res.sendFile(__dirname + '/page/index.html')  
    // res.sendFile 은 파일을 내보낼때 쓴다. dirname은 현재 디렉토링 내의 현재 html을 출력하는 것
})
app.get('/about', (req,res)=>{
    // res.send("어바웃 페이지");
    res.sendFile(__dirname + '/page/about.html')
    // db.collection("notice").insertOne({
    //     title: "첫번째 글",
    //     content : "두번째 글"
    // })
})
app.get('/list', async (req,res)=>{
    const result =  await db.collection("notice").find().toArray()
    console.log(result[0])
    // notice컬레션의 find 전체문서를 선택 /  findOne은 문서를 하나만 가져오겠다 

    res.render("list.ejs",{
        data : result
    })
    // 파라미터 넘기는 방법 list.ejs에 파리미터를 넘기겠다.
})
// list서버에 접속했을 때 실행 됨 -> result의 데이터의 0번이 실행되어야 하고, result는 notice의 

app.get('/portfolio', (req,res)=>{
    res.send("포트폴리오 페이지 수정됐음");
})

app.get('/view/:id', async (req,res)=>{
    const result = await db.collection("notice").findOne({
        _id : new ObjectId (req.params.id)
    })
    res.render("view.ejs",{
        data : result
    })
    console.log(result)
})
/*
1. Uniform Interface
여러 URL과 Method는 일관성이 있어야 하며, 하나의 URL에서는 하나의 데이터만 가져오게 디자인하며,
간결하고 예측 가능한 URL과 Method를 만들어야한다.

tip 
1) 동사보다는 명사 위주
2) 띄어쓰기는 언더바 대신 대시 기호
3) 파일 확장자는 사용금지
4) 하위 문서를 뜻할 땐, /기호를 사용


2. 클라이언트와 서버역할 구분
유저에게 서버 역할을 맡기거나 직접 입출력을 시키면 안된다.

3.stateless
요청들은 서로 의존성이 있으면 안되고, 각각 독립적으로 처리되어야 한다.

4. Casheable
서버가 보내는 자료는 캐싱이 가능해야 한다 - 대부분 컴퓨터가 동작

5. Layered System
서버 기능을 만들 때 레이어를 걸쳐서 코드가 실행되어야 한다.(몰라도됨)

6. Code on Demeand
서버는 실행 가능한 코드를 보낼 수 있다.
*/ 


//app.get 서버를 불러오는 것
//req = request , res = response (결과값을 보내는 것)

/*yarn nodemon 서버를 일일이 껏다키지 않아도 반영되게 하는 기능*/ 
/*package.json에서  "start"에 있는 node를 nodemon로 변경 해준다 */


/* 테일윈드 세팅 방법 
1. yarn add tailwindcss autoprefixer postcss 테일윈드 설치
2. 다른 폴더에 있는 tailwind.config.js / postcss.config.js가져오기 (quiz폴더) 
3. content :"./page/*.{html, ejs ,js, ts}"* 변경
4. css폴더를 만든 후 tailwind.css 
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

5. 터미널을 추가 해준 후 npx tailwindcss -i ./page/css/tailwind.css -o ./public/index.css --watch 입력
*/


/* await 은 함수안에서만 실행 async와 await은 promise라는  오브젝트를 반환한다.
   pendending , 성공 , 에러 
   pendending은 작업중인 상태
*/ 

