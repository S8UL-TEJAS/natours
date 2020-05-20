// import axios from 'axios';
const login=async(email,password)=>{
    try{
        const res =await axios({
            method:'POST',
            url:'http://localhost:3000/api/v1/users/login',
            data:{
                email,
                password               
            }
        });
        if(res.data.status === "success"){
            setTimeout(()=>{
                window.location.assign('/');
            },1000)
        }else{
            alert('Error signing in')
        }
    }catch(err){
        console.log(err);
    }
}


document.querySelector('.form--loginn').addEventListener('submit',e=>{
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    login(email,password)
});
