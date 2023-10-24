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

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
// ejs 기본세팅 (사용방법)

const {MongoClient, ObjectId} = require('mongodb');
app.use(express.static(__dirname + '/public')) //기본 세팅을 해줌

const bcrypt = require('bcrypt'); // yarn add bcrypt 해싱 하는 라이브러리
const MongoStore = require('connect-mongo'); //스토어를 연결하여 사용  , yarn add connect-mongo 설치


// 해싱 암오화 구조 이 순서에서 벗어나면 안됨 !
const session = require('express-session');
const passport = require('passport')
const LocalStrategy = require('passport-local')

const url =`mongodb+srv://${process.env.MONGODB_ID}:${process.env.MONGODB_PW}@cluster0.osoimbv.mongodb.net`

app.use(passport.initialize());
app.use(session({
    secret : '암호화에 쓸 비번', //세션 문서의 암호화
    resave : false, // 유저가 서버로 요청할 때마다 갱신할건지 정하는 것
    saveUninitialized: false, // 로그인 안해도 세션 만들건지 정하는 것
    cookie : {maxAge: 60 * 60 * 1000}, // 1시간 설정
    store : MongoStore.create({
        mongoUrl : url,
        dbName : "board"
    })
}))
app.use(passport.session());

let db; 
let sample;


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
    const result =  await db.collection("notice").find().skip(((req.params.id -1) * 5)).limit(5).toArray()
  
    // notice컬레션의 find 전체문서를 선택 /  findOne은 문서를 하나만 가져오겠다 

    res.render("list.ejs",{
        data : result
    })
    // 파라미터 넘기는 방법 list.ejs에 파리미터를 넘기겠다.
})
// list서버에 접속했을 때 실행 됨 -> result의 데이터의 0번이 실행되어야 하고, result는 notice의 


//페이지네이션


// 리뷰페이지 시작#############################################

app.get('/review', async (req,res)=>{
   
    const result = await db.collection("review").find().toArray()
   
    res.render('review.ejs',{
        data : result
    })
})

app.post('/add', async(req,res)=>{
   try{
    await db.collection("review").insertOne({
        title: req.body.title,
        content: req.body.content
    })
   }catch(error){
    console.log(error)
   }
   res.redirect('/review')
})

app.put('/reviewedit', async (req,res) =>{
 
    await db.collection("review").updateOne({
        _id : new ObjectId(req.body._id)
    },{
        $set : {
            title: req.body.title,
            content: req.body.content
        }
    })
    res.redirect('/review')
})

app.get('/reviewedit/:id' , async (req,res)=>{
    const result = await db.collection("review").findOne({
         _id : new ObjectId (req.params.id)
    })
    res.render('reviewedit.ejs',{
         data : result
    })
 })

 app.get('/delete/:id', async (req,res)=>{
    await db.collection("review").deleteOne({
     _id : new ObjectId (req.params.id)
 })
 res.redirect('/review')
 })

//이미지 넣어보기

//리뷰 페이지 끝#########################################################################


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
})

app.get('/write', (req,res)=>[
    res.render('write.ejs')
])

app.post('/add', async (req,res)=>{
    
    try{
    
    await db.collection("notice").insertOne({
        title: req.body.title,
        content: req.body.content
    })
    }catch(error){
        console.log(error)
    }
    // res.send("성공!")
    res.redirect('/list')
})


// 수정
app.put('/edit', async (req,res)=>{
    /* updateOne({문서},{
        $set : {원하는 값: 변경 값}
    })*/
   
    await db.collection("notice").updateOne({
        _id : new ObjectId(req.body._id)
    },{
        $set : {
            title: req.body.title,
            content: req.body.content
        }
    })
    // const result = "";
    // res.send(result)
    res.redirect('/list')
})

app.get('/edit/:id', async(req,res)=>{
    const result = await db.collection("notice").findOne({
        _id : new ObjectId (req.params.id)
    })
    res.render('edit.ejs',{
        data : result
    })
})

// 삭제
app.get('/delete/:id', async (req,res)=>{
   await db.collection("notice").deleteOne({
    _id : new ObjectId (req.params.id) // :id와 동일한 data / 서로 일치할 경우 삭제한다. 
})
res.redirect('/list')
})
// send와 redirect는 함께 사용하지 못한다.


// passport는 로그인 함수 윗쪽에 무조건 생성
passport.use(new LocalStrategy({
    usernameField : 'userid',
    passwordFiled : 'password'
},async (userid,password,cb)=>{ //cb는 도중에 실행하는 코드 / id와 password는 내가 입력한 값
    let result = await db.collection("users").findOne({
        userid : userid
    })
    if(!result){
        return cb(null, false, {message : '아이디나 비밀번호가 일치하지 않음'}) //null은 기본 값  
    }// db에 아이디 정보가 없거나, 입력한 값과 일치하지 않을 떄

    const passChk = await bcrypt.compare(password, result.password);
    console.log(passChk)

    if(passChk){
        return cb(null, result)
    }else{
        return cb(null, false, {message : '아이디나 비밀번호가 일치하지 않음'})  // false 뒤에 ,를 꼭 입력해야함
    } 
}))

//로그인 설정
passport.serializeUser((user,done)=>{
    process.nextTick(()=>{
        // done(null, 세션에 기록할 내용)
        done(null, {id: user._id, userid: user.userid})
    })
})

passport.deserializeUser(async (user,done)=>{
    let result = await db.collection("users").findOne({
        _id: new ObjectId(user.id)
    })
    delete result.password
    process.nextTick(()=>{
        done(null, result);
    })
})


//로그인 만들기
app.get('/login',(req,res)=>{
    res.render('login.ejs')
})
app.post('/login', async(req,res,next)=>{
  
    passport.authenticate('local',(error, user, info)=>{ // error, user, info 국룰로 넣어주는 변수
        //error는 (에러) , user는 (성공) 했을 경우 , info는 (실패) 했을 경우

        if(error) return res.status(500).json(error) //500에러 알아두기
        if(!user) return res.status(401).json(info.message)
        req.logIn(user,(error)=>{
            if(error) return next(error);
            res.redirect('/')           
        })
    })(req,res,next) //기본문법 
})


//회원가입
app.get('/register', (req,res)=>{
    res.render("register.ejs")
})

app.post('/register', async (req,res)=>{

    let hashPass = await bcrypt.hash(req.body.password, 10); 
    
    try{
        
    await db.collection("users").insertOne({
        userid: req.body.userid,
        password: hashPass
    })
    }catch(error){
        console.log(error)
    }   
    res.redirect('/')
})
//yarn add express-session passport passport-local



//yarn add connect-mongo 데이터베이스 연결


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

// 리액트의 경우 Mongoose를 사용하여야 한다. 