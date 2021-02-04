require('./../job/GetContact')



module.exports = function(){
    setInterval(()=>{
        console.log('ok',new Date())
    }, 1000)
}