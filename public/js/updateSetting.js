// import axios from 'axios';
const updateSettings=async(name,email)=>{
    const res = await axios({
        method:'PATCH',
        url:'api/v1/users/updateMe/',
        data:{
            name,
            email   
        }
    });
    if(res.data.status === "success"){
            alert('personal info updated successfully');
            window.location.assign('/');
    }else{
        alert(res.data)
    }
}


document.querySelector('.form-user-data').addEventListener('submit',(e)=>{
    console.log('dswdwsdws');
    e.preventDefault();
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    updateSettings(name,email);
})