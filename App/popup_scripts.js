window.onload = function(){
    let button_sign_in = document.getElementById("sign-in");
    if(button_sign_in){
        button_sign_in.addEventListener("click",connexion);
    }
    let button_sign_out = document.getElementById("sign-out");
    if(button_sign_out){
        button_sign_out.addEventListener("click",deconnexion);
    }
    
}

function connexion(){
    chrome.runtime.sendMessage({message: 'login'}, function(response){
        if(response.message === 'success') window.close();
    });
}

function deconnexion(){
    chrome.runtime.sendMessage({message: 'logout'}, function(response){
        if(response.message === 'success') window.close();
    });
}