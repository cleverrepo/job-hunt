import cron from 'cron'
import http from "http"
const scheduler=new cron.CronJob("*/14 * * * *",function(){
    http.get(process.env.API_URL,(res)=>{
        if(res.statusCode==200){
            console.log("get request sent successfully")
        }else{
            console.log("get request failed ")
        }
    }).on("error.",(err)=>console.log(err))
})
export default scheduler
