// import axios from 'axios';
const logout = async()=>{
    console.log('dls,dleded');
    try{    
        const res = await axios({
            method:'GET',
            url:'http://localhost:3000/api/v1/users/logout'
        });
        if(res.data.status==="success"){
            alert('Logged out successfully');
            location.assign('/');
        }
    }catch(e){
        alert('error','Error logging out please try again later');
    }
}
document.querySelector('.nav__el--logout').addEventListener('click',logout);
