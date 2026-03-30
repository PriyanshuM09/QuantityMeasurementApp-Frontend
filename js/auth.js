const loginBox = document.getElementById('login-box');
const signupBox = document.getElementById('signup-box');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');


function showLoginForm() {
    loginBox.style.display = 'block';
    signupBox.style.display = 'none';
    // this will help to switch active highlight
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
}

function showSignupForm() {
    loginBox.style.display = 'none';
    signupBox.style.display = 'block';
    // this work same for signup switch active highlight
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
}

//here we call the backend api - signup

async function handleSignupAPI(event){
    event.preventDefault(); // this will help to not load the data - unit response comes

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if(password!==confirmPassword){
        alert('password not matched!');
        return;
    }

    const signupData = {
        username : username,
        email : email,
        password : password,
        role:"USER"
    };

    const url = "http://localhost:8080/auth/user/register";

    try{
        const response = await fetch(url,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(signupData)
        });

        console.log(response)
        if(!response.ok){
            throw new Error(`HTTP errro! status: ${response.status}`);
        }

        console.log("respinse is there")
        const result = await response.json();
        console.log('signup sucess: ', result);
        alert('signup done');

        localStorage.setItem("token", result.token); // Save the token        
        window.location.href = "../html/dashboard.html";
    }
    catch(error){
        console.error('Error during signup:', error);
        alert('Signup failed. Please try again.');
    }
}

//here we call the backend api - login

function handleLoginAPI(){
    
}

// this is the listener
document.getElementById('formSignup').addEventListener('submit', handleSignupAPI);