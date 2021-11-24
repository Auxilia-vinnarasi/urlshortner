const express =require ("express")
const shortId=require ("shortid")
const createHttpError=require("http-errors")
const mongoose=require("mongoose")
const path=require("path")
const ShortUrl=require("./modals/url.model")

const app=express()

//after initializing app we have to set middleware
//these are all the middlewares to part the incoming request body

app.use(express.static(path.join(__dirname,"public")))
app.use(express.json())
app.use(express.urlencoded({extended:false}))


mongoose.connect("mongodb://localhost:27017",{
    dbName:"url-shortner",
    useNewUrlParser:true,
   // useUnifiedTopology:true,
    //useCreateIndex:true,
})
.then(()=>console.log("mongoose connected"))
.catch((error)=>console.log("Error Connecting..."))

app.set("view engine","ejs")

app.get("/",async(req,res,next)=>{
    res.render("index")
})

app.post("/",async(req,res,next)=>{
    try{
const {url}=req.body
if(!url){
    throw createHttpError.BadRequest("provide a valid url")
}
const urlExists=await ShortUrl.findOne({url})
if(urlExists)
{
//res.render("index",{short_url: `http://localhost:3000/${urlExists.shortId}`})
res.render("index",{
    short_url:`http://localhost:3000/${urlExists.shortId}`,
})
//res.render("index",{short_url: `${req.hostname}/${urlExists.shortId}`,})
//res.render("index",{short_url: `${req.headers.host}/${urlExists.shortId}`,})
return
}
const shortUrl= new ShortUrl({url:url,shortId:shortId.generate()})
const result=await shortUrl.save()
//res.render("index",{short_url:`http://localhost:3000/${result.shortId}`})
res.render("index",{
    short_url:`http://localhost:3000/${result.shortId}`,
})
//res.render("index",{short_url:`${req.hostname}/${result.shortId}`,})
//res.render("index",{short_url:`${req.headers.host}/${result.shortId}`,})
    }
    catch(error){
        next(error)
    }

})

//handling the route here, that would redirect to the actual url..

app.get("/:shortId",async(req,res,next)=>{
    try{
        const {shortId }=req.params
        const result=await ShortUrl.findOne({shortId}) 
        if(!result){
            throw createHttpError.NotFound("Short url does not exist")
        }
        res.redirect(result.url)
    }
    catch(error){
        next(error)
    }
    
})

app.use((req,res,next)=>{
    next(createHttpError.NotFound())
})

app.use((err,req,res,next)=>{
    res.status(err.status || 500)
    res.render("index",{error:err.message})
})

app.listen(3000,()=>console.log("server running on PORT 3000..."))