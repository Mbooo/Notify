
window.onload = function(){
   
    let button_sign_in = document.getElementById("sign-in");
    if(button_sign_in){
        button_sign_in.addEventListener("click",connexion);
    }
    let button_sign_out = document.getElementById("sign-out");
    if(button_sign_out){
        button_sign_out.addEventListener("click",deconnexion);
    }

    let search_bar_form = document.getElementById("search-bar");
    if(search_bar_form){
        search_bar_form.addEventListener("submit",recherche);
    }
   
    chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
        console.log(request.message);
    });
    
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

function recherche(){
   
    let input_search = document.getElementById("input-search").value.trim();
    let values = [];
    let test;
    chrome.runtime.sendMessage({message: 'search-'+input_search}, function(response){
        test = response.message;
    });
    console.log(test);

    // for(let i = 0; i < values.artists.items.length; i++){
    //     let mark = document.createElement("h2");
    //     let text = document.createTextNode(values.artists.items[i].name);
        
    //     mark.appendChild(text);
    //     let div_result = document.getElementById("results");
    //     document.body.insertBefore(mark,div_result);
       
    // }
    
    
    
}
